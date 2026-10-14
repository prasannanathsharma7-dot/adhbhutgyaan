// Compatibility shim. Authorization now lives in ./auth.js (role-based, with an explicit route -> role
// matrix documented there). These two functions keep their old names for any external caller/test:
//   validateAgentAuth(req) -> { authorized, role, reason }   (machine callers may also send the secret in the body)
//   requireAgentAuth(req,res) -> true | (sends 401/403, false)   allows the 'agent' role (and admin)
const { authenticate, requireRole, ROLES } = require('./auth');

function validateAgentAuth(req) {
    const a = authenticate(req, { allowBody: true });
    return a.authenticated
        ? { authorized: true, role: a.role, source: 'secret-token' }
        : { authorized: false, reason: a.reason === 'missing credentials'
            ? 'Missing authentication credentials in headers or body.'
            : (a.reason === 'no secrets configured' ? 'No admin or agent secret keys configured in environment variables.' : 'Invalid or mismatched secret key.') };
}

function requireAgentAuth(req, res) {
    return requireRole(req, res, [ROLES.AGENT], { allowBody: true });
}

module.exports = { validateAgentAuth, requireAgentAuth };
