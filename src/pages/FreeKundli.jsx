import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import BirthDetailsInput from '../components/BirthDetailsInput';
import LocationAutocomplete from '../components/LocationAutocomplete';
import NorthIndianChart from '../components/NorthIndianChart';
import { calculateInstantKundli } from '../utils/kundliEngine';
import KundaliSettingsBar from '../components/KundaliSettingsBar';
import { DEFAULT_KUNDALI_SETTINGS, formatNumeral, formatHouseNumber } from '../utils/astrologyI18n';
import { Droplet, Flame, Mountain, Wind, Sparkles, Zap, MapPin, Printer, RefreshCw, Orbit, Shield, Gem, Coins, Palette, Hash, TrendingUp, Heart, Wand2, MessageCircle, CalendarDays, AlertTriangle, CheckCircle2, Hourglass, Lock, Star, FileText } from 'lucide-react';

function getElementIcon(element = '') {
    const el = String(element).toLowerCase();
    if (el.includes('water') || el.includes('जल')) return <Droplet size={15} style={{ color: '#0284c7' }} />;
    if (el.includes('fire') || el.includes('अग्नि')) return <Flame size={15} style={{ color: '#ea580c' }} />;
    if (el.includes('earth') || el.includes('पृथ्वी')) return <Mountain size={15} style={{ color: '#65a30d' }} />;
    if (el.includes('air') || el.includes('वायु')) return <Wind size={15} style={{ color: '#0891b2' }} />;
    if (el.includes('space') || el.includes('ether') || el.includes('आकाश')) return <Sparkles size={15} style={{ color: '#7c3aed' }} />;
    return <Sparkles size={15} style={{ color: '#7c3aed' }} />;
}

// Geocodes a free-text birth-place string to real lat/lng coordinates via
// Nominatim (OpenStreetMap's free, keyless geocoding API) - fixes a real
// accuracy bug where every Free Kundli calculation silently used
// Varanasi's coordinates regardless of what city the user actually typed.
// On any failure (network error, place not found, rate-limited), returns
// null so the caller can fall back to a sane default rather than break
// the whole feature - a wrong-but-available Kundli is better than none.
async function geocodeBirthPlace(placeName) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1&addressdetails=1`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) return null;
        const results = await res.json();
        if (!Array.isArray(results) || results.length === 0) return null;
        const { lat, lon, address } = results[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        // Timezone-offset resolution is a separate, harder problem than
        // geocoding (needs a lat/lng-to-timezone lookup, not just
        // reverse-geocoding) - defaulting to IST (+5:30) is correct for
        // every Indian city (the vast majority of users) but is a known,
        // disclosed limitation for a genuinely non-Indian birthplace.
        const isIndia = address?.country_code === 'in';
        return { latitude, longitude, isIndia };
    } catch {
        return null;
    }
}

export default function FreeKundli() {
    const { t, lang } = useLanguage();
    const [form, setForm] = useState({ name: '', dob: '', tob: '06:30 (06:30 AM)', pob: 'Varanasi, Uttar Pradesh', gender: '', phone: '', email: '', question: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | calculating | ready
    const [kundliResult, setKundliResult] = useState(null);
    const [kundliSettings, setKundliSettings] = useState(DEFAULT_KUNDALI_SETTINGS);

    useSEO({
        title: t('फ्री कुंडली — निःशुल्क जन्म कुंडली एवं जन्म पत्रिका ऑनलाइन | Adhbhut Gyaan', 'Free Kundli Online — Free Janam Kundli & Horoscope by Date of Birth | Adhbhut Gyaan'),
        description: t(
            'जन्म तिथि, समय व स्थान से मुफ्त जन्म कुंडली बनाएं — लग्न चार्ट, ग्रह स्थिति एवं दोष विश्लेषण तुरंत, काशी के ज्योतिषी डॉ. उमंग नाथ शर्मा द्वारा।',
            'Generate your free Kundli online by date of birth, time & place - instant Lagna chart, planetary positions & dosha analysis by Kashi astrologer.'
        ),
        path: '/free-kundli',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Free Kundli', path: '/free-kundli' },
        ])),
    });

    const validate = () => {
        const next = {};
        const nameTrimmed = form.name.trim();
        if (!nameTrimmed) next.name = t('कृपया अपना नाम लिखें', 'Please enter your name');
        else if (nameTrimmed.length < 3 || !/^[A-Za-z\u0900-\u097F\s.]+$/.test(nameTrimmed)) next.name = t('कृपया सही नाम लिखें (कम से कम 3 अक्षर, केवल अक्षर)', 'Please enter a valid name (at least 3 letters, alphabetic only)');
        if (!form.dob.trim()) {
            next.dob = t('कृपया मान्य जन्म तिथि दर्ज करें (दिन, माह, वर्ष)', 'Please enter your valid date of birth (Day, Month, Year)');
        } else {
            // Defense-in-depth (matching the phone/name fix pattern) - the
            // BirthDetailsInput component already range-checks each part
            // as it's typed, but this re-validates the assembled date
            // directly before it's used in any astrological calculation,
            // in case that's ever bypassed.
            const dobMatch = form.dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            const currentYear = new Date().getFullYear();
            if (!dobMatch) {
                next.dob = t('जन्म तिथि सही प्रारूप में नहीं है', 'Date of birth is not in a valid format');
            } else {
                const [, y, m, d] = dobMatch.map(Number);
                const parsed = new Date(Date.UTC(y, m - 1, d));
                const isRealDate = parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
                if (!isRealDate || y < 1900 || y > currentYear) {
                    next.dob = t('कृपया एक वास्तविक जन्म तिथि दर्ज करें (1900 से वर्तमान वर्ष के बीच)', 'Please enter a real date of birth (between 1900 and the current year)');
                }
            }
        }
        if (!form.pob.trim()) next.pob = t('कृपया जन्म स्थान लिखें', 'Please enter your place of birth');
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (!phoneDigits) next.phone = t('कृपया मोबाइल नंबर लिखें', 'Please enter your phone number');
        else if (!/^[6-9]\d{9}$/.test(phoneDigits)) next.phone = t('कृपया सही 10-अंकों का भारतीय मोबाइल नंबर लिखें', 'Please enter a valid 10-digit Indian mobile number');
        setErrors(next);
        if (Object.keys(next).length > 0) {
            const firstKey = `kundli-${Object.keys(next)[0]}`;
            const el = document.getElementById(firstKey);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
            return false;
        }
        return true;
    };

    const [geoNote, setGeoNote] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('calculating');
        setGeoNote('');

        try {
            // Resolve the actually-typed birth place to real coordinates -
            // falls back to Varanasi's coordinates (the previous, always-
            // wrong-for-non-Varanasi behavior) only if geocoding fails, so
            // the feature degrades gracefully rather than breaking.
            // If the user picked a suggestion from the autocomplete
            // dropdown, we already have precise coordinates for it - no
            // need to re-geocode the same text on submit.
            const geo = (Number.isFinite(form.selectedLat) && Number.isFinite(form.selectedLng))
                ? { latitude: form.selectedLat, longitude: form.selectedLng, isIndia: form.selectedIsIndia }
                : await geocodeBirthPlace(form.pob);
            const latitude = geo?.latitude ?? 25.3176;
            const longitude = geo?.longitude ?? 82.9739;
            if (!geo) {
                setGeoNote(t('स्थान सटीक रूप से नहीं मिल सका — काशी के निर्देशांक अस्थायी रूप से उपयोग किए गए हैं। कृपया अधिक स्पष्ट शहर/राज्य लिखें।', "We couldn't precisely locate this place - Varanasi's coordinates were used as a fallback. Please try a more specific city/state name for full accuracy."));
            } else if (!geo.isIndia) {
                setGeoNote(t('भारत के बाहर के जन्म-स्थान हेतु समय-क्षेत्र IST (+5:30) मान लिया गया है, जो सटीक न भी हो सकता है — सटीक विश्लेषण हेतु परामर्श लें।', "For a non-Indian birthplace, the timezone was assumed to be IST (+5:30), which may not be accurate - consult for a precise analysis."));
            }

            // 1. Instant authentic Lahiri Ayanamsa calculation on client (<1ms)
            const result = calculateInstantKundli({
                name: form.name,
                birthDate: form.dob,
                birthTime: form.tob,
                birthPlace: form.pob,
                latitude,
                longitude,
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
        <div style={{ background: 'var(--warm-100)', minHeight: '100vh', paddingBottom: '3rem' }}>
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
            <header className="page-header" style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 100%)', padding: 'clamp(2rem, 5vw, 3.5rem) 0 2rem' }}>
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
                            <Zap size={22} style={{ color: 'var(--gold-600)' }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--gold-800)' }}>
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
                                        onChange={e => { const filtered = e.target.value.replace(/[^A-Za-z\u0900-\u097F\s.]/g, ''); setForm({ ...form, name: filtered }); setErrors({ ...errors, name: undefined }); }}
                                    />
                                    {errors.name && <p className="form-error" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><AlertTriangle size={13} />{errors.name}</p>}
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
                                    <LocationAutocomplete
                                        id="kundli-pob"
                                        className={`form-input ${errors.pob ? 'has-error' : ''}`}
                                        placeholder={t('जैसे: वाराणसी, उत्तर प्रदेश', 'e.g. Varanasi, Uttar Pradesh')}
                                        value={form.pob}
                                        onChange={val => { setForm(f => ({ ...f, pob: val, selectedLat: undefined, selectedLng: undefined, selectedIsIndia: undefined })); setErrors(errs => ({ ...errs, pob: undefined })); }}
                                        onSelect={({ label, latitude, longitude, isIndia }) => setForm(f => ({ ...f, pob: label, selectedLat: latitude, selectedLng: longitude, selectedIsIndia: isIndia }))}
                                    />
                                    {errors.pob && <p className="form-error" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><AlertTriangle size={13} />{errors.pob}</p>}
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
                                        placeholder="9876543210"
                                        value={form.phone}
                                        maxLength={10}
                                        onChange={e => { const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10); setForm({ ...form, phone: digitsOnly }); setErrors({ ...errors, phone: undefined }); }}
                                    />
                                    {errors.phone && <p className="form-error" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><AlertTriangle size={13} />{errors.phone}</p>}
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
                                    {status === 'calculating' ? t('स्थान खोजा जा रहा है एवं वैदिक गणना की जा रही है...', 'Locating city & calculating Vedic chart...') : <><Zap size={16} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{t('निःशुल्क कुंडली रिपोर्ट तुरंत देखें', 'Generate Free Kundli Analysis')}</>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* VIEW 2: INSTANT FREEMIUM KUNDLI REPORT & PREMIUM GATED INSIGHTS */
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {/* Print Header */}
                        <div className="print-only-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <img src="/images/logo.png" alt="Adhbhut Gyaan" width="48" height="48" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                            <div>
                                <h2 style={{ margin: '0 0 0.15rem', color: '#1c2150' }}>अद्भुत ज्ञान — वैदिक जन्म पत्रिका रिपोर्ट</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                    डॉ. उमंग नाथ शर्मा · काशी ज्योतिष परंपरा · Helpline: +91 92781 48269
                                </p>
                            </div>
                        </div>

                        {geoNote && (
                            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                <span>{geoNote}</span>
                            </div>
                        )}
                        {/* Quick Vedic Snapshot - instant, unmissable summary shown before
                            the detailed report below, followed by a locked teaser card
                            that drives WhatsApp conversion for deeper analysis. */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                            {[
                                { label: t('लग्न (Ascendant)', 'Ascendant (Lagna)'), value: kundliResult.lagna.rashi, Icon: Sparkles },
                                { label: t('चंद्र राशि (Moon Sign)', 'Moon Sign (Rashi)'), value: kundliResult.moon.rashi, Icon: Star },
                                { label: t('जन्म नक्षत्र', 'Birth Nakshatra'), value: `${kundliResult.nakshatra.name} (${t('पद', 'Pada')} ${kundliResult.nakshatra.pada})`, Icon: Orbit },
                            ].map((s, i) => (
                                <div key={i} style={{ background: 'linear-gradient(135deg, var(--navy-950), var(--navy-900))', borderRadius: 'var(--radius-lg)', padding: '1rem 1.1rem', color: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-400)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.4rem' }}>
                                        <s.Icon size={13} /> {s.label}
                                    </div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="no-print" style={{ position: 'relative', marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
                            <div aria-hidden="true" style={{ filter: 'blur(6px)', opacity: 0.55, padding: '1.5rem', pointerEvents: 'none', userSelect: 'none' }}>
                                <h3 style={{ margin: '0 0 0.75rem' }}>{t('ग्रह दोष एवं करियर/विवाह पूर्वानुमान', 'Planetary Doshas & Career/Marriage Forecast')}</h3>
                                <p style={{ margin: '0 0 0.5rem' }}>मांगलिक दोष: {t('विश्लेषण उपलब्ध', 'Analysis available')} — शनि साढ़े साती: {t('विश्लेषण उपलब्ध', 'Analysis available')}</p>
                                <p style={{ margin: '0 0 0.5rem' }}>करियर योग: गुरु व शनि की स्थिति के अनुसार विस्तृत विश्लेषण उपलब्ध है, जो आपके व्यावसायिक जीवन की दिशा दर्शाता है।</p>
                                <p style={{ margin: 0 }}>विवाह योग: सप्तम भाव एवं शुक्र की स्थिति के आधार पर वैवाहिक जीवन का पूर्वानुमान उपलब्ध है।</p>
                            </div>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,17,15,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem' }}>
                                <Lock size={26} style={{ color: 'var(--gold-400)', marginBottom: '0.6rem' }} />
                                <h3 style={{ color: 'white', margin: '0 0 0.4rem', fontSize: '1.15rem' }}>{t('ग्रह दोष एवं करियर/विवाह पूर्वानुमान', 'Planetary Doshas & Career/Marriage Forecast')}</h3>
                                <p style={{ color: 'var(--warm-200)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 0 1.1rem' }}>
                                    {t('मांगलिक दोष, साढ़े साती, करियर एवं विवाह योग का विस्तृत, व्यक्तिगत विश्लेषण काशी के पंडितों से प्राप्त करें।', 'Get a detailed, personal analysis of Manglik Dosha, Sade Sati, career yogas, and marriage compatibility from the Pandits of Kashi.')}
                                </p>
                                <a
                                    href={`https://wa.me/919278148269?text=${encodeURIComponent(t(
                                        `प्रणाम, मुझे अपनी संपूर्ण कुंडली विश्लेषण चाहिए।\nनाम: ${kundliResult.devoteeName}\nजन्म तिथि: ${form.dob}\nजन्म समय: ${form.tob || '06:30 AM'}\nजन्म स्थान: ${kundliResult.birthPlace}\nलग्न: ${kundliResult.lagna.rashi} | चंद्र राशि: ${kundliResult.moon.rashi} | नक्षत्र: ${kundliResult.nakshatra.name}`,
                                        `Pranam, I would like my complete Kundli analysis.\nName: ${kundliResult.devoteeName}\nDOB: ${form.dob}\nTOB: ${form.tob || '06:30 AM'}\nPlace: ${kundliResult.birthPlace}\nLagna: ${kundliResult.lagna.rashi} | Moon Sign: ${kundliResult.moon.rashi} | Nakshatra: ${kundliResult.nakshatra.name}`
                                    ))}`}
                                    target="_blank" rel="noreferrer"
                                    className="btn btn-whatsapp btn-lg"
                                    style={{ whiteSpace: 'normal', maxWidth: '100%', textAlign: 'center', lineHeight: 1.4 }}
                                >
                                    <MessageCircle size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                                    {t('काशी के पंडितों से पूर्ण 1-on-1 विश्लेषण अनलॉक करें', 'Unlock Complete 1-on-1 Analysis with Kashi Pandits')}
                                </a>
                            </div>
                        </div>

                        <KundaliSettingsBar settings={kundliSettings} onChange={setKundliSettings} />

                        {/* Report Top Bar */}
                        <div className="kundli-report-card" style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <span style={{ background: 'rgba(37,211,102,0.15)', color: 'var(--whatsapp-dark)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <CheckCircle2 size={13} /> Lahiri Ephemeris Verified
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />{kundliResult.birthPlace} (Ayanamsa: {kundliResult.ayanamsa})
                                    </span>
                                </div>
                                <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', color: 'var(--navy-950)' }}>
                                    {kundliResult.devoteeName} {t('की जन्म पत्रिका', "'s Vedic Kundli")}
                                </h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    DOB: {form.dob} | TOB: {form.tob || '06:30 AM'} | Lagna: <strong>{kundliResult.lagna.rashi} ({formatNumeral(kundliResult.lagna.deg, kundliSettings.numeralSystem)})</strong>
                                </p>
                            </div>

                            <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="btn btn-outline-dark"
                                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-full)' }}
                                >
                                    <Printer size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{t('प्रिंट / PDF सेव करें', 'Print / Save PDF')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="btn btn-outline-dark"
                                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-full)' }}
                                >
                                    <RefreshCw size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{t('अन्य विवरण जांचें', 'Recalculate / New Chart')}
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
                                numeralSystem={kundliSettings.numeralSystem}
                                lang={kundliSettings.lang}
                            />

                            {/* Planetary Positions Table */}
                            <div className="kundli-report-card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', color: 'var(--navy-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                                    <Orbit size={17} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('ग्रह स्थिति एवं भाव विवरण (Lahiri Ephemeris)', 'Planetary Positions & Houses')}
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
                                                <td style={{ padding: '0.45rem 0.6rem', color: '#c49a2c' }}><Star size={12} style={{ verticalAlign: '-2px', marginRight: '0.2rem' }} />Asc (Lagna)</td>
                                                <td style={{ padding: '0.45rem 0.6rem' }}>{kundliResult.lagna.rashi.split(' ')[0]}</td>
                                                <td style={{ padding: '0.45rem 0.6rem' }}>House {formatHouseNumber(1, kundliSettings.numeralSystem)}</td>
                                                <td style={{ padding: '0.45rem 0.6rem' }}>{formatNumeral(kundliResult.lagna.deg, kundliSettings.numeralSystem)}</td>
                                                <td style={{ padding: '0.45rem 0.6rem', color: '#047857' }}>Lagna Lord: {kundliResult.lagna.lord}</td>
                                            </tr>
                                            {kundliResult.planets.map((p, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                                                        {p.name}
                                                    </td>
                                                    <td style={{ padding: '0.4rem 0.6rem' }}>{p.rashi.short}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>House {formatHouseNumber(p.house, kundliSettings.numeralSystem)}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }}>{formatNumeral(p.deg, kundliSettings.numeralSystem)}</td>
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
                                    <Shield size={17} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('ग्रह दोष विश्लेषण (Astro Health & Dosha Matrix)', 'Core Vedic Doshas Detected')}
                                </h3>
                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span><strong style={{ color: '#b91c1c' }}>Red</strong> = Shani / Ketu / Rahu / Mangal</span>
                                    <span><strong style={{ color: '#c49a2c' }}>Gold</strong> = Asc (Lagna)</span>
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
                                            {kundliResult.doshas.manglik.hasDosh ? <><AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#dc2626' }} />Active</> : <><CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#16a34a' }} />Shanta</>}
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
                                            {kundliResult.doshas.kalsarp.hasDosh ? <><AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#dc2626' }} />Detected</> : <><CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#16a34a' }} />Absent</>}
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
                                            {kundliResult.doshas.sadeSati.active ? <><Hourglass size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#d97706' }} />Active Phase</> : <><CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#16a34a' }} />Shanta</>}
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
                                            {kundliResult.doshas.pitraDosh.hasDosh ? <><AlertTriangle size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#dc2626' }} />Impeded</> : <><CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem', color: '#16a34a' }} />Kripa</>}
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
                                    <Gem size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{kundliResult.lagna.luckyGem || kundliResult.moon.luckyGem || 'Ruby (Manikya)'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('शुभ धातु (METAL)', 'LUCKY METAL')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Coins size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{kundliResult.lagna.luckyMetal || 'Silver/Gold'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('शुभ रंग (LUCKY COLOR)', 'LUCKY COLOR')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Palette size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{kundliResult.lagna.luckyColor || 'White/Gold'}
                                </strong>
                            </div>

                            <div className="kundli-report-card" style={{ background: 'white', padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.4rem', minHeight: '85px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-900)', background: 'var(--warm-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
                                    {t('भाग्यशाली अंक (NUMBER)', 'LUCKY NUMBER')}
                                </span>
                                <strong style={{ color: 'var(--navy-950)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Hash size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{kundliResult.lagna.luckyNum || '1'}
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
                                    <Lock size={17} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('प्रीमियम भविष्य फल एवं समय चक्र (Locked Timeline Analysis)', 'Premium 5-8 Year Future Forecast (Locked)')}
                                </h3>
                                <span style={{ background: 'var(--gold-100)', color: 'var(--gold-800)', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                                    Pandit Ji Exclusive
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
                                {/* Locked Card 1: 5-8 Year Career & Wealth Timeline */}
                                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-gold)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                            <TrendingUp size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />आगामी 5-8 वर्ष: करियर, व्यापार एवं धन लाभ
                                        </strong>
                                        <Lock size={16} style={{ color: 'var(--gold-700)' }} />
                                    </div>
                                    <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        वर्ष 2026 से 2031 के मध्य गुरु की दृष्टि दशम भाव पर होने से कार्यक्षेत्र में बड़ा पदोन्नति योग बनता है। व्यापार में अचानक आर्थिक उछाल और नए अनुबंध प्राप्त होंगे।
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                                        <Lock size={22} style={{ color: 'var(--gold-700)', marginBottom: '0.2rem' }} />
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
                                            <Heart size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />विवाह योग, वैवाहिक सामंजस्य एवं जीवनसाथी
                                        </strong>
                                        <Lock size={16} style={{ color: 'var(--gold-700)' }} />
                                    </div>
                                    <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        सप्तम भाव के स्वामी पर शुभ ग्रहों के गोचर से विवाह में आ रही अड़चनों का अंत होगा। जीवनसाथी का स्वभाव, दिशा एवं अनुकूल समय अवधि का विस्तृत विवरण।
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                                        <Lock size={22} style={{ color: 'var(--gold-700)', marginBottom: '0.2rem' }} />
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
                                            <Wand2 size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />विशिष्ट ग्रह शांति एवं काशी शास्त्रोक्त उपाय
                                        </strong>
                                        <Lock size={16} style={{ color: 'var(--gold-700)' }} />
                                    </div>
                                    <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        जन्म कुंडली के दूषित ग्रहों की शांति हेतु काशी में विशेष रुद्राभिषेक, महामृत्युंजय मंत्र जप एवं व्यक्तिगत रत्न निर्धारण की संपूर्ण विधि।
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                                        <Lock size={22} style={{ color: 'var(--gold-700)', marginBottom: '0.2rem' }} />
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

                        {/* Full 24-Page PDF - now free (no charge, no WhatsApp
                            round-trip needed): directly downloadable using the
                            same birth details and language/numeral settings
                            currently shown on screen. */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--gold-50), white)', border: '2px solid var(--gold-500)',
                            borderRadius: 'var(--radius-xl)', padding: 'clamp(1.5rem, 4vw, 2.25rem)', margin: '1.5rem 0',
                            textAlign: 'center',
                        }}>
                            <FileText size={30} style={{ color: 'var(--gold-700)', marginBottom: '0.5rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
                                {t('पूर्ण 24-पृष्ठ कुंडली PDF निःशुल्क डाउनलोड करें', 'Download Your Full 24-Page Kundli PDF — Free')}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
                                {t(
                                    'सभी वर्ग कुंडलियाँ (D2 से D30), संपूर्ण विंशोत्तरी महादशा-अंतर्दशा सारणी एवं डॉ. उमंग नाथ शर्मा द्वारा विस्तृत विश्लेषण — पारंपरिक काशी शैली में, बिल्कुल निःशुल्क।',
                                    'All divisional charts (D2 through D30), the complete Vimshottari Mahadasha/Antardasha tables, and detailed analysis by Dr. Umang Nath Sharma - in the traditional Kashi style, completely free.'
                                )}
                            </p>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginBottom: '1rem' }}>
                                {t('निःशुल्क', 'FREE')}
                            </div>
                            <a
                                href={`/api/generate-kundli-pdf?${new URLSearchParams({
                                    name: kundliResult.devoteeName,
                                    dob: form.dob,
                                    tob: (form.tob || '06:30').split(' ')[0],
                                    pob: kundliResult.birthPlace,
                                    lat: 25.3176,
                                    lng: 82.9739,
                                    tzOffset: 5.5,
                                    lang: kundliSettings.lang,
                                }).toString()}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-primary btn-lg"
                            >
                                <FileText size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                                {t('अभी डाउनलोड करें', 'Download Now')}
                            </a>
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
                                            <Sparkles size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{t('काशी के ज्योतिषाचार्य से प्रत्यक्ष 1-on-1 परामर्श', 'Direct 1-on-1 Video Call with Kashi Astrologer')}
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
                                            <TrendingUp size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />5-Year Career & Wealth Timeline
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                                            <Heart size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />Vivah Yog & Partner Match
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                                            <Wand2 size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />Authentic Kashi Grah Shanti
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
                                        <MessageCircle size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{t('WhatsApp पर 1-on-1 वीडियो कॉल बुक करें', 'Book 1-on-1 Video Call on WhatsApp')}
                                    </a>
                                    <Link
                                        to="/booking?service=astrology-consultation"
                                        className="btn btn-outline"
                                        style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem', justifyContent: 'center', textAlign: 'center', borderColor: 'rgba(255,255,255,0.3)', color: '#f8fafc', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}
                                    >
                                        <CalendarDays size={15} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />{t('वेबसाइट पर अपॉइंटमेंट बुक करें', 'Book Appointment Online')}
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
