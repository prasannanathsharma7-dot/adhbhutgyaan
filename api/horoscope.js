// Daily & Monthly Horoscope (Rashifal) by Rashi (zodiac sign)
// File: api/horoscope.js
//
// GET /api/horoscope?rashi=mesha&period=daily
//   period: 'daily' | 'monthly'
//   rashi: mesha, vrishabha, mithuna, karka, simha, kanya, tula, vrishchika, dhanu, makara, kumbha, meena
//
// Generates the horoscope text once per rashi per day (or per month), via
// Gemini, and caches it in MongoDB (collection: horoscopes) so the same
// content is served instantly to everyone else asking that day - keeps AI
// cost low and responses fast.

const { getDb, withCors } = require('./_db');
const { callGemini } = require('./_gemini');

const RASHIS = [
    { id: 'mesha', name: 'मेष', nameEn: 'Aries', lord: 'Mars', symbol: '♈' },
    { id: 'vrishabha', name: 'वृषभ', nameEn: 'Taurus', lord: 'Venus', symbol: '♉' },
    { id: 'mithuna', name: 'मिथुन', nameEn: 'Gemini', lord: 'Mercury', symbol: '♊' },
    { id: 'karka', name: 'कर्क', nameEn: 'Cancer', lord: 'Moon', symbol: '♋' },
    { id: 'simha', name: 'सिंह', nameEn: 'Leo', lord: 'Sun', symbol: '♌' },
    { id: 'kanya', name: 'कन्या', nameEn: 'Virgo', lord: 'Mercury', symbol: '♍' },
    { id: 'tula', name: 'तुला', nameEn: 'Libra', lord: 'Venus', symbol: '♎' },
    { id: 'vrishchika', name: 'वृश्चिक', nameEn: 'Scorpio', lord: 'Mars', symbol: '♏' },
    { id: 'dhanu', name: 'धनु', nameEn: 'Sagittarius', lord: 'Jupiter', symbol: '♐' },
    { id: 'makara', name: 'मकर', nameEn: 'Capricorn', lord: 'Saturn', symbol: '♑' },
    { id: 'kumbha', name: 'कुंभ', nameEn: 'Aquarius', lord: 'Saturn', symbol: '♒' },
    { id: 'meena', name: 'मीन', nameEn: 'Pisces', lord: 'Jupiter', symbol: '♓' },
];

function getDateKey(period) {
    const now = new Date();
    // Use IST calendar date so it flips at Indian midnight, not UTC midnight.
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const y = ist.getUTCFullYear();
    const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
    const d = String(ist.getUTCDate()).padStart(2, '0');
    return period === 'monthly' ? `${y}-${m}` : `${y}-${m}-${d}`;
}

function buildPrompt(rashi, period) {
    const scope = period === 'monthly' ? 'this month' : 'today';
    return `Write a ${period} Vedic horoscope (Rashifal) for ${rashi.nameEn} (${rashi.name}) rashi, ruled by ${rashi.lord}, for ${scope}.
Cover: career/work, money, relationships/family, and health - 1 short paragraph each (2-3 sentences).
End with one lucky color and one lucky number for ${scope}.
Keep it positive, practical, and specific - avoid vague filler like "things will improve". Write in Hindi with some common English words mixed in naturally (Hinglish), the way an Indian astrologer would talk to a client. Do not add any greeting or sign-off, just the horoscope content itself.`;
}

function fallbackText(rashi, period) {
    const scope = period === 'monthly' ? 'is mahine' : 'aaj';
    return `${rashi.name} (${rashi.nameEn}) rashi ke liye ${scope} grah-gochar shubh sanket de rahe hain. Career mein dhairya rakhein, dhan-labh ke yog bann rahe hain. Paarivarik jeevan mein samjhauta rakhein. Swasthya ka dhyan rakhein, halka vyayam labhkari rahega. Shubh Rang: Peela | Shubh Ank: ${rashi.id.length + 1}\n\n(Yeh ek samanya margdarshan hai. Apni sateek janam-kundli ke anusaar vishleshan ke liye Dr. Umang Nath Sharma se sampark karein.)`;
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
        const col = db.collection('horoscopes');

        const cached = await col.findOne({ _id: cacheId });
        if (cached) {
            res.status(200).json({ ok: true, rashi, period, dateKey, text: cached.text, source: 'cache' });
            return;
        }

        let text;
        let source;
        try {
            const messages = [{ role: 'user', content: buildPrompt(rashi, period) }];
            text = await callGemini(messages, process.env.GEMINI_API_KEY, `${period} horoscope for ${rashi.nameEn}`);
            source = 'ai';
        } catch (aiErr) {
            console.error('Horoscope AI generation failed, using fallback:', aiErr.message);
            text = fallbackText(rashi, period);
            source = 'fallback';
        }

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
        res.status(200).json({ ok: true, rashi, period, dateKey, text: fallbackText(rashi, period), source: 'fallback' });
    }
};
