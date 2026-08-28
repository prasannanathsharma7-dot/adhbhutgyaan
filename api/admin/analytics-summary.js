// Backend Aggregation Endpoint: api/admin/analytics-summary.js
// Returns comprehensive data analytics across Pooja Bookings, Free Kundli Requests,
// Astrological Concerns, Ritual Demand Distribution, and Lead Velocity.

const { getDb, withCors } = require('../_db');

/**
 * Validates admin credentials against ADMIN_SECRET_KEY or ADMIN_KEY.
 * Supports x-admin-auth header, x-admin-key header, Bearer Authorization, or query param.
 */
function isAuthorized(req) {
    const secretKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY;
    if (!secretKey) return false;

    const authHeader = req.headers['x-admin-auth'] || req.headers['x-admin-key'] || req.headers['authorization'];
    let provided = '';

    if (authHeader) {
        provided = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.query && (req.query.key || req.query.secret || req.query.auth)) {
        provided = (req.query.key || req.query.secret || req.query.auth).toString().trim();
    }

    return provided === secretKey;
}

// Concern keyword dictionaries for semantic categorization
const CONCERN_CATEGORIES = {
    career: {
        id: 'career',
        label: 'Career & Business',
        labelHi: 'करियर एवं व्यापार',
        keywords: ['career', 'job', 'business', 'naukri', 'vyapar', 'promotion', 'finance', 'dhan', 'money', 'paisa', 'loss', 'work', 'office'],
    },
    marriage: {
        id: 'marriage',
        label: 'Marriage Delay & Matching',
        labelHi: 'विवाह विलंब एवं कुंडली मिलान',
        keywords: ['marriage', 'shaadi', 'vivah', 'delay', 'match', 'gun milan', 'kundli milan', 'divorce', 'relationship', 'shadi', 'rishta', 'manglik'],
    },
    pitra_dosh: {
        id: 'pitra_dosh',
        label: 'Pitra Dosh & Ancestral Peace',
        labelHi: 'पितृ दोष एवं शांति',
        keywords: ['pitra', 'pitru', 'purvaj', 'ancestor', 'shradh', 'shradha', 'tripindi', 'narayan bali', 'gaya', 'kashi shradh', 'tarpan'],
    },
    shani_sade_sati: {
        id: 'shani_sade_sati',
        label: 'Shani Sade Sati & Planetary Doshas',
        labelHi: 'शनि साढ़े साती एवं ग्रह दोष',
        keywords: ['shani', 'sade sati', 'sadesati', 'dhaiya', 'rahu', 'ketu', 'kalsarp', 'kaal sarp', 'graha', 'grah dosh', 'mangal dosh', 'navgraha'],
    },
    health_protection: {
        id: 'health_protection',
        label: 'Health & Spiritual Protection',
        labelHi: 'स्वास्थ्य एवं सुरक्षा',
        keywords: ['health', 'bimari', 'illness', 'disease', 'roga', 'tantra', 'nazar', 'black magic', 'bhoot', 'protection', 'shatru', 'enemy', 'court'],
    },
};

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use GET.' });
        return;
    }

    if (!isAuthorized(req)) {
        res.status(401).json({ ok: false, error: 'Unauthorized: Invalid or missing x-admin-auth credentials.' });
        return;
    }

    try {
        const db = await getDb();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Fetch bookings and collections in parallel
        const bookingsCol = db.collection('bookings');
        const [bookings, kundliDocs, contactCount, reviewCount, subscriberCount] = await Promise.all([
            bookingsCol.find({}).sort({ createdAt: -1 }).toArray().catch(() => []),
            db.collection('kundli_requests').find({}).sort({ createdAt: -1 }).toArray().catch(() => []),
            db.collection('contacts').countDocuments().catch(() => 0),
            db.collection('reviews').countDocuments().catch(() => 0),
            db.collection('subscribers').countDocuments().catch(() => 0),
        ]);

        // Merge records for comprehensive touchpoint analysis
        const allKundliRequests = [
            ...kundliDocs.map(d => ({ ...d, _type: 'kundli_collection' })),
            ...bookings.filter(b => b.source === 'kundli-request' || b.serviceId === 'astrology-consultation')
                .map(b => ({ ...b, _type: 'booking_kundli' })),
        ];

        // Deduplicate kundli requests
        const uniqueKundliMap = new Map();
        allKundliRequests.forEach(k => {
            const idStr = k._id ? k._id.toString() : `${k.phone}_${k.createdAt}`;
            if (!uniqueKundliMap.has(idStr)) {
                uniqueKundliMap.set(idStr, k);
            }
        });
        const deduplicatedKundlis = Array.from(uniqueKundliMap.values());

        // 1. Lead Velocity (Lifetime vs 30-Day vs 7-Day)
        const totalLifetimeBookings = bookings.length;
        const totalLifetimeKundlis = deduplicatedKundlis.length;
        const totalLifetimeLeads = totalLifetimeBookings + (kundliDocs.length > 0 ? kundliDocs.length : 0);

        const bookings30d = bookings.filter(b => b.createdAt && new Date(b.createdAt) >= thirtyDaysAgo);
        const kundlis30d = deduplicatedKundlis.filter(k => k.createdAt && new Date(k.createdAt) >= thirtyDaysAgo);
        const activeLeads30d = bookings30d.length + (kundliDocs.length > 0 ? kundlis30d.length : 0);

        const bookings7d = bookings.filter(b => b.createdAt && new Date(b.createdAt) >= sevenDaysAgo);
        const activeLeads7d = bookings7d.length;

        // 2. Pending vs Completed Kundli Reviews
        let pendingKundliReviews = 0;
        let completedKundliReviews = 0;
        let inProgressKundliReviews = 0;

        deduplicatedKundlis.forEach(k => {
            const st = (k.status || 'new').toLowerCase();
            if (st === 'completed' || st === 'reviewed' || st === 'resolved') {
                completedKundliReviews++;
            } else if (st === 'contacted' || st === 'in_progress' || st === 'confirmed') {
                inProgressKundliReviews++;
            } else {
                pendingKundliReviews++;
            }
        });

        const totalKundliCount = deduplicatedKundlis.length;
        const kundliReviewCompletionRate = totalKundliCount > 0
            ? Number(((completedKundliReviews / totalKundliCount) * 100).toFixed(1))
            : 0;

        // 3. High-Demand Ritual Volume & Percentage Share
        const ritualCounts = {
            rudrabhishek: { id: 'rudrabhishek', name: 'Rudrabhishek Pooja', nameHi: 'रुद्राभिषेक पूजा', count: 0, color: '#FF7A00' },
            kalsarp: { id: 'kalsarp', name: 'Kalsarp Dosh Nivaran', nameHi: 'कालसर्प दोष निवारण', count: 0, color: '#C49A2C' },
            tripindi: { id: 'tripindi', name: 'Tripindi Shradh / Pitra Dosh', nameHi: 'त्रिपिंडी श्राद्ध / पितृ दोष', count: 0, color: '#8B0000' },
            astrology: { id: 'astrology', name: 'Astrology & Kundli Consultation', nameHi: 'ज्योतिष एवं कुंडली परामर्श', count: 0, color: '#1C2150' },
            mahamrityunjaya: { id: 'mahamrityunjaya', name: 'Mahamrityunjaya Jaap', nameHi: 'महामृत्युंजय जाप', count: 0, color: '#D4A843' },
            baglamukhi: { id: 'baglamukhi', name: 'Maa Baglamukhi Anushthan', nameHi: 'माँ बगलामुखी अनुष्ठान', count: 0, color: '#E65100' },
            other_vedic: { id: 'other_vedic', name: 'Other Vedic Poojas', nameHi: 'अन्य वैदिक पूजाएँ', count: 0, color: '#6E7396' },
        };

        bookings.forEach(b => {
            const sid = (b.serviceId || '').toLowerCase();
            const sname = (b.serviceName || '').toLowerCase();
            const src = (b.source || '').toLowerCase();

            if (sid.includes('rudrabhishek') || sname.includes('rudrabhishek') || sname.includes('रुद्राभिषेक')) {
                ritualCounts.rudrabhishek.count++;
            } else if (sid.includes('kalsarp') || sname.includes('kalsarp') || sname.includes('कालसर्प')) {
                ritualCounts.kalsarp.count++;
            } else if (sid.includes('tripindi') || sid.includes('pitra') || sname.includes('tripindi') || sname.includes('श्राद्ध') || sname.includes('पितृ')) {
                ritualCounts.tripindi.count++;
            } else if (sid.includes('astrology') || src === 'kundli-request' || sname.includes('ज्योतिष') || sname.includes('कुंडली')) {
                ritualCounts.astrology.count++;
            } else if (sid.includes('mahamrityunjaya') || sname.includes('mahamrityunjaya') || sname.includes('महामृत्युंजय')) {
                ritualCounts.mahamrityunjaya.count++;
            } else if (sid.includes('baglamukhi') || sname.includes('baglamukhi') || sname.includes('बगलामुखी')) {
                ritualCounts.baglamukhi.count++;
            } else {
                ritualCounts.other_vedic.count++;
            }
        });

        const totalRitualsClassified = Object.values(ritualCounts).reduce((acc, curr) => acc + curr.count, 0) || 1;
        const ritualVolumeShare = Object.values(ritualCounts)
            .map(r => ({
                ...r,
                sharePercent: Number(((r.count / totalRitualsClassified) * 100).toFixed(1)),
            }))
            .sort((a, b) => b.count - a.count);

        // 4. Astrological Concern Matrix
        const concernStats = {
            career: { ...CONCERN_CATEGORIES.career, count: 0 },
            marriage: { ...CONCERN_CATEGORIES.marriage, count: 0 },
            pitra_dosh: { ...CONCERN_CATEGORIES.pitra_dosh, count: 0 },
            shani_sade_sati: { ...CONCERN_CATEGORIES.shani_sade_sati, count: 0 },
            health_protection: { ...CONCERN_CATEGORIES.health_protection, count: 0 },
        };

        const corpus = [
            ...bookings.map(b => `${b.notes || ''} ${b.serviceName || ''} ${b.packageName || ''}`.toLowerCase()),
            ...deduplicatedKundlis.map(k => `${k.question || ''} ${k.notes || ''}`.toLowerCase()),
        ];

        let totalConcernHits = 0;
        corpus.forEach(text => {
            if (!text.trim()) return;
            Object.keys(CONCERN_CATEGORIES).forEach(key => {
                const keywords = CONCERN_CATEGORIES[key].keywords;
                const matched = keywords.some(kw => text.includes(kw));
                if (matched) {
                    concernStats[key].count++;
                    totalConcernHits++;
                }
            });
        });

        const concernMatrix = Object.values(concernStats).map(c => {
            const share = totalConcernHits > 0 ? Number(((c.count / totalConcernHits) * 100).toFixed(1)) : 0;
            return {
                id: c.id,
                label: c.label,
                labelHi: c.labelHi,
                count: c.count,
                sharePercent: share,
            };
        }).sort((a, b) => b.count - a.count);

        // 5. Touchpoint Source Distribution
        const touchpointCounts = {
            website_booking: 0,
            free_kundli: 0,
            whatsapp_bot: 0,
            contact_form: contactCount,
            direct_consultation: 0,
        };

        bookings.forEach(b => {
            const src = (b.source || 'website').toLowerCase();
            if (src === 'kundli-request') {
                touchpointCounts.free_kundli++;
            } else if (src === 'whatsapp' || src === 'whatsapp-bot') {
                touchpointCounts.whatsapp_bot++;
            } else if (src === 'chatbot') {
                touchpointCounts.website_booking++;
            } else if (b.mode === 'offline' || b.mode === 'in-person') {
                touchpointCounts.direct_consultation++;
            } else {
                touchpointCounts.website_booking++;
            }
        });

        // 6. Booking Status Funnel
        const statusBreakdown = {
            new: bookings.filter(b => (b.status || 'new') === 'new').length,
            contacted: bookings.filter(b => b.status === 'contacted').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
        };

        // 7. Recent Devotee Activities (latest 10)
        const recentActivities = bookings.slice(0, 10).map(b => ({
            id: b._id,
            name: b.name ? `${b.name.slice(0, 3)}***` : 'Devotee',
            serviceName: b.serviceName || b.packageName || 'Vedic Pooja',
            status: b.status || 'new',
            mode: b.mode || 'online',
            source: b.source || 'website',
            createdAt: b.createdAt,
            hasNotes: Boolean(b.notes),
            hasMediaProof: Boolean(b.sankalpMediaUrl),
        }));

        // Set cache headers for serverless performance
        res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

        res.status(200).json({
            ok: true,
            generatedAt: now.toISOString(),
            kpis: {
                activeLeads30d,
                activeLeads7d,
                totalLifetimeLeads,
                totalLifetimeBookings,
                totalLifetimeKundlis,
                pendingKundliReviews,
                completedKundliReviews,
                inProgressKundliReviews,
                kundliReviewCompletionRate,
                totalReviewsLogged: reviewCount,
                totalNewsletterSubscribers: subscriberCount,
            },
            ritualDemand: {
                totalRituals: totalLifetimeBookings,
                breakdown: ritualVolumeShare,
            },
            concernMatrix,
            touchpoints: touchpointCounts,
            statusFunnel: statusBreakdown,
            recentActivities,
        });
    } catch (err) {
        console.error('analytics-summary API error:', err);
        res.status(500).json({
            ok: false,
            error: 'Failed to aggregate analytics data.',
            details: err.message || String(err),
        });
    }
};