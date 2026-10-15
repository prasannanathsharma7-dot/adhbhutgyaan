// Weekly digest for the owner: correct numbers, no personal data, bounded reads. In-memory database, no network.
import { createRequire } from 'node:module';
import { makeDb } from './lib/fake-db.mjs';
const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const { computeDigest, formatDigest, digestHtml, loadDigest } = require('../backend/utils/weekly-digest.js');
const H = 3600000, DAY = 24 * H;
const now = new Date('2026-10-19T04:00:00Z'); // Monday 09:30 IST
const ago = (ms) => new Date(now.getTime() - ms);
const mk = (i, o) => ({ reference: `AG-2026-00000${i}`, name: `Secret Person ${i}`, phone: `98765432${i}0`, email: `p${i}@example.com`, serviceName: 'Rudrabhishek', source: 'website', status: 'new', createdAt: ago(2 * DAY), statusHistory: [], ...o });

const bookings = [
    mk(1, { createdAt: ago(1 * DAY), status: 'contacted', statusHistory: [{ status: 'new', at: ago(1 * DAY) }, { status: 'contacted', at: ago(1 * DAY - 2 * H) }] }),
    mk(2, { createdAt: ago(3 * DAY), status: 'confirmed', source: 'chatbot', serviceName: 'Kalsarp Dosh', statusHistory: [{ status: 'contacted', at: ago(3 * DAY - 6 * H) }] }),
    mk(3, { createdAt: ago(5 * DAY), status: 'new', source: 'whatsapp' }),
    mk(4, { createdAt: ago(6 * DAY), status: 'completed', serviceName: 'Tripindi Shradh', statusHistory: [{ status: 'contacted', at: ago(6 * DAY - 1 * H) }] }),
    mk(5, { createdAt: ago(8 * DAY), status: 'new' }),                  // previous week, still unanswered
    mk(6, { createdAt: ago(10 * DAY), status: 'cancelled' }),           // previous week
    mk(7, { createdAt: ago(12 * DAY), status: 'completed' }),           // previous week
    mk(8, { createdAt: ago(2 * H), status: 'new' }),                    // brand new, NOT yet "waiting" (under 24h)
];
const d = computeDigest({ bookings, reviewsLast7: 2, pendingJobs: 1, deadJobs: 0, now });

console.log('\n\x1b[1m[1] The numbers\x1b[0m');
check(d.enquiries.last7 === 5 && d.enquiries.prev7 === 3 && d.enquiries.change === '+67%', `7-day enquiries 5 vs 3 the week before (${d.enquiries.change})`);
check(d.bySource.website === 3 && d.bySource.chatbot === 1 && d.bySource.whatsapp === 1, 'enquiries by source');
check(d.byService[0][0] === 'Rudrabhishek' && d.byService[0][1] === 3 && d.byService.length === 3, 'top services, most asked first');
check(d.funnel.new === 2 && d.funnel.contacted === 1 && d.funnel.confirmed === 1 && d.funnel.completed === 1, 'status funnel of this week\'s enquiries');
check(Math.abs(d.avgContactHours - ((2 + 6 + 1) / 3)) < 0.01, `average time to first contact = 3 hours (${d.avgContactText})`);
check(d.waiting.count === 2 && d.waiting.oldest[0].reference === 'AG-2026-000005' && d.waiting.oldest[1].reference === 'AG-2026-000003', 'enquiries unanswered for 24h+: the oldest first; the 2-hour-old one is not counted');
check(computeDigest({ bookings: [], reviewsLast7: 0, pendingJobs: 0, deadJobs: 0, now }).enquiries.change === '0%', 'a quiet week does not divide by zero');
check(computeDigest({ bookings: [mk(1)], reviewsLast7: 0, pendingJobs: 0, deadJobs: 0, now }).enquiries.change === 'naya', 'first activity after an empty week is "naya", not infinity');

console.log('\n\x1b[1m[2] The message\x1b[0m');
{
    const text = formatDigest(d);
    check(/Naye enquiry \(7 din\): 5/.test(text) && /pichhle hafte 3, \+67%/.test(text), 'headline numbers in Hinglish');
    check(/DHYAN: 2 enquiry/.test(text) && /AG-2026-000005 - Rudrabhishek - 1[89]\d ghante|AG-2026-000005/.test(text), 'unanswered enquiries are called out with their reference');
    check(/Suchna bhejne mein dikkat: 1 dobara koshish/.test(text), 'a notification problem is surfaced');
    check(!/Secret Person|p\d@example|98765432\d0/.test(text) && !/Secret Person|example\.com/.test(digestHtml(d)), 'no customer name, phone or e-mail anywhere in the text or the HTML');
    const clean = formatDigest(computeDigest({ bookings: [mk(1, { createdAt: ago(1 * DAY), status: 'contacted', statusHistory: [{ status: 'contacted', at: ago(1 * DAY - H) }] })], reviewsLast7: 0, pendingJobs: 0, deadJobs: 0, now }));
    check(/shabaash/.test(clean) && !/DHYAN/.test(clean), 'when nothing waits, the message says so');
    check(text.split('\n').length < 20 && text.length < 900, 'short enough for a phone screen');
    check(digestHtml({ ...d, byService: [['<script>x</script>', 1]] }).includes('&lt;script&gt;'), 'HTML is escaped');
}

console.log('\n\x1b[1m[3] Reads are bounded to 14 days\x1b[0m');
{
    const db = makeDb(); const col = db.collection('bookings');
    for (const b of bookings) await col.insertOne(b);
    await col.insertOne(mk(9, { createdAt: ago(40 * DAY), status: 'new' })); // old and unanswered: must not appear
    await db.collection('reviews').insertOne({ createdAt: ago(1 * DAY) }); await db.collection('reviews').insertOne({ createdAt: ago(20 * DAY) });
    await db.collection('notification_jobs').insertOne({ status: 'dead' });
    const r = await loadDigest(db, now);
    check(r.enquiries.last7 === 5 && r.waiting.count === 2 && !r.waiting.oldest.some(w => w.reference === 'AG-2026-000009'), 'a 40-day-old booking is not read at all');
    check(r.reviewsLast7 === 1 && r.deadJobs === 1, 'reviews in the last 7 days and dead notification jobs are counted');
}

console.log(`\n\x1b[1mDIGEST TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
