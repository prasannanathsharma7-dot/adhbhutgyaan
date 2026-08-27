// Runs once daily (see vercel.json "crons") - finds confirmed bookings
// scheduled for tomorrow and sends a reminder: email if the customer gave
// one, plus a ready-to-forward WhatsApp text in the admin notification
// either way (we can't push a WhatsApp message to a customer who hasn't
// messaged first, so a human forwarding it is the practical fallback).

const { getDb, escapeHtml } = require('./_db');
const { sendMail } = require('./_email');
const { notifyAdmin } = require('./_notify');

function tomorrowDateString() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

module.exports = async (req, res) => {
    // Vercel signs cron requests with this header - reject anything else so
    // this endpoint can't be used to spam reminders on demand.
    const isVercelCron = req.headers['x-vercel-cron'] !== undefined;
    if (!isVercelCron && req.query.key !== process.env.ADMIN_KEY) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
    }

    try {
        const db = await getDb();
        const targetDate = tomorrowDateString();

        const bookings = await db.collection('bookings').find({
            status: 'confirmed',
            scheduledDate: targetDate,
            reminderSent: { $ne: true },
        }).toArray();

        let sent = 0;
        for (const doc of bookings) {
            if (doc.email) {
                sendMail({
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
                });
            }

            notifyAdmin({
                emailSubject: `⏰ Reminder due tomorrow - ${escapeHtml(doc.name)}`,
                emailHtml: `
                    <p>Booking for <b>${escapeHtml(doc.name)}</b> (${escapeHtml(doc.phone)}) is scheduled for tomorrow (${targetDate}).</p>
                    <p><b>Service:</b> ${escapeHtml(doc.serviceName) || '-'} ${doc.mode ? `· <b>Mode:</b> ${escapeHtml(doc.mode)}` : ''}</p>
                    ${doc.email ? '<p>A reminder email was sent to them automatically.</p>' : `
                    <p>No email on file - please forward this on WhatsApp yourself:</p>
                    <p style="background:#f5f5f5;padding:10px;border-radius:6px;">Namaste ${escapeHtml(doc.name)} 🙏 Yaad dilana chahte hain ki kal (${targetDate}) aapki pooja hai. Koi sawal ho to batayein.</p>
                    `}
                `,
                whatsappText: `⏰ Reminder due tomorrow - ${doc.name}. ${doc.email ? 'Reminder email sent.' : 'No email on file - please forward reminder on WhatsApp yourself.'}`,
            });

            await db.collection('bookings').updateOne(
                { _id: doc._id },
                { $set: { reminderSent: true, reminderSentAt: new Date() } }
            );
            sent++;
        }

        res.status(200).json({ ok: true, targetDate, remindersSent: sent });
    } catch (err) {
        console.error('cron-reminders error:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
};
