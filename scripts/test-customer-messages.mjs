// Automatic WhatsApp updates to the customer: off by default, correct template payloads, safe phone handling, and a failure
// can never break a booking, a status change or the reminder run. No network: Meta is a stub.
import { createRequire } from 'node:module';
import { makeDb } from './lib/fake-db.mjs';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const { sendCustomerMessage, buildMessage, toWhatsAppNumber, EVENTS } = require('../backend/utils/customer-messages.js');
const { createBookingEnquiry } = require('../backend/utils/booking-service.js');
const { runReminders } = require('../backend/cron-reminders.js');
const waPayloadOf = require('../backend/_whatsapp.js');

console.log('\n\x1b[1m[1] Phone numbers become WhatsApp numbers\x1b[0m');
const cases = [['9876543210', '919876543210'], ['+91 98765 43210', '919876543210'], ['09876543210', '919876543210'], ['919876543210', '919876543210'], ['+44 7911 123456', '447911123456'], ['447911123456', '447911123456'], ['12345', null], ['', null], ['abcdefghij', null], ['1234567890', '1234567890'.length >= 11 ? '1234567890' : null]];
for (const [input, want] of cases.slice(0, 9)) check(toWhatsAppNumber(input) === want, `${JSON.stringify(input)} -> ${want}`);
check(toWhatsAppNumber('+1 (415) 555-2671') === '14155552671', 'a US number with punctuation keeps only its digits');

console.log('\n\x1b[1m[2] The template payload\x1b[0m');
{
    const doc = { name: 'Ravi Kumar Sharma', phone: '+91 98765 43210', serviceName: 'Rudrabhishek', preferredDate: 'Nov 2', language: 'hi', reference: 'AG-2026-ABC123' };
    const m = buildMessage(doc, 'received', 'AG-2026-ABC123');
    check(m.to === '919876543210' && m.template === 'booking_received' && m.languageCode === 'hi', 'received: right number, template name and the booking\'s language (Hindi)');
    check(JSON.stringify(m.params) === JSON.stringify(['Ravi', 'Rudrabhishek', 'AG-2026-ABC123']), 'received: first name only (never the surname), service, reference');
    check(buildMessage({ ...doc, language: '' }, 'received').languageCode === 'en', 'anything else defaults to English');
    check(JSON.stringify(buildMessage({ ...doc, scheduledDate: '2026-11-02' }, 'confirmed').params) === JSON.stringify(['Ravi', 'Rudrabhishek', '2026-11-02']), 'confirmed: uses the scheduled date when there is one');
    check(buildMessage(doc, 'reminder').params[2] === 'Nov 2' && buildMessage(doc, 'completed').params.length === 2, 'reminder falls back to the preferred date; completed has two parameters');
    check(Object.keys(EVENTS).sort().join() === 'completed,confirmed,received,reminder', 'four events');
    const dirty = buildMessage({ ...doc, serviceName: 'Line one\nLine   two\t\tthree', name: '\n' }, 'received');
    check(!/[\n\t]| {2,}/.test(dirty.params.join('|')) && dirty.params[0] === 'Ji', 'newlines, tabs and repeated spaces (which Meta rejects) are cleaned; an empty name becomes "Ji"');
    check(buildMessage({ ...doc, serviceName: 'x'.repeat(900) }, 'received').params[1].length === 200, 'very long values are capped');
    check(buildMessage({ ...doc, phone: '123' }, 'received') === null, 'an unusable phone number yields no message');
}

console.log('\n\x1b[1m[3] Sending: off by default, never throws\x1b[0m');
{
    const sent = []; const send = async (...a) => { sent.push(a); };
    const doc = { name: 'Ravi', phone: '9876543210', serviceName: 'Rudrabhishek' };
    check((await sendCustomerMessage(doc, 'received', { enabled: false, send })).reason === 'disabled' && sent.length === 0, 'with the flag off nothing is sent');
    delete process.env.WHATSAPP_TEMPLATES_ENABLED;
    check((await sendCustomerMessage(doc, 'received', { send })).reason === 'disabled', 'the environment flag defaults to off');
    const ok = await sendCustomerMessage(doc, 'confirmed', { enabled: true, send });
    check(ok.ok && sent.length === 1 && sent[0][0] === '919876543210' && sent[0][1] === 'booking_confirmed' && sent[0][2] === 'en', 'enabled: one template message is sent');
    check((await sendCustomerMessage({ ...doc, whatsappOptOut: true }, 'received', { enabled: true, send })).reason === 'opted out' && sent.length === 1, 'a customer who opted out gets nothing');
    check((await sendCustomerMessage({ ...doc, phone: 'x' }, 'received', { enabled: true, send })).reason === 'no valid phone number', 'no valid phone number: skipped');
    const failing = await sendCustomerMessage(doc, 'received', { enabled: true, send: async () => { throw new Error('Template not approved'); } });
    check(failing.ok === false && /not approved/.test(failing.reason), 'a Meta error is returned, not thrown');
    const t0 = Date.now();
    const slow = await sendCustomerMessage(doc, 'received', { enabled: true, timeoutMs: 30, send: () => new Promise(() => {}) });
    check(slow.reason === 'timeout' && Date.now() - t0 < 1000, 'a hung request is cut off at the timeout');
    check((await sendCustomerMessage(doc, 'nonsense', { enabled: true, send })).ok === false, 'an unknown event is refused without throwing');
}

console.log('\n\x1b[1m[4] The Cloud API request is shaped the way Meta expects\x1b[0m');
{
    process.env.WHATSAPP_PHONE_NUMBER_ID = '1234'; process.env.WHATSAPP_ACCESS_TOKEN = 'tok';
    let captured; const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => { captured = { url, init }; return { ok: true, json: async () => ({ messages: [{ id: 'wamid.X' }] }) }; };
    try {
        await waPayloadOf.sendWhatsAppTemplate('919876543210', 'booking_received', 'hi', ['Ravi', 'Rudrabhishek', 'AG-1']);
        const body = JSON.parse(captured.init.body);
        check(/\/1234\/messages$/.test(captured.url) && captured.init.headers.Authorization === 'Bearer tok', 'posted to the phone-number endpoint with the bearer token');
        check(body.messaging_product === 'whatsapp' && body.type === 'template' && body.to === '919876543210' && body.template.name === 'booking_received' && body.template.language.code === 'hi', 'type template, name and language code');
        check(JSON.stringify(body.template.components) === JSON.stringify([{ type: 'body', parameters: [{ type: 'text', text: 'Ravi' }, { type: 'text', text: 'Rudrabhishek' }, { type: 'text', text: 'AG-1' }] }]), 'body parameters are text parameters in order');
        delete process.env.WHATSAPP_ACCESS_TOKEN;
        let threw = false; try { await waPayloadOf.sendWhatsAppTemplate('1', 'x', 'en'); } catch { threw = true; }
        check(threw, 'without credentials the low-level sender throws (the wrapper turns that into "ok: false")');
    } finally { globalThis.fetch = realFetch; }
}

console.log('\n\x1b[1m[5] Wired into the booking and the reminders without side effects\x1b[0m');
{
    const notes = [], msgs = [];
    const deps = { notifyAdmin: async (n) => { notes.push(n); return { ok: true }; }, sendMail: async () => true, generateReplyDraft: async () => ({ ok: false }), sendCustomerMessage: async (d, ev, o) => { msgs.push([ev, o && o.reference, d.phone]); return { ok: true }; } };
    const db = makeDb(); const input = { name: 'Ravi Sharma', phone: '9876543210', serviceId: 'rudrabhishek', serviceName: 'Rudrabhishek' };
    const r1 = await createBookingEnquiry(db, input, { deps });
    check(msgs.length === 1 && msgs[0][0] === 'received' && msgs[0][1] === r1.reference, 'a new booking sends one "received" message carrying its reference');
    await createBookingEnquiry(db, input, { deps });
    check(msgs.length === 1, 'a duplicate enquiry (same person and service within 15 minutes) sends nothing more');
    const boom = { ...deps, sendCustomerMessage: async () => { throw new Error('boom'); } };
    const r3 = await createBookingEnquiry(makeDb(), { ...input, phone: '9123456780' }, { deps: boom });
    check(r3.ok, 'a throwing message sender cannot fail the booking');
    // reminders
    const now = new Date('2026-10-14T04:00:00Z'); const rdb = makeDb();
    await rdb.collection('bookings').insertOne({ _id: 'A', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Ravi', phone: '9876543210', serviceName: 'Rudrabhishek', reference: 'AG-2026-AAAAAA' });
    const rm = [], rn = [];
    const rdeps = { sendMail: async () => true, notifyAdmin: async (n) => { rn.push(n); return { ok: true }; }, sendCustomerMessage: async (d, ev) => { rm.push([ev, d.scheduledDate]); return { ok: true }; } };
    await Promise.all([runReminders(rdb, { now, deps: rdeps }), runReminders(rdb, { now, deps: rdeps })]);
    check(rm.length === 1 && rm[0][0] === 'reminder' && rm[0][1] === '2026-10-15', 'overlapping reminder runs send the WhatsApp reminder once, with the date');
    check(rn.length === 1 && /automatically \(.*WhatsApp/.test(rn[0].emailHtml), 'the team\'s note says the reminder reached the customer on WhatsApp too');
    const rdb2 = makeDb();
    await rdb2.collection('bookings').insertOne({ _id: 'B', status: 'confirmed', scheduledDate: '2026-10-15', name: 'Sita', phone: '9123456780', reference: 'AG-2026-BBBBBB' });
    const rn2 = [];
    await runReminders(rdb2, { now, deps: { sendMail: async () => false, notifyAdmin: async (n) => { rn2.push(n); return { ok: true }; }, sendCustomerMessage: async () => ({ ok: false, reason: 'disabled' }) } });
    check(/forward/i.test(rn2[0].whatsappText) && /EMAIL FAILED|No email/.test(rn2[0].emailHtml), 'if neither e-mail nor WhatsApp reached the customer, the team is asked to forward a reminder');
}

console.log(`\n\x1b[1mCUSTOMER MESSAGE TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
