// astrologyI18n.js
// Language, numeral-system, and planet-label formatting for Kundali display —
// used by both the on-screen React chart/table components and the PDF
// generation payload, so both stay in sync from one source.

export const PLANET_LABELS = {
    hi_short: { sun: 'सू०', moon: 'चं०', mars: 'मं०', mercury: 'बु०', jupiter: 'गु०', venus: 'शु०', saturn: 'श०', rahu: 'रा०', ketu: 'के०' },
    en_short: { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' },
    hi_full: { sun: 'सूर्य', moon: 'चन्द्र', mars: 'मंगल', mercury: 'बुध', jupiter: 'बृहस्पति', venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु' },
    en_full: { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' },
};

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Converts any Latin-digit substring inside a value to Devanagari digits.
 * Works on numbers, strings containing numbers (e.g. "12°34'"), and dates.
 * Passing numeralSystem='latin' returns the value unchanged (as a string).
 */
export function formatNumeral(value, numeralSystem = 'latin') {
    const str = String(value);
    if (numeralSystem !== 'devanagari') return str;
    return str.replace(/[0-9]/g, d => DEVANAGARI_DIGITS[Number(d)]);
}

/** Formats a degree value as e.g. 12°34' in the chosen numeral system. */
export function formatDegMin(deg, min, numeralSystem = 'latin') {
    return `${formatNumeral(deg, numeralSystem)}°${formatNumeral(min, numeralSystem)}'`;
}

/**
 * Returns the correctly-labelled planet name for the given key
 * ('sun'|'moon'|'mars'|'mercury'|'jupiter'|'venus'|'saturn'|'rahu'|'ketu'),
 * language ('hi'|'en'), and label length ('short'|'full').
 */
export function formatPlanetLabel(planetKey, lang = 'hi', length = 'short') {
    const setKey = `${lang}_${length}`;
    return (PLANET_LABELS[setKey] && PLANET_LABELS[setKey][planetKey]) || planetKey;
}

/** House-number labels (1-12) as plain Latin or Devanagari numerals. */
export function formatHouseNumber(houseNum, numeralSystem = 'latin') {
    return formatNumeral(houseNum, numeralSystem);
}

/**
 * Default settings object - persisted in the KundaliSettingsBar component's
 * state and passed both to the live React chart/table render and as part of
 * the payload sent to the PDF-generation endpoint, so the downloaded PDF
 * matches whatever the user was looking at on screen.
 */
export const DEFAULT_KUNDALI_SETTINGS = {
    lang: 'hi',              // 'hi' | 'en'
    numeralSystem: 'latin',  // 'latin' | 'devanagari'
    planetLabelStyle: 'short', // 'short' | 'full'
};
