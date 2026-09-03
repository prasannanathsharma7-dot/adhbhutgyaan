// shadbala.js
// Planetary Strength (Shadbala) and House Strength (Bhava Bala).
//
// HONEST SCOPE DISCLOSURE: full classical Shadbala has 6 components -
// Sthana (positional), Dig (directional), Kala (temporal, 9 sub-parts
// including declination-based Ayana Bala), Chesta (motional, needs daily
// planetary-speed data), Naisargika (natural, fixed), and Drik (aspectual).
// This implementation covers Sthana Bala (all 5 sub-parts), Dig Bala, and
// Naisargika Bala - 3 of 6 components, chosen because their formulas were
// verified with worked examples against multiple independent sources.
// Kala Bala, Chesta Bala, and Drik Bala are NOT included in this pass -
// each needs further verification (Kala Bala's Ayana Bala requires precise
// declination math; Chesta Bala requires daily-motion/retrograde data;
// Drik Bala requires the full classical aspect system) that wasn't
// completed here. This is disclosed rather than presented as complete -
// results should be read as "partial Shadbala (Sthana+Dig+Naisargika)",
// not the full six-fold classical total, and are systematically LOWER
// than a full calculation (missing ~360 possible Virupas from the other
// three components) - useful for relative COMPARISON between planets in
// the same chart, not for comparing against the classical minimum
// thresholds (which assume all six components).
//
// Bhava Bala similarly covers Bhavadhipati Bala (house lord's partial
// Shadbala) and Bhava Dig Bala - Bhava Drishti Bala (aspects on the house
// cusp) is NOT included, for the same reason (needs the full classical
// aspect system with degree-based partial-aspect weighting).

const { signAndOffset, d2Hora, d3Drekkana, d7Saptamsha, d9Navamsha, d12Dwadashamsha, d30Trimshamsha } = require('./divisionalCharts');
const { strengthOf } = require('./lifePredictions');

const CLASSICAL_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

// Deepest exaltation/debilitation degrees (absolute 0-360° sidereal),
// classical fixed values.
const EXALT_DEG = { sun: 10, moon: 33, mars: 298, mercury: 165, jupiter: 95, venus: 357, saturn: 200 };
const DEBIL_DEG = { sun: 190, moon: 213, mars: 118, mercury: 345, jupiter: 275, venus: 177, saturn: 20 };

// Naisargika Bala: fixed per-planet, 60/7 x (7 for Sun down to 1 for Saturn).
const NAISARGIKA_BALA = { sun: 60, moon: 51.43, venus: 42.86, jupiter: 34.29, mercury: 25.71, mars: 17.14, saturn: 8.57 };

// Dig Bala: each planet's peak-strength house (1-indexed).
const DIG_BALA_PEAK_HOUSE = { jupiter: 1, mercury: 1, sun: 10, mars: 10, saturn: 7, moon: 4, venus: 4 };

const ODD_SIGN_STRONG = ['sun', 'mars', 'jupiter', 'mercury', 'saturn']; // per classical rule, cross-verified
const EVEN_SIGN_STRONG = ['moon', 'venus'];

/** Uchcha Bala: distance from debilitation point / 3, capped 0-60. */
function uchchaBala(planetKey, longitude) {
    let diff = longitude - DEBIL_DEG[planetKey];
    diff = ((diff % 360) + 360) % 360;
    if (diff > 180) diff = 360 - diff;
    return diff / 3;
}

/** Saptavargaja Bala: dignity across the 7 classical vargas (D1,D2,D3,D7,
 *  D9,D12,D30), simplified to a 3-tier scale (exalted/own vs neutral vs
 *  debilitated) using the already-verified strengthOf() categories, rather
 *  than the full 6-tier classical friendship scale (moolatrikona/own/
 *  great-friend/friend/neutral/enemy/great-enemy/debilitated) - disclosed
 *  simplification given time constraints on fully verifying all 6 tiers'
 *  exact point values. Max 45 per varga x 7 = 315.
 */
function saptavargajaBala(planetKey, longitude) {
    const vargaFns = {
        d1: (lon) => signAndOffset(lon).signNum,
        d2: d2Hora,
        d3: d3Drekkana,
        d7: d7Saptamsha,
        d9: d9Navamsha,
        d12: d12Dwadashamsha,
        d30: (lon) => d30Trimshamsha(lon).sign,
    };
    let total = 0;
    for (const key of Object.keys(vargaFns)) {
        const sign = vargaFns[key](longitude);
        const strength = strengthOf(planetKey, sign);
        if (strength === 'exalted' || strength === 'own') total += 45;
        else if (strength === 'debilitated') total += 0;
        else total += 15; // neutral
    }
    return total;
}

/** Ojayugmarasyamsa Bala: 15 Virupas each for D1 and D9 if the planet's
 *  gender-affinity matches the sign's odd/even parity. Max 30. */
function ojayugmaBala(planetKey, longitude) {
    const d1Sign = signAndOffset(longitude).signNum;
    const d9Sign = d9Navamsha(longitude);
    const wantsOdd = ODD_SIGN_STRONG.includes(planetKey);
    let total = 0;
    if (wantsOdd ? d1Sign % 2 === 1 : d1Sign % 2 === 0) total += 15;
    if (wantsOdd ? d9Sign % 2 === 1 : d9Sign % 2 === 0) total += 15;
    return total;
}

/** Kendradi Bala: Kendra (1,4,7,10)=60, Panapara (2,5,8,11)=30,
 *  Apoklima (3,6,9,12)=15. */
function kendradiBala(house) {
    const kendra = [1, 4, 7, 10];
    const panapara = [2, 5, 8, 11];
    if (kendra.includes(house)) return 60;
    if (panapara.includes(house)) return 30;
    return 15;
}

/** Drekkana Bala: male planets strong in 1st decan, female in 2nd,
 *  neuter (Mercury/Saturn) in 3rd - 15 Virupas if matched. */
function drekkanaBala(planetKey, longitude) {
    const { offset } = signAndOffset(longitude);
    const decan = Math.floor(offset / 10); // 0, 1, or 2
    const male = ['sun', 'mars', 'jupiter'];
    const female = ['moon', 'venus'];
    const neuter = ['mercury', 'saturn'];
    if (male.includes(planetKey) && decan === 0) return 15;
    if (female.includes(planetKey) && decan === 1) return 15;
    if (neuter.includes(planetKey) && decan === 2) return 15;
    return 0;
}

function digBala(planetKey, house) {
    const peak = DIG_BALA_PEAK_HOUSE[planetKey];
    // Angular distance (in houses) from the peak house, converted to a
    // 0-180° equivalent (each house step = 30°), then the standard
    // (180 - distance)/3 formula.
    let houseDist = Math.abs(house - peak);
    if (houseDist > 6) houseDist = 12 - houseDist;
    const degDist = houseDist * 30;
    return (180 - degDist) / 3;
}

/**
 * planetLongitudes: { sun, moon, mars, mercury, jupiter, venus, saturn }
 * planetHouses: { sun: houseNum, ... } (1-12, whole-sign from Lagna)
 * Returns per-planet breakdown + totals in Virupas and Rupas.
 */
function calculateShadbala(planetLongitudes, planetHouses) {
    const results = {};
    for (const key of CLASSICAL_PLANETS) {
        const lon = planetLongitudes[key];
        const house = planetHouses[key];
        const sthana = {
            uchcha: uchchaBala(key, lon),
            saptavargaja: saptavargajaBala(key, lon),
            ojayugma: ojayugmaBala(key, lon),
            kendradi: kendradiBala(house),
            drekkana: drekkanaBala(key, lon),
        };
        const sthanaTotal = Object.values(sthana).reduce((a, b) => a + b, 0);
        const dig = digBala(key, house);
        const naisargika = NAISARGIKA_BALA[key];
        const totalVirupas = sthanaTotal + dig + naisargika;
        results[key] = {
            sthana, sthanaTotal,
            dig,
            naisargika,
            totalVirupas,
            totalRupas: totalVirupas / 60,
        };
    }
    return results;
}

const BHAVA_DIG_PEAK_HOUSE = 10; // Bhava Dig Bala peaks at the 10th from itself in the classical linear-decay pattern

/** Bhava Dig Bala: 60 at the "ideal" configuration, decaying 10/house-step,
 *  0 at the opposite house - verified worked example (Aries ascendant:
 *  10th=60, 11th=50, 12th=40, 1st=30, 2nd=20, 3rd=10, 4th=0). */
function bhavaDigBala(houseNum) {
    let steps = Math.abs(houseNum - BHAVA_DIG_PEAK_HOUSE);
    if (steps > 6) steps = 12 - steps;
    return Math.max(0, 60 - steps * 10);
}

/**
 * shadbalaResults: output of calculateShadbala().
 * houseLords: { 1: 'mars', 2: 'venus', ... } (SIGN_LORD-based house lord per house).
 * Returns per-house { bhavadhipati, dig, totalVirupas, totalRupas } - Bhava
 * Drishti Bala (aspects) is NOT included, disclosed above.
 */
function calculateBhavaBala(shadbalaResults, houseLords) {
    const results = {};
    for (let house = 1; house <= 12; house++) {
        const lord = houseLords[house];
        const bhavadhipati = shadbalaResults[lord] ? shadbalaResults[lord].totalVirupas : 0;
        const dig = bhavaDigBala(house);
        const totalVirupas = bhavadhipati + dig;
        results[house] = { bhavadhipati, dig, totalVirupas, totalRupas: totalVirupas / 60 };
    }
    return results;
}

module.exports = { calculateShadbala, calculateBhavaBala, uchchaBala, saptavargajaBala, ojayugmaBala, kendradiBala, drekkanaBala, digBala, bhavaDigBala, NAISARGIKA_BALA, EXALT_DEG, DEBIL_DEG };
