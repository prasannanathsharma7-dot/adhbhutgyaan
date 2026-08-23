const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, checkRateLimit } = require('./_db');

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
