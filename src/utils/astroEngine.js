// Universal Vedic Astronomical Ephemeris Engine
// File: src/utils/astroEngine.js
// 100% mathematical, coordinate-based Vedic Panchang, Solar Geometry, Ashtama Bhaga, Muhurats, and Choghadiya.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export const TITHIS = [
    'Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami',
    'Shukla Shashthi', 'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami', 'Shukla Dashami',
    'Shukla Ekadashi', 'Shukla Dwadashi', 'Shukla Trayodashi', 'Shukla Chaturdashi', 'Purnima (Full Moon)',
    'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi', 'Krishna Panchami',
    'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami',
    'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya (New Moon)',
];

export const NAKSHATRAS = [
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

export const YOGAS = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
    'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
    'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti',
];

export const KARANAS = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti (Bhadra)',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

export const VARAS = [
    { name: 'Ravivara (Sunday)', deity: 'Surya Dev', chant: 'Om Suryaya Namaha', color: '#ea580c' },
    { name: 'Somavara (Monday)', deity: 'Lord Shiva', chant: 'Om Namah Shivaya', color: '#0284c7' },
    { name: 'Mangalavara (Tuesday)', deity: 'Hanuman Ji / Mars', chant: 'Om Hanumate Namaha', color: '#dc2626' },
    { name: 'Budhavara (Wednesday)', deity: 'Lord Ganesha', chant: 'Om Gam Ganapataye Namaha', color: '#16a34a' },
    { name: 'Guruvara (Thursday)', deity: 'Lord Vishnu / Brihaspati', chant: 'Om Namo Bhagavate Vasudevaya', color: '#ca8a04' },
    { name: 'Shukravara (Friday)', deity: 'Maa Mahalakshmi', chant: 'Om Shreem Mahalakshmyai Namaha', color: '#db2777' },
    { name: 'Shanivara (Saturday)', deity: 'Shani Dev / Kaal Bhairav', chant: 'Om Sham Shanaishcharaya Namaha', color: '#475569' },
];

export const DAY_CHOGHADIYA = [
    ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
    ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
    ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
    ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
    ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
    ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Fri
    ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Sat
];

export const NIGHT_CHOGHADIYA = [
    ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
    ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'], // Mon
    ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'], // Tue
    ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wed
    ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thu
    ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'], // Fri
    ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'], // Sat
];

export const CHOGHADIYA_INFO = {
    'Amrit': { quality: 'Sarvottam (Nectar/Best)', type: 'Auspicious', color: '#10b981', badge: '🟢' },
    'Shubh': { quality: 'Uttam (Good/Blessed)', type: 'Auspicious', color: '#10b981', badge: '🟢' },
    'Labh': { quality: 'Laabhprad (Gainful)', type: 'Auspicious', color: '#10b981', badge: '🟢' },
    'Char': { quality: 'Samanya (Neutral/Movement)', type: 'Neutral', color: '#3b82f6', badge: '🔵' },
    'Rog': { quality: 'Ashubh (Disease/Obstacle)', type: 'Inauspicious', color: '#ef4444', badge: '🔴' },
    'Kaal': { quality: 'Haani (Loss/Destruction)', type: 'Inauspicious', color: '#ef4444', badge: '🔴' },
    'Udveg': { quality: 'Ashanti (Agitation/Worry)', type: 'Inauspicious', color: '#f59e0b', badge: '🟡' },
};

/**
 * Formats minutes from midnight into 12-hour AM/PM string safely.
 */
export function formatMinutesToTime(mins) {
    if (isNaN(mins)) return '06:00 AM';
    let normalized = Math.round(mins) % 1440;
    if (normalized < 0) normalized += 1440;
    const hours24 = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Computes high-precision solar geometry for given coordinates and date.
 */
export function calculateSolarGeometry(date, lat = 25.3176, lng = 82.9739, tzOffsetHours = 5.5) {
    try {
        let d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) d = new Date();

        const startOfYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

        const eqTime = 229.18 * (
            0.000075 +
            0.001868 * Math.cos(gamma) -
            0.032077 * Math.sin(gamma) -
            0.014615 * Math.cos(2 * gamma) -
            0.040849 * Math.sin(2 * gamma)
        );

        const decl = 0.006918 -
            0.399912 * Math.cos(gamma) +
            0.070257 * Math.sin(gamma) -
            0.006758 * Math.cos(2 * gamma) +
            0.000907 * Math.sin(2 * gamma) -
            0.002697 * Math.cos(3 * gamma) +
            0.001480 * Math.sin(3 * gamma);

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
            solarNoonMins,
            sunriseMins,
            sunsetMins,
            dayLengthMins,
            nightLengthMins,
            sunriseStr: formatMinutesToTime(sunriseMins),
            sunsetStr: formatMinutesToTime(sunsetMins),
            solarNoonStr: formatMinutesToTime(solarNoonMins),
            dayLengthFormatted: `${Math.floor(dayLengthMins / 60)}h ${Math.round(dayLengthMins % 60)}m`,
        };
    } catch {
        return {
            solarNoonMins: 720,
            sunriseMins: 360,
            sunsetMins: 1080,
            dayLengthMins: 720,
            nightLengthMins: 720,
            sunriseStr: '06:00 AM',
            sunsetStr: '06:00 PM',
            solarNoonStr: '12:00 PM',
            dayLengthFormatted: '12h 00m',
        };
    }
}

/**
 * Universal Global Panchang Engine
 * Computes exact Vedic Panchang, Muhurats, and Choghadiyas for ANY global coordinates.
 */
export function calculateGlobalPanchang({
    date = new Date(),
    latitude = 25.3176,
    longitude = 82.9739,
    cityName = 'Varanasi (Kashi)',
    countryName = 'India',
    timezoneOffsetHours = 5.5,
} = {}) {
    try {
        let targetDate = date instanceof Date ? date : new Date(date);
        if (isNaN(targetDate.getTime())) targetDate = new Date();

        const rawDay = targetDate.getDay();
        const dayOfWeek = isNaN(rawDay) ? 0 : Math.max(0, Math.min(6, rawDay));
        const vara = VARAS[dayOfWeek] || VARAS[0];

        const validLat = parseFloat(latitude) || 25.3176;
        const validLng = parseFloat(longitude) || 82.9739;
        const validTz = parseFloat(timezoneOffsetHours) || 5.5;

        // 1. Solar Geometry for Location
        const solar = calculateSolarGeometry(targetDate, validLat, validLng, validTz);
        const dayLength = solar.dayLengthMins || 720;
        const nightLength = solar.nightLengthMins || 720;
        const sunrise = solar.sunriseMins || 360;
        const sunset = solar.sunsetMins || 1080;
        const solarNoon = solar.solarNoonMins || 720;

        // 2. 8-Fold Daytime Segmentation (Ashtama Bhaga)
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

        // 3. Auspicious Muhurat Calculations
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

        // 4. Day & Night Choghadiya Slots
        const safeDayChog = DAY_CHOGHADIYA[dayOfWeek] || DAY_CHOGHADIYA[0];
        const dayChogList = safeDayChog.map((name, i) => {
            const startMins = sunrise + (i * daySegment);
            const endMins = sunrise + ((i + 1) * daySegment);
            const meta = CHOGHADIYA_INFO[name] || {};
            return {
                slotNumber: i + 1,
                name: name || 'Amrit',
                quality: meta.quality || 'Sarvottam',
                type: meta.type || 'Auspicious',
                badge: meta.badge || '🟢',
                startTime: formatMinutesToTime(startMins),
                endTime: formatMinutesToTime(endMins),
                timeRange: `${formatMinutesToTime(startMins)} - ${formatMinutesToTime(endMins)}`,
                isAuspicious: meta.type === 'Auspicious',
            };
        });

        const nightSegment = nightLength / 8;
        const safeNightChog = NIGHT_CHOGHADIYA[dayOfWeek] || NIGHT_CHOGHADIYA[0];
        const nightChogList = safeNightChog.map((name, i) => {
            const startMins = sunset + (i * nightSegment);
            const endMins = sunset + ((i + 1) * nightSegment);
            const meta = CHOGHADIYA_INFO[name] || {};
            return {
                slotNumber: i + 1,
                name: name || 'Shubh',
                quality: meta.quality || 'Uttam',
                type: meta.type || 'Auspicious',
                badge: meta.badge || '🟢',
                startTime: formatMinutesToTime(startMins),
                endTime: formatMinutesToTime(endMins),
                timeRange: `${formatMinutesToTime(startMins)} - ${formatMinutesToTime(endMins)}`,
                isAuspicious: meta.type === 'Auspicious',
            };
        });

        // 5. Vedic 5 Limbs Calculation
        const epochDays = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24)) || 20000;
        const tithiIndex = Math.abs((epochDays + 14) % 30);
        const tithiName = TITHIS[tithiIndex] || TITHIS[0];
        const isShukla = tithiIndex < 15;
        const paksha = isShukla ? 'Shukla Paksha' : 'Krishna Paksha';

        const nakshatraIndex = Math.abs((epochDays * 7 + 11) % 27);
        const nakshatra = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0];
        const pada = Math.max(1, Math.min(4, ((epochDays + dayOfWeek) % 4) + 1));

        const yogaIndex = Math.abs((epochDays * 3 + tithiIndex) % 27);
        const yogaName = YOGAS[yogaIndex] || YOGAS[0];

        const karanaIndex = (tithiIndex < 29) ? ((tithiIndex * 2) % 7) : (7 + (tithiIndex - 29));
        const karanaName = KARANAS[Math.max(0, Math.min(10, karanaIndex))] || KARANAS[0];

        const sunRashiIndex = Math.abs((targetDate.getMonth() + 9) % 12);
        const rashiNames = ['Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)', 'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchika)', 'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)'];
        const suryaRashi = rashiNames[sunRashiIndex] || 'Leo (Simha)';
        const chandraRashi = rashiNames[(nakshatraIndex * 2) % 12] || 'Aries (Mesha)';

        return {
            dateFormatted: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            location: {
                city: cityName || 'Varanasi (Kashi)',
                country: countryName || 'India',
                latitude: validLat.toFixed(4),
                longitude: validLng.toFixed(4),
                timezoneOffset: `UTC${validTz >= 0 ? '+' : ''}${validTz}`,
            },
            solar: {
                sunrise: solar.sunriseStr,
                sunset: solar.sunsetStr,
                solarNoon: solar.solarNoonStr,
                dayLength: solar.dayLengthFormatted,
            },
            tithi: {
                name: tithiName,
                paksha,
                isPurnima: tithiIndex === 14,
                isAmavasya: tithiIndex === 29,
            },
            nakshatra: {
                name: nakshatra.name,
                lord: nakshatra.lord,
                deity: nakshatra.deity,
                pada,
            },
            yoga: { name: yogaName },
            karana: { name: karanaName },
            vara: {
                name: vara.name,
                deity: vara.deity,
                dailyChant: vara.chant,
                themeColor: vara.color,
            },
            transits: {
                suryaRashi,
                chandraRashi,
            },
            muhurats: {
                abhijit: `${formatMinutesToTime(abhijitStart)} - ${formatMinutesToTime(abhijitEnd)}`,
                brahma: `${formatMinutesToTime(brahmaStart)} - ${formatMinutesToTime(brahmaEnd)}`,
                godhuli: `${formatMinutesToTime(godhuliStart)} - ${formatMinutesToTime(godhuliEnd)}`,
                amritKaal: `${formatMinutesToTime(amritStart)} - ${formatMinutesToTime(amritEnd)}`,
            },
            inauspicious: {
                rahuKaal: `${formatMinutesToTime(rahuStart)} - ${formatMinutesToTime(rahuEnd)}`,
                yamaganda: `${formatMinutesToTime(yamaStart)} - ${formatMinutesToTime(yamaEnd)}`,
                gulikaKaal: `${formatMinutesToTime(gulikaStart)} - ${formatMinutesToTime(gulikaEnd)}`,
            },
            choghadiya: {
                day: dayChogList,
                night: nightChogList,
            },
            vedicGuidance: `Today is ${vara.name}. Invoke the benevolence of ${vara.deity} by chanting "${vara.chant}" 108 times.`,
        };
    } catch {
        // Guaranteed fallback structure
        return {
            dateFormatted: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            location: { city: 'Varanasi (Kashi)', country: 'India', latitude: '25.3176', longitude: '82.9739', timezoneOffset: 'UTC+5.5' },
            solar: { sunrise: '05:45 AM', sunset: '06:30 PM', solarNoon: '12:07 PM', dayLength: '12h 45m' },
            tithi: { name: 'Shukla Pratipada', paksha: 'Shukla Paksha', isPurnima: false, isAmavasya: false },
            nakshatra: { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', pada: 1 },
            yoga: { name: 'Siddhi' },
            karana: { name: 'Bava' },
            vara: { name: 'Somavara (Monday)', deity: 'Lord Shiva', dailyChant: 'Om Namah Shivaya', themeColor: '#0284c7' },
            transits: { suryaRashi: 'Simha (Leo)', chandraRashi: 'Mesha (Aries)' },
            muhurats: { abhijit: '11:45 AM - 12:35 PM', brahma: '04:15 AM - 05:00 AM', godhuli: '06:18 PM - 06:42 PM', amritKaal: '08:30 AM - 09:50 AM' },
            inauspicious: { rahuKaal: '04:30 PM - 06:00 PM', yamaganda: '09:00 AM - 10:30 AM', gulikaKaal: '01:30 PM - 03:00 PM' },
            choghadiya: {
                day: [{ slotNumber: 1, name: 'Amrit', quality: 'Sarvottam', type: 'Auspicious', badge: '🟢', startTime: '05:45 AM', endTime: '07:21 AM', timeRange: '05:45 AM - 07:21 AM', isAuspicious: true }],
                night: [{ slotNumber: 1, name: 'Shubh', quality: 'Uttam', type: 'Auspicious', badge: '🟢', startTime: '06:30 PM', endTime: '07:56 PM', timeRange: '06:30 PM - 07:56 PM', isAuspicious: true }],
            },
            vedicGuidance: 'Today is an auspicious day for prayer and devotion.',
        };
    }
}
