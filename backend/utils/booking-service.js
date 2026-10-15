// ONE place that creates a booking enquiry, used by the booking form (POST /api/bookings), the website chat's
// create_booking tool and the WhatsApp bot (audit F-07 / F-08). Before, the AI paths only checked "name and phone are
// not empty": a junk phone number or a malformed e-mail went straight into the database and onto the team's
// notification, with no reference number and no protection against the same enquiry being created twice.
//
// Guarantees:
//   - the same validation everywhere (name, phone incl. international numbers, optional e-mail);
//   - only whitelisted fields are stored (no mass-assignment: a caller cannot set status, _id, ...);
//   - a reference number for every booking;
//   - the same person asking for the same service again within 15 minutes gets the existing booking back
//     (double-clicks, a repeated AI tool call) instead of a second record and a second notification;
//   - one admin notification and, if an e-mail was given, one confirmation e-mail - built in one place.
const { ObjectId } = require('mongodb');
const { capStr, escapeHtml, isValidPhone, isValidName } = require('../_db');

const DUPLICATE_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[^\s@<>()[\]\\,;:]+$/;
const SOURCE_LABELS = { website: 'Website form', 'kundli-request': 'Free Kundli', chatbot: 'Website Chatbot', whatsapp: 'WhatsApp Bot' };

const phoneKey = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 10 ? d.slice(-10) : d; };

/** @returns {{ok:true, clean:object}|{ok:false, error:string, fields:object}} */
function validateBookingInput(input = {}) {
    const clean = {
        name: capStr(input.name, 100),
        phone: capStr(input.phone, 30),
        email: capStr(input.email, 200).toLowerCase(),
        serviceId: capStr(input.serviceId, 100),
        serviceName: capStr(input.serviceName, 200),
        packageName: capStr(input.packageName, 200),
        mode: capStr(input.mode, 50), // online / offline / location / temple
        birthDate: capStr(input.birthDate, 50),
        preferredDate: capStr(input.preferredDate, 50),
        preferredSlot: capStr(input.preferredSlot, 50),
        address: capStr(input.address, 500),
        notes: capStr(input.notes, 2000),
        language: capStr(input.language, 10),
    };
    const fields = {};
    if (!clean.name || !clean.phone) {
        return { ok: false, error: 'name and phone are required', fields: { ...(clean.name ? {} : { name: 'required' }), ...(clean.phone ? {} : { phone: 'required' }) } };
    }
    if (!isValidPhone(clean.phone)) fields.phone = 'phone must be a valid mobile number (10-digit Indian, or international with +country code)';
    else if (!isValidName(clean.name)) fields.name = 'name must be at least 3 alphabetic characters';
    if (clean.email && !EMAIL_RE.test(clean.email)) fields.email = 'email is not valid';
    const first = Object.values(fields)[0];
    return first ? { ok: false, error: first, fields } : { ok: true, clean };
}

function adminNotification(doc, reference) {
    const label = SOURCE_LABELS[doc.source] || doc.source;
    return {
        emailSubject: `🕉️ New Booking Enquiry (${label}) - ${doc.name}`,
        emailHtml: `
            <h2>New Pooja Booking Enquiry</h2>
            <p><b>Name:</b> ${escapeHtml(doc.name)}</p>
            <p><b>Phone:</b> ${escapeHtml(doc.phone)}</p>
            ${doc.email ? `<p><b>Email:</b> ${escapeHtml(doc.email)}</p>` : ''}
            <p><b>Service:</b> ${escapeHtml(doc.serviceName) || '-'}</p>
            <p><b>Package:</b> ${escapeHtml(doc.packageName) || '-'}</p>
            <p><b>Mode:</b> ${escapeHtml(doc.mode) || '-'}</p>
            <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided'}</p>
            ${doc.preferredSlot ? `<p><b>Preferred Slot:</b> ${escapeHtml(doc.preferredSlot)}</p>` : ''}
            ${doc.birthDate ? `<p><b>Birth Date:</b> ${escapeHtml(doc.birthDate)}</p>` : ''}
            <p><b>Lead Source:</b> ${escapeHtml(label)}</p>
            ${doc.address ? `<p><b>Address:</b> ${escapeHtml(doc.address)}</p>` : ''}
            ${doc.notes ? `<p><b>Notes:</b> ${escapeHtml(doc.notes)}</p>` : ''}
            <p style="color:#888;font-size:12px;">Reference: ${reference} · Booking ID: ${doc._id}</p>`,
        whatsappText: `🕉️ New Booking Enquiry (${label})\n\nReference: ${reference}\nName: ${doc.name}\nPhone: ${doc.phone}\nService: ${doc.serviceName || '-'}\nMode: ${doc.mode || '-'}\nDate: ${doc.preferredDate || 'TBD'}${doc.notes ? `\nNotes: ${doc.notes}` : ''}`,
    };
}

function customerConfirmation(doc, reference) {
    return {
        to: doc.email,
        subject: 'We received your booking enquiry - Adhbhut Gyaan',
        html: `
            <h2>Namaste ${escapeHtml(doc.name)} 🙏</h2>
            <p>We have received your booking enquiry for <b>${escapeHtml(doc.serviceName) || 'a pooja'}</b>.</p>
            <p>Our team will contact you on WhatsApp or phone at <b>${escapeHtml(doc.phone)}</b> within 24 hours to confirm the date, pricing, and further details.</p>
            <p><b>Reference:</b> ${reference}</p>
            <p><b>Preferred Date:</b> ${escapeHtml(doc.preferredDate) || 'To be decided with the Pandit'}</p>
            <p>If you need to reach us urgently, WhatsApp us at <a href="https://wa.me/919278148269">+91 92781 48269</a>.</p>
            <br/>
            <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>`,
    };
}

/**
 * Validates, de-duplicates, stores and announces a booking enquiry.
 * @param {object} db      MongoDB database (or a test double)
 * @param {object} input   raw, untrusted fields
 * @param {object} opts    { source, attribution, consent, now, deps:{notifyAdmin, sendMail} }
 * @returns {Promise<{ok:true, id, reference, duplicate:boolean}|{ok:false, status:number, error, fields}>}
 */
async function createBookingEnquiry(db, input, opts = {}) {
    const { source = 'website', attribution = {}, consent = null, now = new Date() } = opts;
    const notify = (opts.deps && opts.deps.notifyAdmin) || require('../_notify').notifyAdmin;
    const mail = (opts.deps && opts.deps.sendMail) || require('../_email').sendMail;

    const v = validateBookingInput(input);
    if (!v.ok) return { ok: false, status: 400, error: v.error, fields: v.fields };
    const { clean } = v;
    const col = db.collection('bookings');

    // same person + same service within the window -> return the existing booking (no second record / notification)
    const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS);
    const recent = await col.find({ createdAt: { $gte: since } }).toArray();
    const dup = recent.find(b => phoneKey(b.phone) === phoneKey(clean.phone) && (b.serviceId || '') === clean.serviceId);
    if (dup) return { ok: true, id: String(dup._id), reference: dup.reference, duplicate: true };

    const id = new ObjectId();
    const reference = `AG-${now.getUTCFullYear()}-${id.toString().slice(-6).toUpperCase()}`;
    const doc = {
        _id: id, reference, ...clean,
        status: 'new', // new -> contacted -> confirmed -> completed -> cancelled
        source: capStr(source, 100) || 'website',
        attribution: {
            utmSource: capStr(attribution.utmSource, 100),
            utmMedium: capStr(attribution.utmMedium, 100),
            utmCampaign: capStr(attribution.utmCampaign, 150),
            landingPath: capStr(attribution.landingPath, 500),
            referrerHost: capStr(attribution.referrerHost, 200),
        },
        // Consent to be contacted: the Free Kundli form asks explicitly; the booking form is itself a request to be
        // contacted. Kept so we know what the person agreed to and under which privacy-policy version.
        consent: (consent && consent.contact === true) ? { contact: true, policyVersion: capStr(consent.policyVersion, 20), at: now } : null,
        createdAt: now,
    };
    await col.insertOne(doc);

    // Awaited, not fire-and-forget: on serverless an unawaited promise can be killed once the handler returns.
    await notify(adminNotification(doc, reference));
    if (doc.email) await mail(customerConfirmation(doc, reference));
    return { ok: true, id: String(id), reference, duplicate: false };
}

module.exports = { createBookingEnquiry, validateBookingInput, adminNotification, customerConfirmation, DUPLICATE_WINDOW_MS };
