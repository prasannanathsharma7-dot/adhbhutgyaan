const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml, checkRateLimit } = require('./_db');
const { sendMail } = require('./_email');
const { notifyAdmin } = require('./_notify');

function isAdmin(req) {
    const providedKey = req.headers['x-admin-key'] || req.query.key;
    return Boolean(process.env.ADMIN_KEY) && providedKey === process.env.ADMIN_KEY;
}

const VALID_STATUSES = ['new', 'contacted', 'resolved'];

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const db = await getDb();

            const allowed = await checkRateLimit(db, req, 'contact', { limit: 5, windowMs: 10 * 60 * 1000 });
            if (!allowed) {
                res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
                return;
            }

            const body = req.body || {};
            const name = capStr(body.name, 100);
            const phone = capStr(body.phone, 30);
            const message = capStr(body.message, 3000);

            if (!name || !phone || !message) {
                res.status(400).json({ ok: false, error: 'name, phone and message are required' });
                return;
            }

            const doc = {
                name,
                phone,
                email: capStr(body.email, 200),
                subject: capStr(body.subject, 200),
                message,
                status: 'new',
                source: 'website',
                createdAt: new Date(),
            };
            const result = await db.collection('messages').insertOne(doc);

            // Fire-and-forget: notifications never block or fail the response.
            notifyAdmin({
                emailSubject: `✉️ New Contact Message - ${doc.name}`,
                emailHtml: `
                    <h2>New Contact Form Message</h2>
                    <p><b>Name:</b> ${escapeHtml(doc.name)}</p>
                    <p><b>Phone:</b> ${escapeHtml(doc.phone)}</p>
                    ${doc.email ? `<p><b>Email:</b> ${escapeHtml(doc.email)}</p>` : ''}
                    ${doc.subject ? `<p><b>Subject:</b> ${escapeHtml(doc.subject)}</p>` : ''}
                    <p><b>Message:</b><br/>${escapeHtml(doc.message).replace(/\n/g, '<br/>')}</p>
                    <p style="color:#888;font-size:12px;">Message ID: ${result.insertedId}</p>
                `,
                whatsappText: `✉️ New Contact Message\n\nName: ${doc.name}\nPhone: ${doc.phone}${doc.subject ? `\nSubject: ${doc.subject}` : ''}\n\nMessage: ${doc.message}`,
            });

            if (doc.email) {
                sendMail({
                    to: doc.email,
                    subject: 'We received your message - Adhbhut Gyaan',
                    html: `
                        <h2>Namaste ${escapeHtml(doc.name)} 🙏</h2>
                        <p>Thank you for reaching out. We have received your message and will get back to you on <b>${escapeHtml(doc.phone)}</b> shortly.</p>
                        <p><b>Your message:</b><br/>${escapeHtml(doc.message).replace(/\n/g, '<br/>')}</p>
                        <p>Need an urgent response? WhatsApp us at <a href="https://wa.me/919278148269">+91 92781 48269</a>.</p>
                        <br/>
                        <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
                    `,
                });
            }

            res.status(201).json({ ok: true, id: result.insertedId });
        } catch (err) {
            console.error('contact API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    if (req.method === 'GET') {
        if (!isAdmin(req)) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }

        try {
            const db = await getDb();
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
            const items = await db.collection('messages')
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
            res.status(200).json({ ok: true, count: items.length, items });
        } catch (err) {
            console.error('contact API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    // ---- Update message status (admin only) ----
    if (req.method === 'PATCH') {
        if (!isAdmin(req)) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }

        const body = req.body || {};
        const id = (body.id || '').toString().trim();
        const status = (body.status || '').toString().trim();

        if (!id || !ObjectId.isValid(id) || !VALID_STATUSES.includes(status)) {
            res.status(400).json({ ok: false, error: `Valid id and status (${VALID_STATUSES.join('/')}) are required` });
            return;
        }

        try {
            const db = await getDb();
            const result = await db.collection('messages').updateOne(
                { _id: new ObjectId(id) },
                { $set: { status, statusUpdatedAt: new Date() } }
            );
            if (result.matchedCount === 0) {
                res.status(404).json({ ok: false, error: 'Message not found' });
                return;
            }
            res.status(200).json({ ok: true });
        } catch (err) {
            console.error('contact API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
};
