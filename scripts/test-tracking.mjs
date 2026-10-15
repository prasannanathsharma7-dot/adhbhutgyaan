// The customer's booking tracker: what it shows, what it must never show, and that the reference + phone digits
// cannot be probed. In-memory database, no network.
import { createRequire } from 'node:module';
import { makeDb } from './lib/fake-db.mjs';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const { lookupBookingStatus, buildStatusView, STAGES } = require('../backend/utils/booking-status.js');
const { createBookingEnquiry } = require('../backend/utils/booking-service.js');
const noop = { notifyAdmin: async () => ({ ok: true }), sendMail: async () => true };
const t0 = new Date('2026-10-15T10:00:00Z');
const input = { name: 'Ravi Kumar Sharma', phone: '+91 98765 43210', email: 'ravi@example.com', serviceName: 'Rudrabhishek', serviceId: 'rudrabhishek', mode: 'online', preferredDate: '2 Nov', address: '12 Secret Lane, Varanasi', notes: 'please call after 6 pm' };

const db = makeDb();
const created = await createBookingEnquiry(db, input, { now: t0, deps: noop });
const ref = created.reference;
const doc = () => db.collection('bookings').docs[0];

console.log('\n\x1b[1m[1] A new booking starts at "received" and records its history\x1b[0m');
{
    check(Array.isArray(doc().statusHistory) && doc().statusHistory[0].status === 'new', 'the booking records a status history from the start');
    const r = await lookupBookingStatus(db, { reference: ref, phoneLast4: '3210' });
    check(r.ok && r.view.stages[0].done && r.view.stages.slice(1).every(s => !s.done), 'only "Enquiry received" is done');
    check(r.view.currentStage === 'received' && r.view.firstName === 'Ravi' && r.view.serviceName === 'Rudrabhishek', 'shows the first name, service and current stage');
}

console.log('\n\x1b[1m[2] The view never contains personal contact details\x1b[0m');
{
    const r = await lookupBookingStatus(db, { reference: ref.toLowerCase(), phoneLast4: '3210' });
    const raw = JSON.stringify(r.view);
    check(r.ok, 'the reference is accepted in lower case too');
    check(!/9876543210|98765|ravi@example|Secret Lane|call after|Sharma|Kumar/.test(raw), 'no phone, e-mail, address, notes or surname in the response');
    check(Object.keys(r.view).sort().join() === 'cancelled,currentStage,firstName,mode,preferredDate,reference,scheduledDate,serviceName,stages,updatedAt', 'the response has exactly the whitelisted fields');
}

console.log('\n\x1b[1m[3] Stages follow the team\'s status changes\x1b[0m');
{
    const d = doc(); const T = (h) => new Date(t0.getTime() + h * 3600000);
    d.status = 'contacted'; d.statusHistory.push({ status: 'contacted', at: T(2) }); d.statusUpdatedAt = T(2);
    let v = (await lookupBookingStatus(db, { reference: ref, phoneLast4: '3210' })).view;
    check(v.stages[1].done && !v.stages[2].done && v.currentStage === 'contacted' && v.stages[1].at, '"contacted" shows with its time');
    d.status = 'confirmed'; d.statusHistory.push({ status: 'confirmed', at: T(5) }); d.scheduledDate = '2026-11-02';
    v = (await lookupBookingStatus(db, { reference: ref, phoneLast4: '3210' })).view;
    check(v.stages[2].done && v.scheduledDate === '2026-11-02', 'confirmed, with the scheduled date');
    d.status = 'completed'; d.statusHistory.push({ status: 'completed', at: T(48) });
    v = (await lookupBookingStatus(db, { reference: ref, phoneLast4: '3210' })).view;
    check(v.stages[3].done && !v.stages[4].done && v.currentStage === 'completed', 'completed, proof not yet shared');
    d.sankalpDispatchedAt = T(49); d.sankalpMediaUrl = 'https://private.example/video.mp4';
    v = (await lookupBookingStatus(db, { reference: ref, phoneLast4: '3210' })).view;
    check(v.stages[4].done && v.currentStage === 'proof' && !JSON.stringify(v).includes('private.example'), 'proof shared - and the media link itself is never exposed');
    check(buildStatusView({ ...d, status: 'completed', statusHistory: [] }).stages.slice(0, 4).every(s => s.done), 'jumping straight to "completed" still shows the earlier stages as reached');
}
{
    const cancelled = buildStatusView({ reference: 'AG-2026-AAAAAA', name: 'Sita', status: 'cancelled', createdAt: t0, statusHistory: [{ status: 'new', at: t0 }] });
    check(cancelled.cancelled === true && cancelled.currentStage === 'cancelled', 'a cancelled booking is reported as cancelled');
}

console.log('\n\x1b[1m[4] Two factors, and no probing\x1b[0m');
{
    const wrong = await lookupBookingStatus(db, { reference: ref, phoneLast4: '9999' });
    const missing = await lookupBookingStatus(db, { reference: 'AG-2026-FFFFFF', phoneLast4: '3210' });
    check(!wrong.ok && !missing.ok && wrong.status === 404 && missing.status === 404 && wrong.error === missing.error, 'a wrong phone suffix and a non-existent reference give the identical 404 (nobody can tell which part was wrong)');
    for (const bad of [{ reference: 'hello', phoneLast4: '3210' }, { reference: ref, phoneLast4: '32' }, { reference: ref, phoneLast4: '32a0' }, {}, { reference: { $ne: '' }, phoneLast4: { $ne: '' } }]) {
        const r = await lookupBookingStatus(db, bad);
        check(!r.ok && r.status === 400, `malformed input is refused (${JSON.stringify(bad).slice(0, 48)})`);
    }
    check(STAGES.length === 5 && STAGES.every(s => s.labelEn && s.labelHi), 'every stage has an English and a Hindi label');
}

console.log('\n\x1b[1m[5] The endpoint refuses bad requests before touching the database\x1b[0m');
{
    delete process.env.MONGODB_URI; // reaching the database would surface as a 500
    const handler = require('../backend/booking-status.js');
    const mk = () => ({ statusCode: 200, body: undefined, headers: {}, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; }, setHeader(k, v) { this.headers[k.toLowerCase()] = v; } });
    let r = mk(); await handler({ method: 'GET', headers: {}, query: {} }, r);
    check(r.statusCode === 405 && r.headers.allow === 'POST', 'GET is refused (405)');
    r = mk(); await handler({ method: 'POST', headers: {}, body: { reference: 'x', phoneLast4: '1' } }, r);
    check(r.statusCode === 400, 'a malformed reference / digits is a 400, without a database call');
    check(r.headers['cache-control'] === 'no-store' && r.headers['referrer-policy'] === 'no-referrer', 'responses are no-store / no-referrer');
}

console.log(`\n\x1b[1mTRACKING TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
