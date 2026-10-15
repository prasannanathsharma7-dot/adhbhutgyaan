// The shared booking service (audit F-07 / F-08): the booking form, the website chat tool and the WhatsApp bot must
// validate and store enquiries identically. In-memory database, mocked notifications - no network.
import { createRequire } from 'node:module';
import { makeDb } from './lib/fake-db.mjs';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const { createBookingEnquiry, validateBookingInput, DUPLICATE_WINDOW_MS } = require('../backend/utils/booking-service.js');
const { createBookingFromTool } = require('../backend/_assistant.js');
const mkDeps = () => { const notes = [], mails = []; return { notes, mails, deps: { notifyAdmin: async (n) => { notes.push(n); return { ok: true }; }, sendMail: async (m) => { mails.push(m); return true; } } }; };
const good = { name: 'Ravi Sharma', phone: '9876543210', email: 'ravi@example.com', serviceId: 'rudrabhishek', serviceName: 'Rudrabhishek', mode: 'online', preferredDate: '2026-11-02' };
const t0 = new Date('2026-10-15T10:00:00Z');

console.log('\n\x1b[1m[1] Validation is identical for every channel\x1b[0m');
for (const [bad, label] of [[{ ...good, phone: '12345' }, 'a too-short phone number'], [{ ...good, phone: '8454070784548989494' }, 'a 19-digit spam number'], [{ ...good, name: 'R1' }, 'a name of 2 characters / digits'], [{ ...good, email: 'not-an-email' }, 'a malformed e-mail'], [{ ...good, email: 'a@b.com,evil@x.com' }, 'an e-mail with a second recipient smuggled in'], [{ name: '', phone: '' }, 'missing name and phone']]) {
    const v = validateBookingInput(bad);
    check(v.ok === false && v.error, `refuses ${label}`);
}
check(validateBookingInput({ ...good, phone: '+44 7911 123456' }).ok, 'accepts an international number');
check(validateBookingInput({ ...good, email: '' }).ok, 'the e-mail is optional');

console.log('\n\x1b[1m[2] The AI channels no longer store junk\x1b[0m');
{
    const db = makeDb();
    const r1 = await createBookingFromTool(db, { ...good, phone: '12345' }, 'chatbot');
    check(r1.ok === false && /phone/.test(r1.error) && /re-check/.test(r1.error), 'the chat tool refuses a junk phone and tells the model to ask the visitor again');
    check(db.collection('bookings').docs.length === 0, 'nothing was stored');
    const r2 = await createBookingFromTool(db, { ...good, email: 'x y@z' }, 'whatsapp');
    check(r2.ok === false && db.collection('bookings').docs.length === 0, 'the WhatsApp bot path refuses a malformed e-mail as well');
}

console.log('\n\x1b[1m[3] Creating a booking\x1b[0m');
{
    const db = makeDb(); const { notes, mails, deps } = mkDeps();
    const r = await createBookingEnquiry(db, { ...good, status: 'confirmed', _id: 'evil', reference: 'HACK', unexpected: 'x', notes: 'n'.repeat(5000) }, { source: 'chatbot', now: t0, deps, consent: { contact: true, policyVersion: '2026-10-14' }, attribution: { utmSource: 'instagram' } });
    const doc = db.collection('bookings').docs[0];
    check(r.ok && /^AG-2026-[0-9A-F]{6}$/.test(r.reference) && r.duplicate === false, `returns a reference (${r.reference})`);
    check(doc.status === 'new' && doc._id !== 'evil' && doc.reference === r.reference && !('unexpected' in doc), 'only whitelisted fields are stored: a caller cannot set status, _id or the reference');
    check(doc.notes.length === 2000, 'long text is capped');
    check(doc.source === 'chatbot' && doc.consent.contact === true && doc.consent.policyVersion === '2026-10-14' && doc.attribution.utmSource === 'instagram', 'source, consent (with policy version) and attribution are recorded');
    check(notes.length === 1 && mails.length === 1 && mails[0].to === 'ravi@example.com' && /AG-2026/.test(mails[0].html), 'one admin notification and one confirmation e-mail with the reference');
    const dbx = makeDb(); const m2 = mkDeps();
    await createBookingEnquiry(dbx, { ...good, notes: '<img src=x onerror=alert(1)>', serviceName: '<b>x</b>', email: '' }, { now: t0, deps: m2.deps });
    check(m2.notes.length === 1 && !/<img |<b>x/.test(m2.notes[0].emailHtml) && /&lt;img/.test(m2.notes[0].emailHtml) && m2.mails.length === 0, 'HTML in notes / service name is escaped in the team notification; no confirmation e-mail without an address');
    check(validateBookingInput({ ...good, name: '<script>alert(1)</script>' }).ok === false, 'a name containing markup is refused outright');
}

console.log('\n\x1b[1m[4] The same enquiry twice is one booking\x1b[0m');
{
    const db = makeDb(); const { notes, deps } = mkDeps();
    const a = await createBookingEnquiry(db, good, { now: t0, deps });
    const b = await createBookingEnquiry(db, { ...good, phone: '+91 98765 43210' }, { now: new Date(t0.getTime() + 60000), deps });
    check(b.ok && b.duplicate === true && b.reference === a.reference && db.collection('bookings').docs.length === 1 && notes.length === 1, 'repeating it a minute later (even written +91 ...) returns the existing booking: one record, one notification');
    const c = await createBookingEnquiry(db, { ...good, serviceId: 'kalsarp-dosh', serviceName: 'Kalsarp' }, { now: new Date(t0.getTime() + 120000), deps });
    check(c.duplicate === false && db.collection('bookings').docs.length === 2, 'a different service by the same person is a new booking');
    const d = await createBookingEnquiry(db, good, { now: new Date(t0.getTime() + DUPLICATE_WINDOW_MS + 60000), deps });
    check(d.duplicate === false && db.collection('bookings').docs.length === 3, 'after 15 minutes the same request counts as new');
}

console.log(`\n\x1b[1mBOOKING SERVICE TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
