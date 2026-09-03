// muhuratEngine.js (frontend ES-module mirror of backend/utils/muhuratEngine.js)
// Same category rules, cross-referenced across multiple independent
// sources per category (see the backend copy's comments for detail).
// Reuses the already-verified calculateGlobalPanchang from astroEngine.js.

import { calculateGlobalPanchang } from './astroEngine';

const TITHI_NUM = {
    Pratipada: 1, Dwitiya: 2, Tritiya: 3, Chaturthi: 4, Panchami: 5, Shashthi: 6, Saptami: 7,
    Ashtami: 8, Navami: 9, Dashami: 10, Ekadashi: 11, Dwadashi: 12, Trayodashi: 13, Chaturdashi: 14,
};
function tithiNumberOf(tithiName) {
    if (/Purnima/i.test(tithiName)) return 15;
    if (/Amavasya/i.test(tithiName)) return 30;
    const word = tithiName.split(' ').pop();
    return TITHI_NUM[word] || 0;
}

const VARA_NUM = { Ravivara: 0, Somavara: 1, Mangalavara: 2, Budhavara: 3, Guruvara: 4, Shukravara: 5, Shanivara: 6 };
function varaNumberOf(varaName) {
    const word = varaName.split(' ')[0];
    return VARA_NUM[word] !== undefined ? VARA_NUM[word] : -1;
}

export const CATEGORY_RULES = {
    vivah: {
        nameHi: 'विवाह मुहूर्त', nameEn: 'Marriage Muhurat',
        goodTithis: [2, 3, 5, 7, 11, 13],
        goodNakshatras: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
        avoidVaraNums: [2],
    },
    grihapravesh: {
        nameHi: 'गृह प्रवेश मुहूर्त', nameEn: 'Griha Pravesh Muhurat',
        goodTithis: [2, 3, 5, 7, 10, 11, 13],
        goodNakshatras: ['Rohini', 'Mrigashira', 'Pushya', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Anuradha', 'Chitra', 'Swati', 'Hasta', 'Revati'],
        avoidVaraNums: [2, 6],
    },
    naamkaran: {
        nameHi: 'नामकरण मुहूर्त', nameEn: 'Naamkaran Muhurat',
        goodTithis: [2, 3, 5, 7, 10, 11, 12, 13],
        goodNakshatras: ['Ashwini', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati', 'Mrigashira', 'Chitra'],
        avoidVaraNums: [2],
    },
    business: {
        nameHi: 'व्यापार आरंभ मुहूर्त', nameEn: 'Business Launch Muhurat',
        goodTithis: [2, 3, 5, 7, 10, 11, 12, 13],
        goodNakshatras: ['Hasta', 'Chitra', 'Pushya', 'Ashwini', 'Uttara Phalguni', 'Anuradha', 'Revati'],
        avoidVaraNums: [],
    },
};

export function findMuhurat(category, startDate, endDate, lat, lng, tzOffset) {
    const rules = CATEGORY_RULES[category];
    if (!rules) throw new Error(`Unknown Muhurat category: ${category}`);
    const matches = [];
    const dayMs = 86400000;
    for (let t = startDate.getTime(); t <= endDate.getTime(); t += dayMs) {
        const d = new Date(t);
        const panchang = calculateGlobalPanchang({ date: d, latitude: lat, longitude: lng, timezoneOffsetHours: tzOffset });
        const tithiNum = tithiNumberOf(panchang.tithi.name);
        const varaNum = varaNumberOf(panchang.vara.name);
        const nakshatraOk = rules.goodNakshatras.includes(panchang.nakshatra.name);
        const tithiOk = rules.goodTithis.includes(tithiNum);
        const varaOk = !rules.avoidVaraNums.includes(varaNum);
        const notAmavasyaPurnima = !panchang.tithi.isAmavasya && !panchang.tithi.isPurnima;
        if (nakshatraOk && tithiOk && varaOk && notAmavasyaPurnima) {
            matches.push({ date: d, tithi: panchang.tithi.name, nakshatra: panchang.nakshatra.name, vara: panchang.vara.name });
        }
    }
    return { category, rules, matches };
}
