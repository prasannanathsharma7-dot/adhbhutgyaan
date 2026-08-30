import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import servicesData from '../data/services.json';

const RASHIS = [
    { id: 'mesh', nameHi: 'मेष', nameEn: 'Aries', icon: '♈' },
    { id: 'vrishabh', nameHi: 'वृषभ', nameEn: 'Taurus', icon: '♉' },
    { id: 'mithun', nameHi: 'मिथुन', nameEn: 'Gemini', icon: '♊' },
    { id: 'karka', nameHi: 'कर्क', nameEn: 'Cancer', icon: '♋' },
    { id: 'simha', nameHi: 'सिंह', nameEn: 'Leo', icon: '♌' },
    { id: 'kanya', nameHi: 'कन्या', nameEn: 'Virgo', icon: '♍' },
    { id: 'tula', nameHi: 'तुला', nameEn: 'Libra', icon: '♎' },
    { id: 'vrishchik', nameHi: 'वृश्चिक', nameEn: 'Scorpio', icon: '♏' },
    { id: 'dhanu', nameHi: 'धनु', nameEn: 'Sagittarius', icon: '♐' },
    { id: 'makar', nameHi: 'मकर', nameEn: 'Capricorn', icon: '♑' },
    { id: 'kumbh', nameHi: 'कुंभ', nameEn: 'Aquarius', icon: '♒' },
    { id: 'meen', nameHi: 'मीन', nameEn: 'Pisces', icon: '♓' },
];

const SUGGESTED_PROMPTS = [
    { labelHi: '🐍 कालसर्प दोष निवारण', labelEn: '🐍 Kaal Sarp Dosh Remedies', query: 'कालसर्प दोष के लक्षण और काशी में इसके निवारण की क्या विधि है?' },
    { labelHi: '🕉️ रुद्राभिषेक पूजा के लाभ', labelEn: '🕉️ Rudrabhishek Benefits', query: 'काशी में रुद्राभिषेक पूजा कराने के क्या लाभ और नियम हैं?' },
    { labelHi: '🪐 शनि साढ़े साती उपाय', labelEn: '🪐 Shani Sade Sati Upay', query: 'शनि साढ़े साती या ढैय्या के दुष्प्रभाव कम करने के वैदिक उपाय बताएं।' },
    { labelHi: '💍 विवाह में विलंब / मांगलिक', labelEn: '💍 Marriage Delay Remedies', query: 'विवाह में देरी या मांगलिक दोष के निवारण हेतु कौन सी पूजा करनी चाहिए?' },
    { labelHi: '📅 आज का शुभ मुहूर्त', labelEn: '📅 Today’s Shubh Muhurat', query: 'आज का अभिजित मुहूर्त और चौघड़िया समय क्या है?' },
];

export default function ChatWidget() {
    const { t, lang } = useLanguage();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedRashi, setSelectedRashi] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const bodyRef = useRef(null);
    const inputRef = useRef(null);

    // Contextual Page Awareness
    const serviceMatch = location.pathname.match(/^\/services\/([a-z-]+)$/);
    const currentService = serviceMatch ? servicesData.find(s => s.id === serviceMatch[1]) : null;

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTo({
                top: bodyRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, loading, open]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    async function handleSend(textToSend) {
        const text = (typeof textToSend === 'string' ? textToSend : input).trim();
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
                body: JSON.stringify({
                    messages: nextMessages,
                    pageContext: currentService ? currentService.nameEn : undefined,
                    rashi: selectedRashi || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data.error || 'Unable to generate response');
            }
            setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setError(err.message || t('कुछ तकनीकी समस्या आई। कृपया WhatsApp पर संपर्क करें।', 'Something went wrong. Please connect on WhatsApp instead.'));
        } finally {
            setLoading(false);
        }
    }

    const handleRashiSelect = (rashi) => {
        setSelectedRashi(rashi.nameEn);
        const queryText = lang === 'hi'
            ? `${rashi.icon} ${rashi.nameHi} (${rashi.nameEn}) राशि का आज का राशिफल और वैदिक उपाय बताएं।`
            : `Please provide the Vedic horoscope and remedies for ${rashi.icon} ${rashi.nameEn} (${rashi.nameHi}) Rashi.`;
        handleSend(queryText);
    };

    const greeting = currentService
        ? t(
            `नमस्कार 🙏 ${currentService.name} के बारे में कुछ भी पूछें, या अपनी राशि अनुसार उपाय और मुहूर्त की जानकारी प्राप्त करें।`,
            `Namaste 🙏 Ask me anything about ${currentService.nameEn}, or get instant Vedic horoscope and remedy guidance.`
        )
        : t(
            'नमस्कार 🙏 मैं Adhbhut Gyaan का AI वैदिक ज्योतिषी सहायक हूं। कालसर्प दोष, रुद्राभिषेक, दैनिक राशिफल या पूजा परामर्श के बारे में कुछ भी पूछ सकते हैं।',
            "Namaste 🙏 I'm the AI Vedic Astrologer for Adhbhut Gyaan. Ask me about Kaal Sarp Dosh, Rudrabhishek, daily horoscope by Rashi, or personalized puja remedies."
        );

    return (
        <>
            {/* Floating Chat Trigger Button with Vedic Badge */}
            <button
                type="button"
                className="chat-fab"
                onClick={() => setOpen(o => !o)}
                aria-label={t('AI वैदिक ज्योतिषी चैट खोलें', 'Open AI Astrologer Chat')}
                aria-expanded={open}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold-600) 0%, var(--gold-700) 100%)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 8px 24px rgba(212, 168, 67, 0.45)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {open ? '✕' : '✨'}
            </button>

            {/* Main Interactive Chat Panel */}
            {open && (
                <div
                    className="chat-panel"
                    role="dialog"
                    aria-label={t('AI वैदिक ज्योतिषी चैट', 'AI Vedic Astrologer Chat')}
                    style={{
                        position: 'fixed',
                        bottom: '96px',
                        right: '24px',
                        width: 'min(420px, calc(100vw - 32px))',
                        height: 'min(620px, calc(100vh - 120px))',
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.25)',
                        border: '1px solid var(--border-gold)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9998,
                        overflow: 'hidden',
                        animation: 'chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {/* Header with Pandit Ji branding */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-850) 100%)',
                            color: 'white',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '2px solid var(--gold-600)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                📿
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#fff' }}>
                                    {t('AI वैदिक ज्योतिषी', 'AI Vedic Astrologer')}
                                </strong>
                                <span style={{ fontSize: '0.72rem', color: 'var(--gold-400)', display: 'block' }}>
                                    काशी परंपरा · डॉ. उमंग नाथ शर्मा
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <a
                                href="https://wa.me/919818227189"
                                target="_blank"
                                rel="noreferrer"
                                title={t('पंडित जी से WhatsApp पर बात करें', 'Direct WhatsApp Consultation')}
                                style={{ background: '#25d366', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '0.9rem' }}
                            >
                                💬
                            </a>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label={t('बंद करें', 'Close')}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Rashi Quick Selector Bar */}
                    <div style={{ background: 'var(--warm-100)', borderBottom: '1px solid var(--border-light)', padding: '0.5rem 0.75rem', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', alignSelf: 'center', marginRight: '0.2rem' }}>
                            {t('राशिफल:', 'Rashi:')}
                        </span>
                        {RASHIS.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => handleRashiSelect(r)}
                                disabled={loading}
                                style={{
                                    border: selectedRashi === r.nameEn ? '1px solid var(--gold-600)' : '1px solid #e2e8f0',
                                    background: selectedRashi === r.nameEn ? 'var(--gold-50)' : 'white',
                                    color: 'var(--navy-900)',
                                    borderRadius: '12px',
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    flexShrink: 0,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {r.icon} {lang === 'hi' ? r.nameHi : r.nameEn}
                            </button>
                        ))}
                    </div>

                    {/* Chat Messages Body */}
                    <div
                        ref={bodyRef}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            background: 'var(--warm-50)',
                        }}
                    >
                        {/* Welcome Greeting */}
                        <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px 16px 16px 4px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--navy-950)', lineHeight: 1.5, boxShadow: 'var(--shadow-sm)' }}>
                            {greeting}
                        </div>

                        {/* Suggested Topic Chips (if conversation has < 2 messages) */}
                        {messages.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {t('सुझाए गए विषय (Quick Queries):', 'Suggested Queries:')}
                                </span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                    {SUGGESTED_PROMPTS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSend(p.query)}
                                            disabled={loading}
                                            style={{
                                                background: 'white',
                                                border: '1px solid var(--border-gold)',
                                                borderRadius: '16px',
                                                padding: '0.35rem 0.65rem',
                                                fontSize: '0.75rem',
                                                color: 'var(--navy-900)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-50)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                        >
                                            {lang === 'hi' ? p.labelHi : p.labelEn}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message Stream */}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    padding: '0.75rem 0.95rem',
                                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: m.role === 'user' ? 'var(--navy-900)' : 'white',
                                    color: m.role === 'user' ? 'white' : 'var(--navy-950)',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.5,
                                    boxShadow: 'var(--shadow-sm)',
                                    border: m.role === 'user' ? 'none' : '1px solid var(--border-light)',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {m.content}
                            </div>
                        ))}

                        {/* Typing Animation */}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '0.65rem 0.9rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span>✨</span> {t('वैदिक गणना एवं उत्तर तैयार हो रहा है...', 'Consulting Vedic ephemeris...')}
                            </div>
                        )}

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.65rem', color: '#991b1b', fontSize: '0.8rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Disclaimer Bar (Mandatory Requirement) */}
                    <div style={{ background: 'var(--warm-100)', padding: '0.35rem 0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                        ⚠️ {t(
                            'AI मार्गदर्शन केवल सामान्य जानकारी हेतु है। सटीक विश्लेषण हेतु डॉ. उमंग नाथ शर्मा से परामर्श लें।',
                            'AI guidance is for general insights only. Consult Dr. Umang Nath Sharma for accurate birth chart readings.'
                        )}
                    </div>

                    {/* Input Bar */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        style={{
                            display: 'flex',
                            padding: '0.65rem 0.75rem',
                            background: 'white',
                            borderTop: '1px solid var(--border-light)',
                            gap: '0.5rem',
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={t('अपना सवाल या समस्या लिखें...', 'Ask about doshas, puja, horoscope...')}
                            disabled={loading}
                            maxLength={1000}
                            style={{
                                flex: 1,
                                padding: '0.55rem 0.85rem',
                                borderRadius: '20px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                outline: 'none',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            aria-label={t('भेजें', 'Send')}
                            style={{
                                background: 'linear-gradient(135deg, var(--gold-600) 0%, var(--gold-700) 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                opacity: loading || !input.trim() ? 0.5 : 1,
                                fontSize: '1rem',
                                flexShrink: 0,
                            }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
