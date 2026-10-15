// Sends the admin a WhatsApp message via CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/) -
// a free personal-use WhatsApp API. No Meta Business account or payment needed.
// Requires two env vars in Vercel:
//   CALLMEBOT_PHONE   -> admin's WhatsApp number with country code, no + or spaces (e.g. 919278148269)
//   CALLMEBOT_APIKEY  -> the API key CallMeBot's bot sends back after you message it
//
// One-time setup (do this from the phone that should receive alerts):
//   1. Save this contact: +34 621 74 96 96 (CallMeBot's WhatsApp bot number)
//   2. Send it this exact message on WhatsApp: "I allow callmebot to send me messages"
//   3. The bot replies with your personal API key within ~1 minute.
//   4. Add CALLMEBOT_PHONE (your number) and CALLMEBOT_APIKEY (the key) to Vercel env vars.

const { sendMail, ADMIN_EMAIL } = require('./_email');

async function sendWhatsAppToAdmin(text) {
    const phone = process.env.CALLMEBOT_PHONE;
    const apikey = process.env.CALLMEBOT_APIKEY;
    if (!phone || !apikey) {
        console.warn('WhatsApp not sent (CALLMEBOT_PHONE / CALLMEBOT_APIKEY not set)');
        return false;
    }
    try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error('WhatsApp send failed, status:', res.status);
            return false;
        }
        return true;
    } catch (err) {
        console.error('WhatsApp send failed:', err.message);
        return false;
    }
}

// Notifications are how the team learns about a booking / enquiry / review. Before, each channel could fail
// silently and the message was simply lost. Now:
//   - notifyAdmin() tells the caller what happened ({ ok, email, whatsapp, queued });
//   - if NEITHER channel got through, the message is saved in the `notification_jobs` collection and retried by the
//     daily cron (retryPendingNotifications, up to MAX_ATTEMPTS, with an atomic claim so two runs never double-send),
//     and a structured NOTIFICATION_FAILED line is logged (no personal data in the log);
//   - jobs that keep failing become status 'dead' so they are visible, not retried forever.
// One channel failing is tolerated (the other reached the team), exactly as before.
const MAX_ATTEMPTS = 5;
const CLAIM_STALE_MS = 10 * 60 * 1000;

function createNotifier(deps) {
    const { sendMailFn, sendWhatsAppFn, getDbFn } = deps;

    async function trySend(payload) {
        const [email, whatsapp] = await Promise.allSettled([
            sendMailFn({ to: ADMIN_EMAIL, subject: payload.emailSubject, html: payload.emailHtml }),
            sendWhatsAppFn(payload.whatsappText),
        ]).then(rs => rs.map(r => r.status === 'fulfilled' && r.value === true));
        return { ok: email || whatsapp, email, whatsapp };
    }

    async function notifyAdmin(payload) {
        const result = await trySend(payload);
        if (result.ok) return { ...result, queued: false };
        let queued = false;
        try {
            const db = await getDbFn();
            await db.collection('notification_jobs').insertOne({
                kind: 'admin-notification', payload, status: 'pending', attempts: 1,
                lastError: 'email and WhatsApp both failed or are not configured', createdAt: new Date(), updatedAt: new Date(),
            });
            queued = true;
        } catch (err) {
            console.error('Could not queue the failed notification:', err.message);
        }
        console.error(JSON.stringify({ event: 'NOTIFICATION_FAILED', subject: String(payload.emailSubject || '').slice(0, 80), queued }));
        return { ...result, queued };
    }

    /** Retry queued notifications. Returns counts. Safe to call from several workers at once. */
    async function retryPendingNotifications(db, { limit = 20, now = new Date() } = {}) {
        const col = db.collection('notification_jobs');
        const stale = new Date(now.getTime() - CLAIM_STALE_MS);
        const jobs = await col.find({ $or: [{ status: 'pending' }, { status: 'sending', claimedAt: { $lt: stale } }] }).toArray();
        const out = { tried: 0, sent: 0, failed: 0, dead: 0 };
        for (const job of jobs.slice(0, limit)) {
            // claim atomically: only one worker wins
            const claim = await col.updateOne(
                { _id: job._id, $or: [{ status: 'pending' }, { status: 'sending', claimedAt: { $lt: stale } }] },
                { $set: { status: 'sending', claimedAt: now } },
            );
            if (claim.modifiedCount !== 1) continue;
            out.tried++;
            const r = await trySend(job.payload);
            if (r.ok) {
                await col.updateOne({ _id: job._id }, { $set: { status: 'sent', sentAt: new Date(), updatedAt: new Date() } });
                out.sent++;
            } else {
                const attempts = (job.attempts || 1) + 1;
                const dead = attempts >= MAX_ATTEMPTS;
                await col.updateOne({ _id: job._id }, { $set: { status: dead ? 'dead' : 'pending', attempts, updatedAt: new Date() } });
                out.failed++; if (dead) out.dead++;
            }
        }
        return out;
    }

    return { notifyAdmin, retryPendingNotifications, trySend };
}

const defaultNotifier = createNotifier({
    sendMailFn: sendMail,
    sendWhatsAppFn: sendWhatsAppToAdmin,
    getDbFn: () => require('./_db').getDb(),
});

module.exports = {
    notifyAdmin: defaultNotifier.notifyAdmin,
    retryPendingNotifications: defaultNotifier.retryPendingNotifications,
    sendWhatsAppToAdmin,
    createNotifier,
    MAX_ATTEMPTS,
};
