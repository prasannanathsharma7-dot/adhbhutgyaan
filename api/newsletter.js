// Newsletter signup: stores emails in MongoDB and lets the admin export/use
// them later (e.g. for a blog-update mailing list). Duplicate emails are
// silently treated as success (idempotent) rather than erroring, so someone
// re-subscribing doesn't see a confusing failure.

const { getDb, withCors, capStr, checkRateLimit } = require('./_db');
const { notifyAdmin } = require('./_notify');

function isAdmin(req) {
    const providedKey = req.headers['x-admin-key'] || req.query.key;
    return Boolean(process.env.ADMIN_KEY) && providedKey === process.env.ADMIN_KEY;
}

function isValidEmail(email) {
    // Simple, deliberately permissive check - just enough to catch obvious typos.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const db = await getDb();

            const allowed = await checkRateLimit(db, req, 'newsletter', { limit: 5, windowMs: 10 * 60 * 1000 });
            if (!allowed) {
                res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
                return;
            }

            const body = req.body || {};
            const email = capStr(body.email, 200).toLowerCase();

            if (!email || !isValidEmail(email)) {
                res.status(400).json({ ok: false, error: 'A valid email is required' });
                return;
            }

            const existing = await db.collection('subscribers').findOne({ email });
            if (existing) {
                res.status(200).json({ ok: true, alreadySubscribed: true });
                return;
            }

            const doc = {
                email,
                source: 'website',
                createdAt: new Date(),
            };
            await db.collection('subscribers').insertOne(doc);

            notifyAdmin({
                emailSubject: `📧 New Newsletter Subscriber`,
                emailHtml: `<p>New subscriber: <b>${email}</b></p>`,
            });

            res.status(201).json({ ok: true });
        } catch (err) {
            console.error('newsletter API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again later.' });
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
            const limit = Math.min(parseInt(req.query.limit, 10) || 500, 2000);
            const items = await db.collection('subscribers')
                .find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
            res.status(200).json({ ok: true, count: items.length, items });
        } catch (err) {
            console.error('newsletter API error:', err);
            res.status(500).json({ ok: false, error: 'Server error.' });
        }
        return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
};
