// Vedic Ephemeris Engine (backend / CommonJS) — accurate planetary positions via the
// `astronomy-engine` library (VSOP87/ELP2000-derived), instead of hand-rolled
// low-order Keplerian approximations.
//
// This is a CommonJS port of src/utils/vedic-ephemeris.js (the frontend uses ES
// modules via Vite; backend/* uses CommonJS via `require`), kept as one small
// duplicated file rather than a cross-boundary import so the frontend bundle and
// the backend/Cloud Run container each stay self-contained. Keep both in sync if
// the calculation logic ever changes.
//
// Returns TROPICAL geocentric ecliptic longitudes (degrees, 0-360). Callers apply
// the Lahiri ayanamsa subtraction themselves to get sidereal positions.

const Astronomy = require('astronomy-engine');

function norm360(deg) {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
}

/**
 * @param {Date} utcDate - JS Date already in UTC (not local time).
 * @returns {{sun:number, moon:number, mars:number, mercury:number, jupiter:number, venus:number, saturn:number}}
 *          All values are tropical geocentric ecliptic longitudes in degrees.
 */
function getTropicalLongitudes(utcDate) {
    const sun = norm360(Astronomy.SunPosition(utcDate).elon);
    const moon = norm360(Astronomy.EclipticGeoMoon(utcDate).lon);

    const bodies = {
        mars: Astronomy.Body.Mars,
        mercury: Astronomy.Body.Mercury,
        jupiter: Astronomy.Body.Jupiter,
        venus: Astronomy.Body.Venus,
        saturn: Astronomy.Body.Saturn,
    };

    const result = { sun, moon };
    for (const [key, body] of Object.entries(bodies)) {
        const vec = Astronomy.GeoVector(body, utcDate, true); // true = correct for light-travel time (astrometric)
        result[key] = norm360(Astronomy.Ecliptic(vec).elon);
    }
    return result;
}

/**
 * Mean lunar node (Rahu). True-node varies faster and briefly reverses direction;
 * the mean node is the standard choice in mainstream Vedic practice for Rahu/Ketu
 * placements, so we compute it directly rather than pulling it from astronomy-engine.
 */
function getMeanRahuTropical(utcDate) {
    const JD = utcDate.getTime() / 86400000 + 2440587.5;
    const T = (JD - 2451545.0) / 36525;
    return norm360(125.0445222 - 1934.1362608 * T + 0.0020708 * T * T + (T * T * T) / 450000);
}

/**
 * Lahiri (Chitra Paksha) Ayanamsa in degrees, for a given UTC date.
 */
function getLahiriAyanamsa(utcDate) {
    const JD = utcDate.getTime() / 86400000 + 2440587.5; // Unix epoch -> Julian Day
    const T = (JD - 2451545.0) / 36525; // Julian centuries from J2000.0
    return 23.85655556 + (1.39604167 * T) + (0.000308 * T * T);
}

/**
 * Convenience helper: sidereal (Vedic) Sun/Moon/planet/Rahu/Ketu longitudes for a
 * UTC date, i.e. tropical longitudes with the Lahiri ayanamsa already subtracted.
 */
function getSiderealLongitudes(utcDate) {
    const ayanamsa = getLahiriAyanamsa(utcDate);
    const trop = getTropicalLongitudes(utcDate);
    const rahuTrop = getMeanRahuTropical(utcDate);

    const sidereal = {};
    for (const [key, val] of Object.entries(trop)) {
        sidereal[key] = norm360(val - ayanamsa);
    }
    sidereal.rahu = norm360(rahuTrop - ayanamsa);
    sidereal.ketu = norm360(sidereal.rahu + 180);

    return { ...sidereal, ayanamsa };
}

module.exports = { getTropicalLongitudes, getSiderealLongitudes, getLahiriAyanamsa, getMeanRahuTropical, norm360 };
