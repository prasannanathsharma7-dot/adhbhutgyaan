// Authorization matrix tests (audit F-02): a credential of one role must not open another role's
// endpoints. Self-contained - no database, no network. Denied requests must be refused BEFORE any
// database access (there is no MONGODB_URI here, so reaching the DB would surface as a 500).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const mockRes = () => ({ statusCode: 200, body: undefined, headers: {}, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, send(b) { this.body = b; return this; }, end() { return this; }, setHeader(k, v) { this.headers[k.toLowerCase()] = v; } });

for (const k of ['ADMIN_SECRET_KEY', 'ADMIN_KEY', 'AGENT_SECRET_KEY', 'CRON_SECRET', 'SHEET_SYNC_SECRET', 'MONGODB_URI', 'WHATSAPP_APP_SECRET']) delete process.env[k];
process.env.NODE_ENV = 'production';
const KEYS = { admin: 'admin-key-AAAA', agent: 'agent-key-BBBB', cron: 'cron-key-CCCC', 'sheet-sync': 'sheet-key-DDDD' };
process.env.ADMIN_KEY = KEYS.admin; process.env.AGENT_SECRET_KEY = KEYS.agent; process.env.CRON_SECRET = KEYS.cron; process.env.SHEET_SYNC_SECRET = KEYS['sheet-sync'];

const { authenticate, hasRole, requireRole } = require('../backend/utils/auth.js');
const { validateAgentAuth, requireAgentAuth } = require('../backend/utils/agent-auth.js');
const req = (token, extra = {}) => ({ headers: token ? { 'x-admin-key': token } : {}, query: {}, body: {}, ...extra });

console.log('\n\x1b[1m[1] Each secret maps to exactly its own role (no cross-role fallback)\x1b[0m');
for (const [role, key] of Object.entries(KEYS)) check(authenticate(req(key)).role === role, `${role} secret -> role "${role}"`);
check(authenticate(req('nope')).authenticated === false, 'unknown secret -> not authenticated');
check(authenticate(req(null)).authenticated === false, 'no credential -> not authenticated');
{
    const saved = process.env.CRON_SECRET; delete process.env.CRON_SECRET;
    check(authenticate(req(KEYS.cron)).authenticated === false, 'with CRON_SECRET unset, the old cron value no longer authenticates as anything');
    check(authenticate(req(KEYS.admin)).role === 'admin', 'an unset CRON_SECRET does NOT turn the admin key into a cron credential (still just admin)');
    process.env.CRON_SECRET = saved;
}

console.log('\n\x1b[1m[2] requireRole: 401 for bad credentials, 403 for the wrong role, admin passes everywhere\x1b[0m');
for (const [roles, label] of [[['admin'], 'admin-only'], [['agent'], 'agent'], [['cron'], 'cron'], [['sheet-sync'], 'sheet-sync']]) {
    for (const [role, key] of Object.entries(KEYS)) {
        const res = mockRes(); const ok = requireRole(req(key), res, roles);
        const shouldPass = role === 'admin' || roles.includes(role);
        check(ok === shouldPass && (shouldPass ? res.statusCode === 200 : res.statusCode === 403), `${label} route: ${role} credential -> ${shouldPass ? 'allowed' : '403'}`);
    }
    const res = mockRes(); requireRole(req(null), res, roles);
    check(res.statusCode === 401, `${label} route: no credential -> 401`);
}

console.log('\n\x1b[1m[3] Every privileged endpoint refuses lower roles (handlers, before any DB access)\x1b[0m');
const H = (p) => require(`../backend/${p}`);
const adminOnly = [
    ['bookings', 'GET'], ['bookings', 'PATCH'], ['contact', 'GET'], ['contact', 'PATCH'], ['reviews', 'PATCH'], ['newsletter', 'GET'],
    ['muhurat-booking', 'PATCH'], ['admin/dispatch-sankalp', 'POST'], ['admin/analytics-summary', 'GET']
];
for (const [file, method] of adminOnly) {
    const handler = H(file);
    for (const role of ['agent', 'cron', 'sheet-sync', null]) {
        const res = mockRes(); await handler({ ...req(role ? KEYS[role] : null), method, url: `/api/${file}` }, res);
        check([401, 403].includes(res.statusCode), `${method} /${file}: ${role || 'no credential'} -> ${res.statusCode}`);
    }
}
const agentRoutes = ['agents/kundli-preanalyzer', 'agents/whatsapp-concierge', 'agents/life-domain-synthesis', 'agents/seo-content-drafter', 'agents/system-health-agent'];
for (const file of agentRoutes) {
    for (const role of ['cron', 'sheet-sync', null]) {
        const res = mockRes(); await H(file)({ ...req(role ? KEYS[role] : null), method: 'POST', url: `/api/${file}` }, res);
        check([401, 403].includes(res.statusCode), `POST /${file}: ${role || 'no credential'} -> ${res.statusCode}`);
    }
}
{
    const res = mockRes(); await H('agents/daily-panchang-cron')({ ...req(KEYS['sheet-sync']), method: 'POST', url: '/api/agents/daily-panchang-cron' }, res);
    check(res.statusCode === 403, 'POST /agents/daily-panchang-cron: sheet-sync credential -> 403 (only agent/cron/admin)');
    for (const role of ['agent', 'sheet-sync', null]) {
        const r = mockRes(); await H('cron-reminders')({ ...req(role ? KEYS[role] : null), method: 'GET', url: '/api/cron-reminders' }, r);
        check([401, 403].includes(r.statusCode), `GET /cron-reminders: ${role || 'no credential'} -> ${r.statusCode}`);
    }
    for (const role of ['agent', 'cron', null]) {
        const r = mockRes(); await H('admin/sync-from-sheets')({ ...req(role ? KEYS[role] : null), method: 'GET', url: '/api/admin/sync-from-sheets' }, r);
        check(r.statusCode === 401, `GET /admin/sync-from-sheets: ${role || 'no credential'} -> 401`);
    }
    const t = mockRes(); await H('admin/sync-from-sheets')({ ...req(KEYS['sheet-sync']), method: 'GET', url: '/api/admin/sync-from-sheets' }, t);
    check(t.statusCode === 200, 'GET /admin/sync-from-sheets: the sync-script credential is accepted');
}

console.log('\n\x1b[1m[4] Compatibility shim + body secret only for machine callers\x1b[0m');
check(validateAgentAuth({ headers: { authorization: `Bearer ${KEYS.agent}` } }).role === 'agent', 'validateAgentAuth still reports the agent role');
check(validateAgentAuth({ headers: {}, body: { secret: KEYS.agent } }).authorized === true, 'machine caller may send the secret in the body (agents)');
check(hasRole({ headers: {}, body: { secret: KEYS.admin } }, ['admin']) === false, 'admin endpoints do NOT accept the admin secret from the request body');
check(hasRole({ headers: {}, query: { key: KEYS.admin } }, ['admin']) === false, 'admin endpoints do NOT accept the secret from the URL');
{
    const r = mockRes(); check(requireAgentAuth(req(KEYS.cron), r) === false && r.statusCode === 403, 'requireAgentAuth: a cron credential is refused with 403');
}
check(hasRole(req(`  ${KEYS.admin}  `), ['admin']) === true, 'surrounding whitespace in the pasted key is tolerated');

console.log(`\n\x1b[1mAUTHZ TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
