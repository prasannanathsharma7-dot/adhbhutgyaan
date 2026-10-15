// Reliability tests: reminders (IST date, no duplicates), the notification retry queue, and crash-safe WhatsApp
// message claims. Uses a small in-memory stand-in for MongoDB - no database, no network.
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };

// ---------- in-memory MongoDB stand-in (the subset our code uses) ----------
function matches(doc, filter) {
    return Object.entries(filter).every(([k, v]) => {
        if (k === '$or') return v.some(f => matches(doc, f));
        const val = doc[k];
        if (v && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v)) {
            return Object.entries(v).every(([op, x]) => {
                if (op === '$ne') return val !== x;
                if (op === '$lt') return val !== undefined && val < x;
                if (op === '$lte') return val !== undefined && val <= x;
                if (op === '$in') return x.includes(val);
                throw new Error('unsupported operator ' + op);
            });
        }
        return val === v;
    });
}
function makeCol() {
    const docs = []; let seq = 0;
    const col = {
        docs,
        async insertOne(d) {
            if (d.messageId !== undefined && docs.some(x => x.messageId === d.messageId)) { const e = new Error('E11000 duplicate key'); e.code = 11000; throw e; }
            const doc = { _id: d._id ?? `id${++seq}`, ...d }; docs.push(doc); return { insertedId: doc._id };
        },
        async findOne(f) { return docs.find(d => matches(d, f)) || null; },
        find(f) { return { toArray: async () => docs.filter(d => matches(d, f)).map(d => d) }; },
        async updateOne(f, u) {
            const d = docs.find(x => matches(x, f)); if (!d) return { matchedCount: 0, modifiedCount: 0 };
            for (const [k, v] of Object.entries(u.$set || {})) d[k] = v;
            for (const [k, v] of Object.entries(u.$inc || {})) d[k] = (d[k] || 0) + v;
            for (const k of Object.keys(u.$unset || {})) delete d[k];
            return { matchedCount: 1, modifiedCount: 1 };
        },
        async createIndex() {},
    };
    return col;
}
const makeDb = () => { const m = new Map(); return { collection: n => { if (!m.has(n)) m.set(n, makeCol()); return m.get(n); } }; };

const { istTomorrow, runReminders } = require('../backend/cron-reminders.js');
const { createNotifier, MAX_ATTEMPTS } = require('../backend/_notify.js');
const { claimInbound, markSending, markReplied, releaseInbound, LEASE_MS } = require('../backend/utils/inbound-claims.js');

console.log('\n\x1b[1m[1] "Tomorrow" is a calendar day in India\x1b[0m');
check(istTomorrow(new Date('2026-10-14T04:00:00Z')) === '2026-10-15', '04:00 UTC (09:30 IST, the cron time) on 14 Oct -> 2026-10-15');
check(istTomorrow(new Date('2026-10-14T18:29:00Z')) === '2026-10-15', '23:59 IST on 14 Oct -> still 2026-10-15');
check(istTomorrow(new Date('2026-10-14T18:31:00Z')) === '2026-10-16', '00:01 IST on 15 Oct (still 14 Oct in UTC) -> 2026-10-16, not 15 Oct');
check(istTomorrow(new Date('2026-12-31T20:00:00Z')) === '2027-01-02', 'year boundary: 01:30 IST on 1 Jan -> 2 Jan 2027');

console.log('\n\x1b[1m[2] Reminders: exactly one per booking, even when two runs overlap\x1b[0m');
{
    const now = new Date('2026-10-14T04:00:00Z');
    const db = makeDb(); const b = db.collection('bookings');
    await b.insertOne({ _id: 'A', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Ravi', phone: '9876543210', email: 'ravi@example.com', serviceName: 'Rudrabhishek' });
    await b.insertOne({ _id: 'B', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Sita', phone: '9876543211' });
    await b.insertOne({ _id: 'C', status: 'confirmed', scheduledDate: '2026-10-16', name: 'Other day', phone: '1', email: 'c@x.com' });
    await b.insertOne({ _id: 'D', status: 'new', scheduledDate: '2026-10-15', name: 'Unconfirmed', phone: '2', email: 'd@x.com' });
    await b.insertOne({ _id: 'E', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Done', phone: '3', email: 'e@x.com', reminderSent: true });
    const mails = [], notes = [];
    const deps = { sendMail: async (m) => { mails.push(m.to); return true; }, notifyAdmin: async (n) => { notes.push(n); return { ok: true }; } };
    const [r1, r2] = await Promise.all([runReminders(db, { now, deps }), runReminders(db, { now, deps })]);
    check(mails.filter(x => x === 'ravi@example.com').length === 1, 'two overlapping runs email the customer exactly once');
    check(r1.remindersSent + r2.remindersSent === 2 && r1.skipped + r2.skipped >= 2, 'A and B reminded once each; the losing run skipped them');
    check(notes.length === 2, 'the team is notified once per booking (2), including the one with no e-mail');
    check(!mails.includes('c@x.com') && !mails.includes('d@x.com') && !mails.includes('e@x.com'), 'other-day, unconfirmed and already-reminded bookings are untouched');
    const r3 = await runReminders(db, { now, deps });
    check(r3.remindersSent === 0 && mails.length === 1, 'a third run sends nothing more');
    check(b.docs.find(d => d._id === 'A').reminderSent === true && b.docs.find(d => d._id === 'A').reminderEmailOk === true, 'the booking records that the e-mail went out');
}
{
    const now = new Date('2026-10-14T04:00:00Z');
    const db = makeDb(); await db.collection('bookings').insertOne({ _id: 'A', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Ravi', phone: '98', email: 'ravi@example.com' });
    const notes = [];
    const r = await runReminders(db, { now, deps: { sendMail: async () => false, notifyAdmin: async (n) => { notes.push(n); return { ok: true }; } } });
    check(r.remindersSent === 1 && /EMAIL FAILED/.test(notes[0].emailHtml) && /forward/i.test(notes[0].whatsappText), 'a failed customer e-mail is reported to the team with a ready-to-forward message');
    const db2 = makeDb(); await db2.collection('bookings').insertOne({ _id: 'A', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Ravi', phone: '98', email: 'r@x.com' });
    const r2 = await runReminders(db2, { now, deps: { sendMail: async () => true, notifyAdmin: async () => { throw new Error('boom'); } } });
    check(r2.failed === 1 && db2.collection('bookings').docs[0].reminderSent === false, 'if sending throws, the claim is released so the booking is retried next run');
}

console.log('\n\x1b[1m[3] Notification queue: failures are kept and retried, not lost\x1b[0m');
{
    const mk = (mailOk, waOk, db) => createNotifier({ sendMailFn: async () => mailOk, sendWhatsAppFn: async () => waOk, getDbFn: async () => db });
    const payload = { emailSubject: 'New booking', emailHtml: '<p>x</p>', whatsappText: 'x' };
    const db = makeDb();
    const both = await mk(false, false, db).notifyAdmin(payload);
    check(both.ok === false && both.queued === true && db.collection('notification_jobs').docs.length === 1, 'both channels failing -> the message is queued, not lost');
    const one = await mk(true, false, db).notifyAdmin(payload);
    check(one.ok === true && one.queued === false && db.collection('notification_jobs').docs.length === 1, 'one channel reaching the team is enough (nothing queued)');
    const ok = createNotifier({ sendMailFn: async () => true, sendWhatsAppFn: async () => true, getDbFn: async () => db });
    const done = await ok.retryPendingNotifications(db);
    check(done.sent === 1 && db.collection('notification_jobs').docs[0].status === 'sent', 'the retry delivers the queued notification');
    const db2 = makeDb(); const failing = mk(false, false, db2); await failing.notifyAdmin(payload);
    let last; for (let i = 0; i < MAX_ATTEMPTS; i++) last = await failing.retryPendingNotifications(db2);
    check(db2.collection('notification_jobs').docs[0].status === 'dead' && last.tried <= 1, `after ${MAX_ATTEMPTS} attempts the job becomes "dead" (visible, not retried forever)`);
    const db3 = makeDb(); await mk(false, false, db3).notifyAdmin(payload);
    let sends = 0; const counting = createNotifier({ sendMailFn: async () => { sends++; return true; }, sendWhatsAppFn: async () => false, getDbFn: async () => db3 });
    await Promise.all([counting.retryPendingNotifications(db3), counting.retryPendingNotifications(db3)]);
    check(sends === 1, 'two workers retrying at once send the job once (atomic claim)');
    const db4 = makeDb(); await db4.collection('notification_jobs').insertOne({ status: 'sending', claimedAt: new Date(), attempts: 1, payload });
    check((await counting.retryPendingNotifications(db4)).tried === 0, 'a job another worker claimed a moment ago is left alone');
    await db4.collection('notification_jobs').insertOne({ status: 'sending', claimedAt: new Date(Date.now() - 3600 * 1000), attempts: 1, payload });
    check((await counting.retryPendingNotifications(db4)).sent === 1, 'a job whose worker died (stale claim) is picked up again');
}

console.log('\n\x1b[1m[4] WhatsApp inbound: a crashed worker no longer loses the message\x1b[0m');
{
    const col = makeCol(); const t0 = new Date('2026-10-14T10:00:00Z'); const later = (ms) => new Date(t0.getTime() + ms);
    check(await claimInbound(col, 'm1', t0) === 'process', 'first delivery is processed');
    check(await claimInbound(col, 'm1', later(1000)) === 'in-progress', 'a duplicate while the lease is live -> in-progress (handler answers 503 so Meta retries later)');
    check(await claimInbound(col, 'm1', later(LEASE_MS + 1000)) === 'process' && col.docs[0].attempts === 2, 'the worker crashed (lease expired): the next delivery takes over');
    await markSending(col, 'm1');
    check(await claimInbound(col, 'm1', later(10 * LEASE_MS)) === 'done', 'once the reply is being sent, a retry never replies twice');
    await markReplied(col, 'm1');
    check(await claimInbound(col, 'm1', later(11 * LEASE_MS)) === 'done', 'replied -> any further delivery is ignored');
    await claimInbound(col, 'm2', t0); await releaseInbound(col, 'm2');
    check(await claimInbound(col, 'm2', later(5)) === 'process', 'a failure before sending releases the message for the next delivery');
    const col2 = makeCol(); await claimInbound(col2, 'm3', t0);
    const outcomes = await Promise.all([claimInbound(col2, 'm3', later(LEASE_MS + 1)), claimInbound(col2, 'm3', later(LEASE_MS + 1))]);
    check(outcomes.filter(o => o === 'process').length === 1, 'two simultaneous takeovers of a stale message: exactly one wins');
}

console.log('\n\x1b[1m[5] Webhook answers 503 (retry) - never a silent 200 - when it is misconfigured\x1b[0m');
{
    for (const k of ['WHATSAPP_APP_SECRET', 'ANTHROPIC_API_KEY', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'MONGODB_URI']) delete process.env[k];
    const webhook = require('../backend/whatsapp-webhook.js');
    const mkRes = () => ({ statusCode: 200, status(c) { this.statusCode = c; return this; }, send() { return this; }, json() { return this; }, end() { return this; } });
    const body = { entry: [{ changes: [{ value: { messages: [{ from: '919999999999', type: 'text', id: 'wamid.T', text: { body: 'hi' } }] } }] }] };
    const raw = Buffer.from(JSON.stringify(body));
    let r = mkRes(); await webhook({ method: 'POST', headers: {}, body, rawBody: raw, query: {} }, r);
    check(r.statusCode === 503, 'no WHATSAPP_APP_SECRET -> 503 (our configuration problem), not 401 or 200');
    process.env.WHATSAPP_APP_SECRET = 'app-secret';
    const sig = 'sha256=' + crypto.createHmac('sha256', 'app-secret').update(raw).digest('hex');
    r = mkRes(); await webhook({ method: 'POST', headers: { 'x-hub-signature-256': sig }, body, rawBody: raw, query: {} }, r);
    check(r.statusCode === 503, 'valid signature but the bot keys are missing -> 503, so Meta retries instead of the message being dropped');
    r = mkRes(); await webhook({ method: 'POST', headers: { 'x-hub-signature-256': 'sha256=00' }, body, rawBody: raw, query: {} }, r);
    check(r.statusCode === 401, 'a wrong signature is still 401');
}

console.log(`\n\x1b[1mOPS TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
