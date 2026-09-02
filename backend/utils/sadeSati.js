// sadeSati.js
// Computes the real Shani Sade Sati (साढ़े साती) and Dhaiya (ढैया / Kantak
// Shani) timeline across a 100-year span from birth, by actually sampling
// Saturn's real sidereal transit position over time - not an average-motion
// approximation. Saturn's motion includes real retrograde arcs (~140 days/
// year), so sign-boundary crossings aren't perfectly evenly spaced; this
// samples coarsely first, then binary-searches each detected sign change
// down to the exact day.

const { getSiderealLongitudes } = require('./vedic-ephemeris');

const SAMPLE_INTERVAL_DAYS = 6; // coarse pass - fine enough that a full
// sign (30°) can't be crossed AND crossed back within one interval even
// during Saturn's fastest retrograde motion (~-0.13°/day at most)
const DAY_MS = 86400000;

function saturnSignAt(date) {
    const lon = getSiderealLongitudes(date).saturn;
    return Math.floor(lon / 30) + 1; // 1-12
}

/** Binary-searches the exact day Saturn's sign changes between two dates
 *  known to straddle a transition (signAt(before) !== signAt(after)). */
function findTransitionDate(beforeDate, afterDate, beforeSign) {
    let lo = beforeDate.getTime(), hi = afterDate.getTime();
    while (hi - lo > DAY_MS) {
        const mid = new Date(Math.floor((lo + hi) / 2));
        const midSign = saturnSignAt(mid);
        if (midSign === beforeSign) lo = mid.getTime();
        else hi = mid.getTime();
    }
    return new Date(hi);
}

/**
 * moonRashiSignNum: the natal Moon's sign (1-12).
 * birthDate: JS Date of birth.
 * yearsSpan: how many years forward from birth to compute (default 100).
 *
 * Returns: {
 *   sadeSatiPeriods: [{ phase: 'rising'|'peak'|'setting', startDate, endDate, saturnSign }],
 *   dhaiyaPeriods: [{ type: '4th'|'8th', startDate, endDate, saturnSign }],
 * }
 * Consecutive rising/peak/setting phases that directly follow one another
 * (Saturn moving forward without a long gap) are grouped implicitly by
 * simply listing them in chronological order - a full Sade Sati cycle is
 * three consecutive entries of phase rising->peak->setting.
 */
function calculateSadeSatiTimeline(moonRashiSignNum, birthDate, yearsSpan = 100) {
    const sadeSatiSigns = new Set([
        ((moonRashiSignNum - 1 - 2 + 12) % 12) + 1, // 12th from Moon (rising)
        moonRashiSignNum,                             // 1st from Moon (peak)
        (moonRashiSignNum % 12) + 1,                  // 2nd from Moon (setting)
    ]);
    const phaseOfSign = (sign) => {
        const twelfthFromMoon = ((moonRashiSignNum - 1 - 2 + 12) % 12) + 1;
        const secondFromMoon = (moonRashiSignNum % 12) + 1;
        if (sign === twelfthFromMoon) return 'rising';
        if (sign === moonRashiSignNum) return 'peak';
        if (sign === secondFromMoon) return 'setting';
        return null;
    };
    const dhaiyaSigns = {
        [((moonRashiSignNum - 1 + 3) % 12) + 1]: '4th',
        [((moonRashiSignNum - 1 + 7) % 12) + 1]: '8th',
    };

    const endDate = new Date(birthDate.getTime() + yearsSpan * 365.25 * DAY_MS);

    // Coarse pass: sample every SAMPLE_INTERVAL_DAYS, record Saturn's sign
    // and whether it's a hit (Sade Sati or Dhaiya sign) at each point.
    const samples = [];
    for (let t = birthDate.getTime(); t <= endDate.getTime(); t += SAMPLE_INTERVAL_DAYS * DAY_MS) {
        const d = new Date(t);
        samples.push({ date: d, sign: saturnSignAt(d) });
    }
    // Always include the final endpoint exactly.
    samples.push({ date: endDate, sign: saturnSignAt(endDate) });

    // Walk the samples, refine every sign-change boundary via binary search,
    // and build a flat list of "Saturn was in sign X from date A to date B"
    // segments - then filter to just the Sade Sati / Dhaiya signs.
    const segments = [];
    let segStart = samples[0].date;
    let segSign = samples[0].sign;
    for (let i = 1; i < samples.length; i++) {
        if (samples[i].sign !== segSign) {
            const transitionDate = findTransitionDate(samples[i - 1].date, samples[i].date, segSign);
            segments.push({ sign: segSign, start: segStart, end: transitionDate });
            segStart = transitionDate;
            segSign = samples[i].sign;
        }
    }
    segments.push({ sign: segSign, start: segStart, end: endDate });

    const sadeSatiPeriods = segments
        .filter(s => sadeSatiSigns.has(s.sign))
        .map(s => ({ phase: phaseOfSign(s.sign), startDate: s.start, endDate: s.end, saturnSign: s.sign }));

    const dhaiyaPeriods = segments
        .filter(s => dhaiyaSigns[s.sign] !== undefined)
        .map(s => ({ type: dhaiyaSigns[s.sign], startDate: s.start, endDate: s.end, saturnSign: s.sign }));

    return { sadeSatiPeriods, dhaiyaPeriods };
}

module.exports = { calculateSadeSatiTimeline };
