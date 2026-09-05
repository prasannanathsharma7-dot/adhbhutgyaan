const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml, checkRateLimit, isValidIndianPhone, isValidName } = require('./_db');
const { sendMail } = require('./_email');
const { notifyAdmin } = require('./_notify');

function isAdmin(req) {
    const providedKey = req.headers['x-admin-key'] || req.query.key;
    const envKey = (process.env.ADMIN_KEY || '').trim();
    // Trim both sides defensively - a trailing/leading space or newline
    // accidentally included when pasting the value into Vercel's env-var
    // field (or auto-inserted by some mobile keyboards on the login
    // input, though type="password" already suppresses most autocorrect)
    // would otherwise cause an exact-match comparison to silently fail
    // with "Invalid admin key" even when the visible characters match.
    return Boolean(envKey) && (providedKey || '').trim() === envKey;
}

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
            const name = capStr(body.name, 100);
            const phone = capStr(body.phone, 30);

            if (!name || !phone) {
                res.status(400).json({ ok: false, error: 'name and phone are required' });
                return;
            }
            if (!isValidIndianPhone(phone)) {
                res.status(400).json({ ok: false, error: 'phone must be a valid 10-digit Indian mobile number' });
                return;
            }
            if (!isValidName(name)) {
                res.status(400).json({ ok: false, error: 'name must be at least 3 alphabetic characters' });
                return;
            }

            const doc = {
                name,
                phone,
                email: capStr(body.email, 200),
                serviceId: capStr(body.serviceId, 100),
                serviceName: capStr(body.serviceName, 200),
                packageName: capStr(body.packageName, 200),
                mode: capStr(body.mode, 50), // online / offline / location / temple
                preferredDate: capStr(body.preferredDate, 50),
                address: capStr(body.address, 500),
                notes: capStr(body.notes, 2000),
                language: capStr(body.language, 10),
                status: 'new', // new -> contacted -> confirmed -> completed -> cancelled
                source: 'website',
                createdAt: new Date(),
            };
            const result = await db.collection('bookings').insertOne(doc);

            // Awaited (not fire-and-forget): in a serverless environment, an
            // unawaited promise can get killed once this function's own
            // async handler resolves - meaning the notification email/
            // WhatsApp message might never actually finish sending. A
            // couple seconds of extra latency here is worth guaranteed
            // delivery of a real customer enquiry.
            await notifyAdmin({
                emailSubject: `🙏 New Booking Enquiry - ${doc.name}`,
                emailHtml: `
                    <h2>New Pooja Booking Enquiry</h2>
                    <p><b>Name:</b> ${escapeHtml(doc.name)}</p>
                    <p><b>Phone:</b> ${escapeHtml(doc.phone)}</p>
                    ${doc.email ? `<p><b>Email:</b> ${escapeHtml(doc.email)}</p>` : ''}
                    <p><b>Service:</b> ${escapeHtml(doc.serviceName) || '-'}</p>
                    <p><b>Package:</b> ${escapeHtml(doc.packageName) || '-'}</p>
                    <p><b>Mode:</b> ${escapeHtml(doc.mode) || '-'}</p>
                    <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided'}</p>
                    ${doc.address ? `<p><b>Address:</b> ${escapeHtml(doc.address)}</p>` : ''}
                    ${doc.notes ? `<p><b>Notes:</b> ${escapeHtml(doc.notes)}</p>` : ''}
                    <p style="color:#888;font-size:12px;">Booking ID: ${result.insertedId}</p>
                `,
                whatsappText: `🙏 New Booking Enquiry\n\nName: ${doc.name}\nPhone: ${doc.phone}\nService: ${doc.serviceName || '-'}\nPackage: ${doc.packageName || '-'}\nMode: ${doc.mode || '-'}\nDate: ${doc.preferredDate || 'To be decided'}${doc.address ? `\nAddress: ${doc.address}` : ''}${doc.notes ? `\nNotes: ${doc.notes}` : ''}`,
            });

            if (doc.email) {
                await sendMail({
                    to: doc.email,
                    subject: 'We received your booking enquiry - Adhbhut Gyaan',
                    html: `
                        <h2>Namaste ${escapeHtml(doc.name)} 🙏</h2>
                        <p>We have received your booking enquiry for <b>${escapeHtml(doc.serviceName) || 'a pooja'}</b>.</p>
                        <p>Our team will contact you on WhatsApp or phone at <b>${escapeHtml(doc.phone)}</b> within 24 hours to confirm the date, pricing, and further details.</p>
                        <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided with the Pandit'}</p>
                        <p>If you need to reach us urgently, WhatsApp us at <a href="https://wa.me/919278148269">+91 92781 48269</a>.</p>
                        <br/>
                        <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
                    `,
                });
            }

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
                { $set: update },
                { returnDocument: 'after' }
            );
            const updatedDoc = result && result.value ? result.value : result;
            if (!updatedDoc) {
                res.status(404).json({ ok: false, error: 'Booking not found' });
                return;
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
