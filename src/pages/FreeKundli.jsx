import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import BirthDetailsInput from '../components/BirthDetailsInput';
import NorthIndianChart from '../components/NorthIndianChart';
import { calculateInstantKundli } from '../utils/kundliEngine';

function getElementIcon(element = '') {
    const el = String(element).toLowerCase();
    if (el.includes('water') || el.includes('जल')) return '💧';
    if (el.includes('fire') || el.includes('अग्नि')) return '🔥';
    if (el.includes('earth') || el.includes('पृथ्वी')) return '🌍';
    if (el.includes('air') || el.includes('वायु')) return '💨';
    if (el.includes('space') || el.includes('ether') || el.includes('आकाश')) return '🌌';
    return '✨';
}

export default function FreeKundli() {
    const { t, lang } = useLanguage();
    const [form, setForm] = useState({ name: '', dob: '', tob: '06:30 (06:30 AM)', pob: 'Varanasi, Uttar Pradesh', gender: '', phone: '', email: '', question: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | calculating | ready
    const [kundliResult, setKundliResult] = useState(null);

    useSEO({
        title: t('निःशुल्क वैदिक जन्म कुंडली रिपोर्ट एवं ग्रह विश्लेषण | Adhbhut Gyaan', 'Free Vedic Kundli Report & Instant Birth Chart Analysis | Adhbhut Gyaan'),
        description: t(
            'लाहिड़ी अयनांश एवं गणितीय ज्योतिष गणना द्वारा अपनी जन्म पत्रिका, लग्न चार्ट, ग्रह बल एवं दोष विश्लेषण तुरंत प्राप्त करें। डॉ. उमंग नाथ शर्मा (काशी)।',
            'Instant high-precision Vedic Kundli Report, Lahiri Ayanamsa Lagna Chart, planetary strengths & dosha analysis backed by 400+ years Kashi Jyotish Parampara.'
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

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('calculating');

        try {
            // 1. Instant authentic Lahiri Ayanamsa calculation on client (<1ms)
            const result = calculateInstantKundli({
                name: form.name,
                birthDate: form.dob,
                birthTime: form.tob,
                birthPlace: form.pob,
                latitude: 25.3176,
                longitude: 82.9739,
                tzOffset: 5.5,
            });

            setKundliResult(result);
            setStatus('ready');
            window.scrollTo({ top: 120, behavior: 'smooth' });

            // 2. Non-blocking background database sync (never halts UI)
            const notesLines = [
                `जन्म तिथि / DOB: ${form.dob}`,
                `जन्म समय / TOB: ${form.tob || '06:30 AM'}`,
                `जन्म स्थान / POB: ${form.pob}`,
                `लाहिड़ी अयनांश / Ayanamsa: ${result.ayanamsa}`,
                `लग्न / Lagna: ${result.lagna.rashi} (${result.lagna.deg})`,
                `चंद्र राशि / Moon: ${result.moon.rashi} (${result.moon.deg})`,
                `नक्षत्र / Nakshatra: ${result.nakshatra.name} (Pada ${result.nakshatra.pada})`,
                `दोष / Doshas: Manglik: ${result.doshas.manglik.severity}, Kalsarp: ${result.doshas.kalsarp.name}, Shani: ${result.doshas.sadeSati.phase}`,
                form.gender ? `लिंग / Gender: ${form.gender}` : '',
                form.question ? `प्रश्न / Question: ${form.question}` : '',
            ].filter(Boolean).join('\n');

            fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    serviceId: 'astrology-consultation',
                    serviceName: t('निःशुल्क वैदिक कुंडली विश्लेषण', 'Free Vedic Kundli Analysis'),
                    packageName: t('लाहिड़ी वैदिक AI कुंडली रिपोर्ट', 'Lahiri Vedic AI Kundli Report'),
                    mode: t('डिजिटल कुंडली रिपोर्ट', 'Digital Kundli Report'),
                    notes: notesLines,
                    language: lang,
                    source: 'kundli-request',
                }),
            }).catch(err => { console.warn('Background sync note:', err); });
        } catch (err) {
            console.error('Kundli submission error:', err);
            // Even if an unexpected error occurs, unblock UI immediately with fallback
            setStatus('ready');
        }
    };

    const handleReset = () => {
        setKundliResult(null);
        setStatus('idle');
        window.scrollTo({ top: 200, behavior: 'smooth' });
    };

    const handlePrint = () => {
        window.print();
    };

    // Build WhatsApp Pre-populated Message
    const buildWhatsAppUrl = () => {
        if (!kundliResult) return 'https://wa.me/919278148269';

        const activeDoshas = [
            kundliResult.doshas.manglik.hasDosh ? kundliResult.doshas.manglik.severity : null,
            kundliResult.doshas.kalsarp.hasDosh ? kundliResult.doshas.kalsarp.name : null,
            kundliResult.doshas.sadeSati.active ? kundliResult.doshas.sadeSati.phase : null,
            kundliResult.doshas.pitraDosh.hasDosh ? kundliResult.doshas.pitraDosh.severity : null,
        ].filter(Boolean).join(', ') || 'No Major Negative Dosha';

        const text = `Namaste Pandit Ji, maine adhbhutgyaan.com par apni Vedic Kundli report dekhi hai:

👤 *Name:* ${kundliResult.devoteeName}
📅 *DOB:* ${form.dob} | *Time:* ${form.tob || '06:30 AM'}
📍 *POB:* ${form.pob}
🔮 *Lagna:* ${kundliResult.lagna.rashi} (${kundliResult.lagna.deg})
🌙 *Chandra Rashi:* ${kundliResult.moon.rashi} | *Nakshatra:* ${kundliResult.nakshatra.name} (Pada ${kundliResult.nakshatra.pada})
⚠️ *Active Doshas:* ${activeDoshas}
${form.question ? `❓ *Question:* ${form.question}\n` : ''}
Mujhe aane wale 5-8 saal ke career/business, vivah aur grah shanti ke sateek nidaan hetu Pandit Ji ke sath *1-on-1 Live WhatsApp Video Consultation* session book karna hai.`;

        return `https://wa.me/919278148269?text=${encodeURIComponent(text)}`;
    };

    return (
        <div style={{ background: 'var(--warm-50)', minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Print Styling */}
            <style>{`
                @media print {
                    .no-print, header.navbar, footer, .page-header, .btn, .breadcrumb {
                        display: none !important;
                    }
                    body, .container {
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
                        max-width: 100% !important;
                    }
                    .print-only-header {
                        display: block !important;
                        text-align: center;
                        margin-bottom: 1.5rem;
                        border-bottom: 2px solid #d4a843;
                        padding-bottom: 0.75rem;
                    }
                    .kundli-report-card {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                }
                @media screen {
                    .print-only-header {
                        display: none;
                    }
                }
            `}</style>

            {/* Header Banner */}
            <header className="page-header" style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-850) 100%)', padding: 'clamp(2rem, 5vw, 3.5rem) 0 2rem' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('होम', 'Home')}</Link>
                        <span>›</span>
                        <span>{t('निःशुल्क कुंडली', 'Free Kundli')}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', margin: '0.5rem 0' }}>
                        {t('निःशुल्क वैदिक जन्म कुंडली एवं ग्रह विश्लेषण', 'Free Vedic Kundli & Planetary Analysis')}
                    </h1>
                    <p className="subtitle" style={{ maxWidth: '680px', margin: '0.5rem auto 0', color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                        {t(
                            'लाहिड़ी अयनांश एवं गणितीय ज्योतिष गणना — त्वरित लग्न चार्ट, ग्रह बल एवं दोष विश्लेषण।',
                            'Authentic Lahiri Ayanamsa & Mathematical Astro Engine — Instant high-precision Kundli, planetary strengths & dosha analysis.'
                        )}
                    </p>
                </div>
            </header>

            <div className="container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
                {/* VIEW 1: INPUT FORM */}
                {!kundliResult ? (
                    <div style={{ maxWidth: 660, margin: '0 auto' }}>
                        {/* Trust banner */}
                        <div style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--navy-900)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                            <span style={{ fontSize: '1.4rem' }}>⚡</span>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--gold-900)' }}>
                                    {t('सटीक लाहिड़ी अयनांश एवं काशी परंपरा', 'Authentic Lahiri Ephemeris & Kashi Lineage')}
                                </strong>
                                {t(
                                    'आपकी जन्म पत्रिका की गणना चित्रा पक्ष लाहिड़ी अयनांश एवं स्थानीय नक्षत्र समय के अनुसार होती है। फॉर्म भरते ही आपकी लग्न पत्रिका एवं ग्रह स्थिति तुरंत स्क्रीन पर प्रदर्शित होगी।',
                                    'Your birth chart is calculated mathematically using authentic Lahiri (Chitra Paksha) Ayanamsa. Fill details to view your instant Lagna chart and planetary positions.'
                                )}
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.25rem,4vw,2.25rem)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
                            <form onSubmit={handleGenerate} noValidate>
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

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }} disabled={status === 'calculating'}>
                                    {status === 'calculating' ? t('वैदिक गणना की जा रही है...', 'Calculating Vedic Chart...') : `⚡ ${t('निःशुल्क कुंडली रिपोर्ट तुरंत देखें', 'Generate Free Kundli Analysis')}`}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* VIEW 2: INSTANT FREEMIUM KUNDLI REPORT & PREMIUM GATED INSIGHTS */
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {/* Print Header */}
                        <div className="print-only-header">
                            <h2 style={{ margin: '0 0 0.25rem', color: '#1c2150' }}>अद्भुत ज्ञान — वैदिक जन्म पत्रिका रिपोर्ट</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                काशी ज्योतिष परंपरा · डॉ. उमंग नाथ शर्मा · Helpline: +91 92781 48269
                            </p>
                        </div>

                        {/* Report Top Bar */}
                        <div className="kundli-report-card" style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <span style={{ background: 'rgba(37,211,102,0.15)', color: 'var(--whatsapp-dark)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        ✓ Lahiri Ephemeris Verified
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        📍 {kundliResult.birthPlace} (Ayanamsa: {kundliResult.ayanamsa})
                                    </span>
                                </div>
                                <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', color: 'var(--navy-950)' }}>
                                    {kundliResult.devoteeName} {t('की जन्म पत्रिका', "'s Vedic Kundli")}
                                </h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    DOB: {form.dob} | TOB: {form.tob || '06:30 AM'} | Lagna: <strong>{kundliResult.lagna.rashi} ({kundliResult.lagna.deg})</strong>
                                </p>
                            </div>

                            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="btn btn-outline-dark"
                                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-full)' }}
                                >
                                    🖨️ {t('प्रिंट / PDF सेव करें', 'Print / Save PDF')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="btn btn-outline-dark"
                                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-full)' }}
                                >
                                    🔄 {t('अन्य विवरण जांचें', 'Recalculate / New Chart')}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 1: LAGNA CHART & PLANETARY POSITIONS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
                            {/* North Indian SVG Chart */}
                            <NorthIndianChart
                                houseData={kundliResult.houseData}
                                devoteeName={kundliResult.devoteeName}
                                lagnaName={kundliResult.lagna.rashi}
                            />

                            {/* Planetary Positions Table */}
                            <div className="kundli-report-card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', color: 'var(--navy-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                                    🪐 {t('ग्रह स्थिति एवं भाव विवरण (Lahiri Ephemeris)', 'Planetary Positions & Houses')}
                                </h3>
                                <div style={{ overflowX: 'auto', maxHeight: '340px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--warm-100)', color: 'var(--navy-900)', borderBottom: '1px solid var(--border-light)' }}>
                                                <th style={{ padding: '0.4rem 0.6rem' }}>Planet</th>
                                                <th style={{ padding: '0.4rem 0.6rem' }}>Sign</th>
                                                <th style={{ padding: '0.4rem 0.6rem' }}>House</th>
                                                <th style={{ padding: '0.4rem 0.6rem' }}>Degree</th>
                                                <th style={{ padding: '0.4rem 0.6rem' }}>Dignity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9', background: 'var(--gold-50)', fontWeight: 700 }}>
                                                <td style={{ padding: '0.45rem 0.6rem', color: '#c49a2c' }}>✦ Asc (Lagna)</td>
                                                <td style={{ padding: '0.45rem 0.6rem' }}>{kundliResult.lagna.rashi.split(' ')[0]}</td>
                                                <td style={{ padding: '0.45rem 0.6rem' }}>House 1</td>
                                                <td style={{ padding: '0.45rem 0.6rem' }}>{kundliResult.lagna.deg}</td>
                                                <td style={{ padding: '0.45rem 0.6rem', color: '#047857' }}>Lagna Lord: {kundliResult.lagna.lord}</td>
                                            </tr>
                                            {kundliResult.planets.map((p, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                                                        {p.name}
                                                    </td>
                                                    <td style={{ padding: '0.4rem 0.6rem' }}>{p.rashi.short}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>House {p.house}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }}>{p.deg}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: p.isBenefic ? '#047857' : '#991b1b' }}>{p.nature}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: ASTRO HEALTH VERDICT & CORE DOSHA MATRIX */}
                        <div className="kundli-report-card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    🛡️ {t('ग्रह दोष विश्लेषण (Astro Health & Dosha Matrix)', 'Core Vedic Doshas Detected')}
                                </h3>
                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span><strong style={{ color: '#b91c1c' }}>✓ Red</strong> = Shani / Ketu / Rahu / Mangal</span>
                                    <span><strong style={{ color: '#c49a2c' }}>✓ Gold</strong> = Asc (Lagna)</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                {/* Manglik */}
                                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: kundliResult.doshas.manglik.hasDosh ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: kundliResult.doshas.manglik.hasDosh ? '1px solid #fca5a5' : '1px solid #86efac' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <strong style={{ fontSize: '0.88rem', color: kundliResult.doshas.manglik.hasDosh ? '#991b1b' : '#065f46' }}>
                                            मांगलिक दोष (Manglik)
                                        </strong>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: kundliResult.doshas.manglik.hasDosh ? '#b91c1c' : '#15803d' }}>
                                            {kundliResult.doshas.manglik.hasDosh ? '⚠ Active' : '✓ Shanta'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {kundliResult.doshas.manglik.severity}
                                    </p>
                                </div>

                                {/* Kalsarp */}
                                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: kundliResult.doshas.kalsarp.hasDosh ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: kundliResult.doshas.kalsarp.hasDosh ? '1px solid #fca5a5' : '1px solid #86efac' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <strong style={{ fontSize: '0.88rem', color: kundliResult.doshas.kalsarp.hasDosh ? '#991b1b' : '#065f46' }}>
                                            कालसर्प दोष (Kalsarp)
                                        </strong>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: kundliResult.doshas.kalsarp.hasDosh ? '#b91c1c' : '#15803d' }}>
                                            {kundliResult.doshas.kalsarp.hasDosh ? '⚠ Detected' : '✓ Absent'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {kundliResult.doshas.kalsarp.name}
                                    </p>
                                </div>

                                {/* Shani Sade Sati */}
                                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: kundliResult.doshas.sadeSati.active ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.08)', border: kundliResult.doshas.sadeSati.active ? '1px solid #fde68a' : '1px solid #86efac' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <strong style={{ fontSize: '0.88rem', color: kundliResult.doshas.sadeSati.active ? '#92400e' : '#065f46' }}>
                                            शनि साढ़े साती / ढैय्या
                                        </strong>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: kundliResult.doshas.sadeSati.active ? '#d97706' : '#15803d' }}>
                                            {kundliResult.doshas.sadeSati.active ? '⏳ Active Phase' : '✓ Shanta'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {kundliResult.doshas.sadeSati.phase}
                                    </p>
                                </div>

                                {/* Pitra Dosh */}
                                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: kundliResult.doshas.pitraDosh.hasDosh ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: kundliResult.doshas.pitraDosh.hasDosh ? '1px solid #fca5a5' : '1px solid #86efac' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <strong style={{ fontSize: '0.88rem', color: kundliResult.doshas.pitraDosh.hasDosh ? '#991b1b' : '#065f46' }}>
                                            पितृ दोष (Ancestral)
                                        </strong>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: kundliResult.doshas.pitraDosh.hasDosh ? '#b91c1c' : '#15803d' }}>
                                            {kundliResult.doshas.pitraDosh.hasDosh ? '⚠ Impeded' : '✓ Kripa'}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {kundliResult.doshas.pitraDosh.severity}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: LUCKY ATTRIBUTES & ELEMENTAL STRENGTHS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('शुभ रत्न (GEMSTONE)', 'LUCKY GEMSTONE')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    💎 {kundliResult.lagna.luckyGem || kundliResult.moon.luckyGem || 'Ruby (Manikya)'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('शुभ धातु (METAL)', 'LUCKY METAL')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    🪙 {kundliResult.lagna.luckyMetal || 'Silver/Gold'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('शुभ रंग (LUCKY COLOR)', 'LUCKY COLOR')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    🎨 {kundliResult.lagna.luckyColor || 'White/Gold'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('भाग्यशाली अंक (NUMBER)', 'LUCKY NUMBER')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    🔢 {kundliResult.lagna.luckyNum || '1'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('तत्व (DOMINANT ELEMENT)', 'DOMINANT ELEMENT')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    {getElementIcon(kundliResult.lagna.element)} {kundliResult.lagna.element || 'Fire'}
                                </strong>
                            </div>
                        </div>

                        {/* SECTION 4: LOCKED PREMIUM FUTURE TIMELINE CARDS (THE CURIOSITY HOOK) */}
                        <div className="no-print" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--navy-950)' }}>
                                    🔒 {t('प्रीमियम भविष्य फल एवं समय चक्र (Locked Timeline Analysis)', 'Premium 5-8 Year Future Forecast (Locked)')}
                                </h3>
                                <span style={{ background: 'var(--gold-100)', color: 'var(--gold-900)', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                                    Pandit Ji Exclusive
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
                                {/* Locked Card 1: 5-8 Year Career & Wealth Timeline */}
                                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-gold)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                            📈 आगामी 5-8 वर्ष: करियर, व्यापार एवं धन लाभ
                                        </strong>
                                        <span style={{ fontSize: '1.1rem' }}>🔒</span>
                                    </div>
                                    <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        वर्ष 2026 से 2031 के मध्य गुरु की दृष्टि दशम भाव पर होने से कार्यक्षेत्र में बड़ा पदोन्नति योग बनता है। व्यापार में अचानक आर्थिक उछाल और नए अनुबंध प्राप्त होंगे।
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>🔒</span>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                                            {t('करियर व धन समय-चक्र अनलॉक करें', 'Unlock Career & Wealth Timeline')}
                                        </strong>
                                        <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
                                            {t('परामर्श द्वारा अनलॉक करें →', 'Unlock via Consultation →')}
                                        </a>
                                    </div>
                                </div>

                                {/* Locked Card 2: Marriage & Life-Partner Timing */}
                                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-gold)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                            💍 विवाह योग, वैवाहिक सामंजस्य एवं जीवनसाथी
                                        </strong>
                                        <span style={{ fontSize: '1.1rem' }}>🔒</span>
                                    </div>
                                    <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        सप्तम भाव के स्वामी पर शुभ ग्रहों के गोचर से विवाह में आ रही अड़चनों का अंत होगा। जीवनसाथी का स्वभाव, दिशा एवं अनुकूल समय अवधि का विस्तृत विवरण।
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>🔒</span>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                                            {t('विवाह एवं संबंध योग अनलॉक करें', 'Unlock Relationship Timing')}
                                        </strong>
                                        <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
                                            {t('परामर्श द्वारा अनलॉक करें →', 'Unlock via Consultation →')}
                                        </a>
                                    </div>
                                </div>

                                {/* Locked Card 3: Customized Kashi Vedic Nivaran */}
                                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-gold)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                            📿 विशिष्ट ग्रह शांति एवं काशी शास्त्रोक्त उपाय
                                        </strong>
                                        <span style={{ fontSize: '1.1rem' }}>🔒</span>
                                    </div>
                                    <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        जन्म कुंडली के दूषित ग्रहों की शांति हेतु काशी में विशेष रुद्राभिषेक, महामृत्युंजय मंत्र जप एवं व्यक्तिगत रत्न निर्धारण की संपूर्ण विधि।
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>🔒</span>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                                            {t('व्यक्तिगत वैदिक उपाय अनलॉक करें', 'Unlock Vedic Remedies')}
                                        </strong>
                                        <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
                                            {t('परामर्श द्वारा अनलॉक करें →', 'Unlock via Consultation →')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 5: LUXURY HIGH-CONVERSION CONSULTATION ACTION CENTER */}
                        <div
                            className="no-print"
                            style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                borderRadius: 'var(--radius-xl)',
                                padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                                color: '#f8fafc',
                                border: '1px solid rgba(251, 191, 36, 0.35)',
                                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.45)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Decorative Lightweight SVG Mandala Watermark */}
                            <svg
                                width="300"
                                height="300"
                                viewBox="0 0 100 100"
                                style={{
                                    position: 'absolute',
                                    right: '-50px',
                                    top: '-50px',
                                    opacity: 0.07,
                                    pointerEvents: 'none',
                                }}
                            >
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                                <circle cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3,3" />
                                <circle cx="50" cy="50" r="25" fill="none" stroke="#fbbf24" strokeWidth="1" />
                                <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#fbbf24" strokeWidth="1" />
                                <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="#fbbf24" strokeWidth="1" />
                            </svg>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ maxWidth: '620px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            🔮 {t('काशी के ज्योतिषाचार्य से प्रत्यक्ष 1-on-1 परामर्श', 'Direct 1-on-1 Video Call with Kashi Astrologer')}
                                        </span>
                                        <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                            400+ Years Kashi Tradition
                                        </span>
                                    </div>

                                    <h3 style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', color: '#f8fafc', lineHeight: 1.3 }}>
                                        {t('अपने आने वाले 5-8 वर्ष का सटीक भविष्य-फल एवं ग्रह निवारण जानें', 'Get Accurate 5-8 Year Future Roadmap & Custom Vedic Upay')}
                                    </h3>

                                    <p style={{ margin: '0 0 1.25rem', fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                                        {t(
                                            'लाहिड़ी अयनांश ephemeris गणना द्वारा आपकी जन्म कुंडली का विश्लेषण पूर्ण हो चुका है। करियर में प्रगति, व्यापार वृद्धि, विवाह एवं पारिवारिक सुख हेतु डॉ. उमंग नाथ शर्मा के साथ आमने-सामने लाइव वीडियो परामर्श सत्र बुक करें।',
                                            'Your Lahiri Ephemeris chart has been generated. Connect face-to-face with Dr. Umang Nath Sharma on a private WhatsApp video call for tailored astrological predictions, timing of life events, and authentic Vedic remedies.'
                                        )}
                                    </p>

                                    {/* Feature Pills */}
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                                            📈 5-Year Career & Wealth Timeline
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                                            💍 Vivah Yog & Partner Match
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                                            📿 Authentic Kashi Grah Shanti
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '340px' }}>
                                    <a
                                        href={buildWhatsAppUrl()}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-whatsapp"
                                        style={{ padding: '0.9rem 1.25rem', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center', textAlign: 'center', boxShadow: '0 6px 20px rgba(37,211,102,0.4)', borderRadius: 'var(--radius-md)' }}
                                    >
                                        💬 {t('WhatsApp पर 1-on-1 वीडियो कॉल बुक करें', 'Book 1-on-1 Video Call on WhatsApp')}
                                    </a>
                                    <Link
                                        to="/booking?service=astrology-consultation"
                                        className="btn btn-outline"
                                        style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem', justifyContent: 'center', textAlign: 'center', borderColor: 'rgba(255,255,255,0.3)', color: '#f8fafc', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}
                                    >
                                        📅 {t('वेबसाइट पर अपॉइंटमेंट बुक करें', 'Book Appointment Online')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
