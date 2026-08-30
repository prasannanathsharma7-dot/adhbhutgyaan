// Sends the admin a WhatsApp message via CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/) -
// a free personal-use WhatsApp API. No Meta Business account or payment needed.
// Requires two env vars in Vercel:
//   CALLMEBOT_PHONE   -> admin's WhatsApp number with country code, no + or spaces (e.g. 919818227189)
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

// Sends the admin BOTH an email and a WhatsApp message for a new
// booking/enquiry/review. Each channel fails independently and silently -
// one being unavailable/misconfigured never blocks the other or the
// original API response.
async function notifyAdmin({ emailSubject, emailHtml, whatsappText }) {
    await Promise.allSettled([
        sendMail({ to: ADMIN_EMAIL, subject: emailSubject, html: emailHtml }),
        sendWhatsAppToAdmin(whatsappText),
    ]);
}

module.exports = { notifyAdmin, sendWhatsAppToAdmin };
