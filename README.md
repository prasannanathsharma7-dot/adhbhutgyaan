# Adhbhut Gyaan

Website and backend for **Adhbhut Gyaan** - Vedic pooja, paath, jaap, shraddh and astrology services by Dr. Umang Nath Sharma's family in Kashi (Varanasi): <https://www.adhbhutgyaan.com>

## How it fits together

```
 visitor ──► Vercel (CDN)  ── React + Vite single-page app, server-rendered at build time (SSR + prerender)
                │
                └─ /api/*  ──rewrite──►  Google Cloud Run  ── Express backend (server/index.js mounts backend/*.js)
                                              │
                                              ├─ MongoDB                       bookings, contacts, reviews, chat, subscribers, ...
                                              ├─ Meta WhatsApp Cloud API       the WhatsApp assistant (signature-verified webhook)
                                              ├─ Gmail (SMTP)                  notification e-mails to the team
                                              ├─ Gemini + Anthropic            the website chat assistant
                                              └─ Vercel Cron → /api/cron-reminders   daily booking reminders (CRON_SECRET)
 Browser also calls OpenStreetMap Nominatim (place search for Panchang / Kundli).
```

## Repository map

| Path | What lives there |
|---|---|
| `src/pages/` | One file per route (Home, Services, PriceList, Panchang, FreeKundli, Booking, ...). |
| `src/components/` | Shared UI. `components/services/` = Pooja Finder, directory, cards; `components/home/` reserved for home sections. |
| `src/catalog/` | **The pooja catalogue**: one list (103 entries) joining `services.json` and `priceList.json`; the Finder's concern taxonomy. Pure functions, unit-tested. |
| `src/data/` | Content as data: `services.json` (14 detail pages), `priceList.json` (published rates), media, heritage. |
| `src/config/` | Small switches: `contact.js` (WhatsApp number), `home.js` (featured services), `pricing.js` (price display gate). |
| `src/utils/` | Pure logic: Panchang/Kundli/Muhurat engines (astronomy-engine, Lahiri ayanamsa), pricing, phone validation, SEO helpers. |
| `backend/` | API handlers (one file each) + `backend/utils/auth.js` (**all authorization**) + `backend/utils/inbound-claims.js` (crash-safe webhook claims) + `agents/` and `admin/`. |
| `server/` | Express app that mounts `backend/` as `/api/*` (runs on Cloud Run). |
| `scripts/` | Build helpers (prerender, sitemap, price-list generator, crawler-text snapshots), test suites, audits. |
| `prerender/` | Hand-refreshable crawler-text snapshots (`npm`-independent; regenerate with `scripts/snapshot-content.mjs`). |
| `private/` | **Git-ignored.** The owner's own rate sheet (`price-source.csv`). Never commit. |
| `docs/` | `RUNBOOK.md` (operating it: uptime monitor, deploy/rollback, secret rotation, backup-restore drill, incident table, erasing a person's data), `QUALITY.md` (measured quality baseline + how to re-run the audits) and the owner's original pooja-description source document (content reference only; contains no rates). |

## Commands

```bash
npm install
npm run dev                 # Vite dev server (frontend only)
npm run build               # client + SSR bundles + prerender + sitemap  (writes dist/)
npm test                    # all suites below (no database, no network)
npm run audit:a11y          # axe-core WCAG 2.2 AA + reflow audit of the built site (needs a browser; see script header)
npm run build:price-list    # regenerate src/data/priceList.json from private/price-source.csv
```

Test suites run by `npm test`: `test-system-health` (414 checks: engines, forms, SEO, content), `test-security` (webhook signature, cron auth, CORS, phone), `test-authz` (role matrix across every privileged endpoint), `test-pricing`, `test-panchang-boundaries` (tithi/nakshatra/yoga/karana end times vs published panchangs), `test-catalog`, `test-privacy` (the privacy notice must name every third-party service the code calls, describe every data category, and the Free Kundli flow must stay opt-in with no birth data in URLs), `test-ops` (IST reminder dates, no duplicate reminders, notification retry queue, crash-safe WhatsApp message claims), `test-erasure` (delete-a-person's-data tool and the `/api/health` probe).
CI (`.github/workflows/ci.yml`) runs on **every** pull request (whatever its base) and every push to `main`: `npm audit` (fails on high/critical production vulnerabilities), `npm test`, `npm run build`, then in real Chromium the customer-journey smoke test (`scripts/e2e-smoke.mjs`, API mocked) and the accessibility + reflow audit (`scripts/audit-a11y.mjs`). A newer push cancels the run in progress.

## Single sources of truth (change it in one place)

- **Prices** - the owner's sheet → `private/price-source.csv` → `npm run build:price-list` → `src/data/priceList.json` (public prices only; the base rates never ship to the browser). A price is shown only when its status is `approved`.
- **Poojas** - `src/catalog` (+ `services.json` / `priceList.json`). Add or rename a ritual there; `test-catalog` fails if the Finder, directory and price list disagree.
- **Contact details** - `src/config/contact.js`. **Homepage highlights** - `src/config/home.js`.

## Environment variables (names only - values live in Vercel / Cloud Run, never in git)

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI`, `MONGODB_DB` | Cloud Run | Database |
| `ADMIN_KEY` (or `ADMIN_SECRET_KEY`) | Cloud Run | Admin panel login (role `admin`) |
| `AGENT_SECRET_KEY` | Cloud Run | Automation agents (role `agent`) |
| `CRON_SECRET` | **Vercel and Cloud Run (same value)** | Scheduled jobs (role `cron`); Vercel Cron sends it as a Bearer token |
| `SHEET_SYNC_SECRET` | Cloud Run | Google-Sheets sync script (role `sheet-sync`) |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` | Cloud Run | Meta WhatsApp Cloud API |
| `WHATSAPP_APP_SECRET` | Cloud Run | **Required**: Meta app secret used to verify every webhook signature (without it all webhook calls are rejected) |
| `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | Cloud Run | AI assistant |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_NOTIFY_EMAIL` | Cloud Run | Notification e-mail |
| `CALLMEBOT_APIKEY`, `CALLMEBOT_PHONE` | Cloud Run | Optional WhatsApp admin ping |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Cloud Run | Optional sheet sync |
| `EXTRA_ALLOWED_ORIGINS` | Cloud Run | Optional comma-separated extra CORS origins (e.g. one preview URL) |

## Security model in one paragraph

Every privileged endpoint authorizes through `backend/utils/auth.js`: four roles, each proven only by its own secret (no fallback to the admin key), constant-time comparison, `401` for bad credentials and `403` for the wrong role; the route → role matrix is documented at the top of that file and enforced by `test-authz`. Meta's WhatsApp webhook is verified by HMAC signature over the raw body (fail-closed). Admin secrets are never accepted from a URL or request body. CORS is an explicit allow-list (no `*.vercel.app`).

## Deploy and rollback

Merge to `main` → Vercel builds the frontend and Cloud Run (Cloud Build trigger) rebuilds the backend automatically. Change env vars **before** merging anything that needs them. Roll back with `git revert <commit>` (squash-merged PRs are one commit each); no change here migrates data.

## Working agreements

Small PRs with a test for every behaviour change; never publish a number or claim without an approved source; one source of truth per fact; look at the Vercel preview on a phone before merging UI changes; run `npm run audit:a11y` for UI work. Known follow-ups are tracked in the owner's "Start Here" guide.
