// Keeps the privacy notice and the code telling the same story. If someone adds a third-party service, a new
// data collection, or tracking, this fails until the notice (src/pages/Privacy.jsx) is reviewed and updated.
// No network, no database.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const walk = (dir, exts, out = []) => { for (const f of readdirSync(join(ROOT, dir))) { const rel = join(dir, f); const st = statSync(join(ROOT, rel)); if (st.isDirectory()) walk(rel, exts, out); else if (exts.includes(extname(f))) out.push(rel); } return out; };
const backendFiles = walk('backend', ['.js']);
const srcFiles = walk('src', ['.js', '.jsx']);
const backendText = backendFiles.map(read).join('\n');
const srcText = srcFiles.map(read).join('\n');
const policy = read('src/pages/Privacy.jsx');

console.log('\n\x1b[1m[1] Every third-party service the code calls is named in the notice\x1b[0m');
const providers = [
    ['Google Gemini', /generativelanguage\.googleapis\.com/, backendText],
    ['Anthropic', /api\.anthropic\.com|anthropic/i, backendText],
    ['Meta', /graph\.facebook\.com/, backendText],
    ['Gmail', /nodemailer|smtp\.gmail/i, backendText],
    ['OpenStreetMap', /nominatim\.openstreetmap\.org/, srcText],
    ['YouTube', /youtube\.com\/embed/, srcText],
    ['Vercel', /vercel/i, read('vercel.json') + read('package.json')],
    ['Google Cloud', /run\.app/, read('vercel.json')],
    ['MongoDB', /mongodb/i, backendText],
];
for (const [name, re, hay] of providers) {
    if (re.test(hay)) check(policy.includes(name), `code uses ${name} -> the notice names it`);
}

console.log('\n\x1b[1m[2] Every data category is described, and a NEW collection forces a privacy review\x1b[0m');
const collections = new Set([...backendText.matchAll(/collection\('([a-z_]+)'\)/g)].map(m => m[1]));
const reviewed = new Set(['bookings', 'contacts', 'reviews', 'subscribers', 'muhurat_orders', 'whatsapp_conversations', 'whatsapp_processed', 'messages', 'kundli_requests', 'horoscopes', 'daily_panchang', 'draft_articles', 'rate_limits', 'notification_jobs', 'erasure_log']);
const unreviewed = [...collections].filter(c => !reviewed.has(c));
check(unreviewed.length === 0, `no collection without a privacy review (${unreviewed.length ? 'NEW: ' + unreviewed.join(', ') : collections.size + ' known'})`);
for (const w of ['Booking / enquiry form', 'Contact form', 'Free Kundli', 'Reviews', 'Shubh Muhurat', 'Newsletter', 'WhatsApp assistant', 'IP address', 'How long we keep it', 'Your choices']) check(policy.includes(w), `notice has a section / item for "${w}"`);

console.log('\n\x1b[1m[2b] Claims that must stay true\x1b[0m');
const entry = read('index.html');
check(!/googletagmanager|gtag\(|google-analytics|fbq\(|connect\.facebook\.net|clarity\.ms|hotjar|plausible\.io|segment\.com|mixpanel/i.test(entry + srcText), 'no analytics / advertising tracker anywhere in index.html or src (the notice says there are none)');
check(!/Since your information is sent to us via WhatsApp|sent to us via WhatsApp/.test(policy) && !/Last updated: August 2026/.test(policy), 'the old statements (details only sent via WhatsApp; Aug 2026 text) are gone');
check(/PRIVACY_POLICY_VERSION/.test(read('src/pages/FreeKundli.jsx')) && /^export const PRIVACY_POLICY_VERSION = '\d{4}-\d{2}-\d{2}'/m.test(read('src/config/privacy.js')), 'the consent records a policy version');

console.log('\n\x1b[1m[3] Free Kundli: no hidden lead, no birth data in a URL\x1b[0m');
const kundli = read('src/pages/FreeKundli.jsx');
check(/contactConsent: false/.test(kundli), 'the "contact me" consent starts unchecked');
check(/if \(!form\.contactConsent\) return;/.test(kundli), 'a lead is created ONLY after explicit consent');
check(!/generate-kundli-pdf\?/.test(kundli) && /method: 'POST'[\s\S]{0,200}generate-kundli-pdf|generate-kundli-pdf[\s\S]{0,200}method: 'POST'/.test(kundli), 'the PDF is requested with POST, never with birth data in the query string');
check(/lat: birthGeo\.latitude/.test(kundli) && !/lat: 25\.3176/.test(kundli), 'the PDF uses the birth place coordinates, not a hard-coded Varanasi');
check(/maxLength=\{20\}/.test(kundli) && !/maxLength=\{10\}/.test(kundli), 'the phone box accepts international numbers (+ country code)');

console.log('\n\x1b[1m[4] Kundli PDF endpoint\x1b[0m');
process.env.NODE_ENV = 'production';
const pdf = require('../backend/generate-kundli-pdf.js');
const mkRes = () => ({ statusCode: 200, headers: {}, body: undefined, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, send(b) { this.body = b; return this; }, end() { return this; }, setHeader(k, v) { this.headers[k.toLowerCase()] = v; } });
{
    const r = mkRes(); await pdf({ method: 'GET', headers: {}, query: { name: 'Ravi', dob: '1990-05-14', tob: '06:30', pob: 'Mumbai' } }, r);
    check(r.statusCode === 405 && r.headers.allow === 'POST', 'GET with birth details in the URL is refused (405, Allow: POST)');
    check(/no longer accepted in the URL/.test(JSON.stringify(r.body)) && !('application/pdf' === r.headers['content-type']), 'the refusal explains why and produces no PDF');
    check(r.headers['cache-control'] === 'no-store' && r.headers['referrer-policy'] === 'no-referrer', 'responses are no-store with Referrer-Policy: no-referrer');
    const bad = mkRes(); await pdf({ method: 'POST', headers: {}, body: { name: 'Ravi' } }, bad);
    check(bad.statusCode === 400, 'POST without a date of birth is rejected (400)');
}

console.log(`\n\x1b[1mPRIVACY TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
