// hindiTerms.js
// Devanagari translations for nakshatra names, deities, and Avakahada
// Chakra terms (Varna/Vashya/Yoni/Gana/Nadi), which the core calculation
// engine (kundli-preanalyzer.js) only ever stores in English. This is a
// pure display-layer lookup - it doesn't touch or re-derive any of the
// underlying astrological calculation, only translates already-computed
// English labels for Hindi-mode rendering. Applying it here (rather than
// restructuring the core engine's data) keeps this a zero-risk addition to
// already-tested calculation code.

const NAKSHATRA_HI = {
    Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी',
    Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य',
    Ashlesha: 'आश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्व फाल्गुनी',
    'Uttara Phalguni': 'उत्तर फाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा', Swati: 'स्वाति',
    Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा', Mula: 'मूल',
    'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा', Shravana: 'श्रवण',
    Dhanishta: 'धनिष्ठा', Shatabhisha: 'शतभिषा', 'Purva Bhadrapada': 'पूर्व भाद्रपद',
    'Uttara Bhadrapada': 'उत्तर भाद्रपद', Revati: 'रेवती',
};

const DEITY_HI = {
    'Ashwini Kumaras': 'अश्विनी कुमार', Yama: 'यम', Agni: 'अग्नि', Brahma: 'ब्रह्मा',
    Soma: 'सोम', Rudra: 'रुद्र', Aditi: 'अदिति', Brihaspati: 'बृहस्पति', Sarpa: 'सर्प',
    Pitrs: 'पितृ', Bhaga: 'भग', Aryaman: 'अर्यमन', Savita: 'सविता', Vishwakarma: 'विश्वकर्मा',
    Vayu: 'वायु', 'Indra-Agni': 'इंद्राग्नि', Mitra: 'मित्र', Indra: 'इंद्र', Nirriti: 'निऋति',
    Apas: 'आपः', Vishwadevas: 'विश्वेदेवा', Vishnu: 'विष्णु', Vasus: 'वसु', Varuna: 'वरुण',
    'Aja Ekapada': 'अज एकपाद', Ahirbudhnya: 'अहिर्बुध्न्य', Pushan: 'पूषन',
};

const VARNA_HI = { Brahmin: 'ब्राह्मण', Kshatriya: 'क्षत्रिय', Vaishya: 'वैश्य', Shudra: 'शूद्र', Mlechha: 'म्लेच्छ' };
const VASHYA_HI = { Chatushpada: 'चतुष्पद', Manav: 'मानव', Jalchar: 'जलचर', Vanchar: 'वनचर' };
const GANA_HI = { Deva: 'देव', Manushya: 'मनुष्य', Rakshasa: 'राक्षस' };
const NADI_HI = { Adi: 'आदि', Madhya: 'मध्य', Antya: 'अंत्य' };
const YONI_HI = {
    Horse: 'अश्व', Elephant: 'गज', 'Goat (Sheep)': 'मेष (भेड़)', Serpent: 'सर्प', Dog: 'श्वान',
    Cat: 'बिडाल', Rat: 'मूषक', 'Cow (Ox)': 'गौ (वृषभ)', Buffalo: 'महिष', Tiger: 'व्याघ्र',
    'Deer (Hare)': 'मृग (शशक)', Monkey: 'वानर', Mongoose: 'नकुल', Lion: 'सिंह',
};
const PLANET_LORD_HI = { Sun: 'सूर्य', Moon: 'चन्द्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' };

/** hi(term, table): looks up the Hindi form, falling back to the original
 *  English string if not found (never throws, never blanks a value). */
function hi(term, table) {
    return table[term] || term;
}

module.exports = {
    nakshatraHi: (n) => hi(n, NAKSHATRA_HI),
    deityHi: (d) => hi(d, DEITY_HI),
    varnaHi: (v) => hi(v, VARNA_HI),
    vashyaHi: (v) => hi(v, VASHYA_HI),
    ganaHi: (g) => hi(g, GANA_HI),
    nadiHi: (n) => hi(n, NADI_HI),
    yoniHi: (y) => hi(y, YONI_HI),
    lordHi: (l) => hi(l, PLANET_LORD_HI),
};
