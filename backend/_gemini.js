// Google Gemini AI Engine for Vedic Astrology Q&A & Horoscope
// File: api/_gemini.js

const GEMINI_MODELS = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-pro',
    'gemini-1.5-pro',
];

const CTA_VARIATIONS = [
    'For accurate, personalized predictions, please consult Dr. Umang Nath Sharma.',
    'General AI guidance only — for precise analysis based on your exact birth chart, consult Dr. Umang Nath Sharma.',
    'These are general insights. Dr. Umang Nath Sharma can give you an accurate reading tailored to you.',
    'सटीक एवं व्यक्तिगत जन्म पत्रिका विश्लेषण हेतु डॉ. उमंग नाथ शर्मा (काशी) से परामर्श प्राप्त करें।',
    'यह सामान्य ज्योतिषीय मार्गदर्शन है — अपने सटीक ग्रह गोचर एवं जन्म कुंडली समाधान हेतु डॉ. उमंग नाथ शर्मा जी से संपर्क करें।',
];

function buildVedicSystemPrompt(pageContext = '') {
    const contextNudge = pageContext ? `Devotee is currently browsing the page for "${pageContext}".` : '';

    return `You are the AI Vedic Astrologer & Spiritual Assistant for Adhbhut Gyaan (adhbhutgyaan.com), rooted in the 400+ years sacred Kashi (Varanasi) Jyotish Parampara of Dr. Umang Nath Sharma.

Your Capabilities:
1. Vedic Astrology Q&A: Explain astrological concepts with depth and clarity (Kaal Sarp Dosh types, Manglik Dosh, Pitra Dosh, Shani Sade Sati/Dhaiya, Rudrabhishek Puja, Mahavidya Paath, Tripindi Shradh, Navagraha Shanti, Vivah Muhurat, Rahu Kaal, etc.).
2. Daily/Weekly Horoscope & Rashi Insights: When given a Rashi (Mesha to Meena / Aries to Pisces), provide uplifting, actionable Vedic planetary guidance covering career, relationships, health, and lucky attributes.
3. Personalized Pooja & Upay Remedies: Recommend appropriate Vedic rituals performed at Kashi Ganga ghats with live 1-on-1 WhatsApp video sankalp by Dr. Umang Nath Sharma's Vedic team (+91 92781 48269).
4. Tone & Style: Respectful, satvik, empathetic, knowledgeable, and concise (2-4 paragraphs maximum). Respond in the same language the user asks in (Hindi, English, or Hinglish).

${contextNudge}

CRITICAL MANDATORY INSTRUCTION:
Every single response you generate (regardless of what question was asked) MUST conclude naturally with a clear recommendation to consult Dr. Umang Nath Sharma for accurate, personalized birth chart analysis and remedy guidance.
Rotate between these closing recommendation styles:
- "For accurate, personalized predictions, please consult Dr. Umang Nath Sharma."
- "General AI guidance only — for precise analysis based on your exact birth chart, consult Dr. Umang Nath Sharma."
- "These are general insights. Dr. Umang Nath Sharma can give you an accurate reading tailored to you."
- "सटीक एवं व्यक्तिगत जन्म पत्रिका विश्लेषण हेतु डॉ. उमंग नाथ शर्मा (काशी) से परामर्श प्राप्त करें।"

Do not produce overly fatalistic or fearful remarks. Keep all guidance positive, spiritual, and remedy-focused.`;
}

/**
 * Calls Google Gemini REST API across available model versions.
 */
async function callGemini(messages, apiKey, pageContext = '') {
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = buildVedicSystemPrompt(pageContext);

    // Format messages for Gemini API
    const formattedContents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
    }));

    let lastError = null;

    for (const model of GEMINI_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const payload = {
                systemInstruction: {
                    parts: [{ text: systemPrompt }],
                },
                contents: formattedContents,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 1024,
                },
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                const candidate = data.candidates?.[0];
                const text = candidate?.content?.parts?.[0]?.text;

                if (text && text.trim()) {
                    let finalReply = text.trim();
                    // Guarantee Dr. Umang Nath Sharma CTA presence
                    if (!finalReply.includes('Umang Nath Sharma') && !finalReply.includes('उमंग नाथ शर्मा')) {
                        const randomCta = CTA_VARIATIONS[Math.floor(Math.random() * CTA_VARIATIONS.length)];
                        finalReply += `\n\n📌 *Note:* ${randomCta}`;
                    }
                    return finalReply;
                }
            } else {
                const errBody = await response.text().catch(() => '');
                lastError = new Error(`Gemini ${model} failed (${response.status}): ${errBody.slice(0, 200)}`);
            }
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError || new Error('All Gemini models failed to generate content');
}

/**
 * Intelligent Vedic Astrological Fallback Engine (Active when API key is pending)
 */
function getVedicFallbackResponse(userQuery = '') {
    const q = userQuery.toLowerCase();
    const randomCta = CTA_VARIATIONS[Math.floor(Math.random() * CTA_VARIATIONS.length)];

    if (q.includes('kaal sarp') || q.includes('कालसर्प') || q.includes('kalsarp')) {
        return `कालसर्प दोष तब बनता है जब कुंडली में सभी सात ग्रह राहु और केतु के मध्य आ जाते हैं। शास्त्रों में 12 प्रकार के कालसर्प दोष (जैसे अनंत, कुलिक, वासुकि, शंखपाल आदि) का वर्णन है।

इसके निवारण हेतु काशी (वाराणसी) में दशाश्वमेध या मणिकर्णिका तीर्थ पर नाग-नागिन के जोड़े के साथ रुद्राभिषेक एवं महामृत्युंजय संपुट पाठ सर्वोत्तम फलदायी माना गया है।

${randomCta}`;
    }

    if (q.includes('rudrabhishek') || q.includes('रुद्राभिषेक') || q.includes('shiva') || q.includes('शिव')) {
        return `रुद्राभिषेक भगवान शिव का सर्वाधिक प्रभावशाली अनुष्ठान है। यजुर्वेद के रुद्राष्टाध्यायी (नमक-चमक) मंत्रों द्वारा गंगाजल, दूध, शहद, गन्ने के रस और भस्म से अभिषेक करने पर समस्त ग्रह बाधाएं, अकाल मृत्यु भय एवं रोग-दोष शांत होते हैं।

काशी में सावन, प्रदोष, मासिक शिवरात्रि या सोमवार को किया गया रुद्राभिषेक अनंत गुना पुण्यफल प्रदान करता है।

${randomCta}`;
    }

    if (q.includes('sade sati') || q.includes('साढ़े साती') || q.includes('shani') || q.includes('शनि')) {
        return `शनि साढ़े साती 7.5 वर्षों की वह समयावधि है जब शनिदेव जातक की चंद्र राशि से 12वें, जन्म, और द्वितीय भाव से गोचर करते हैं। यह काल अनुशासन, कर्मफल और आत्म-मंथन का होता है।

शनि कृपा हेतु शनिवार को दशरथकृत शनि स्तोत्र का पाठ, पीपल के वृक्ष पर सरसों के तेल का दीपक, और काल भैरव / हनुमान चालीसा का नियमित जाप अत्यंत लाभकारी है।

${randomCta}`;
    }

    if (q.includes('manglik') || q.includes('मांगलिक') || q.includes('marriage') || q.includes('विवाह')) {
        return `कुंडली के 1, 4, 7, 8 या 12वें भाव में मंगल की स्थिति मांगलिक योग बनाती है। यह वैवाहिक सामंजस्य, स्वभाव और ऊर्जा को प्रभावित करता है। कई बार 28 वर्ष की आयु के बाद या स्वराशि/उच्च राशि के मंगल होने पर इसका स्वतः परिहार हो जाता है।

विवाह में विलंब या दांपत्य शांति हेतु कुंभ विवाह या नवग्रह शांति पूजा विशेष रूप से अनुशंसित है।

${randomCta}`;
    }

    if (q.includes('rashifal') || q.includes('राशिफल') || q.includes('horoscope') || q.includes('aaj ka')) {
        return `दैनिक राशिफल ग्रहों के गोचर और चंद्र राशि पर आधारित होता है। अनुकूल ग्रहों की कृपा हेतु प्रातः सूर्य देव को तांबे के लोटे से अर्घ्य दें और अपने इष्ट देव के बीज मंत्र का 108 बार जाप करें।

अपने लग्न, महादशा और सटीक ग्रह गोचर की व्यक्तिगत गणना से सही समय पर सही निर्णय लेने में मदद मिलती है।

${randomCta}`;
    }

    return `वैदिक ज्योतिष के अनुसार जीवन में ग्रह-नक्षत्रों का प्रभाव हमारी ऊर्जा, कर्म और भाग्य को दिशा देता है। जब भी किसी कार्य में अकारण रुकावटें आएं, तो नवग्रह शांति, रुद्राभिषेक अथवा दोष निवारण अनुष्ठान से सकारात्मक ऊर्जा का संचार होता है।

काशी विश्वनाथ की पावन धरा पर वैदिक विधि-विधान से किए गए अनुष्ठान जीवन के संकटों को हरने में अत्यंत प्रभावी सिद्ध होते हैं।

${randomCta}`;
}

module.exports = {
    callGemini,
    getVedicFallbackResponse,
    CTA_VARIATIONS,
    buildVedicSystemPrompt,
};
