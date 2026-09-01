// divisionalCharts.js
// Classical Parashari divisional-chart (varga) sign calculators. Each
// function takes a planet's SIDEREAL longitude (0-360°, already ayanamsa-
// corrected) and returns the resulting sign number (1-12, 1=Aries).
//
// Formulas cross-verified against multiple independent classical-astrology
// references before implementation (not from memory alone), given these
// feed a paid customer deliverable:
// - D2 (Hora): odd sign 0-15°->Leo(Sun)/15-30°->Cancer(Moon); even sign
//   reversed. Only Leo/Cancer are ever occupied, by design.
// - D3 (Drekkana): 10° decans; 1st=same sign, 2nd=+4 (trine), 3rd=+8 (trine).
// - D7 (Saptamsha): 30/7 = 4°17'8" parts; odd sign starts counting from
//   itself, even sign starts from the 7th sign from it.
// - D9 (Navamsha): 30/9 = 3°20' parts; start sign by element - fire->Aries,
//   earth->Capricorn, air->Libra, water->Cancer - then count the part index
//   forward. (Equivalent to the movable/fixed/dual same/9th/5th-sign rule;
//   cross-checked both give identical results.)
// - D12 (Dwadashamsha): 30/12 = 2.5° parts; always counts from the same
//   sign (no odd/even split), running through all 12 signs.
// - D30 (Trimshamsha): NOT equal parts. Odd sign: Mars 0-5°, Saturn 5-10°,
//   Jupiter 10-18°, Mercury 18-25°, Venus 25-30°. Even sign: reversed order
//   AND reversed segment widths (Venus 0-5°, Mercury 5-12°, Jupiter 12-20°,
//   Saturn 20-25°, Mars 25-30°). Each lord maps to the sign of its own
//   rulership matching the odd/even gender of the input sign (e.g. Mars's
//   segment -> Aries for an odd input sign, Scorpio for an even one).

function signAndOffset(deg) {
    const norm = ((deg % 360) + 360) % 360;
    const signNum = Math.floor(norm / 30) + 1; // 1-12
    const offset = norm % 30; // 0-30, position within the sign
    return { signNum, offset };
}

const isOdd = (signNum) => signNum % 2 === 1;
const advance = (signNum, steps) => (((signNum - 1 + steps) % 12) + 12) % 12 + 1;

function d2Hora(deg) {
    const { signNum, offset } = signAndOffset(deg);
    const firstHalf = offset < 15;
    if (isOdd(signNum)) return firstHalf ? 5 : 4;  // odd: Leo(5) then Cancer(4)
    return firstHalf ? 4 : 5;                       // even: Cancer(4) then Leo(5)
}

function d3Drekkana(deg) {
    const { signNum, offset } = signAndOffset(deg);
    const decan = Math.floor(offset / 10); // 0, 1, or 2
    return advance(signNum, decan * 4); // 0 -> +0, 1 -> +4, 2 -> +8
}

function d7Saptamsha(deg) {
    const { signNum, offset } = signAndOffset(deg);
    const part = Math.floor(offset / (30 / 7)); // 0-6
    const startSign = isOdd(signNum) ? signNum : advance(signNum, 6); // even: 7th from it (+6 steps)
    return advance(startSign, part);
}

const ELEMENT_START = { fire: 1, earth: 10, air: 7, water: 4 }; // Aries, Capricorn, Libra, Cancer
function elementOf(signNum) {
    const mod = signNum % 4;
    // Aries(1,fire) Taurus(2,earth) Gemini(3,air) Cancer(4,water) Leo(5,fire) Virgo(6,earth)
    // Libra(7,air) Scorpio(8,water) Sag(9,fire) Cap(10,earth) Aqu(11,air) Pis(12,water)
    if (mod === 1) return 'fire';
    if (mod === 2) return 'earth';
    if (mod === 3) return 'air';
    return 'water'; // mod === 0 (i.e. signNum divisible by 4: Cancer, Scorpio, Pisces)
}
function d9Navamsha(deg) {
    const { signNum, offset } = signAndOffset(deg);
    const part = Math.floor(offset / (30 / 9)); // 0-8
    const startSign = ELEMENT_START[elementOf(signNum)];
    return advance(startSign, part);
}

function d12Dwadashamsha(deg) {
    const { signNum, offset } = signAndOffset(deg);
    const part = Math.floor(offset / 2.5); // 0-11
    return advance(signNum, part);
}

// Trimshamsha lord->sign mapping, keyed by [odd/even][lord]
const D30_ODD = [
    { limit: 5, lord: 'mars', sign: 1 },      // Aries
    { limit: 10, lord: 'saturn', sign: 11 },  // Aquarius
    { limit: 18, lord: 'jupiter', sign: 9 },  // Sagittarius
    { limit: 25, lord: 'mercury', sign: 3 },  // Gemini
    { limit: 30, lord: 'venus', sign: 7 },    // Libra
];
const D30_EVEN = [
    { limit: 5, lord: 'venus', sign: 2 },     // Taurus
    { limit: 12, lord: 'mercury', sign: 6 },  // Virgo
    { limit: 20, lord: 'jupiter', sign: 12 }, // Pisces
    { limit: 25, lord: 'saturn', sign: 10 },  // Capricorn
    { limit: 30, lord: 'mars', sign: 8 },     // Scorpio
];
function d30Trimshamsha(deg) {
    const { signNum, offset } = signAndOffset(deg);
    const table = isOdd(signNum) ? D30_ODD : D30_EVEN;
    const entry = table.find(e => offset < e.limit) || table[table.length - 1];
    return { sign: entry.sign, lord: entry.lord };
}

module.exports = { d2Hora, d3Drekkana, d7Saptamsha, d9Navamsha, d12Dwadashamsha, d30Trimshamsha, signAndOffset };
