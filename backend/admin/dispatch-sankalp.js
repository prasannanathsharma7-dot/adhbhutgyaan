// Admin-only: sends real Sankalp/pooja video or photo proof to a customer
// on WhatsApp, for a specific completed booking. Adapted from a much more
// elaborate proposal that used a Meta message *template* by default and
// fabricated placeholder chart data elsewhere in the same document - this
// version only does the one genuinely real, honest part of that idea:
// dispatching an actual media file the admin uploaded/linked, for an actual
// booking that actually happened.
//
// NOTE (Meta WhatsApp rules): this sends a direct media message, which only
// works within 24 hours of the customer's last message to the business
// number. If a booking's Sankalp footage is ready after that window closes,
// Meta requires a pre-approved message template to re-open the conversation
// - that's a manual one-time setup in Meta Business Manager, not something
// this endpoint can do on its own. If the send fails for that reason, the
// error below will say so.

const { ObjectId } = require('mongodb');
const { getDb, capStr } = require('../_db');
const { sendWhatsAppMedia } = require('../_whatsapp');

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

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    if (!isAdmin(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
    }

    try {
        const body = req.body || {};
        const bookingId = (body.bookingId || '').toString().trim();
        const mediaUrl = capStr(body.mediaUrl, 500);
        const mediaType = body.mediaType === 'image' ? 'image' : 'video'; // default video

        if (!bookingId || !ObjectId.isValid(bookingId) || !mediaUrl) {
            res.status(400).json({ ok: false, error: 'bookingId and mediaUrl are required' });
            return;
        }

        const db = await getDb();
        const booking = await db.collection('bookings').findOne({ _id: new ObjectId(bookingId) });
        if (!booking) {
            res.status(404).json({ ok: false, error: 'Booking not found' });
            return;
        }
        if (!booking.phone) {
            res.status(400).json({ ok: false, error: 'This booking has no phone number on file' });
            return;
        }

        const to = booking.phone.replace(/[^0-9]/g, '');
        const caption = `🙏 Namaste ${booking.name}! Here is a glimpse from your ${booking.serviceName || 'pooja'} performed at Kashi. If you're happy with it, we'd love a review: https://www.adhbhutgyaan.com/leave-a-review`;

        const waData = await sendWhatsAppMedia(to, mediaUrl, mediaType, caption);

        await db.collection('bookings').updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { sankalpMediaUrl: mediaUrl, sankalpDispatchedAt: new Date(), sankalpMetaMessageId: waData?.messages?.[0]?.id || null } }
        );

        res.status(200).json({ ok: true, message: 'Sankalp media dispatched.' });
    } catch (err) {
        console.error('dispatch-sankalp error:', err);
        res.status(500).json({ ok: false, error: err.message || 'Failed to dispatch media.' });
    }
};
