// jaimini.js
// Jaimini Chara Karakas (7-karaka scheme, per the user's own spec: Sun
// through Saturn ranked by degree-within-sign, Rahu/Ketu excluded),
// Karakamsha/Swamsha, and Baladi + Jagrat/Swapna/Sushupti Avasthas.
// Formulas verified against multiple independent sources (including two
// full worked examples) before implementation.

const { signAndOffset } = require('./divisionalCharts');
const { strengthOf } = require('./lifePredictions');

const KARAKA_ORDER = ['Atmakaraka', 'Amatyakaraka', 'Bhratrikaraka', 'Matrikaraka', 'Pitrikaraka', 'Gnatikaraka', 'Darakaraka'];
const KARAKA_ABBR = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'GK', 'DK'];
const KARAKA_SIGNIFIES_HI = ['आत्मा (स्वयं)', 'बुद्धि व करियर', 'भाई-बहन', 'माता', 'पिता', 'सगे-संबंधी', 'जीवनसाथी'];
const KARAKA_SIGNIFIES_EN = ['the self/soul', 'intellect & career', 'siblings', 'mother', 'father', 'relatives', 'spouse'];

const CLASSICAL_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

function calculateCharaKarakas(planetLongitudes, lang) {
    const ranked = CLASSICAL_PLANETS
        .map(key => ({ key, offset: signAndOffset(planetLongitudes[key]).offset }))
        .sort((a, b) => b.offset - a.offset);

    return ranked.map((p, i) => ({
        karaka: KARAKA_ORDER[i],
        abbr: KARAKA_ABBR[i],
        planet: p.key,
        signifies: lang === 'hi' ? KARAKA_SIGNIFIES_HI[i] : KARAKA_SIGNIFIES_EN[i],
        degree: p.offset,
    }));
}

function calculateKarakamsha(atmakarakaKey, divisionalCharts, vargaLagnaSignD9, signNames) {
    const karakamshaSign = divisionalCharts.d9[atmakarakaKey].sign;
    return {
        karakamsha: signNames[karakamshaSign - 1],
        swamsha: signNames[vargaLagnaSignD9 - 1],
    };
}

const BALADI_ORDER = ['Bala', 'Kumara', 'Yuva', 'Vriddha', 'Mrita'];
const BALADI_HI = { Bala: 'बाल (शिशु)', Kumara: 'कुमार (किशोर)', Yuva: 'युवा', Vriddha: 'वृद्ध', Mrita: 'मृत' };

function baladiAvastha(deg, signNum) {
    const segment = Math.min(4, Math.floor(deg / 6));
    const isOdd = signNum % 2 === 1;
    const idx = isOdd ? segment : 4 - segment;
    return BALADI_ORDER[idx];
}

function jagratAvastha(strength) {
    if (strength === 'own' || strength === 'exalted') return 'Jagrat';
    if (strength === 'debilitated') return 'Sushupti';
    return 'Swapna';
}
const JAGRAT_HI = { Jagrat: 'जाग्रत (जागृत)', Swapna: 'स्वप्न', Sushupti: 'सुषुप्ति (निद्रित)' };

function analyzeJaimini(report, lang) {
    const charaKarakas = calculateCharaKarakas(report.planetLongitudes, lang);
    const atmakaraka = charaKarakas[0].planet;
    const { SIGN_NAMES } = require('./fullKundliReport');
    const { karakamsha, swamsha } = calculateKarakamsha(atmakaraka, report.divisionalCharts, report.vargaLagnaSign.d9, SIGN_NAMES);

    const avasthas = CLASSICAL_PLANETS.map(key => {
        const p = report.planets.find(pl => pl.key === key);
        const { offset } = signAndOffset(report.planetLongitudes[key]);
        const baladi = baladiAvastha(offset, p.signNum);
        const strength = strengthOf(key, p.signNum);
        const jagrat = jagratAvastha(strength);
        return {
            planet: key,
            baladi: lang === 'hi' ? BALADI_HI[baladi] : baladi,
            jagrat: lang === 'hi' ? JAGRAT_HI[jagrat] : jagrat,
        };
    });

    return { charaKarakas, karakamsha, swamsha, avasthas, atmakaraka };
}

module.exports = { analyzeJaimini, calculateCharaKarakas, calculateKarakamsha, baladiAvastha, jagratAvastha };
