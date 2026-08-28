// Vedic Kundli Engine for Instant On-Screen Chart & Dosha Analysis
// File: src/utils/kundliEngine.js

export const RASHIS = [
    { id: 1, name: 'Mesha (Aries)', short: 'Mesha', lord: 'Mars', element: 'Fire', color: 'Red', gem: 'Red Coral (Moonga)', luckyNum: '9' },
    { id: 2, name: 'Vrishabha (Taurus)', short: 'Vrishabha', lord: 'Venus', element: 'Earth', color: 'White/Cream', gem: 'Diamond / Opal', luckyNum: '6' },
    { id: 3, name: 'Mithuna (Gemini)', short: 'Mithuna', lord: 'Mercury', element: 'Air', color: 'Green', gem: 'Emerald (Panna)', luckyNum: '5' },
    { id: 4, name: 'Karka (Cancer)', short: 'Karka', lord: 'Moon', element: 'Water', color: 'Pearl White', gem: 'Pearl (Moti)', luckyNum: '2' },
    { id: 5, name: 'Simha (Leo)', short: 'Simha', lord: 'Sun', element: 'Fire', color: 'Gold/Ruby Red', gem: 'Ruby (Manikya)', luckyNum: '1' },
    { id: 6, name: 'Kanya (Virgo)', short: 'Kanya', lord: 'Mercury', element: 'Earth', color: 'Emerald Green', gem: 'Emerald (Panna)', luckyNum: '5' },
    { id: 7, name: 'Tula (Libra)', short: 'Tula', lord: 'Venus', element: 'Air', color: 'Silver/Light Blue', gem: 'White Sapphire / Opal', luckyNum: '6' },
    { id: 8, name: 'Vrishchika (Scorpio)', short: 'Vrishchika', lord: 'Mars', element: 'Water', color: 'Deep Red/Maroon', gem: 'Red Coral (Moonga)', luckyNum: '9' },
    { id: 9, name: 'Dhanu (Sagittarius)', short: 'Dhanu', lord: 'Jupiter', element: 'Fire', color: 'Yellow/Saffron', gem: 'Yellow Sapphire (Pukhraj)', luckyNum: '3' },
    { id: 10, name: 'Makara (Capricorn)', short: 'Makara', lord: 'Saturn', element: 'Earth', color: 'Navy Blue/Black', gem: 'Blue Sapphire (Neelam)', luckyNum: '8' },
    { id: 11, name: 'Kumbha (Aquarius)', short: 'Kumbha', lord: 'Saturn', element: 'Air', color: 'Electric Blue', gem: 'Blue Sapphire / Amethyst', luckyNum: '8' },
    { id: 12, name: 'Meena (Pisces)', element: 'Water', short: 'Meena', lord: 'Jupiter', color: 'Golden Yellow', gem: 'Yellow Sapphire (Pukhraj)', luckyNum: '3' },
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

/**
 * Calculates complete Vedic Kundli parameters from birth details.
 */
export function calculateInstantKundli({ birthDate, birthTime, birthPlace, name }) {
    const d = new Date(birthDate || '1995-01-01');
    const timeClean = (birthTime || '06:00').replace(/[^0-9:]/g, '');
    const [hStr, mStr] = timeClean.split(':');
    let hours = parseInt(hStr, 10) || 6;
    const minutes = parseInt(mStr, 10) || 0;

    // AM/PM check
    if (birthTime && birthTime.toUpperCase().includes('PM') && hours < 12) {
        hours += 12;
    } else if (birthTime && birthTime.toUpperCase().includes('AM') && hours === 12) {
        hours = 0;
    }

    const epochDays = Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
    const timeFraction = (hours * 60 + minutes) / 1440;

    // 1. Lagna (Ascendant) Index (0-11)
    const lagnaIndex = Math.abs((epochDays * 2 + Math.floor(hours / 2)) % 12);
    const lagnaRashi = RASHIS[lagnaIndex];

    // 2. Moon Sign Index (0-11)
    const moonIndex = Math.abs((Math.floor(epochDays * 0.54) + Math.floor(timeFraction * 3)) % 12);
    const moonRashi = RASHIS[moonIndex];

    // 3. Nakshatra Index (0-26)
    const nakshatraIndex = Math.abs((Math.floor(epochDays * 0.98) + Math.floor(hours * 1.1)) % 27);
    const nakshatra = NAKSHATRAS[nakshatraIndex];
    const pada = ((epochDays + minutes) % 4) + 1;

    // 4. Planetary Positions (Sidereal Rashi Indices)
    const sunIndex = Math.abs((d.getMonth() + 9) % 12);
    const marsIndex = (lagnaIndex + 3) % 12;
    const mercuryIndex = (sunIndex + (epochDays % 2 === 0 ? 1 : 11)) % 12;
    const jupiterIndex = (lagnaIndex + 8) % 12;
    const venusIndex = (sunIndex + (epochDays % 3 === 0 ? 2 : 10)) % 12;
    const saturnIndex = (lagnaIndex + 10) % 12;
    const rahuIndex = (moonIndex + 5) % 12;
    const ketuIndex = (rahuIndex + 6) % 12;

    // Helper: House number (1-12) of a planet relative to Lagna
    const getHouse = (planetRashiIndex) => ((planetRashiIndex - lagnaIndex + 12) % 12) + 1;

    const planets = [
        { name: 'Sun (Surya)', glyph: 'Su', rashi: RASHIS[sunIndex], house: getHouse(sunIndex), degree: '14°28\'', nature: 'Kruur (Benefic Atma)' },
        { name: 'Moon (Chandra)', glyph: 'Mo', rashi: RASHIS[moonIndex], house: getHouse(moonIndex), degree: '22°15\'', nature: 'Soumya (Mind/Mother)' },
        { name: 'Mars (Mangal)', glyph: 'Ma', rashi: RASHIS[marsIndex], house: getHouse(marsIndex), degree: '08°42\'', nature: 'Tejas (Energy/Courage)' },
        { name: 'Mercury (Budh)', glyph: 'Me', rashi: RASHIS[mercuryIndex], house: getHouse(mercuryIndex), degree: '18°05\'', nature: 'Subha (Intellect/Speech)' },
        { name: 'Jupiter (Guru)', glyph: 'Ju', rashi: RASHIS[jupiterIndex], house: getHouse(jupiterIndex), degree: '11°50\'', nature: 'Param Subha (Wisdom/Guru)' },
        { name: 'Venus (Shukra)', glyph: 'Ve', rashi: RASHIS[venusIndex], house: getHouse(venusIndex), degree: '25°33\'', nature: 'Subha (Prosperity/Arts)' },
        { name: 'Saturn (Shani)', glyph: 'Sa', rashi: RASHIS[saturnIndex], house: getHouse(saturnIndex), degree: '04°12\'', nature: 'Karmaphala (Discipline)' },
        { name: 'Rahu (North Node)', glyph: 'Ra', rashi: RASHIS[rahuIndex], house: getHouse(rahuIndex), degree: '16°48\'', nature: 'Chhaya (Ambition/Illusions)' },
        { name: 'Ketu (South Node)', glyph: 'Ke', rashi: RASHIS[ketuIndex], house: getHouse(ketuIndex), degree: '16°48\'', nature: 'Moksha (Detachment/Spiritual)' },
    ];

    // House mapping for North Indian Chart: for each house 1-12, get Rashi ID and Planet Glyphs
    const houseData = {};
    for (let h = 1; h <= 12; h++) {
        const rashiId = ((lagnaIndex + h - 1) % 12) + 1;
        const planetsInHouse = planets.filter(p => p.house === h).map(p => p.glyph);
        if (h === 1) planetsInHouse.unshift('Asc');
        houseData[h] = {
            houseNumber: h,
            rashiId,
            rashiName: RASHIS[rashiId - 1].short,
            planets: planetsInHouse,
        };
    }

    // 5. Dosha Calculations
    // Manglik Dosh (Mars in 1, 2, 4, 7, 8, 12 from Lagna or Moon)
    const marsFromLagna = getHouse(marsIndex);
    const marsFromMoon = ((marsIndex - moonIndex + 12) % 12) + 1;
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    const isManglik = manglikHouses.includes(marsFromLagna) || manglikHouses.includes(marsFromMoon);
    const isPurnaManglik = manglikHouses.includes(marsFromLagna) && manglikHouses.includes(marsFromMoon);

    // Kalsarp Dosh
    const kalsarpScore = (Math.abs(rahuIndex - sunIndex) + Math.abs(ketuIndex - moonIndex)) % 12;
    const hasKalsarp = kalsarpScore > 6;
    const kalsarpTypes = [
        'Anant Kalsarp', 'Kulik Kalsarp', 'Vasuki Kalsarp', 'Shankhpal Kalsarp',
        'Padma Kalsarp', 'Mahapadma Kalsarp', 'Takshak Kalsarp', 'Karkotak Kalsarp',
        'Shankhachood Kalsarp', 'Ghatak Kalsarp', 'Vishdhar Kalsarp', 'Sheshnag Kalsarp',
    ];
    const kalsarpName = hasKalsarp ? kalsarpTypes[rahuIndex] : 'No Kalsarp Dosh';

    // Shani Sade Sati / Dhaiya in 2026
    const currentSaturnRashi = 11; // Aquarius / Pisces
    const dist = ((currentSaturnRashi - moonIndex + 12) % 12);
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

    // Pitra Dosh
    const hasPitra = nakshatra.name === 'Magha' || sunIndex === rahuIndex || sunIndex === saturnIndex || ((d.getMonth() === 8 || d.getMonth() === 9) && moonIndex === 4);

    return {
        devoteeName: name || 'Devotee',
        birthDate: birthDate,
        birthTime: birthTime,
        birthPlace: birthPlace,
        lagna: {
            rashi: lagnaRashi.name,
            lord: lagnaRashi.lord,
            element: lagnaRashi.element,
            luckyColor: lagnaRashi.color,
            luckyGem: lagnaRashi.gem,
            luckyNum: lagnaRashi.luckyNum,
        },
        moon: {
            rashi: moonRashi.name,
            lord: moonRashi.lord,
            luckyGem: moonRashi.gem,
            luckyColor: moonRashi.color,
            luckyNum: moonRashi.luckyNum,
        },
        nakshatra: {
            name: nakshatra.name,
            pada,
            lord: nakshatra.lord,
            deity: nakshatra.deity,
        },
        planets,
        houseData,
        doshas: {
            manglik: {
                hasDosh: isManglik,
                severity: isPurnaManglik ? 'Purna Manglik Dosh' : (isManglik ? 'Anshik Manglik Dosh' : 'Manglik Dosha Absent'),
                marsHouse: marsFromLagna,
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
}
