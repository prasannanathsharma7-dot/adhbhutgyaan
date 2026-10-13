// Security regression tests for the P0 fixes (run via `npm test`).
// Self-contained: no database, no network.
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
const require = createRequire(import.meta.url);

let passed = 0, failed = 0;
function check(cond, name) {
    if (cond) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
    else { failed++; console.log(`  \x1b[31m✗ ${name}\x1b[0m`); }
}
function mockRes() {
    return {
        statusCode: 200, body: undefined, headers: {},
        status(c) { this.statusCode = c; return this; },
        json(b) { this.body = b; return this; },
        send(b) { this.body = b; return this; },
        end() { return this; },
        setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    };
}

// ---------- environment for the tests ----------
process.env.EXTRA_ALLOWED_ORIGINS = 'https://preview-ok.example.com';
for (const k of ['ADMIN_SECRET_KEY', 'ADMIN_KEY', 'AGENT_SECRET_KEY', 'CRON_SECRET', 'SHEET_SYNC_SECRET', 'WHATSAPP_APP_SECRET']) delete process.env[k];
process.env.NODE_ENV = 'production';

const { validateAgentAuth } = require('../backend/utils/agent-auth.js');
const { withCors, isValidPhone } = require('../backend/_db.js');
const cronReminders = require('../backend/cron-reminders.js');
const webhook = require('../backend/whatsapp-webhook.js');

console.log('\n\x1b[1m[1] Agent auth / cron header\x1b[0m');
check(validateAgentAuth({ headers: { 'x-vercel-cron': '1' } }).authorized === false, 'forged x-vercel-cron header alone is NOT authorised (no secrets configured)');
process.env.CRON_SECRET = 'cron-secret-123';
process.env.ADMIN_KEY = 'admin-secret-456';
check(validateAgentAuth({ headers: { 'x-vercel-cron': '1' } }).authorized === false, 'forged x-vercel-cron header alone is NOT authorised (secrets configured)');
check(validateAgentAuth({ headers: { authorization: 'Bearer cron-secret-123' } }).authorized === true, 'correct CRON_SECRET bearer token is authorised');
check(validateAgentAuth({ headers: { authorization: 'Bearer cron-secret-123' } }).role === 'cron', 'CRON_SECRET maps to the cron role (not admin)');
check(validateAgentAuth({ headers: { 'x-admin-key': 'admin-secret-456' } }).role === 'admin', 'ADMIN_KEY maps to the admin role');
check(validateAgentAuth({ headers: { authorization: 'Bearer wrong' } }).authorized === false, 'wrong token is rejected');
check(validateAgentAuth({ headers: { authorization: 'Bearer cron-secret-12' } }).authorized === false, 'near-miss (shorter) token is rejected');
check(validateAgentAuth({ headers: {} }).authorized === false, 'no credentials is rejected');

console.log('\n\x1b[1m[2] cron-reminders endpoint\x1b[0m');
{
    let r = mockRes(); await cronReminders({ headers: { 'x-vercel-cron': '1' }, query: {} }, r);
    check(r.statusCode === 401, 'x-vercel-cron header only -> 401');
    r = mockRes(); await cronReminders({ headers: { authorization: 'Bearer nope' }, query: {} }, r);
    check(r.statusCode === 401, 'wrong bearer -> 401');
    delete process.env.CRON_SECRET; delete process.env.ADMIN_KEY;
    r = mockRes(); await cronReminders({ headers: { 'x-vercel-cron': '1', authorization: 'Bearer x' }, query: {} }, r);
    check(r.statusCode === 401, 'no secret configured -> fails closed (401)');
}

console.log('\n\x1b[1m[3] WhatsApp webhook signature\x1b[0m');
{
    const { verifyMetaSignature } = webhook;
    const body = Buffer.from(JSON.stringify({ entry: [{ changes: [{ value: { messages: [{ from: '919999999999', type: 'text', id: 'wamid.X', text: { body: 'hi' } }] } }] }] }));
    const sign = (secret, buf) => 'sha256=' + crypto.createHmac('sha256', secret).update(buf).digest('hex');

    check(verifyMetaSignature({ headers: {}, rawBody: body }).ok === false, 'no app secret configured -> rejected (fail closed)');
    process.env.WHATSAPP_APP_SECRET = 'meta-app-secret';
    check(verifyMetaSignature({ headers: { 'x-hub-signature-256': sign('meta-app-secret', body) }, rawBody: body }).ok === true, 'valid signature accepted');
    check(verifyMetaSignature({ headers: { 'x-hub-signature-256': sign('other-secret', body) }, rawBody: body }).ok === false, 'signature made with the wrong secret rejected');
    check(verifyMetaSignature({ headers: { 'x-hub-signature-256': sign('meta-app-secret', body) }, rawBody: Buffer.concat([body, Buffer.from(' ')]) }).ok === false, 'tampered body rejected');
    check(verifyMetaSignature({ headers: {}, rawBody: body }).ok === false, 'missing header rejected');
    check(verifyMetaSignature({ headers: { 'x-hub-signature-256': 'sha256=zz' }, rawBody: body }).ok === false, 'garbage signature rejected');
    check(verifyMetaSignature({ headers: { 'x-hub-signature-256': sign('meta-app-secret', body) } }).ok === false, 'missing raw body rejected');

    // full handler: a forged POST must be rejected BEFORE any database / AI / WhatsApp work
    const r = mockRes();
    await webhook({ method: 'POST', headers: {}, body: JSON.parse(body.toString()), rawBody: body, query: {} }, r);
    check(r.statusCode === 401, 'forged POST with no signature -> 401, nothing processed');
    // GET verification handshake still works
    process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me';
    const g = mockRes();
    await webhook({ method: 'GET', headers: {}, query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': 'ABC' } }, g);
    check(g.statusCode === 200 && g.body === 'ABC', 'GET verification handshake still works');
}

console.log('\n\x1b[1m[4] CORS allow-list\x1b[0m');
{
    const run = (origin) => { const res = mockRes(); withCors({ headers: { origin } }, res); return res.headers['access-control-allow-origin']; };
    check(run('https://www.adhbhutgyaan.com') === 'https://www.adhbhutgyaan.com', 'own site is allowed');
    check(run('https://evil-site.vercel.app') !== 'https://evil-site.vercel.app', 'arbitrary *.vercel.app origin is NOT echoed back');
    check(run('https://adhbhutgyaan-evil.vercel.app') !== 'https://adhbhutgyaan-evil.vercel.app', 'look-alike prefix on vercel.app is NOT allowed');
    check(run('https://preview-ok.example.com') === 'https://preview-ok.example.com', 'origin listed in EXTRA_ALLOWED_ORIGINS is allowed');
}

console.log('\n\x1b[1m[5] Phone validation (NRI-friendly)\x1b[0m');
{
    const ok = ['9876543210', '09876543210', '+91 98765 43210', '+919876543210', '0091 9876543210', '+44 7911 123456', '+1 (415) 555-2671', '+971 50 123 4567', '009 61 4 1234 5678'.replace(/ /g, '')];
    const bad = ['', '8454070784548989494', '5123456789', '987654321', '98765432101', '+0 1234567', '+123', '+91 5123456789', 'abcdefghij', '+1234567890123456'];
    for (const n of ok) check(isValidPhone(n) === true, `accepts ${n}`);
    for (const n of bad) check(isValidPhone(n) === false, `rejects "${n}"`);
}

console.log('\n\x1b[1m[6] Frontend and backend phone validators agree\x1b[0m');
{
    const { isValidPhone: fe } = await import('../src/utils/phone.js');
    const samples = ['9876543210', '09876543210', '+91 98765 43210', '0091 9876543210', '+44 7911 123456', '+1 (415) 555-2671', '', '8454070784548989494', '5123456789', '987654321', '98765432101', '+0 1234567', '+123', '+91 5123456789', 'abc', '+1234567890123456', '00441234567890', '  +971501234567  '];
    const mismatches = samples.filter(x => fe(x) !== isValidPhone(x));
    check(mismatches.length === 0, `same verdict on ${samples.length} sample numbers${mismatches.length ? ' - MISMATCH: ' + mismatches.join(', ') : ''}`);
}

console.log(`\n\x1b[1mSECURITY TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
