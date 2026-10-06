// Time-zone helpers for the city pages: "what time is Kashi's morning pooja
// slot where you live?". Uses the browser's built-in Intl database, so DST
// changes are handled by the platform rather than hardcoded offsets.

const IST_OFFSET_MIN = 330; // Kashi / all of India: UTC+5:30, no daylight saving

export function utcOffsetMinutes(timeZone, date = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date);
        const name = (parts.find(p => p.type === 'timeZoneName') || {}).value || '';
        if (name === 'GMT') return 0;
        const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        if (!m) return null;
        return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3] || '0', 10));
    } catch {
        return null; // very old browser without longOffset support: the section simply hides
    }
}

/** How far a city is from Kashi: { minutes: absolute, ahead: true if the city is ahead of Kashi } */
export function offsetFromKashi(timeZone, date = new Date()) {
    const off = utcOffsetMinutes(timeZone, date);
    if (off === null) return null;
    const diff = off - IST_OFFSET_MIN;
    return { minutes: Math.abs(diff), ahead: diff > 0 };
}

const ymd = (d, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

/**
 * Converts a Kashi (IST) clock time, "today", into the given time zone.
 * Returns { time: '7:30 PM', dayShift: -1 | 0 | 1 } or null if unsupported.
 */
export function convertKashiTime(hour, minute, timeZone, date = new Date()) {
    try {
        const istNow = new Date(date.getTime() + IST_OFFSET_MIN * 60000);
        const instant = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate(), hour, minute) - IST_OFFSET_MIN * 60000);
        const time = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).format(instant);
        const istDay = ymd(instant, 'Asia/Kolkata');
        const localDay = ymd(instant, timeZone);
        const dayShift = localDay === istDay ? 0 : (localDay < istDay ? -1 : 1);
        return { time, dayShift };
    } catch {
        return null;
    }
}
