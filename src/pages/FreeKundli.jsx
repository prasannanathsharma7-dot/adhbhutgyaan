import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import BirthDetailsInput from '../components/BirthDetailsInput';

export default function FreeKundli() {
    const { t, lang } = useLanguage();
    const [form, setForm] = useState({ name: '', dob: '', tob: '06:00 (06:00 AM)', pob: '', gender: '', phone: '', email: '', question: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | saving | saved | error

    useSEO({
        title: t('निःशुल्क जन्म कुंडली — उन्नत वैदिक AI एवं काशी ज्योतिषाचार्य | Adhbhut Gyaan', 'Free Janam Kundli — Advanced Vedic AI & Kashi Jyotish Engine | Adhbhut Gyaan'),
        description: t(
            'उन्नत वैदिक AI एवं गणितीय ज्योतिष इंजन द्वारा अपनी जन्म पत्रिका, ग्रह बल एवं दोष विश्लेषण तुरंत प्राप्त करें। डॉ. उमंग नाथ शर्मा (काशी) द्वारा प्रामाणिक समीक्षा।',
            'Advanced Vedic AI & Mathematical Astro Engine — Instant high-precision Kundli, planetary strengths & dosha analysis backed by 400+ years Kashi Jyotish Parampara.'
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
        if (!form.dob.trim()) next.dob = t('कृपया मान्य जन्म तिथि दर्ज करें (दिन, माह, वर्ष)', 'Please enter your valid date of birth (Day, Month, Year)');
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
            `जन्म समय / TOB: ${form.tob || '06:00 AM (Sunrise default)'}`,
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
                    serviceName: t('निःशुल्क वैदिक कुंडली विश्लेषण', 'Free Vedic Kundli Analysis'),
                    packageName: t('उन्नत वैदिक AI कुंडली', 'Vedic AI Kundli'),
                    mode: t('डिजिटल कुंडली', 'Digital Kundli'),
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
            <header className="page-header" style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-850) 100%)' }}>
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('निःशुल्क कुंडली', 'Free Kundli')}</span></div>
                    <h1>{t('निःशुल्क वैदिक जन्म कुंडली एवं ग्रह विश्लेषण', 'Free Vedic Kundli & Planetary Analysis')}</h1>
                    <p className="subtitle" style={{ maxWidth: '680px', margin: '0.5rem auto 0', color: 'rgba(255,255,255,0.85)' }}>
                        {t(
                            'उन्नत वैदिक AI एवं गणितीय ज्योतिष इंजन — त्वरित एवं सटीक लग्न, चंद्र राशि, नक्षत्र एवं दोष विश्लेषण (कालसर्प, मांगलिक, पितृ दोष, शनि साढ़े साती)।',
                            'Advanced Vedic AI & Mathematical Astro Engine — Instant high-precision Kundli, planetary strengths & dosha analysis backed by 400+ years Kashi tradition.'
                        )}
                    </p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
                    {/* Trust banner */}
                    <div style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--navy-900)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.4rem' }}>⚡</span>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--gold-900)' }}>
                                {t('सटीक वैदिक गणना एवं काशी परंपरा', 'Precision Vedic Ephemeris & Kashi Lineage')}
                            </strong>
                            {t(
                                'आपकी जन्म पत्रिका की गणना वैदिक पंचांग एवं गणितीय सूत्रों के अनुसार होती है, जिसे डॉ. उमंग नाथ शर्मा की टीम द्वारा प्रमाणित किया जाता है।',
                                'Your birth chart is calculated with mathematical Vedic ephemeris algorithms and reviewed by Dr. Umang Nath Sharma’s Kashi Vedic team.'
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,4vw,2rem)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        {status === 'saved' ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🙏</div>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--navy-900)' }}>{t('कुंडली विवरण सफलतापूर्वक प्राप्त हुआ!', 'Kundli Details Received!')}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                                    {t('हमारा वैदिक इंजन आपकी जन्म पत्रिका का विश्लेषण तैयार कर रहा है। डॉ. उमंग नाथ शर्मा की टीम शीघ्र ही WhatsApp पर आपकी कुंडली रिपोर्ट साझा करेगी।', 'Our Vedic Astro Engine is processing your birth chart. Dr. Umang Nath Sharma’s team will share your Kundli summary on WhatsApp shortly.')}
                                </p>
                                <a href="https://wa.me/919278148269" target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ marginTop: '1.25rem', padding: '0.65rem 1.5rem' }}>
                                    💬 {t('तुरंत WhatsApp पर बात करें', 'Connect on WhatsApp Now')}
                                </a>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                {status === 'error' && (
                                    <p style={{ fontSize: '0.85rem', color: '#b91c1c', background: '#fee2e2', border: '1px solid #f87171', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', marginBottom: '1rem' }}>
                                        {t('अनुरोध भेजा नहीं जा सका। कृपया दोबारा प्रयास करें।', 'Could not send your request. Please try again.')}
                                    </p>
                                )}

                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" htmlFor="kundli-name">{t('पूरा नाम (Full Name)', 'Full Name')} *</label>
                                    <input
                                        id="kundli-name"
                                        className={`form-input ${errors.name ? 'has-error' : ''}`}
                                        autoComplete="name"
                                        placeholder={t('जैसे: राहुल शर्मा', 'e.g. Rahul Sharma')}
                                        value={form.name}
                                        onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                                    />
                                    {errors.name && <p className="form-error">⚠ {errors.name}</p>}
                                </div>

                                {/* Friction-free DOB / TOB Direct Selectors */}
                                <BirthDetailsInput
                                    dobValue={form.dob}
                                    tobValue={form.tob}
                                    onDobChange={newDob => { setForm(prev => ({ ...prev, dob: newDob })); setErrors(prev => ({ ...prev, dob: undefined })); }}
                                    onTobChange={newTob => setForm(prev => ({ ...prev, tob: newTob }))}
                                    errors={errors}
                                    showTime={true}
                                    required={true}
                                />

                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" htmlFor="kundli-pob">{t('जन्म स्थान — शहर, राज्य (Place of Birth)', 'Place of Birth (City, State)')} *</label>
                                    <input
                                        id="kundli-pob"
                                        className={`form-input ${errors.pob ? 'has-error' : ''}`}
                                        placeholder={t('जैसे: वाराणसी, उत्तर प्रदेश', 'e.g. Varanasi, Uttar Pradesh')}
                                        value={form.pob}
                                        onChange={e => { setForm({ ...form, pob: e.target.value }); setErrors({ ...errors, pob: undefined }); }}
                                    />
                                    {errors.pob && <p className="form-error">⚠ {errors.pob}</p>}
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" htmlFor="kundli-gender">{t('लिंग (Gender)', 'Gender')}</label>
                                    <select id="kundli-gender" className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                        <option value="">-- {t('चुनें / Select', 'Select')} --</option>
                                        <option value={t('पुरुष', 'Male')}>{t('पुरुष', 'Male')}</option>
                                        <option value={t('महिला', 'Female')}>{t('महिला', 'Female')}</option>
                                        <option value={t('अन्य', 'Other')}>{t('अन्य', 'Other')}</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" htmlFor="kundli-phone">{t('मोबाइल नंबर (WhatsApp Number)', 'Mobile / WhatsApp Number')} *</label>
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

                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" htmlFor="kundli-email">{t('ईमेल (Email Address)', 'Email Address (Optional)')}</label>
                                    <input
                                        id="kundli-email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        className="form-input"
                                        placeholder="devotee@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label" htmlFor="kundli-question">{t('मुख्य प्रश्न अथवा समस्या (Career, Marriage, Health)', 'Primary Concern / Question')}</label>
                                    <textarea
                                        id="kundli-question"
                                        className="form-input"
                                        rows={3}
                                        placeholder={t('जैसे: व्यापार में रुकावट, विवाह में देरी, कालसर्प या मांगलिक दोष की शंका...', 'e.g. career growth, marriage timing, Sade Sati, or dosha remedies...')}
                                        value={form.question}
                                        onChange={e => setForm({ ...form, question: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }} disabled={status === 'saving'}>
                                    {status === 'saving' ? t('वैदिक गणना की जा रही है...', 'Calculating Vedic Chart...') : `⚡ ${t('निःशुल्क कुंडली विश्लेषण प्राप्त करें', 'Generate Free Kundli Analysis')}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
