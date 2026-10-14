// Accessibility + reflow audit of the BUILT site (axe-core, WCAG 2.0-2.2 A/AA + best practices), at several
// screen widths. Not part of `npm test` / CI because it needs a browser; run it before merging UI work:
//
//   npm run build && npx vite preview --port 4173 &        (or any server for dist/)
//   npm i --no-save playwright axe-core && npx playwright install chromium     (once)
//   BASE_URL=http://localhost:4173 node scripts/audit-a11y.mjs                 (QUICK=1 = core pages only)
//
// Fails (exit 1) on any axe violation or any horizontal page scroll. Results are in docs/QUALITY.md.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(process.env.AXE_PATH || require.resolve('axe-core/axe.min.js'), 'utf8');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const WIDTHS = (process.env.WIDTHS || '320,390,768,1280').split(',').map(Number);
const CORE = ['/', '/services/', '/price-list/', '/booking/', '/free-kundli/', '/panchang/', '/about/', '/contact/', '/blog/', '/media/', '/privacy/', '/terms/', '/horoscope/', '/muhurat/', '/vastu-score/', '/pandit-for-pooja/', '/pt-umang-nath-sharma/', '/leave-a-review/'];
let pages = CORE;
if (!process.env.QUICK) {
    const sm = readFileSync(join(ROOT, 'dist', 'sitemap.xml'), 'utf8');
    const all = [...sm.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);
    pages = [...new Set([...CORE, ...all.map(p => (p.endsWith('/') ? p : p + '/'))])];
}

const browser = await chromium.launch();
let bad = 0, checks = 0;
for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    for (const path of pages) {
        checks++;
        try {
            await page.goto(BASE + path, { waitUntil: 'load' });
            await page.waitForTimeout(350);
            await page.evaluate(axeSource);
            const violations = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }).then(r => r.violations.map(v => `${v.id} x${v.nodes.length}`)));
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            if (violations.length || overflow > 0) { bad++; console.log(`✗ [${w}px] ${path}  ${violations.join(', ')}${overflow > 0 ? `  horizontal overflow ${overflow}px` : ''}`); }
        } catch (e) { bad++; console.log(`✗ [${w}px] ${path}  ${e.message.split('\n')[0]}`); }
    }
    await page.close();
}
await browser.close();
console.log(`\nA11Y AUDIT: ${checks} page/width checks | ${checks - bad} clean | ${bad} with issues`);
process.exit(bad ? 1 : 0);
