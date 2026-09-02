// muhurat-booking.js
// Muhurat booking API: POST creates an order (computes the Muhurat report
// and stores it permanently in MongoDB), GET retrieves a stored report by
// orderId for the shareable /muhurat/report/[orderId] page.
//
// Payment is WhatsApp-mediated (matching this project's established
// pattern - see the Kundli PDF paywall built earlier): this endpoint does
// NOT process any real payment itself. It computes and stores the report,
// then the frontend shows a WhatsApp CTA for the customer to arrange
// payment, exactly like every other paid flow on this site. No payment-
// gateway credentials exist in this codebase, and none are invented here.

const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, checkRateLimit } = require('./_db');
const { findMuhurat, CATEGORY_RULES } = require('./utils/muhuratEngine');

function isAdmin(req) {
    const providedKey = req.headers['x-admin-key'] || req.query.admin_key || req.query.key;
    return Boolean(process.env.ADMIN_KEY) && providedKey === process.env.ADMIN_KEY;
}

module.exports = async (req, res) => {
    withCors(req, res);
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    try {
        const db = await getDb();
        const col = db.collection('muhurat_orders');

        if (req.method === 'POST') {
            const allowed = await checkRateLimit(db, req, 'muhurat-booking', { limit: 10, windowMs: 10 * 60 * 1000 });
            if (!allowed) return res.status(429).json({ ok: false, error: 'Too many requests - please try again in a few minutes.' });

            const { category, name, phone, monthsAhead, lat, lng, tzOffset } = req.body || {};
            if (!CATEGORY_RULES[category]) {
                return res.status(400).json({ ok: false, error: `category must be one of: ${Object.keys(CATEGORY_RULES).join(', ')}` });
            }
            if (!name || !phone) {
                return res.status(400).json({ ok: false, error: 'name and phone are required' });
            }

            const safeMonthsAhead = Math.min(Math.max(Number(monthsAhead) || 3, 1), 12);
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + safeMonthsAhead * 30 * 86400000);
            const safeLat = Number.isFinite(Number(lat)) ? Number(lat) : 25.3176;
            const safeLng = Number.isFinite(Number(lng)) ? Number(lng) : 82.9739;
            const safeTz = Number.isFinite(Number(tzOffset)) ? Number(tzOffset) : 5.5;

            const result = findMuhurat(category, startDate, endDate, safeLat, safeLng, safeTz);

            const doc = {
                category,
                name: capStr(name, 100),
                phone: capStr(phone, 20),
                monthsAhead: safeMonthsAhead,
                lat: safeLat, lng: safeLng, tzOffset: safeTz,
                matches: result.matches,
                paymentStatus: 'pending', // set to 'paid' manually by the team after WhatsApp/UPI confirmation
                createdAt: new Date(),
            };
            const inserted = await col.insertOne(doc);
            const orderId = inserted.insertedId.toString();

            return res.status(200).json({ ok: true, orderId, matchCount: result.matches.length });
        }

        if (req.method === 'GET') {
            const orderId = req.query.orderId;
            if (!orderId) return res.status(400).json({ ok: false, error: 'orderId is required' });

            let doc;
            try {
                doc = await col.findOne({ _id: new ObjectId(orderId) });
            } catch (e) {
                return res.status(400).json({ ok: false, error: 'Invalid orderId' });
            }
            if (!doc) return res.status(404).json({ ok: false, error: 'Order not found' });

            // The report is viewable by the customer regardless of payment
            // status (so they can see what they're paying for) - the admin
            // key just grants the SAME view without needing to be the
            // person who created the order, e.g. so the team can open the
            // link Pandit ji himself was sent. No extra data is unlocked
            // by admin_key beyond what the orderId link already shows.
            const isAdminView = isAdmin(req);

            return res.status(200).json({
                ok: true,
                order: {
                    orderId,
                    category: doc.category,
                    categoryLabel: CATEGORY_RULES[doc.category],
                    name: doc.name,
                    matches: doc.matches,
                    paymentStatus: doc.paymentStatus,
                    createdAt: doc.createdAt,
                },
                isAdminView,
            });
        }

        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    } catch (err) {
        console.error('Muhurat booking error:', err);
        res.status(500).json({ ok: false, error: 'Internal error', detail: err.message });
    }
};
