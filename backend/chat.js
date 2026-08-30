// AI Vedic Astrologer Chatbot API Route
// File: api/chat.js
// Powered by Google Gemini API (gemini-1.5-flash / gemini-pro) with graceful fallback.

const { getDb, withCors, capStr, checkRateLimit } = require('./_db');
const { callGemini, getVedicFallbackResponse } = require('./_gemini');
const { runAssistantTurn } = require('./_assistant');

const MAX_TURNS_SENT = 20;

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    try {
        let db = null;
        try {
            db = await getDb();
        } catch { /* proceed with rate limiting fallback */ }

        if (db) {
            const allowed = await checkRateLimit(db, req, 'chat', { limit: 30, windowMs: 10 * 60 * 1000 });
            if (!allowed) {
                res.status(429).json({ ok: false, error: 'Too many messages. Please wait a few minutes, or WhatsApp Dr. Umang Nath Sharma directly: +91 98182 27189' });
                return;
            }
        }

        const body = req.body || {};
        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const pageContext = capStr(body.pageContext || '', 100);
        const rashi = capStr(body.rashi || '', 50);

        const messages = incoming
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-MAX_TURNS_SENT)
            .map(m => ({ role: m.role, content: capStr(m.content, 4000) }));

        if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
            res.status(400).json({ ok: false, error: 'messages must end with a valid user message' });
            return;
        }

        const lastUserQuery = messages[messages.length - 1].content;
        const fullContext = [pageContext, rashi ? `Selected Rashi: ${rashi}` : ''].filter(Boolean).join(' | ');

        // 1. Primary AI Engine: Google Gemini API (GEMINI_API_KEY)
        if (process.env.GEMINI_API_KEY) {
            try {
                const replyText = await callGemini(messages, process.env.GEMINI_API_KEY, fullContext);
                res.status(200).json({ ok: true, reply: replyText, engine: 'gemini' });
                return;
            } catch (geminiErr) {
                console.warn('Gemini API attempt encountered issue, trying Anthropic fallback:', geminiErr.message);
            }
        }

        // 2. Secondary Engine: Anthropic Claude (if configured)
        if (process.env.ANTHROPIC_API_KEY && db) {
            try {
                const { replyText, bookingCreated } = await runAssistantTurn(db, messages, process.env.ANTHROPIC_API_KEY, 'chatbot', fullContext);
                res.status(200).json({ ok: true, reply: replyText, bookingCreated, engine: 'claude' });
                return;
            } catch (anthropicErr) {
                console.warn('Anthropic API attempt encountered issue:', anthropicErr.message);
            }
        }

        // 3. Guaranteed Domain-Expert Vedic Astrological Fallback Engine
        const fallbackReply = getVedicFallbackResponse(lastUserQuery);
        res.status(200).json({
            ok: true,
            reply: fallbackReply,
            engine: 'vedic-knowledge-fallback',
        });
    } catch (err) {
        console.error('Chat API general error:', err);
        res.status(200).json({
            ok: true,
            reply: getVedicFallbackResponse(req.body?.messages?.slice(-1)?.[0]?.content || ''),
            engine: 'emergency-fallback',
        });
    }
};
