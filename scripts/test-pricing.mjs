// Pricing regression tests (run via `npm test`). No database, no network.
// The private rate sheet (private/price-source.csv) is NOT in git, so the checks that
// need it run only when the file exists locally; everything else runs in CI too.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { roundPublic, publicPrice, formatPrice } from '../src/utils/pricing.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };

console.log('\n\x1b[1m[1] +10% and rounding policy\x1b[0m');
const table = [[5, 5.5], [6, 6.5], [8, 9], [10, 11], [12, 13], [15, 16.5], [20, 22], [25, 27.5], [30, 33], [50, 55], [65, 71.5], [85, 93.5], [100, 110], [125, 140], [150, 165], [200, 220],
    [250, 275], [500, 550], [700, 770], [1100, 1210], [1500, 1650], [2100, 2310], [4000, 4400], [8000, 8800], [10000, 11000], [11000, 12100]];
for (const [base, want] of table) check(publicPrice(base) === want, `base ₹${base} -> website ₹${want}`);
check(roundPublic(99.74) === 99.5 && roundPublic(99.76) === 100, 'rounding switches cleanly at ₹100');
// the uplift is never silly: within 10% +/- the rounding step, for every approved-size base
let worst = 0;
for (let b = 5; b <= 12000; b += 5) worst = Math.max(worst, Math.abs(publicPrice(b) / b - 1.1));
check(worst < 0.1, `effective markup stays within 10% +/- 10 points even on tiny unit rates (worst deviation ${(worst * 100).toFixed(1)} pts)`);
let worstBig = 0;
for (let b = 500; b <= 12000; b += 5) worstBig = Math.max(worstBig, Math.abs(publicPrice(b) / b - 1.1));
check(worstBig < 0.006, `for prices ≥ ₹500 the uplift is 10% ±0.6 pt (worst ${(worstBig * 100).toFixed(2)} pt)`);
check(formatPrice(6.5) === '₹6.5' && formatPrice(1210) === '₹1,210' && formatPrice(11000) === '₹11,000' && formatPrice(16.5) === '₹16.5', 'price formatting (₹, Indian grouping, .5 only when needed)');

console.log('\n\x1b[1m[2] Published price list (src/data/priceList.json)\x1b[0m');
const pl = JSON.parse(readFileSync(join(ROOT, 'src/data/priceList.json'), 'utf8'));
check(pl.consultation.price === 501, 'astrology consultation is ₹501');
check(pl.markupPercent === 10, 'markup recorded as 10%');
const nos = pl.items.map(i => i.no);
check(new Set(nos).size === nos.length, 'item numbers are unique');
check(nos.every(n => n >= 1 && n <= 101), 'item numbers all within 1..101');
check(pl.items.every(i => ['A', 'B', 'C', 'D'].includes(i.category)), 'every item has a valid category');
check(pl.items.every(i => i.nameHi && i.nameEn), 'every item has Hindi and English names');
const approved = pl.items.filter(i => i.status === 'approved');
check(approved.length > 0 && approved.every(i => i.min > 0 && i.max >= i.min), 'every approved item has a valid price (min>0, max>=min)');
check(approved.every(i => Math.abs(i.min * 2 - Math.round(i.min * 2)) < 1e-9 && Math.abs(i.max * 2 - Math.round(i.max * 2)) < 1e-9), 'prices sit on the ₹0.50 grid');
check(approved.every(i => i.priceType === (i.min === i.max ? 'fixed' : 'range')), 'priceType matches min/max');
check(pl.items.filter(i => i.status !== 'approved').every(i => i.min === null && i.max === null), 'unapproved/ask items carry NO numbers (nothing unreviewed ships to the browser)');
const raw = readFileSync(join(ROOT, 'src/data/priceList.json'), 'utf8');
check(!/base|wholesale|net_rate|netRate|dakshina_min/i.test(raw), 'no base/wholesale rate fields leak into the public file');
check(!pl.items.some(i => [3, 27, 99].includes(i.no)), 'items whose names are unclear are kept off the public list');
check(!existsSync(join(ROOT, 'private/price-source.csv')) || !/private\//.test(readFileSync(join(ROOT, '.gitignore'), 'utf8')) === false, 'private/ is git-ignored');

console.log('\n\x1b[1m[3] Cross-check against the private rate sheet (only when present)\x1b[0m');
const csvPath = join(ROOT, 'private/price-source.csv');
if (existsSync(csvPath)) {
    const lines = readFileSync(csvPath, 'utf8').trim().split('\n').slice(1);
    let bad = 0, n = 0;
    for (const ln of lines) {
        const f = ln.split(',');
        if (f[4] !== 'approved') continue;
        const item = pl.items.find(i => i.no === Number(f[0]));
        if (!item) { bad++; continue; }
        n++;
        if (item.min !== publicPrice(Number(f[6])) || item.max !== publicPrice(Number(f[7]))) bad++;
    }
    check(bad === 0, `all ${n} approved prices equal base +10% under the rounding rule`);
} else {
    console.log('  (private/price-source.csv not present - skipped)');
}

console.log(`\n\x1b[1mPRICING TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
