// AGENT 2: 24/7 WhatsApp Devotee Concierge
// File: api/agents/whatsapp-concierge.js
// Classifies devotee intent, formulates polite Vedic responses, guides through Kashi rituals,
// and assists with booking appointments and kundli consultations.

const { getDb, withCors, capStr, escapeHtml } = require('../_db');
const { sendWhatsAppText } = require('../_whatsapp');
const { requireAgentAuth } = require('../utils/agent-auth');

const SITE_URL = 'https://www.adhbhutgyaan.com';
const WHATSAPP_DIRECT_NUMBER = '919818227189';

/**
 * Classifies devotee intent based on natural language keywords.
 */
function classifyDevoteeIntent(messageText) {
    const text = (messageText || '').toLowerCase();

    // 1. Pooja Booking Inquiry
    if (
        text.includes('pooja') || text.includes('puja') || text.includes('book') ||
        text.includes('rudrabhishek') || text.includes('kalsarp') || text.includes('shradh') ||
        text.includes('tripindi') || text.includes('mahamrityunjay') || text.includes('baglamukhi') ||
        text.includes('havan') || text.includes('anushthan') || text.includes('package') ||
        text.includes('price') || text.includes('cost') || text.includes('dakshina')
    ) {
        return {
            category: 'POOJA_BOOKING',
            confidence: 0.94,
            serviceHint: text.includes('rudrabhishek') ? 'rudrabhishek' :
                text.includes('kalsarp') ? 'kalsarp-dosh' :
                text.includes('shradh') || text.includes('tripindi') ? 'tripindi-shradh' :
                text.includes('baglamukhi') ? 'mahavidya-paath' :
                text.includes('mahamrityunjay') ? 'mahamrityunjaya' : 'general-pooja',
        };
    }

    // 2. Astrological / Kundli Inquiry
    if (
        text.includes('kundli') || text.includes('kundali') || text.includes('janam patrika') ||
        text.includes('astrology') || text.includes('jyotish') || text.includes('horoscope') ||
        text.includes('milan') || text.includes('matching') || text.includes('shani') ||
        text.includes('sade sati') || text.includes('rahu') || text.includes('ketu') ||
        text.includes('pandit ji') || text.includes('umang nath') || text.includes('consult')
    ) {
        return {
            category: 'ASTROLOGY_CONSULTATION',
            confidence: 0.92,
            serviceHint: 'astrology-consultation',
        };
    }

    // 3. Muhurat & Samagri Question
    if (
        text.includes('muhurat') || text.includes('shubh muhurat') || text.includes('timing') ||
        text.includes('samagri') || text.includes('vidhi') || text.includes('rules') ||
        text.includes('tithi') || text.includes('date') || text.includes('nakshtra') ||
        text.includes('fast') || text.includes('vrat')
    ) {
        return {
            category: 'MUHURAT_SAMAGRI',
            confidence: 0.89,
            serviceHint: 'muhurat-guidance',
        };
    }

    // 4. General Kashi / Travel / Temple Guidance
    return {
        category: 'GENERAL_KASHI_GUIDE',
        confidence: 0.85,
        serviceHint: 'kashi-darshan',
    };
}

/**
 * Builds culturally respectful, polite Vedic responses in Hindi/English.
 */
function composeConciergeResponse(intent, devoteeName, originalMessage) {
    const nameGreeting = devoteeName ? `${devoteeName} Ji` : 'Bhakta Ji';

    switch (intent.category) {
        case 'POOJA_BOOKING': {
            return {
                language: 'hinglish',
                text: `🕉️ Namaste ${nameGreeting} 🙏 Har Har Mahadev!

Adhbhut Gyaan me aapka swagat hai. Kashi (Varanasi) me Maa Ganga ke pavitra tat par hamare 400 varsh purane Sharma parivar ke vidwan Vedic Brahmanon dwara shastrokt pooja evam anushthan sampann karaye jaate hain.

📿 **Pooja Modes Available:**
1. **Online Sankalp (Live Video):** Aap ghar baithe live video link ke madhyam se apne naam-gotra se sankalp le sakte hain.
2. **In-Person in Varanasi:** Kashi me swayam upashthit hokar Dashashwamedh Ghat ya Kashi Vishwanath Dham me pooja karwayen.

📋 **Aapki Booking ke liye zaroori jankari:**
• Devotee Name & Gotra
• Preferred Date / Tithi
• Pooja Type (Rudrabhishek / Kalsarp / Shradh / etc.)

👉 **Direct Online Booking Link:** ${SITE_URL}/booking
💬 **Pandit Ji se seedhe sampark karein:** https://wa.me/${WHATSAPP_DIRECT_NUMBER}

Kripya apna shubh naam aur preferred date batayein, hamari team 24 ghante me aapko sampark karegi.`,
                quickLinks: [
                    { title: 'Book Pooja Online', url: `${SITE_URL}/booking` },
                    { title: 'View All Services', url: `${SITE_URL}/services` },
                ],
            };
        }

        case 'ASTROLOGY_CONSULTATION': {
            return {
                language: 'hinglish',
                text: `🕉️ Namaste ${nameGreeting} 🙏 Jai Shri Ram!

Dr. Umang Nath Sharma (M.A., Ph.D. BHU, Jyotishacharya) vyaktigat roop se Janam Kundli ka shastrokt vishleshan karte hain — bina kisi automated software ke.

📜 **Free Kundli Request:**
Aap apni birth details (Date, Time, Place of Birth) hamari website par darj karke muft preliminary Kundli vishleshan prapt kar sakte hain:
👉 **Free Kundli Link:** ${SITE_URL}/free-kundli

🔮 **Detailed Telephonic / Video Consultation:**
• Career & Vyapar Badha
• Vivah Vilamb & Manglik Dosh
• Pitra Dosh & Shani Sade Sati Upay

Aap apni Janam Tithi (DOB), Samay (Time) aur Sthan (Place) yahan WhatsApp par bhi bhej sakte hain.`,
                quickLinks: [
                    { title: 'Get Free Kundli', url: `${SITE_URL}/free-kundli` },
                    { title: 'Astrology Services', url: `${SITE_URL}/services/astrology-consultation` },
                ],
            };
        }

        case 'MUHURAT_SAMAGRI': {
            return {
                language: 'hinglish',
                text: `🕉️ Namaste ${nameGreeting} 🙏 Har Har Mahadev!

Kashi me pooja ke liye Shubh Muhurat aur Samagri se sambandhit aapka prashna prapt hua.

✨ **Vedic Muhurat Guidance:**
• Rudrabhishek & Shiva Poojas: Somwar, Pradosh Vrat, Masik Shivratri, ya Brahma Muhurat sarvottam hote hain.
• Kalsarp & Rahu Shanti: Amavasya, Panchami, ya Somwar.
• Pitra Dosh Shradh: Amavasya, Krishna Paksha Ashtami, ya Sankranti.

🧺 **Samagri vyavastha:**
Sampoorn shuddh Vedic samagri (Gangajal, Bilva Patra, Bhasma, Dhatura, Churna, Panchamrit) hamare dwara Kashi me vyavasthit ki jaati hai. Aapko alag se kuch lane ki aavashyakta nahi hoti.

Kripya apni specific pooja ya date batayein taaki Pandit ji sahi muhurat bata sakein.`,
                quickLinks: [
                    { title: 'Check Services', url: `${SITE_URL}/services` },
                    { title: 'Contact Vedic Team', url: `https://wa.me/${WHATSAPP_DIRECT_NUMBER}` },
                ],
            };
        }

        default: {
            return {
                language: 'hinglish',
                text: `🕉️ Namaste ${nameGreeting} 🙏 Har Har Mahadev!

Adhbhut Gyaan Kashi Vedic Kendra me aapka hardik swagat hai. 

Hamare yahan Kashi (Varanasi) me sabhi prakaar ke Vedic anushthan, Ganga Ghat pooja, Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh evam Dr. Umang Nath Sharma dwara Kundli paramarsh uplabdh hai.

Hum aapki kya sahayata kar sakte hain?
1. 📿 **Pooja Booking** (${SITE_URL}/booking)
2. 📜 **Free Kundli Check** (${SITE_URL}/free-kundli)
3. 💬 **Chat with Pandit Ji** (WhatsApp: +91 98182 27189)

Kripya apna prashna batayein, hum jald hi aapko poori jankari pradan karenge.`,
                quickLinks: [
                    { title: 'Website Home', url: `${SITE_URL}/` },
                    { title: 'All Services', url: `${SITE_URL}/services` },
                ],
            };
        }
    }
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
        return;
    }

    if (!requireAgentAuth(req, res)) {
        return;
    }

    try {
        const body = req.body || {};
        const phone = capStr(body.phone || body.from || '', 30);
        const message = capStr(body.message || body.text || body.query || '', 3000);
        const name = capStr(body.name || body.devoteeName || '', 100);
        const sendDirectWhatsApp = Boolean(body.sendDirectWhatsApp);

        if (!message && !phone) {
            res.status(400).json({ ok: false, error: 'Either message text or phone number is required.' });
            return;
        }

        // 1. Classify devotee intent
        const intent = classifyDevoteeIntent(message);

        // 2. Generate culturally rich response
        const responsePayload = composeConciergeResponse(intent, name, message);

        const db = await getDb();
        let whatsappSent = false;
        let whatsappError = null;

        // 3. Optionally dispatch directly via WhatsApp Cloud API if requested and configured
        if (sendDirectWhatsApp && phone) {
            try {
                await sendWhatsAppText(phone.replace(/[^0-9]/g, ''), responsePayload.text);
                whatsappSent = true;
            } catch (wErr) {
                whatsappError = wErr.message;
            }
        }

        // 4. Log interaction in contacts / whatsapp_conversations for CRM history
        if (phone || message) {
            await db.collection('contacts').insertOne({
                name: name || 'WhatsApp Devotee',
                phone: phone || '',
                message: message,
                intent: intent.category,
                serviceHint: intent.serviceHint,
                conciergeReply: responsePayload.text,
                whatsappDispatched: whatsappSent,
                source: 'whatsapp-concierge-agent',
                createdAt: new Date(),
            });
        }

        res.status(200).json({
            ok: true,
            agent: 'AGENT 2: 24/7 WhatsApp Devotee Concierge',
            intent: intent.category,
            confidence: intent.confidence,
            serviceHint: intent.serviceHint,
            responseText: responsePayload.text,
            quickLinks: responsePayload.quickLinks,
            whatsappDispatched: whatsappSent,
            whatsappError,
            processedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('whatsapp-concierge agent error:', err);
        res.status(500).json({
            ok: false,
            error: 'Server error in WhatsApp Concierge agent.',
            details: err.message || String(err),
        });
    }
};
