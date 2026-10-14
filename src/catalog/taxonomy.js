// Pure data tables that connect the three places a pooja is described:
//   src/data/services.json   - 14 services with detail pages, images, packages
//   src/data/priceList.json  - the 98 published rate-card items (numbers #1..#101)
//   the Pooja Finder         - "what is your concern?" -> suggested poojas
// Nothing here imports JSON or React, so it can be unit-tested in plain Node
// (see scripts/test-catalog.mjs) and reused by any future consumer.
//
// The concern suggestions are TRADITIONAL associations (shastric / customary use), shown
// as guidance. They are not medical, legal or financial advice and never a guarantee of
// outcome - the UI says so, and Pandit ji confirms the right pooja for a person's chart.

/** The Finder's concerns, in display order. `image` is optional (new concerns have none). */
export const CONCERNS = [
    { id: 'health',     image: 'concern-health',     hi: 'स्वास्थ्य संबंधी समस्या',                en: 'Health Issues' },
    { id: 'marriage',   image: 'concern-marriage',   hi: 'विवाह में देरी / मांगलिक दोष',           en: 'Marriage Delay / Manglik Dosh' },
    { id: 'money',      image: 'concern-money',      hi: 'आर्थिक तंगी',                           en: 'Financial Struggles' },
    { id: 'ancestral',  image: 'concern-ancestral',  hi: 'पितृ दोष / पूर्वजों से जुड़ी समस्या',     en: 'Pitru Dosh / Ancestral Issues' },
    { id: 'career',     image: 'concern-career',     hi: 'करियर / व्यापार में रुकावट',              en: 'Career / Business Obstacles' },
    { id: 'negativity', image: 'concern-negativity', hi: 'नकारात्मक शक्ति / शत्रु बाधा',            en: 'Negative Energy / Enemies' },
    { id: 'home',       image: null,                 hi: 'गृह, वास्तु एवं संपत्ति',                en: 'Home, Vastu & Property' },
    { id: 'children',   image: null,                 hi: 'संतान सुख',                             en: 'Children & Progeny' },
    { id: 'graha',      image: null,                 hi: 'ग्रह दोष / ग्रह शांति',                  en: 'Planetary Doshas (Graha Shanti)' },
    { id: 'devotion',   image: null,                 hi: 'नित्य पाठ एवं भक्ति',                    en: 'Daily Devotion & Paath' },
    { id: 'occasion',   image: null,                 hi: 'संस्कार, उत्सव एवं महायज्ञ',              en: 'Life Events, Samskaras & Grand Yagyas' },
    { id: 'unsure',     image: 'concern-unsure',     hi: 'पता नहीं, सलाह चाहिए',                   en: 'Not Sure, Need Guidance' },
];

/** Display order of the directory sections. 'X' is the consultation; A-D come from priceList.json. */
export const EXTRA_CATEGORIES = [
    { id: 'X', nameHi: 'ज्योतिष परामर्श', nameEn: 'Astrology Consultation' },
];

/**
 * Price-list item numbers that ARE one of the 14 detail-page services. Those two records are
 * merged into one catalog entry (so a ritual never appears twice). Only matches that are
 * unambiguous are listed; the test suite checks every id/number below exists.
 */
export const SERVICE_LINKS = {
    22: 'rudrabhishek',
    53: 'kalsarp-dosh',
    38: 'tripindi-shradh',
    49: 'kumbh-vivah',
    81: 'griha-pravesh',
    54: 'mahamrityunjaya-jaap',
    15: 'vipreet-pratyangira',
    11: 'shree-suktam',
    12: 'purush-suktam',
};

/** Services that have no price-list item: which directory section they belong to. */
export const SERVICE_CATEGORY = {
    'astrology-consultation': 'X',
    'kanakdhara-stotra': 'A',
    'mahavidya-paath': 'A',
    'ganesh-atharvashirsha': 'A',
    'navgrah-shanti': 'D',
};

/** Concerns for each of the 14 detail-page services. */
export const SERVICE_CONCERNS = {
    'rudrabhishek': ['health'],
    'purush-suktam': ['health'],
    'mahamrityunjaya-jaap': ['health'],
    'kumbh-vivah': ['marriage'],
    'kalsarp-dosh': ['marriage', 'career', 'graha'],
    'kanakdhara-stotra': ['money'],
    'shree-suktam': ['money'],
    'tripindi-shradh': ['ancestral'],
    'ganesh-atharvashirsha': ['career'],
    'vipreet-pratyangira': ['negativity'],
    'mahavidya-paath': ['negativity'],
    'griha-pravesh': ['home'],
    'navgrah-shanti': ['graha'],
    'astrology-consultation': ['unsure'],
};

/** Concerns for every other published price-list item, by item number. */
export const ITEM_CONCERNS = {
    1: ['career', 'devotion'], 2: ['negativity'], 4: ['devotion'], 5: ['health', 'devotion'], 6: ['devotion'],
    7: ['graha'], 8: ['negativity', 'devotion'], 9: ['negativity'], 10: ['negativity'], 13: ['health', 'devotion'],
    14: ['devotion', 'ancestral'], 16: ['children'], 17: ['devotion', 'negativity'], 18: ['devotion', 'negativity'],
    19: ['devotion'], 20: ['negativity', 'devotion'], 21: ['negativity', 'devotion'], 23: ['negativity'], 24: ['negativity'],
    25: ['negativity'], 26: ['negativity'], 28: ['negativity'], 29: ['ancestral'], 30: ['devotion', 'negativity'],
    31: ['devotion'], 32: ['occasion', 'ancestral'], 33: ['occasion', 'children'], 34: ['ancestral'], 35: ['occasion', 'devotion'],
    36: ['negativity', 'health'],
    37: ['ancestral'], 39: ['ancestral'], 40: ['ancestral'], 41: ['ancestral'], 42: ['ancestral'], 43: ['ancestral', 'occasion'],
    44: ['ancestral'], 45: ['graha', 'ancestral'], 46: ['career'], 47: ['graha', 'children'], 48: ['devotion', 'occasion'],
    50: ['marriage'], 51: ['occasion'], 52: ['occasion', 'marriage'],
    55: ['graha'], 56: ['graha', 'health'], 57: ['graha'], 58: ['graha', 'marriage'], 59: ['graha'], 60: ['graha'],
    61: ['graha', 'marriage'], 62: ['graha', 'career'], 63: ['graha'], 64: ['graha'], 65: ['home'], 66: ['children'],
    67: ['marriage'], 68: ['marriage'], 69: ['negativity'], 70: ['negativity'], 71: ['ancestral'], 72: ['health'],
    73: ['health'], 74: ['career'], 75: ['graha'],
    76: ['devotion'], 77: ['negativity', 'occasion'], 78: ['negativity', 'occasion'], 79: ['occasion', 'home'], 80: ['home'],
    82: ['career'], 83: ['occasion', 'ancestral'], 84: ['money'], 85: ['occasion'], 86: ['health', 'occasion'],
    87: ['health', 'occasion'], 88: ['health'], 89: ['occasion'], 90: ['occasion', 'devotion'], 91: ['negativity'],
    92: ['occasion'], 93: ['money', 'occasion'], 94: ['health', 'devotion'], 95: ['marriage'], 96: ['devotion'],
    97: ['negativity'], 98: ['occasion', 'devotion'], 100: ['health'], 101: ['negativity'],
};

/** The hand-picked first suggestions for the original concerns (kept exactly as before). */
export const FEATURED_ORDER = {
    health: ['rudrabhishek', 'purush-suktam'],
    marriage: ['kumbh-vivah', 'kalsarp-dosh'],
    money: ['kanakdhara-stotra', 'shree-suktam'],
    ancestral: ['tripindi-shradh'],
    career: ['ganesh-atharvashirsha', 'kalsarp-dosh'],
    negativity: ['vipreet-pratyangira', 'mahavidya-paath'],
    unsure: ['astrology-consultation'],
};
