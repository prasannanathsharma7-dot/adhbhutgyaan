// Snapshots every page's real, rendered content (English + Hindi) into
// prerender/<page>.html, which scripts/generate-seo-pages.mjs then injects
// into the static HTML at build time.
//
// WHY: the site is a client-rendered React SPA, so the HTML a server sends is
// an empty <div id="root">. Google runs JavaScript and copes, but many other
// readers do not: AI answer engines and their crawlers, basic Bing/Yandex
// fetches, social-link unfurlers, and most SEO tools see a blank page. And
// Hindi is only ever shown after the visitor toggles the language, so no
// crawler would ever have seen the site's Hindi text at all.
//
// This script is run by a person (it needs a real browser, which Vercel's build
// does not have), and its output is committed. Re-run it whenever page content
// changes materially:
//
//     npm run build                      # produce dist/
//     npx serve -s dist -l 4343 &        # serve it
//     node scripts/snapshot-content.mjs  # refresh prerender/*.html
//     git add prerender && git commit
//
// If a page's snapshot is stale the worst case is slightly old text for
// non-JS crawlers - visitors always get the live React page.

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// createRequire (not a bare ESM import) so playwright resolves the same way it
// does for a normal `require` - it is installed globally/outside this repo's
// node_modules and is deliberately NOT a project dependency (Vercel's build
// has no browser, so it must not be installed there).
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'prerender');
const BASE = process.env.SNAPSHOT_BASE || 'http://127.0.0.1:4343';
const CONCURRENCY = 6;

const sitemap = readFileSync(join(ROOT, 'public', 'sitemap.xml'), 'utf-8');
const paths = [...sitemap.matchAll(/<loc>https:\/\/www\.adhbhutgyaan\.com([^<]*)<\/loc>/g)].map(m => m[1] || '/');

export const fileKeyFor = (p) => (p === '/' ? 'index' : p.replace(/^\//, '').replace(/\//g, '__'));

// Runs inside the page. Walks <main>, keeping only meaningful text structure.
function extractMain() {
    const KEEP = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'dl', 'dt', 'dd', 'details', 'summary', 'br']);
    const SKIP = new Set(['script', 'style', 'noscript', 'svg', 'img', 'picture', 'video', 'audio', 'canvas', 'iframe', 'button', 'input', 'select', 'textarea', 'form', 'label', 'option', 'nav']);
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const walk = (node) => {
        if (node.nodeType === 3) return esc(node.textContent.replace(/\s+/g, ' '));
        if (node.nodeType !== 1) return '';
        const tag = node.tagName.toLowerCase();
        // data-nosnapshot marks content that depends on today's date (Panchang card, upcoming muhurats):
        // frozen into static text it would show stale dates to crawlers for as long as the snapshot lives.
        if (SKIP.has(tag) || node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('data-nosnapshot')) return '';
        const cs = getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden') return '';
        const inner = Array.from(node.childNodes).map(walk).join('');
        if (tag === 'a') {
            const href = node.getAttribute('href') || '';
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || /^(tel|mailto|https?:\/\/wa\.me)/.test(href)) return inner;
            return inner.trim() ? `<a href="${esc(href)}">${inner}</a>` : '';
        }
        if (tag === 'br') return '<br>';
        if (KEEP.has(tag)) return inner.trim() ? `<${tag}>${inner}</${tag}>` : '';
        const block = ['block', 'flex', 'grid', 'list-item', 'table', 'flow-root'].includes(cs.display);
        return block ? ` ${inner} ` : inner;
    };
    const main = document.querySelector('main#main-content');
    if (!main) return '';
    return walk(main).replace(/\s+/g, ' ').replace(/> </g, '><').trim();
}

async function snapshot(browser, lang, path) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript((l) => { try { localStorage.setItem('kps_lang', l); } catch { /* ignore */ } }, lang);
    const page = await ctx.newPage();
    try {
        await page.goto(BASE + path, { waitUntil: 'load', timeout: 20000 });
        await page.waitForSelector('main#main-content h1, main#main-content h2', { timeout: 12000 });
        await page.waitForTimeout(500);
        return await page.evaluate(extractMain);
    } catch (e) {
        console.warn(`[snapshot] ${lang} ${path}: ${e.message.split('\n')[0]}`);
        return '';
    } finally {
        await ctx.close();
    }
}

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith('.html')) unlinkSync(join(OUT, f));

const browser = await chromium.launch();
const queue = [...paths];
const stats = [];
async function worker() {
    while (queue.length) {
        const p = queue.shift();
        const en = await snapshot(browser, 'en', p);
        const hi = await snapshot(browser, 'hi', p);
        if (!en && !hi) continue;
        const html = `<section lang="en">${en}</section>\n<section lang="hi">${hi}</section>\n`;
        writeFileSync(join(OUT, fileKeyFor(p) + '.html'), html);
        stats.push({ p, en: en.length, hi: hi.length });
    }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();

const total = stats.reduce((s, x) => s + x.en + x.hi, 0);
const empty = stats.filter(x => x.en < 400 || x.hi < 400);
console.log(`[snapshot] ${stats.length}/${paths.length} pages | ${(total / 1024).toFixed(0)} KB total | avg ${(total / stats.length / 1024).toFixed(1)} KB/page`);
if (empty.length) console.log('[snapshot] suspiciously short:', empty.map(x => `${x.p}(en ${x.en}, hi ${x.hi})`).join(', '));
