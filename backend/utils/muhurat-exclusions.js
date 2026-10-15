// Classical "no muhurat in these periods" rules for marriage and griha pravesh: Chaturmas and Kharmas (CommonJS copy
// of src/utils/muhuratExclusions.js - kept as a small duplicate for the same reason as the engines; both read
// src/data/muhuratExclusions.json and scripts/test-muhurat.mjs checks that they agree day by day).
const { getSiderealLongitudes } = require('./vedic-ephemeris');
const data = require('../../src/data/muhuratExclusions.json');

// The backend scans UTC-midnight dates (new Date('YYYY-MM-DD')), so the calendar day is read in UTC.
const ymd = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

function exclusionReasons(category, date) {
    const rules = data.appliesTo[category] || [];
    const reasons = [];
    const day = ymd(date);
    if (rules.includes('chaturmas')) {
        const p = data.chaturmas.find(c => day >= c.from && day <= c.to);
        if (p) reasons.push({ code: 'chaturmas', labelEn: p.labelEn, labelHi: p.labelHi, until: p.to });
    }
    if (rules.includes('kharmas')) {
        const sun = getSiderealLongitudes(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 6, 30))).sun;
        if (data.kharmas.sunSiderealSigns.includes(Math.floor(sun / 30))) reasons.push({ code: 'kharmas', labelEn: data.kharmas.labelEn, labelHi: data.kharmas.labelHi });
    }
    return reasons;
}

function coverage(category, endDate) {
    const needs = (data.appliesTo[category] || []).length > 0;
    return { verifiedThrough: data.verifiedThrough, complete: !needs || ymd(endDate) <= data.verifiedThrough };
}

module.exports = { exclusionReasons, coverage, exclusionData: data };
