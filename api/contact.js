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
        const message = (body.message || '').toString().trim();

        if (!name || !phone || !message) {
            res.status(400).json({ ok: false, error: 'name, phone and message are required' });
            return;
        }

        try {
            const db = await getDb();
            const doc = {
                name,
                phone,
                email: (body.email || '').toString().trim(),
                subject: (body.subject || '').toString().trim(),
                message,
                status: 'new',
                source: 'website',
                createdAt: new Date(),
            };
            const result = await db.collection('messages').insertOne(doc);
            res.status(201).json({ ok: true, id: result.insertedId });
        } catch (err) {
            console.error('contact API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    if (req.method === 'GET') {
        const providedKey = req.headers['x-admin-key'] || req.query.key;
        if (!process.env.ADMIN_KEY || providedKey !== process.env.ADMIN_KEY) {
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

    res.status(405).json({ ok: false, error: 'Method not allowed' });
};
