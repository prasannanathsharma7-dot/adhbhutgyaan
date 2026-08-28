import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

export default function FreeKundli() {
    const { t, lang } = useLanguage();
    const [form, setForm] = useState({ name: '', dob: '', tob: '', pob: '', gender: '', phone: '', email: '', question: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | saving | saved | error

    useSEO({
        title: t('निःशुल्क कुंडली — डॉ. उमंग नाथ शर्मा | Adhbhut Gyaan', 'Free Kundli & Janam Patrika by a Real Kashi Astrologer | Adhbhut Gyaan'),
        description: t(
            'अपना जन्म विवरण भेजें — डॉ. उमंग नाथ शर्मा स्वयं आपकी कुंडली का विश्लेषण करेंगे। कोई स्वचालित सॉफ्टवेयर नहीं, वास्तविक ज्योतिषी की सलाह।',
            'Submit your birth details and Dr. Umang Nath Sharma personally analyzes your Kundli - no automated software, real astrologer guidance from Kashi.'
        ),
        path: '/free-kundli',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Free Kundli', path: '/free-kundli' },
        ])),
    });

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = t('कृपया अपना नाम लिखें', 'Please enter your name');
        if (!form.dob.trim()) next.dob = t('कृपया जन्म तिथि लिखें', 'Please enter your date of birth');
        if (!form.pob.trim()) next.pob = t('कृपया जन्म स्थान लिखें', 'Please enter your place of birth');
        if (!form.phone.trim()) next.phone = t('कृपया मोबाइल नंबर लिखें', 'Please enter your phone number');
        setErrors(next);
        if (Object.keys(next).length > 0) {
            const firstKey = `kundli-${Object.keys(next)[0]}`;
            const el = document.getElementById(firstKey);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('saving');

        const notesLines = [
            `जन्म तिथि / DOB: ${form.dob}`,
            `जन्म समय / TOB: ${form.tob || t('अज्ञात (सूर्योदय 6:00 AM मान लें)', 'Unknown (assume sunrise 6:00 AM)')}`,
            `जन्म स्थान / POB: ${form.pob}`,
            form.gender ? `लिंग / Gender: ${form.gender}` : '',
            form.question ? `प्रश्न / Question: ${form.question}` : '',
        ].filter(Boolean).join('\n');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    serviceId: 'astrology-consultation',
                    serviceName: t('निःशुल्क कुंडली अनुरोध', 'Free Kundli Request'),
                    packageName: t('निःशुल्क कुंडली', 'Free Kundli'),
                    mode: t('कुंडली अनुरोध', 'Kundli Request'),
                    notes: notesLines,
                    language: lang,
                    source: 'kundli-request',
                }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setStatus('saved');
                setForm({ name: '', dob: '', tob: '', pob: '', gender: '', phone: '', email: '', question: '' });
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
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('निःशुल्क कुंडली', 'Free Kundli')}</span></div>
                    <h1>{t('निःशुल्क कुंडली एवं जन्म पत्रिका', 'Free Kundli & Janam Patrika')}</h1>
                    <p className="subtitle">
                        {t('कोई स्वचालित सॉफ्टवेयर नहीं — डॉ. उमंग नाथ शर्मा स्वयं आपकी कुंडली देखेंगे', 'No automated software - Dr. Umang Nath Sharma personally reviews your Kundli')}
                    </p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
                    <div style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {t(
                            '✦ अधिकतर वेबसाइट्स स्वचालित सॉफ्टवेयर से कुंडली बनाती हैं। यहाँ आपकी जन्म-कुंडली को काशी के 400+ वर्ष पुराने ज्योतिष परिवार के डॉ. उमंग नाथ शर्मा स्वयं देखेंगे।',
                            "✦ Most sites generate your Kundli with automated software. Here, your birth chart is personally reviewed by Dr. Umang Nath Sharma, from Kashi's 400+ year astrology lineage."
                        )}
                    </div>

                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,4vw,2rem)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        {status === 'saved' ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🙏</div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{t('धन्यवाद!', 'Thank You!')}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {t('आपका विवरण प्राप्त हो गया है। डॉ. उमंग नाथ शर्मा आपकी कुंडली देखकर 24 घंटों में WhatsApp/कॉल पर सम्पर्क करेंगे।', 'Your details have been received. Dr. Umang Nath Sharma will review your Kundli and contact you on WhatsApp/call within 24 hours.')}
                                </p>
                                <a href="https://wa.me/919278148269" target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ marginTop: '1.25rem' }}>
                                    💬 {t('जल्दी जवाब चाहिए? WhatsApp करें', 'Need it faster? WhatsApp us')}
                                </a>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                {status === 'error' && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--gold-700)', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', marginBottom: '1rem' }}>
                                        {t('अनुरोध भेजा नहीं जा सका। कृपया दोबारा प्रयास करें।', 'Could not send your request. Please try again.')}
                                    </p>
                                )}

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-name">{t('पूरा नाम', 'Full Name')} *</label>
                                    <input
                                        id="kundli-name"
                                        className={`form-input ${errors.name ? 'has-error' : ''}`}
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                                    />
                                    {errors.name && <p className="form-error">⚠ {errors.name}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-dob">{t('जन्म तिथि', 'Date of Birth')} *</label>
                                    <input
                                        id="kundli-dob"
                                        type="date"
                                        className={`form-input ${errors.dob ? 'has-error' : ''}`}
                                        value={form.dob}
                                        onChange={e => { setForm({ ...form, dob: e.target.value }); setErrors({ ...errors, dob: undefined }); }}
                                    />
                                    {errors.dob && <p className="form-error">⚠ {errors.dob}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-tob">{t('जन्म समय (यदि ज्ञात हो)', 'Time of Birth (if known)')}</label>
                                    <input
                                        id="kundli-tob"
                                        type="time"
                                        className="form-input"
                                        value={form.tob}
                                        onChange={e => setForm({ ...form, tob: e.target.value })}
                                    />
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                        {t('सही समय पता न हो तो खाली छोड़ दें।', "Leave blank if you don't know the exact time.")}
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-pob">{t('जन्म स्थान (शहर)', 'Place of Birth (City)')} *</label>
                                    <input
                                        id="kundli-pob"
                                        className={`form-input ${errors.pob ? 'has-error' : ''}`}
                                        placeholder={t('जैसे: वाराणसी, उत्तर प्रदेश', 'e.g. Varanasi, Uttar Pradesh')}
                                        value={form.pob}
                                        onChange={e => { setForm({ ...form, pob: e.target.value }); setErrors({ ...errors, pob: undefined }); }}
                                    />
                                    {errors.pob && <p className="form-error">⚠ {errors.pob}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-gender">{t('लिंग (वैकल्पिक)', 'Gender (optional)')}</label>
                                    <select id="kundli-gender" className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                        <option value="">-- {t('चुनें', 'Select')} --</option>
                                        <option value={t('पुरुष', 'Male')}>{t('पुरुष', 'Male')}</option>
                                        <option value={t('महिला', 'Female')}>{t('महिला', 'Female')}</option>
                                        <option value={t('अन्य', 'Other')}>{t('अन्य', 'Other')}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-phone">{t('मोबाइल नंबर', 'Phone Number')} *</label>
                                    <input
                                        id="kundli-phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        className={`form-input ${errors.phone ? 'has-error' : ''}`}
                                        placeholder="+91 92781 48269"
                                        value={form.phone}
                                        onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: undefined }); }}
                                    />
                                    {errors.phone && <p className="form-error">⚠ {errors.phone}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-email">{t('ईमेल (वैकल्पिक)', 'Email (optional)')}</label>
                                    <input
                                        id="kundli-email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        className="form-input"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="kundli-question">{t('कोई विशेष प्रश्न? (वैकल्पिक)', 'Any specific question? (optional)')}</label>
                                    <textarea
                                        id="kundli-question"
                                        className="form-textarea"
                                        placeholder={t('जैसे: विवाह, करियर, स्वास्थ्य...', 'e.g. marriage, career, health...')}
                                        value={form.question}
                                        onChange={e => setForm({ ...form, question: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'saving'}>
                                    {status === 'saving' ? t('भेजा जा रहा है...', 'Submitting...') : `✦ ${t('मेरी कुंडली भेजें', 'Request My Kundli')}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
