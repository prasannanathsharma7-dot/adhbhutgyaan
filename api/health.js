const { getDb, withCors } = require('./_db');

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const db = await getDb();
        await db.command({ ping: 1 });
        res.status(200).json({ ok: true, message: 'Database connected successfully.' });
    } catch (err) {
        console.error('health check error:', err);
        res.status(500).json({
            ok: false,
            error: 'Could not connect to the database. Check that MONGODB_URI is set correctly in Vercel environment variables.',
            details: err.message,
        });
    }
};
