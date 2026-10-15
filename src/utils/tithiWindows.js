// Tithi windows (start and end instants) built on the verified Panchang engine, for the festival pages.
// The engine reports, per calendar day, the tithi at Varanasi sunrise, when it ends (clock time + day offset) and which
// tithi follows. From that we answer "which tithi is running at instant X, and when does it begin and end?" - which is
// what festival rules need (Diwali = Amavasya at pradosh, Dhanteras = Trayodashi at pradosh, Karwa Chauth = Chaturthi at
// moonrise, ...). A tithi that ends and is replaced twice between two sunrises (kshaya) is not resolved; it returns null.
import { calculateGlobalPanchang } from './astroEngine.js';

const IST_MS = 5.5 * 3600 * 1000;
export const VARANASI = { latitude: 25.3176, longitude: 82.9739, timezoneOffsetHours: 5.5 };

const clockMinutes = (s) => { const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(s || ''); if (!m) return null; return ((Number(m[1]) % 12) + (/PM/i.test(m[3]) ? 12 : 0)) * 60 + Number(m[2]); };
/** UTC milliseconds of an IST wall-clock moment: calendar day y-m-d plus `minutes` after midnight IST. */
export const istInstant = (y, m, d, minutes) => Date.UTC(y, m - 1, d) + minutes * 60000 - IST_MS;
const ymdOf = (ms) => { const x = new Date(ms + IST_MS); return [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()]; };
export const ymdString = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const cache = new Map();
/** Panchang facts for one IST calendar day: sunrise / sunset / sunrise tithi / its end instant / the tithi after it. */
export function dayInfo(y, m, d) {
    const key = `${y}-${m}-${d}`;
    if (cache.has(key)) return cache.get(key);
    const p = calculateGlobalPanchang({ date: new Date(y, m - 1, d, 12), ...VARANASI });
    const sunrise = clockMinutes(p.solar.sunrise), sunset = clockMinutes(p.solar.sunset);
    const e = p.tithi.endsAt;
    const info = {
        y, m, d, sunrise, sunset,
        tithi: p.tithi.name,
        end: e && e.time ? istInstant(y, m, d + (e.dayOffset || 0), clockMinutes(e.time)) : null,
        next: p.tithi.next,
    };
    cache.set(key, info);
    return info;
}

const norm = (name) => String(name || '').replace(/\s*\(.*\)\s*$/, ''); // "Amavasya (New Moon)" -> "Amavasya"

/**
 * The tithi running at `instant` (UTC ms) with its start and end instants (null when it cannot be resolved).
 * @returns {{name:string, start:number|null, end:number|null}}
 */
export function tithiAt(instant) {
    const [y, m, d] = ymdOf(instant);
    const day = dayInfo(y, m, d);
    if (day.end !== null && instant < day.end) {
        const [py, pm, pd] = ymdOf(istInstant(y, m, d, 0) - 3600000);
        const prev = dayInfo(py, pm, pd);
        return { name: norm(day.tithi), start: prev.end !== null && norm(prev.tithi) !== norm(day.tithi) ? prev.end : null, end: day.end };
    }
    const [ny, nm, nd] = ymdOf(istInstant(y, m, d + 1, 0) + 3600000);
    const nxt = dayInfo(ny, nm, nd);
    return { name: norm(day.next), start: day.end, end: norm(nxt.tithi) === norm(day.next) ? nxt.end : null };
}

/** Rule instants used by festival rules (UTC ms) for an IST calendar day. */
export function ruleInstant(basis, y, m, d) {
    const day = dayInfo(y, m, d);
    const daylight = day.sunset - day.sunrise;
    switch (basis) {
        case 'udaya': return istInstant(y, m, d, day.sunrise + 1);
        case 'midday': return istInstant(y, m, d, 12 * 60);
        case 'aparahna': return istInstant(y, m, d, Math.round(day.sunrise + 0.7 * daylight));
        case 'pradosh': return istInstant(y, m, d, day.sunset + 72); // middle of pradosh kaal (sunset to about 2h24m after)
        case 'moonrise': return istInstant(y, m, d, 20 * 60);        // Karwa Chauth moonrise at Varanasi is about 8 PM
        case 'night': return istInstant(y, m, d, 21 * 60);
        default: throw new Error(`unknown basis ${basis}`);
    }
}

export { formatIST } from './istFormat.js';

/**
 * Tithi events in a range: every Amavasya, Purnima, Ekadashi (both pakshas) and Pradosh (Trayodashi at pradosh).
 * @returns {Array<{date:string, kind:string, tithi:string, start:number|null, end:number|null}>}
 */
export function tithiEvents(fromYmd, days) {
    const out = [];
    const base = Date.UTC(fromYmd[0], fromYmd[1] - 1, fromYmd[2]);
    for (let i = 0; i < days; i++) {
        const x = new Date(base + i * 86400000); const y = x.getUTCFullYear(), m = x.getUTCMonth() + 1, d = x.getUTCDate();
        const date = ymdString(y, m, d);
        const sunrise = tithiAt(ruleInstant('udaya', y, m, d));
        if (/^Amavasya/.test(sunrise.name)) out.push({ date, kind: 'amavasya', tithi: sunrise.name, start: sunrise.start, end: sunrise.end });
        else if (/^Purnima/.test(sunrise.name)) out.push({ date, kind: 'purnima', tithi: sunrise.name, start: sunrise.start, end: sunrise.end });
        else if (/Ekadashi$/.test(sunrise.name)) out.push({ date, kind: /^Shukla/.test(sunrise.name) ? 'ekadashi-shukla' : 'ekadashi-krishna', tithi: sunrise.name, start: sunrise.start, end: sunrise.end });
        const pr = tithiAt(ruleInstant('pradosh', y, m, d));
        if (/Trayodashi$/.test(pr.name)) out.push({ date, kind: 'pradosh', tithi: pr.name, start: pr.start, end: pr.end });
    }
    return out;
}
