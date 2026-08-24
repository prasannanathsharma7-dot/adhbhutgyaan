// Email notifications via Gmail SMTP (nodemailer). Uses the business's existing
// Gmail account - no extra paid service needed. Requires two env vars in Vercel:
//   GMAIL_USER          -> astrokashi369@gmail.com (or whichever Gmail sends these)
//   GMAIL_APP_PASSWORD  -> a 16-character App Password (NOT the normal Gmail password)
//
// How to get an App Password:
//   1. On the Gmail account, turn on 2-Step Verification (Google Account > Security).
//   2. Go to https://myaccount.google.com/apppasswords
//   3. Create an app password (name it e.g. "Adhbhut Gyaan Website"), copy the 16-char code.
//   4. Add it to Vercel > Project > Settings > Environment Variables as GMAIL_APP_PASSWORD.

const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return null; // not configured yet - callers should no-op gracefully
    }
    if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }
    return cachedTransporter;
}

// Fire-and-forget send: never throws, so a broken/missing email config can
// never break a booking/contact/review submission. Errors are only logged.
async function sendMail({ to, subject, html }) {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.warn('Email not sent (GMAIL_USER / GMAIL_APP_PASSWORD not set):', subject);
            return false;
        }
        await transporter.sendMail({
            from: `"Adhbhut Gyaan" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (err) {
        console.error('Email send failed:', err.message);
        return false;
    }
}

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_USER || 'astrokashi369@gmail.com';

module.exports = { sendMail, ADMIN_EMAIL };
