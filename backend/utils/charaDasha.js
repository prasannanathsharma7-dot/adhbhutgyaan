// charaDasha.js
// Jaimini Chara Dasha: a 12-Rashi (sign-based, not planet-based) timing
// system. NOTE: unlike Vimshottari/Yogini (which have essentially
// universal agreement on their core formula), Chara Dasha has genuine
// methodological variation across Jaimini schools - the version here uses
// the most commonly-cited standard: starting sign = Lagna, duration =
// inclusive sign-count from the dasha-sign to its lord (direction set by
// odd/even sign), with same-sign lordship giving the maximum 12 years.

const SIGN_LORD = { 1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun', 6: 'mercury', 7: 'venus', 8: 'mars', 9: 'jupiter', 10: 'saturn', 11: 'saturn', 12: 'jupiter' };

function addYears(date, yearsFloat) {
    return new Date(date.getTime() + yearsFloat * 365.25 * 86400000);
}

/** Inclusive sign-count from `fromSign` to `toSign`, moving forward
 *  (direct) or backward (reverse) through the zodiac. */
function signCount(fromSign, toSign, direction) {
    if (fromSign === toSign) return 12; // lord in its own sign -> max duration
    let count = 1;
    let cur = fromSign;
    while (cur !== toSign) {
        cur = direction === 'forward' ? (cur % 12) + 1 : ((cur - 2 + 12) % 12) + 1;
        count++;
    }
    return count - 1;
}

/**
 * lagnaSignNum: 1-12.
 * planetSigns: { mars, venus, mercury, moon, sun, jupiter, saturn } - each
 * planet's current sign number (needed to find each sign-lord's placement).
 * birthDate: JS Date.
 * Returns: { mahadashas: [{ sign, signName, lord, years, startDate,
 *   endDate, antardashas: [...] }] } covering all 12 signs.
 */
function calculateCharaDasha(lagnaSignNum, planetSigns, birthDate, SIGN_NAMES) {
    const direction = lagnaSignNum % 2 === 1 ? 'forward' : 'reverse';

    const mahadashas = [];
    let cursor = new Date(birthDate);
    let currentSign = lagnaSignNum;

    for (let i = 0; i < 12; i++) {
        const lord = SIGN_LORD[currentSign];
        const lordSign = planetSigns[lord];
        const years = signCount(currentSign, lordSign, direction);
        const startDate = new Date(cursor);
        const endDate = addYears(cursor, years);

        // Antardashas: the same 12-sign sequence, starting from the
        // Mahadasha sign itself, each proportional to (Mahadasha years x 1)/12
        // - the standard even-division convention for Chara Dasha sub-periods.
        const antardashas = [];
        let subCursor = new Date(startDate);
        for (let j = 0; j < 12; j++) {
            const subSign = direction === 'forward' ? ((currentSign - 1 + j) % 12) + 1 : ((currentSign - 1 - j + 120) % 12) + 1;
            const subYears = years / 12;
            const subStart = new Date(subCursor);
            const subEnd = addYears(subCursor, subYears);
            antardashas.push({ sign: subSign, signName: SIGN_NAMES[subSign - 1], startDate: subStart, endDate: subEnd });
            subCursor = subEnd;
        }

        mahadashas.push({ sign: currentSign, signName: SIGN_NAMES[currentSign - 1], lord, years, startDate, endDate, antardashas });
        cursor = endDate;
        currentSign = direction === 'forward' ? (currentSign % 12) + 1 : ((currentSign - 2 + 12) % 12) + 1;
    }

    return { direction, mahadashas };
}

module.exports = { calculateCharaDasha, signCount };
