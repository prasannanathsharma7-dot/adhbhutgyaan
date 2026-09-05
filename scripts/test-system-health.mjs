// Automated Self-Test & Diagnostic Script
// File: scripts/test-system-health.mjs
// Run via: node scripts/test-system-health.mjs or npm test

import { calculateInstantKundli, RASHIS, NAKSHATRAS } from '../src/utils/kundliEngine.js';
import { calculateGlobalPanchang, calculateSolarGeometry, formatMinutesToTime } from '../src/utils/astroEngine.js';
import { d2Hora, d3Drekkana, d7Saptamsha, d9Navamsha, d12Dwadashamsha, d30Trimshamsha, signAndOffset } from '../backend/utils/divisionalCharts.js';
import { calculateVimshottariDasha, DASHA_ORDER as VIMSHOTTARI_ORDER, DASHA_YEARS as VIMSHOTTARI_YEARS } from '../backend/utils/vimshottariDasha.js';
import { calculateYoginiDasha, YOGINI_ORDER, YOGINI_YEARS } from '../backend/utils/yoginiDasha.js';
import { calculateSadeSatiTimeline } from '../backend/utils/sadeSati.js';
import { analyzeJaimini, calculateCharaKarakas, calculateKarakamsha, baladiAvastha, jagratAvastha } from '../backend/utils/jaimini.js';
import { calculateCharaDasha, signCount } from '../backend/utils/charaDasha.js';
import { findVarshaPravesh, calculateVarshaLagna, calculateMuntha, calculateMuddaDasha } from '../backend/utils/tajikVarshphal.js';
import { analyzeLalKitab, calculateLalKitab35YearDasha, getRemedies, PAKKA_GHAR, DASHA_ORDER as LALKITAB_ORDER } from '../backend/utils/lalKitab.js';
import { generateLifePredictions, lordOfHouse, strengthOf, SIGN_LORD } from '../backend/utils/lifePredictions.js';
import { generateGrahaEssays } from '../backend/utils/grahaEssays.js';
import hindiTermsPkg from '../backend/utils/hindiTerms.js';
const { nakshatraHi, deityHi, varnaHi, vashyaHi, ganaHi, nadiHi, yoniHi, lordHi } = hindiTermsPkg;
import { findMuhurat, CATEGORY_RULES, tithiNumberOf, varaNumberOf } from '../backend/utils/muhuratEngine.js';
import { isValidIndianPhone, isValidName, checkRateLimit } from '../backend/_db.js';
import { computeVedicChartData } from '../backend/agents/kundli-preanalyzer.js';
import { computeFullKundliReport, SIGN_NAMES } from '../backend/utils/fullKundliReport.js';
import { calculateVastuScore, scoreRoom, ROOM_RULES, DIRECTIONS as VASTU_DIRECTIONS } from '../backend/utils/vastuEngine.js';
import { calculateShadbala, calculateBhavaBala, uchchaBala, digBala, bhavaDigBala, NAISARGIKA_BALA, generateShadbalaFaladesh, generateBhavaBalaFaladesh } from '../backend/utils/shadbala.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  \x1b[32m✓\x1b[0m ${testName}`);
    } else {
        failedTests++;
        console.log(`  \x1b[31m✗\x1b[0m ${testName}`);
        if (details) console.log(`    \x1b[33m└─ Failure detail: ${details}\x1b[0m`);
        failures.push({ testName, details });
    }
}

console.log('\n\x1b[1m\x1b[36m============================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m   ADBHUT GYAAN — AUTOMATED SYSTEM HEALTH & TEST AGENT      \x1b[0m');
console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');

// -------------------------------------------------------------
// SUITE 1: VEDIC KUNDLI EPHEMERIS MATHEMATICAL BENCHMARK
// -------------------------------------------------------------
console.log('\x1b[1m\x1b[33m[1/22] Testing Vedic Kundli Ephemeris Calculation Engine...\x1b[0m');

try {
    const benchmark = calculateInstantKundli({
        name: 'Varanasi Benchmark',
        birthDate: '2001-08-11',
        birthTime: '06:30 (06:30 AM)',
        birthPlace: 'Varanasi, India',
        latitude: 25.3176,
        longitude: 82.9739,
        tzOffset: 5.5,
    });

    assert(benchmark != null, 'Kundli Engine returns non-null object');
    assert(benchmark.lagna && benchmark.lagna.rashi.includes('Simha'), `Benchmark Lagna must be Leo (Simha) [Got: ${benchmark.lagna?.rashi}]`);
    assert(benchmark.moon && benchmark.moon.rashi.includes('Mesha'), `Benchmark Moon must be Aries (Mesha) [Got: ${benchmark.moon?.rashi}]`);
    assert(benchmark.nakshatra && benchmark.nakshatra.name === 'Ashvini', `Benchmark Nakshatra must be Ashvini [Got: ${benchmark.nakshatra?.name}]`);
    assert(Array.isArray(benchmark.planets) && benchmark.planets.length === 9, `All 9 Vedic Planets calculated [Count: ${benchmark.planets?.length}]`);

    const mars = benchmark.planets.find(p => p.name.includes('Mars'));
    assert(mars && mars.house === 4, `Mars placed in House 4 (Vrishchik) [House: ${mars?.house}]`);

    const jupiter = benchmark.planets.find(p => p.name.includes('Jupiter'));
    assert(jupiter && jupiter.house === 11, `Jupiter placed in House 11 (Mithun) [House: ${jupiter?.house}]`);

    const saturn = benchmark.planets.find(p => p.name.includes('Saturn'));
    assert(saturn && saturn.house === 10, `Saturn placed in House 10 (Vrishabh) [House: ${saturn?.house}]`);

    assert(benchmark.doshas && benchmark.doshas.manglik.hasDosh === true, 'Manglik Dosha correctly flagged Active for H4 Mars');
    assert(benchmark.doshas && benchmark.doshas.kalsarp.hasDosh === false, 'Kalsarp Dosha correctly flagged Absent for non-hemmed chart');

    // Test extreme date handling
    const edgeCase1 = calculateInstantKundli({ birthDate: '1947-08-15', birthTime: '00:00', birthPlace: 'New Delhi' });
    assert(edgeCase1 != null && edgeCase1.lagna != null, 'Midnight historical birthdate (15-Aug-1947) handled safely');

    const edgeCase2 = calculateInstantKundli({ birthDate: 'invalid-date', birthTime: 'invalid-time' });
    assert(edgeCase2 != null && edgeCase2.lagna != null, 'Corrupt date/time strings handled safely without crashing');
} catch (err) {
    assert(false, 'Vedic Kundli Engine threw uncaught exception', err.stack);
}

// -------------------------------------------------------------
// SUITE 2: GLOBAL DYNAMIC PANCHANG ENGINE
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[2/22] Testing Global Dynamic Panchang & Solar Ephemeris...\x1b[0m');

try {
    const panchang = calculateGlobalPanchang({
        date: '2026-08-28',
        latitude: 25.3176,
        longitude: 82.9739,
        cityName: 'Varanasi (Kashi)',
        countryName: 'India',
        timezoneOffsetHours: 5.5,
    });

    assert(panchang != null, 'Panchang Engine returns non-null object');
    assert(panchang.solar && panchang.solar.sunrise && panchang.solar.sunset, `Sunrise & Sunset calculated [${panchang.solar?.sunrise} / ${panchang.solar?.sunset}]`);
    assert(panchang.tithi && panchang.tithi.name, `Vedic Tithi calculated [${panchang.tithi?.name}]`);
    assert(panchang.nakshatra && panchang.nakshatra.name, `Vedic Nakshatra calculated [${panchang.nakshatra?.name}]`);
    assert(panchang.muhurats && panchang.muhurats.abhijit, `Abhijit Muhurat window calculated [${panchang.muhurats?.abhijit}]`);
    assert(panchang.inauspicious && panchang.inauspicious.rahuKaal, `Rahu Kaal window calculated [${panchang.inauspicious?.rahuKaal}]`);

    assert(Array.isArray(panchang.choghadiya?.day) && panchang.choghadiya.day.length === 8, `8 Daytime Choghadiya slots generated [Count: ${panchang.choghadiya?.day?.length}]`);
    assert(Array.isArray(panchang.choghadiya?.night) && panchang.choghadiya.night.length === 8, `8 Nighttime Choghadiya slots generated [Count: ${panchang.choghadiya?.night?.length}]`);

    // Global location tests
    const tokyoPanchang = calculateGlobalPanchang({ latitude: 35.6762, longitude: 139.6503, timezoneOffsetHours: 9 });
    assert(tokyoPanchang != null && tokyoPanchang.solar != null, 'Tokyo (East Longitude, UTC+9) computed safely');

    const nyPanchang = calculateGlobalPanchang({ latitude: 40.7128, longitude: -74.0060, timezoneOffsetHours: -4 });
    assert(nyPanchang != null && nyPanchang.solar != null, 'New York (West Longitude, UTC-4) computed safely');
} catch (err) {
    assert(false, 'Panchang Engine threw uncaught exception', err.stack);
}

// -------------------------------------------------------------
// SUITE 3: FRONTEND MODULES & CORE COMPONENTS INTEGRITY
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[3/22] Testing Frontend Pages & Critical Components...\x1b[0m');

const criticalComponents = [
    'src/App.jsx',
    'src/pages/Home.jsx',
    'src/pages/FreeKundli.jsx',
    'src/pages/Panchang.jsx',
    'src/pages/Booking.jsx',
    'src/pages/Services.jsx',
    'src/pages/AdminAgents.jsx',
    'src/pages/AdminAnalytics.jsx',
    'src/components/NorthIndianChart.jsx',
    'src/components/BirthDetailsInput.jsx',
    'src/components/Navbar.jsx',
    'src/components/Footer.jsx',
    'src/components/ErrorBoundary.jsx',
];

for (const compPath of criticalComponents) {
    const fullPath = path.join(projectRoot, compPath);
    const exists = fs.existsSync(fullPath);
    assert(exists, `Component exists: ${compPath}`);
    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert(content.length > 50, `Component ${compPath} is non-empty (${content.length} bytes)`);
        assert(!content.includes('undefined undefined') && !content.includes('"undefined"'), `Component ${compPath} has no obvious corrupted literals`);
    }
}

// -------------------------------------------------------------
// SUITE 4: SERVERLESS API AGENTS & ROUTES
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[4/22] Testing Backend API Microservices & Agent Routes...\x1b[0m');

const apiRoutes = [
    'backend/agents/kundli-preanalyzer.js',
    'backend/agents/daily-panchang-cron.js',
    'backend/agents/whatsapp-concierge.js',
    'backend/agents/seo-content-drafter.js',
    'backend/admin/analytics-summary.js',
    'backend/admin/sync-from-sheets.js',
    'backend/bookings.js',
    'backend/contact.js',
    'backend/reviews.js',
    'backend/newsletter.js',
    'backend/horoscope.js',
    'backend/health.js',
];

for (const routePath of apiRoutes) {
    const fullPath = path.join(projectRoot, routePath);
    const exists = fs.existsSync(fullPath);
    assert(exists, `API route file exists: ${routePath}`);
    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert(content.includes('export default') || content.includes('module.exports'), `API route ${routePath} exports a handler function`);
    }
}

// -------------------------------------------------------------
// SUITE 5: PRODUCTION BUILD & SEO ARTIFACTS
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[5/22] Testing Production Distribution & Pre-Rendered Pages...\x1b[0m');

const distPath = path.join(projectRoot, 'dist');
if (fs.existsSync(distPath)) {
    const indexHtml = path.join(distPath, 'index.html');
    assert(fs.existsSync(indexHtml), 'dist/index.html exists');

    const panchangHtml = path.join(distPath, 'panchang', 'index.html');
    assert(fs.existsSync(panchangHtml), 'dist/panchang/index.html static SEO page exists');

    const kundliHtml = path.join(distPath, 'free-kundli', 'index.html');
    assert(fs.existsSync(kundliHtml), 'dist/free-kundli/index.html static SEO page exists');
} else {
    console.log('  \x1b[33mℹ Note: dist/ not yet generated in this pass. (Will verify during build)\x1b[0m');
}

// -------------------------------------------------------------
// SUITE 6: DIVISIONAL CHARTS (D2, D3, D7, D9, D12, D30)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[6/22] Testing Divisional Chart (Varga) Calculators...\x1b[0m');

// D2 Hora: odd sign 0-15deg->Leo(5), 15-30deg->Cancer(4); even sign reversed
assert(d2Hora(0) === 5, 'D2: 0° Aries (odd, 1st half) -> Leo');
assert(d2Hora(10) === 5, 'D2: 10° Aries (odd, 1st half) -> Leo');
assert(d2Hora(14.99) === 5, 'D2: 14.99° Aries (odd, boundary) -> Leo');
assert(d2Hora(15) === 4, 'D2: 15° Aries (odd, 2nd half boundary) -> Cancer');
assert(d2Hora(20) === 4, 'D2: 20° Aries (odd, 2nd half) -> Cancer');
assert(d2Hora(40) === 4, 'D2: 10° Taurus/40° (even, 1st half) -> Cancer');
assert(d2Hora(50) === 5, 'D2: 20° Taurus/50° (even, 2nd half) -> Leo');
assert(d2Hora(370) === 5, 'D2: wraps correctly past 360° (370°->10° Aries) -> Leo');

// D3 Drekkana: 10° decans, 1st=same sign, 2nd=+4 (trine), 3rd=+8 (trine)
assert(d3Drekkana(5) === 1, 'D3: 5° Aries (decan 1) -> Aries');
assert(d3Drekkana(9.99) === 1, 'D3: 9.99° Aries (decan 1 boundary) -> Aries');
assert(d3Drekkana(10) === 5, 'D3: 10° Aries (decan 2 boundary) -> Leo');
assert(d3Drekkana(15) === 5, 'D3: 15° Aries (decan 2) -> Leo');
assert(d3Drekkana(25) === 9, 'D3: 25° Aries (decan 3) -> Sagittarius');
assert(d3Drekkana(35) === 2, 'D3: 5° Taurus/35° (decan 1) -> Taurus');
assert(d3Drekkana(359) === 8, 'D3: 29° Pisces/359° (decan 3, wraps) -> Scorpio');

// D7 Saptamsha: odd sign starts from itself, even sign starts from 7th sign
assert(d7Saptamsha(0) === 1, 'D7: 0° Aries (odd, part 0) -> Aries');
assert(d7Saptamsha(4.3) === 2, 'D7: ~4.3° Aries (odd, part 1) -> Taurus');
assert(d7Saptamsha(40) === 10, 'D7: 10° Taurus/40° (even, starts from 7th=Scorpio, +2 parts) -> Capricorn');

// D9 Navamsha: fire->Aries, earth->Capricorn, air->Libra, water->Cancer start points
assert(d9Navamsha(0) === 1, 'D9: 0° Aries (fire) -> Aries');
assert(d9Navamsha(25) === 8, 'D9: 25° Aries (fire), verified worked example -> Scorpio');
assert(d9Navamsha(90) === 4, 'D9: 0° Cancer (water) -> Cancer');
assert(d9Navamsha(180) === 7, 'D9: 0° Libra (air) -> Libra');
assert(d9Navamsha(184) === 8, 'D9: 4° Libra (air), verified worked example -> Scorpio');
assert(d9Navamsha(270) === 10, 'D9: 0° Capricorn (earth) -> Capricorn');
assert(d9Navamsha(60) === 7, 'D9: 0° Gemini (air, starts Libra) -> Libra');
assert(d9Navamsha(150) === 10, 'D9: 0° Virgo (earth, starts Capricorn) -> Capricorn');

// D12 Dwadashamsha: always starts from same sign, 2.5° parts
assert(d12Dwadashamsha(0) === 1, 'D12: 0° Aries (part 0) -> Aries');
assert(d12Dwadashamsha(15) === 7, 'D12: 15° Aries (part 6) -> Libra');
assert(d12Dwadashamsha(29) === 12, 'D12: 29° Aries (part 11) -> Pisces');
assert(d12Dwadashamsha(2.5) === 2, 'D12: 2.5° Aries (part 1 boundary) -> Taurus');

// D30 Trimshamsha: unequal segments, odd/even reversed order+widths
assert(d30Trimshamsha(3).lord === 'mars' && d30Trimshamsha(3).sign === 1, 'D30: 3° Aries (odd, Mars 0-5°) -> Aries/Mars');
assert(d30Trimshamsha(7).lord === 'saturn' && d30Trimshamsha(7).sign === 11, 'D30: 7° Aries (odd, Saturn 5-10°) -> Aquarius/Saturn');
assert(d30Trimshamsha(15).lord === 'jupiter' && d30Trimshamsha(15).sign === 9, 'D30: 15° Aries (odd, Jupiter 10-18°) -> Sagittarius/Jupiter');
assert(d30Trimshamsha(20).lord === 'mercury' && d30Trimshamsha(20).sign === 3, 'D30: 20° Aries (odd, Mercury 18-25°) -> Gemini/Mercury');
assert(d30Trimshamsha(27).lord === 'venus' && d30Trimshamsha(27).sign === 7, 'D30: 27° Aries (odd, Venus 25-30°) -> Libra/Venus');
assert(d30Trimshamsha(3 + 30).lord === 'venus' && d30Trimshamsha(33).sign === 2, 'D30: 3° Taurus (even, Venus 0-5°) -> Taurus/Venus');
assert(d30Trimshamsha(33 + 5).lord === 'mercury', 'D30: 8° Taurus (even, Mercury 5-12°) -> Mercury');
assert(d30Trimshamsha(30 + 25).lord === 'mars', 'D30: 25° Taurus (even, Mars 25-30°) -> Mars');

// signAndOffset boundary safety (the sign-boundary bug fixed earlier this session)
assert(signAndOffset(360).signNum === 1, 'signAndOffset: 360° normalizes to sign 1 (not 13)');
assert(signAndOffset(-0.0001).signNum === 12, 'signAndOffset: small negative normalizes to sign 12 (not 0)');
assert(signAndOffset(720).signNum === 1, 'signAndOffset: 720° (2 full circles) normalizes to sign 1');

// -------------------------------------------------------------
// SUITE 7: VIMSHOTTARI DASHA
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[7/22] Testing Vimshottari Dasha Engine...\x1b[0m');

assert(VIMSHOTTARI_ORDER.length === 9, 'Vimshottari: DASHA_ORDER has all 9 planets');
assert(Object.values(VIMSHOTTARI_YEARS).reduce((a, b) => a + b, 0) === 120, 'Vimshottari: planetary years sum to exactly 120');
assert(VIMSHOTTARI_YEARS.Venus === 20 && VIMSHOTTARI_YEARS.Sun === 6 && VIMSHOTTARI_YEARS.Moon === 10, 'Vimshottari: individual year-values match classical table');

const vim1 = calculateVimshottariDasha(195, new Date('1990-04-11')); // verified worked example: Swati -> Rahu, 6.75yr balance
assert(vim1.startingLord === 'Rahu', 'Vimshottari: Moon at 195° (Swati) -> starting lord Rahu (verified worked example)');
assert(Math.abs(vim1.balanceYears - 6.75) < 0.01, 'Vimshottari: Moon at 195° -> balance 6.75 years (verified worked example)');

const vim2 = calculateVimshottariDasha(95.10, new Date('1994-02-23')); // reference chart: Pushya -> Saturn
assert(vim2.startingLord === 'Saturn', 'Vimshottari: reference chart (Pushya nakshatra) -> starting lord Saturn');
assert(vim2.mahadashas.length === 9, 'Vimshottari: reference chart produces exactly 9 Mahadashas');
assert(vim2.mahadashas[0].antardashas.length === 9, 'Vimshottari: each Mahadasha has exactly 9 Antardashas');
assert(vim2.mahadashas[8].lord === 'Jupiter', 'Vimshottari: reference chart 9th (final) Mahadasha is Jupiter');
assert(vim2.mahadashas[0].antardashas[0].lord === 'Saturn', "Vimshottari: a Mahadasha's own first Antardasha is itself");
const vimTotalYears = vim2.mahadashas.reduce((s, m) => s + m.years, 0);
assert(vimTotalYears > 0 && vimTotalYears < 120, 'Vimshottari: reference-longitude total span is a plausible sub-120yr value (balance-truncated first period)');
for (let i = 0; i < vim2.mahadashas.length - 1; i++) {
    assert(vim2.mahadashas[i].endDate.getTime() === vim2.mahadashas[i + 1].startDate.getTime(), `Vimshottari: Mahadasha ${i + 1}->${i + 2} dates are contiguous (no gap/overlap)`);
}

// -------------------------------------------------------------
// SUITE 8: YOGINI DASHA
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[8/22] Testing Yogini Dasha Engine...\x1b[0m');

assert(YOGINI_ORDER.length === 8, 'Yogini: YOGINI_ORDER has all 8 Yoginis');
assert(Object.values(YOGINI_YEARS).reduce((a, b) => a + b, 0) === 36, 'Yogini: planetary years sum to exactly 36');

const yog1 = calculateYoginiDasha(100, new Date('2000-01-01')); // Pushya -> Dhanya/Jupiter (verified worked example)
assert(yog1.startingYogini === 'Dhanya' && yog1.planet === 'Jupiter', 'Yogini: Pushya nakshatra -> Dhanya/Jupiter (verified worked example)');

const yog2 = calculateYoginiDasha(220, new Date('2000-01-01')); // Anuradha -> Bhramari/Mars (verified worked example)
assert(yog2.startingYogini === 'Bhramari' && yog2.planet === 'Mars', 'Yogini: Anuradha nakshatra -> Bhramari/Mars (verified worked example)');

const yog3 = calculateYoginiDasha(95.10, new Date('1994-02-23'));
assert(yog3.mahadashas.length === 8, 'Yogini: reference chart produces exactly 8 Mahadashas');
const yogTotalYears = yog3.mahadashas.reduce((s, m) => s + m.years, 0);
assert(yogTotalYears > 34 && yogTotalYears < 36, 'Yogini: reference chart total span is a plausible sub-36yr value (balance-truncated first period)');

// -------------------------------------------------------------
// SUITE 9: SADE SATI TIMELINE
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[9/22] Testing Shani Sade Sati / Dhaiya Timeline...\x1b[0m');

const sade1 = calculateSadeSatiTimeline(4, new Date('1994-02-23'), 100); // Moon in Cancer(4)
assert(sade1.sadeSatiPeriods.length > 0, 'Sade Sati: reference chart (Moon in Cancer) finds Sade Sati periods across 100 years');
assert(sade1.sadeSatiPeriods.every(p => ['rising', 'peak', 'setting'].includes(p.phase)), 'Sade Sati: every period has a valid phase label');
assert(sade1.sadeSatiPeriods.every(p => [2, 4, 5].includes(p.saturnSign)), 'Sade Sati: all periods correctly restricted to signs 2/4/5 (12th/1st/2nd from Moon in Cancer)');
assert(sade1.dhaiyaPeriods.every(p => [7, 11].includes(p.saturnSign)), 'Sade Sati: all Dhaiya periods correctly restricted to signs 7/11 (4th/8th from Moon in Cancer)');
for (const p of sade1.sadeSatiPeriods) {
    assert(p.endDate.getTime() > p.startDate.getTime(), `Sade Sati: period (${p.phase}, sign ${p.saturnSign}) has endDate after startDate`);
}
// Cross-cycle spacing should be close to Saturn's real ~29.5yr orbital period -
// but NOT every consecutive "rising" entry is a new cycle (retrograde motion
// can produce a 2nd rising sub-period a few years after the 1st, within the
// SAME cycle) - check that at least one gap in the sequence falls in the
// real cross-cycle range, without assuming every consecutive pair must.
const risingPeriods = sade1.sadeSatiPeriods.filter(p => p.phase === 'rising');
if (risingPeriods.length >= 2) {
    const gaps = [];
    for (let i = 0; i < risingPeriods.length - 1; i++) {
        gaps.push((risingPeriods[i + 1].startDate - risingPeriods[i].startDate) / (365.25 * 86400000));
    }
    assert(gaps.some(g => g > 25 && g < 34), 'Sade Sati: at least one gap between "rising" periods reflects Saturn\'s real ~29-30yr orbital period (cross-cycle spacing)');
}

// -------------------------------------------------------------
// SUITE 10: JAIMINI SYSTEM (Karakas, Karakamsha, Avasthas)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[10/22] Testing Jaimini System (Chara Karakas & Avasthas)...\x1b[0m');

// Baladi Avastha - full verified 7-planet worked example
assert(baladiAvastha(17, 2) === 'Yuva', 'Jaimini Baladi: Sun-analog 17° even sign -> Yuva (verified example)');
assert(baladiAvastha(26, 2) === 'Bala', 'Jaimini Baladi: Moon-analog 26° even sign -> Bala (verified example)');
assert(baladiAvastha(27, 1) === 'Mrita', 'Jaimini Baladi: Mars-analog 27° odd sign -> Mrita (verified example)');
assert(baladiAvastha(13, 2) === 'Yuva', 'Jaimini Baladi: Mercury-analog 13° even sign -> Yuva (verified example)');
assert(baladiAvastha(4, 1) === 'Bala', 'Jaimini Baladi: Jupiter-analog 4° odd sign -> Bala (verified example)');
assert(baladiAvastha(5, 1) === 'Bala', 'Jaimini Baladi: Venus-analog 5° odd sign -> Bala (verified example)');
assert(baladiAvastha(28, 1) === 'Mrita', 'Jaimini Baladi: Saturn-analog 28° odd sign -> Mrita (verified example)');
assert(baladiAvastha(0, 1) === 'Bala', 'Jaimini Baladi: 0° odd sign (boundary) -> Bala');
assert(baladiAvastha(29.9, 2) === 'Bala', 'Jaimini Baladi: 29.9° even sign (boundary) -> Bala');

// Jagrat/Swapna/Sushupti
assert(jagratAvastha('exalted') === 'Jagrat', 'Jaimini Jagrat: exalted planet -> Jagrat (awake)');
assert(jagratAvastha('own') === 'Jagrat', 'Jaimini Jagrat: own-sign planet -> Jagrat (awake)');
assert(jagratAvastha('debilitated') === 'Sushupti', 'Jaimini Jagrat: debilitated planet -> Sushupti (asleep)');
assert(jagratAvastha('neutral') === 'Swapna', 'Jaimini Jagrat: neutral planet -> Swapna (dreaming)');

// Chara Karaka ranking (descending degree, 7-karaka scheme)
const karakaTest = calculateCharaKarakas({ sun: 10.74, moon: 5.10, mars: 26.72, mercury: 4.34, jupiter: 20.84, venus: 19.72, saturn: 9.27 }, 'en');
assert(karakaTest.length === 7, 'Jaimini Karaka: exactly 7 karakas returned (Rahu/Ketu excluded)');
assert(karakaTest[0].karaka === 'Atmakaraka' && karakaTest[0].planet === 'mars', 'Jaimini Karaka: highest-degree planet (Mars 26.72°) is Atmakaraka');
assert(karakaTest[6].karaka === 'Darakaraka' && karakaTest[6].planet === 'mercury', 'Jaimini Karaka: lowest-degree planet (Mercury 4.34°) is Darakaraka');
for (let i = 0; i < karakaTest.length - 1; i++) {
    assert(karakaTest[i].degree >= karakaTest[i + 1].degree, `Jaimini Karaka: ranking is monotonically descending at position ${i}`);
}

// -------------------------------------------------------------
// SUITE 11: JAIMINI CHARA DASHA
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[11/22] Testing Jaimini Chara Dasha...\x1b[0m');

assert(signCount(1, 1, 'forward') === 12, 'Chara Dasha signCount: same sign -> 12 (max duration)');
assert(signCount(1, 2, 'forward') === 1, 'Chara Dasha signCount: Aries->Taurus forward -> 1');
assert(signCount(1, 12, 'forward') === 11, 'Chara Dasha signCount: Aries->Pisces forward -> 11');
assert(signCount(1, 2, 'reverse') === 11, 'Chara Dasha signCount: Aries->Taurus reverse -> 11 (wraps the long way)');

const planetSignsForCD = { mars: 10, venus: 7, mercury: 9, moon: 4, sun: 9, jupiter: 5, saturn: 9 };
const cd = calculateCharaDasha(3, planetSignsForCD, new Date('1994-02-23'), SIGN_NAMES);
assert(cd.mahadashas.length === 12, 'Chara Dasha: exactly 12 Mahadashas (one per Rashi)');
assert(cd.direction === 'forward', 'Chara Dasha: odd Lagna sign (Gemini/3) -> forward direction');
assert(cd.mahadashas[0].sign === 3, 'Chara Dasha: first Mahadasha starts at the Lagna sign itself');
for (let i = 0; i < cd.mahadashas.length - 1; i++) {
    assert(cd.mahadashas[i].endDate.getTime() === cd.mahadashas[i + 1].startDate.getTime(), `Chara Dasha: Mahadasha ${i + 1}->${i + 2} dates are contiguous`);
}
assert(cd.mahadashas.every(m => m.antardashas.length === 12), 'Chara Dasha: every Mahadasha has exactly 12 Antardashas');

// -------------------------------------------------------------
// SUITE 12: TAJIK VARSHPHAL
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[12/22] Testing Tajik Varshphal (Annual Chart) Engine...\x1b[0m');

assert(calculateMuntha(3, 32) === 11, 'Tajik Muntha: (Lagna 3 + 32 completed years) mod 12 -> 11');
assert(calculateMuntha(11, 1) === 12, 'Tajik Muntha: (Lagna 11 + 1) mod 12 = 0 -> wraps to 12');
assert(calculateMuntha(1, 0) === 1, 'Tajik Muntha: 0 completed years -> Muntha = Lagna sign itself');
assert(calculateMuntha(12, 12) === 12, 'Tajik Muntha: (12+12) mod 12 = 0 -> wraps to 12');

const vp2026 = findVarshaPravesh(310.74, new Date('1994-02-23T08:50:00Z'), 2026);
assert(vp2026 instanceof Date && !isNaN(vp2026.getTime()), 'Tajik Varsha Pravesh: returns a valid Date object');
assert(vp2026.getUTCFullYear() === 2026, 'Tajik Varsha Pravesh: found instant falls within the requested target year');

const mudda = calculateMuddaDasha('Saturn', new Date('2026-02-23'));
assert(mudda.length === 9, 'Tajik Mudda Dasha: exactly 9 planetary periods');
const muddaTotalDays = mudda.reduce((s, p) => s + p.days, 0);
assert(Math.abs(muddaTotalDays - 365.25) < 0.01, 'Tajik Mudda Dasha: 9 periods sum to exactly 365.25 days');
assert(mudda[0].lord === 'Saturn', 'Tajik Mudda Dasha: starts from the specified starting lord');

// -------------------------------------------------------------
// SUITE 13: LAL KITAB SYSTEM
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[13/22] Testing Lal Kitab System...\x1b[0m');

assert(LALKITAB_ORDER.length === 9, 'Lal Kitab: DASHA_ORDER has all 9 planets');
const lk35 = calculateLalKitab35YearDasha('mercury', new Date('1994-02-23'));
assert(lk35.length === 9, 'Lal Kitab 35-Year Dasha: exactly 9 periods');
const lk35Total = lk35.reduce((s, p) => s + p.years, 0);
assert(lk35Total === 35, 'Lal Kitab 35-Year Dasha: 9 periods sum to exactly 35 years (corroborated reference value)');
assert(PAKKA_GHAR.sun.includes(1), 'Lal Kitab Pakka Ghar: Sun\'s permanent house includes House 1');
assert(PAKKA_GHAR.moon.includes(4), 'Lal Kitab Pakka Ghar: Moon\'s permanent house includes House 4');
assert(PAKKA_GHAR.saturn.includes(10) && PAKKA_GHAR.saturn.includes(11), 'Lal Kitab Pakka Ghar: Saturn\'s permanent houses are 10 and 11');

const lkPlanetsTest = [
    { key: 'sun', house: 1 }, { key: 'moon', house: 4 }, { key: 'mars', house: 5 },
    { key: 'mercury', house: 5 }, { key: 'jupiter', house: 8 }, { key: 'venus', house: 8 }, { key: 'saturn', house: 3 },
];
const lkAnalysis = analyzeLalKitab(lkPlanetsTest, 'en');
assert(lkAnalysis.grahaSthiti.length === 7, 'Lal Kitab Graha Sthiti: returns status for all 7 input planets');
const sunEntry = lkAnalysis.grahaSthiti.find(g => g.key === 'sun');
assert(sunEntry.isPakkaGhar === true, 'Lal Kitab Graha Sthiti: Sun in House 1 (its Pakka Ghar) correctly flagged');
assert(sunEntry.status.startsWith('Jagta'), 'Lal Kitab Graha Sthiti: planet in its Pakka Ghar is always Jagta (awake)');
assert(getRemedies('saturn', 'en').length >= 3, 'Lal Kitab Remedies: Saturn has at least 3 remedy suggestions');
assert(getRemedies('saturn', 'hi').length >= 3, 'Lal Kitab Remedies: Hindi remedies also present for Saturn');

// -------------------------------------------------------------
// SUITE 14: LIFE PREDICTIONS & GRAHA STRENGTH LOGIC
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[14/22] Testing Life Predictions & Planetary Strength Logic...\x1b[0m');

// strengthOf: own/exalted/debilitated/neutral for all 7 classical planets
assert(strengthOf('sun', 5) === 'own', 'Strength: Sun in Leo(5) -> own');
assert(strengthOf('sun', 1) === 'exalted', 'Strength: Sun in Aries(1) -> exalted');
assert(strengthOf('sun', 7) === 'debilitated', 'Strength: Sun in Libra(7) -> debilitated');
assert(strengthOf('moon', 4) === 'own', 'Strength: Moon in Cancer(4) -> own');
assert(strengthOf('moon', 2) === 'exalted', 'Strength: Moon in Taurus(2) -> exalted');
assert(strengthOf('moon', 8) === 'debilitated', 'Strength: Moon in Scorpio(8) -> debilitated');
assert(strengthOf('mars', 1) === 'own' && strengthOf('mars', 8) === 'own', 'Strength: Mars owns both Aries(1) and Scorpio(8)');
assert(strengthOf('mars', 10) === 'exalted', 'Strength: Mars in Capricorn(10) -> exalted');
assert(strengthOf('mars', 4) === 'debilitated', 'Strength: Mars in Cancer(4) -> debilitated');
assert(strengthOf('mercury', 3) === 'own', 'Strength: Mercury owns Gemini(3)');
assert(strengthOf('mercury', 6) === 'exalted', 'Strength: Mercury in Virgo(6) -> exalted (checked before own in lookup order - Mercury is classically both, exaltation is the more specific/stronger classification)');
assert(strengthOf('mercury', 12) === 'debilitated', 'Strength: Mercury in Pisces(12) -> debilitated');
assert(strengthOf('jupiter', 9) === 'own' && strengthOf('jupiter', 12) === 'own', 'Strength: Jupiter owns both Sagittarius(9) and Pisces(12)');
assert(strengthOf('jupiter', 4) === 'exalted', 'Strength: Jupiter in Cancer(4) -> exalted');
assert(strengthOf('jupiter', 10) === 'debilitated', 'Strength: Jupiter in Capricorn(10) -> debilitated');
assert(strengthOf('venus', 2) === 'own' && strengthOf('venus', 7) === 'own', 'Strength: Venus owns both Taurus(2) and Libra(7)');
assert(strengthOf('venus', 12) === 'exalted', 'Strength: Venus in Pisces(12) -> exalted');
assert(strengthOf('venus', 6) === 'debilitated', 'Strength: Venus in Virgo(6) -> debilitated');
assert(strengthOf('saturn', 10) === 'own' && strengthOf('saturn', 11) === 'own', 'Strength: Saturn owns both Capricorn(10) and Aquarius(11)');
assert(strengthOf('saturn', 7) === 'exalted', 'Strength: Saturn in Libra(7) -> exalted');
assert(strengthOf('saturn', 1) === 'debilitated', 'Strength: Saturn in Aries(1) -> debilitated');
assert(strengthOf('sun', 3) === 'neutral', 'Strength: Sun in Gemini(3) (no special relation) -> neutral');

// lordOfHouse / SIGN_LORD table completeness
assert(Object.keys(SIGN_LORD).length === 12, 'SIGN_LORD: all 12 signs have a lord defined');
assert(SIGN_LORD[1] === 'mars' && SIGN_LORD[8] === 'mars', 'SIGN_LORD: Mars correctly listed for both Aries and Scorpio');
const houseDataTest = {};
for (let h = 1; h <= 12; h++) houseDataTest[h] = { rashiId: ((3 + h - 2) % 12) + 1 };
assert(lordOfHouse(houseDataTest, 1) === 'mercury', 'lordOfHouse: House 1 = Gemini(3) -> lord Mercury');
assert(lordOfHouse(houseDataTest, 7) === 'jupiter', 'lordOfHouse: House 7 = Sagittarius(9) -> lord Jupiter');

// generateLifePredictions structural checks (using the real reference chart)
const refReport = computeFullKundliReport('1994-02-23', '14:20', 'Marhaura, Bihar', 25.7521, 84.8341, 5.5);
const predictionsHi = generateLifePredictions(refReport, 'hi');
const predictionsEn = generateLifePredictions(refReport, 'en');
assert(predictionsHi.length === 10, 'Life Predictions: exactly 10 life-areas generated (Hindi)');
assert(predictionsEn.length === 10, 'Life Predictions: exactly 10 life-areas generated (English)');
assert(predictionsHi.every(p => p.title && p.text && p.text.length > 20), 'Life Predictions: every Hindi area has a non-trivial title and text');
assert(predictionsEn.every(p => p.title && p.text && p.text.length > 20), 'Life Predictions: every English area has a non-trivial title and text');
assert(!predictionsHi.some(p => /\b(mercury|saturn|jupiter|venus|mars|sun|moon)\b/i.test(p.text)), 'Life Predictions: Hindi text contains no raw English planet-name leakage (regression check)');
assert(predictionsHi[9].text.includes('चिकित्सक') || predictionsHi[9].text.includes('चिकित्सा'), 'Life Predictions: Health area (Hindi) includes a doctor/medical-consult disclaimer');
assert(predictionsEn[9].text.toLowerCase().includes('doctor'), 'Life Predictions: Health area (English) includes a doctor-consult disclaimer');

// -------------------------------------------------------------
// SUITE 15: GRAHA (PLANET) ESSAYS
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[15/22] Testing 9 Graha Individual Essays...\x1b[0m');

const essaysHi = generateGrahaEssays(refReport, 'hi');
const essaysEn = generateGrahaEssays(refReport, 'en');
assert(essaysHi.length === 9, 'Graha Essays: exactly 9 essays generated (Sun through Ketu), Hindi');
assert(essaysEn.length === 9, 'Graha Essays: exactly 9 essays generated (Sun through Ketu), English');
assert(essaysHi.every(e => e.title && e.text && e.text.length > 30), 'Graha Essays: every Hindi essay has substantial content');
assert(essaysEn.every(e => e.title && e.text && e.text.length > 30), 'Graha Essays: every English essay has substantial content');
assert(!essaysHi.some(e => /\b(mercury|saturn|jupiter|venus|mars)\b/i.test(e.text.replace(e.title, ''))), 'Graha Essays: no stray raw-English planet names inside Hindi essay bodies');

// -------------------------------------------------------------
// SUITE 16: HINDI TRANSLATION LOOKUP (hindiTerms.js)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[16/22] Testing Hindi Term Translation Lookup...\x1b[0m');

assert(nakshatraHi('Pushya') === 'पुष्य', 'hindiTerms: nakshatraHi("Pushya") -> पुष्य');
assert(nakshatraHi('Ashwini') === 'अश्विनी', 'hindiTerms: nakshatraHi("Ashwini") -> अश्विनी');
assert(nakshatraHi('Revati') === 'रेवती', 'hindiTerms: nakshatraHi("Revati") -> रेवती');
assert(nakshatraHi('SomeUnknownNakshatra') === 'SomeUnknownNakshatra', 'hindiTerms: unknown nakshatra falls back to original string (never blank)');
assert(deityHi('Brihaspati') === 'बृहस्पति', 'hindiTerms: deityHi("Brihaspati") -> बृहस्पति');
assert(varnaHi('Kshatriya') === 'क्षत्रिय', 'hindiTerms: varnaHi("Kshatriya") -> क्षत्रिय');
assert(vashyaHi('Manav') === 'मानव', 'hindiTerms: vashyaHi("Manav") -> मानव');
assert(ganaHi('Deva') === 'देव', 'hindiTerms: ganaHi("Deva") -> देव');
assert(nadiHi('Madhya') === 'मध्य', 'hindiTerms: nadiHi("Madhya") -> मध्य');
assert(yoniHi('Goat (Sheep)') === 'मेष (भेड़)', 'hindiTerms: yoniHi("Goat (Sheep)") -> मेष (भेड़)');
assert(lordHi('Saturn') === 'शनि', 'hindiTerms: lordHi("Saturn") -> शनि');
assert(lordHi('UnknownLord') === 'UnknownLord', 'hindiTerms: unknown lord falls back safely (never throws/blanks)');

// -------------------------------------------------------------
// SUITE 17: MUHURAT ENGINE
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[17/22] Testing Muhurat Engine (Tithi/Vara parsing & category rules)...\x1b[0m');

assert(tithiNumberOf('Krishna Shashthi') === 6, 'Muhurat: tithiNumberOf parses "Krishna Shashthi" -> 6');
assert(tithiNumberOf('Shukla Panchami') === 5, 'Muhurat: tithiNumberOf parses "Shukla Panchami" -> 5');
assert(tithiNumberOf('Shukla Ekadashi') === 11, 'Muhurat: tithiNumberOf parses "Shukla Ekadashi" -> 11');
assert(tithiNumberOf('Purnima') === 15, 'Muhurat: tithiNumberOf("Purnima") -> 15');
assert(tithiNumberOf('Amavasya') === 30, 'Muhurat: tithiNumberOf("Amavasya") -> 30 (sentinel, always excluded)');
assert(varaNumberOf('Ravivara (Sunday)') === 0, 'Muhurat: varaNumberOf parses Sunday -> 0');
assert(varaNumberOf('Budhavara (Wednesday)') === 3, 'Muhurat: varaNumberOf parses Wednesday -> 3');
assert(varaNumberOf('Shanivara (Saturday)') === 6, 'Muhurat: varaNumberOf parses Saturday -> 6');
assert(Object.keys(CATEGORY_RULES).length === 4, 'Muhurat: all 4 categories defined (vivah/grihapravesh/naamkaran/business)');
assert(CATEGORY_RULES.vivah.goodNakshatras.includes('Rohini'), 'Muhurat: Vivah category includes Rohini as an auspicious nakshatra');
assert(CATEGORY_RULES.vivah.avoidVaraNums.includes(2), 'Muhurat: Vivah category avoids Tuesday (varaNum 2)');
assert(CATEGORY_RULES.grihapravesh.avoidVaraNums.includes(2) && CATEGORY_RULES.grihapravesh.avoidVaraNums.includes(6), 'Muhurat: Griha Pravesh avoids both Tuesday and Saturday');

const muhuratScan = findMuhurat('vivah', new Date('2026-09-02'), new Date('2026-10-02'), 25.3176, 82.9739, 5.5);
assert(Array.isArray(muhuratScan.matches), 'Muhurat: findMuhurat returns a matches array for a real date range');
assert(muhuratScan.matches.every(m => m.date instanceof Date), 'Muhurat: every match has a valid Date object');
assert(muhuratScan.matches.every(m => !CATEGORY_RULES.vivah.avoidVaraNums.includes(varaNumberOf(m.vara))), 'Muhurat: no returned Vivah match falls on an avoided weekday');

// -------------------------------------------------------------
// SUITE 18: INPUT VALIDATION (backend/_db.js) - regression tests for the real spam bug
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[18/22] Testing Server-Side Phone/Name Validation (anti-spam regression)...\x1b[0m');

// The exact malicious data from the real bug report
assert(isValidIndianPhone('8454070784548989494') === false, 'Validation: the exact reported 19-digit spam phone is rejected');
assert(isValidName('gsff') === true, 'Validation: "gsff" (4 alphabetic chars) technically passes the literal 3+char/alphabetic rule (documented limitation, not a bug)');
assert(isValidName('vsndbnz') === true, 'Validation: "vsndbnz" similarly passes the literal alphabetic rule (documented limitation)');

// Valid Indian mobile numbers (all 4 valid starting digits)
assert(isValidIndianPhone('9876543210') === true, 'Validation: valid 10-digit number starting with 9 -> accepted');
assert(isValidIndianPhone('8123456789') === true, 'Validation: valid 10-digit number starting with 8 -> accepted');
assert(isValidIndianPhone('7123456789') === true, 'Validation: valid 10-digit number starting with 7 -> accepted');
assert(isValidIndianPhone('6123456789') === true, 'Validation: valid 10-digit number starting with 6 -> accepted');
// Invalid starting digits (landline-range / not real mobile prefixes)
assert(isValidIndianPhone('5123456789') === false, 'Validation: number starting with 5 -> rejected');
assert(isValidIndianPhone('0123456789') === false, 'Validation: number starting with 0 -> rejected');
assert(isValidIndianPhone('1234567890') === false, 'Validation: number starting with 1 -> rejected');
// Length edge cases
assert(isValidIndianPhone('987654321') === false, 'Validation: 9-digit (too short) number -> rejected');
assert(isValidIndianPhone('98765432101') === false, 'Validation: 11-digit (too long) number -> rejected');
assert(isValidIndianPhone('') === false, 'Validation: empty string phone -> rejected');
assert(isValidIndianPhone('9876-543-210') === true, 'Validation: number with dashes strips non-digits correctly before checking');
assert(isValidIndianPhone('+91 9876543210') === false, 'Validation: number with country code becomes 12 digits after stripping -> correctly rejected');
// Name edge cases
assert(isValidName('a') === false, 'Validation: single-letter name -> rejected (too short)');
assert(isValidName('ab') === false, 'Validation: 2-letter name -> rejected (too short)');
assert(isValidName('abc') === true, 'Validation: exactly 3-letter name -> accepted (minimum boundary)');
assert(isValidName('12345') === false, 'Validation: purely numeric "name" -> rejected');
assert(isValidName('Amit123') === false, 'Validation: name with embedded digits -> rejected');
assert(isValidName('Amit Kumar') === true, 'Validation: real name with a space -> accepted');
assert(isValidName('राहुल शर्मा') === true, 'Validation: Devanagari name -> accepted');
assert(isValidName('') === false, 'Validation: empty name -> rejected');
assert(isValidName('   ') === false, 'Validation: whitespace-only name -> rejected');
assert(isValidName('Dr. Umang Nath Sharma') === true, 'Validation: name with a period (title abbreviation) -> accepted');
assert(isValidName('@#$%') === false, 'Validation: pure symbol "name" -> rejected');

// -------------------------------------------------------------
// SUITE 19: CROSS-VERIFICATION AGAINST THE REAL REFERENCE PRINTED BOOKLET
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[19/22] Cross-checking the full pipeline against the reference physical Kundli...\x1b[0m');

// Abhishek Raj, 23 Feb 1994, 14:20, Marhaura, Bihar - matched against the
// real printed Kundli booklet the user shared earlier this session.
const refChart = computeVedicChartData('1994-02-23', '14:20', 'Marhaura, Bihar', 25.7521, 84.8341, 5.5);
assert(refChart.lagna.rashi.includes('Mithuna'), 'Reference chart: Lagna = Mithuna (Gemini), matches physical booklet');
assert(refChart.moon.rashi.includes('Karka'), 'Reference chart: Moon Sign = Karka (Cancer), matches physical booklet');
assert(refChart.nakshatra.name === 'Pushya', 'Reference chart: Nakshatra = Pushya, matches physical booklet');
assert(refChart.nakshatra.pada === 1, 'Reference chart: Nakshatra Pada = 1, matches physical booklet');
assert(refChart.planets.length === 9, 'Reference chart: all 9 planets computed');
assert(refChart.houseData && Object.keys(refChart.houseData).length === 12, 'Reference chart: all 12 houses populated');

const refReportDasha = computeFullKundliReport('1994-02-23', '14:20', 'Marhaura, Bihar', 25.7521, 84.8341, 5.5).dasha;
assert(refReportDasha.mahadashas[0].endDate.getUTCFullYear() === 2010, 'Reference chart Dasha: 1st Mahadasha end-year (2010) matches the physical booklet\'s handwritten table');
assert(refReportDasha.mahadashas[1].endDate.getUTCFullYear() === 2027, 'Reference chart Dasha: 2nd Mahadasha end-year (2027) matches the physical booklet\'s handwritten table');
assert(refReportDasha.mahadashas[2].endDate.getUTCFullYear() === 2034, 'Reference chart Dasha: 3rd Mahadasha end-year (2034) matches the physical booklet\'s handwritten table');
const refDashaTotalYears = refReportDasha.mahadashas.reduce((s, m) => s + m.years, 0);
const refDashaPreBirthElapsed = VIMSHOTTARI_YEARS[refReportDasha.startingLord] - refReportDasha.balanceYears;
assert(Math.abs((refDashaTotalYears + refDashaPreBirthElapsed) - 120) < 0.01, 'Reference chart Dasha: total span + pre-birth-elapsed portion sums to exactly 120 years (internal consistency)');

// -------------------------------------------------------------
// SUITE 20: VASTU SCORE ENGINE
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[20/22] Testing Vastu Score Engine (form-based, verified classical rules)...\x1b[0m');

assert(VASTU_DIRECTIONS.length === 8, 'Vastu: all 8 directions defined');
assert(Object.keys(ROOM_RULES).length === 5, 'Vastu: exactly 5 room-types scored (matching the well-corroborated rule set)');
assert(ROOM_RULES.kitchen.ideal.includes('SE'), 'Vastu: Kitchen ideal direction is Southeast (cross-source verified)');
assert(ROOM_RULES.poojaRoom.ideal.includes('NE'), 'Vastu: Pooja Room ideal direction is Northeast (cross-source verified)');
assert(ROOM_RULES.masterBedroom.ideal.includes('SW'), 'Vastu: Master Bedroom ideal direction is Southwest (cross-source verified)');
assert(ROOM_RULES.toilet.ideal.includes('NW'), 'Vastu: Toilet ideal direction is Northwest (cross-source verified)');
assert(ROOM_RULES.toilet.avoid.includes('NE'), 'Vastu: Toilet explicitly avoids Northeast (cross-source verified as most inauspicious)');
assert(ROOM_RULES.mainDoor.ideal.includes('N') && ROOM_RULES.mainDoor.ideal.includes('E') && ROOM_RULES.mainDoor.ideal.includes('NE'), 'Vastu: Main Door ideal directions are N/E/NE (cross-source verified)');

const perfectVastu = calculateVastuScore({ mainDoor: 'N', kitchen: 'SE', poojaRoom: 'NE', masterBedroom: 'SW', toilet: 'NW' });
assert(perfectVastu.percentage === 100, 'Vastu: an all-ideal layout scores exactly 100%');
assert(perfectVastu.results.every(r => r.tier === 'ideal'), 'Vastu: an all-ideal layout has every room tiered as ideal');

const worstVastu = calculateVastuScore({ mainDoor: 'SW', kitchen: 'NE', poojaRoom: 'S', masterBedroom: 'SE', toilet: 'SW' });
assert(worstVastu.percentage < perfectVastu.percentage, 'Vastu: an all-defect layout scores lower than the all-ideal layout');
assert(worstVastu.results.every(r => r.tier === 'avoid'), 'Vastu: the deliberately-worst-case layout has every room tiered as avoid/defect');

const partialVastu = calculateVastuScore({ kitchen: 'SE' });
assert(partialVastu.results.length === 1, 'Vastu: a partial submission (1 of 5 rooms) scores only the provided room');
assert(partialVastu.percentage === 100, 'Vastu: a partial submission with an ideal room still shows 100% (proportional to what was provided)');

const emptyVastu = calculateVastuScore({});
assert(emptyVastu.results.length === 0 && emptyVastu.percentage === 0, 'Vastu: an empty submission returns zero results without crashing');

assert(scoreRoom('kitchen', 'SE').tier === 'ideal', 'Vastu scoreRoom: Kitchen in Southeast -> ideal');
assert(scoreRoom('kitchen', 'NW').tier === 'acceptable', 'Vastu scoreRoom: Kitchen in Northwest -> acceptable (secondary option)');
assert(scoreRoom('kitchen', 'NE').tier === 'avoid', 'Vastu scoreRoom: Kitchen in Northeast -> avoid (conflicts with water zone)');
assert(scoreRoom('kitchen', 'W') !== null, 'Vastu scoreRoom: an unlisted direction still returns a neutral result, not null');
assert(scoreRoom('unknownRoom', 'N') === null, 'Vastu scoreRoom: an unknown room-key safely returns null (no crash)');
assert(scoreRoom('kitchen', 'INVALID') === null, 'Vastu scoreRoom: an invalid direction string safely returns null (no crash)');

// -------------------------------------------------------------
// SUITE 21: SHADBALA & BHAVA BALA (PARTIAL - Sthana+Dig+Naisargika)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[21/22] Testing Shadbala & Bhava Bala (verified worked examples)...\x1b[0m');

// Uchcha Bala - verified worked example: Sun at 72° (12° Gemini), debilitation 190° -> 39.3
assert(Math.abs(uchchaBala('sun', 72) - 39.33) < 0.1, 'Shadbala Uchcha: Sun at 12° Gemini -> 39.3 Virupas (verified worked example)');
assert(uchchaBala('sun', 10) === 60, 'Shadbala Uchcha: planet at exact exaltation degree -> 60 (maximum)');
assert(uchchaBala('sun', 190) === 0, 'Shadbala Uchcha: planet at exact debilitation degree -> 0 (minimum)');

// Naisargika Bala - fixed values, verified against source (Sun strongest, Saturn weakest)
assert(NAISARGIKA_BALA.sun === 60, 'Shadbala Naisargika: Sun = 60 (maximum, fixed)');
assert(NAISARGIKA_BALA.saturn === 8.57, 'Shadbala Naisargika: Saturn = 8.57 (minimum, fixed)');
assert(NAISARGIKA_BALA.sun > NAISARGIKA_BALA.moon && NAISARGIKA_BALA.moon > NAISARGIKA_BALA.venus, 'Shadbala Naisargika: descending order Sun>Moon>Venus matches classical sequence');

// Dig Bala - verified against documented peak houses
assert(digBala('jupiter', 1) === 60, 'Shadbala Dig: Jupiter in House 1 (its peak) -> 60 (maximum)');
assert(digBala('jupiter', 7) === 0, 'Shadbala Dig: Jupiter in House 7 (180° opposite its peak) -> 0 (minimum)');
assert(digBala('sun', 10) === 60, 'Shadbala Dig: Sun in House 10 (its peak) -> 60');
assert(digBala('saturn', 7) === 60, 'Shadbala Dig: Saturn in House 7 (its peak) -> 60');
assert(digBala('moon', 4) === 60, 'Shadbala Dig: Moon in House 4 (its peak) -> 60');

// Bhava Dig Bala - verified worked example (Aries ascendant: 10th=60,11th=50...4th=0)
assert(bhavaDigBala(10) === 60, 'Bhava Dig: House 10 (peak) -> 60 (verified worked example)');
assert(bhavaDigBala(11) === 50, 'Bhava Dig: House 11 -> 50 (verified worked example)');
assert(bhavaDigBala(12) === 40, 'Bhava Dig: House 12 -> 40 (verified worked example)');
assert(bhavaDigBala(1) === 30, 'Bhava Dig: House 1 -> 30 (verified worked example)');
assert(bhavaDigBala(2) === 20, 'Bhava Dig: House 2 -> 20 (verified worked example)');
assert(bhavaDigBala(3) === 10, 'Bhava Dig: House 3 -> 10 (verified worked example)');
assert(bhavaDigBala(4) === 0, 'Bhava Dig: House 4 (opposite peak) -> 0 (verified worked example)');

// Full Shadbala/Bhava Bala structural checks against the real reference chart
const shadbalaTest = calculateShadbala(
    { sun: refReport.planetLongitudes.sun, moon: refReport.planetLongitudes.moon, mars: refReport.planetLongitudes.mars, mercury: refReport.planetLongitudes.mercury, jupiter: refReport.planetLongitudes.jupiter, venus: refReport.planetLongitudes.venus, saturn: refReport.planetLongitudes.saturn },
    Object.fromEntries(refReport.planets.filter(p => ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'].includes(p.key)).map(p => [p.key, p.house]))
);
assert(Object.keys(shadbalaTest).length === 7, 'Shadbala: all 7 classical planets scored for the reference chart');
assert(Object.values(shadbalaTest).every(v => v.totalVirupas > 0 && v.totalVirupas < 480), 'Shadbala: every planet\'s partial total is a plausible positive value, less than the full-calculation ceiling');
assert(Object.values(shadbalaTest).every(v => Math.abs(v.totalRupas - v.totalVirupas / 60) < 0.001), 'Shadbala: Rupas conversion is always exactly Virupas/60');

const houseLordsTest = {};
for (let h = 1; h <= 12; h++) houseLordsTest[h] = SIGN_LORD[refReport.houseData[h].rashiId];
const bhavaBalaTest = calculateBhavaBala(shadbalaTest, houseLordsTest);
assert(Object.keys(bhavaBalaTest).length === 12, 'Bhava Bala: all 12 houses scored for the reference chart');
assert(Object.values(bhavaBalaTest).every(v => v.totalVirupas >= 0), 'Bhava Bala: no house scores negative (Bhavadhipati + Dig are both non-negative by construction)');

// -------------------------------------------------------------
// SUITE 22: RATE LIMITER CONCURRENCY (regression test for a real race condition)
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m[22/22] Testing checkRateLimit() under concurrent load...\x1b[0m');

// A realistic in-memory mock matching MongoDB's actual atomicity and
// snapshot-return semantics (findOneAndUpdate's result is a snapshot
// taken at that specific atomic operation, not a live mutable reference -
// getting this wrong in a mock would hide the very race condition this
// suite exists to catch, or falsely report one that isn't there).
class MockRateLimitCollection {
    constructor() { this.docs = new Map(); }
    async createIndex() { return true; }
    async findOneAndUpdate(filter, update) {
        let doc = this.docs.get(filter._id);
        if (!doc) doc = { _id: filter._id, count: 0, ...(update.$setOnInsert || {}) };
        doc = { ...doc, count: doc.count + (update.$inc?.count || 0) };
        this.docs.set(filter._id, doc);
        return doc;
    }
}

const rlCol = new MockRateLimitCollection();
const rlDb = { collection: () => rlCol };
const rlReq = { headers: { 'x-forwarded-for': '203.0.113.5' } };

const concurrentResults = await Promise.all(
    Array.from({ length: 10 }, () => checkRateLimit(rlDb, rlReq, 'suite22-route', { limit: 5, windowMs: 600000 }))
);
const allowedCount = concurrentResults.filter(Boolean).length;
assert(allowedCount === 5, `Rate limiter: exactly 5 of 10 truly-concurrent requests allowed through at limit=5 (regression test for the check-then-act race condition fixed this session) - got ${allowedCount}`);
assert(concurrentResults.slice(0, 5).every(Boolean) && concurrentResults.slice(5).every(r => !r), 'Rate limiter: the first 5 concurrent requests succeed and the remaining 5 are blocked, in order');

// Sequential behavior (the common case) still works correctly too
const rlCol2 = new MockRateLimitCollection();
const rlDb2 = { collection: () => rlCol2 };
const seqResults = [];
for (let i = 0; i < 7; i++) {
    seqResults.push(await checkRateLimit(rlDb2, rlReq, 'suite22-seq', { limit: 5, windowMs: 600000 }));
}
assert(seqResults.filter(Boolean).length === 5, 'Rate limiter: sequential requests also correctly stop allowing after exactly 5 (limit=5)');
assert(seqResults[0] === true && seqResults[6] === false, 'Rate limiter: 1st sequential request allowed, 7th (beyond limit) blocked');

// Different IPs/routes must not share a rate-limit bucket
const rlCol3 = new MockRateLimitCollection();
const rlDb3 = { collection: () => rlCol3 };
const req1 = { headers: { 'x-forwarded-for': '198.51.100.1' } };
const req2 = { headers: { 'x-forwarded-for': '198.51.100.2' } };
for (let i = 0; i < 5; i++) await checkRateLimit(rlDb3, req1, 'suite22-iso', { limit: 5, windowMs: 600000 });
const otherIpAllowed = await checkRateLimit(rlDb3, req2, 'suite22-iso', { limit: 5, windowMs: 600000 });
assert(otherIpAllowed === true, 'Rate limiter: a different IP is not blocked by another IP\'s exhausted limit on the same route');

// Faladesh (interpretation text) generation
const shadbalaFaladeshTest = generateShadbalaFaladesh(shadbalaTest, 'en');
assert(shadbalaFaladeshTest.summary && shadbalaFaladeshTest.summary.length > 30, 'Shadbala Faladesh: generates a non-trivial summary');
assert(shadbalaFaladeshTest.ranked[0].rupas >= shadbalaFaladeshTest.ranked[shadbalaFaladeshTest.ranked.length - 1].rupas, 'Shadbala Faladesh: ranked list is sorted strongest-to-weakest');
assert(shadbalaFaladeshTest.strongNote.length > 20 && shadbalaFaladeshTest.weakNote.length > 20, 'Shadbala Faladesh: both strong and weak interpretive notes are non-trivial text');
const shadbalaFaladeshHi = generateShadbalaFaladesh(shadbalaTest, 'hi');
assert(shadbalaFaladeshHi.summary !== shadbalaFaladeshTest.summary, 'Shadbala Faladesh: Hindi and English summaries are genuinely different text, not the same string');

const bhavaBalaFaladeshTest = generateBhavaBalaFaladesh(bhavaBalaTest, 'en');
assert(bhavaBalaFaladeshTest.summary && bhavaBalaFaladeshTest.summary.length > 30, 'Bhava Bala Faladesh: generates a non-trivial summary');
assert(bhavaBalaFaladeshTest.ranked[0].rupas >= bhavaBalaFaladeshTest.ranked[bhavaBalaFaladeshTest.ranked.length - 1].rupas, 'Bhava Bala Faladesh: ranked list is sorted strongest-to-weakest');
assert(bhavaBalaFaladeshTest.ranked.length === 12, 'Bhava Bala Faladesh: ranks all 12 houses');


console.log('\n\x1b[1m\x1b[36m============================================================\x1b[0m');
console.log(`\x1b[1mTOTAL TESTS RUN: ${totalTests} | PASSED: \x1b[32m${passedTests}\x1b[0m | FAILED: \x1b[31m${failedTests}\x1b[0m\x1b[0m`);
console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');

if (failedTests > 0) {
    console.log('\x1b[31m🚨 SYSTEM HEALTH ALERT: Failures detected in test suite:\x1b[0m');
    failures.forEach((f, i) => {
        console.log(`  ${i + 1}. ${f.testName}: ${f.details}`);
    });
    process.exit(1);
} else {
    console.log('\x1b[32m✨ ALL SYSTEM HEALTH CHECKS PASSED PERFECTLY! System is 100% operational.\x1b[0m\n');
    process.exit(0);
}
