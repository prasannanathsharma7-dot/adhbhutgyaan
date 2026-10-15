// Light formatting helpers for IST dates and tithi names (no astronomy imports, so the homepage widget stays tiny).
const PREFIX = { Shukla: 'शुक्ल', Krishna: 'कृष्ण' };
const HI = { Pratipada: 'प्रतिपदा', Dwitiya: 'द्वितीया', Tritiya: 'तृतीया', Chaturthi: 'चतुर्थी', Panchami: 'पंचमी', Shashthi: 'षष्ठी', Saptami: 'सप्तमी', Ashtami: 'अष्टमी', Navami: 'नवमी', Dashami: 'दशमी', Ekadashi: 'एकादशी', Dwadashi: 'द्वादशी', Trayodashi: 'त्रयोदशी', Chaturdashi: 'चतुर्दशी', Purnima: 'पूर्णिमा', Amavasya: 'अमावस्या' };

export function tithiLabel(name, lang = 'en') {
    if (lang !== 'hi') return name;
    const [first, second] = String(name).split(' ');
    return second ? `${PREFIX[first] || first} ${HI[second] || second}` : (HI[first] || first);
}

// Deterministic formatting (no Intl): the server-rendered HTML and the browser must produce byte-identical text, and Node's
// and Chromium's ICU data differ in small ways (am/pm case, narrow no-break spaces) which broke React hydration (#418).
const EN_M_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_M_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EN_WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_WD_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HI_M_SHORT = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
const HI_M_LONG = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const HI_WD_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const HI_WD_LONG = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const IST_MS = 5.5 * 3600000;

/** "8 Nov, 11:28 AM" in IST, whatever the visitor's own time zone. */
export function formatIST(ms, lang = 'en') {
    const x = new Date(ms + IST_MS);
    const mon = (lang === 'hi' ? HI_M_SHORT : EN_M_SHORT)[x.getUTCMonth()];
    const h24 = x.getUTCHours(); const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${x.getUTCDate()} ${mon}, ${h}:${String(x.getUTCMinutes()).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

/** A "YYYY-MM-DD" calendar date as text: opts { weekday:'short'|'long', day, month:'short'|'long', year }. */
export function formatDay(ymd, lang = 'en', opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
    const [y, m, d] = ymd.split('-').map(Number);
    const wdIdx = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const hi = lang === 'hi';
    const parts = [];
    if (opts.weekday) parts.push((hi ? (opts.weekday === 'long' ? HI_WD_LONG : HI_WD_SHORT) : (opts.weekday === 'long' ? EN_WD_LONG : EN_WD_SHORT))[wdIdx] + ',');
    if (opts.day) parts.push(String(d));
    if (opts.month) parts.push((hi ? (opts.month === 'long' ? HI_M_LONG : HI_M_SHORT) : (opts.month === 'long' ? EN_M_LONG : EN_M_SHORT))[m - 1]);
    if (opts.year) parts.push(String(y));
    return parts.join(' ');
}

/** Today's calendar date in IST as "YYYY-MM-DD". */
export const todayIST = (now = Date.now()) => new Date(now + 5.5 * 3600000).toISOString().slice(0, 10);

/** "Amavasya: 8 Nov, 11:28 AM -> 9 Nov, 12:32 PM" */
export function windowText(w, lang = 'en') {
    const label = tithiLabel(w.tithi, lang);
    if (!w.start && !w.end) return label;
    const a = w.start ? formatIST(Date.parse(w.start), lang) : '';
    const b = w.end ? formatIST(Date.parse(w.end), lang) : '';
    return `${label}: ${a}${a && b ? ' → ' : ''}${b}`;
}
