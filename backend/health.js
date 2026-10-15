const { getDb, withCors } = require('./_db');

// Public liveness + readiness probe for uptime monitors (point UptimeRobot / Better Stack at /api/health).
//   200 {ok:true,...}   the service and its database answer
//   503 {ok:false,...}  the database is unreachable (monitors treat any non-2xx as DOWN)
// Deliberately returns no internal error text, hostnames or environment hints - those go to the server log only.
const STARTED = Date.now();

module.exports = async (req, res) => {
    withCors(req, res);
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const base = {
        time: new Date().toISOString(),
        uptimeSeconds: Math.round((Date.now() - STARTED) / 1000),
        revision: process.env.K_REVISION || process.env.GIT_SHA || 'unknown', // Cloud Run sets K_REVISION
    };
    try {
        const db = await getDb();
        await db.command({ ping: 1 });
        res.status(200).json({ ok: true, ...base, checks: { database: 'up' } });
    } catch (err) {
        console.error('health check error:', err);
        res.status(503).json({ ok: false, ...base, checks: { database: 'down' } });
    }
};
