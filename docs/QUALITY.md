# Quality baseline

Measured on the built site (compressed static server, like production), mobile emulation, 14 Oct 2026. Lighthouse numbers are the **median of 3 runs** with Lighthouse's simulated slow 4G + 4x CPU slowdown in a modest sandbox, so absolute values are pessimistic; compare them only with each other.

## Lighthouse (mobile, performance)

| Page | Score before → after | TBT (blocking time) | FCP |
|---|---|---|---|
| Home | 43 → **68** | 3,332 ms → **81 ms** | 3.6 s → 3.6 s |
| Services | 73 → **78** | 51 → 206 ms | 2.9 s → **2.0 s** |
| Price list | 76 → 77 | 184 → **86 ms** | 2.0 s → 3.0 s (run-to-run noise) |

What moved the numbers: the homepage's "Upcoming Auspicious Dates" widget used to load the astronomy engine and compute 60 days of muhurats right after load; it now loads and runs only when the visitor scrolls near it (and sits next to the Panchang card instead of directly under the hero).

### Simulated vs applied throttling (read this before trusting any single number)

Lighthouse's default *simulated* throttling over-estimates Largest Contentful Paint on this site (5-6 s). Re-measured with *applied* throttling (real slow-4G + 4x CPU slowdown, `--throttling-method=devtools`) on the full production build, 3 runs each:

| Page | FCP / LCP | CLS | Note |
|---|---|---|---|
| Home | 1.5 s / 1.5 s | median 0.033 (0.032-0.044) | one outlier run measured 0.11 while the machine was busy - repeat before believing a single run |
| Services | 1.4 s / 1.4 s | 0.037 | |
| Price list | 1.5 s / 1.5 s | 0.031 | |

FCP/LCP under 2.5 s and CLS under 0.1 are in Google's "good" range. Total blocking time stays noisy in a shared sandbox (hundreds of ms to ~2 s under a 4x CPU slowdown); judge it on a real phone.

**Tried and rejected:** "correcting" the font preload list (the build preloads Poppins 400/600 and Playfair 700; the hero actually paints Poppins 400/600, Tiro Devanagari latin, Playfair 800 and 400). Preloading those five faces measured *worse* (median CLS 0.13, LCP 1.6 s vs 0.033 / 1.47 s), so the original list stays. Measure before and after any font or preload change.

Accessibility, Best Practices and SEO were already 96-100 before this work (Lighthouse); the stricter axe-core audit below found and fixed the real issues.

## Accessibility + reflow (axe-core, WCAG 2.0-2.2 A/AA + best practices)

- 19 core pages at 320 / 390 / 1280 px, a random sample of 34 further sitemap pages at 390 / 1280 px, 12-20 pages at 360-1920 px: **0 violations, 0 horizontal overflow** after the fixes.
- Fixed in this pass: contrast (gold-on-white, white-on-gold, weekday colours, WhatsApp green text/buttons), keyboard access for swipe rows, heading order, form labels, target size of star buttons, label/visible-text mismatches (language toggle, proof cards), 29 grids that could not shrink below 320 px, the founder page's fixed two-column layout, and the Panchang page asking for location permission on load.

## Re-running

```bash
npm run build && npx vite preview --port 4173
AXE_PATH=/path/to/axe.min.js BASE_URL=http://localhost:4173 npm run audit:a11y        # QUICK=1 for core pages only
npx lighthouse http://localhost:4173/ --only-categories=performance --form-factor=mobile
```
