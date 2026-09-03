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
const { getDb, withCors, capStr, checkRateLimit, isValidIndianPhone, isValidName } = require('./_db');
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
            if (!isValidIndianPhone(phone)) {
                return res.status(400).json({ ok: false, error: 'phone must be a valid 10-digit Indian mobile number' });
            }
            if (!isValidName(name)) {
                return res.status(400).json({ ok: false, error: 'name must be at least 3 alphabetic characters' });
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

            // List-mode: no orderId given, but a valid admin key is present -
            // returns all orders for the /admin dashboard's Muhurat tab, in
            // the same { ok, items } shape every other admin tab
            // (bookings/contact/reviews) already uses.
            if (!orderId) {
                if (!isAdmin(req)) {
                    return res.status(400).json({ ok: false, error: 'orderId is required' });
                }
                const limit = Math.min(Number(req.query.limit) || 100, 200);
                const docs = await col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
                const items = docs.map(d => ({
                    _id: d._id.toString(),
                    category: d.category,
                    categoryLabel: CATEGORY_RULES[d.category],
                    name: d.name,
                    phone: d.phone,
                    matchCount: (d.matches || []).length,
                    paymentStatus: d.paymentStatus,
                    createdAt: d.createdAt,
                }));
                return res.status(200).json({ ok: true, items });
            }

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

        if (req.method === 'PATCH') {
            if (!isAdmin(req)) {
                return res.status(401).json({ ok: false, error: 'Unauthorized' });
            }
            const body = req.body || {};
            const id = (body.id || '').toString().trim();
            const paymentStatus = (body.paymentStatus || '').toString().trim();
            const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'cancelled'];
            if (!id || !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
                return res.status(400).json({ ok: false, error: `Valid id and paymentStatus (${VALID_PAYMENT_STATUSES.join('/')}) are required` });
            }
            let objectId;
            try {
                objectId = new ObjectId(id);
            } catch (e) {
                return res.status(400).json({ ok: false, error: 'Invalid id' });
            }
            const updateResult = await col.updateOne({ _id: objectId }, { $set: { paymentStatus } });
            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ ok: false, error: 'Order not found' });
            }
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    } catch (err) {
        console.error('Muhurat booking error:', err);
        res.status(500).json({ ok: false, error: 'Internal error', detail: err.message });
    }
};
