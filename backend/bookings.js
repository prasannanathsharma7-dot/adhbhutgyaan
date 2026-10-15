const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml, checkRateLimit } = require('./_db');
const { sendMail } = require('./_email');
const { notifyAdmin } = require('./_notify');

// Admin-only check shared by all endpoints (see backend/utils/auth.js for roles).
const { hasRole } = require('./utils/auth');
const { createBookingEnquiry } = require('./utils/booking-service');
const { sendCustomerMessage } = require('./utils/customer-messages');
const isAdmin = (req) => hasRole(req, ['admin']);

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
            // Validation, storage, notification and the customer's confirmation all live in utils/booking-service.js,
            // shared with the website chat and the WhatsApp bot so the three paths can never drift apart.
            const attribution = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
            const created = await createBookingEnquiry(db, body, { source: capStr(body.source, 100) || 'website', attribution, consent: body.consent });
            if (!created.ok) {
                res.status(created.status).json({ ok: false, error: created.error, fields: created.fields });
                return;
            }
            res.status(created.duplicate ? 200 : 201).json({ ok: true, id: created.id, reference: created.reference, duplicate: created.duplicate || undefined });
        } catch (err) {
            console.error('bookings API error:', err);
            res.status(500).json({ ok: false, error: 'Server error. Please try again or contact us directly.' });
        }
        return;
    }

    if (req.method === 'GET') {
        // Admin credentials are accepted in a request header only so secrets do
        // not leak into URLs, browser history, referrers, or server access logs.
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
        const scheduledDateRaw = (body.scheduledDate || '').toString().trim();

        if (!id || !ObjectId.isValid(id) || !VALID_STATUSES.includes(status)) {
            res.status(400).json({ ok: false, error: `Valid id and status (${VALID_STATUSES.join('/')}) are required` });
            return;
        }

        // scheduledDate is a real date (YYYY-MM-DD, from an admin-set <input
        // type="date">) - separate from the customer's free-text
        // preferredDate ("9 sept", "flexible", etc.), which the reminder
        // cron job can't reliably parse. Optional: only set when provided.
        const update = { status, statusUpdatedAt: new Date() };
        if (scheduledDateRaw) {
            const parsed = new Date(scheduledDateRaw);
            if (isNaN(parsed.getTime())) {
                res.status(400).json({ ok: false, error: 'scheduledDate must be a valid date (YYYY-MM-DD)' });
                return;
            }
            update.scheduledDate = scheduledDateRaw; // stored as YYYY-MM-DD string for simple exact-match querying
            update.reminderSent = false; // reset so a changed date gets a fresh reminder
        }

        try {
            const db = await getDb();
            const result = await db.collection('bookings').findOneAndUpdate(
                { _id: new ObjectId(id) },
                // the history lets the customer's tracker (/track) show when each stage was reached
                { $set: update, $push: { statusHistory: { status, at: update.statusUpdatedAt } } },
                { returnDocument: 'after' }
            );
            const updatedDoc = result && result.value ? result.value : result;
            if (!updatedDoc) {
                res.status(404).json({ ok: false, error: 'Booking not found' });
                return;
            }

            // Tell the customer on WhatsApp when the booking is confirmed or the ritual is done (template message; off unless
            // WHATSAPP_TEMPLATES_ENABLED=1; failures are swallowed so a status change always succeeds).
            if (status === 'confirmed' || status === 'completed') {
                await sendCustomerMessage(updatedDoc, status, { reference: updatedDoc.reference }).catch(() => {});
            }

            // Automatically ask for a review once a pooja is marked completed.
            // We can only auto-send this by email (a WhatsApp message can't be
            // pushed to the customer without them messaging first) - so we also
            // hand the admin a ready-to-forward WhatsApp text as a fallback.
            if (status === 'completed' && updatedDoc.email) {
                await sendMail({
                    to: updatedDoc.email,
                    subject: 'How was your pooja? - Adhbhut Gyaan',
                    html: `
                        <h2>Namaste ${escapeHtml(updatedDoc.name)} 🙏</h2>
                        <p>We hope your <b>${escapeHtml(updatedDoc.serviceName) || 'pooja'}</b> was performed to your satisfaction.</p>
                        <p>If you have a moment, we'd be grateful if you could share your experience - it helps other devotees find authentic guidance.</p>
                        <p><a href="https://www.adhbhutgyaan.com/leave-a-review" style="display:inline-block;background:#C49A2C;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Leave a Review</a></p>
                        <br/>
                        <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
                    `,
                });
            }
            if (status === 'completed') {
                await notifyAdmin({
                    emailSubject: `✅ Booking completed - ${escapeHtml(updatedDoc.name)} (review request ${updatedDoc.email ? 'emailed' : 'not emailed - no email on file'})`,
                    emailHtml: `
                        <p>Booking for <b>${escapeHtml(updatedDoc.name)}</b> (${escapeHtml(updatedDoc.phone)}) marked completed.</p>
                        ${updatedDoc.email ? '<p>A review-request email was sent to them automatically.</p>' : `
                        <p>No email on file, so please forward this on WhatsApp yourself:</p>
                        <p style="background:#f5f5f5;padding:10px;border-radius:6px;">Namaste ${escapeHtml(updatedDoc.name)} 🙏 Aapki pooja safaltapoorvak sampann ho gayi. Agar anubhav accha laga to yahan review chhod sakte hain: https://www.adhbhutgyaan.com/leave-a-review</p>
                        `}
                    `,
                    whatsappText: `✅ Booking completed - ${updatedDoc.name}. ${updatedDoc.email ? 'Review email sent.' : 'No email on file - please forward review request on WhatsApp yourself.'}`,
                });
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
