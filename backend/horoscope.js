// Daily & Monthly Horoscope (Rashifal) by Rashi (zodiac sign)
// File: api/horoscope.js
//
// GET /api/horoscope?rashi=mesha&period=daily
//   period: 'daily' | 'monthly'
//   rashi: mesha, vrishabha, mithuna, karka, simha, kanya, tula, vrishchika, dhanu, makara, kumbha, meena
//
// Generated directly from REAL current sidereal planetary positions (see
// backend/utils/horoscope-generator.js) - not AI. This replaced an earlier
// Gemini-AI-based version after a real user-reported bug: every model in
// that version's fallback list had gone dead (see backend/_gemini.js's fix
// history), so every request silently failed and fell through to a single
// generic fallback template - all 12 rashis looked the same. A
// Panchang/Gochar-based template has no such failure mode: it reads real
// ephemeris data directly, so there's no external API call that can go
// down, and the content is always grounded in this moment's actual
// planetary transits rather than being AI-invented text.
//
// Cached in MongoDB (collection: horoscopes) per rashi+period+date so the
// same content is served instantly to everyone else asking that day.

const { getDb, withCors, checkRateLimit } = require('./_db');
const { getSiderealLongitudes } = require('./utils/vedic-ephemeris');
const { RASHIS, buildPanchangHoroscope } = require('./utils/horoscope-generator');

function getDateKey(period) {
    const now = new Date();
    // Use IST calendar date so it flips at Indian midnight, not UTC midnight.
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const y = ist.getUTCFullYear();
    const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
    const d = String(ist.getUTCDate()).padStart(2, '0');
    return period === 'monthly' ? `${y}-${m}` : `${y}-${m}-${d}`;
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    const rashiId = (req.query.rashi || '').toString().trim().toLowerCase();
    const period = req.query.period === 'monthly' ? 'monthly' : 'daily';

    // No rashi given: return the list of all 12 (for building the picker UI).
    if (!rashiId) {
        res.status(200).json({ ok: true, rashis: RASHIS });
        return;
    }

    const rashi = RASHIS.find(r => r.id === rashiId);
    if (!rashi) {
        res.status(400).json({ ok: false, error: 'Unknown rashi. Use one of: ' + RASHIS.map(r => r.id).join(', ') });
        return;
    }

    const dateKey = getDateKey(period);
    const cacheId = `${rashiId}:${period}:${dateKey}`;

    try {
        const db = await getDb();

        // Generous limit (browsing multiple rashis/daily+monthly is normal),
        // but still stops scripted abuse from repeatedly hammering uncached
        // slots - generation is cheap now (no AI call), but the ephemeris
        // calculation and DB write still aren't free at high volume.
        const allowed = await checkRateLimit(db, req, 'horoscope', { limit: 30, windowMs: 10 * 60 * 1000 });
        if (!allowed) {
            res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
            return;
        }

        const col = db.collection('horoscopes');

        const cached = await col.findOne({ _id: cacheId });
        if (cached) {
            res.status(200).json({ ok: true, rashi, period, dateKey, text: cached.text, source: 'cache' });
            return;
        }

        const sid = getSiderealLongitudes(new Date());
        const text = buildPanchangHoroscope(rashi, period, sid, dateKey);
        const source = 'panchang';

        // Cache it (best-effort - if this fails, we still return the text this time).
        try {
            await col.updateOne(
                { _id: cacheId },
                { $set: { text, rashiId, period, dateKey, createdAt: new Date(), source } },
                { upsert: true }
            );
        } catch (cacheErr) {
            console.error('Horoscope cache write failed:', cacheErr.message);
        }

        res.status(200).json({ ok: true, rashi, period, dateKey, text, source });
    } catch (err) {
        console.error('Horoscope API error:', err);
        // Even the error path stays real-data-based: recomputing from the
        // ephemeris directly (no DB, no cache) rather than a canned string,
        // since the generator itself has no external dependency to fail.
        try {
            const sid = getSiderealLongitudes(new Date());
            const text = buildPanchangHoroscope(rashi, period, sid, dateKey);
            res.status(200).json({ ok: true, rashi, period, dateKey, text, source: 'panchang' });
        } catch (innerErr) {
            console.error('Horoscope generation error:', innerErr);
            res.status(500).json({ ok: false, error: 'Could not generate horoscope. Please try again shortly.' });
        }
    }
};
