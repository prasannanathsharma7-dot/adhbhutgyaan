// Browser smoke test of the main customer journeys against the BUILT site (Playwright, real Chromium).
// The API is mocked, so it needs no backend, database or network. Run in CI after `npm run build`:
//
//   npx vite preview --port 4173 &   ;   BASE_URL=http://localhost:4173 node scripts/e2e-smoke.mjs
//   (needs: npm i --no-save playwright && npx playwright install chromium)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173';

let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');

async function newPage(browser, { width = 390, height = 900, extra = () => {} } = {}) {
    const ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 120)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text().slice(0, 120)); });
    const calls = [];
    await page.route('**/nominatim.openstreetmap.org/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ lat: '19.0760', lon: '72.8777', display_name: 'Mumbai, Maharashtra, India', address: { country_code: 'in' } }]) }));
    await page.route('**/api/**', r => {
        const u = new URL(r.request().url());
        calls.push({ path: u.pathname + u.search, method: r.request().method(), body: r.request().postData() });
        if (u.pathname === '/api/generate-kundli-pdf') return r.fulfill({ status: 200, contentType: 'application/pdf', body: PDF });
        if (u.pathname === '/api/bookings') return r.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' });
        return r.fulfill({ status: 404, contentType: 'application/json', body: '{"ok":false}' });
    });
    await extra(page);
    return { ctx, page, errors, calls };
}
const open = async (page, path) => { await page.goto(BASE + path, { waitUntil: 'load' }); await page.waitForTimeout(900); };

const browser = await chromium.launch();

console.log('\n\x1b[1m[1] Home\x1b[0m');
{
    const { ctx, page, errors } = await newPage(browser); await open(page, '/');
    check((await page.locator('h1').first().innerText()).length > 0, 'the page renders a heading');
    check(await page.locator('a[href="/services"]', { hasText: /View all \d+ poojas/ }).count() >= 1, 'the services section links to the full catalogue ("View all N poojas")');
    check(await page.locator('a[href="/price-list"]').count() >= 1, 'the price list is linked');
    const body = await page.innerText('body');
    check(!/Priya Gupta|Suresh Patel|Coming Soon/.test(body), 'no unverifiable sample testimonials or "Coming Soon" placeholders');
    check(errors.length === 0, `no script or console errors${errors.length ? ': ' + errors[0] : ''}`);
    await ctx.close();
}

console.log('\n\x1b[1m[2] Services: Pooja Finder and directory\x1b[0m');
{
    const { ctx, page, errors } = await newPage(browser); await open(page, '/services/');
    check(await page.locator('.concern-filter-list button').count() === 12, 'the Finder offers 12 concerns');
    await page.locator('.concern-filter-list button', { hasText: 'Children' }).click(); await page.waitForTimeout(500);
    check(/Santan Gopal/i.test(await page.innerText('body')), 'a concern returns relevant poojas (Children -> Santan Gopal)');
    await page.locator('#pooja-directory input[type=search]').fill('rudra'); await page.waitForTimeout(400);
    check(await page.locator('#pooja-directory .pooja-row').count() >= 6, 'searching "rudra" finds the Rudra rituals');
    await page.locator('#pooja-directory input[type=search]').fill('');
    const total = await page.locator('#pooja-directory [role=group] button').first().innerText();
    check(/\(\d{3}\)/.test(total), `the directory counts every pooja (${total.trim()})`);
    check(errors.length === 0, 'no errors');
    await ctx.close();
}

console.log('\n\x1b[1m[3] Price list\x1b[0m');
{
    const { ctx, page } = await newPage(browser); await open(page, '/price-list/');
    check((await page.innerText('body')).includes('₹501'), 'the consultation price is shown (₹501)');
    await page.fill('input[type=search]', 'ganesh'); await page.waitForTimeout(300);
    check(/Ganesh Paath/.test(await page.innerText('body')), 'search finds Ganesh Paath');
    await page.fill('input[type=search]', 'rudrabhishek'); await page.waitForTimeout(300);
    check(/Price on WhatsApp/.test(await page.innerText('body')), 'an item without an approved rate says "Price on WhatsApp" (no number)');
    await ctx.close();
}

console.log('\n\x1b[1m[4] Panchang: no location pop-up on load\x1b[0m');
{
    const { ctx, page } = await newPage(browser, { extra: p => p.addInitScript('window.__geo=0; if(navigator.geolocation){const o=navigator.geolocation.getCurrentPosition.bind(navigator.geolocation); navigator.geolocation.getCurrentPosition=function(){window.__geo++; return o.apply(null,arguments)}}') });
    await open(page, '/panchang/');
    check(await page.evaluate('window.__geo') === 0, 'the page does not ask for the visitor\'s location by itself');
    check(await page.locator('button', { hasText: 'Use my location' }).count() === 1, 'there is a "Use my location" button instead');
    await ctx.close();
}

console.log('\n\x1b[1m[5] Free Kundli: opt-in, POST, correct place\x1b[0m');
async function kundli(consent) {
    const { ctx, page, calls, errors } = await newPage(browser); await open(page, '/free-kundli/');
    await page.fill('#kundli-name', 'Ravi Sharma');
    await page.fill("[aria-label='Day of birth']", '14'); await page.selectOption("[aria-label='Month of birth']", { index: 5 }); await page.fill("[aria-label='Year of birth (4 digits)']", '1990');
    await page.fill('#kundli-pob', 'Mumbai, Maharashtra');
    if (consent) { await page.locator("label:has-text('contact me') input[type=checkbox]").check(); await page.fill('#kundli-phone', '+44 7911 123456'); }
    await page.click('button[type=submit]'); await page.waitForTimeout(2200);
    const dl = page.waitForEvent('download', { timeout: 8000 });
    await page.click('text=Download Now'); await dl;
    await ctx.close();
    return { calls, errors };
}
{
    const a = await kundli(false);
    check(a.calls.filter(c => c.path === '/api/bookings').length === 0, 'without the consent box, no lead is created');
    const pdf = a.calls.find(c => c.path.startsWith('/api/generate-kundli-pdf'));
    check(pdf && pdf.method === 'POST' && !pdf.path.includes('?'), 'the PDF is requested with POST and nothing in the URL');
    const body = JSON.parse(pdf.body);
    check(Math.abs(body.lat - 19.076) < 0.01, 'the PDF uses the birth place coordinates (Mumbai), not Varanasi');
    const b = await kundli(true);
    const lead = b.calls.find(c => c.path === '/api/bookings');
    check(lead && JSON.parse(lead.body).consent?.contact === true && /\+44/.test(JSON.parse(lead.body).phone), 'with consent, one lead is created, recording the consent, and an international number is accepted');
    check(a.errors.length === 0 && b.errors.length === 0, `no errors${(a.errors[0] || b.errors[0]) ? ': ' + (a.errors[0] || b.errors[0]) : ''}`);
}

console.log('\n\x1b[1m[6] Privacy and About\x1b[0m');
{
    const { ctx, page } = await newPage(browser); await open(page, '/privacy/');
    const t = await page.innerText('body');
    check(/Version 2\.0/.test(t) && ['Gemini', 'Anthropic', 'OpenStreetMap', 'Meta'].every(x => t.includes(x)), 'the privacy notice shows its version and names the services we use');
    await open(page, '/about/');
    await page.locator('a[href="/media"]').first().click(); await page.waitForTimeout(800);
    check(page.url().endsWith('/media') || page.url().endsWith('/media/'), 'About links to the Videos & Interviews page');
    await ctx.close();
}

console.log('\n\x1b[1m[7] Track my booking\x1b[0m');
{
    const { ctx, page, calls } = await newPage(browser, { extra: async (pg) => {
        await pg.route('**/api/booking-status', (r) => {
            const body = JSON.parse(r.request().postData() || '{}');
            if (body.phoneLast4 !== '3210') return r.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'We could not find a booking with these details.' }) });
            return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, booking: { reference: 'AG-2026-1A2B3C', firstName: 'Ravi', serviceName: 'Rudrabhishek', mode: 'online', preferredDate: '2 Nov', scheduledDate: '', cancelled: false, currentStage: 'contacted',
                stages: [{ key: 'received', labelEn: 'Enquiry received', labelHi: 'x', done: true, at: '2026-10-15T10:00:00Z' }, { key: 'contacted', labelEn: "Pandit ji's team has contacted you", labelHi: 'x', done: true, at: '2026-10-15T12:00:00Z' }, { key: 'confirmed', labelEn: 'Date and details confirmed', labelHi: 'x', done: false, at: null }, { key: 'completed', labelEn: 'Ritual performed', labelHi: 'x', done: false, at: null }, { key: 'proof', labelEn: 'Photo / video proof shared', labelHi: 'x', done: false, at: null }] } }) });
        });
    } });
    await open(page, '/track/?ref=ag-2026-1a2b3c');
    check((await page.inputValue('#track-ref')) === 'AG-2026-1A2B3C', 'the reference from the e-mail link is pre-filled (upper-cased)');
    await page.fill('#track-last4', '9999'); await page.click('button[type=submit]'); await page.waitForTimeout(500);
    check(/could not find/.test(await page.innerText('body')), 'wrong digits show a clear message');
    await page.fill('#track-last4', '3210'); await page.click('button[type=submit]'); await page.waitForTimeout(500);
    const txt = await page.innerText('body');
    check(/Namaste Ravi/.test(txt) && /Enquiry received/.test(txt) && /contacted you/.test(txt), 'the right details show a greeting and the timeline');
    check((await page.locator('ol li svg').count()) === 5, 'five stages are drawn');
    check(calls.filter(c => c.path === '/api/booking-status').every(c => c.method === 'POST' && !c.path.includes('?')), 'the lookup is a POST (nothing personal in a URL)');
    await ctx.close();
}

await browser.close();
console.log(`\n\x1b[1mE2E SMOKE: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
