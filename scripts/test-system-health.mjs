// Automated Self-Test & Diagnostic Script
// File: scripts/test-system-health.mjs
// Run via: node scripts/test-system-health.mjs or npm test

import { calculateInstantKundli, RASHIS, NAKSHATRAS } from '../src/utils/kundliEngine.js';
import { calculateGlobalPanchang, calculateSolarGeometry, formatMinutesToTime } from '../src/utils/astroEngine.js';
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
console.log('\x1b[1m\x1b[33m[1/5] Testing Vedic Kundli Ephemeris Calculation Engine...\x1b[0m');

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
console.log('\n\x1b[1m\x1b[33m[2/5] Testing Global Dynamic Panchang & Solar Ephemeris...\x1b[0m');

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
console.log('\n\x1b[1m\x1b[33m[3/5] Testing Frontend Pages & Critical Components...\x1b[0m');

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
console.log('\n\x1b[1m\x1b[33m[4/5] Testing Backend API Microservices & Agent Routes...\x1b[0m');

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
console.log('\n\x1b[1m\x1b[33m[5/5] Testing Production Distribution & Pre-Rendered Pages...\x1b[0m');

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
// FINAL SUMMARY
// -------------------------------------------------------------
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
