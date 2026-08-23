import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import services from '../data/services.json';

export default function LeaveReview() {
    const { t, lang } = useLanguage();
    const [form, setForm] = useState({ name: '', location: '', phone: '', serviceName: '', rating: 5, text: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | saving | saved | error

    useSEO({
        title: t('समीक्षा दें | Adhbhut Gyaan', 'Leave a Review | Adhbhut Gyaan'),
        description: t('अपना अनुभव साझा करें — हमारी पूजा सेवाओं के बारे में अपनी समीक्षा दें।', 'Share your experience — leave a review about our pooja services.'),
        path: '/leave-a-review',
    });

    const validate = () => {
        const next = {};
        if (!form.name.trim()) {
            next.name = t('कृपया अपना नाम लिखें', 'Please enter your name');
        }
        if (!form.text.trim() || form.text.trim().length < 10) {
            next.text = t('कृपया कम से कम 10 अक्षरों की समीक्षा लिखें', 'Please write a review of at least 10 characters');
        }
        setErrors(next);
        if (Object.keys(next).length > 0) {
            const firstKey = next.name ? 'review-name' : 'review-text';
            const el = document.getElementById(firstKey);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus({ preventScroll: true });
            }
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('saving');
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setStatus('saved');
                setForm({ name: '', location: '', phone: '', serviceName: '', rating: 5, text: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('समीक्षा दें', 'Leave a Review')}</span></div>
                    <h1>{t('अपना अनुभव साझा करें', 'Share Your Experience')}</h1>
                    <p className="subtitle">{t('आपकी समीक्षा हमारे लिए अनमोल है', 'Your review means a lot to us')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,4vw,2rem)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        {status === 'saved' ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🙏</div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{t('धन्यवाद!', 'Thank You!')}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {t('आपकी समीक्षा प्राप्त हो गई है। स्वीकृति के बाद यह वेबसाइट पर दिखेगी।', 'Your review has been received. It will appear on the website once approved.')}
                                </p>
                                <button type="button" className="btn btn-outline-dark" style={{ marginTop: '1.25rem' }} onClick={() => setStatus('idle')}>
                                    {t('एक और समीक्षा दें', 'Leave Another Review')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-hindi)' }}>{t('समीक्षा फ़ॉर्म', 'Review Form')}</h3>

                                {status === 'error' && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--gold-700)', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', marginBottom: '1rem' }}>
                                        {t('समीक्षा सहेजी नहीं जा सकी। कृपया दोबारा प्रयास करें।', 'Could not save the review. Please try again.')}
                                    </p>
                                )}

                                <div className="form-group">
                                    <label className="form-label" htmlFor="review-name">{t('नाम', 'Name')} *</label>
                                    <input
                                        id="review-name"
                                        className={`form-input ${errors.name ? 'has-error' : ''}`}
                                        placeholder={t('अपना नाम लिखें', 'Enter your name')}
                                        value={form.name}
                                        aria-invalid={errors.name ? 'true' : 'false'}
                                        onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                                    />
                                    {errors.name && <p className="form-error">⚠ {errors.name}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="review-location">{t('शहर / देश', 'City / Country')}</label>
                                    <input
                                        id="review-location"
                                        className="form-input"
                                        placeholder={t('जैसे: दिल्ली, भारत', 'e.g. Delhi, India')}
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="review-phone">{t('मोबाइल (केवल हमारे रिकॉर्ड हेतु, सार्वजनिक नहीं होगा)', 'Phone (for our records only, not shown publicly)')}</label>
                                    <input
                                        id="review-phone"
                                        className="form-input"
                                        type="tel"
                                        placeholder="+91 92781 48269"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('सेवा', 'Service')}</label>
                                    <select className="form-select" value={form.serviceName} onChange={e => setForm({ ...form, serviceName: e.target.value })}>
                                        <option value="">-- {t('चुनें (वैकल्पिक)', 'Select (optional)')} --</option>
                                        {services.map(s => (
                                            <option key={s.id} value={lang === 'hi' ? s.name : s.nameEn}>{lang === 'hi' ? s.name : s.nameEn}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('रेटिंग', 'Rating')}</label>
                                    <div role="radiogroup" aria-label={t('रेटिंग', 'Rating')} style={{ display: 'flex', gap: '0.35rem', fontSize: '2rem', lineHeight: 1 }}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                role="radio"
                                                aria-checked={form.rating === n}
                                                aria-label={t(`${n} सितारे`, `${n} stars`)}
                                                onClick={() => setForm({ ...form, rating: n })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: n <= form.rating ? 'var(--gold-500)' : 'var(--border-light)' }}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="review-text">{t('आपकी समीक्षा', 'Your Review')} *</label>
                                    <textarea
                                        id="review-text"
                                        className={`form-textarea ${errors.text ? 'has-error' : ''}`}
                                        placeholder={t('अपना अनुभव लिखें...', 'Write about your experience...')}
                                        value={form.text}
                                        aria-invalid={errors.text ? 'true' : 'false'}
                                        onChange={e => { setForm({ ...form, text: e.target.value }); setErrors({ ...errors, text: undefined }); }}
                                    />
                                    {errors.text && <p className="form-error">⚠ {errors.text}</p>}
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'saving'}>
                                    {status === 'saving' ? t('भेजा जा रहा है...', 'Submitting...') : t('समीक्षा भेजें', 'Submit Review')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
