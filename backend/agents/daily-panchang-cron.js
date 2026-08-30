// AGENT 3: Daily Panchang & Transit Alert Cron
// File: api/agents/daily-panchang-cron.js
// High-precision Vedic Panchang, Auspicious/Inauspicious Muhurats, Choghadiya & WhatsApp Formatter for Varanasi.

const { getDb, withCors, escapeHtml } = require('../_db');
const { sendMail } = require('../_email');
const { requireAgentAuth } = require('../utils/agent-auth');
const { calculateGlobalPanchang } = require('../utils/panchang-engine');

// Varanasi Astronomical Coordinates
const VARANASI_LAT = 25.3176;
const VARANASI_LNG = 82.9739;
const IST_OFFSET_HOURS = 5.5;

/**
 * Computes Vedic Panchang parameters for Varanasi on a given date, using the
 * same real, coordinate-based astronomical engine (backend/utils/panchang-engine.js,
 * ported from the live website's src/utils/astroEngine.js) that the public
 * /panchang page uses - not a separate approximation. This used to be a
 * self-contained formula here (epochDays%30-style Tithi/Nakshatra/Yoga, and
 * fixed sunrise/sunset/Muhurat/Rahu-Kaal time strings that never changed with
 * the date), which meant the daily broadcast email to subscribers could show
 * a different Tithi/Nakshatra than what the same day's live website page
 * displayed.
 */
function calculateVaranasiPanchang(targetDate) {
    return calculateGlobalPanchang({
        date: targetDate ? new Date(targetDate) : new Date(),
        latitude: VARANASI_LAT,
        longitude: VARANASI_LNG,
        cityName: 'Varanasi (Kashi)',
        countryName: 'India',
        timezoneOffsetHours: IST_OFFSET_HOURS,
    });
}

/**
 * Builds HTML Email and WhatsApp text broadcast message.
 */
function buildBroadcastPayload(panchang) {
    const dateStr = panchang.dateFormatted;
    const tithiStr = `${panchang.tithi.name} (${panchang.tithi.paksha})`;
    const nakshatraStr = `${panchang.nakshatra.name} (Lord: ${panchang.nakshatra.lord})`;

    const chogText = panchang.choghadiya
        .filter(c => c.isAuspicious)
        .map(c => `• *${c.name}* (${c.time}) — ${c.quality}`)
        .join('\n');

    const whatsappText = `🕉️ *ADBHUT GYAAN — DAINIK PANCHANG (KASHI)*
📅 *${dateStr}*
📍 _Varanasi (25.3176° N, 82.9739° E)_
────────────────────────────
📜 *TITHI:* ${tithiStr}
⭐ *NAKSHATRA:* ${nakshatraStr}
✨ *YOGA:* ${panchang.yoga.name} | *KARANA:* ${panchang.karana.name}
☀️ *SURYA RASHI:* ${panchang.transits.suryaRashi}
🌙 *CHANDRA RASHI:* ${panchang.transits.chandraRashi}

⏰ *SHUBH MUHURAT (VARANASI):*
• *Abhijit Muhurat:* ${panchang.timings.abhijitMuhurat} ✅
• *Brahma Muhurat:* ${panchang.timings.brahmaMuhurat} 🧘
• *Amrit Kaal:* ${panchang.timings.amritKaal} ✨

🌟 *SHUBH CHOGHADIYA SLOTS:*
${chogText}

⚠️ *ASHUBH KAAL (VARJIT):*
• *Rahu Kaal:* ${panchang.timings.rahuKaal} ⏳
• *Yamaganda:* ${panchang.timings.yamaganda}
• *Gulika Kaal:* ${panchang.timings.gulikaKaal}

${panchang.specialSignificance ? `🎉 *SPECIAL FESTIVAL/VRAT:* ${panchang.specialSignificance}\n` : ''}
🙏 *DAY'S VEDIC CHANT:*
"${panchang.vara.dailyChant}" (108 Chants recommended)

────────────────────────────
📿 Book Live WhatsApp Video Sankalp Pooja: https://www.adhbhutgyaan.com
🙏 _Dr. Umang Nath Sharma | Adhbhut Gyaan_`;

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c2150; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1c2150 0%, #2a316a 100%); padding: 24px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 22px; color: #d4a843;">🕉️ Adhbhut Gyaan — Daily Vedic Panchang</h1>
                <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Varanasi Astronomical Ephemeris & Transits</p>
                <div style="margin-top: 12px; font-weight: bold; background: rgba(255,255,255,0.1); display: inline-block; padding: 6px 16px; border-radius: 20px;">
                    ${escapeHtml(dateStr)}
                </div>
            </div>

            <div style="padding: 24px; background: #ffffff;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">📜 Tithi:</td>
                        <td style="padding: 10px 0; font-weight: bold; color: #0f172a; text-align: right;">${escapeHtml(tithiStr)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">⭐ Nakshatra:</td>
                        <td style="padding: 10px 0; font-weight: bold; color: #0f172a; text-align: right;">${escapeHtml(nakshatraStr)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">✨ Yoga & Karana:</td>
                        <td style="padding: 10px 0; font-weight: bold; color: #0f172a; text-align: right;">${escapeHtml(panchang.yoga.name)} / ${escapeHtml(panchang.karana.name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; font-weight: bold; color: #64748b;">☀️ Surya / Chandra Rashi:</td>
                        <td style="padding: 10px 0; font-weight: bold; color: #0f172a; text-align: right;">${escapeHtml(panchang.transits.suryaRashi)} / ${escapeHtml(panchang.transits.chandraRashi)}</td>
                    </tr>
                </table>

                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 4px; margin-bottom: 16px;">
                    <h3 style="margin: 0 0 6px; font-size: 15px; color: #065f46;">✨ Shubh Muhurat (Varanasi):</h3>
                    <p style="margin: 0; font-size: 13px; color: #1e293b;">
                        <b>Abhijit Muhurat:</b> ${escapeHtml(panchang.timings.abhijitMuhurat)}<br/>
                        <b>Brahma Muhurat:</b> ${escapeHtml(panchang.timings.brahmaMuhurat)}
                    </p>
                </div>

                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 4px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 6px; font-size: 15px; color: #991b1b;">⏳ Inauspicious Timings:</h3>
                    <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
                        <b>Rahu Kaal:</b> ${escapeHtml(panchang.timings.rahuKaal)}<br/>
                        <b>Yamaganda:</b> ${escapeHtml(panchang.timings.yamaganda)}
                    </p>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="https://www.adhbhutgyaan.com/booking" style="background: #c49a2c; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Book Live Video Call Pooja
                    </a>
                </div>
            </div>

            <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                🙏 Adhbhut Gyaan · Varanasi (Kashi), Uttar Pradesh<br/>
                Dr. Umang Nath Sharma | 400+ Years Vedic Lineage
            </div>
        </div>
    `;

    return { whatsappText, emailHtml };
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use GET or POST.' });
        return;
    }

    const shouldBroadcast = req.query?.broadcast === 'true' || req.body?.broadcast === true;

    // A plain GET (no broadcast) just computes and returns today's Panchang -
    // read-only, no secrets involved, the same data the public /panchang page
    // already computes client-side. Only gate the sensitive path: actually
    // emailing the full subscriber list (broadcast=true), or a POST trigger.
    if ((req.method === 'POST' || shouldBroadcast) && !requireAgentAuth(req, res)) {
        return;
    }

    try {
        const targetDate = req.query?.date || req.body?.date || new Date().toISOString().slice(0, 10);

        // 1. Calculate Varanasi Panchang
        const panchang = calculateVaranasiPanchang(targetDate);
        const broadcast = buildBroadcastPayload(panchang);

        const db = await getDb();

        // 2. Cache in daily_panchang collection
        await db.collection('daily_panchang').updateOne(
            { date: targetDate },
            {
                $set: {
                    date: targetDate,
                    panchang,
                    broadcast,
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );

        // 3. Query active subscribers
        const subscribers = await db.collection('subscribers').find({}).toArray().catch(() => []);
        let emailsDispatched = 0;

        if (shouldBroadcast && subscribers.length > 0) {
            for (const sub of subscribers.slice(0, 50)) { // Safety batch limit
                if (sub.email) {
                    try {
                        await sendMail({
                            to: sub.email,
                            subject: `🕉️ Dainik Panchang for ${panchang.dateFormatted} — Adhbhut Gyaan`,
                            html: broadcast.emailHtml,
                        });
                        emailsDispatched++;
                    } catch (mErr) {
                        console.error('Panchang broadcast email error:', mErr.message);
                    }
                }
            }
        }

        res.status(200).json({
            ok: true,
            agent: 'AGENT 3: Daily Panchang & Transit Alert Cron',
            date: targetDate,
            panchang,
            broadcastPayload: {
                whatsappText: broadcast.whatsappText,
            },
            subscribersCount: subscribers.length,
            emailsDispatched,
            savedToDb: true,
            calculatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('daily-panchang-cron agent error:', err);
        res.status(500).json({
            ok: false,
            error: 'Server error in Daily Panchang Cron agent.',
            details: err.message || String(err),
        });
    }
};
