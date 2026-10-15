// Tests for "delete my data on request" (backend/admin/erase-person.js) and the health probe. In-memory database,
// no network.
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { makeDb } from './lib/fake-db.mjs';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const { erasePerson, phoneKey } = require('../backend/admin/erase-person.js');

async function seed() {
    const db = makeDb();
    const put = (c, d) => db.collection(c).insertOne(d);
    // Ravi, written in different ways
    await put('bookings', { name: 'Ravi', phone: '+91 98765 43210', email: 'ravi@example.com', serviceName: 'Rudrabhishek' });
    await put('bookings', { name: 'Ravi again', phone: '9876543210', email: '' });
    await put('contacts', { name: 'Ravi', phone: '09876543210', email: 'RAVI@Example.com', message: 'hello' });
    await put('reviews', { name: 'Ravi', phone: '98765 43210', text: 'good' });
    await put('subscribers', { email: 'Ravi@example.com' });
    await put('whatsapp_conversations', { phone: '919876543210', messages: [{ role: 'user', content: 'hi' }] });
    await put('muhurat_orders', { name: 'Ravi', phone: '+919876543210' });
    await put('kundli_requests', { name: 'Ravi', phone: '9876543210' });
    await put('notification_jobs', { status: 'pending', payload: { emailSubject: 'New booking', emailHtml: '<p>Ravi (9876543210)</p>', whatsappText: 'x' } });
    // somebody else - must survive
    await put('bookings', { name: 'Sita', phone: '9123456789', email: 'sita@example.com' });
    await put('reviews', { name: 'Sita', phone: '9123456789', text: 'nice' });
    await put('subscribers', { email: 'sita@example.com' });
    await put('notification_jobs', { status: 'pending', payload: { emailHtml: '<p>Sita (9123456789)</p>' } });
    return db;
}
const count = (db, c) => db.collection(c).docs.length;

console.log('\n\x1b[1m[1] Phone numbers match however they were written\x1b[0m');
check(['+91 98765 43210', '09876543210', '9876543210', '919876543210', '98765-43210'].every(p => phoneKey(p) === '9876543210'), 'all of +91 98765 43210, 09876543210, 9876543210, 919876543210, 98765-43210 are the same person');
check(phoneKey('+44 7911 123456') === '7911123456' && phoneKey('+44 7911 123456') !== phoneKey('9876543210'), 'an international number keeps its own last 10 digits');

console.log('\n\x1b[1m[2] Dry run changes nothing\x1b[0m');
{
    const db = await seed();
    const before = ['bookings', 'contacts', 'reviews', 'subscribers', 'whatsapp_conversations', 'muhurat_orders', 'kundli_requests', 'notification_jobs'].map(c => count(db, c));
    const r = await erasePerson(db, { phone: '+91 9876543210' });
    check(r.dryRun === true && r.total === 8, `reports 8 records for Ravi's phone number - the subscriber row carries only his e-mail (found ${r.total})`);
    check(r.counts.bookings === 2 && r.counts.contacts === 1 && r.counts.reviews === 1 && r.counts.whatsapp_conversations === 1 && r.counts.notification_jobs === 1, 'counts are listed per collection');
    check(['bookings', 'contacts', 'reviews', 'subscribers', 'whatsapp_conversations', 'muhurat_orders', 'kundli_requests', 'notification_jobs'].map(c => count(db, c)).join() === before.join(), 'nothing was deleted');
    check(count(db, 'erasure_log') === 0, 'a dry run leaves no log entry');
}

console.log('\n\x1b[1m[3] Confirmed erasure removes exactly that person\x1b[0m');
{
    const db = await seed();
    const r = await erasePerson(db, { phone: '9876543210', email: 'ravi@example.com' }, { dryRun: false });
    check(r.dryRun === false && r.total === 9, `phone + e-mail together match all 9 of Ravi's records (8 by phone, plus the e-mail-only subscriber row) - deleted ${r.total}`);
    check(db.collection('bookings').docs.length === 1 && db.collection('bookings').docs[0].name === 'Sita', 'Sita\'s booking is untouched');
    check(count(db, 'reviews') === 1 && count(db, 'subscribers') === 1 && count(db, 'notification_jobs') === 1, 'Sita\'s review, subscription and queued notification survive');
    check(['whatsapp_conversations', 'muhurat_orders', 'kundli_requests', 'contacts'].every(c => count(db, c) === 0), 'the WhatsApp history, Muhurat order, Kundli request and contact message are gone');
    const log = db.collection('erasure_log').docs;
    check(log.length === 1 && log[0].total === 9, 'one audit entry records the counts');
    const raw = JSON.stringify(log);
    check(!/9876543210|ravi|example\.com/i.test(raw) && log[0].identifierHash === crypto.createHash('sha256').update('phone:9876543210').digest('hex'), 'the audit entry holds a one-way hash only - no phone, name or e-mail');
}
{
    const db = await seed();
    const r = await erasePerson(db, { email: 'RAVI@example.com' }, { dryRun: false });
    check(r.counts.bookings === 1 && r.counts.contacts === 1 && r.counts.subscribers === 1 && r.counts.reviews === 0, 'e-mail alone matches case-insensitively and only the records that carry that e-mail');
}

console.log('\n\x1b[1m[4] Bad requests are refused\x1b[0m');
{
    const db = makeDb();
    for (const [who, label] of [[{}, 'nothing given'], [{ phone: '123' }, 'a too-short phone number'], [{ email: 'not-an-email' }, 'an invalid e-mail']]) {
        let msg = ''; try { await erasePerson(db, who); } catch (e) { msg = e.message; }
        check(msg !== '', `${label} -> refused (${msg})`);
    }
}

console.log('\n\x1b[1m[5] Health probe: honest status for uptime monitors, no internal details\x1b[0m');
{
    delete process.env.MONGODB_URI;
    const health = require('../backend/health.js');
    const res = { statusCode: 200, headers: {}, body: undefined, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; }, setHeader(k, v) { this.headers[k.toLowerCase()] = v; } };
    await health({ method: 'GET', headers: {} }, res);
    check(res.statusCode === 503 && res.body.ok === false && res.body.checks.database === 'down', 'database unreachable -> 503 (a monitor sees DOWN)');
    check(!('details' in res.body) && !/MONGODB|mongodb|URI/i.test(JSON.stringify(res.body)), 'the response leaks no error text or environment hints');
    check(typeof res.body.time === 'string' && typeof res.body.uptimeSeconds === 'number' && res.body.revision, 'it reports time, uptime and the deployed revision');
    check(res.headers['cache-control'] === 'no-store', 'it is never cached');
}

console.log(`\n\x1b[1mERASURE + HEALTH TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
