// Shared WhatsApp Cloud API senders - used by both the WhatsApp bot
// (api/whatsapp-webhook.js) and the admin's Sankalp video/photo dispatch
// (api/admin/dispatch-sankalp.js), so the fetch/auth logic exists once.

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

function configured() {
    return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

async function sendWhatsAppText(to, text) {
    if (!configured()) throw new Error('WhatsApp is not configured (missing env vars)');
    const res = await fetch(`${GRAPH_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
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
        throw new Error(`WhatsApp send failed: ${res.status}`);
    }
    return res.json();
}

// Sends a real photo/video (mediaType: 'video' | 'image') by direct link,
// with a caption. NOTE: Meta's rules require either (a) this being sent
// within 24 hours of the customer's last message to the business number, or
// (b) using a pre-approved message template if re-engaging outside that
// window (e.g. sending Sankalp proof a few days after the pooja). This
// sends a direct media message - if the 24h window has closed and no
// template exists yet, Meta's API will reject it with an error, which is
// surfaced back to the admin rather than failing silently.
async function sendWhatsAppMedia(to, mediaUrl, mediaType, caption) {
    if (!configured()) throw new Error('WhatsApp is not configured (missing env vars)');
    if (!['video', 'image'].includes(mediaType)) throw new Error('mediaType must be video or image');

    const res = await fetch(`${GRAPH_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: mediaType,
            [mediaType]: { link: mediaUrl, caption },
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        console.error('WhatsApp media send error:', res.status, JSON.stringify(data).slice(0, 500));
        const metaError = data?.error?.message || `HTTP ${res.status}`;
        throw new Error(`WhatsApp media send failed: ${metaError}`);
    }
    return data;
}

// Sends a pre-approved TEMPLATE message. Templates are what Meta allows a business to send to a customer outside the
// 24-hour customer-service window (booking updates, reminders). The template must exist and be approved in Meta Business
// Manager under exactly this name and language - see docs/WHATSAPP_TEMPLATES.md.
async function sendWhatsAppTemplate(to, name, languageCode, bodyParams = []) {
    if (!configured()) throw new Error('WhatsApp is not configured (missing env vars)');
    const res = await fetch(`${GRAPH_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name,
                language: { code: languageCode },
                components: bodyParams.length ? [{ type: 'body', parameters: bodyParams.map(text => ({ type: 'text', text })) }] : [],
            },
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        console.error('WhatsApp template send error:', res.status, JSON.stringify(data).slice(0, 400));
        throw new Error(`WhatsApp template send failed: ${data?.error?.message || res.status}`);
    }
    return data;
}

module.exports = { sendWhatsAppText, sendWhatsAppMedia, sendWhatsAppTemplate };
