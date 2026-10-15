// Honours a person's request to delete their data (promised in the privacy notice: "we delete them when you ask").
//
//   POST /api/admin/erase-person     admin only
//   body { phone?, email?, confirm? }
//     - without confirm === "ERASE" it is a DRY RUN: nothing is deleted, you just see how many records would go;
//     - with confirm "ERASE" the matching records are deleted from every collection that holds personal data.
//
// Matching is by normalised phone (last 10 digits, so +91 98765 43210 = 09876543210 = 9876543210) and/or e-mail
// (case-insensitive). The scale of this business makes a scan fine; each record is matched in code, then deleted by _id.
// An entry is written to `erasure_log` that holds NO personal data: only a one-way hash of the identifier, the counts
// and the time, so we can show that a request was handled. Backups age out on the database provider's schedule.
const crypto = require('crypto');
const { getDb, withCors } = require('../_db');
const { requireRole } = require('../utils/auth');

const COLLECTIONS = ['bookings', 'contacts', 'reviews', 'subscribers', 'muhurat_orders', 'whatsapp_conversations', 'kundli_requests', 'messages'];

const phoneKey = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 10 ? d.slice(-10) : d; };
const emailKey = (e) => String(e || '').trim().toLowerCase();

function buildMatcher({ phone, email }) {
    const pk = phone ? phoneKey(phone) : '';
    const ek = email ? emailKey(email) : '';
    if (pk && pk.length < 7) throw new Error('phone is too short');
    if (ek && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ek)) throw new Error('email is not valid');
    if (!pk && !ek) throw new Error('phone or email is required');
    const hit = (doc) => (pk && ['phone', 'phoneDigits', 'from'].some(f => doc[f] && phoneKey(doc[f]) === pk))
        || (ek && ['email'].some(f => doc[f] && emailKey(doc[f]) === ek));
    // queued notifications keep the booking text (with the phone number) inside the payload
    const jobHit = (job) => { const t = JSON.stringify(job.payload || {}); return (pk && t.replace(/\D/g, '').includes(pk)) || (ek && t.toLowerCase().includes(ek)); };
    return { hit, jobHit, identifier: pk ? `phone:${pk}` : `email:${ek}` };
}

/** Finds (and, unless dryRun, deletes) every record about the person. Returns counts per collection. */
async function erasePerson(db, who, { dryRun = true } = {}) {
    const { hit, jobHit, identifier } = buildMatcher(who);
    const counts = {};
    const plan = [...COLLECTIONS.map(name => ({ name, test: hit })), { name: 'notification_jobs', test: jobHit }];
    for (const { name, test } of plan) {
        const col = db.collection(name);
        const ids = (await col.find({}).toArray()).filter(test).map(d => d._id);
        counts[name] = ids.length;
        if (!dryRun && ids.length) await col.deleteMany({ _id: { $in: ids } });
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (!dryRun) {
        await db.collection('erasure_log').insertOne({ at: new Date(), identifierHash: crypto.createHash('sha256').update(identifier).digest('hex'), counts, total });
    }
    return { dryRun, counts, total };
}

module.exports = async (req, res) => {
    withCors(req, res);
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
    if (!requireRole(req, res, ['admin'])) return;
    try {
        const body = req.body || {};
        const confirmed = body.confirm === 'ERASE';
        const db = await getDb();
        const result = await erasePerson(db, { phone: body.phone, email: body.email }, { dryRun: !confirmed });
        res.status(200).json({ ok: true, ...result, note: confirmed ? 'Deleted. Backups age out on the database provider\'s schedule.' : 'DRY RUN - nothing was deleted. Repeat with "confirm": "ERASE" to delete.' });
    } catch (err) {
        if (/phone|email/.test(err.message)) { res.status(400).json({ ok: false, error: err.message }); return; }
        console.error('erase-person error:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
};
module.exports.erasePerson = erasePerson;
module.exports.phoneKey = phoneKey;
