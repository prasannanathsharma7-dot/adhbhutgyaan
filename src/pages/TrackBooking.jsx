import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { waLink } from '../config/contact';

// "Where is my pooja?" - the customer enters the reference from the confirmation and the last 4 digits of their phone.
// The server returns a deliberately small view (stages and times, service and date - no contact details).
export default function TrackBooking() {
    const { t, lang } = useLanguage();
    const [params] = useSearchParams();
    const [reference, setReference] = useState((params.get('ref') || '').toUpperCase());
    const [last4, setLast4] = useState('');
    const [state, setState] = useState({ status: 'idle', booking: null, error: '' });

    useSEO({
        title: t('अपनी बुकिंग देखें | Adhbhut Gyaan', 'Track your booking | Adhbhut Gyaan'),
        description: t('अपनी पूजा बुकिंग की स्थिति देखें।', 'See the status of your pooja booking.'),
        path: '/track',
        noindex: true,
    });

    const submit = async (e) => {
        e.preventDefault();
        setState({ status: 'loading', booking: null, error: '' });
        try {
            const res = await fetch('/api/booking-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: reference.trim(), phoneLast4: last4.trim() }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) { setState({ status: 'error', booking: null, error: data.error || t('कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।', 'Something went wrong. Please try again.') }); return; }
            setState({ status: 'done', booking: data.booking, error: '' });
        } catch {
            setState({ status: 'error', booking: null, error: t('नेटवर्क में दिक्कत। कृपया पुनः प्रयास करें।', 'Network problem. Please try again.') });
        }
    };

    const fmt = (iso) => iso ? new Date(iso).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const b = state.booking;
    const help = waLink(`Namaste, I need help with my booking${b ? ` ${b.reference}` : reference ? ` ${reference}` : ''}.`);

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('बुकिंग देखें', 'Track booking')}</span></div>
                    <h1>{t('आपकी पूजा कहाँ तक पहुँची?', 'Where is your pooja?')}</h1>
                    <p className="subtitle">{t('अपनी संदर्भ संख्या और फ़ोन के अंतिम 4 अंक लिखें', 'Enter your reference and the last 4 digits of your phone')}</p>
                </div>
            </header>
            <section className="section">
                <div className="container" style={{ maxWidth: 560 }}>
                    <form onSubmit={submit} noValidate style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                        <label htmlFor="track-ref" style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{t('संदर्भ संख्या', 'Reference')}</label>
                        <input id="track-ref" className="form-input" value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="AG-2026-1A2B3C" autoComplete="off" autoCapitalize="characters" maxLength={14} style={{ width: '100%', marginBottom: '1rem' }} />
                        <label htmlFor="track-last4" style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{t('फ़ोन के अंतिम 4 अंक', 'Last 4 digits of your phone')}</label>
                        <input id="track-last4" className="form-input" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="1234" autoComplete="off" maxLength={4} style={{ width: '100%', marginBottom: '1.25rem' }} />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={state.status === 'loading'}>
                            {state.status === 'loading' ? t('देख रहे हैं…', 'Checking…') : t('स्थिति देखें', 'Show status')}
                        </button>
                        <div aria-live="polite">
                            {state.status === 'error' && <p role="alert" style={{ color: '#b3261e', fontSize: '0.9rem', margin: '1rem 0 0' }}>{state.error}</p>}
                        </div>
                    </form>

                    {b && (
                        <div style={{ marginTop: '1.5rem' }} aria-live="polite">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{t(`नमस्कार ${b.firstName}`, `Namaste ${b.firstName}`)} 🙏</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                <strong>{b.serviceName || t('आपकी पूजा', 'Your pooja')}</strong>{b.mode ? ` · ${b.mode}` : ''}
                                {(b.scheduledDate || b.preferredDate) && <> · {t('तिथि', 'Date')}: {b.scheduledDate ? fmt(b.scheduledDate) : b.preferredDate}</>}
                                <br /><span style={{ fontSize: '0.82rem' }}>{t('संदर्भ', 'Reference')}: {b.reference}</span>
                            </p>
                            {b.cancelled && <p role="status" style={{ background: '#fdecea', border: '1px solid #f5c2c0', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#8a1c13' }}>{t('यह बुकिंग रद्द कर दी गई है। नई बुकिंग हेतु हमें WhatsApp करें।', 'This booking has been cancelled. WhatsApp us to make a new one.')}</p>}
                            <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem' }}>
                                {b.stages.map((s) => (
                                    <li key={s.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0', borderLeft: 'none', color: s.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                        {s.done ? <CheckCircle2 size={22} aria-hidden="true" style={{ color: '#15803d', flexShrink: 0 }} /> : <Circle size={22} aria-hidden="true" style={{ flexShrink: 0 }} />}
                                        <span>
                                            <span style={{ fontWeight: s.done ? 600 : 400 }}>{lang === 'hi' ? s.labelHi : s.labelEn}</span>
                                            <span className="sr-only">{s.done ? t(' — पूर्ण', ' - done') : t(' — बाकी', ' - pending')}</span>
                                            {s.at && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmt(s.at)}</span>}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{t('फोटो/वीडियो प्रमाण आपके WhatsApp पर भेजा जाता है।', 'Photo / video proof is sent to your WhatsApp.')}</p>
                        </div>
                    )}

                    <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a href={help} target="_blank" rel="noreferrer" className="btn btn-whatsapp"><MessageCircle size={16} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('मदद चाहिए? WhatsApp करें', 'Need help? WhatsApp us')}</a>
                    </p>
                </div>
            </section>
        </div>
    );
}
