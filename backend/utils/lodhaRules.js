// lodhaRules.js
// Classical Vedic-astrology rules (Panchadha Maitri, Manglik cancellation,
// Combustion) as commonly documented across Parashari texts including
// Bhartiya Kundali Vigyan-style manuals. These are standard, widely-shared
// classical methods, not verbatim text from any single copyrighted book.
//
// Pure functions - take plain data (planet longitudes/signs), return plain
// results. No dependency on kundliEngine.js's internals, so they plug in
// alongside the existing dosha calculations without touching them.

const PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

// Naisargika (natural/permanent) friendship - fixed, does not depend on the
// chart. Standard Parashari table (Brihat Parashara Hora Shastra Ch. 4).
const NAISARGIKA = {
    sun: { friends: ['moon', 'mars', 'jupiter'], neutral: ['mercury'], enemies: ['venus', 'saturn'] },
    moon: { friends: ['sun', 'mercury'], neutral: ['mars', 'jupiter', 'venus', 'saturn'], enemies: [] },
    mars: { friends: ['sun', 'moon', 'jupiter'], neutral: ['venus', 'saturn'], enemies: ['mercury'] },
    mercury: { friends: ['sun', 'venus'], neutral: ['mars', 'jupiter', 'saturn'], enemies: ['moon'] },
    jupiter: { friends: ['sun', 'moon', 'mars'], neutral: ['saturn'], enemies: ['mercury', 'venus'] },
    venus: { friends: ['mercury', 'saturn'], neutral: ['mars', 'jupiter'], enemies: ['sun', 'moon'] },
    saturn: { friends: ['mercury', 'venus'], neutral: ['jupiter'], enemies: ['sun', 'moon', 'mars'] },
};

function naisargikaStatus(fromPlanet, toPlanet) {
    const rel = NAISARGIKA[fromPlanet];
    if (rel.friends.includes(toPlanet)) return 'friend';
    if (rel.enemies.includes(toPlanet)) return 'enemy';
    return 'neutral';
}

/**
 * Tatkalik (temporary) friendship - depends on the actual chart. Classical
 * rule: planets in houses 2,3,4,10,11,12 FROM a given planet's own house
 * are its temporary friends; houses 1,5,6,7,8,9 are its temporary enemies.
 * planetSigns: { sun: signNum(1-12), moon: signNum, ... }
 */
function tatkalikStatus(planetSigns, fromPlanet, toPlanet) {
    const fromSign = planetSigns[fromPlanet];
    const toSign = planetSigns[toPlanet];
    const dist = ((toSign - fromSign + 12) % 12) + 1; // 1-12
    const friendHouses = [2, 3, 4, 10, 11, 12];
    return friendHouses.includes(dist) ? 'friend' : 'enemy';
}

// Combining Naisargika + Tatkalik into the 5-tier Panchadha result -
// standard classical combination table.
function combineMaitri(naisargika, tatkalik) {
    if (naisargika === 'friend' && tatkalik === 'friend') return 'adhiMitra';
    if (naisargika === 'friend' && tatkalik === 'enemy') return 'sama';
    if (naisargika === 'neutral' && tatkalik === 'friend') return 'mitra';
    if (naisargika === 'neutral' && tatkalik === 'enemy') return 'shatru';
    if (naisargika === 'enemy' && tatkalik === 'friend') return 'sama';
    if (naisargika === 'enemy' && tatkalik === 'enemy') return 'adhiShatru';
    return 'sama';
}

const MAITRI_LABELS = {
    adhiMitra: { hi: 'अधिमित्र', en: 'Great Friend' },
    mitra: { hi: 'मित्र', en: 'Friend' },
    sama: { hi: 'सम', en: 'Neutral' },
    shatru: { hi: 'शत्रु', en: 'Enemy' },
    adhiShatru: { hi: 'अधिशत्रु', en: 'Great Enemy' },
};

/**
 * Builds the full 7x7 Panchadha Maitri table for a chart.
 * planetSigns: { sun: 1-12, moon: 1-12, mars: 1-12, mercury: 1-12,
 *                jupiter: 1-12, venus: 1-12, saturn: 1-12 }
 * Returns: { sun: { moon: 'adhiMitra', mars: 'mitra', ... }, ... }
 */
function computePanchadhaMaitri(planetSigns) {
    const table = {};
    for (const from of PLANETS) {
        table[from] = {};
        for (const to of PLANETS) {
            if (from === to) continue;
            const nai = naisargikaStatus(from, to);
            const tat = tatkalikStatus(planetSigns, from, to);
            table[from][to] = combineMaitri(nai, tat);
        }
    }
    return table;
}

function maitriLabel(tier, lang = 'hi') {
    return (MAITRI_LABELS[tier] && MAITRI_LABELS[tier][lang]) || tier;
}

// ---------------------------------------------------------------------
// Manglik Dosha with classical cancellation (Bhanga) rules
// ---------------------------------------------------------------------

const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];
// Mars is NOT considered afflicted when placed in its own sign (Aries/
// Scorpio) or exalted (Capricorn) - a widely-cited classical cancellation.
const MARS_OWN_OR_EXALTED_SIGNS = [1, 8, 10]; // Aries, Scorpio, Capricorn

/**
 * marsHouse: Mars's house number (1-12) from the reference point (Lagna,
 * Moon, or Venus - call this once per reference point).
 * marsSign: Mars's actual sign number (1-12), used for the own/exalted check.
 * jupiterAspectsMars: boolean - whether Jupiter aspects Mars (a classical
 * cancellation factor: Guru's benefic aspect is said to neutralise the
 * affliction).
 */
function evaluateManglik(marsHouse, marsSign, jupiterAspectsMars = false) {
    const isInAfflictedHouse = MANGLIK_HOUSES.includes(marsHouse);
    if (!isInAfflictedHouse) {
        return { hasDosh: false, cancelled: false, reason: 'not_in_manglik_house' };
    }
    if (MARS_OWN_OR_EXALTED_SIGNS.includes(marsSign)) {
        return { hasDosh: false, cancelled: true, reason: 'mars_own_or_exalted' };
    }
    if (jupiterAspectsMars) {
        return { hasDosh: false, cancelled: true, reason: 'jupiter_aspect' };
    }
    return { hasDosh: true, cancelled: false, reason: 'active' };
}

/**
 * Combines Lagna/Moon/Venus-reference Manglik evaluations into one verdict.
 * Classical practice: dosha is considered significant if active from at
 * least two of the three reference points (Lagna, Moon, Venus) - using all
 * three, not just Lagna+Moon, is itself a Lodha-style refinement over the
 * simpler two-reference check.
 */
function combinedManglikVerdict(fromLagna, fromMoon, fromVenus) {
    const activeCount = [fromLagna, fromMoon, fromVenus].filter(r => r.hasDosh).length;
    return {
        hasDosh: activeCount >= 2,
        severity: activeCount === 3 ? 'high' : activeCount === 2 ? 'moderate' : activeCount === 1 ? 'mild' : 'none',
        fromLagna, fromMoon, fromVenus,
    };
}

// ---------------------------------------------------------------------
// Combustion (Ast/Asta) - classical orb distances from the Sun
// ---------------------------------------------------------------------

// Widely-cited classical combustion orbs (degrees of separation from the
// Sun within which a planet is considered combust). Mercury and Venus have
// a tighter orb when retrograde.
const COMBUSTION_ORBS = {
    moon: 12, mars: 17, mercury: 14, mercuryRetro: 12,
    jupiter: 11, venus: 10, venusRetro: 8, saturn: 15,
};

/**
 * sunLongitude, planetLongitude: sidereal longitudes in degrees (0-360).
 * isRetrograde: only relevant for mercury/venus.
 */
function isCombust(planetKey, sunLongitude, planetLongitude, isRetrograde = false) {
    if (planetKey === 'sun' || planetKey === 'rahu' || planetKey === 'ketu') return false;
    let orb = COMBUSTION_ORBS[planetKey];
    if (planetKey === 'mercury' && isRetrograde) orb = COMBUSTION_ORBS.mercuryRetro;
    if (planetKey === 'venus' && isRetrograde) orb = COMBUSTION_ORBS.venusRetro;
    if (orb === undefined) return false;
    let diff = Math.abs(sunLongitude - planetLongitude);
    if (diff > 180) diff = 360 - diff;
    return diff <= orb;
}

module.exports = { computePanchadhaMaitri, maitriLabel, evaluateManglik, combinedManglikVerdict, isCombust };
