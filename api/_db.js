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

// Simple CORS + method helper shared by all API routes.
function withCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
}

module.exports = { getDb, withCors };
