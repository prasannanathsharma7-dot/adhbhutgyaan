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

// CORS: only our own site (and Vercel preview deployments) can call these APIs from
// browser JS. Server-to-server / curl requests have no Origin header and are unaffected.
const ALLOWED_ORIGINS = [
    'https://www.adhbhutgyaan.com',
    'https://adhbhutgyaan.com',
    'http://localhost:5173', // local dev
];

function withCors(req, res) {
    const origin = req.headers.origin;
    if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app'))) {
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
async function checkRateLimit(db, req, route, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
    const ip = getClientIp(req);
    const _id = `${route}:${ip}`;
    const now = Date.now();
    const col = db.collection('rate_limits');

    const doc = await col.findOne({ _id });
    if (!doc || now - doc.windowStart > windowMs) {
        await col.updateOne({ _id }, { $set: { windowStart: now, count: 1 } }, { upsert: true });
        return true;
    }
    if (doc.count >= limit) {
        return false;
    }
    await col.updateOne({ _id }, { $inc: { count: 1 } });
    return true;
}

module.exports = { getDb, withCors, capStr, escapeHtml, checkRateLimit, getClientIp };
