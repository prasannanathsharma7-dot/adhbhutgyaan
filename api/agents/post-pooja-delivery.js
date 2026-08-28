// AGENT 4: Post-Pooja CRM & Video Delivery Handler
// File: api/agents/post-pooja-delivery.js
// Dispatches sacred Sankalp video proof, pooja completion blessings, and feedback links to devotees.

const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml } = require('../_db');
const { sendMail } = require('../_email');
const { sendWhatsAppText, sendWhatsAppMedia } = require('../_whatsapp');
const { notifyAdmin } = require('../_notify');
const { requireAgentAuth } = require('../utils/agent-auth');

const REVIEW_URL = 'https://www.adhbhutgyaan.com/leave-a-review';

/**
 * Builds personalized Vedic completion message for WhatsApp.
 */
function buildWhatsAppCompletionMessage(devoteeName, devoteeGotra, serviceName, mediaUrl) {
    return `🕉️ *ADBHUT GYAAN — POOJA SANKALP SAMPANN* 🙏
Har Har Mahadev!

Namaste *${devoteeName || 'Devotee'} Ji* (Gotra: *${devoteeGotra || 'Kashyap'}*),

Aapka *${serviceName || 'Vedic Pooja'}* Kashi (Varanasi) me Maa Ganga ke pavitra tat par shastrokt vidhi se vidwan Brahmanon dwara sampann kar diya gaya hai.

📹 *Aapki Pooja & Sankalp ka Video Proof:*
👉 ${mediaUrl}

Aapke parivar par Bhagwan Shiva evam Maa Ganga ki kripa sadaiv bani rahe.

⭐ *Devotee Feedback:*
Kripya apna anubhav hamare sath saajha karein:
👉 ${REVIEW_URL}

🙏 _Dr. Umang Nath Sharma | Adhbhut Gyaan, Kashi_`;
}

/**
 * Builds rich HTML delivery certificate/letter for Email.
 */
function buildEmailCompletionHtml(devoteeName, devoteeGotra, serviceName, mediaUrl) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c2150; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1c2150 0%, #2a316a 100%); padding: 30px 20px; text-align: center; color: white;">
                <span style="font-size: 36px; display: block; margin-bottom: 8px;">🕉️</span>
                <h1 style="margin: 0; font-size: 24px; color: #d4a843;">Pooja Sankalp Sampann</h1>
                <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Kashi Vishwanath Dham · Varanasi</p>
            </div>

            <div style="padding: 28px; background: #ffffff;">
                <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
                    <b>Namaste ${escapeHtml(devoteeName || 'Devotee')} Ji 🙏 Har Har Mahadev!</b>
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                    Your <b>${escapeHtml(serviceName || 'Vedic Pooja')}</b> has been solemnly completed in Kashi (Varanasi) on the holy banks of Maa Ganga with your name and gotra (<b>${escapeHtml(devoteeGotra || 'Kashyap')}</b>).
                </p>

                <div style="background: #f8fafc; border: 2px dashed #c49a2c; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                    <h3 style="margin: 0 0 10px; color: #1c2150; font-size: 16px;">📹 Sacred Pooja & Sankalp Video Proof</h3>
                    <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">Click below to view your personalized pooja recording and darshan:</p>
                    <a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener noreferrer" style="background: #c49a2c; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                        ▶ Watch Pooja Video Recording
                    </a>
                </div>

                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                        <i>"ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥"</i><br/>
                        May Lord Shiva bless you and your family with health, prosperity, and peace.
                    </p>
                </div>

                <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">We would be deeply blessed to receive your honest review:</p>
                    <a href="${REVIEW_URL}" style="color: #c49a2c; font-weight: bold; text-decoration: underline; font-size: 14px;">
                        Leave a Review on Adhbhut Gyaan ⭐⭐⭐⭐⭐
                    </a>
                </div>
            </div>

            <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                🙏 <b>Adhbhut Gyaan</b> · Kashi Vedic Services<br/>
                Dr. Umang Nath Sharma & Vedic Priests Team
            </div>
        </div>
    `;
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
        return;
    }

    if (!requireAgentAuth(req, res)) {
        return;
    }

    try {
        const body = req.body || {};
        const bookingId = body.bookingId || body.id || body._id;
        const mediaUrl = capStr(body.mediaUrl || body.sankalpMediaUrl || body.proofUrl || '', 1000);
        const customNotes = capStr(body.notes || body.sankalpSummary || '', 1000);

        if (!mediaUrl) {
            res.status(400).json({ ok: false, error: 'A valid mediaUrl (Google Drive, YouTube, or Video link) is required.' });
            return;
        }

        const db = await getDb();
        let targetBooking = null;

        if (bookingId) {
            const query = ObjectId.isValid(bookingId)
                ? { _id: new ObjectId(bookingId) }
                : { $or: [{ bookingId: bookingId }, { phone: bookingId }, { email: bookingId }] };
            targetBooking = await db.collection('bookings').findOne(query);
            if (!targetBooking) {
                targetBooking = await db.collection('kundli_requests').findOne(query);
            }
        } else if (body.phone || body.email) {
            targetBooking = await db.collection('bookings').findOne({
                $or: [{ phone: body.phone }, { email: body.email }].filter(Boolean),
            });
        }

        const devoteeName = targetBooking?.name || body.name || 'Devotee';
        const devoteeGotra = targetBooking?.gotra || body.gotra || 'Kashyap';
        const serviceName = targetBooking?.serviceName || body.serviceName || 'Kashi Vedic Pooja';
        const phone = targetBooking?.phone || body.phone;
        const email = targetBooking?.email || body.email;

        let emailDispatched = false;
        let whatsappDispatched = false;
        let emailError = null;
        let whatsappError = null;

        // 1. Dispatch Email
        if (email && email.includes('@')) {
            try {
                const emailHtml = buildEmailCompletionHtml(devoteeName, devoteeGotra, serviceName, mediaUrl);
                const sendResult = await sendMail({
                    to: email,
                    subject: `🕉️ Pooja Sankalp Completed & Video Proof — ${devoteeName} Ji`,
                    html: emailHtml,
                });
                emailDispatched = Boolean(sendResult);
            } catch (eErr) {
                emailError = eErr.message;
            }
        }

        // 2. Dispatch WhatsApp
        if (phone) {
            try {
                const cleanPhone = phone.replace(/[^0-9]/g, '');
                const whatsappMessage = buildWhatsAppCompletionMessage(devoteeName, devoteeGotra, serviceName, mediaUrl);
                await sendWhatsAppText(cleanPhone, whatsappMessage);
                whatsappDispatched = true;
            } catch (wErr) {
                whatsappError = wErr.message;
            }
        }

        // 3. Update Database Record
        if (targetBooking) {
            const collectionToUpdate = targetBooking._type === 'kundli' ? 'kundli_requests' : 'bookings';
            await db.collection(collectionToUpdate).updateOne(
                { _id: targetBooking._id },
                {
                    $set: {
                        status: 'completed',
                        sankalpMediaUrl: mediaUrl,
                        adminNotes: customNotes || targetBooking.adminNotes,
                        postPoojaDelivery: {
                            deliveredAt: new Date(),
                            mediaUrl,
                            emailDispatched,
                            whatsappDispatched,
                            emailError,
                            whatsappError,
                            status: 'delivered',
                        },
                        reviewEmailSent: emailDispatched,
                        reviewEmailSentAt: emailDispatched ? new Date() : null,
                    },
                }
            );
        }

        // 4. Notify Admin of completion dispatch
        await notifyAdmin({
            emailSubject: `✅ Sankalp Video Dispatched: ${devoteeName} (${serviceName})`,
            emailHtml: `
                <p>Post-Pooja Video Proof successfully delivered to <b>${escapeHtml(devoteeName)}</b>.</p>
                <p><b>Service:</b> ${escapeHtml(serviceName)}</p>
                <p><b>Media URL:</b> <a href="${escapeHtml(mediaUrl)}">${escapeHtml(mediaUrl)}</a></p>
                <p><b>Email Status:</b> ${emailDispatched ? 'Sent' : 'Skipped / Failed'}</p>
                <p><b>WhatsApp Status:</b> ${whatsappDispatched ? 'Sent' : 'Skipped / Failed'}</p>
            `,
            whatsappText: `✅ Sankalp Video Proof Dispatched for ${devoteeName} (${serviceName}). Video: ${mediaUrl}`,
        });

        res.status(200).json({
            ok: true,
            agent: 'AGENT 4: Post-Pooja CRM & Video Delivery Handler',
            bookingId: targetBooking?._id || bookingId,
            devoteeName,
            serviceName,
            mediaUrl,
            emailDispatched,
            whatsappDispatched,
            deliveryStatus: 'delivered',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('post-pooja-delivery agent error:', err);
        res.status(500).json({
            ok: false,
            error: 'Server error in Post-Pooja Delivery agent.',
            details: err.message || String(err),
        });
    }
};
