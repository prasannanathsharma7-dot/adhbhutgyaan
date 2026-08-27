// WhatsApp bot: receives incoming messages via Meta's WhatsApp Cloud API
// webhook, replies using the same AI brain as the website chatbot
// (api/_assistant.js), and can create real bookings.
//
// SETUP (do this in Meta for Developers, developers.facebook.com):
// 1. Create a Meta Business app -> add the "WhatsApp" product.
// 2. Under WhatsApp > API Setup, note the temporary access token and the
//    "Phone number ID" - or better, set up a permanent System User token
//    for production use (temporary tokens expire in 24 hours).
// 3. Under WhatsApp > Configuration, set the webhook Callback URL to:
//      https://www.adhbhutgyaan.com/api/whatsapp-webhook
//    and the Verify Token to any secret string of your choice.
// 4. Subscribe the webhook to the "messages" field.
// 5. Set these env vars in Vercel:
//      WHATSAPP_ACCESS_TOKEN   - the access token from step 2
//      WHATSAPP_PHONE_NUMBER_ID - the Phone number ID from step 2
//      WHATSAPP_VERIFY_TOKEN   - the same secret string you set in step 3
//      ANTHROPIC_API_KEY       - already set for the website chatbot
//
// Note: the WhatsApp number used here must be dedicated to the Cloud API -
// it can no longer be used in the regular WhatsApp/WhatsApp Business app at
// the same time. Test with a spare number first if unsure.

const { getDb, capStr } = require('./_db');
const { runAssistantTurn } = require('./_assistant');

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const MAX_HISTORY = 20; // messages of context kept per phone number

async function sendWhatsAppMessage(to, text) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const res = await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: text },
        }),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('WhatsApp send error:', res.status, errText.slice(0, 300));
    }
}

module.exports = async (req, res) => {
    // ---- Webhook verification (Meta calls this once, when you save the
    // Callback URL in the dashboard) ----
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send('Verification failed');
        }
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }

    // Always acknowledge quickly so Meta doesn't retry/mark the webhook
    // unhealthy - we do the actual work after responding.
    res.status(200).send('EVENT_RECEIVED');

    try {
        const entry = req.body?.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];

        // Ignore delivery/read-status callbacks and non-text messages (image,
        // audio, sticker, etc.) - the bot only handles plain text for now.
        if (!message || message.type !== 'text') return;

        const from = message.from; // sender's WhatsApp number, e.g. "919876543210"
        const text = capStr(message.text?.body, 4000);
        if (!from || !text) return;

        if (!process.env.ANTHROPIC_API_KEY || !process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
            console.error('WhatsApp bot: missing required env vars');
            return;
        }

        const db = await getDb();

        // De-duplicate: Meta may redeliver the same webhook event on retry.
        const messageId = message.id;
        if (messageId) {
            const already = await db.collection('whatsapp_processed').findOne({ messageId });
            if (already) return;
            await db.collection('whatsapp_processed').insertOne({ messageId, at: new Date() });
        }

        // Load this conversation's recent history (stored server-side, since
        // unlike the website widget there's no client to hold it).
        const convo = await db.collection('whatsapp_conversations').findOne({ phone: from });
        const history = convo?.messages || [];
        const updatedHistory = [...history, { role: 'user', content: text }].slice(-MAX_HISTORY);

        const { replyText } = await runAssistantTurn(db, updatedHistory, process.env.ANTHROPIC_API_KEY, 'whatsapp');

        await db.collection('whatsapp_conversations').updateOne(
            { phone: from },
            { $set: { messages: [...updatedHistory, { role: 'assistant', content: replyText }].slice(-MAX_HISTORY), updatedAt: new Date() } },
            { upsert: true }
        );

        await sendWhatsAppMessage(from, replyText);
    } catch (err) {
        console.error('WhatsApp webhook error:', err);
    }
};
