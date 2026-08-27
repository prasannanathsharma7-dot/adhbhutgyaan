const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml, checkRateLimit } = require('./_db');
const { notifyAdmin } = require('./_notify');

function isAdmin(req) {
    const providedKey = req.headers['x-admin-key'] || req.query.key;
    return Boolean(process.env.ADMIN_KEY) && providedKey === process.env.ADMIN_KEY;
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ---- Submit a new review (public) ----
    if (req.method === 'POST') {
        try {
            const db = await getDb();

            const allowed = await checkRateLimit(db, req, 'reviews', { limit: 5, windowMs: 10 * 60 * 1000 });
            if (!allowed) {
                res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
                return;
            }

            const body = req.body || {};
            const name = capStr(body.name, 100);
            const text = capStr(body.text, 1500);
            let rating = parseInt(body.rating, 10);

            if (!name || !text) {
                res.status(400).json({ ok: false, error: 'name and text are required' });
                return;
            }
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                rating = 5;
            }

            const doc = {
                name,
                phone: capStr(body.phone, 30),
                text,
                rating,
                serviceName: capStr(body.serviceName, 200),
                location: capStr(body.location, 100),
                status: 'pending', // pending -> approved | rejected
                source: 'website',
                createdAt: new Date(),
            };
            const result = await db.collection('reviews').insertOne(doc);

            await notifyAdmin({
                emailSubject: `⭐ New Review Submitted - ${doc.name} (${doc.rating}★)`,
                emailHtml: `
                    <h2>New Review Awaiting Approval</h2>
                    <p><b>Name:</b> ${escapeHtml(doc.name)}</p>
                    ${doc.phone ? `<p><b>Phone:</b> ${escapeHtml(doc.phone)}</p>` : ''}
                    <p><b>Rating:</b> ${doc.rating} / 5</p>
                    ${doc.serviceName ? `<p><b>Service:</b> ${escapeHtml(doc.serviceName)}</p>` : ''}
                    <p><b>Review:</b><br/>${escapeHtml(doc.text).replace(/\n/g, '<br/>')}</p>
                    <p style="color:#888;font-size:12px;">Log in to the admin panel to approve or reject this review.</p>
                `,
                whatsappText: `⭐ New Review Submitted (${doc.rating}★)\n\nName: ${doc.name}\n${doc.serviceName ? `Service: ${doc.serviceName}\n` : ''}\nReview: ${doc.text}\n\nApprove/reject it from the admin panel.`,
            });

            res.status(201).json({ ok: true, id: result.insertedId });
        } catch (err) {
            console.error('reviews API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again later.' });
        }
        return;
    }

    // ---- List reviews ----
    // Public (no/invalid admin key): only approved reviews, public-safe fields.
    // Admin (valid x-admin-key / ?key=): all reviews, all fields, optional ?status= filter.
    if (req.method === 'GET') {
        const admin = isAdmin(req);
        const limit = Math.min(parseInt(req.query.limit, 10) || (admin ? 50 : 6), 200);

        try {
            const db = await getDb();

            if (!admin) {
                const items = await db.collection('reviews')
                    .find({ status: 'approved' })
                    .project({ name: 1, text: 1, rating: 1, serviceName: 1, location: 1, createdAt: 1 })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .toArray();
                res.status(200).json({ ok: true, count: items.length, items });
                return;
            }

            const filter = {};
            if (['pending', 'approved', 'rejected'].includes(req.query.status)) {
                filter.status = req.query.status;
            }
            const items = await db.collection('reviews')
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
            res.status(200).json({ ok: true, count: items.length, items });
        } catch (err) {
            console.error('reviews API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again later.' });
        }
        return;
    }

    // ---- Approve / reject a review (admin only) ----
    if (req.method === 'PATCH') {
        if (!isAdmin(req)) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }

        const body = req.body || {};
        const id = (body.id || '').toString().trim();
        const status = (body.status || '').toString().trim();

        if (!id || !ObjectId.isValid(id) || !['pending', 'approved', 'rejected'].includes(status)) {
            res.status(400).json({ ok: false, error: 'Valid id and status (pending/approved/rejected) are required' });
            return;
        }

        try {
            const db = await getDb();
            const result = await db.collection('reviews').updateOne(
                { _id: new ObjectId(id) },
                { $set: { status, reviewedAt: new Date() } }
            );
            if (result.matchedCount === 0) {
                res.status(404).json({ ok: false, error: 'Review not found' });
                return;
            }
            res.status(200).json({ ok: true });
        } catch (err) {
            console.error('reviews API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again later.' });
        }
        return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
};
