// Idempotent, crash-safe processing of inbound webhook messages (Meta WhatsApp). One record per message id.
//
//   processing  - a worker holds a lease (leaseUntil). Another delivery of the same message while the lease is live
//                 gets 'in-progress' (the handler answers 503 so Meta retries LATER - never 200, or a worker that dies
//                 mid-way would lose the message for good).
//   sending     - the reply is about to be sent: the point of no return. WhatsApp has no idempotency key, so from here a
//                 retry must NOT process the message again (a duplicate reply is worse than a rare missed one).
//   replied     - finished. Any further delivery is acknowledged and ignored.
//   released    - processing failed BEFORE anything was sent; the next delivery may take it over.
// A 'processing' record whose lease has expired (the worker crashed) is taken over by the next delivery.
//
// Works with any collection exposing insertOne / findOne / updateOne (the MongoDB driver, or the in-memory fake in tests).
const LEASE_MS = 2 * 60 * 1000;

/** @returns {'process'|'done'|'in-progress'} */
async function claimInbound(col, messageId, now = new Date(), leaseMs = LEASE_MS) {
    const lease = () => new Date(now.getTime() + leaseMs);
    try {
        await col.insertOne({ messageId, status: 'processing', leaseUntil: lease(), attempts: 1, at: now });
        return 'process';
    } catch (e) {
        if (!e || e.code !== 11000) throw e; // anything but "duplicate key" is a real error
    }
    const existing = await col.findOne({ messageId });
    if (!existing) return 'in-progress'; // vanished between the two calls: let Meta retry shortly
    if (existing.status === 'replied' || existing.status === 'sending') return 'done';
    if (existing.status === 'processing' && existing.leaseUntil && existing.leaseUntil > now) return 'in-progress';
    // stale lease (worker died) or released: take over atomically - only one concurrent delivery can win
    const r = await col.updateOne(
        { messageId, $or: [{ status: 'processing', leaseUntil: { $lte: now } }, { status: 'released' }] },
        { $set: { status: 'processing', leaseUntil: lease(), takenOverAt: now }, $inc: { attempts: 1 } },
    );
    return r.modifiedCount === 1 ? 'process' : 'in-progress';
}

const markSending = (col, messageId) => col.updateOne({ messageId, status: 'processing' }, { $set: { status: 'sending', sendingAt: new Date() } });
const markReplied = (col, messageId) => col.updateOne({ messageId }, { $set: { status: 'replied', repliedAt: new Date() } });
const releaseInbound = (col, messageId) => col.updateOne({ messageId, status: { $in: ['processing', 'sending'] } }, { $set: { status: 'released', releasedAt: new Date() } });

module.exports = { claimInbound, markSending, markReplied, releaseInbound, LEASE_MS };
