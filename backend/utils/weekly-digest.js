// Weekly digest for the owner: what happened in the last 7 days and what needs attention - in plain Hinglish, short enough
// to read on a phone. Contains NO customer names, phone numbers or e-mails: only counts and booking references (the admin
// panel has the details), so the message is safe to sit in a WhatsApp chat or inbox.
const DAY = 86400000;

const pct = (a, b) => (b === 0 ? (a === 0 ? '0%' : 'naya') : `${a >= b ? '+' : '-'}${Math.round(Math.abs(a - b) / b * 100)}%`);
const hoursText = (h) => (h === null ? '-' : h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h * 10) / 10} ghante` : `${Math.round(h / 24 * 10) / 10} din`);

/** Pure: build the digest numbers from the bookings of the last 14 days and a few counts. */
function computeDigest({ bookings, reviewsLast7, pendingJobs, deadJobs, now = new Date() }) {
    const t7 = now.getTime() - 7 * DAY, t14 = now.getTime() - 14 * DAY;
    const created = (b) => new Date(b.createdAt).getTime();
    const cur = bookings.filter(b => created(b) >= t7);
    const prev = bookings.filter(b => created(b) >= t14 && created(b) < t7);

    const bySource = {}; for (const b of cur) { const k = b.source || 'website'; bySource[k] = (bySource[k] || 0) + 1; }
    const byService = {}; for (const b of cur) { const k = b.serviceName || 'Service nahi chuni'; byService[k] = (byService[k] || 0) + 1; }
    const funnel = { new: 0, contacted: 0, confirmed: 0, completed: 0, cancelled: 0 }; for (const b of cur) funnel[b.status] = (funnel[b.status] || 0) + 1;

    // time to first contact, for bookings that have been contacted (needs statusHistory)
    const waits = [];
    for (const b of cur) {
        const h = (b.statusHistory || []).find(x => x.status === 'contacted' || x.status === 'confirmed');
        if (h) waits.push((new Date(h.at).getTime() - created(b)) / 3600000);
    }
    const avgContactHours = waits.length ? waits.reduce((a, c) => a + c, 0) / waits.length : null;

    // still waiting for a first reply after 24h (any age in the 14-day fetch)
    const waiting = bookings.filter(b => b.status === 'new' && now.getTime() - created(b) > DAY)
        .sort((a, b) => created(a) - created(b))
        .map(b => ({ reference: b.reference, serviceName: b.serviceName || '-', hours: Math.round((now.getTime() - created(b)) / 3600000) }));

    return {
        generatedAt: now.toISOString(),
        enquiries: { last7: cur.length, prev7: prev.length, change: pct(cur.length, prev.length) },
        bySource, byService: Object.entries(byService).sort((a, b) => b[1] - a[1]).slice(0, 3),
        funnel, avgContactHours, avgContactText: hoursText(avgContactHours),
        waiting: { count: waiting.length, oldest: waiting.slice(0, 5) },
        reviewsLast7, pendingJobs, deadJobs,
    };
}

function formatDigest(d) {
    const src = Object.entries(d.bySource).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || '-';
    const top = d.byService.map(([k, v]) => `${k} (${v})`).join(', ') || '-';
    const lines = [
        'Hafte ka saar - Adhbhut Gyaan',
        '',
        `Naye enquiry (7 din): ${d.enquiries.last7}  (pichhle hafte ${d.enquiries.prev7}, ${d.enquiries.change})`,
        `Kahan se: ${src}`,
        `Sabse zyada maangi: ${top}`,
        `Ab tak: naya ${d.funnel.new} - sampark hua ${d.funnel.contacted} - tay ${d.funnel.confirmed} - poora ${d.funnel.completed} - radd ${d.funnel.cancelled}`,
        `Pehla jawab dene mein ausat samay: ${d.avgContactText}`,
        `Nayi reviews: ${d.reviewsLast7}`,
    ];
    if (d.waiting.count > 0) {
        lines.push('', `DHYAN: ${d.waiting.count} enquiry ko 24 ghante se zyada se jawab nahi mila:`);
        for (const w of d.waiting.oldest) lines.push(`- ${w.reference} - ${w.serviceName} - ${w.hours} ghante`);
        lines.push('(naam / phone admin panel mein dekhein)');
    } else {
        lines.push('', 'Koi enquiry 24 ghante se zyada intezaar mein nahi - shabaash.');
    }
    if (d.deadJobs > 0 || d.pendingJobs > 0) lines.push('', `Suchna bhejne mein dikkat: ${d.pendingJobs} dobara koshish mein, ${d.deadJobs} fail - email / WhatsApp keys dekhein.`);
    return lines.join('\n');
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const digestHtml = (d) => `<pre style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(formatDigest(d))}</pre>`;

/** Reads the data (bounded: 14 days, capped) and builds the digest. */
async function loadDigest(db, now = new Date()) {
    const since = new Date(now.getTime() - 14 * DAY);
    const projection = { reference: 1, serviceName: 1, source: 1, status: 1, statusHistory: 1, createdAt: 1 };
    const [bookings, reviewsLast7, pendingJobs, deadJobs] = await Promise.all([
        db.collection('bookings').find({ createdAt: { $gte: since } }, { projection }).sort({ createdAt: -1 }).limit(5000).toArray().catch(() => []),
        db.collection('reviews').countDocuments({ createdAt: { $gte: new Date(now.getTime() - 7 * DAY) } }).catch(() => 0),
        db.collection('notification_jobs').countDocuments({ status: 'pending' }).catch(() => 0),
        db.collection('notification_jobs').countDocuments({ status: 'dead' }).catch(() => 0),
    ]);
    return computeDigest({ bookings, reviewsLast7, pendingJobs, deadJobs, now });
}

module.exports = { computeDigest, formatDigest, digestHtml, loadDigest };
