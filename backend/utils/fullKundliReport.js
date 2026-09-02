// fullKundliReport.js
// Assembles every piece needed for the 24-page PDF: the existing D1 chart
// data (computeVedicChartData), all divisional charts, Vimshottari Dasha,
// Avakahada Chakra fields, and the birth-date Panchang - into one object.

const { computeVedicChartData } = require('../agents/kundli-preanalyzer');
const { calculateGlobalPanchang } = require('./panchang-engine');
const { getSiderealLongitudes } = require('./vedic-ephemeris');
const divs = require('./divisionalCharts');
const { calculateVimshottariDasha } = require('./vimshottariDasha');
const { getAvakahada } = require('./avakahadaChakra');
const { computePanchadhaMaitri, maitriLabel } = require('./lodhaRules');

const NAKSHATRA_NAMES = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];
const SIGN_NAMES = ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];

function computeFullKundliReport(dob, tob, pob, lat, lng, tzOffset) {
    const base = computeVedicChartData(dob, tob, pob, lat, lng, tzOffset);

    // Re-derive the raw UTC birth instant + sidereal longitudes (needed for
    // divisional-chart and dasha math, which work on raw degrees, not the
    // already-formatted strings in `base`).
    const [y, m, d] = dob.split('-').map(Number);
    // Defensively extract just the leading HH:MM regardless of any trailing
    // text (e.g. the frontend's "02:20 (02:20 AM)" display format) - a
    // naive split(':') on that full string would silently produce NaN for
    // minutes and corrupt every downstream calculation.
    const tobMatch = String(tob || '06:30').match(/^(\d{1,2}):(\d{1,2})/);
    const [hh, mm] = tobMatch ? [Number(tobMatch[1]), Number(tobMatch[2])] : [6, 30];
    const localDate = new Date(Date.UTC(y, m - 1, d, hh, mm));
    const utcDate = new Date(localDate.getTime() - tzOffset * 3600000);
    const sid = getSiderealLongitudes(utcDate);

    const planetLongitudes = {
        sun: sid.sun, moon: sid.moon, mars: sid.mars, mercury: sid.mercury,
        jupiter: sid.jupiter, venus: sid.venus, saturn: sid.saturn, rahu: sid.rahu, ketu: sid.ketu,
    };

    // Divisional charts for all 9 planets (+ Lagna where the raw longitude
    // is available). Each entry: { sign: 1-12, signName }.
    function buildVarga(fn, useLordField) {
        const result = {};
        for (const [key, lon] of Object.entries(planetLongitudes)) {
            const out = fn(lon);
            if (useLordField) {
                result[key] = { sign: out.sign, signName: SIGN_NAMES[out.sign - 1], lord: out.lord };
            } else {
                result[key] = { sign: out, signName: SIGN_NAMES[out - 1] };
            }
        }
        return result;
    }

    const divisionalCharts = {
        d2: buildVarga(divs.d2Hora),
        d3: buildVarga(divs.d3Drekkana),
        d7: buildVarga(divs.d7Saptamsha),
        d9: buildVarga(divs.d9Navamsha),
        d12: buildVarga(divs.d12Dwadashamsha),
        d30: buildVarga(divs.d30Trimshamsha, true),
    };

    // Each divisional chart's OWN Lagna (Ascendant) position - needed so the
    // chart house-plot below can place house 1 at the varga's actual Lagna
    // sign, not always Aries (which was a real simplification the site had
    // before this fix - it produced a chart with correct planet SIGNS but a
    // meaningless house layout, since houses are always counted from the
    // varga's own Lagna, not from Aries).
    const lagnaLon = base.lagna.longitude;
    const vargaLagnaSign = {
        d2: divs.d2Hora(lagnaLon),
        d3: divs.d3Drekkana(lagnaLon),
        d7: divs.d7Saptamsha(lagnaLon),
        d9: divs.d9Navamsha(lagnaLon),
        d12: divs.d12Dwadashamsha(lagnaLon),
        d30: divs.d30Trimshamsha(lagnaLon).sign,
    };

    // Vimshottari Dasha (from Moon's real sidereal longitude + birth instant)
    const dasha = calculateVimshottariDasha(sid.moon, utcDate);

    // Avakahada Chakra fields (from Moon's nakshatra index)
    const moonNakshatraIndex = Math.floor(sid.moon / (360 / 27));
    const avakahada = getAvakahada(moonNakshatraIndex);

    // Panchadha Maitri (5-tier planetary friendship) - needs each planet's
    // SIGN NUMBER (not raw longitude).
    const planetSigns = {};
    for (const [key, lon] of Object.entries(planetLongitudes)) {
        if (key === 'rahu' || key === 'ketu') continue; // lodhaRules table covers the 7 classical grahas only
        planetSigns[key] = Math.floor((((lon % 360) + 360) % 360) / 30) + 1;
    }
    const panchadhaMaitri = computePanchadhaMaitri(planetSigns);

    // Birth-date Panchang (Tithi/Nakshatra/Yoga/Karana/Vara for that day)
    const panchang = calculateGlobalPanchang({ date: utcDate, latitude: lat, longitude: lng, timezoneOffsetHours: tzOffset });

    return {
        ...base,
        planetLongitudes,
        divisionalCharts,
        vargaLagnaSign,
        dasha,
        avakahada,
        panchadhaMaitri,
        panchang,
        utcDate,
    };
}

module.exports = { computeFullKundliReport, maitriLabel, SIGN_NAMES, NAKSHATRA_NAMES };
