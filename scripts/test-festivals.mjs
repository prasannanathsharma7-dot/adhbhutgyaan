// Festival data must stay true: dates are checked against the published sources, tithis against the verified Panchang
// engine, and the committed JSON must equal what the engine produces now (no hand-edited or stale data).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildFestivals, FESTIVAL_DEFINITIONS } from './build-festivals.mjs';
import { tithiAt, ruleInstant, tithiEvents, istInstant } from '../src/utils/tithiWindows.js';
import { buildCatalog } from '../src/catalog/catalog.js';
import { formatIST, formatDay, windowText, tithiLabel, todayIST } from '../src/utils/istFormat.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };

// Dates as published (checked 14-15 Oct 2026): Drik Panchang festival calendar, Boldsky, Hindutone, SmartPuja, HinduPad, Daanyam,
// PanchangBodh. Where sources differ by tradition (Dev Uthani: Smarta 20 Nov / Vaishnava 21 Nov) both are recorded.
const PUBLISHED = {
    'dussehra': '2026-10-20', 'papankusha-ekadashi': '2026-10-22', 'sharad-purnima': '2026-10-25', 'karwa-chauth': '2026-10-29',
    'ahoi-ashtami': '2026-11-01', 'rama-ekadashi': '2026-11-05', 'dhanteras': '2026-11-06', 'diwali': '2026-11-08',
    'bhai-dooj': '2026-11-11', 'dev-uthani-ekadashi': '2026-11-20', 'dev-deepawali': '2026-11-24',
};

console.log('\n\x1b[1m[1] Dates match the published calendars\x1b[0m');
for (const f of FESTIVAL_DEFINITIONS) check(PUBLISHED[f.id] === f.date, `${f.id}: ${f.date}`);
check(Object.keys(PUBLISHED).length === FESTIVAL_DEFINITIONS.length, 'every listed festival has a published date to check against');
check(FESTIVAL_DEFINITIONS.find(f => f.id === 'dev-uthani-ekadashi').alsoDate === '2026-11-21', 'Dev Uthani records both the Smarta (20 Nov) and Vaishnava (21 Nov) dates');

console.log('\n\x1b[1m[2] The tithi on each festival day matches the rule the shastras use\x1b[0m');
const built = buildFestivals();
for (const f of built) check(f.window.tithi === f.tithi, `${f.id}: ${f.tithi} at ${f.basis} -> engine says ${f.window.tithi}`);
for (const f of built) {
    const [y, m, d] = f.date.split('-').map(Number); const at = ruleInstant(f.basis, y, m, d);
    check(f.window.start && f.window.end && Date.parse(f.window.start) <= at && at < Date.parse(f.window.end), `${f.id}: the tithi window contains the rule moment`);
}

console.log('\n\x1b[1m[3] Spot checks of times against published panchangs\x1b[0m');
{
    const ist = (iso) => new Date(Date.parse(iso) + 5.5 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
    const by = Object.fromEntries(built.map(f => [f.id, f]));
    check(ist(by['diwali'].window.start) === '2026-11-08 11:28' && ist(by['diwali'].window.end) === '2026-11-09 12:32', 'Diwali: Amavasya 8 Nov 11:28 -> 9 Nov 12:32 (IST)');
    check(ist(by['dhanteras'].window.start) === '2026-11-06 10:31' && ist(by['dhanteras'].window.end) === '2026-11-07 10:48', 'Dhanteras: Trayodashi 6 Nov 10:31 -> 7 Nov 10:48');
    check(ist(by['dev-deepawali'].window.start) === '2026-11-23 23:43' && ist(by['dev-deepawali'].window.end) === '2026-11-24 20:23', 'Dev Deepawali: Purnima 23 Nov 23:43 -> 24 Nov 20:23');
    check(ist(by['sharad-purnima'].window.start) === '2026-10-25 11:56' && ist(by['sharad-purnima'].window.end) === '2026-10-26 09:42', 'Sharad Purnima: Purnima 25 Oct 11:56 -> 26 Oct 09:42');
    check(ist(by['karwa-chauth'].window.end) === '2026-10-29 22:11', 'Karwa Chauth: Chaturthi ends 29 Oct 22:11');
}

console.log('\n\x1b[1m[4] The committed data equals what the engine produces (no drift, no hand edits)\x1b[0m');
{
    const file = read('src/data/festivals.json').festivals;
    check(JSON.stringify(file) === JSON.stringify(JSON.parse(JSON.stringify(built))), 'src/data/festivals.json is exactly the output of scripts/build-festivals.mjs (run it after any change)');
    check(file.every((f, i) => i === 0 || file[i - 1].date <= f.date), 'festivals are in date order');
    check(new Set(file.map(f => f.id)).size === file.length, 'ids are unique');
    const catalog = buildCatalog({ services: read('src/data/services.json'), priceList: read('src/data/priceList.json') });
    const keys = new Set(catalog.map(e => e.key));
    check(file.every(f => f.poojas.every(k => keys.has(k))), 'every pooja linked from a festival exists in the catalogue');
    check(file.every(f => f.nameEn && f.nameHi && f.noteEn && f.noteHi), 'every festival has English and Hindi names and notes');
}

console.log('\n\x1b[1m[5] Tithi calendar (Amavasya, Purnima, Ekadashi, Pradosh) for 15 Oct - 15 Dec 2026\x1b[0m');
{
    const ev = tithiEvents([2026, 10, 15], 62);
    const on = (kind) => ev.filter(e => e.kind === kind).map(e => e.date);
    check(on('amavasya').length === 2 && on('amavasya')[0] === '2026-11-09', `Amavasya at sunrise: ${on('amavasya').join(', ')} - Kartik Amavasya (running 8 Nov 11:28 to 9 Nov 12:32) first, then one lunar month later`);
    check(on('purnima').includes('2026-10-26') && on('purnima').includes('2026-11-24'), `Purnima at sunrise includes 26 Oct and 24 Nov (${on('purnima').join(', ')})`);
    check(on('ekadashi-shukla').includes('2026-10-22') && on('ekadashi-krishna').includes('2026-11-05'), 'Ekadashi: Papankusha 22 Oct and Rama 5 Nov');
    check(on('pradosh').includes('2026-10-23') && on('pradosh').includes('2026-11-06'), `Pradosh vrat includes 23 Oct and 6 Nov (${on('pradosh').join(', ')})`);
    check(ev.every(e => e.end === null || e.start === null || e.end > e.start), 'every window ends after it starts');
}

console.log('\n\x1b[1m[6] Date / time text is deterministic (server HTML and browser must match exactly)\x1b[0m');
{
    const diwali = built.find(f => f.id === 'diwali');
    check(formatIST(Date.parse(diwali.window.start)) === '8 Nov, 11:28 AM' && formatIST(Date.parse(diwali.window.end)) === '9 Nov, 12:32 PM', 'IST times are written 8 Nov, 11:28 AM (uppercase AM/PM, no locale data involved)');
    check(formatIST(Date.parse('2026-11-08T05:58:00Z'), 'hi') === '8 नव, 11:28 AM', 'Hindi month names, same layout');
    check(formatIST(Date.parse('2026-11-08T18:30:00Z')) === '9 Nov, 12:00 AM' && formatIST(Date.parse('2026-11-08T06:30:00Z')) === '8 Nov, 12:00 PM', 'midnight is 12:00 AM and noon is 12:00 PM');
    check(formatDay('2026-11-08') === 'Sun, 8 Nov' && formatDay('2026-11-08', 'en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) === 'Sunday, 8 November 2026', 'English dates');
    check(formatDay('2026-11-08', 'hi', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) === 'रविवार, 8 नवंबर 2026', 'Hindi dates');
    check(tithiLabel('Krishna Trayodashi', 'hi') === 'कृष्ण त्रयोदशी' && tithiLabel('Amavasya', 'hi') === 'अमावस्या' && tithiLabel('Purnima') === 'Purnima', 'tithi names in Hindi and English');
    check(windowText(diwali.window) === 'Amavasya: 8 Nov, 11:28 AM → 9 Nov, 12:32 PM', 'the Diwali window reads Amavasya: 8 Nov, 11:28 AM → 9 Nov, 12:32 PM');
    check(todayIST(Date.parse('2026-11-08T19:00:00Z')) === '2026-11-09' && todayIST(Date.parse('2026-11-08T18:29:00Z')) === '2026-11-08', 'today in India rolls over at 00:00 IST (18:30 UTC)');
}

console.log(`\n\x1b[1mFESTIVAL TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
