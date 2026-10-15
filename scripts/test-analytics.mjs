// The admin analytics endpoint must stay cheap as the business grows (audit F-15): bounded reads, exact lifetime counts,
// no internal error text. In-memory database, no network.
import { createRequire } from 'node:module';
import { makeDb } from './lib/fake-db.mjs';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const { loadAnalyticsWindow, parseDays, MAX_DOCS } = require('../backend/admin/analytics-summary.js');
const DAY = 86400000, now = new Date('2026-10-15T00:00:00Z');

console.log('\n\x1b[1m[1] The window is clamped\x1b[0m');
check(parseDays(undefined) === 90 && parseDays('abc') === 90, 'default 90 days');
check(parseDays('1') === 7 && parseDays('99999') === 730 && parseDays('30') === 30, 'clamped to 7..730 days');

console.log('\n\x1b[1m[2] Only the window is loaded, newest first, capped\x1b[0m');
{
    const db = makeDb(); const b = db.collection('bookings');
    for (let i = 0; i < 12000; i++) await b.insertOne({ name: 'n' + i, phone: '9' + i, createdAt: new Date(now.getTime() - (i % 700) * DAY), source: i % 10 === 0 ? 'kundli-request' : 'website' });
    const k = db.collection('kundli_requests');
    for (let i = 0; i < 40; i++) await k.insertOne({ name: 'k' + i, createdAt: new Date(now.getTime() - i * 20 * DAY) });
    const r = await loadAnalyticsWindow(db, { days: 730, now });
    check(r.bookings.length === MAX_DOCS && r.window.truncated === true, `12,000 bookings over 2 years -> only ${r.bookings.length} loaded (cap ${MAX_DOCS}) and the response says it was truncated`);
    const r90 = await loadAnalyticsWindow(db, { days: 90, now });
    check(r90.bookings.length > 0 && r90.bookings.length < 2000 && r90.window.truncated === false && r90.bookings.every(x => x.createdAt >= new Date(now.getTime() - 90 * DAY)), `the default 90-day window loads ${r90.bookings.length} bookings, all inside the window`);
    check(r.bookings.every((x, i) => i === 0 || r.bookings[i - 1].createdAt >= x.createdAt), 'newest first');
    check(r.counts.bookingsTotal === 12000, 'the lifetime total is an exact count (12,000), not the array length');
    check(r90.kundliDocs.length === 5 && r.counts.kundliTotal === 40, 'Kundli requests: 5 in the 90-day window, 40 lifetime');
    check(r.counts.kundliBookingsTotal === 1200, 'lifetime Kundli-type bookings counted exactly (1,200)');
    const small = await loadAnalyticsWindow(db, { days: 7, now, maxDocs: 100000 });
    check(small.window.truncated === false && small.bookings.length < 400, 'a short window is far smaller and not truncated');
}

console.log('\n\x1b[1m[3] The endpoint\'s error body leaks nothing\x1b[0m');
{
    delete process.env.MONGODB_URI; process.env.ADMIN_KEY = 'k'; process.env.NODE_ENV = 'production';
    const handler = require('../backend/admin/analytics-summary.js');
    const res = { statusCode: 200, body: undefined, headers: {}, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, end() { return this; }, setHeader(k, v) { this.headers[k] = v; } };
    await handler({ method: 'GET', headers: { 'x-admin-key': 'k' }, query: {} }, res);
    check(res.statusCode === 500 && !('details' in res.body) && !/mongo|URI|ECONN/i.test(JSON.stringify(res.body)), 'a failing database returns a plain 500 with no internal details');
}

console.log(`\n\x1b[1mANALYTICS TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
