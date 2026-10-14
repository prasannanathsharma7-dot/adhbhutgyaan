// Tests for the tithi / nakshatra / yoga / karana ENDING times (src/utils/astroEngine.js).
// Self-contained: no network, no database.
import { calculateGlobalPanchang, calculateLimbBoundaries, calculateSolarGeometry, formatBoundary } from '../src/utils/astroEngine.js';
import { getSiderealLongitudes } from '../src/utils/vedic-ephemeris.js';

let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const LAT = 25.3176, LNG = 82.9739, TZ = 5.5;
const toMin = (hhmm, ampm) => { let [h, m] = hhmm.split(':').map(Number); if (ampm === 'PM' && h !== 12) h += 12; if (ampm === 'AM' && h === 12) h = 0; return h * 60 + m; };
const minutesOf = (e) => { const [t, ap] = e.time.split(' '); return toMin(t, ap) + e.dayOffset * 1440; };

console.log('\n\x1b[1m[1] 28 Aug 2026, Varanasi - against independently published panchangs\x1b[0m');
// References (all IST): muhuratchoghadiya.com (Tithi Purnima until 9:48 AM then Pratipada; Nakshatra Shatabhisha
// until 3:13 AM on 29 Aug then Purva Bhadra; Yoga Atiganda until 7:28 AM then Sukarma; Karana Bava until 9:48 AM
// then Balava), shubhpanchang.com (Purnima until 9:47 AM), prokerala.com (Purnima until 9:48 AM).
{
    const r = calculateGlobalPanchang({ date: new Date(2026, 7, 28, 12), latitude: LAT, longitude: LNG, timezoneOffsetHours: TZ });
    const near = (got, want, tol = 3) => Math.abs(got - want) <= tol;
    check(/Purnima/.test(r.tithi.name), 'tithi at sunrise is Purnima');
    check(near(minutesOf(r.tithi.endsAt), toMin('09:48', 'AM')), `Purnima ends ${r.tithi.endsAt.time} (reference 09:47-09:48 AM)`);
    check(/Pratipada/.test(r.tithi.next) && /Krishna/.test(r.tithi.next), `then ${r.tithi.next}`);
    check(r.nakshatra.name === 'Shatabhisha', 'nakshatra at sunrise is Shatabhisha');
    check(near(minutesOf(r.nakshatra.endsAt), 1440 + toMin('03:13', 'AM')), `Shatabhisha ends ${r.nakshatra.endsAt.time} (+${r.nakshatra.endsAt.dayOffset}d) (reference 03:13 AM next day)`);
    check(/Purva Bhadra/.test(r.nakshatra.next), `then ${r.nakshatra.next}`);
    check(r.yoga.name === 'Atiganda' && near(minutesOf(r.yoga.endsAt), toMin('07:28', 'AM')), `Atiganda ends ${r.yoga.endsAt.time} (reference 07:28 AM)`);
    check(r.yoga.next === 'Sukarma', `then ${r.yoga.next}`);
    check(r.karana.name === 'Bava' && near(minutesOf(r.karana.endsAt), toMin('09:48', 'AM')), `Bava ends ${r.karana.endsAt.time} (reference 09:48 AM)`);
    check(r.karana.next === 'Balava', `then ${r.karana.next}`);
}

console.log('\n\x1b[1m[2] 120 consecutive days: boundaries are real and physically plausible\x1b[0m');
{
    const kinds = {
        tithi:     { idx: (s) => Math.floor((((s.moon - s.sun) % 360 + 360) % 360) / 12), mod: 30, hrs: [18.5, 27] },
        karana:    { idx: (s) => Math.floor((((s.moon - s.sun) % 360 + 360) % 360) / 6),  mod: 60, hrs: [9, 14] },
        nakshatra: { idx: (s) => Math.floor(((s.moon % 360 + 360) % 360) / (360 / 27)),   mod: 27, hrs: [20, 28] },
        yoga:      { idx: (s) => Math.floor((((s.sun + s.moon) % 360 + 360) % 360) / (360 / 27)), mod: 27, hrs: [18.5, 27.5] },
    };
    let badOrder = 0, badSwitch = 0, badLen = 0, n = 0;
    for (let i = 0; i < 120; i++) {
        const d = new Date(2026, 9, 1 + i, 12);
        const sol = calculateSolarGeometry(d, LAT, LNG, TZ);
        const mid = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - TZ * 3600000);
        const sunrise = new Date(mid.getTime() + sol.sunriseMins * 60000);
        const b = calculateLimbBoundaries(sunrise, mid);
        for (const [k, cfg] of Object.entries(kinds)) {
            n++;
            const { startsAt, endsAt, index } = b[k];
            const idxAt = (t) => cfg.idx(getSiderealLongitudes(new Date(t)));
            if (!(startsAt.date < sunrise && sunrise < endsAt.date)) badOrder++;
            const before = idxAt(endsAt.date.getTime() - 120000), after = idxAt(endsAt.date.getTime() + 120000);
            if (before !== index || after !== (index + 1) % cfg.mod) badSwitch++;
            const hours = (endsAt.date - startsAt.date) / 3600000;
            if (hours < cfg.hrs[0] || hours > cfg.hrs[1]) badLen++;
        }
    }
    check(badOrder === 0, `all ${n} limbs: start < sunrise < end`);
    check(badSwitch === 0, 'at end-2min the limb is the same, at end+2min it is the next one (all 480 checks)');
    check(badLen === 0, 'every limb lasts a physically plausible time (tithi 18.5-27h, nakshatra 20-28h, yoga 18.5-27.5h, karana 9-14h)');
}

console.log('\n\x1b[1m[3] Day-offset formatting and API shape\x1b[0m');
{
    check(formatBoundary(9 * 60 + 48).dayOffset === 0 && formatBoundary(9 * 60 + 48).time === '09:48 AM', '09:48 AM is same day');
    check(formatBoundary(1440 + 193).dayOffset === 1 && formatBoundary(1440 + 193).time === '03:13 AM', '03:13 AM next day has dayOffset 1');
    check(formatBoundary(-30).dayOffset === -1, 'before midnight has dayOffset -1');
    const r = calculateGlobalPanchang({ date: new Date(2026, 9, 20, 12), latitude: LAT, longitude: LNG, timezoneOffsetHours: TZ });
    check(['tithi', 'nakshatra', 'yoga', 'karana'].every(k => r[k].endsAt && r[k].next), 'every limb exposes endsAt and next');
}

console.log(`\n\x1b[1mPANCHANG BOUNDARY TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
