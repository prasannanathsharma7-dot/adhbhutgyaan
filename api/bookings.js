const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml, checkRateLimit } = require('./_db');
const { sendMail } = require('./_email');
const { notifyAdmin } = require('./_notify');

function isAdmin(req) {
    const providedKey = req.headers['x-admin-key'] || req.query.key;
    return Boolean(process.env.ADMIN_KEY) && providedKey === process.env.ADMIN_KEY;
}

const VALID_STATUSES = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const db = await getDb();

            const allowed = await checkRateLimit(db, req, 'bookings', { limit: 5, windowMs: 10 * 60 * 1000 });
            if (!allowed) {
                res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
                return;
            }

            const body = req.body || {};
            const name = capStr(body.name, 100);
            const phone = capStr(body.phone, 30);

            if (!name || !phone) {
                res.status(400).json({ ok: false, error: 'name and phone are required' });
                return;
            }

            const doc = {
                name,
                phone,
                email: capStr(body.email, 200),
                serviceId: capStr(body.serviceId, 100),
                serviceName: capStr(body.serviceName, 200),
                packageName: capStr(body.packageName, 200),
                mode: capStr(body.mode, 50), // online / offline / location / temple
                preferredDate: capStr(body.preferredDate, 50),
                address: capStr(body.address, 500),
                notes: capStr(body.notes, 2000),
                language: capStr(body.language, 10),
                status: 'new', // new -> contacted -> confirmed -> completed -> cancelled
                source: 'website',
                createdAt: new Date(),
            };
            const result = await db.collection('bookings').insertOne(doc);

            // Fire-and-forget: notifications never block or fail the booking response.
            notifyAdmin({
                emailSubject: `🙏 New Booking Enquiry - ${doc.name}`,
                emailHtml: `
                    <h2>New Pooja Booking Enquiry</h2>
                    <p><b>Name:</b> ${escapeHtml(doc.name)}</p>
                    <p><b>Phone:</b> ${escapeHtml(doc.phone)}</p>
                    ${doc.email ? `<p><b>Email:</b> ${escapeHtml(doc.email)}</p>` : ''}
                    <p><b>Service:</b> ${escapeHtml(doc.serviceName) || '-'}</p>
                    <p><b>Package:</b> ${escapeHtml(doc.packageName) || '-'}</p>
                    <p><b>Mode:</b> ${escapeHtml(doc.mode) || '-'}</p>
                    <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided'}</p>
                    ${doc.address ? `<p><b>Address:</b> ${escapeHtml(doc.address)}</p>` : ''}
                    ${doc.notes ? `<p><b>Notes:</b> ${escapeHtml(doc.notes)}</p>` : ''}
                    <p style="color:#888;font-size:12px;">Booking ID: ${result.insertedId}</p>
                `,
                whatsappText: `🙏 New Booking Enquiry\n\nName: ${doc.name}\nPhone: ${doc.phone}\nService: ${doc.serviceName || '-'}\nPackage: ${doc.packageName || '-'}\nMode: ${doc.mode || '-'}\nDate: ${doc.preferredDate || 'To be decided'}${doc.address ? `\nAddress: ${doc.address}` : ''}${doc.notes ? `\nNotes: ${doc.notes}` : ''}`,
            });

            if (doc.email) {
                sendMail({
                    to: doc.email,
                    subject: 'We received your booking enquiry - Adhbhut Gyaan',
                    html: `
                        <h2>Namaste ${escapeHtml(doc.name)} 🙏</h2>
                        <p>We have received your booking enquiry for <b>${escapeHtml(doc.serviceName) || 'a pooja'}</b>.</p>
                        <p>Our team will contact you on WhatsApp or phone at <b>${escapeHtml(doc.phone)}</b> within 24 hours to confirm the date, pricing, and further details.</p>
                        <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided with the Pandit'}</p>
                        <p>If you need to reach us urgently, WhatsApp us at <a href="https://wa.me/919278148269">+91 92781 48269</a>.</p>
                        <br/>
                        <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
                    `,
                });
            }

            res.status(201).json({ ok: true, id: result.insertedId });
        } catch (err) {
            console.error('bookings API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    if (req.method === 'GET') {
        // Lightweight admin protection: pass the same key set in Vercel env var ADMIN_KEY,
        // either as header 'x-admin-key' or query string '?key=...'.
        if (!isAdmin(req)) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }

        try {
            const db = await getDb();
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
            const items = await db.collection('bookings')
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
            res.status(200).json({ ok: true, count: items.length, items });
        } catch (err) {
            console.error('bookings API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    // ---- Update booking status (admin only) ----
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
            const result = await db.collection('bookings').updateOne(
                { _id: new ObjectId(id) },
                { $set: { status, statusUpdatedAt: new Date() } }
            );
            if (result.matchedCount === 0) {
                res.status(404).json({ ok: false, error: 'Booking not found' });
                return;
            }
            res.status(200).json({ ok: true });
        } catch (err) {
            console.error('bookings API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
};
