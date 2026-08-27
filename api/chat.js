// AI chatbot for the website widget. See api/_assistant.js for the shared
// business-knowledge system prompt and booking logic (also used by
// api/whatsapp-webhook.js for the WhatsApp bot).
//
// Requires one env var in Vercel: ANTHROPIC_API_KEY (from console.anthropic.com).

const { getDb, withCors, capStr, checkRateLimit } = require('./_db');
const { runAssistantTurn } = require('./_assistant');

const MAX_TURNS_SENT = 20; // cap conversation history size sent per request

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

    if (!process.env.ANTHROPIC_API_KEY) {
        res.status(503).json({ ok: false, error: 'Chatbot is not configured yet. Please WhatsApp us instead: +91 92781 48269' });
        return;
    }

    try {
        const db = await getDb();
        const allowed = await checkRateLimit(db, req, 'chat', { limit: 20, windowMs: 10 * 60 * 1000 });
        if (!allowed) {
            res.status(429).json({ ok: false, error: 'Too many messages. Please wait a few minutes, or WhatsApp us: +91 92781 48269' });
            return;
        }

        const body = req.body || {};
        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const pageContext = capStr(body.pageContext, 100);
        const messages = incoming
            .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-MAX_TURNS_SENT)
            .map(m => ({ role: m.role, content: capStr(m.content, 4000) }));

        if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
            res.status(400).json({ ok: false, error: 'messages must end with a user message' });
            return;
        }

        const { replyText, bookingCreated } = await runAssistantTurn(db, messages, process.env.ANTHROPIC_API_KEY, 'chatbot', pageContext);
        res.status(200).json({ ok: true, reply: replyText, bookingCreated });
    } catch (err) {
        console.error('chat API error:', err);
        res.status(500).json({ ok: false, error: 'Server error. Please try again or WhatsApp us: +91 92781 48269' });
    }
};
