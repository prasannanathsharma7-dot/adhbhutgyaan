// Runs weekly (see vercel.json "crons"): sends the owner the weekly digest by e-mail and WhatsApp. Cron role only.
const { getDb } = require('./_db');
const { requireRole } = require('./utils/auth');
const { notifyAdmin } = require('./_notify');
const { loadDigest, formatDigest, digestHtml } = require('./utils/weekly-digest');

module.exports = async (req, res) => {
    if (!requireRole(req, res, ['cron'])) return;
    try {
        const db = await getDb();
        const digest = await loadDigest(db);
        const sent = await notifyAdmin({ emailSubject: `Hafte ka saar - ${digest.enquiries.last7} naye enquiry`, emailHtml: digestHtml(digest), whatsappText: formatDigest(digest) });
        res.status(200).json({ ok: true, delivered: sent.ok, enquiries: digest.enquiries.last7, waiting: digest.waiting.count });
    } catch (err) {
        console.error('cron-weekly-digest error:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
};
