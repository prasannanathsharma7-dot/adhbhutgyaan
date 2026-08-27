import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import servicesData from '../data/services.json';

const GREETING_HI = 'नमस्कार 🙏 मैं Adhbhut Gyaan का सहायक हूं। पूजा, सेवाओं या बुकिंग के बारे में कुछ भी पूछ सकते हैं।';
const GREETING_EN = "Namaste 🙏 I'm the Adhbhut Gyaan assistant. Ask me anything about our poojas, services, or bookings.";

export default function ChatWidget() {
    const { t, lang } = useLanguage();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', content: string}
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const bodyRef = useRef(null);

    // If the visitor is on a specific service's page, the bot's greeting and
    // its first response lean toward that service instead of being fully
    // generic - a small but real conversion nudge.
    const serviceMatch = location.pathname.match(/^\/services\/([a-z-]+)$/);
    const currentService = serviceMatch ? servicesData.find(s => s.id === serviceMatch[1]) : null;

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, loading, open]);

    async function sendMessage(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const nextMessages = [...messages, { role: 'user', content: text }];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: nextMessages, pageContext: currentService ? currentService.nameEn : undefined }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setError(err.message || t('कुछ गलत हो गया। कृपया WhatsApp पर संपर्क करें।', 'Something went wrong. Please reach us on WhatsApp instead.'));
        } finally {
            setLoading(false);
        }
    }

    const greeting = currentService
        ? t(`नमस्कार 🙏 ${currentService.name} के बारे में कुछ भी पूछ सकते हैं, या बुकिंग में मदद चाहिए तो बताइए।`, `Namaste 🙏 Ask me anything about ${currentService.nameEn}, or let me know if you'd like help booking it.`)
        : (lang === 'hi' ? GREETING_HI : GREETING_EN);

    return (
        <>
            <button
                type="button"
                className="chat-fab"
                onClick={() => setOpen(o => !o)}
                aria-label={t('चैट खोलें', 'Open chat')}
                aria-expanded={open}
            >
                {open ? '✕' : '💬'}
            </button>

            {open && (
                <div className="chat-panel" role="dialog" aria-label={t('सहायक चैट', 'Assistant chat')}>
                    <div className="chat-panel-header">
                        <span>🙏 {t('Adhbhut Gyaan सहायक', 'Adhbhut Gyaan Assistant')}</span>
                        <button type="button" onClick={() => setOpen(false)} aria-label={t('बंद करें', 'Close')} className="chat-panel-close">✕</button>
                    </div>

                    <div className="chat-panel-body" ref={bodyRef}>
                        <div className="chat-bubble chat-bubble-assistant">{greeting}</div>
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>{m.content}</div>
                        ))}
                        {loading && (
                            <div className="chat-bubble chat-bubble-assistant chat-typing" aria-live="polite">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        {error && <div className="chat-error">{error}</div>}
                    </div>

                    <form className="chat-panel-input" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={t('अपना सवाल लिखें...', 'Type your question...')}
                            disabled={loading}
                            maxLength={1000}
                        />
                        <button type="submit" disabled={loading || !input.trim()} aria-label={t('भेजें', 'Send')}>➤</button>
                    </form>
                </div>
            )}
        </>
    );
}
