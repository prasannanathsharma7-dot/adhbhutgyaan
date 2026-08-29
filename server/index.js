// Cloud Run entry point — wraps the existing Vercel-style API handlers
// (from ../api/*.js) in an Express server, unchanged, so both Vercel and
// Cloud Run can serve the identical backend logic from one codebase.
//
// Each Vercel handler is `module.exports = async (req, res) => {...}` and
// already reads req.query / req.body / req.headers and calls
// res.status(x).json(y) - which is exactly what Express's req/res provide,
// so no rewriting of the handlers themselves was needed.

const express = require('express');
const app = express();

app.use(express.json({ limit: '2mb' }));

// --- Route handlers (each file maps 1:1 to its Vercel /api path) ---
const bookings = require('../api/bookings.js');
const contact = require('../api/contact.js');
const reviews = require('../api/reviews.js');
const newsletter = require('../api/newsletter.js');
const horoscope = require('../api/horoscope.js');
const health = require('../api/health.js');
const chat = require('../api/chat.js');
const cronReminders = require('../api/cron-reminders.js');
const whatsappWebhook = require('../api/whatsapp-webhook.js');
const analyticsSummary = require('../api/admin/analytics-summary.js');
const dispatchSankalp = require('../api/admin/dispatch-sankalp.js');
const syncFromSheets = require('../api/admin/sync-from-sheets.js');
const dailyPanchangCron = require('../api/agents/daily-panchang-cron.js');
const kundliPreanalyzer = require('../api/agents/kundli-preanalyzer.js');
const seoContentDrafter = require('../api/agents/seo-content-drafter.js');
const systemHealthAgent = require('../api/agents/system-health-agent.js');
const whatsappConcierge = require('../api/agents/whatsapp-concierge.js');

// Each handler already switches on req.method internally (GET/POST/PATCH/OPTIONS),
// so `app.all` (matches every HTTP method) is the correct mount for all of them.
app.all('/api/bookings', bookings);
app.all('/api/contact', contact);
app.all('/api/reviews', reviews);
app.all('/api/newsletter', newsletter);
app.all('/api/horoscope', horoscope);
app.all('/api/health', health);
app.all('/api/chat', chat);
app.all('/api/cron-reminders', cronReminders);
app.all('/api/whatsapp-webhook', whatsappWebhook);
app.all('/api/admin/analytics-summary', analyticsSummary);
app.all('/api/admin/dispatch-sankalp', dispatchSankalp);
app.all('/api/admin/sync-from-sheets', syncFromSheets);
app.all('/api/agents/daily-panchang-cron', dailyPanchangCron);
app.all('/api/agents/kundli-preanalyzer', kundliPreanalyzer);
app.all('/api/agents/seo-content-drafter', seoContentDrafter);
app.all('/api/agents/system-health-agent', systemHealthAgent);
app.all('/api/agents/whatsapp-concierge', whatsappConcierge);

// Simple root route so visiting the Cloud Run URL directly shows something
// sensible instead of "Cannot GET /" - the actual site stays on Vercel.
app.get('/', (req, res) => {
    res.status(200).json({ ok: true, service: 'adhbhutgyaan-backend', message: 'Backend is running. The website itself is at https://www.adhbhutgyaan.com' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Adhbhut Gyaan backend listening on port ${PORT}`);
});
