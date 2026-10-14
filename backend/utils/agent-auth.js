// Shared Agent Authentication & Security Validator: api/utils/agent-auth.js
// Validates admin credentials, webhook secrets, cron tokens, and agent signatures.

/**
 * Validates request authorization against configured environment secrets:
 * - process.env.ADMIN_SECRET_KEY
 * - process.env.ADMIN_KEY
 * - process.env.AGENT_SECRET_KEY
 * - process.env.CRON_SECRET
 * - process.env.SHEET_SYNC_SECRET
 *
 * Supports headers: x-admin-auth, x-admin-key, x-agent-key,
 * Authorization Bearer, or request-body credentials for trusted webhooks.
 */
function safeEqual(a, b) {
    // Constant-time string comparison (no early exit on the first wrong byte).
    const ba = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    if (ba.length !== bb.length) return false;
    return require('crypto').timingSafeEqual(ba, bb);
}

function validateAgentAuth(req) {
    const adminSecret = (process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || '').trim();
    const agentSecret = (process.env.AGENT_SECRET_KEY || adminSecret).trim();
    const cronSecret = (process.env.CRON_SECRET || adminSecret).trim();
    const sheetSecret = (process.env.SHEET_SYNC_SECRET || adminSecret).trim();

    // SECURITY: the mere presence of an `x-vercel-cron` header is NOT proof of
    // anything - any client can add that header to a request. It used to grant
    // the "cron" role unconditionally. Scheduled jobs must now prove themselves
    // with a secret like everything else: Vercel Cron automatically sends
    // `Authorization: Bearer <CRON_SECRET>` when a CRON_SECRET env var is set on
    // the Vercel project (set the SAME value on the Cloud Run backend).

    // Extract authorization token from headers (or the request body for trusted webhooks).
    const authHeader = req.headers ? (
        req.headers['x-admin-auth'] ||
        req.headers['x-admin-key'] ||
        req.headers['x-agent-key'] ||
        req.headers['authorization']
    ) : null;

    let providedToken = '';

    if (authHeader) {
        providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.body && (req.body.secret || req.body.token || req.body.auth || req.body.apiKey)) {
        providedToken = (req.body.secret || req.body.token || req.body.auth || req.body.apiKey).toString().trim();
    }

    if (!providedToken) {
        return { authorized: false, reason: 'Missing authentication credentials in headers or body.' };
    }

    // Ordered most-privileged first; the role reported is the first secret that matches.
    const roles = [
        ['admin', adminSecret],
        ['agent', agentSecret],
        ['cron', cronSecret],
        ['sheet-sync', sheetSecret],
    ].filter(([, secret]) => secret);

    if (roles.length === 0) {
        // Only for local development when no secrets are configured at all.
        if (process.env.NODE_ENV === 'development') {
            return { authorized: true, role: 'dev', source: 'development-fallback' };
        }
        return { authorized: false, reason: 'No admin or agent secret keys configured in environment variables.' };
    }

    for (const [role, secret] of roles) {
        if (safeEqual(providedToken, secret)) {
            return { authorized: true, role, source: 'secret-token' };
        }
    }

    return { authorized: false, reason: 'Invalid or mismatched secret key.' };
}

/**
 * Express/Vercel Middleware-style guard.
 * Returns true if authorized. Sends 401 response and returns false if unauthorized.
 */
function requireAgentAuth(req, res) {
    const check = validateAgentAuth(req);
    if (!check.authorized) {
        res.status(401).json({
            ok: false,
            error: 'Unauthorized: Access denied to Agent Automation Suite.',
            details: check.reason,
        });
        return false;
    }
    return true;
}

module.exports = {
    validateAgentAuth,
    requireAgentAuth,
};
