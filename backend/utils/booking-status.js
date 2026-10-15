// What a customer may see about their own booking ("where is my pooja?"). Deliberately a SMALL view: stage names and
// times, the service and date - never the phone number, e-mail, address, notes or the full name.
const crypto = require('crypto');

const REFERENCE_RE = /^AG-\d{4}-[0-9A-F]{6}$/;
const LAST4_RE = /^\d{4}$/;

const STAGES = [
    { key: 'received', labelEn: 'Enquiry received', labelHi: 'पूछताछ प्राप्त हुई' },
    { key: 'contacted', labelEn: "Pandit ji's team has contacted you", labelHi: 'पंडित जी की टीम ने संपर्क किया' },
    { key: 'confirmed', labelEn: 'Date and details confirmed', labelHi: 'तिथि व विवरण पुष्ट हुए' },
    { key: 'completed', labelEn: 'Ritual performed', labelHi: 'अनुष्ठान सम्पन्न हुआ' },
    { key: 'proof', labelEn: 'Photo / video proof shared', labelHi: 'फोटो / वीडियो प्रमाण साझा किया गया' },
];

const digits = (p) => String(p || '').replace(/\D/g, '');
const last4Of = (phone) => digits(phone).slice(-4);
function safeEqual(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }

/** Pure: build the customer-facing view from a booking document. */
function buildStatusView(doc) {
    const history = Array.isArray(doc.statusHistory) ? doc.statusHistory : [];
    const at = (status) => { const h = [...history].reverse().find(x => x.status === status); return h ? h.at : null; };
    const cancelled = doc.status === 'cancelled';
    const reached = { received: true, contacted: false, confirmed: false, completed: false, proof: false };
    const order = ['new', 'contacted', 'confirmed', 'completed'];
    const idx = order.indexOf(doc.status);
    if (idx >= 1) reached.contacted = true;
    if (idx >= 2) reached.confirmed = true;
    if (idx >= 3) reached.completed = true;
    // an earlier state counts as reached if it was ever recorded (the team may skip straight to "confirmed")
    for (const k of ['contacted', 'confirmed', 'completed']) if (at(k)) reached[k] = true;
    reached.proof = Boolean(doc.proofSharedAt || doc.sankalpDispatchedAt || doc.sankalpMediaUrl); // the media link itself is never returned: proof reaches the customer on WhatsApp
    const times = { received: doc.createdAt, contacted: at('contacted'), confirmed: at('confirmed'), completed: at('completed'), proof: doc.sankalpDispatchedAt || doc.proofSharedAt || null };
    return {
        reference: doc.reference,
        firstName: String(doc.name || '').trim().split(/\s+/)[0] || '',
        serviceName: doc.serviceName || '',
        mode: doc.mode || '',
        preferredDate: doc.preferredDate || '',
        scheduledDate: doc.scheduledDate || '',
        cancelled,
        stages: STAGES.map(s => ({ ...s, done: !cancelled || s.key === 'received' ? reached[s.key] : reached[s.key], at: times[s.key] || null })),
        currentStage: cancelled ? 'cancelled' : (['proof', 'completed', 'confirmed', 'contacted', 'received'].find(k => reached[k])),
        updatedAt: doc.statusUpdatedAt || doc.createdAt,
    };
}

/**
 * Looks a booking up by reference AND the last 4 digits of the phone number it was made with (two factors, because a
 * reference alone is short). Returns { ok:true, view } or { ok:false, status, error } - the error is the same for
 * "no such booking" and "wrong digits" so nobody can probe which references exist.
 */
async function lookupBookingStatus(db, { reference, phoneLast4 }) {
    const ref = String(reference || '').trim().toUpperCase();
    const last4 = String(phoneLast4 || '').trim();
    if (!REFERENCE_RE.test(ref) || !LAST4_RE.test(last4)) return { ok: false, status: 400, error: 'Please enter the reference exactly as in your confirmation (like AG-2026-1A2B3C) and the last 4 digits of your phone number.' };
    const doc = await db.collection('bookings').findOne({ reference: ref });
    if (!doc || !safeEqual(last4Of(doc.phone), last4)) return { ok: false, status: 404, error: 'We could not find a booking with these details. Please check the reference and the last 4 digits of the phone number you booked with.' };
    return { ok: true, view: buildStatusView(doc) };
}

module.exports = { buildStatusView, lookupBookingStatus, STAGES, REFERENCE_RE };
