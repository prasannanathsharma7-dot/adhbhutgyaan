// 2-Way Google Sheet Sync Handler: api/admin/sync-from-sheets.js
// Receives webhook updates from Master Google Sheet (Google Drive) via Apps Script
// and synchronizes status, pooja notes, sankalp media URLs, and scheduled dates to MongoDB.

const { ObjectId } = require('mongodb');
const { getDb, withCors, capStr, escapeHtml } = require('../_db');
const { sendMail } = require('../_email');
const { notifyAdmin } = require('../_notify');

function isAuthorized(req) {
    const secretKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || process.env.SHEET_SYNC_SECRET;
    if (!secretKey) return false;

    const authHeader = req.headers['x-admin-auth'] || req.headers['x-admin-key'] || req.headers['authorization'];
    let provided = '';

    if (authHeader) {
        provided = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.query && (req.query.key || req.query.secret || req.query.token)) {
        provided = (req.query.key || req.query.secret || req.query.token).toString().trim();
    } else if (req.body && (req.body.secret || req.body.token || req.body.auth)) {
        provided = (req.body.secret || req.body.token || req.body.auth).toString().trim();
    }

    return provided === secretKey;
}

const VALID_STATUSES = ['new', 'pending', 'contacted', 'confirmed', 'reviewed', 'completed', 'cancelled', 'resolved'];

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Health/status check for webhook verification
    if (req.method === 'GET') {
        if (!isAuthorized(req)) {
            res.status(401).json({ ok: false, error: 'Unauthorized. Provide valid secret token.' });
            return;
        }
        res.status(200).json({
            ok: true,
            service: 'Adhbhut Gyaan Google Sheet 2-Way Sync Handler',
            status: 'active',
            timestamp: new Date().toISOString(),
            instructions: 'Send POST requests with { updates: [...] } or single row update payload.',
        });
        return;
    }

    if (req.method !== 'POST' && req.method !== 'PATCH') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use POST or PATCH.' });
        return;
    }

    if (!isAuthorized(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized: Invalid or missing secret credentials.' });
        return;
    }

    try {
        const body = req.body || {};
        const updates = Array.isArray(body.updates) ? body.updates : [body];

        if (updates.length === 0 || (!body.updates && !body.id && !body.bookingId && !body.phone && !body.email)) {
            res.status(400).json({ ok: false, error: 'Empty update payload or missing record identifiers.' });
            return;
        }

        const db = await getDb();
        const results = [];
        let matchedCount = 0;
        let modifiedCount = 0;
        let errorCount = 0;

        for (const item of updates) {
            const rawId = (item.id || item._id || item.bookingId || item.requestId || '').toString().trim();
            const phone = (item.phone || '').toString().replace(/[^0-9+]/g, '').trim();
            const email = (item.email || '').toString().trim().toLowerCase();
            const targetType = (item.type || item.source || '').toString().toLowerCase();

            const updateDoc = {
                sheetLastSyncedAt: new Date(),
            };

            if (item.status) {
                const normalizedStatus = item.status.toString().trim().toLowerCase();
                if (VALID_STATUSES.includes(normalizedStatus)) {
                    updateDoc.status = normalizedStatus;
                    updateDoc.statusUpdatedAt = new Date();
                }
            }

            if (item.notes !== undefined || item.poojaNotes !== undefined || item.adminNotes !== undefined) {
                const combinedNotes = item.poojaNotes || item.adminNotes || item.notes;
                if (combinedNotes) {
                    updateDoc.adminNotes = capStr(combinedNotes, 3000);
                }
            }

            if (item.mediaUrl || item.sankalpMediaUrl || item.proofUrl) {
                updateDoc.sankalpMediaUrl = capStr(item.mediaUrl || item.sankalpMediaUrl || item.proofUrl, 1000);
            }

            if (item.scheduledDate) {
                const parsedDate = new Date(item.scheduledDate);
                if (!isNaN(parsedDate.getTime())) {
                    updateDoc.scheduledDate = item.scheduledDate.toString().trim();
                    updateDoc.reminderSent = false;
                }
            }

            const queryCandidates = [];
            if (rawId && ObjectId.isValid(rawId)) {
                queryCandidates.push({ _id: new ObjectId(rawId) });
            }
            if (rawId) {
                queryCandidates.push({ bookingId: rawId });
                queryCandidates.push({ requestId: rawId });
            }
            if (phone && phone.length >= 10) {
                queryCandidates.push({ phone: { $regex: phone.slice(-10) } });
            }
            if (email && email.includes('@')) {
                queryCandidates.push({ email: email });
            }

            if (queryCandidates.length === 0) {
                results.push({ item, success: false, reason: 'No valid identifier (_id, phone, email) found.' });
                errorCount++;
                continue;
            }

            const query = { $or: queryCandidates };

            const collectionsToTry = targetType.includes('kundli')
                ? ['kundli_requests', 'bookings']
                : ['bookings', 'kundli_requests'];

            let updatedInCol = null;
            let updatedDoc = null;

            for (const colName of collectionsToTry) {
                const col = db.collection(colName);
                const match = await col.findOne(query);
                if (match) {
                    const resOp = await col.findOneAndUpdate(
                        { _id: match._id },
                        { $set: updateDoc },
                        { returnDocument: 'after' }
                    );
                    updatedDoc = resOp && resOp.value ? resOp.value : resOp;
                    updatedInCol = colName;
                    matchedCount++;
                    modifiedCount++;
                    break;
                }
            }

            if (updatedDoc) {
                results.push({
                    id: updatedDoc._id,
                    collection: updatedInCol,
                    status: updatedDoc.status,
                    success: true,
                });

                if (updateDoc.status === 'completed' && updatedDoc.email && !updatedDoc.reviewEmailSent) {
                    try {
                        await sendMail({
                            to: updatedDoc.email,
                            subject: 'How was your pooja? - Adhbhut Gyaan',
                            html: `
                                <h2>Namaste ${escapeHtml(updatedDoc.name || 'Devotee')} 🙏</h2>
                                <p>Your <b>${escapeHtml(updatedDoc.serviceName || 'Pooja')}</b> has been completed in Kashi.</p>
                                <p>We would be deeply blessed to receive your honest feedback:</p>
                                <p><a href="https://www.adhbhutgyaan.com/leave-a-review" style="display:inline-block;background:#C49A2C;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Leave a Review</a></p>
                                <br/>
                                <p>🙏 Adhbhut Gyaan<br/>Varanasi, Kashi</p>
                            `,
                        });
                        await db.collection(updatedInCol).updateOne(
                            { _id: updatedDoc._id },
                            { $set: { reviewEmailSent: true, reviewEmailSentAt: new Date() } }
                        );
                    } catch (mailErr) {
                        console.error('Failed to send completion email:', mailErr);
                    }
                }
            } else {
                results.push({
                    item,
                    success: false,
                    reason: 'Record not found in MongoDB bookings or kundli_requests.',
                });
                errorCount++;
            }
        }

        res.status(200).json({
            ok: true,
            totalProcessed: updates.length,
            matchedCount,
            modifiedCount,
            errorCount,
            results,
            syncedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('sync-from-sheets error:', err);
        res.status(500).json({
            ok: false,
            error: 'Server error during Google Sheet sync.',
            details: err.message || String(err),
        });
    }
};