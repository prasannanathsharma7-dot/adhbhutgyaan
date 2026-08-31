// AGENT: Life-Domain Synthesis Engine — api/agents/life-domain-synthesis.js
//
// Computes a -100..+100 "impact score" for Career, Finance, Health, and
// Relationship by combining (a) the person's active Vimshottari Dasha
// (long-term internal blueprint) with (b) current planetary transits/Gochar
// (external timing trigger), reusing the same accurate ephemeris and birth
// chart data as the Kundli Pre-Analyzer agent.
//
// This replaces an earlier draft (adapted from a third-party AI spec) whose
// astrology rules were not classically correct - notably a Yogakaraka list
// that didn't match traditional ascendant-wise Yogakaraka assignments, and a
// "Jupiter/Venus are always benefic, Saturn/Mars are always malefic" rule
// that ignores that a planet's functional nature in Vedic astrology depends
// on which houses it rules FOR THAT ASCENDANT, not the planet's fixed
// natural character. This version derives functional nature from actual
// house lordship, and computes a real Vimshottari Mahadasha/Antardasha
// instead of taking it as an unexplained input.
//
// SCOPE NOTE: Gochar (transit) strength here uses the classical, widely-used
// "Chandra Gochar" (Moon-sign-relative good/bated houses) system rather than
// full Ashtakvarga (Bhinnashtakvarga/Sarvashtakvarga). Full Ashtakvarga needs
// eight complete 12-sign benefic-point tables (one per graha + Lagna) which
// is a large, separate data-entry effort; Chandra Gochar is a standard
// simpler alternative used by most public astrology sites for this exact
// kind of "today's transit effect" feature, so this is a deliberate scope
// choice, not a shortcut pretending to be something more precise.

const { getSiderealLongitudes } = require('../utils/vedic-ephemeris');
const { computeVedicChartData, RASHIS, NAKSHATRAS } = require('./kundli-preanalyzer');
const { withCors, capStr } = require('../_db');
const { requireAgentAuth } = require('../utils/agent-auth');

const DOMAINS = ['CAREER', 'FINANCE', 'HEALTH', 'RELATIONSHIP'];

const DOMAIN_PRIMARY_HOUSES = {
    CAREER: [1, 6, 10, 11],       // self-effort, service/competition, career/status, gains
    FINANCE: [2, 5, 9, 11],       // wealth/savings, speculative gains, fortune, income
    HEALTH: [1, 6, 8],            // body/vitality, disease, longevity & chronic conditions
    RELATIONSHIP: [2, 4, 7, 11],  // family, domestic happiness, spouse/partnership, social bonds
};

const NATURAL_LORD_OF_SIGN = [
    'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
    'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
]; // index 0 = Aries (sign 1) ... index 11 = Pisces (sign 12)

const NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

// Classical Yogakaraka assignments — only these six ascendants produce a
// single planet that rules BOTH a Kendra (1/4/7/10) and a Trikona (1/5/9)
// house, which classical texts single out as an exceptionally strong,
// unambiguously benefic planet for that chart regardless of its natural
// character. (Dual-ruled and single-ruled signs - Gemini, Virgo, Sagittarius,
// Pisces, Aries, Scorpio - do not produce a Yogakaraka.)
const YOGAKARAKA_BY_ASCENDANT = {
    2: 'Saturn',  // Taurus asc: Saturn owns 9th (Capricorn) + 10th (Aquarius)
    4: 'Mars',    // Cancer asc: Mars owns 5th (Scorpio) + 10th (Aries)
    5: 'Mars',    // Leo asc: Mars owns 4th (Scorpio) + 9th (Aries)
    7: 'Saturn',  // Libra asc: Saturn owns 4th (Capricorn) + 5th (Aquarius)
    10: 'Venus',  // Capricorn asc: Venus owns 5th (Taurus) + 10th (Libra)
    11: 'Venus',  // Aquarius asc: Venus owns 4th (Taurus) + 9th (Libra... from Aquarius: 9th=Libra)
};

// Per-house weight used to build a planet's functional-nature score from the
// house(s) it rules for a given ascendant. Positive = houses classical texts
// treat as auspicious to rule (Kendra/Trikona/Upachaya); negative = Dusthana
// (6/8/12) and pure Maraka (2/7, tempered because 7 is also a Kendra).
// Natural benefics get slightly reduced credit for RULING a bare Kendra
// (4/10) - "Kendradhipati Dosha" - while natural malefics gain a bonus for
// the same, since a natural malefic owning only a Kendra is considered to
// give strong, direct results without the benefic being "neutralised".
function houseLordshipWeight(houseNum, planet) {
    const isNaturalBenefic = NATURAL_BENEFICS.includes(planet);
    switch (houseNum) {
        case 1: return 1.5;   // Lagna: always auspicious to rule
        case 5: return 1.5;   // Trikona
        case 9: return 1.5;   // Trikona (Bhagya)
        case 4: return isNaturalBenefic ? 0.5 : 1.0;  // pure Kendra
        case 10: return isNaturalBenefic ? 0.5 : 1.0; // pure Kendra
        case 7: return -0.5;  // Kendra + Maraka; kendra-ness tempers the maraka negativity
        case 2: return -0.5;  // pure Maraka
        case 3: return 0.25;  // Upachaya (mild, grows over time)
        case 11: return 0.75; // Upachaya + Labha (gains)
        case 6: return -1.5;  // Dusthana
        case 8: return -1.5;  // Dusthana (more severe - longevity/transformation)
        case 12: return -1.0; // Dusthana (loss/expense)
        default: return 0;
    }
}

/** Houses (1-12) ruled by `planet` for a given ascendant sign number (1-12). */
function housesRuledByPlanet(planet, ascendantSignNum) {
    const houses = [];
    for (let h = 1; h <= 12; h++) {
        const signOfHouse = ((ascendantSignNum - 1 + (h - 1)) % 12) + 1;
        if (NATURAL_LORD_OF_SIGN[signOfHouse - 1] === planet) houses.push(h);
    }
    return houses;
}

/**
 * Functional-nature score for a planet, for a given ascendant. Sun/Moon
 * always rule exactly one house; Mars/Mercury/Venus/Jupiter/Saturn rule two.
 * Rahu/Ketu own no houses classically, so their functional tone is derived
 * from the lord of the sign they are transiting/posited in (co-lordship), at
 * reduced (50%) weight, plus a small inherent shadow-planet malefic bias.
 */
function functionalNatureScore(planet, ascendantSignNum, occupiedSignNum) {
    if (planet === 'Rahu' || planet === 'Ketu') {
        const coLord = occupiedSignNum ? NATURAL_LORD_OF_SIGN[occupiedSignNum - 1] : null;
        const coLordScore = coLord ? functionalNatureScore(coLord, ascendantSignNum, null) : 0;
        return -0.5 + (0.5 * coLordScore);
    }

    const houses = housesRuledByPlanet(planet, ascendantSignNum);
    let score = houses.reduce((sum, h) => sum + houseLordshipWeight(h, planet), 0);

    if (YOGAKARAKA_BY_ASCENDANT[ascendantSignNum] === planet) {
        score += 2.0; // classical Yogakaraka bonus - best planet in the chart
    }
    return Math.round(score * 100) / 100;
}

// --- Vimshottari Dasha ---------------------------------------------------

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Standard Vimshottari Mahadasha/Antardasha as of `referenceDate`, derived
 * from the Moon's sidereal longitude at birth and the birth UTC instant.
 */
function computeVimshottariDasha(moonSiderealDeg, birthUtcDate, referenceDate) {
    const nakStep = 360 / 27;
    const nakIndex = Math.floor(moonSiderealDeg / nakStep);
    const firstLord = NAKSHATRAS[nakIndex].lord;
    const fractionElapsed = (moonSiderealDeg % nakStep) / nakStep;

    // Walk the 9-lord cycle from birth, starting with the balance of the
    // first (birth-nakshatra) Mahadasha, until we bracket referenceDate.
    let cursor = birthUtcDate.getTime();
    let lordIndex = DASHA_ORDER.indexOf(firstLord);
    let fullYears = DASHA_YEARS[firstLord];
    let remainingYears = fullYears * (1 - fractionElapsed);
    let mdStart = cursor - (fullYears - remainingYears) * YEAR_MS; // virtual full-period start
    let mdEnd = mdStart + fullYears * YEAR_MS;

    const target = referenceDate.getTime();
    let safety = 0;
    while (mdEnd < target && safety < 200) {
        lordIndex = (lordIndex + 1) % DASHA_ORDER.length;
        fullYears = DASHA_YEARS[DASHA_ORDER[lordIndex]];
        mdStart = mdEnd;
        mdEnd = mdStart + fullYears * YEAR_MS;
        safety++;
    }
    const mdLord = DASHA_ORDER[lordIndex];
    const mdFullYears = fullYears;
    const mdDurationMs = mdEnd - mdStart;

    // Antardashas subdivide the FULL Mahadasha span proportionally, starting
    // with the Mahadasha lord itself and cycling through the same 9-lord order.
    let adCursor = mdStart;
    let adLordIndex = lordIndex;
    let adLord = mdLord, adStart = adCursor, adEnd = adCursor;
    for (let i = 0; i < DASHA_ORDER.length; i++) {
        const lord = DASHA_ORDER[adLordIndex];
        const adDurationMs = (DASHA_YEARS[lord] / 120) * mdFullYears * YEAR_MS;
        const thisStart = adCursor;
        const thisEnd = adCursor + adDurationMs;
        if (target >= thisStart && target < thisEnd) {
            adLord = lord;
            adStart = thisStart;
            adEnd = thisEnd;
            break;
        }
        adCursor = thisEnd;
        adLordIndex = (adLordIndex + 1) % DASHA_ORDER.length;
    }

    return {
        mdLord, adLord,
        mdStart: new Date(mdStart).toISOString(),
        mdEnd: new Date(mdEnd).toISOString(),
        adStart: new Date(adStart).toISOString(),
        adEnd: new Date(adEnd).toISOString(),
        mdDurationYears: Math.round(mdFullYears * 10) / 10,
    };
}

/** House-distance (1-12) from the sign occupied by lordA to the sign occupied by lordB. */
function mutualPlacementDistance(signA, signB) {
    return ((signB - signA + 12) % 12) + 1;
}

function relationalModifier(distance) {
    if ([1, 4, 5, 7, 9, 10].includes(distance)) return 10;   // Kendra/Trikona to each other
    if ([6, 8].includes(distance)) return -15;                // Shad-Ashtaka
    if ([2, 12].includes(distance)) return -10;                // Dwir-Dwadasha
    return 0;
}

// --- Gochar (Chandra Gochar - Moon-sign-relative transit) -----------------

// Classical good/bad houses-from-Moon per planet ("Chandra Gochar Phal").
// This is the standard simplified transit system (distinct from, and a
// documented substitute for, full Ashtakvarga - see file header).
const GOCHAR_GOOD_HOUSES_FROM_MOON = {
    Sun: [3, 6, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [3, 6, 11],
    Mercury: [2, 4, 6, 8, 10, 11],
    Jupiter: [2, 5, 7, 9, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Saturn: [3, 6, 11],
    Rahu: [3, 6, 11],
    Ketu: [3, 6, 11],
};

// Relative weight of each transiting planet's influence — slower planets
// (Jupiter, Saturn, Rahu/Ketu) dominate medium-term timing; fast planets
// (Sun, Mercury, Venus, Moon) are treated as minor weekly overlays; Mars sits
// in between.
const TRANSIT_WEIGHTS = {
    Jupiter: 0.28, Saturn: 0.28, Rahu: 0.14, Ketu: 0.14,
    Mars: 0.08, Sun: 0.03, Mercury: 0.03, Venus: 0.02, Moon: 0,
    // Moon's own transit changes sign every ~2.25 days, too fast to matter
    // for a score meant to be stable for at least a day.
};

function gocharScoreForDomain(natalMoonSign, natalAscSign, transitSidereal, domain) {
    const primaryHouses = DOMAIN_PRIMARY_HOUSES[domain];
    let raw = 0;
    for (const [planet, weight] of Object.entries(TRANSIT_WEIGHTS)) {
        if (weight === 0) continue;
        const deg = transitSidereal[planet.toLowerCase()];
        if (deg === undefined) continue;
        const signNum = Math.floor(deg / 30) + 1;
        const houseFromMoon = ((signNum - natalMoonSign + 12) % 12) + 1;
        const houseFromAsc = ((signNum - natalAscSign + 12) % 12) + 1;

        const isGood = (GOCHAR_GOOD_HOUSES_FROM_MOON[planet] || []).includes(houseFromMoon);
        let base = isGood ? 18 : -14;
        if (planet === 'Saturn' && [12, 1, 2].includes(houseFromMoon)) base = -22; // Sade Sati emphasis
        if (planet === 'Moon' && houseFromMoon === 8) base = -18; // Chandrashtama (kept for completeness even though weight=0 currently)

        // Direct-hit bonus: transiting planet is currently occupying one of
        // this domain's own primary houses (from Lagna).
        const directHit = primaryHouses.includes(houseFromAsc) ? 1.4 : 1.0;

        raw += weight * base * directHit;
    }
    return raw;
}

function dualTransitResonance(natalAscSign, transitSidereal, domain) {
    const primaryHouses = DOMAIN_PRIMARY_HOUSES[domain];
    const jupSign = Math.floor(transitSidereal.jupiter / 30) + 1;
    const satSign = Math.floor(transitSidereal.saturn / 30) + 1;
    const jupHouse = ((jupSign - natalAscSign + 12) % 12) + 1;
    const satHouse = ((satSign - natalAscSign + 12) % 12) + 1;
    return (primaryHouses.includes(jupHouse) && primaryHouses.includes(satHouse)) ? 20 : 0;
}

// --- Domain synthesis -------------------------------------------------

function resolvePhase(dashaRaw, gocharRaw) {
    if (dashaRaw >= 1.0 && gocharRaw >= 5) return 'GOLDEN_WINDOW';
    if (dashaRaw >= 1.0 && gocharRaw < 5) return 'FRICTION_PROTECTED';
    if (dashaRaw < 1.0 && gocharRaw >= 5) return 'TEMPORARY_RELIEF';
    return 'TESTING_PHASE';
}

const HEADLINES = {
    GOLDEN_WINDOW: (d) => `Strong combined support for ${d.toLowerCase()} progress right now.`,
    FRICTION_PROTECTED: () => `Solid underlying foundation; external timing is asking for patience.`,
    TEMPORARY_RELIEF: () => `A favorable window while deeper factors are still consolidating.`,
    TESTING_PHASE: () => `A consolidation phase - steady effort matters more than big moves.`,
};

const ADVICE = {
    CAREER: {
        GOLDEN_WINDOW: 'Good window to pitch ideas, ask for what you deserve, and take on visible responsibility.',
        FRICTION_PROTECTED: 'Keep building skills and process; avoid unnecessary conflict with authority right now.',
        TEMPORARY_RELIEF: 'Use the immediate opening, but don\u2019t neglect the fundamentals underneath it.',
        TESTING_PHASE: 'Protect your core responsibilities and avoid an impulsive job change this period.',
    },
    FINANCE: {
        GOLDEN_WINDOW: 'A reasonable window for planned investments or income moves - avoid pure speculation.',
        FRICTION_PROTECTED: 'Favor steady saving over new leveraged bets for now.',
        TEMPORARY_RELIEF: 'Good time to clear short debts and build a cash cushion.',
        TESTING_PHASE: 'Tighten the budget and review recurring expenses before committing to anything new.',
    },
    HEALTH: {
        GOLDEN_WINDOW: 'Good energy for building strength and starting healthier routines.',
        FRICTION_PROTECTED: 'Prioritize recovery and sleep; don\u2019t push the body past its limits.',
        TEMPORARY_RELIEF: 'A good moment to address a nagging minor issue before it becomes chronic.',
        TESTING_PHASE: 'Focus on rest, simple nutrition, and stress management over intensity.',
    },
    RELATIONSHIP: {
        GOLDEN_WINDOW: 'Favorable for shared decisions, commitments, and repairing old friction.',
        FRICTION_PROTECTED: 'Keep outside stress from spilling into close relationships.',
        TEMPORARY_RELIEF: 'A workable moment to talk through a past misunderstanding.',
        TESTING_PHASE: 'Patience and clear boundaries matter more than grand gestures right now.',
    },
};

function evaluateDomain(domain, ctx) {
    const { ascendantSignNum, natalPlanetSigns, dasha, transitSidereal } = ctx;

    const mdScore = functionalNatureScore(dasha.mdLord, ascendantSignNum, natalPlanetSigns[dasha.mdLord]);
    const adScore = functionalNatureScore(dasha.adLord, ascendantSignNum, natalPlanetSigns[dasha.adLord]);

    const mdSign = natalPlanetSigns[dasha.mdLord];
    const adSign = natalPlanetSigns[dasha.adLord];
    const relational = (mdSign && adSign) ? relationalModifier(mutualPlacementDistance(mdSign, adSign)) : 0;

    // Weight each lord's contribution higher when it directly rules one of
    // this domain's houses (e.g. Mars in a Mercury MD matters more for
    // Career if Mercury itself rules Career houses for this ascendant).
    const mdHouses = housesRuledByPlanet(dasha.mdLord, ascendantSignNum);
    const adHouses = housesRuledByPlanet(dasha.adLord, ascendantSignNum);
    const mdRelevant = mdHouses.some(h => DOMAIN_PRIMARY_HOUSES[domain].includes(h)) ? 1.3 : 1.0;
    const adRelevant = adHouses.some(h => DOMAIN_PRIMARY_HOUSES[domain].includes(h)) ? 1.3 : 1.0;

    const dashaRaw = (0.65 * mdScore * mdRelevant * 20) + (0.35 * adScore * adRelevant * 20) + relational;

    const natalMoonSign = natalPlanetSigns.Moon;
    const gocharRaw = gocharScoreForDomain(natalMoonSign, ascendantSignNum, transitSidereal, domain);
    const resonance = dualTransitResonance(ascendantSignNum, transitSidereal, domain);

    const combined = Math.round((0.60 * dashaRaw) + (0.40 * gocharRaw) + resonance);
    const score = Math.max(-100, Math.min(100, combined));
    const phase = resolvePhase(dashaRaw, gocharRaw);

    return {
        score, phase,
        headline: HEADLINES[phase](domain),
        keyDriver: `${dasha.mdLord}-${dasha.adLord} Dasha with current transit timing across ${domain.toLowerCase()} houses.`,
        actionableAdvice: ADVICE[domain][phase],
        debug: { mdScore, adScore, relational, dashaRaw: Math.round(dashaRaw * 10) / 10, gocharRaw: Math.round(gocharRaw * 10) / 10, resonance },
    };
}

function runSynthesis(chart, referenceDate = new Date()) {
    const ascendantSignNum = RASHIS.findIndex(r => r.name === chart.lagna.rashi) + 1;
    const dasha = computeVimshottariDasha(chart._sidMoonDeg, chart._birthUtcDate, referenceDate);
    const transitSidereal = getSiderealLongitudes(referenceDate);

    const ctx = { ascendantSignNum, natalPlanetSigns: chart._planetSigns, dasha, transitSidereal };
    const domains = {};
    for (const d of DOMAINS) domains[d] = evaluateDomain(d, ctx);

    return {
        timestamp: referenceDate.toISOString(),
        meta: {
            ascendant: chart.lagna.rashi,
            moonSign: chart.moon.rashi,
            activeDasha: { md: dasha.mdLord, ad: dasha.adLord, mdEnds: dasha.mdEnd, adEnds: dasha.adEnd },
        },
        domains,
    };
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

    if (!requireAgentAuth(req, res)) return; // requireAgentAuth already sends the 401 response

    try {
        const body = req.body || {};
        const birthDate = capStr(body.birthDate, 20);   // YYYY-MM-DD
        const birthTime = capStr(body.birthTime, 20);   // HH:MM (24h) or "H:MM AM/PM"
        const lat = Number(body.latitude) || 25.3176;
        const lng = Number(body.longitude) || 82.9739;
        const tzOffset = Number(body.timezoneOffset ?? 5.5);

        if (!birthDate) {
            res.status(400).json({ ok: false, error: 'birthDate (YYYY-MM-DD) is required' });
            return;
        }

        const chart = computeVedicChartData(birthDate, birthTime, '', lat, lng, tzOffset);

        // computeVedicChartData doesn't expose raw sign numbers / the birth
        // UTC instant needed for Dasha math, so recompute those two small
        // pieces here the same way it internally does, rather than changing
        // its public return shape (kept stable for the existing Kundli
        // Pre-Analyzer callers).
        const [yStr, mStr, dStr] = (birthDate || '1995-01-01').split('-').map(Number);
        let [hStr, minStr] = (birthTime || '06:30').replace(/[^0-9:]/g, '').split(':').map(Number);
        if (Number.isNaN(hStr)) hStr = 6;
        if (Number.isNaN(minStr)) minStr = 30;
        if (birthTime && birthTime.toUpperCase().includes('PM') && hStr < 12) hStr += 12;
        else if (birthTime && birthTime.toUpperCase().includes('AM') && hStr === 12) hStr = 0;
        const utHours = (hStr + minStr / 60) - tzOffset;
        const birthUtcDate = new Date(Date.UTC(yStr, (mStr || 1) - 1, dStr || 1, 0, 0, 0) + utHours * 3600 * 1000);
        const natalSidereal = getSiderealLongitudes(birthUtcDate);
        const signOf = deg => Math.floor(deg / 30) + 1;

        chart._sidMoonDeg = natalSidereal.moon;
        chart._birthUtcDate = birthUtcDate;
        chart._planetSigns = {
            Sun: signOf(natalSidereal.sun), Moon: signOf(natalSidereal.moon), Mars: signOf(natalSidereal.mars),
            Mercury: signOf(natalSidereal.mercury), Jupiter: signOf(natalSidereal.jupiter), Venus: signOf(natalSidereal.venus),
            Saturn: signOf(natalSidereal.saturn), Rahu: signOf(natalSidereal.rahu), Ketu: signOf(natalSidereal.ketu),
        };

        const result = runSynthesis(chart);
        res.status(200).json({ ok: true, agent: 'Life-Domain Synthesis Engine', ...result });
    } catch (err) {
        console.error('life-domain-synthesis agent error:', err);
        res.status(500).json({ ok: false, error: 'Server error in Life-Domain Synthesis agent.', details: err.message || String(err) });
    }
};

module.exports.runSynthesis = runSynthesis;
module.exports.functionalNatureScore = functionalNatureScore;
module.exports.computeVimshottariDasha = computeVimshottariDasha;
