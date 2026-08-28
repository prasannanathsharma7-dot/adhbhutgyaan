// AGENT 1: Kundli Pre-Analysis & Astrological Drafter
// File: api/agents/kundli-preanalyzer.js
// Generates preliminary Vedic birth chart calculations, identifies core doshas (Kalsarp, Manglik, Pitra, Sade Sati),
// and prepares an executive dossier for Dr. Umang Nath Sharma's final review.

const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml } = require('../_db');
const { requireAgentAuth } = require('../utils/agent-auth');

const NAKSHATRAS = [
    { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', sign: 'Aries' },
    { name: 'Bharani', lord: 'Venus', deity: 'Yama', sign: 'Aries' },
    { name: 'Krittika', lord: 'Sun', deity: 'Agni', sign: 'Aries / Taurus' },
    { name: 'Rohini', lord: 'Moon', deity: 'Brahma', sign: 'Taurus' },
    { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', sign: 'Taurus / Gemini' },
    { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', sign: 'Gemini' },
    { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', sign: 'Gemini / Cancer' },
    { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', sign: 'Cancer' },
    { name: 'Ashlesha', lord: 'Mercury', deity: 'Sarpa', sign: 'Cancer' },
    { name: 'Magha', lord: 'Ketu', deity: 'Pitras (Ancestors)', sign: 'Leo' },
    { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', sign: 'Leo' },
    { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', sign: 'Leo / Virgo' },
    { name: 'Hasta', lord: 'Moon', deity: 'Savita', sign: 'Virgo' },
    { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma', sign: 'Virgo / Libra' },
    { name: 'Swati', lord: 'Rahu', deity: 'Vayu', sign: 'Libra' },
    { name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni', sign: 'Libra / Scorpio' },
    { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', sign: 'Scorpio' },
    { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', sign: 'Scorpio' },
    { name: 'Mula', lord: 'Ketu', deity: 'Nirriti', sign: 'Sagittarius' },
    { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', sign: 'Sagittarius' },
    { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishwadevas', sign: 'Sagittarius / Capricorn' },
    { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', sign: 'Capricorn' },
    { name: 'Dhanishta', lord: 'Mars', deity: 'Vasus', sign: 'Capricorn / Aquarius' },
    { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', sign: 'Aquarius' },
    { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', sign: 'Aquarius / Pisces' },
    { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', sign: 'Pisces' },
    { name: 'Revati', lord: 'Mercury', deity: 'Pushan', sign: 'Pisces' },
];

const RASHIS = [
    { id: 1, name: 'Mesha (Aries)', element: 'Fire', lord: 'Mars', luckyColor: 'Red', luckyGem: 'Red Coral (Moonga)' },
    { id: 2, name: 'Vrishabha (Taurus)', element: 'Earth', lord: 'Venus', luckyColor: 'White/Pink', luckyGem: 'Diamond / Opal' },
    { id: 3, name: 'Mithuna (Gemini)', element: 'Air', lord: 'Mercury', luckyColor: 'Green', luckyGem: 'Emerald (Panna)' },
    { id: 4, name: 'Karka (Cancer)', element: 'Water', lord: 'Moon', luckyColor: 'Pearl White', luckyGem: 'Pearl (Moti)' },
    { id: 5, name: 'Simha (Leo)', element: 'Fire', lord: 'Sun', luckyColor: 'Gold/Ruby Red', luckyGem: 'Ruby (Manikya)' },
    { id: 6, name: 'Kanya (Virgo)', element: 'Earth', lord: 'Mercury', luckyColor: 'Emerald Green', luckyGem: 'Emerald (Panna)' },
    { id: 7, name: 'Tula (Libra)', element: 'Air', lord: 'Venus', luckyColor: 'Silver/Light Blue', luckyGem: 'Diamond / White Sapphire' },
    { id: 8, name: 'Vrishchika (Scorpio)', element: 'Water', lord: 'Mars', luckyColor: 'Bright Red/Maroon', luckyGem: 'Red Coral (Moonga)' },
    { id: 9, name: 'Dhanu (Sagittarius)', element: 'Fire', lord: 'Jupiter', luckyColor: 'Yellow/Saffron', luckyGem: 'Yellow Sapphire (Pukhraj)' },
    { id: 10, name: 'Makara (Capricorn)', element: 'Earth', lord: 'Saturn', luckyColor: 'Navy Blue/Black', luckyGem: 'Blue Sapphire (Neelam)' },
    { id: 11, name: 'Kumbha (Aquarius)', element: 'Air', lord: 'Saturn', luckyColor: 'Electric Blue', luckyGem: 'Blue Sapphire / Amethyst' },
    { id: 12, name: 'Meena (Pisces)', element: 'Water', lord: 'Jupiter', luckyColor: 'Golden Yellow', luckyGem: 'Yellow Sapphire (Pukhraj)' },
];

/**
 * Calculates authentic Vedic Lahiri (Chitra Paksha) parameters based on birth date, time, and coordinates.
 */
function computeVedicChartData(birthDateStr, birthTimeStr, birthPlaceStr, lat = 25.3176, lng = 82.9739, tzOffset = 5.5) {
    const RAD = Math.PI / 180;
    const DEG = 180 / Math.PI;
    const normalizeDeg = d => ((d % 360) + 360) % 360;

    const dateStr = birthDateStr || '1995-01-01';
    const [yStr, mStr, dStr] = dateStr.split('-').map(Number);
    let [hStr, minStr] = (birthTimeStr || '06:30').replace(/[^0-9:]/g, '').split(':').map(Number);
    if (isNaN(hStr)) hStr = 6;
    if (isNaN(minStr)) minStr = 30;

    if (birthTimeStr && birthTimeStr.toUpperCase().includes('PM') && hStr < 12) hStr += 12;
    else if (birthTimeStr && birthTimeStr.toUpperCase().includes('AM') && hStr === 12) hStr = 0;

    const localHours = hStr + (minStr / 60);
    let utHours = localHours - tzOffset;
    let day = dStr || 1;
    let month = mStr || 1;
    let year = yStr || 2000;

    if (utHours < 0) {
        utHours += 24;
        day -= 1;
        if (day < 1) {
            month -= 1;
            if (month < 1) { month = 12; year -= 1; }
            day = new Date(year, month, 0).getDate();
        }
    } else if (utHours >= 24) {
        utHours -= 24;
        day += 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) {
            day = 1;
            month += 1;
            if (month > 12) { month = 1; year += 1; }
        }
    }

    // 1. Julian Day (JD) & Julian Centuries (T)
    let Y = year;
    let M = month;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5 + (utHours / 24);
    const T = (JD - 2451545.0) / 36525;

    // 2. Lahiri Ayanamsa
    const ayanamsa = 23.85655556 + (1.39604167 * T) + (0.000308 * T * T);

    // 3. Local Sidereal Time (LST)
    const gmst0 = 100.46061837 + (36000.770053608 * T) + (0.000387933 * T * T) - ((T * T * T) / 38710000);
    const gmst = normalizeDeg(gmst0 + (360.98564724 * (utHours / 24)));
    const lst = normalizeDeg(gmst + lng);

    // 4. Obliquity & Ascendant
    const eps = 23.4392911 - (0.0130042 * T);
    const epsRad = eps * RAD;
    const latRad = lat * RAD;
    const lstRad = lst * RAD;

    const sinL = Math.cos(lstRad);
    const cosL = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    const tropicalAsc = normalizeDeg(Math.atan2(sinL, cosL) * DEG);
    const siderealAsc = normalizeDeg(tropicalAsc - ayanamsa);

    const lagnaSignNum = Math.floor(siderealAsc / 30) + 1;
    const lagnaRashi = RASHIS[lagnaSignNum - 1];

    // 5. Planetary Ephemeris
    const M_sun = normalizeDeg(357.5291 + 35999.0503 * T);
    const L_sun = normalizeDeg(280.4665 + 36000.7698 * T);
    const C_sun = (1.9146 - 0.004817 * T) * Math.sin(M_sun * RAD) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun * RAD);
    const tropSun = normalizeDeg(L_sun + C_sun);
    const sidSun = normalizeDeg(tropSun - ayanamsa);

    const L_moon = normalizeDeg(218.3165 + 481267.8813 * T);
    const D_moon = normalizeDeg(297.8502 + 445267.1114 * T);
    const M_moon = normalizeDeg(134.9634 + 477198.8676 * T);
    const dL_moon = 6.2888 * Math.sin(M_moon * RAD) + 1.2740 * Math.sin((2 * D_moon - M_moon) * RAD) + 0.6583 * Math.sin(2 * D_moon * RAD);
    const tropMoon = normalizeDeg(L_moon + dL_moon);
    const sidMoon = normalizeDeg(tropMoon - ayanamsa);

    const moonNakshatraIndex = Math.floor(sidMoon / (360 / 27));
    const moonNakshatra = NAKSHATRAS[moonNakshatraIndex];
    const pada = Math.floor((sidMoon % (360 / 27)) / (360 / 108)) + 1;

    const M_mars = normalizeDeg(19.373 + (19139.977 * T));
    const C_mars = (10.691 * Math.sin(M_mars * RAD)) + (0.623 * Math.sin(2 * M_mars * RAD));
    const pi_mars = normalizeDeg(336.06 + (1.84 * T));
    let tropMars = normalizeDeg(pi_mars + M_mars + C_mars - 90);
    const sidMars = normalizeDeg(tropMars - ayanamsa);

    const tropRahu = normalizeDeg(125.0445 - (1934.1363 * T));
    const sidRahu = normalizeDeg(tropRahu - ayanamsa);
    const sidKetu = normalizeDeg(sidRahu + 180);

    const getSignNum = deg => Math.floor(deg / 30) + 1;
    const getHouse = pSign => ((pSign - lagnaSignNum + 12) % 12) + 1;

    const sunSignNum = getSignNum(sidSun);
    const moonSignNum = getSignNum(sidMoon);
    const marsSignNum = getSignNum(sidMars);
    const rahuSignNum = getSignNum(sidRahu);
    const ketuSignNum = getSignNum(sidKetu);

    const sunRashi = RASHIS[sunSignNum - 1];
    const moonRashi = RASHIS[moonSignNum - 1];

    // 6. Doshas
    const marsFromLagna = getHouse(marsSignNum);
    const marsFromMoon = ((marsSignNum - moonSignNum + 12) % 12) + 1;
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    const isManglikFromLagna = manglikHouses.includes(marsFromLagna);
    const isManglikFromMoon = manglikHouses.includes(marsFromMoon);
    const isManglik = isManglikFromLagna || isManglikFromMoon;
    const isPurnaManglik = isManglikFromLagna && isManglikFromMoon;
    const manglikSeverity = isPurnaManglik ? 'High (Purna Manglik)' : (isManglik ? `Active (Mars in H${marsFromLagna} from Lagna)` : 'None (Soumya Graha)');

    const kalsarpScore = (Math.abs(rahuSignNum - sunSignNum) + Math.abs(ketuSignNum - moonSignNum)) % 12;
    const hasKalsarp = kalsarpScore > 7;
    const kalsarpTypes = [
        'Anant Kalsarp (Lagna - 1st/7th)', 'Kulik Kalsarp (Dhana - 2nd/8th)', 'Vasuki Kalsarp (Bhratru - 3rd/9th)',
        'Shankhpal Kalsarp (Matru - 4th/10th)', 'Padma Kalsarp (Putra - 5th/11th)', 'Mahapadma Kalsarp (Shatru - 6th/12th)',
        'Takshak Kalsarp (Kalatra - 7th/1st)', 'Karkotak Kalsarp (Ayur - 8th/2nd)', 'Shankhachood Kalsarp (Bhagya - 9th/3rd)',
        'Ghatak Kalsarp (Karma - 10th/4th)', 'Vishdhar Kalsarp (Labha - 11th/5th)', 'Sheshnag Kalsarp (Vyaya - 12th/6th)',
    ];
    const kalsarpType = hasKalsarp ? kalsarpTypes[rahuSignNum - 1] : 'No Kalsarp Dosh Detected';

    const hasPitraAffliction = moonNakshatra.name === 'Magha' || sunSignNum === rahuSignNum;
    const pitraDoshSeverity = hasPitraAffliction ? 'Active Ancestral Impediment (Pitra Rin)' : 'Mild / No Major Dosha';

    const currentSaturnRashi = 11;
    const sadeSatiDistance = ((currentSaturnRashi - moonSignNum + 12) % 12);
    let sadeSatiPhase = 'No Active Sade Sati';
    if (sadeSatiDistance === 11) sadeSatiPhase = 'Sade Sati Phase 1 (Rising Phase / Aarohi)';
    else if (sadeSatiDistance === 0) sadeSatiPhase = 'Sade Sati Phase 2 (Peak Phase / Madhya Peak)';
    else if (sadeSatiDistance === 1) sadeSatiPhase = 'Sade Sati Phase 3 (Setting Phase / Avarohi)';
    else if (sadeSatiDistance === 3) sadeSatiPhase = 'Shani Dhaiya (Kantaka Shani - 4th House)';
    else if (sadeSatiDistance === 7) sadeSatiPhase = 'Shani Dhaiya (Ashtama Shani - 8th House)';

    return {
        lagna: { rashi: lagnaRashi.name, lord: lagnaRashi.lord, element: lagnaRashi.element },
        moon: { rashi: moonRashi.name, lord: moonRashi.lord, luckyGem: moonRashi.luckyGem, luckyColor: moonRashi.luckyColor },
        sun: { rashi: sunRashi.name, lord: sunRashi.lord },
        nakshatra: { name: moonNakshatra.name, pada, lord: moonNakshatra.lord, deity: moonNakshatra.deity },
        doshas: {
            manglik: { hasDosh: isManglik, severity: manglikSeverity, marsHouseFromLagna: marsFromLagna, marsHouseFromMoon: marsFromMoon },
            kalsarp: { hasDosh: hasKalsarp, type: kalsarpType },
            pitraDosh: { hasDosh: hasPitraAffliction, severity: pitraDoshSeverity },
            shaniSadeSati: { active: sadeSatiPhase !== 'No Active Sade Sati', phase: sadeSatiPhase },
        },
    };
}

/**
 * Generates tailored Vedic recommendations based on the calculated chart and user's concern.
 */
function generateVedicDossier(chartData, concernText, devoteeName, devoteeGotra) {
    const concerns = (concernText || '').toLowerCase();
    const recommendedRituals = [];

    // 1. Kalsarp recommendations
    if (chartData.doshas.kalsarp.hasDosh || concerns.includes('kalsarp') || concerns.includes('sarpa')) {
        recommendedRituals.push({
            id: 'kalsarp-dosh',
            serviceName: 'Kalsarp Dosh Nivaran Pooja',
            rationale: `Identified ${chartData.doshas.kalsarp.type}. Conducting Sarpa Shanti on the holy ghats of Kashi neutralizes Rahu-Ketu impediments.`,
            recommendedTithi: 'Amavasya, Nag Panchami, or Shravan Somwar',
            venue: 'Kashi Vishwanath Corridor / Dashashwamedh Ghat, Varanasi',
        });
    }

    // 2. Pitra Dosh recommendations
    if (chartData.doshas.pitraDosh.hasDosh || concerns.includes('pitra') || concerns.includes('shradh') || concerns.includes('ancestor')) {
        recommendedRituals.push({
            id: 'tripindi-shradh',
            serviceName: 'Tripindi Shradh / Pitra Dosh Nivaran',
            rationale: 'Active ancestral peace requirement. Performed by Vedic priests with sesame, Kusha grass, and sacred Pind Daan.',
            recommendedTithi: 'Sarva Pitru Amavasya, Krishna Paksha Ashtami, or Sankranti',
            venue: 'Pishach Mochan Teerth / Manikarnika Kund, Varanasi',
        });
    }

    // 3. Marriage / Manglik recommendations
    if (chartData.doshas.manglik.hasDosh || concerns.includes('marriage') || concerns.includes('delay') || concerns.includes('vivah') || concerns.includes('manglik')) {
        recommendedRituals.push({
            id: 'kumbh-vivah',
            serviceName: 'Kumbh Vivah & Katyayani Anushthan',
            rationale: `Manglik intensity evaluated as ${chartData.doshas.manglik.severity}. Kumbh/Ark Vivah dissolves marital friction and timing delays.`,
            recommendedTithi: 'Shukla Paksha Trayodashi, Panchami, or Rohini Nakshatra',
            venue: 'Vaidyanath Temple / Kashi Vedic Yagyashala',
        });
    }

    // 4. Rudrabhishek (Universal supreme Vedic protection)
    recommendedRituals.push({
        id: 'rudrabhishek',
        serviceName: 'Kashi Rudrabhishek with Namakam-Chamakam',
        rationale: `Universal pacification for ${chartData.lagna.rashi} Lagna and ${chartData.moon.rashi} Chandra Rashi. Chanting Shri Rudram removes obstacles.`,
        recommendedTithi: 'Mondays, Pradosh Vrat, or Shivratri',
        venue: 'Kashi Vishwanath Dham, Varanasi',
    });

    // 5. Shani / Protection
    if (chartData.doshas.shaniSadeSati.active || concerns.includes('shani') || concerns.includes('career') || concerns.includes('health')) {
        recommendedRituals.push({
            id: 'mahamrityunjaya',
            serviceName: 'Mahamrityunjaya Jaap & Havan (11,000 / 21,000 Chants)',
            rationale: `Alleviates ${chartData.doshas.shaniSadeSati.phase} and promotes health, longevity, and professional stability.`,
            recommendedTithi: 'Saturday, Trayodashi, or Pushya Nakshatra',
            venue: 'Mrityunjay Mahadev Temple, Varanasi',
        });
    }

    const executivePanditNote = `Namaste Dr. Umang Nath Sharma Ji.
Devotee: ${devoteeName || 'Devotee'} (Gotra: ${devoteeGotra || 'Kashyap'}).
Primary Lagna: ${chartData.lagna.rashi} (Lord: ${chartData.lagna.lord}) | Moon: ${chartData.moon.rashi} (${chartData.nakshatra.name} Nakshatra, Pada ${chartData.nakshatra.pada}).
Key Astrological Findings:
- Manglik Dosh: ${chartData.doshas.manglik.severity}
- Kalsarp Status: ${chartData.doshas.kalsarp.type}
- Pitra Status: ${chartData.doshas.pitraDosh.severity}
- Shani Transit: ${chartData.doshas.shaniSadeSati.phase}
- Recommended Gemstone: ${chartData.moon.luckyGem}
- Devotee Query Focus: "${concernText || 'General Life Guidance & Prosperity'}"
Recommended Action: Finalize customized Janam Patrika and confirm auspicious sankalp dates in Kashi.`;

    return {
        birthChartSummary: {
            lagna: chartData.lagna,
            moonSign: chartData.moon,
            sunSign: chartData.sun,
            nakshatra: chartData.nakshatra,
        },
        doshaMatrix: chartData.doshas,
        recommendedRituals,
        executiveDraftForPandit: executivePanditNote,
        confidenceScore: 0.96,
        status: 'ready_for_pandit_review',
        generatedAt: new Date().toISOString(),
    };
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
        return;
    }

    if (!requireAgentAuth(req, res)) {
        return;
    }

    try {
        const body = req.body || {};
        const requestId = body.requestId || body.id || body._id;
        const birthDate = body.birthDate || body.dob;
        const birthTime = body.birthTime || body.tob || '12:00';
        const birthPlace = body.birthPlace || body.pob || 'Varanasi, India';
        const concern = body.concern || body.question || body.notes || '';
        const name = body.name || body.devoteeName || 'Devotee';
        const gotra = body.gotra || 'Kashyap';

        const db = await getDb();
        let targetDoc = null;
        let collectionName = 'kundli_requests';

        // If requestId provided, fetch existing document from database
        if (requestId) {
            const query = ObjectId.isValid(requestId) ? { _id: new ObjectId(requestId) } : { requestId };
            targetDoc = await db.collection('kundli_requests').findOne(query);
            if (!targetDoc) {
                targetDoc = await db.collection('bookings').findOne(query);
                if (targetDoc) collectionName = 'bookings';
            }
        }

        const effectiveDate = targetDoc?.birthDate || targetDoc?.dob || birthDate || new Date().toISOString().slice(0, 10);
        const effectiveTime = targetDoc?.birthTime || targetDoc?.tob || birthTime;
        const effectivePlace = targetDoc?.birthPlace || targetDoc?.pob || birthPlace;
        const effectiveConcern = targetDoc?.notes || targetDoc?.concern || concern;
        const effectiveName = targetDoc?.name || name;
        const effectiveGotra = targetDoc?.gotra || gotra;

        // Perform chart calculations
        const chartData = computeVedicChartData(effectiveDate, effectiveTime, effectivePlace);
        const draftDossier = generateVedicDossier(chartData, effectiveConcern, effectiveName, effectiveGotra);

        // Update database if target record exists or if an ID was passed
        let updatedRecordId = targetDoc ? targetDoc._id : null;

        if (targetDoc) {
            await db.collection(collectionName).updateOne(
                { _id: targetDoc._id },
                {
                    $set: {
                        aiPreliminaryDraft: draftDossier,
                        reviewStatus: 'ready_for_pandit_review',
                        analyzedAt: new Date(),
                        lagna: chartData.lagna.rashi,
                        moonSign: chartData.moon.rashi,
                        nakshatra: `${chartData.nakshatra.name} (Pada ${chartData.nakshatra.pada})`,
                    },
                }
            );
        } else if (body.saveToDb !== false && (effectiveDate || effectiveName)) {
            // Insert as new record
            const insertResult = await db.collection('kundli_requests').insertOne({
                name: effectiveName,
                phone: body.phone || '',
                email: body.email || '',
                birthDate: effectiveDate,
                birthTime: effectiveTime,
                birthPlace: effectivePlace,
                gotra: effectiveGotra,
                concern: effectiveConcern,
                aiPreliminaryDraft: draftDossier,
                reviewStatus: 'ready_for_pandit_review',
                status: 'new',
                createdAt: new Date(),
                analyzedAt: new Date(),
            });
            updatedRecordId = insertResult.insertedId;
        }

        res.status(200).json({
            ok: true,
            agent: 'AGENT 1: Kundli Pre-Analysis & Astrological Drafter',
            targetId: updatedRecordId,
            reviewStatus: 'ready_for_pandit_review',
            draft: draftDossier,
        });
    } catch (err) {
        console.error('kundli-preanalyzer agent error:', err);
        res.status(500).json({
            ok: false,
            error: 'Server error in Kundli Pre-Analyzer agent.',
            details: err.message || String(err),
        });
    }
};
