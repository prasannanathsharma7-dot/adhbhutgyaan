// tajikVarshphal.js
// Tajik Varshphal: the annual solar-return chart. Varsha Pravesh (exact
// return moment) found by binary search on the Sun's real sidereal
// longitude (same technique as sadeSati.js's transit-boundary search).
// Muntha uses the user's own specified formula. Varshesh here is
// simplified to the Varsha Lagna's own lord (the full classical
// Panchadhikari selection among 5 candidates is a further refinement not
// attempted here - disclosed, not silently approximated).

const { getSiderealLongitudes, getLahiriAyanamsa } = require('./vedic-ephemeris');

const DAY_MS = 86400000;
const SIGN_LORD = { 1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun', 6: 'mercury', 7: 'venus', 8: 'mars', 9: 'jupiter', 10: 'saturn', 11: 'saturn', 12: 'jupiter' };
const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

function findVarshaPravesh(natalSunLongitude, birthDate, targetYear) {
    const approxDate = new Date(birthDate);
    approxDate.setUTCFullYear(targetYear);

    let lo = approxDate.getTime() - 3 * DAY_MS;
    let hi = approxDate.getTime() + 3 * DAY_MS;

    for (let i = 0; i < 30; i++) {
        const mid = new Date((lo + hi) / 2);
        const lon = getSiderealLongitudes(mid).sun;
        let diff = lon - natalSunLongitude;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        if (diff < 0) lo = mid.getTime(); else hi = mid.getTime();
    }
    return new Date(hi);
}

function calculateVarshaLagna(varshaPraveshDate, lat, lng) {
    const jd = varshaPraveshDate.getTime() / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    const lst = ((gmst + lng) % 360 + 360) % 360;
    const obliquity = 23.4392911;
    const lstRad = lst * Math.PI / 180;
    const oblRad = obliquity * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const tanAsc = -Math.cos(lstRad) / (Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad));
    let tropicalAsc = Math.atan(tanAsc) * 180 / Math.PI;
    if (Math.cos(lstRad) > 0) tropicalAsc += 180;
    tropicalAsc = ((tropicalAsc % 360) + 360) % 360;
    const ayanamsa = getLahiriAyanamsa(varshaPraveshDate);
    return ((tropicalAsc - ayanamsa) % 360 + 360) % 360;
}

function calculateMuntha(birthLagnaSign, completedYears) {
    let sign = (birthLagnaSign + completedYears) % 12;
    if (sign === 0) sign = 12;
    return sign;
}

function calculateMuddaDasha(vimshottariStartingLord, varshaPraveshDate) {
    const startIdx = DASHA_ORDER.indexOf(vimshottariStartingLord);
    const periods = [];
    let cursor = new Date(varshaPraveshDate);
    for (let i = 0; i < 9; i++) {
        const lord = DASHA_ORDER[(startIdx + i) % 9];
        const days = (DASHA_YEARS[lord] / 120) * 365.25;
        const startDate = new Date(cursor);
        const endDate = new Date(cursor.getTime() + days * DAY_MS);
        periods.push({ lord, days, startDate, endDate });
        cursor = endDate;
    }
    return periods;
}

module.exports = { findVarshaPravesh, calculateVarshaLagna, calculateMuntha, calculateMuddaDasha, SIGN_LORD };
