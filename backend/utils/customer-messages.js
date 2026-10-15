// Automatic WhatsApp updates to the CUSTOMER about their own booking: received, confirmed, performed, reminder.
// These are transactional (about a request the customer made), sent as Meta-approved TEMPLATES so they work outside the
// 24-hour window. OFF unless WHATSAPP_TEMPLATES_ENABLED=1; every failure is swallowed (a failed message must never fail a
// booking or a status change). Template names / texts to submit to Meta: docs/WHATSAPP_TEMPLATES.md.
const { sendWhatsAppTemplate } = require('../_whatsapp');

/** event -> template name, and the body parameters in the order the template expects them. */
const EVENTS = {
    received: { template: 'booking_received', params: (d, ref) => [first(d), service(d), ref] },
    confirmed: { template: 'booking_confirmed', params: (d) => [first(d), service(d), dateText(d)] },
    completed: { template: 'pooja_completed', params: (d) => [first(d), service(d)] },
    reminder: { template: 'pooja_reminder', params: (d) => [first(d), service(d), dateText(d)] },
};
const first = (d) => String(d.name || '').trim().split(/\s+/)[0] || 'Ji';
const service = (d) => d.serviceName || 'pooja';
const dateText = (d) => d.scheduledDate || d.preferredDate || 'the agreed date';

/** Meta rejects parameters with newlines, tabs or 4+ consecutive spaces, and caps their length. */
const clean = (s) => String(s).replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim().slice(0, 200) || '-';

/** Indian numbers (10 digits, or 0 / 91 prefixed) and numbers with +country code -> digits for the Cloud API, else null. */
function toWhatsAppNumber(phone) {
    const raw = String(phone || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (raw.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? digits : null;
    if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
    if (/^0[6-9]\d{9}$/.test(digits)) return `91${digits.slice(1)}`;
    if (/^91[6-9]\d{9}$/.test(digits)) return digits;
    if (digits.length >= 11 && digits.length <= 15) return digits; // typed with a country code but no "+"
    return null;
}

function buildMessage(doc, event, reference) {
    const def = EVENTS[event];
    if (!def) throw new Error(`unknown event ${event}`);
    const to = toWhatsAppNumber(doc.phone);
    if (!to) return null;
    return { to, template: def.template, languageCode: doc.language === 'hi' ? 'hi' : 'en', params: def.params(doc, reference || doc.reference || '').map(clean) };
}

/**
 * @returns {Promise<{ok:true}|{ok:false, reason:string}>}  never throws
 * @param opts { enabled, send, timeoutMs }  (send is injectable for tests)
 */
async function sendCustomerMessage(doc, event, opts = {}) {
    const { enabled = process.env.WHATSAPP_TEMPLATES_ENABLED === '1', send = sendWhatsAppTemplate, timeoutMs = 4000 } = opts;
    if (!enabled) return { ok: false, reason: 'disabled' };
    if (doc.whatsappOptOut === true) return { ok: false, reason: 'opted out' };
    let msg;
    try { msg = buildMessage(doc, event, opts.reference); } catch (e) { return { ok: false, reason: e.message }; }
    if (!msg) return { ok: false, reason: 'no valid phone number' };
    let timer;
    try {
        await Promise.race([
            send(msg.to, msg.template, msg.languageCode, msg.params),
            new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), timeoutMs); }),
        ]);
        return { ok: true };
    } catch (e) {
        console.error(JSON.stringify({ event: 'CUSTOMER_MESSAGE_FAILED', template: msg.template, reason: String(e.message).slice(0, 120) })); // no phone / name in the log
        return { ok: false, reason: String(e.message).slice(0, 120) };
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { sendCustomerMessage, buildMessage, toWhatsAppNumber, EVENTS };
