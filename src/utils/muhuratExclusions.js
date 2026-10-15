// Classical "no muhurat in these periods" rules for marriage and griha pravesh: Chaturmas and Kharmas.
// The base engine (muhuratEngine.js) only screens tithi / nakshatra / weekday; without these exclusions it happily
// proposed marriage dates in Chaturmas (e.g. 17 and 24 Oct 2026) and in Kharmas (14 Mar - 14 Apr 2026).
// Data: src/data/muhuratExclusions.json (shared with the backend copy: backend/utils/muhurat-exclusions.js).
// Both copies are checked against each other by scripts/test-muhurat.mjs.
import { getSiderealLongitudes } from './vedic-ephemeris.js';
import data from '../data/muhuratExclusions.json' with { type: 'json' };

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Reasons (possibly none) why `category` has no muhurat on the calendar day of `date` (local date). */
export function exclusionReasons(category, date) {
    const rules = data.appliesTo[category] || [];
    const reasons = [];
    const day = ymd(date);
    if (rules.includes('chaturmas')) {
        const p = data.chaturmas.find(c => day >= c.from && day <= c.to);
        if (p) reasons.push({ code: 'chaturmas', labelEn: p.labelEn, labelHi: p.labelHi, until: p.to });
    }
    if (rules.includes('kharmas')) {
        // Sun's sidereal sign at 12:00 IST (06:30 UTC) of that calendar day
        const sun = getSiderealLongitudes(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 6, 30))).sun;
        if (data.kharmas.sunSiderealSigns.includes(Math.floor(sun / 30))) reasons.push({ code: 'kharmas', labelEn: data.kharmas.labelEn, labelHi: data.kharmas.labelHi });
    }
    return reasons;
}

/** Whether the exclusion data covers the whole scanned range for this category (false -> tell the reader). */
export function coverage(category, endDate) {
    const needs = (data.appliesTo[category] || []).length > 0;
    return { verifiedThrough: data.verifiedThrough, complete: !needs || ymd(endDate) <= data.verifiedThrough };
}
export { data as exclusionData };
