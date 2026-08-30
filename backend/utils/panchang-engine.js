// Universal Vedic Astronomical Ephemeris Engine (backend / CommonJS)
// Ported from src/utils/astroEngine.js so backend agents (e.g. the daily
// Panchang broadcast cron) compute the exact same real, coordinate-based
// Panchang the live website shows - not a separate, less accurate formula.
// Keep both in sync if the calculation logic ever changes.

const { getSiderealLongitudes } = require('./vedic-ephemeris');

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const TITHIS = [
    'Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami',
    'Shukla Shashthi', 'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami', 'Shukla Dashami',
    'Shukla Ekadashi', 'Shukla Dwadashi', 'Shukla Trayodashi', 'Shukla Chaturdashi', 'Purnima (Full Moon)',
    'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi', 'Krishna Panchami',
    'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami',
    'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya (New Moon)',
];

const NAKSHATRAS = [
    { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras' },
    { name: 'Bharani', lord: 'Venus', deity: 'Yama' },
    { name: 'Krittika', lord: 'Sun', deity: 'Agni' },
    { name: 'Rohini', lord: 'Moon', deity: 'Brahma' },
    { name: 'Mrigashira', lord: 'Mars', deity: 'Soma' },
    { name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
    { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi' },
    { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati' },
    { name: 'Ashlesha', lord: 'Mercury', deity: 'Sarpa' },
    { name: 'Magha', lord: 'Ketu', deity: 'Pitras' },
    { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga' },
    { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman' },
    { name: 'Hasta', lord: 'Moon', deity: 'Savita' },
    { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma' },
    { name: 'Swati', lord: 'Rahu', deity: 'Vayu' },
    { name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni' },
    { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra' },
    { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra' },
    { name: 'Mula', lord: 'Ketu', deity: 'Nirriti' },
    { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas' },
    { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishwadevas' },
    { name: 'Shravana', lord: 'Moon', deity: 'Vishnu' },
    { name: 'Dhanishta', lord: 'Mars', deity: 'Vasus' },
    { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
    { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada' },
    { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya' },
    { name: 'Revati', lord: 'Mercury', deity: 'Pushan' },
];

const YOGAS = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
    'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
    'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti',
];

const KARANAS = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti (Bhadra)',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

const VARAS = [
    { name: 'Ravivara (Sunday)', deity: 'Surya Dev', chant: 'Om Suryaya Namaha', color: '#ea580c' },
    { name: 'Somavara (Monday)', deity: 'Lord Shiva', chant: 'Om Namah Shivaya', color: '#0284c7' },
    { name: 'Mangalavara (Tuesday)', deity: 'Hanuman Ji / Mars', chant: 'Om Hanumate Namaha', color: '#dc2626' },
    { name: 'Budhavara (Wednesday)', deity: 'Lord Ganesha', chant: 'Om Gam Ganapataye Namaha', color: '#16a34a' },
    { name: 'Guruvara (Thursday)', deity: 'Lord Vishnu / Brihaspati', chant: 'Om Namo Bhagavate Vasudevaya', color: '#ca8a04' },
    { name: 'Shukravara (Friday)', deity: 'Maa Mahalakshmi', chant: 'Om Shreem Mahalakshmyai Namaha', color: '#db2777' },
    { name: 'Shanivara (Saturday)', deity: 'Shani Dev / Kaal Bhairav', chant: 'Om Sham Shanaishcharaya Namaha', color: '#475569' },
];

const DAY_CHOGHADIYA = [
    ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
    ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
    ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
    ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
    ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
    ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
    ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],
];

const NIGHT_CHOGHADIYA = [
    ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
    ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],
    ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],
    ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],
    ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],
    ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],
    ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],
];

const CHOGHADIYA_INFO = {
    Amrit: { quality: 'Sarvottam (Nectar/Best)', type: 'Auspicious', badge: '🟢' },
    Shubh: { quality: 'Uttam (Good/Blessed)', type: 'Auspicious', badge: '🟢' },
    Labh: { quality: 'Laabhprad (Gainful)', type: 'Auspicious', badge: '🟢' },
    Char: { quality: 'Samanya (Neutral/Movement)', type: 'Neutral', badge: '🔵' },
    Rog: { quality: 'Ashubh (Disease/Obstacle)', type: 'Inauspicious', badge: '🔴' },
    Kaal: { quality: 'Haani (Loss/Destruction)', type: 'Inauspicious', badge: '🔴' },
    Udveg: { quality: 'Ashanti (Agitation/Worry)', type: 'Inauspicious', badge: '🟡' },
};

function formatMinutesToTime(mins) {
    if (isNaN(mins)) return '06:00 AM';
    let normalized = Math.round(mins) % 1440;
    if (normalized < 0) normalized += 1440;
    const hours24 = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function calculateSolarGeometry(date, lat = 25.3176, lng = 82.9739, tzOffsetHours = 5.5) {
    try {
        let d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) d = new Date();

        const startOfYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

        const eqTime = 229.18 * (
            0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
            - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma)
        );
        const decl = 0.006918
            - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
            - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
            - 0.002697 * Math.cos(3 * gamma) + 0.001480 * Math.sin(3 * gamma);

        const zenith = 90.833 * RAD;
        const latRad = (parseFloat(lat) || 25.3176) * RAD;
        const validLng = parseFloat(lng) || 82.9739;
        const validTz = parseFloat(tzOffsetHours) || 5.5;

        const cosHA = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
        const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
        const haDeg = Math.acos(clampedCosHA) * DEG;

        const solarNoonMins = 720 - (4 * validLng) - eqTime + (validTz * 60);
        const sunriseMins = solarNoonMins - (4 * haDeg);
        const sunsetMins = solarNoonMins + (4 * haDeg);
        const dayLengthMins = Math.max(60, sunsetMins - sunriseMins);
        const nightLengthMins = 1440 - dayLengthMins;

        return {
            solarNoonMins, sunriseMins, sunsetMins, dayLengthMins, nightLengthMins,
            sunriseStr: formatMinutesToTime(sunriseMins),
            sunsetStr: formatMinutesToTime(sunsetMins),
            solarNoonStr: formatMinutesToTime(solarNoonMins),
            dayLengthFormatted: `${Math.floor(dayLengthMins / 60)}h ${Math.round(dayLengthMins % 60)}m`,
        };
    } catch {
        return {
            solarNoonMins: 720, sunriseMins: 360, sunsetMins: 1080, dayLengthMins: 720, nightLengthMins: 720,
            sunriseStr: '06:00 AM', sunsetStr: '06:00 PM', solarNoonStr: '12:00 PM', dayLengthFormatted: '12h 00m',
        };
    }
}

function calculateGlobalPanchang({
    date = new Date(),
    latitude = 25.3176,
    longitude = 82.9739,
    cityName = 'Varanasi (Kashi)',
    countryName = 'India',
    timezoneOffsetHours = 5.5,
} = {}) {
    let targetDate = date instanceof Date ? date : new Date(date);
    if (isNaN(targetDate.getTime())) targetDate = new Date();

    const rawDay = targetDate.getDay();
    const dayOfWeek = isNaN(rawDay) ? 0 : Math.max(0, Math.min(6, rawDay));
    const vara = VARAS[dayOfWeek] || VARAS[0];

    const validLat = parseFloat(latitude) || 25.3176;
    const validLng = parseFloat(longitude) || 82.9739;
    const validTz = parseFloat(timezoneOffsetHours) || 5.5;

    const solar = calculateSolarGeometry(targetDate, validLat, validLng, validTz);
    const dayLength = solar.dayLengthMins || 720;
    const nightLength = solar.nightLengthMins || 720;
    const sunrise = solar.sunriseMins || 360;
    const sunset = solar.sunsetMins || 1080;
    const solarNoon = solar.solarNoonMins || 720;
    const daySegment = dayLength / 8;

    const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
    const rahuPart = rahuSegments[dayOfWeek] || 8;
    const rahuStart = sunrise + (rahuPart - 1) * daySegment;
    const rahuEnd = sunrise + rahuPart * daySegment;

    const yamaSegments = [5, 4, 3, 2, 1, 7, 6];
    const yamaPart = yamaSegments[dayOfWeek] || 5;
    const yamaStart = sunrise + (yamaPart - 1) * daySegment;
    const yamaEnd = sunrise + yamaPart * daySegment;

    const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];
    const gulikaPart = gulikaSegments[dayOfWeek] || 7;
    const gulikaStart = sunrise + (gulikaPart - 1) * daySegment;
    const gulikaEnd = sunrise + gulikaPart * daySegment;

    const abhijitHalf = dayLength / 30;
    const abhijitStart = solarNoon - abhijitHalf;
    const abhijitEnd = solarNoon + abhijitHalf;

    const brahmaHalf = nightLength / 15;
    const brahmaStart = sunrise - (2 * brahmaHalf);
    const brahmaEnd = sunrise - brahmaHalf;

    const godhuliStart = sunset - 12;
    const godhuliEnd = sunset + 12;

    const amritStart = sunrise + (dayLength * 0.35);
    const amritEnd = amritStart + (dayLength / 15);

    const safeDayChog = DAY_CHOGHADIYA[dayOfWeek] || DAY_CHOGHADIYA[0];
    const dayChogList = safeDayChog.map((name, i) => {
        const startMins = sunrise + (i * daySegment);
        const endMins = sunrise + ((i + 1) * daySegment);
        const meta = CHOGHADIYA_INFO[name] || {};
        return {
            slotNumber: i + 1, name: name || 'Amrit', quality: meta.quality || 'Sarvottam',
            type: meta.type || 'Auspicious', badge: meta.badge || '🟢',
            timeRange: `${formatMinutesToTime(startMins)} - ${formatMinutesToTime(endMins)}`,
            isAuspicious: meta.type === 'Auspicious',
        };
    });

    // 5 Limbs (Panchang) - real Sun/Moon sidereal (Lahiri) positions at local
    // noon, same formulas the live website's astroEngine.js uses.
    const localNoonUTC = new Date(Date.UTC(
        targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0
    ) - (validTz * 3600000));
    const sid = getSiderealLongitudes(localNoonUTC);

    const tithiDiff = ((sid.moon - sid.sun) % 360 + 360) % 360;
    const tithiIndex = Math.min(29, Math.floor(tithiDiff / 12));
    const tithiName = TITHIS[tithiIndex] || TITHIS[0];
    const isShukla = tithiIndex < 15;
    const paksha = isShukla ? 'Shukla Paksha' : 'Krishna Paksha';

    const nakshatraSpan = 360 / 27;
    const nakshatraIndex = Math.min(26, Math.floor(sid.moon / nakshatraSpan));
    const nakshatra = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0];

    const yogaSum = ((sid.sun + sid.moon) % 360 + 360) % 360;
    const yogaIndex = Math.min(26, Math.floor(yogaSum / nakshatraSpan));
    const yogaName = YOGAS[yogaIndex] || YOGAS[0];

    const halfTithi = Math.min(59, Math.floor(tithiDiff / 6));
    let karanaIdx;
    if (halfTithi === 0) karanaIdx = 10;
    else if (halfTithi >= 57) karanaIdx = 7 + (halfTithi - 57);
    else karanaIdx = (halfTithi - 1) % 7;
    const karanaName = KARANAS[karanaIdx] || KARANAS[0];

    const rashiNames = ['Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)', 'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchika)', 'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)'];
    const suryaRashi = rashiNames[Math.min(11, Math.floor(sid.sun / 30))] || rashiNames[0];
    const chandraRashi = rashiNames[Math.min(11, Math.floor(sid.moon / 30))] || rashiNames[0];

    let specialFestival = null;
    if (tithiIndex === 10 || tithiIndex === 25) specialFestival = 'Ekadashi Vrat (Hari Vasara)';
    else if (tithiIndex === 12 || tithiIndex === 27) specialFestival = 'Pradosh Vrat (Shiva Aradhana)';
    else if (tithiIndex === 13 || tithiIndex === 28) specialFestival = 'Masik Shivratri';
    else if (tithiIndex === 14) specialFestival = 'Purnima Vrat (Satyanarayan Pooja)';
    else if (tithiIndex === 29) specialFestival = 'Amavasya (Pitru Tarpan & Shanti)';

    return {
        dateFormatted: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        location: { city: cityName, country: countryName, latitude: validLat, longitude: validLng },
        tithi: { name: tithiName, paksha, isPurnima: tithiIndex === 14, isAmavasya: tithiIndex === 29 },
        nakshatra: { name: nakshatra.name, lord: nakshatra.lord, deity: nakshatra.deity },
        yoga: { name: yogaName },
        karana: { name: karanaName },
        vara: { name: vara.name, deity: vara.deity, dailyChant: vara.chant, themeColor: vara.color },
        transits: { suryaRashi, chandraRashi },
        timings: {
            sunrise: solar.sunriseStr,
            sunset: solar.sunsetStr,
            abhijitMuhurat: `${formatMinutesToTime(abhijitStart)} - ${formatMinutesToTime(abhijitEnd)}`,
            brahmaMuhurat: `${formatMinutesToTime(brahmaStart)} - ${formatMinutesToTime(brahmaEnd)}`,
            godhuliMuhurat: `${formatMinutesToTime(godhuliStart)} - ${formatMinutesToTime(godhuliEnd)}`,
            amritKaal: `${formatMinutesToTime(amritStart)} - ${formatMinutesToTime(amritEnd)}`,
            rahuKaal: `${formatMinutesToTime(rahuStart)} - ${formatMinutesToTime(rahuEnd)}`,
            yamaganda: `${formatMinutesToTime(yamaStart)} - ${formatMinutesToTime(yamaEnd)}`,
            gulikaKaal: `${formatMinutesToTime(gulikaStart)} - ${formatMinutesToTime(gulikaEnd)}`,
        },
        choghadiya: dayChogList.map(c => ({
            time: c.timeRange, name: c.name, quality: c.quality, isAuspicious: c.isAuspicious,
        })),
        specialSignificance: specialFestival,
        vedicGuidance: `Aaj ${vara.name} hai. ${vara.deity} ki kripa hetu "${vara.chant}" ka 108 baar jaap karein. Kashi me Maa Ganga ka aashirwad prapt karein.`,
    };
}

module.exports = { calculateGlobalPanchang, calculateSolarGeometry, formatMinutesToTime };
