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
 * Supports headers: x-admin-auth, x-admin-key, x-agent-key, x-vercel-cron, Authorization Bearer, or query params.
 */
function validateAgentAuth(req) {
    const adminSecret = (process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || '').trim();
    const agentSecret = (process.env.AGENT_SECRET_KEY || adminSecret).trim();
    const cronSecret = (process.env.CRON_SECRET || adminSecret).trim();
    const sheetSecret = (process.env.SHEET_SYNC_SECRET || adminSecret).trim();

    // 1. Check Vercel Cron header
    if (req.headers && req.headers['x-vercel-cron'] !== undefined) {
        return { authorized: true, role: 'cron', source: 'vercel-cron' };
    }

    // 2. Extract authorization tokens from headers
    const authHeader = req.headers ? (
        req.headers['x-admin-auth'] ||
        req.headers['x-admin-key'] ||
        req.headers['x-agent-key'] ||
        req.headers['authorization']
    ) : null;

    let providedToken = '';

    if (authHeader) {
        providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.query && (req.query.key || req.query.secret || req.query.auth || req.query.token)) {
        providedToken = (req.query.key || req.query.secret || req.query.auth || req.query.token).toString().trim();
    } else if (req.body && (req.body.secret || req.body.token || req.body.auth || req.body.apiKey)) {
        providedToken = (req.body.secret || req.body.token || req.body.auth || req.body.apiKey).toString().trim();
    }

    if (!providedToken) {
        return { authorized: false, reason: 'Missing authentication credentials in headers, query, or body.' };
    }

    // Compare against allowed secrets
    const validSecrets = [adminSecret, agentSecret, cronSecret, sheetSecret].filter(Boolean);

    if (validSecrets.length === 0) {
        // In local development or if no env set, check development fallback
        if (process.env.NODE_ENV === 'development') {
            return { authorized: true, role: 'dev', source: 'development-fallback' };
        }
        return { authorized: false, reason: 'No admin or agent secret keys configured in environment variables.' };
    }

    if (validSecrets.includes(providedToken)) {
        return { authorized: true, role: 'admin-agent', source: 'secret-token' };
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
