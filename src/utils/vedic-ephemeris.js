// Vedic Ephemeris Engine — accurate planetary positions via the `astronomy-engine`
// library (a well-tested, VSOP87/ELP2000-derived JS astronomy library), instead of
// hand-rolled low-order Keplerian approximations.
//
// Returns TROPICAL geocentric ecliptic longitudes (degrees, 0-360). Callers apply
// the Lahiri ayanamsa subtraction themselves to get sidereal positions, so this
// module stays focused on one job: accurate planetary geometry.

import * as Astronomy from 'astronomy-engine';

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
export function getTropicalLongitudes(utcDate) {
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
