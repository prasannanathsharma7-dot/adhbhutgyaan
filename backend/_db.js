// Shared MongoDB connection helper for Vercel Serverless Functions.
// Reuses the connection across warm invocations (recommended pattern for serverless + MongoDB).

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'astrokashi';

if (!uri) {
    // Don't throw at import time (would crash the whole function bundle on cold start
    // before we can return a clean error response) - we check again inside getDb().
    console.warn('MONGODB_URI is not set. API routes that need the database will fail until it is configured in Vercel > Project > Settings > Environment Variables.');
}

let cachedClient = null;
let cachedDb = null;

async function getDb() {
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set.');
    }
    if (cachedDb) {
        return cachedDb;
    }
    if (!cachedClient) {
        cachedClient = new MongoClient(uri, {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 8000,
        });
    }
    await cachedClient.connect();
    cachedDb = cachedClient.db(dbName);
    return cachedDb;
}

// CORS: only our own site can call these APIs from browser JS. Server-to-server /
// curl requests have no Origin header and are unaffected. NOTE: we deliberately do
// NOT allow "*.vercel.app" - anyone can register a project on that domain, so a
// wildcard would let an attacker's page call these APIs from a visitor's browser.
// The site calls /api/* same-origin through the Vercel rewrite, so previews work
// without CORS; to allow a specific extra origin (e.g. one preview URL) set
// EXTRA_ALLOWED_ORIGINS="https://a.vercel.app,https://b.vercel.app" in the backend env.
const ALLOWED_ORIGINS = [
    'https://www.adhbhutgyaan.com',
    'https://adhbhutgyaan.com',
    'http://localhost:5173', // local dev
    ...(process.env.EXTRA_ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
];

function withCors(req, res) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    }
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
}

// Trim + hard-cap a string field so nobody can flood the database with huge payloads.
function capStr(value, maxLen) {
    return (value || '').toString().trim().slice(0, maxLen);
}

// Shared server-side validation - the actual security boundary, since
// frontend validation can always be bypassed by calling the API directly.
// Fixes a real bug: multiple lead-capture endpoints (bookings.js,
// contact.js, muhurat-booking.js) only checked `!name || !phone` (a
// presence check), which let a 19-digit garbage string like
// "8454070784548989494" or a name like "gsff"/"vsndbnz" straight into
// the database even after the equivalent frontend forms were fixed to
// reject them - anything hitting the API directly, or any request sent
// before the frontend fix was deployed, still got through.
function isValidIndianPhone(phone) {
    const digits = (phone || '').toString().replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(digits);
}

// International-friendly phone check (the site serves NRIs, so an Indian-only
// rule silently blocks them). Accepts either:
//  - an Indian mobile: 10 digits starting 6-9, optionally written with +91 / 91 / 0 prefix, or
//  - an international number written with an explicit "+" or "00" prefix: 8-15 digits (E.164),
//    first digit of the country code 1-9.
// A bare 11-19 digit string with no "+"/"00" is still rejected (that is the spam
// pattern the original check was written to stop).
function isValidPhone(phone) {
    const raw = (phone || '').toString().trim();
    if (!raw) return false;
    const hasIntlPrefix = /^(\+|00)/.test(raw);
    const digits = raw.replace(/\D/g, '');
    if (hasIntlPrefix) {
        const national = raw.startsWith('00') ? digits.slice(2) : digits;
        if (/^91[6-9]\d{9}$/.test(national)) return true;          // +91 Indian mobile
        return /^[1-9]\d{7,14}$/.test(national) && !/^91/.test(national);
    }
    if (/^[6-9]\d{9}$/.test(digits)) return true;                   // plain 10-digit Indian mobile
    if (/^0[6-9]\d{9}$/.test(digits)) return true;                  // 0-prefixed Indian mobile
    return false;
}
function isValidName(name) {
    const trimmed = (name || '').toString().trim();
    return trimmed.length >= 3 && /^[A-Za-z\u0900-\u097F\s.]+$/.test(trimmed);
}

// Escapes text before it's interpolated into an HTML email body. Without this,
// a form submission containing e.g. <a href="...">click here</a> in the name
// or message field would render as a real, clickable link in the notification
// email sent to the admin/customer - usable for phishing. Plain-text fields
// (Mongo docs, WhatsApp text, JSON responses) don't need this; only HTML does.
function escapeHtml(value) {
    return (value || '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Best-effort client IP (Vercel sets x-forwarded-for).
function getClientIp(req) {
    const fwd = req.headers['x-forwarded-for'];
    if (fwd) return fwd.split(',')[0].trim();
    return req.socket?.remoteAddress || 'unknown';
}

// Simple IP + route rate limit backed by Mongo (works across serverless cold starts,
// unlike an in-memory counter). Returns true if the request is allowed.
let rateLimitIndexEnsured = false;

async function checkRateLimit(db, req, route, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
    const ip = getClientIp(req);
    const now = Date.now();
    const col = db.collection('rate_limits');

    // Self-cleaning: every rate-limit document gets a TTL expiry so this
    // collection can't grow unboundedly as new IPs hit any rate-limited
    // route over time. createIndex is idempotent (safe/cheap to call
    // repeatedly with the same spec), but still worth avoiding on every
    // single request - the in-memory flag persists for the life of this
    // warm container/process, so it only actually runs once per cold start.
    if (!rateLimitIndexEnsured) {
        try {
            await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        } catch (e) {
            console.error('rate_limits TTL index creation failed (continuing):', e.message);
        }
        rateLimitIndexEnsured = true;
    }

    // Fixed-window-bucket design: the window number itself is baked into
    // the document's _id (route:ip:bucketNumber), so each time-window
    // naturally gets its own document - no "read the current count, then
    // decide what to write" step is needed at all. This makes the whole
    // check-and-increment a SINGLE atomic findOneAndUpdate ($inc + upsert),
    // which MongoDB guarantees is race-free even under concurrent requests.
    // The previous implementation split this into a separate findOne
    // (read) followed by a conditional updateOne (write) - two genuinely
    // concurrent requests from the same IP (e.g. a double-clicked submit,
    // or a few parallel requests) could both read the same pre-increment
    // count, both see it under the limit, and both then increment,
    // letting more requests through than the configured limit actually
    // allows. Bucketing removes the race entirely rather than trying to
    // narrow the window it occurs in.
    const bucket = Math.floor(now / windowMs);
    const _id = `${route}:${ip}:${bucket}`;
    // Generous safety margin over any realistic windowMs, so the document
    // outlives its own bucket (needed for the count to still be readable
    // right up until it naturally expires) without lingering long after
    // it's no longer useful.
    const expiresAt = new Date(now + Math.max(windowMs * 2, 3600000));

    const result = await col.findOneAndUpdate(
        { _id },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
        { upsert: true, returnDocument: 'after' }
    );
    const count = result?.value ? result.value.count : result?.count;
    return count <= limit;
}

module.exports = { getDb, withCors, capStr, escapeHtml, checkRateLimit, getClientIp, isValidIndianPhone, isValidPhone, isValidName };
