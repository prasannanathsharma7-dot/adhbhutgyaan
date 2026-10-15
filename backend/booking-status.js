// POST /api/booking-status  { reference, phoneLast4 }  ->  { ok, booking: <small customer-facing view> }
// Public, rate-limited, never cached. See utils/booking-status.js for what is (and is not) returned.
const { getDb, withCors, checkRateLimit } = require('./_db');
const { lookupBookingStatus, REFERENCE_RE } = require('./utils/booking-status');

module.exports = async (req, res) => {
    withCors(req, res);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
    try {
        const body = req.body || {};
        // refuse malformed input before touching the database
        if (!REFERENCE_RE.test(String(body.reference || '').trim().toUpperCase()) || !/^\d{4}$/.test(String(body.phoneLast4 || '').trim())) {
            res.status(400).json({ ok: false, error: 'Please enter the reference exactly as in your confirmation (like AG-2026-1A2B3C) and the last 4 digits of your phone number.' });
            return;
        }
        const db = await getDb();
        // 10 tries / 10 minutes per client: the last-4-digits second factor must not be brute-forceable
        const allowed = await checkRateLimit(db, req, 'booking-status', { limit: 10, windowMs: 10 * 60 * 1000 });
        if (!allowed) { res.status(429).json({ ok: false, error: 'Too many attempts. Please try again in a few minutes.' }); return; }
        const r = await lookupBookingStatus(db, body);
        if (!r.ok) { res.status(r.status).json({ ok: false, error: r.error }); return; }
        res.status(200).json({ ok: true, booking: r.view });
    } catch (err) {
        console.error('booking-status error:', err);
        res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us on WhatsApp.' });
    }
};
