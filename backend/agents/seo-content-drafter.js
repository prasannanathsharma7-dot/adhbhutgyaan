// AGENT 5: Vedic SEO & Content Generator
// File: api/agents/seo-content-drafter.js
// Generates schema-ready, SEO-optimized Vedic Markdown articles, FAQs, and JSON-LD graphs.

const { getDb, withCors, capStr, escapeHtml } = require('../_db');
const { requireAgentAuth } = require('../utils/agent-auth');

const SITE_URL = 'https://www.adhbhutgyaan.com';

const TOPIC_PRESETS = {
    'rudrabhishek': {
        title: 'Kashi Rudrabhishek Vidhi, Benefits & Auspicious Muhurat | काशी रुद्राभिषेक विधि | Adhbhut Gyaan',
        metaDescription: 'Complete Vedic guide to Rudrabhishek in Kashi by Pt. Umang Nath Sharma. Discover step-by-step puja vidhi, Namakam Chamakam mantra benefits, and live online sankalp.',
        slug: 'kashi-rudrabhishek-vidhi-benefits',
        primaryKeyword: 'Kashi Rudrabhishek Vidhi',
        deity: 'Lord Shiva / Mahadev',
        serviceId: 'rudrabhishek',
    },
    'kalsarp': {
        title: 'Kalsarp Dosh Nivaran in Varanasi — Types, Symptoms & Upay | कालसर्प दोष निवारण',
        metaDescription: 'Comprehensive guide to 12 types of Kalsarp Dosh and authentic Sarpa Shanti on Kashi Ghats. Astrological remedies by Dr. Umang Nath Sharma.',
        slug: 'kalsarp-dosh-nivaran-varanasi-upay',
        primaryKeyword: 'Kalsarp Dosh Nivaran Varanasi',
        deity: 'Lord Shiva & Naga Devata',
        serviceId: 'kalsarp-dosh',
    },
    'tripindi': {
        title: 'Tripindi Shradh in Kashi (Varanasi) — Pitra Dosh Mukti Vidhi | त्रिपिंडी श्राद्ध',
        metaDescription: 'Learn why Tripindi Shradh at Pishach Mochan Kund in Varanasi liberates three generations of ancestors. Ritual steps, samagri, and online sankalp.',
        slug: 'tripindi-shradh-kashi-pitra-dosh-vidhi',
        primaryKeyword: 'Tripindi Shradh in Kashi',
        deity: 'Brahma, Vishnu, Mahesh (Pitras)',
        serviceId: 'tripindi-shradh',
    },
    'shani_sade_sati': {
        title: 'Shani Sade Sati & Dhaiya Upay in Varanasi — Astrological Remedies | शनि साढ़े साती उपाय',
        metaDescription: 'Suffering from Shani Sade Sati or Kantaka Dhaiya? Proven Vedic remedies, Mahamrityunjaya Jaap, and Shani Shanti rituals conducted in Varanasi.',
        slug: 'shani-sade-sati-upay-varanasi-remedies',
        primaryKeyword: 'Shani Sade Sati Upay Varanasi',
        deity: 'Shani Dev & Kaal Bhairav',
        serviceId: 'astrology-consultation',
    },
};

/**
 * Crafts comprehensive Vedic Markdown article with FAQs and JSON-LD schema.
 */
function draftVedicArticle(topicInput) {
    const rawKey = (topicInput || 'rudrabhishek').toLowerCase();
    let presetKey = 'rudrabhishek';

    if (rawKey.includes('kalsarp') || rawKey.includes('sarpa')) presetKey = 'kalsarp';
    else if (rawKey.includes('shradh') || rawKey.includes('pitra') || rawKey.includes('tripindi')) presetKey = 'tripindi';
    else if (rawKey.includes('shani') || rawKey.includes('sade sati')) presetKey = 'shani_sade_sati';

    const preset = TOPIC_PRESETS[presetKey] || TOPIC_PRESETS['rudrabhishek'];
    const title = preset.title;
    const metaDescription = preset.metaDescription;
    const slug = preset.slug;
    const dateStr = new Date().toISOString().slice(0, 10);

    const faqs = [
        {
            q: `What is the significance of performing ${preset.primaryKeyword} in Kashi (Varanasi)?`,
            a: 'Kashi is the timeless city of Lord Shiva (Avimukta Kshetra). According to the Skanda Purana, every Vedic ritual conducted on the banks of Maa Ganga multiplies spiritual fruits (Phala) manifold compared to other geographical locations.',
        },
        {
            q: 'Can devotees participate in the pooja online if unable to travel to Varanasi?',
            a: 'Yes, Adhbhut Gyaan organizes complete live video Sankalp. Devotees participate virtually via live stream while Vedic priests chant their specific Name and Gotra.',
        },
        {
            q: 'What details and items are required for the Sankalp?',
            a: 'You only need to provide your Full Name, Father/Husband Name, Gotra, and Date of Birth. All pure Vedic samagri is procured and prepared on-site by our team in Kashi.',
        },
        {
            q: 'How do I receive proof and blessings after completion?',
            a: 'A high-definition personalized video recording of your Sankalp and ritual along with consecrated Prasad is dispatched to your WhatsApp and email.',
        },
    ];

    const markdownContent = `---
title: "${title}"
description: "${metaDescription}"
slug: "${slug}"
date: "${dateStr}"
author: "Dr. Umang Nath Sharma"
publisher: "Adhbhut Gyaan"
category: "Vedic Rituals & Astrology"
---

# ${title}

## 1. Introduction & Scriptural Significance
In Sanatana Dharma, the spiritual energy of **Kashi (Varanasi)** stands unparalleled. As described in the *Shiva Purana* and *Kashi Khanda*, any Vedic pooja solemnized within the sacred Panchakroshi boundary of Varanasi directly invokes the benevolence of ${preset.deity}.

> *"वाराणस्यां परं तीर्थं न भूतं न भविष्यति।"*  
> *(There is no sacred teertha equal to Varanasi in the past or the future.)*

---

## 2. Step-by-Step Vedic Pooja Vidhi
Our hereditary Vedic priests from the 400-year-old Sharma tradition adhere strictly to classical Shrauta and Smarta rituals:

1. **Ganga Pavitreekaran & Aachaman:** Cleansing mind and body with sacred Gangajal.
2. **Pradhan Sankalp:** Invoking the devotee's specific *Naam (Name)*, *Gotra*, *Nakshatra*, and *Desha-Kaala*.
3. **Panchang Pujan & Gauri-Ganesh Sthapana:** Seeking obstacle-free accomplishment of the prayer.
4. **Mukhya Havan & Abhishekam:** Performing ceremonial oblations using milk, honey, ghee, sacred herbs, and belpatra.
5. **Mantra Japa & Shanti Path:** Chanting Vedic suktams to pacify planetary afflictions.
6. **Aarti & Pushpanjali:** Concluding with sacred camphor aarti on the Ganga Ghats.

---

## 3. Auspicious Timings & Recommended Muhurat
To maximize the positive vibrations, this ritual is best solemnized during:
- **Tithi:** Shukla Paksha Trayodashi, Panchami, or Purnima/Amavasya.
- **Days:** Mondays, Pradosh Vrats, or during auspicious planetary transits.
- **Time:** *Brahma Muhurat* (04:15 AM - 05:15 AM) or *Abhijit Muhurat* (11:45 AM - 12:35 PM).

---

## 4. Frequently Asked Questions (FAQ)

${faqs.map((f, i) => `### Q${i + 1}: ${f.q}\n**Answer:** ${f.a}\n`).join('\n')}

---

## 5. Book Your Personalized Sankalp in Kashi
Experience the divine bliss of authentic Vedic rituals from anywhere in the world.

- 📿 **Direct Online Booking:** [Book on Adhbhut Gyaan](${SITE_URL}/booking)
- 📜 **Free Janam Kundli Consultation:** [Check Free Kundli](${SITE_URL}/free-kundli)
- 💬 **WhatsApp Vedic Helpline:** [+91 98182 27189](https://wa.me/919818227189)
`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                headline: title,
                description: metaDescription,
                datePublished: dateStr,
                author: { '@type': 'Person', name: 'Dr. Umang Nath Sharma', url: `${SITE_URL}/about` },
                publisher: { '@type': 'Organization', name: 'Adhbhut Gyaan', url: `${SITE_URL}/` },
                mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
            },
            {
                '@type': 'FAQPage',
                mainEntity: faqs.map(f => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
            },
        ],
    };

    const wordCount = markdownContent.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    return {
        title,
        metaDescription,
        slug,
        primaryKeyword: preset.primaryKeyword,
        markdown: markdownContent,
        jsonLd,
        faqs,
        wordCount,
        readingTime: `${readingTimeMinutes} min read`,
        generatedAt: new Date().toISOString(),
    };
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use POST or GET.' });
        return;
    }

    if (!requireAgentAuth(req, res)) {
        return;
    }

    try {
        const topic = req.body?.topic || req.query?.topic || 'rudrabhishek';
        const saveToDb = req.body?.saveToDb !== false;

        const draft = draftVedicArticle(topic);

        const db = await getDb();
        let insertedId = null;

        if (saveToDb) {
            const result = await db.collection('draft_articles').updateOne(
                { slug: draft.slug },
                {
                    $set: {
                        title: draft.title,
                        metaDescription: draft.metaDescription,
                        slug: draft.slug,
                        primaryKeyword: draft.primaryKeyword,
                        markdown: draft.markdown,
                        jsonLd: draft.jsonLd,
                        faqs: draft.faqs,
                        wordCount: draft.wordCount,
                        readingTime: draft.readingTime,
                        status: 'draft',
                        updatedAt: new Date(),
                    },
                },
                { upsert: true }
            );
            insertedId = result.upsertedId || 'updated_existing';
        }

        res.status(200).json({
            ok: true,
            agent: 'AGENT 5: Vedic SEO & Content Generator',
            topic,
            slug: draft.slug,
            title: draft.title,
            wordCount: draft.wordCount,
            readingTime: draft.readingTime,
            article: draft,
            draftId: insertedId,
            status: 'draft_ready_for_review',
        });
    } catch (err) {
        console.error('seo-content-drafter agent error:', err);
        res.status(500).json({
            ok: false,
            error: 'Server error in SEO Content Drafter agent.',
            details: err.message || String(err),
        });
    }
};
