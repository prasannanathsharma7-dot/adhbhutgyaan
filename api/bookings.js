const { getDb, withCors } = require('./_db');

module.exports = async (req, res) => {
    withCors(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const body = req.body || {};
        const name = (body.name || '').toString().trim();
        const phone = (body.phone || '').toString().trim();

        if (!name || !phone) {
            res.status(400).json({ ok: false, error: 'name and phone are required' });
            return;
        }

        try {
            const db = await getDb();
            const doc = {
                name,
                phone,
                serviceId: (body.serviceId || '').toString().trim(),
                serviceName: (body.serviceName || '').toString().trim(),
                packageName: (body.packageName || '').toString().trim(),
                mode: (body.mode || '').toString().trim(), // online / offline / location / temple
                preferredDate: (body.preferredDate || '').toString().trim(),
                address: (body.address || '').toString().trim(),
                notes: (body.notes || '').toString().trim(),
                language: (body.language || '').toString().trim(),
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
        const providedKey = req.headers['x-admin-key'] || req.query.key;
        if (!process.env.ADMIN_KEY || providedKey !== process.env.ADMIN_KEY) {
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

    res.status(405).json({ ok: false, error: 'Method not allowed' });
};
