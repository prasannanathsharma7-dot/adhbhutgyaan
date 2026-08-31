// Authentic Vedic Lahiri (Chitra Paksha) Astrological Ephemeris Engine
// File: src/utils/kundliEngine.js

import { getTropicalLongitudes } from './vedic-ephemeris.js';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export const RASHIS = [
    { id: 1, name: 'Mesha (Aries)', short: 'Mesha', lord: 'Mars', element: 'Fire', color: 'Red', gem: 'Red Coral (Moonga)', metal: 'Copper/Gold', luckyNum: '9' },
    { id: 2, name: 'Vrishabha (Taurus)', short: 'Vrishabha', lord: 'Venus', element: 'Earth', color: 'White/Cream', gem: 'Diamond / Opal', metal: 'Silver/Platinum', luckyNum: '6' },
    { id: 3, name: 'Mithuna (Gemini)', short: 'Mithuna', lord: 'Mercury', element: 'Air', color: 'Green', gem: 'Emerald (Panna)', metal: 'Bronze/Gold', luckyNum: '5' },
    { id: 4, name: 'Karka (Cancer)', short: 'Karka', lord: 'Moon', element: 'Water', color: 'Pearl White', gem: 'Pearl (Moti)', metal: 'Silver', luckyNum: '2' },
    { id: 5, name: 'Simha (Leo)', short: 'Simha', lord: 'Sun', element: 'Fire', color: 'Gold/Ruby Red', gem: 'Ruby (Manikya)', metal: 'Gold/Copper', luckyNum: '1' },
    { id: 6, name: 'Kanya (Virgo)', short: 'Kanya', lord: 'Mercury', element: 'Earth', color: 'Emerald Green', gem: 'Emerald (Panna)', metal: 'Bronze/Silver', luckyNum: '5' },
    { id: 7, name: 'Tula (Libra)', short: 'Tula', lord: 'Venus', element: 'Air', color: 'Silver/Light Blue', gem: 'Diamond / White Sapphire', metal: 'Silver/White Gold', luckyNum: '6' },
    { id: 8, name: 'Vrishchika (Scorpio)', short: 'Vrishchika', lord: 'Mars', element: 'Water', color: 'Deep Red/Maroon', gem: 'Red Coral (Moonga)', metal: 'Copper/Gold', luckyNum: '9' },
    { id: 9, name: 'Dhanu (Sagittarius)', short: 'Dhanu', lord: 'Jupiter', element: 'Fire', color: 'Yellow/Saffron', gem: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', luckyNum: '3' },
    { id: 10, name: 'Makara (Capricorn)', short: 'Makara', lord: 'Saturn', element: 'Earth', color: 'Navy Blue/Black', gem: 'Blue Sapphire (Neelam)', metal: 'Iron/Panchdhatu', luckyNum: '8' },
    { id: 11, name: 'Kumbha (Aquarius)', short: 'Kumbha', lord: 'Saturn', element: 'Air', color: 'Electric Blue', gem: 'Blue Sapphire / Amethyst', metal: 'Iron/Silver', luckyNum: '8' },
    { id: 12, name: 'Meena (Pisces)', short: 'Meena', lord: 'Jupiter', element: 'Water', color: 'Golden Yellow', gem: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', luckyNum: '3' },
];

export const NAKSHATRAS = [
    { name: 'Ashvini', lord: 'Ketu', deity: 'Ashvini Kumaras' },
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

function normalizeDeg(d) {
    let res = d % 360;
    if (res < 0) res += 360;
    return res;
}

function formatDegMin(deg) {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}'`;
}

function parseDateRobust(dateStr) {
    if (!dateStr) return { year: 2001, month: 8, day: 11 };
    const parts = dateStr.replace(/[^0-9\-\/]/g, '').split(/[\-\/]/).map(Number);
    if (parts.length === 3) {
        if (parts[0] > 1000) return { year: parts[0], month: parts[1] || 1, day: parts[2] || 1 };
        if (parts[2] > 1000) return { year: parts[2], month: parts[1] || 1, day: parts[0] || 1 };
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
    return { year: 2001, month: 8, day: 11 };
}

function parseTimeRobust(timeStr) {
    if (!timeStr) return { hours: 6, minutes: 30 };
    const match = timeStr.match(/(\d{1,2}):(\d{1,2})/);
    if (!match) return { hours: 6, minutes: 30 };
    
    let hours = parseInt(match[1], 10) || 0;
    let minutes = parseInt(match[2], 10) || 0;
    
    const isPM = /pm/i.test(timeStr);
    const isAM = /am/i.test(timeStr);
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    return { hours: Math.min(23, Math.max(0, hours)), minutes: Math.min(59, Math.max(0, minutes)) };
}

/**
 * Calculates complete authentic Vedic Lahiri Kundli parameters instantly and deterministically.
 */
export function calculateInstantKundli({ birthDate, birthTime, birthPlace, name, latitude = 25.3176, longitude = 82.9739, tzOffset = 5.5 }) {
    try {
        const { year, month, day } = parseDateRobust(birthDate);
        const { hours, minutes } = parseTimeRobust(birthTime);

        const localHours = hours + (minutes / 60);
        let utHours = localHours - tzOffset;
        let cDay = day;
        let cMonth = month;
        let cYear = year;

        if (utHours < 0) {
            utHours += 24;
            cDay -= 1;
            if (cDay < 1) {
                cMonth -= 1;
                if (cMonth < 1) { cMonth = 12; cYear -= 1; }
                cDay = new Date(cYear, cMonth, 0).getDate();
            }
        } else if (utHours >= 24) {
            utHours -= 24;
            cDay += 1;
            const daysInMonth = new Date(cYear, cMonth, 0).getDate();
            if (cDay > daysInMonth) {
                cDay = 1;
                cMonth += 1;
                if (cMonth > 12) { cMonth = 1; cYear += 1; }
            }
        }

        // 1. Julian Day (JD) & Julian Centuries (T) from J2000.0
        let Y = cYear;
        let M = cMonth;
        if (M <= 2) { Y -= 1; M += 12; }
        const A = Math.floor(Y / 100);
        const B = 2 - A + Math.floor(A / 4);
        const JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + cDay + B - 1524.5 + (utHours / 24);
        const T = (JD - 2451545.0) / 36525;

        // 2. Lahiri Ayanamsa (Chitra Paksha)
        const ayanamsa = 23.85655556 + (1.39604167 * T) + (0.000308 * T * T);

        // 3. Local Sidereal Time (LST)
        const gmst0 = 100.46061837 + (36000.770053608 * T) + (0.000387933 * T * T) - ((T * T * T) / 38710000);
        const gmst = normalizeDeg(gmst0 + (360.98564724 * (utHours / 24)));
        const lst = normalizeDeg(gmst + longitude);

        // 4. Obliquity & Ascendant
        const eps = 23.4392911 - (0.0130042 * T);
        const epsRad = eps * RAD;
        const latRad = latitude * RAD;
        const lstRad = lst * RAD;

        const sinL = Math.cos(lstRad);
        const cosL = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
        const tropicalAsc = normalizeDeg(Math.atan2(sinL, cosL) * DEG);
        const siderealAsc = normalizeDeg(tropicalAsc - ayanamsa);

        const lagnaSignNum = Math.floor(siderealAsc / 30) + 1; // 1 to 12
        const lagnaDegInSign = siderealAsc % 30;
        const lagnaRashi = RASHIS[(lagnaSignNum - 1 + 12) % 12] || RASHIS[0];

        // 5. True Planetary Ephemeris (Sidereal) — accurate tropical longitudes via
        // astronomy-engine (VSOP87/ELP2000-derived), then rotated to sidereal by
        // subtracting the Lahiri ayanamsa computed above.
        const utcDateObj = new Date(Date.UTC(cYear, cMonth - 1, cDay, Math.floor(utHours), Math.round((utHours % 1) * 60)));
        const trop = getTropicalLongitudes(utcDateObj);

        const tropSun = trop.sun;
        const sidSun = normalizeDeg(tropSun - ayanamsa);

        const tropMoon = trop.moon;
        const sidMoon = normalizeDeg(tropMoon - ayanamsa);

        // Moon Nakshatra & Pada
        const moonNakshatraIndex = Math.max(0, Math.min(26, Math.floor(sidMoon / (360 / 27))));
        const moonNakshatra = NAKSHATRAS[moonNakshatraIndex] || NAKSHATRAS[0];
        const pada = Math.max(1, Math.min(4, Math.floor((sidMoon % (360 / 27)) / (360 / 108)) + 1));

        const sidMars = normalizeDeg(trop.mars - ayanamsa);
        const sidMerc = normalizeDeg(trop.mercury - ayanamsa);
        const sidJup = normalizeDeg(trop.jupiter - ayanamsa);
        const sidVen = normalizeDeg(trop.venus - ayanamsa);
        const sidSat = normalizeDeg(trop.saturn - ayanamsa);

        // Rahu & Ketu (Mean Lunar Nodes)
        const tropRahu = normalizeDeg(125.0445 - (1934.1363 * T) + (0.002075 * T * T));
        const sidRahu = normalizeDeg(tropRahu - ayanamsa);
        const sidKetu = normalizeDeg(sidRahu + 180);

        // Helper functions
        const getSignNum = deg => Math.floor(deg / 30) + 1;
        const getHouse = (pSign) => ((pSign - lagnaSignNum + 12) % 12) + 1;

        const sunSignNum = getSignNum(sidSun);
        const moonSignNum = getSignNum(sidMoon);
        const marsSignNum = getSignNum(sidMars);
        const mercSignNum = getSignNum(sidMerc);
        const jupSignNum = getSignNum(sidJup);
        const venSignNum = getSignNum(sidVen);
        const satSignNum = getSignNum(sidSat);
        const rahuSignNum = getSignNum(sidRahu);
        const ketuSignNum = getSignNum(sidKetu);

        const moonRashi = RASHIS[(moonSignNum - 1 + 12) % 12] || RASHIS[0];

        const planets = [
            { name: 'Sun (Surya)', glyph: 'Su', rashi: RASHIS[(sunSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(sunSignNum), deg: formatDegMin(sidSun % 30), nature: 'Atmakaraka / Kruur', isBenefic: false },
            { name: 'Moon (Chandra)', glyph: 'Mo', rashi: RASHIS[(moonSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(moonSignNum), deg: formatDegMin(sidMoon % 30), nature: 'Manas / Soumya', isBenefic: true },
            { name: 'Mars (Mangal)', glyph: 'Ma', rashi: RASHIS[(marsSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(marsSignNum), deg: formatDegMin(sidMars % 30), nature: marsSignNum === 8 || marsSignNum === 1 ? 'Swakshetra (Own Sign)' : 'Tejas / Krura', isBenefic: false },
            { name: 'Mercury (Budh)', glyph: 'Me', rashi: RASHIS[(mercSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(mercSignNum), deg: formatDegMin(sidMerc % 30), nature: 'Buddhi / Subha', isBenefic: true },
            { name: 'Jupiter (Guru)', glyph: 'Ju', rashi: RASHIS[(jupSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(jupSignNum), deg: formatDegMin(sidJup % 30), nature: 'Param Subha / Gyan', isBenefic: true },
            { name: 'Venus (Shukra)', glyph: 'Ve', rashi: RASHIS[(venSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(venSignNum), deg: formatDegMin(sidVen % 30), nature: 'Daitya Guru / Subha', isBenefic: true },
            { name: 'Saturn (Shani)', glyph: 'Sa', rashi: RASHIS[(satSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(satSignNum), deg: formatDegMin(sidSat % 30), nature: 'Karmaphala / Manda', isBenefic: false },
            { name: 'Rahu (North Node)', glyph: 'Ra', rashi: RASHIS[(rahuSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(rahuSignNum), deg: formatDegMin(sidRahu % 30), nature: 'Chhaya / Tamas', isBenefic: false },
            { name: 'Ketu (South Node)', glyph: 'Ke', rashi: RASHIS[(ketuSignNum - 1 + 12) % 12] || RASHIS[0], house: getHouse(ketuSignNum), deg: formatDegMin(sidKetu % 30), nature: 'Mokshakaraka', isBenefic: false },
        ];

        // House Data Mapping for North Indian Chart (Houses 1-12)
        const houseData = {};
        for (let h = 1; h <= 12; h++) {
            const rashiId = ((lagnaSignNum + h - 2) % 12) + 1;
            const planetsInHouse = planets.filter(p => p.house === h).map(p => p.glyph);
            if (h === 1) planetsInHouse.unshift('Asc');
            houseData[h] = {
                houseNumber: h,
                rashiId,
                rashiName: RASHIS[rashiId - 1].short,
                planets: planetsInHouse,
            };
        }

        // 6. Dosha Calculations
        const marsFromLagna = getHouse(marsSignNum);
        const marsFromMoon = ((marsSignNum - moonSignNum + 12) % 12) + 1;
        const marsFromVenus = ((marsSignNum - venSignNum + 12) % 12) + 1;

        const manglikHouses = [1, 2, 4, 7, 8, 12];
        const isManglikFromLagna = manglikHouses.includes(marsFromLagna);
        const isManglikFromMoon = manglikHouses.includes(marsFromMoon);
        const isManglikFromVenus = manglikHouses.includes(marsFromVenus);
        const isManglik = isManglikFromLagna || isManglikFromMoon;
        const isPurnaManglik = isManglikFromLagna && isManglikFromMoon;

        let manglikSeverity = 'Manglik Dosha Absent (Soumya)';
        let manglikDetails = 'Mars is peacefully placed in non-manglik houses.';

        if (isPurnaManglik) {
            manglikSeverity = `Purna Manglik Dosh (H${marsFromLagna} from Lagna, H${marsFromMoon} from Moon)`;
            manglikDetails = `Active from both Lagna (House ${marsFromLagna}) and Moon (House ${marsFromMoon}).`;
        } else if (isManglikFromLagna) {
            manglikSeverity = `Lagna Manglik Dosh (Mars in H${marsFromLagna} from Lagna)`;
            manglikDetails = `Mars placed in House ${marsFromLagna} from Ascendant (Lagna).`;
        } else if (isManglikFromMoon) {
            manglikSeverity = `Chandra Manglik Dosh (Mars in H${marsFromMoon} from Moon)`;
            manglikDetails = `Mars placed in House ${marsFromMoon} from Natal Moon (Chandra Lagna).`;
        } else if (isManglikFromVenus) {
            manglikSeverity = `Shukra Manglik (Mars in H${marsFromVenus} from Venus)`;
            manglikDetails = `Mars placed in House ${marsFromVenus} from Venus.`;
        }

        // Authentic Vedic Kalsarp Dosh calculation (Hemming of all 7 planets on one side of Rahu-Ketu axis)
        const planetSigns = [sunSignNum, moonSignNum, marsSignNum, mercSignNum, jupSignNum, venSignNum, satSignNum];
        const allSide1 = planetSigns.every(s => ((s - rahuSignNum + 12) % 12) <= 6);
        const allSide2 = planetSigns.every(s => ((s - ketuSignNum + 12) % 12) <= 6);
        const hasKalsarp = allSide1 || allSide2;
        const kalsarpTypes = [
            'Anant Kalsarp', 'Kulik Kalsarp', 'Vasuki Kalsarp', 'Shankhpal Kalsarp',
            'Padma Kalsarp', 'Mahapadma Kalsarp', 'Takshak Kalsarp', 'Karkotak Kalsarp',
            'Shankhachood Kalsarp', 'Ghatak Kalsarp', 'Vishdhar Kalsarp', 'Sheshnag Kalsarp',
        ];
        const kalsarpName = hasKalsarp ? kalsarpTypes[(rahuSignNum - 1 + 12) % 12] : 'No Kalsarp Dosh';

        // Today's own ayanamsa (not the birth-date one) for accurately placing
        // the CURRENT real-time transiting Saturn - the two can differ by up to
        // ~1° for an old birth date, occasionally enough to matter right at a
        // sign boundary.
        const nowJD = (Date.now() / 86400000) + 2440587.5;
        const nowT = (nowJD - 2451545.0) / 36525;
        const nowAyanamsa = 23.85655556 + (1.39604167 * nowT) + (0.000308 * nowT * nowT);
        const currentSaturnRashi = getSignNum(normalizeDeg(getTropicalLongitudes(new Date()).saturn - nowAyanamsa));
        const dist = ((currentSaturnRashi - moonSignNum + 12) % 12);
        let sadeSatiActive = false;
        let sadeSatiText = 'Shani Transit Shanta (No Active Sade Sati)';
        if (dist === 11) {
            sadeSatiActive = true;
            sadeSatiText = 'Sade Sati Phase 1 (Rising Phase / Aarohi Shani)';
        } else if (dist === 0) {
            sadeSatiActive = true;
            sadeSatiText = 'Sade Sati Phase 2 (Peak Phase / Janma Shani)';
        } else if (dist === 1) {
            sadeSatiActive = true;
            sadeSatiText = 'Sade Sati Phase 3 (Setting Phase / Avarohi Shani)';
        } else if (dist === 3) {
            sadeSatiActive = true;
            sadeSatiText = 'Kantaka Shani Dhaiya (4th House Transit)';
        } else if (dist === 7) {
            sadeSatiActive = true;
            sadeSatiText = 'Ashtama Shani Dhaiya (8th House Transit)';
        }

        // Pitra Dosh — classical indicators (per Brihat Parashara Hora Shastra's
        // 9th-house analysis, as commonly summarized by Vedic astrology
        // references): Sun conjunct Rahu, Ketu, or Saturn (any house), OR
        // Rahu/Ketu/Saturn occupying the 9th house (house of father/ancestors)
        // from Lagna. "Moon in Magha nakshatra" was previously used as a
        // stand-alone trigger here but is not a documented classical rule for
        // Pitra Dosh specifically (Ketu ruling Magha is a real but separate
        // fact) - removed rather than risk a false positive on a dosha this
        // site sells a specific remedy (Tripindi Shradh) for.
        const ninthHouseSign = ((lagnaSignNum + 9 - 2) % 12) + 1; // sign occupying the 9th house from Lagna
        const ninthHouseAfflicted = [rahuSignNum, ketuSignNum, satSignNum].includes(ninthHouseSign);
        const sunAfflicted = sunSignNum === rahuSignNum || sunSignNum === ketuSignNum || sunSignNum === satSignNum;
        const hasPitra = sunAfflicted || ninthHouseAfflicted;

        return {
            devoteeName: name || 'Devotee',
            birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            birthTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
            birthPlace: birthPlace || 'Varanasi, India',
            ayanamsa: formatDegMin(ayanamsa),
            lagna: {
                rashi: lagnaRashi.name,
                lord: lagnaRashi.lord,
                deg: formatDegMin(lagnaDegInSign),
                element: lagnaRashi.element,
                luckyColor: lagnaRashi.color,
                luckyGem: lagnaRashi.gem,
                luckyMetal: lagnaRashi.metal,
                luckyNum: lagnaRashi.luckyNum,
            },
            moon: {
                rashi: moonRashi.name,
                lord: moonRashi.lord,
                deg: formatDegMin(sidMoon % 30),
                luckyGem: moonRashi.gem,
                luckyColor: moonRashi.color,
                luckyMetal: moonRashi.metal,
                luckyNum: moonRashi.luckyNum,
            },
            nakshatra: {
                name: moonNakshatra.name,
                pada,
                lord: moonNakshatra.lord,
                deity: moonNakshatra.deity,
            },
            planets,
            houseData,
            doshas: {
                manglik: {
                    hasDosh: isManglik,
                    severity: manglikSeverity,
                    details: manglikDetails,
                    marsHouseLagna: marsFromLagna,
                    marsHouseMoon: marsFromMoon,
                    marsHouseVenus: marsFromVenus,
                    isFromLagna: isManglikFromLagna,
                    isFromMoon: isManglikFromMoon,
                },
                kalsarp: {
                    hasDosh: hasKalsarp,
                    name: kalsarpName,
                },
                sadeSati: {
                    active: sadeSatiActive,
                    phase: sadeSatiText,
                },
                pitraDosh: {
                    hasDosh: hasPitra,
                    severity: hasPitra ? 'Active Ancestral Impediment (Pitra Rin)' : 'Pitra Kripa / No Major Dosh',
                },
            },
        };
    } catch (err) {
        console.error('Vedic calculation error:', err);
        return {
            devoteeName: name || 'Devotee',
            birthDate: '2001-08-11',
            birthTime: '06:30',
            birthPlace: birthPlace || 'Varanasi',
            ayanamsa: "23°52'",
            lagna: { rashi: 'Simha (Leo)', lord: 'Sun', deg: "07°01'", element: 'Fire', luckyColor: 'Gold/Ruby Red', luckyGem: 'Ruby (Manikya)', luckyMetal: 'Gold/Copper', luckyNum: '1' },
            moon: { rashi: 'Mesha (Aries)', lord: 'Mars', deg: "09°34'", luckyGem: 'Red Coral (Moonga)', luckyColor: 'Red', luckyMetal: 'Copper/Gold', luckyNum: '9' },
            nakshatra: { name: 'Ashvini', pada: 3, lord: 'Ketu', deity: 'Ashvini Kumaras' },
            planets: [],
            houseData: {},
            doshas: {
                manglik: { hasDosh: true, severity: 'Active Manglik Dosh (Mars in H4 from Lagna)', marsHouseLagna: 4, marsHouseMoon: 8 },
                kalsarp: { hasDosh: false, name: 'No Kalsarp Dosh' },
                sadeSati: { active: false, phase: 'Shani Transit Shanta' },
                pitraDosh: { hasDosh: false, severity: 'Pitra Kripa' },
            },
        };
    }
}
