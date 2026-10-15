// Role-based authorization for every privileged endpoint - the ONE place that decides who may do what.
//
// Roles and the secret that proves each (NO cross-role fallback: a missing CRON_SECRET does not
// silently mean "use the admin key", it means that role cannot authenticate at all):
//
//   admin       ADMIN_SECRET_KEY or ADMIN_KEY    the owner/staff admin panel. Superuser: passes every check.
//   agent       AGENT_SECRET_KEY                 AI/automation agents under /api/agents/*
//   cron        CRON_SECRET                      the scheduled jobs (Vercel Cron sends it as a Bearer token)
//   sheet-sync  SHEET_SYNC_SECRET                the Google-Sheets two-way sync script
//
// ROUTE -> ALLOWED ROLES (admin is implicitly allowed everywhere):
//   bookings (admin methods), contact (admin methods), reviews (admin view/moderation), newsletter (admin list),
//   muhurat-booking (admin view), admin/dispatch-sankalp, admin/analytics-summary, admin/erase-person -> admin only
//   admin/sync-from-sheets                                                                                     -> sheet-sync
//   agents/daily-panchang-cron                                                                                 -> agent, cron
//   agents/{kundli-preanalyzer, whatsapp-concierge, life-domain-synthesis, seo-content-drafter, system-health} -> agent
//   cron-reminders, cron-weekly-digest                                                                         -> cron
//
// HTTP semantics: no/invalid credentials -> 401; valid credentials of a role that is not allowed here -> 403.
// Webhook signatures (Meta) are verified separately and never use these secrets.
const crypto = require('crypto');

const ROLES = Object.freeze({ ADMIN: 'admin', AGENT: 'agent', CRON: 'cron', SHEET_SYNC: 'sheet-sync' });

function clean(v) { return (v || '').toString().trim(); }

/** The configured secrets per role, read fresh from the environment (tests change env at runtime). */
function configuredSecrets(env = process.env) {
    return [
        [ROLES.ADMIN, [clean(env.ADMIN_SECRET_KEY), clean(env.ADMIN_KEY)].filter(Boolean)],
        [ROLES.AGENT, [clean(env.AGENT_SECRET_KEY)].filter(Boolean)],
        [ROLES.CRON, [clean(env.CRON_SECRET)].filter(Boolean)],
        [ROLES.SHEET_SYNC, [clean(env.SHEET_SYNC_SECRET)].filter(Boolean)],
    ];
}

function safeEqual(a, b) {
    const ba = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** Pull the presented secret from the request. The body is read only when `allowBody` (trusted machine-to-machine callers). */
function extractToken(req, { allowBody = false } = {}) {
    const h = (req && req.headers) || {};
    const header = h['x-admin-key'] || h['x-admin-auth'] || h['x-agent-key'] || h['authorization'];
    if (header) return clean(String(header).replace(/^Bearer\s+/i, ''));
    if (allowBody && req && req.body && typeof req.body === 'object') {
        return clean(req.body.secret || req.body.token || req.body.auth || req.body.apiKey);
    }
    return '';
}

/**
 * Who is calling? -> { authenticated, role, reason }.
 * Roles are checked most-privileged first; the first secret that matches names the role.
 */
function authenticate(req, opts = {}) {
    const token = extractToken(req, opts);
    const secrets = configuredSecrets();
    const anyConfigured = secrets.some(([, list]) => list.length > 0);
    if (!anyConfigured) {
        // Local development with no secrets configured at all; never in production.
        if (process.env.NODE_ENV === 'development') return { authenticated: true, role: 'dev', reason: null };
        return { authenticated: false, role: null, reason: 'no secrets configured' };
    }
    if (!token) return { authenticated: false, role: null, reason: 'missing credentials' };
    for (const [role, list] of secrets) {
        if (list.some(s => safeEqual(token, s))) return { authenticated: true, role, reason: null };
    }
    return { authenticated: false, role: null, reason: 'invalid credentials' };
}

function allowed(role, allowedRoles) {
    return role === 'dev' || role === ROLES.ADMIN || allowedRoles.includes(role);
}

/** Non-throwing boolean check, for handlers that serve both public and privileged views. */
function hasRole(req, allowedRoles, opts = {}) {
    const a = authenticate(req, opts);
    return a.authenticated && allowed(a.role, allowedRoles);
}

/**
 * Guard: returns true when the caller may proceed. Otherwise it has ALREADY sent the response
 * (401 for bad/missing credentials, 403 for a valid credential of the wrong role) and returns false.
 */
function requireRole(req, res, allowedRoles, opts = {}) {
    const a = authenticate(req, opts);
    if (!a.authenticated) {
        logDenied(req, null, a.reason);
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return false;
    }
    if (!allowed(a.role, allowedRoles)) {
        logDenied(req, a.role, `role not permitted (needs ${allowedRoles.join('/')})`);
        res.status(403).json({ ok: false, error: 'Forbidden' });
        return false;
    }
    return true;
}

// One structured line per refusal so operators can see probing in the logs. Never logs a secret or token.
function logDenied(req, role, reason) {
    try {
        console.warn(JSON.stringify({ event: 'auth_denied', path: (req && (req.originalUrl || req.url)) || '', method: req && req.method, role, reason }));
    } catch { /* logging must never break a request */ }
}

module.exports = { ROLES, authenticate, hasRole, requireRole, extractToken };
