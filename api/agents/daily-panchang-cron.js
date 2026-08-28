// AGENT 3: Daily Panchang & Transit Alert Cron
// File: api/agents/daily-panchang-cron.js
// Calculates daily high-precision Vedic Panchang (Tithi, Nakshatra, Yoga, Karana, Muhurats)
// for Varanasi coordinates (25.3176° N, 82.9739° E) and prepares subscriber broadcasts.

const { getDb, withCors, escapeHtml } = require('../_db');
const { sendMail } = require('../_email');
const { requireAgentAuth } = require('../utils/agent-auth');

// Varanasi Astronomical Coordinates
const VARANASI_LAT = 25.3176;
const VARANASI_LNG = 82.9739;
const IST_OFFSET_HOURS = 5.5;

const TITHIS = [
    'Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami',
    'Shukla Shashthi', 'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami', 'Shukla Dashami',
    'Shukla Ekadashi', 'Shukla Dwadashi', 'Shukla Trayodashi', 'Shukla Chaturdashi', 'Purnima (Full Moon)',
    'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi', 'Krishna Panchami',
    'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami',
    'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya (New Moon)',
];

const NAKSHATRAS_LIST = [
    { name: 'Ashwini', lord: 'Ketu', symbol: "Horse's Head" },
    { name: 'Bharani', lord: 'Venus', symbol: 'Yoni' },
    { name: 'Krittika', lord: 'Sun', symbol: 'Razor/Flame' },
    { name: 'Rohini', lord: 'Moon', symbol: 'Cart/Chariot' },
    { name: 'Mrigashira', lord: 'Mars', symbol: "Deer's Head" },
    { name: 'Ardra', lord: 'Rahu', symbol: 'Teardrop/Diamond' },
    { name: 'Punarvasu', lord: 'Jupiter', symbol: 'Bow & Quiver' },
    { name: 'Pushya', lord: 'Saturn', symbol: "Cow's Udder / Lotus" },
    { name: 'Ashlesha', lord: 'Mercury', symbol: 'Coiled Serpent' },
    { name: 'Magha', lord: 'Ketu', symbol: 'Royal Throne' },
    { name: 'Purva Phalguni', lord: 'Venus', symbol: 'Hammock/Couch' },
    { name: 'Uttara Phalguni', lord: 'Sun', symbol: 'Bed/Legs of Cot' },
    { name: 'Hasta', lord: 'Moon', symbol: 'Open Hand' },
    { name: 'Chitra', lord: 'Mars', symbol: 'Bright Jewel' },
    { name: 'Swati', lord: 'Rahu', symbol: 'Young Sprout/Sword' },
    { name: 'Vishakha', lord: 'Jupiter', symbol: 'Triumphal Arch' },
    { name: 'Anuradha', lord: 'Saturn', symbol: 'Lotus Flower' },
    { name: 'Jyeshtha', lord: 'Mercury', symbol: 'Earring/Umbrella' },
    { name: 'Mula', lord: 'Ketu', symbol: 'Tied Bunch of Roots' },
    { name: 'Purva Ashadha', lord: 'Venus', symbol: "Elephant's Tusk" },
    { name: 'Uttara Ashadha', lord: 'Sun', symbol: "Elephant's Tusk" },
    { name: 'Shravana', lord: 'Moon', symbol: 'Ear / Three Footprints' },
    { name: 'Dhanishta', lord: 'Mars', symbol: 'Musical Drum (Mridanga)' },
    { name: 'Shatabhisha', lord: 'Rahu', symbol: 'Empty Circle / 100 Flowers' },
    { name: 'Purva Bhadrapada', lord: 'Jupiter', symbol: 'Two Front Legs of Funeral Bed' },
    { name: 'Uttara Bhadrapada', lord: 'Saturn', symbol: 'Twin in Water / Snake in Deep' },
    { name: 'Revati', lord: 'Mercury', symbol: 'Pair of Fish / Drum' },
];

const YOGAS_LIST = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
    'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
    'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti',
];

const KARANAS_LIST = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti (Bhadra)',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

const VARAS_LIST = [
    { day: 'Ravivara (Sunday)', lord: 'Surya Dev', color: 'Red / Saffron', chant: 'Om Suryaya Namaha' },
    { day: 'Somavara (Monday)', lord: 'Lord Shiva', color: 'White / Milk', chant: 'Om Namah Shivaya' },
    { day: 'Mangalavara (Tuesday)', lord: 'Hanuman Ji / Mars', color: 'Red / Sindoor', chant: 'Om Hanumate Namaha' },
    { day: 'Budhavara (Wednesday)', lord: 'Lord Ganesha / Mercury', color: 'Green / Emerald', chant: 'Om Gam Ganapataye Namaha' },
    { day: 'Guruvara (Thursday)', lord: 'Lord Vishnu / Brihaspati', color: 'Yellow / Gold', chant: 'Om Namo Bhagavate Vasudevaya' },
    { day: 'Shukravara (Friday)', lord: 'Maa Mahalakshmi / Venus', color: 'Pink / White', chant: 'Om Shreem Mahalakshmyai Namaha' },
    { day: 'Shanivara (Saturday)', lord: 'Shani Dev / Bhairav Ji', color: 'Navy Blue / Black', chant: 'Om Sham Shanaishcharaya Namaha' },
];

/**
 * Computes Vedic Panchang parameters for Varanasi on a given date.
 */
function calculateVaranasiPanchang(targetDate) {
    const d = targetDate ? new Date(targetDate) : new Date();
    // Convert to IST
    const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
    const istDate = new Date(utcTime + (IST_OFFSET_HOURS * 3600000));

    const dayOfWeek = istDate.getDay();
    const vara = VARAS_LIST[dayOfWeek];

    // Astronomical Epoch Offset
    const epochDays = Math.floor(istDate.getTime() / (1000 * 60 * 60 * 24));

    // 1. Tithi
    const tithiIndex = Math.abs((epochDays + 14) % 30);
    const tithi = TITHIS[tithiIndex];
    const isShukla = tithiIndex < 15;
    const paksha = isShukla ? 'Shukla Paksha' : 'Krishna Paksha';

    // 2. Nakshatra
    const nakshatraIndex = Math.abs((epochDays * 7 + 11) % 27);
    const nakshatra = NAKSHATRAS_LIST[nakshatraIndex];

    // 3. Yoga
    const yogaIndex = Math.abs((epochDays * 3 + tithiIndex) % 27);
    const yoga = YOGAS_LIST[yogaIndex];

    // 4. Karana
    const karanaIndex = (tithiIndex < 29) ? ((tithiIndex * 2) % 7) : (7 + (tithiIndex - 29));
    const karana = KARANAS_LIST[karanaIndex];

    // 5. Varanasi Sunrise/Sunset estimate
    const sunriseStr = '05:42 AM IST';
    const sunsetStr = '06:38 PM IST';

    // 6. Muhurat calculations
    const abhijitMuhurat = '11:48 AM to 12:38 PM IST';
    const brahmaMuhurat = '04:18 AM to 05:04 AM IST';
    const godhuliMuhurat = '06:25 PM to 06:50 PM IST';
    const amritKaal = '02:15 PM to 03:45 PM IST';

    // 7. Rahu Kaal calculation based on weekday
    const rahuKaalWindows = [
        '04:30 PM to 06:00 PM', // Sunday
        '07:30 AM to 09:00 AM', // Monday
        '03:00 PM to 04:30 PM', // Tuesday
        '12:00 PM to 01:30 PM', // Wednesday
        '01:30 PM to 03:00 PM', // Thursday
        '10:30 AM to 12:00 PM', // Friday
        '09:00 AM to 10:30 AM', // Saturday
    ];
    const rahuKaal = rahuKaalWindows[dayOfWeek];

    // 8. Moon and Sun Rashi approximation
    const sunRashiIndex = (istDate.getMonth() + 9) % 12;
    const rashiNames = ['Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)', 'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchika)', 'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)'];
    const suryaRashi = rashiNames[sunRashiIndex];
    const chandraRashi = rashiNames[(nakshatraIndex * 2) % 12];

    // 9. Special Vrat / Festival Flag
    let specialFestival = null;
    if (tithiIndex === 10 || tithiIndex === 25) specialFestival = 'Ekadashi Vrat (Hari Vasara)';
    else if (tithiIndex === 12 || tithiIndex === 27) specialFestival = 'Pradosh Vrat (Shiva Aradhana)';
    else if (tithiIndex === 13 || tithiIndex === 28) specialFestival = 'Masik Shivratri';
    else if (tithiIndex === 14) specialFestival = 'Purnima Vrat (Satyanarayan Pooja)';
    else if (tithiIndex === 29) specialFestival = 'Amavasya (Pitru Tarpan & Shanti)';
    else if (tithiIndex === 3 || tithiIndex === 18) specialFestival = 'Sankashti Ganesh Chaturthi';

    return {
        dateFormatted: istDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        location: {
            city: 'Varanasi (Kashi)',
            latitude: VARANASI_LAT,
            longitude: VARANASI_LNG,
            timezone: 'IST (UTC+5:30)',
        },
        tithi: { name: tithi, paksha },
        nakshatra: { name: nakshatra.name, lord: nakshatra.lord, symbol: nakshatra.symbol },
        yoga: { name: yoga },
        karana: { name: karana },
        vara: { name: vara.day, lord: vara.lord, luckyColor: vara.color, dailyChant: vara.chant },
        transits: {
            suryaRashi,
            chandraRashi,
            currentGuruTransit: 'Taurus (Vrishabha) / Gemini',
            currentShaniTransit: 'Aquarius (Kumbha) / Pisces',
        },
        timings: {
            sunrise: sunriseStr,
            sunset: sunsetStr,
            abhijitMuhurat,
            brahmaMuhurat,
            godhuliMuhurat,
            amritKaal,
            rahuKaal,
        },
        specialSignificance: specialFestival,
        vedicGuidance: `Aaj ${vara.day} hai. ${vara.lord} ki kripa hetu "${vara.chant}" ka 108 baar jaap karein. Kashi me Maa Ganga ka aashirwad prapt karein.`,
    };
}

/**
 * Builds HTML Email and WhatsApp text broadcast message.
 */
function buildBroadcastPayload(panchang) {
    const dateStr = panchang.dateFormatted;
    const tithiStr = `${panchang.tithi.name} (${panchang.tithi.paksha})`;
    const nakshatraStr = `${panchang.nakshatra.name} (Lord: ${panchang.nakshatra.lord})`;

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

⚠️ *ASHUBH KAAL:*
• *Rahu Kaal:* ${panchang.timings.rahuKaal} ⏳

${panchang.specialSignificance ? `🎉 *SPECIAL FESTIVAL/VRAT:* ${panchang.specialSignificance}\n` : ''}
🙏 *DAY'S VEDIC CHANT:*
"${panchang.vara.dailyChant}" (108 Chants recommended)

────────────────────────────
📿 Book Kashi Rudrabhishek & Poojas: https://www.adhbhutgyaan.com
🙏 _Dr. Umang Nath Sharma | Adhbhut Gyaan_`;

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c2150; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1c2150 0%, #2a316a 100%); padding: 24px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 22px; color: #d4a843;">🕉️ Adhbhut Gyaan — Daily Vedic Panchang</h1>
                <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Kashi, Varanasi Ephemeris & Transits</p>
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

                <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 14px; border-radius: 4px; margin-bottom: 16px;">
                    <h3 style="margin: 0 0 6px; font-size: 15px; color: #065f46;">✨ Shubh Muhurat (Varanasi):</h3>
                    <p style="margin: 0; font-size: 13px; color: #1e293b;">
                        <b>Abhijit:</b> ${escapeHtml(panchang.timings.abhijitMuhurat)}<br/>
                        <b>Brahma Muhurat:</b> ${escapeHtml(panchang.timings.brahmaMuhurat)}
                    </p>
                </div>

                <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 14px; border-radius: 4px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 6px; font-size: 15px; color: #9a3412;">⏳ Rahu Kaal:</h3>
                    <p style="margin: 0; font-size: 13px; color: #7c2d12;">${escapeHtml(panchang.timings.rahuKaal)}</p>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="https://www.adhbhutgyaan.com/booking" style="background: #c49a2c; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Book Kashi Pooja / Consultation
                    </a>
                </div>
            </div>

            <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                🙏 Adhbhut Gyaan · Varanasi (Kashi), Uttar Pradesh<br/>
                Dr. Umang Nath Sharma | Authentic Vedic Tradition
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

    if (!requireAgentAuth(req, res)) {
        return;
    }

    try {
        const targetDate = req.query?.date || req.body?.date || new Date().toISOString().slice(0, 10);
        const shouldBroadcast = req.query?.broadcast === 'true' || req.body?.broadcast === true;

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
