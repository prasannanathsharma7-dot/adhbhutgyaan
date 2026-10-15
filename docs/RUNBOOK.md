# Runbook - running Adhbhut Gyaan in production

Short, practical, in the order you will need it. Architecture and the repo map are in `README.md`.

## 1. Know when it is down (uptime monitor - set this up once)
Create two monitors in any uptime service (UptimeRobot, Better Stack, ...), alerting by e-mail / WhatsApp, 1-5 minute interval:

| Monitor | URL | Healthy |
|---|---|---|
| Website | `https://www.adhbhutgyaan.com/` | HTTP 200 |
| API + database | `https://www.adhbhutgyaan.com/api/health` | HTTP 200 and `{"ok":true,"checks":{"database":"up"}}` |

`/api/health` answers **503** when the database is unreachable (so any monitor reads it as DOWN) and never reveals internal error text. It also reports `revision` (the deployed Cloud Run revision) and `uptimeSeconds`.

## 2. Deploy and roll back
- **Deploy:** merge to `main`. Vercel builds the site; Cloud Build rebuilds the backend on Cloud Run automatically. Set new environment variables **before** merging code that needs them.
- **Roll back the code:** GitHub -> the merge commit -> *Revert* (or `git revert -m 1 <merge commit>`), merge the revert PR.
- **Roll back only the backend fast:** Google Cloud Console -> Cloud Run -> the service -> *Revisions* -> route 100% of traffic to the previous revision.
- **Roll back only the site:** Vercel -> Deployments -> the previous Ready deployment -> *Promote to Production*.
- No release has changed the database schema, so a code rollback is always safe.

## 3. Secrets - where they live and how to rotate
Names are listed in `README.md` (values only ever in Vercel / Cloud Run, never in git or chat). To rotate one:
1. Make a new value: `openssl rand -hex 32` (for `ADMIN_KEY`, `AGENT_SECRET_KEY`, `CRON_SECRET`, `SHEET_SYNC_SECRET`).
2. Set it in Cloud Run (new revision), and **also in Vercel for `CRON_SECRET`** (Vercel Cron sends it; both must match).
3. Update whoever uses it (admin panel login, the Google-Sheets script, Meta for `WHATSAPP_APP_SECRET` which comes from the Meta app dashboard).
4. Rotate immediately if a key or token was pasted into a chat, an e-mail, a screenshot or a URL.

## 4. Backups - and proving you can restore (NOT yet done: needs the database provider)
A backup you have never restored is a hope, not a backup. Do this once now, then every quarter:
1. In the database provider's console confirm automated backups / point-in-time recovery are **on**, and note the retention.
2. Restore the latest snapshot into a **separate, temporary** database (never over production).
3. Check it: record counts for `bookings`, `contacts`, `reviews`, `subscribers` look right; open three recent bookings and compare with the admin panel.
4. Write down the date, how long the restore took, and the result (keep it in this file or a shared note). Delete the temporary database.

## 5. When something breaks
| Symptom | Look at | Likely fix |
|---|---|---|
| Site shows "deployment paused" | Vercel -> Billing | Pay the invoice; add a backup card |
| `/api/health` 503 | Cloud Run logs; the database provider status | `MONGODB_URI` wrong / database paused or full |
| WhatsApp bot silent | Cloud Run logs: "cannot verify signatures" or "bot misconfigured" | set `WHATSAPP_APP_SECRET` / the bot keys (the webhook answers 503 on purpose so Meta retries) |
| Booking e-mails/WhatsApp to the team stopped | `notification_jobs` collection: `pending` = waiting for the daily retry, `dead` = failed 5 times | fix `GMAIL_*` / `CALLMEBOT_*`; run the cron (below) to retry |
| Customer reminders not going out | Vercel -> Cron Jobs -> run `cron-reminders`: 401 = `CRON_SECRET` differs between Vercel and Cloud Run | make them identical |
| Kundli PDF fails | Cloud Run logs for `generate-kundli-pdf` | rate limit (429) or bad input (400); the page shows a retry message |

Run the daily job by hand: Vercel -> Project -> Cron Jobs -> `cron-reminders` -> *Run* (expect 200 and `ok: true`).

## 6. A person asks us to delete their data (privacy notice: "we delete them when you ask")
Admin-only endpoint, **dry run first**:
```bash
# 1) see what would be deleted (nothing is deleted)
curl -s -X POST https://www.adhbhutgyaan.com/api/admin/erase-person \
  -H "x-admin-key: $ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"phone":"+91 98765 43210"}'          # or {"email":"person@example.com"}; both may be given

# 2) after checking the counts, delete for real
curl -s -X POST https://www.adhbhutgyaan.com/api/admin/erase-person \
  -H "x-admin-key: $ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"phone":"+91 98765 43210","confirm":"ERASE"}'
```
It matches the number however it was typed (+91, 0, spaces) or the e-mail in any case, and removes the records from bookings, contacts, reviews, newsletter, Muhurat orders, WhatsApp conversations, Kundli leads, contact messages and queued notifications. It writes an `erasure_log` entry that holds only a hash, the counts and the date. Reply to the person when it is done. Database backups expire on the provider's schedule. (There is no automatic "export my data" yet: do it by hand from the admin panel if asked.)

## 7. Before every release
`npm test` (all suites), `npm run build`, and for anything visible `npm run e2e:smoke` and `npm run audit:a11y` (CI runs them on every pull request). Look at the Vercel preview **on a phone**. Merge with *Create a merge commit* so pieces can be reverted separately.

## 8. Smart features and how to switch them on
| Feature | Where | Switch | Needs |
|---|---|---|---|
| Booking tracker | `/track`, e-mail link | on | nothing |
| Festivals + tithi calendar | `/festivals` | on | after Dec 2026 ask for the next season to be added (`scripts/build-festivals.mjs`) |
| Weekly digest to the owner | Monday 09:00 IST (Vercel cron `/api/cron-weekly-digest`) | on | `CRON_SECRET` (same value on Vercel and Cloud Run) |
| AI-drafted first reply for the team | in the new-booking e-mail / WhatsApp | `ENABLE_REPLY_DRAFTS=1` | `ANTHROPIC_API_KEY`; privacy notice already mentions it |
| WhatsApp updates to the customer | automatic | `WHATSAPP_TEMPLATES_ENABLED=1` | approved Meta templates (`docs/WHATSAPP_TEMPLATES.md`) |

Roll each one out alone, test with your own number, then leave it on. To turn one off, remove the variable (a new Cloud Run revision); nothing else changes.
