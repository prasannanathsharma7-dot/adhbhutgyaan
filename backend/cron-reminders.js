// Runs once daily (see vercel.json "crons") - finds confirmed bookings
// scheduled for tomorrow and sends a reminder: email if the customer gave
// one, plus a ready-to-forward WhatsApp text in the admin notification
// either way (we can't push a WhatsApp message to a customer who hasn't
// messaged first, so a human forwarding it is the practical fallback).

const { getDb, escapeHtml } = require('./_db');
const { requireRole } = require('./utils/auth');
const { sendMail } = require('./_email');
const { notifyAdmin, retryPendingNotifications } = require('./_notify');

// "Tomorrow" is a calendar day in INDIA. The server clock is UTC, so computing it from UTC would be wrong for the 5.5
// hours around midnight IST (and silently break if the cron time were ever moved). Shift to IST first.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function istTomorrow(now = new Date()) {
    const ist = new Date(now.getTime() + IST_OFFSET_MS);
    ist.setUTCDate(ist.getUTCDate() + 1);
    return ist.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Sends tomorrow's reminders. Each booking is CLAIMED atomically (reminderSent: false -> true) before anything is sent,
 * so two overlapping runs (a retry, a manual trigger) can never email the same customer twice. If sending throws, the
 * claim is released so the booking is retried on the next run instead of being skipped for good.
 */
async function runReminders(db, { now = new Date(), deps = {} } = {}) {
    const sendMailFn = deps.sendMail || sendMail;
    const notifyFn = deps.notifyAdmin || notifyAdmin;
    const col = db.collection('bookings');
    const targetDate = istTomorrow(now);
    const bookings = await col.find({ status: 'confirmed', scheduledDate: targetDate, reminderSent: { $ne: true } }).toArray();

    let sent = 0, skipped = 0, failed = 0;
    for (const doc of bookings) {
        const claim = await col.updateOne({ _id: doc._id, reminderSent: { $ne: true } }, { $set: { reminderSent: true, reminderClaimedAt: new Date() } });
        if (claim.modifiedCount !== 1) { skipped++; continue; } // another run already took it
        try {
            let emailOk = false;
            if (doc.email) {
                emailOk = await sendMailFn({
                    to: doc.email,
                    subject: `Reminder: Your pooja is tomorrow — Adhbhut Gyaan`,
                    html: `
                        <h2>Namaste ${escapeHtml(doc.name)} 🙏</h2>
                        <p>This is a reminder that your <b>${escapeHtml(doc.serviceName) || 'pooja'}</b> is scheduled for tomorrow, <b>${targetDate}</b>.</p>
                        ${doc.mode ? `<p><b>Mode:</b> ${escapeHtml(doc.mode)}</p>` : ''}
                        <p>If you have any questions before then, WhatsApp us at <a href="https://wa.me/919278148269">+91 92781 48269</a>.</p>
                        <br/>
                        <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
                    `,
                }) === true;
            }
            const forwardNote = !doc.email ? 'No email on file' : (emailOk ? 'A reminder email was sent to them automatically' : 'The reminder EMAIL FAILED to send');
            await notifyFn({
                emailSubject: `⏰ Reminder due tomorrow - ${escapeHtml(doc.name)}`,
                emailHtml: `
                    <p>Booking for <b>${escapeHtml(doc.name)}</b> (${escapeHtml(doc.phone)}) is scheduled for tomorrow (${targetDate}).</p>
                    <p><b>Service:</b> ${escapeHtml(doc.serviceName) || '-'} ${doc.mode ? `· <b>Mode:</b> ${escapeHtml(doc.mode)}` : ''}</p>
                    <p>${forwardNote}${emailOk ? '.' : ' - please forward this on WhatsApp yourself:'}</p>
                    ${emailOk ? '' : `<p style="background:#f5f5f5;padding:10px;border-radius:6px;">Namaste ${escapeHtml(doc.name)} 🙏 Yaad dilana chahte hain ki kal (${targetDate}) aapki ${escapeHtml(doc.serviceName) || 'pooja'} nirdharit hai. Koi prashn ho to is number par WhatsApp karein.</p>`}
                `,
                whatsappText: `⏰ Reminder due tomorrow - ${doc.name}. ${forwardNote}${emailOk ? '.' : ' - please forward a reminder on WhatsApp.'}`,
            });
            await col.updateOne({ _id: doc._id }, { $set: { reminderSentAt: new Date(), reminderEmailOk: emailOk } });
            sent++;
        } catch (err) {
            console.error('reminder failed, releasing claim:', doc._id, err.message);
            await col.updateOne({ _id: doc._id }, { $set: { reminderSent: false }, $unset: { reminderClaimedAt: '' } }).catch(() => {});
            failed++;
        }
    }
    return { targetDate, remindersSent: sent, skipped, failed };
}

const handler = async (req, res) => {
    // Requires `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically when CRON_SECRET is set on
    // the Vercel project; set the same value on the backend). The old fallback trusted the mere presence of an
    // `x-vercel-cron` header, which any client can send - removed. With no secret configured at all the endpoint
    // refuses every request (fail closed).
    if (!requireRole(req, res, ['cron'])) return;

    try {
        const db = await getDb();
        const result = await runReminders(db);
        // Same daily run: retry any admin notification that could not be delivered earlier.
        const notifications = await retryPendingNotifications(db);
        res.status(200).json({ ok: true, ...result, notifications });
    } catch (err) {
        console.error('cron-reminders error:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
};

module.exports = handler;
module.exports.runReminders = runReminders;
module.exports.istTomorrow = istTomorrow;
