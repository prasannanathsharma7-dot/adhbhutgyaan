// The muhurat engine must never propose marriage / griha pravesh dates in Chaturmas or Kharmas, and its two copies
// (frontend ESM, backend CommonJS) must agree. Chaturmas data is cross-checked against the verified Panchang engine.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import { findMuhurat as feFind } from '../src/utils/muhuratEngine.js';
import { exclusionReasons as feReasons, coverage as feCoverage, exclusionData } from '../src/utils/muhuratExclusions.js';
import { calculateGlobalPanchang } from '../src/utils/astroEngine.js';
const be = require('../backend/utils/muhuratEngine.js');
const beEx = require('../backend/utils/muhurat-exclusions.js');

let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const LAT = 25.3176, LNG = 82.9739, TZ = 5.5;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const local = (y, m, d) => new Date(y, m - 1, d, 12);
const within = (day, a, b) => day >= a && day <= b;
const scan = (cat, a, b) => feFind(cat, local(...a), local(...b), LAT, LNG, TZ);

console.log('\n\x1b[1m[1] No marriage / griha pravesh dates in Chaturmas\x1b[0m');
for (const cat of ['vivah', 'grihapravesh']) {
    for (const p of exclusionData.chaturmas) {
        const [fy, fm, fd] = p.from.split('-').map(Number), [ty, tm, td] = p.to.split('-').map(Number);
        const r = scan(cat, [fy, fm, fd], [ty, tm, td]);
        check(r.matches.length === 0 && r.skipped.length >= 1 && r.skipped[0].code === 'chaturmas', `${cat}: nothing proposed ${p.from} to ${p.to}, and the skipped period is reported`);
    }
}
{
    const r = scan('vivah', [2026, 10, 15], [2026, 12, 15]);
    const days = r.matches.map(m => iso(m.date));
    check(days.every(d => d >= '2026-11-22'), `the 17 and 24 Oct dates the old widget showed are gone (first date now ${days[0]})`);
    check(days.includes('2026-12-04'), '4 Dec 2026 (Friday, Chitra, Ekadashi - on published marriage lists) is still proposed');
}
{
    const r = scan('naamkaran', [2026, 8, 1], [2026, 9, 30]);
    check(r.matches.length > 0 && r.skipped.length === 0, 'naamkaran and business muhurats are NOT excluded by Chaturmas');
}

console.log('\n\x1b[1m[2] Kharmas\x1b[0m');
{
    const r = scan('vivah', [2026, 3, 1], [2026, 4, 30]);
    const sk = r.skipped.find(s => s.code === 'kharmas');
    check(sk && iso(sk.from) >= '2026-03-14' && iso(sk.from) <= '2026-03-16' && iso(sk.to) >= '2026-04-12' && iso(sk.to) <= '2026-04-14', `Sun in Meena: ${sk && iso(sk.from)} to ${sk && iso(sk.to)} (expected about 14-15 Mar to 13-14 Apr)`);
    check(r.matches.every(m => { const d = iso(m.date); return !within(d, '2026-03-16', '2026-04-12'); }), 'no marriage dates between 16 Mar and 12 Apr 2026');
    const r2 = scan('grihapravesh', [2026, 12, 1], [2027, 1, 31]);
    const sk2 = r2.skipped.find(s => s.code === 'kharmas');
    check(sk2 && iso(sk2.from) >= '2026-12-15' && iso(sk2.from) <= '2026-12-17' && iso(sk2.to) >= '2027-01-13' && iso(sk2.to) <= '2027-01-15', `Sun in Dhanu: ${sk2 && iso(sk2.from)} to ${sk2 && iso(sk2.to)} (expected about 16 Dec to 14 Jan)`);
}

console.log('\n\x1b[1m[3] The Chaturmas data agrees with the verified Panchang engine\x1b[0m');
const tithiAt = (y, m, d) => calculateGlobalPanchang({ date: local(y, m, d), latitude: LAT, longitude: LNG, timezoneOffsetHours: TZ }).tithi.name;
for (const p of exclusionData.chaturmas) {
    const [fy, fm, fd] = p.from.split('-').map(Number), [ty, tm, td] = p.to.split('-').map(Number);
    check(tithiAt(fy, fm, fd) === 'Shukla Ekadashi', `${p.from} starts on Shukla Ekadashi (Devshayani) at Varanasi sunrise`);
    const endIsEkadashi = [tithiAt(ty, tm, td), tithiAt(ty, tm, td - 1), tithiAt(ty, tm, td - 2)].some(t => t === 'Shukla Ekadashi');
    check(endIsEkadashi, `${p.to} is within a day or two of Shukla Ekadashi (Dev Uthani, Smarta / Vaishnava)`);
}
{
    const ps = exclusionData.chaturmas;
    check(ps.every(p => p.from < p.to) && ps.every((p, i) => i === 0 || ps[i - 1].to < p.from), 'periods are ordered, non-overlapping, and from < to');
    check(Object.keys(exclusionData.appliesTo).sort().join() === 'business,grihapravesh,naamkaran,vivah', 'every muhurat category has an explicit exclusion rule (possibly none)');
}

console.log('\n\x1b[1m[4] Frontend and backend copies agree, day by day (2026-2027)\x1b[0m');
{
    let diff = 0, days = 0, kh = 0;
    for (let t = Date.UTC(2026, 0, 1); t <= Date.UTC(2027, 11, 31); t += 86400000) {
        const u = new Date(t); const l = local(u.getUTCFullYear(), u.getUTCMonth() + 1, u.getUTCDate());
        for (const cat of ['vivah', 'grihapravesh', 'naamkaran']) {
            const a = feReasons(cat, l).map(r => r.code).join(), b = beEx.exclusionReasons(cat, u).map(r => r.code).join();
            if (a !== b) diff++; days++;
            if (a.includes('kharmas')) kh++;
        }
    }
    check(diff === 0, `exclusion reasons are identical for ${days} category-days (${diff} differences)`);
    check(kh === 240, `Kharmas: 120 days in 2026-2027 (14 Jan 2026, 15 Mar-13 Apr, 16 Dec-14 Jan, 15 Mar-13 Apr, 16-31 Dec) x 2 categories = 240 (found ${kh})`);
    const a = be.findMuhurat('vivah', new Date(Date.UTC(2026, 10, 1)), new Date(Date.UTC(2026, 11, 31)), LAT, LNG, TZ);
    const b = scan('vivah', [2026, 11, 1], [2026, 12, 31]);
    check(a.matches.map(m => m.date.toISOString().slice(0, 10)).join() === b.matches.map(m => iso(m.date)).join(), 'the two engines propose the same marriage dates for Nov-Dec 2026');
}

console.log('\n\x1b[1m[5] Beyond the verified range the engine says so\x1b[0m');
check(feCoverage('vivah', local(2027, 12, 31)).complete === true && feCoverage('vivah', local(2028, 2, 1)).complete === false, 'marriage scans past 31 Dec 2027 are flagged as not fully covered');
check(feCoverage('naamkaran', local(2030, 1, 1)).complete === true, 'categories with no exclusion rules are never flagged');
check(be.findMuhurat('vivah', new Date(Date.UTC(2028, 0, 1)), new Date(Date.UTC(2028, 0, 5)), LAT, LNG, TZ).coverage.complete === false, 'the backend (paid report) reports the same coverage gap');

console.log(`\n\x1b[1mMUHURAT TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
