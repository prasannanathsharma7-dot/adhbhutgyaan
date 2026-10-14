// B2B partner applications (travel agencies / tour operators / DMCs).
//   POST /api/b2b/partner-inquiry   public form submission
//   GET  /api/b2b/partner-inquiry   admin only - list applications
//
// An application is only a REQUEST: it is stored as status "submitted" and a human
// reviews it (submitted -> screening -> approved | rejected). Nothing here grants
// access to partner rates - those are shared manually after approval - and the
// acknowledgement text says "received", never "approved".

const { getDb, withCors, capStr, escapeHtml, checkRateLimit, isValidPhone, isValidName } = require('./_db');
const { notifyAdmin } = require('./_notify');
const { validateAgentAuth } = require('./utils/agent-auth');

const INTERESTS = ['rudrabhishek', 'shraddh_pind_daan', 'online_sankalp', 'kundli_astrology', 'group_pooja', 'other'];

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        const auth = validateAgentAuth(req);
        if (!auth.authorized) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }
        try {
            const db = await getDb();
            const limit = Math.min(parseInt(req.query && req.query.limit, 10) || 200, 1000);
            const items = await db.collection('b2b_partner_applications').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
            res.status(200).json({ ok: true, count: items.length, items });
        } catch (err) {
            console.error('b2b list error:', err);
            res.status(500).json({ ok: false, error: 'Server error.' });
        }
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    try {
        const body = req.body || {};

        // Honeypot: real visitors never see this field; bots fill it. Pretend success, store nothing.
        if (capStr(body.website, 200)) {
            res.status(200).json({ ok: true });
            return;
        }

        const db = await getDb();
        const allowed = await checkRateLimit(db, req, 'b2b-partner', { limit: 5, windowMs: 10 * 60 * 1000 });
        if (!allowed) {
            res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
            return;
        }

        const name = capStr(body.name, 100);
        const agency = capStr(body.agency, 150);
        const phone = capStr(body.phone, 30);
        const email = capStr(body.email, 200).toLowerCase();

        const errors = {};
        if (!isValidName(name)) errors.name = 'Please enter your full name';
        if (agency.length < 2) errors.agency = 'Please enter your agency / company name';
        if (!isValidPhone(phone)) errors.phone = 'Please enter a valid mobile number (with +country code if outside India)';
        if (!email || !isValidEmail(email)) errors.email = 'Please enter a valid email';
        if (body.consent !== true) errors.consent = 'Please confirm that we may contact you about this application';
        if (Object.keys(errors).length) {
            res.status(400).json({ ok: false, error: 'Please correct the highlighted fields.', fields: errors });
            return;
        }

        const interests = (Array.isArray(body.interests) ? body.interests : [])
            .map(x => capStr(x, 40)).filter(x => INTERESTS.includes(x)).slice(0, INTERESTS.length);

        // Same person re-submitting within a day (double click / refresh): succeed without a second record.
        const phoneDigits = phone.replace(/\D/g, '');
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dup = await db.collection('b2b_partner_applications').findOne({ phoneDigits, createdAt: { $gt: since } });
        if (dup) {
            res.status(200).json({ ok: true, reference: String(dup._id).slice(-6).toUpperCase(), duplicate: true });
            return;
        }

        const doc = {
            name, agency, phone, phoneDigits, email,
            city: capStr(body.city, 100),
            registrationNo: capStr(body.registrationNo, 80), // self-reported, NOT verified
            groupsPerYear: capStr(body.groupsPerYear, 40),
            interests,
            message: capStr(body.message, 1500),
            utm: capStr(body.utm, 200), // e.g. utm_source=instagram&utm_campaign=travel_partner
            consent: true,
            status: 'submitted', // submitted -> screening -> approved | rejected (set by a human)
            source: 'b2b-page',
            createdAt: new Date(),
        };
        const result = await db.collection('b2b_partner_applications').insertOne(doc);
        const reference = String(result.insertedId).slice(-6).toUpperCase();

        await notifyAdmin({
            emailSubject: `🤝 New B2B partner application - ${agency}`,
            emailHtml: `
                <h2>New B2B partner application (ref ${reference})</h2>
                <p><b>Contact:</b> ${escapeHtml(name)}</p>
                <p><b>Agency:</b> ${escapeHtml(agency)}${doc.city ? ' - ' + escapeHtml(doc.city) : ''}</p>
                <p><b>Phone:</b> ${escapeHtml(phone)} &nbsp; <b>Email:</b> ${escapeHtml(email)}</p>
                ${doc.registrationNo ? `<p><b>Registration no. (self-reported, unverified):</b> ${escapeHtml(doc.registrationNo)}</p>` : ''}
                ${doc.groupsPerYear ? `<p><b>Groups per year:</b> ${escapeHtml(doc.groupsPerYear)}</p>` : ''}
                <p><b>Interested in:</b> ${interests.length ? escapeHtml(interests.join(', ')) : '-'}</p>
                ${doc.message ? `<p><b>Message:</b><br/>${escapeHtml(doc.message).replace(/\n/g, '<br/>')}</p>` : ''}
                <p style="color:#888;font-size:12px;">Status: submitted. Review, then share partner rates manually if approved.</p>`,
            whatsappText: `🤝 New B2B partner application (ref ${reference})\n${name} - ${agency}${doc.city ? ', ' + doc.city : ''}\nPhone: ${phone}\nInterested: ${interests.join(', ') || '-'}`,
        });

        res.status(201).json({ ok: true, reference });
    } catch (err) {
        console.error('b2b partner-inquiry error:', err);
        res.status(500).json({ ok: false, error: 'Server error. Please try again or WhatsApp us.' });
    }
};
