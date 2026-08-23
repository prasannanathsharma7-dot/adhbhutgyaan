import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import { gallery, videoClips } from '../data/media';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

export default function Booking() {
    const [searchParams] = useSearchParams();
    const preServiceId = searchParams.get('service');
    const prePkgName = searchParams.get('package');
    const { t, lang } = useLanguage();

    useSEO({
        title: t('पूजा बुक करें | Adhbhut Gyaan', 'Book a Pooja | Adhbhut Gyaan'),
        description: t('4 सरल चरणों में अपनी पूजा बुक करें — सेवा चुनें, पैकेज चुनें, विवरण भरें, और WhatsApp पर पुष्टि करें।', 'Book your pooja in 4 simple steps — select a service, choose a package, enter your details, and confirm on WhatsApp.'),
        path: '/booking',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Book a Pooja', path: '/booking' },
        ])),
    });

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', date: '', address: '', notes: '', mode: '' });
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [errors, setErrors] = useState({});

    const modeOptions = [
        { v: 'online', icon: '🌐', label: t('ऑनलाइन', 'Online') },
        { v: 'offline', icon: '🏠', label: t('ऑफलाइन (आपके स्थान पर)', 'Offline (at your location)') },
        { v: 'location', icon: '📍', label: t('किसी भी अन्य स्थान पर', 'At any other location') },
        { v: 'temple', icon: '🛕', label: t('मंदिर में', 'At a Temple') },
    ];

    // Pre-select from URL
    useEffect(() => {
        if (preServiceId) {
            const svc = servicesData.find(s => s.id === preServiceId);
            if (svc) {
                setSelectedService(svc);
                if (prePkgName) {
                    const pkg = svc.packages.find(p => p.nameEn === prePkgName);
                    if (pkg) { setSelectedPkg(pkg); setStep(3); return; }
                }
                setStep(2);
            }
        }
    }, [preServiceId, prePkgName]);

    const goToStep = (n) => { setStep(n); window.scrollTo({ top: 200, behavior: 'smooth' }); };

    const saveBookingToServer = async () => {
        setSaveStatus('saving');
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    serviceId: selectedService?.id || '',
                    serviceName: selectedService ? `${selectedService.name} (${selectedService.nameEn})` : '',
                    packageName: selectedPkg ? `${selectedPkg.name} (${selectedPkg.nameEn})` : '',
                    mode: form.mode,
                    preferredDate: form.date,
                    address: form.address,
                    notes: form.notes,
                    language: lang,
                }),
            });
            setSaveStatus(res.ok ? 'saved' : 'error');
        } catch {
            // Network/DB issue - fail silently. WhatsApp/Call/Email still work regardless.
            setSaveStatus('error');
        }
    };

    const handleSubmit = () => {
        const next = {};
        if (!form.name.trim()) {
            next.name = t('कृपया अपना नाम लिखें', 'Please enter your name');
        }
        if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
            next.phone = t('कृपया सही मोबाइल नंबर लिखें (कम से कम 10 अंक)', 'Please enter a valid phone number (at least 10 digits)');
        }
        if (!form.mode) {
            next.mode = t('कृपया पूजा का माध्यम चुनें', 'Please select how you want the pooja performed');
        }

        setErrors(next);

        if (Object.keys(next).length > 0) {
            // Scroll to the first field with an error so the user sees it immediately
            const firstKey = next.mode ? 'mode' : (next.name ? 'name' : 'phone');
            const el = document.getElementById(`booking-${firstKey}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (firstKey !== 'mode') el.focus({ preventScroll: true });
            }
            return;
        }

        goToStep(4);
        saveBookingToServer();
    };

    const dateNotSet = t('पंडित जी से तय होगी', 'To be decided with the Pandit');
    const modeLabel = modeOptions.find(m => m.v === form.mode)?.label || '';

    const whatsAppMsg = selectedService && selectedPkg ? `🙏 *${t('नमस्कार! नई पूजा पूछताछ', 'Hello! New Pooja Enquiry')}*

*${t('सेवा', 'Service')}:* ${selectedService.name} (${selectedService.nameEn})
*${t('पैकेज', 'Package')}:* ${selectedPkg.name} (${selectedPkg.nameEn})
*${t('जाप/पाठ', 'Jaap/Paath')}:* ${selectedPkg.paathCount}
*${t('माध्यम', 'Mode')}:* ${modeLabel}

*${t('नाम', 'Name')}:* ${form.name}
*${t('फ़ोन', 'Phone')}:* ${form.phone}
*${t('तिथि', 'Date')}:* ${form.date || dateNotSet}
${form.address ? `*${t('पता', 'Address')}:* ${form.address}` : ''}
${form.notes ? `*${t('विशेष', 'Notes')}:* ${form.notes}` : ''}

${t('कृपया मूल्य व उपलब्धता की जानकारी दें।', 'Please share pricing and availability.')} 🙏` : '';

    const emailMsg = selectedService && selectedPkg ? `${t('नमस्कार, मैं निम्नलिखित पूजा हेतु पूछताछ करना चाहता/चाहती हूँ:', 'Hello, I would like to enquire about the following pooja:')}

${t('सेवा', 'Service')}: ${selectedService.name} (${selectedService.nameEn})
${t('पैकेज', 'Package')}: ${selectedPkg.name} (${selectedPkg.nameEn})
${t('जाप/पाठ', 'Jaap/Paath')}: ${selectedPkg.paathCount}
${t('माध्यम', 'Mode')}: ${modeLabel}

${t('नाम', 'Name')}: ${form.name}
${t('फ़ोन', 'Phone')}: ${form.phone}
${t('तिथि', 'Date')}: ${form.date || dateNotSet}
${form.address ? `${t('पता', 'Address')}: ${form.address}` : ''}
${form.notes ? `${t('विशेष', 'Notes')}: ${form.notes}` : ''}

${t('कृपया मूल्य व उपलब्धता की जानकारी दें। धन्यवाद।', 'Please share pricing and availability. Thank you.')}` : '';

    const steps = [
        t('पूजा चुनें', 'Select Pooja'),
        t('पैकेज चुनें', 'Select Package'),
        t('विवरण भरें', 'Your Details'),
        t('पुष्टि करें', 'Confirm'),
    ];

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('पूजा बुक करें', 'Book Pooja')}</span></div>
                    <h1>{t('पूजा बुक करें', 'Book Your Pooja')}</h1>
                    <p className="subtitle">{t('4 सरल चरणों में पूछताछ करें', 'Enquire in 4 Simple Steps')}</p>
                </div>
            </header>

            {/* Welcome video */}
            <section className="section" style={{ paddingTop: 'clamp(2rem, 5vw, 3rem)', paddingBottom: 'clamp(2rem, 5vw, 3rem)' }}>
                <div className="container" style={{ maxWidth: 720 }}>
                    <div className="text-center" style={{ marginBottom: '1.25rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-hindi)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                            {t('बुकिंग से पहले, हमसे मिलिए', 'Meet Us Before You Book')}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {t('हमारे परिवार की ओर से आपके लिए एक स्नेहिल संदेश', 'A personal message from our family, just for you')}
                        </p>
                    </div>
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-gold)' }}>
                        <video controls preload="none" poster="/images/gallery/welcome-poster.webp" playsInline style={{ width: '100%', display: 'block', background: '#000', aspectRatio: '16/9' }}>
                            <source src="/videos/welcome.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>
            </section>

            {/* Trust strip - real ceremony photos */}
            <section style={{ padding: '1.75rem 0', background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container">
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', letterSpacing: '0.3px' }}>
                        {t('हमारी वास्तविक पूजाओं की झलक', 'Glimpses from our real ceremonies')}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {gallery.slice(4, 12).map(item => (
                            <img
                                key={item.src}
                                src={item.src}
                                alt={item.capEn}
                                loading="lazy"
                                style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', flexShrink: 0 }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
                    {/* Steps */}
                    <div className="wizard-steps" role="list">
                        {steps.map((label, i) => (
                            <div
                                key={i}
                                role="listitem"
                                className={`wizard-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}
                                aria-current={step === i + 1 ? 'step' : undefined}
                            >
                                <div className="wizard-step-number" aria-hidden="true">{i + 1}</div>
                                <span className="wizard-step-label">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Announces progress to screen readers when the step changes,
                        since the visual indicator alone conveys it only sighted users. */}
                    <p className="sr-only" role="status" aria-live="polite">
                        {t(`चरण ${step} / ${steps.length}: ${steps[step - 1]}`, `Step ${step} of ${steps.length}: ${steps[step - 1]}`)}
                    </p>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('पूजा सेवा चुनें', 'Select a Pooja Service')}</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                {t('नीचे से कोई भी सेवा चुनें', 'Tap any service below')}
                            </p>
                            <div className="service-select-grid">
                                {servicesData.map(svc => (
                                    <button
                                        type="button"
                                        key={svc.id}
                                        className={`service-select-card ${selectedService?.id === svc.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedService(svc)}
                                        aria-pressed={selectedService?.id === svc.id}
                                    >
                                        <span className="service-select-name">{lang === 'hi' ? svc.name : svc.nameEn}</span>
                                        {lang === 'hi' && <span className="service-select-name-en">{svc.nameEn}</span>}
                                    </button>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <button className="btn btn-primary btn-lg" disabled={!selectedService} onClick={() => goToStep(2)}>
                                    {t('आगे बढ़ें →', 'Next →')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && selectedService && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('पैकेज चुनें', 'Select Your Package')}</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>{lang === 'hi' ? selectedService.name : selectedService.nameEn}</p>
                            <div className="package-cards">
                                {selectedService.packages.map(pkg => (
                                    <div key={pkg.nameEn}
                                        className={`package-card ${pkg.popular ? 'popular' : ''} ${selectedPkg?.nameEn === pkg.nameEn ? 'selected' : ''}`}
                                        onClick={() => setSelectedPkg(pkg)}
                                    >
                                        {pkg.popular && <div className="package-popular-badge">⭐ {t('लोकप्रिय', 'Popular')}</div>}
                                        <div className="package-name">{lang === 'hi' ? pkg.name : pkg.nameEn}</div>
                                        {lang === 'hi' && <div className="package-name-en">{pkg.nameEn}</div>}
                                        <div className="package-count">{pkg.paathCount}</div>
                                        <div className="package-includes">{t('शामिल', 'Includes')}: {pkg.includes}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline-dark btn-lg" onClick={() => goToStep(1)}>{t('← वापस', '← Back')}</button>
                                <button className="btn btn-primary btn-lg" disabled={!selectedPkg} onClick={() => goToStep(3)}>{t('आगे बढ़ें →', 'Next →')}</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('अपना विवरण भरें', 'Enter Your Details')}</h3>
                            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                                <div className="form-group" id="booking-mode">
                                    <label className="form-label">{t('पूजा किस माध्यम से करवानी है', 'How would you like the pooja performed')} *</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.4rem' }}>
                                        {modeOptions.map(m => (
                                            <button
                                                key={m.v}
                                                type="button"
                                                onClick={() => { setForm({ ...form, mode: m.v }); setErrors({ ...errors, mode: undefined }); }}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                    padding: '0.55rem 1rem', borderRadius: 'var(--radius-xl)',
                                                    border: form.mode === m.v ? '2px solid var(--gold-500)' : (errors.mode ? '1px solid var(--red-400)' : '1px solid var(--border-light)'),
                                                    background: form.mode === m.v ? 'var(--gold-50)' : 'white',
                                                    color: form.mode === m.v ? 'var(--gold-700)' : 'var(--text-secondary)',
                                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                }}
                                            >
                                                <span>{m.icon}</span>{m.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.mode && <p className="form-error">⚠ {errors.mode}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="booking-name">{t('पूरा नाम', 'Full Name')} *</label>
                                    <input
                                        id="booking-name"
                                        className={`form-input ${errors.name ? 'has-error' : ''}`}
                                        placeholder={t('अपना नाम लिखें', 'Enter your name')}
                                        value={form.name}
                                        aria-invalid={errors.name ? 'true' : 'false'}
                                        onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                                    />
                                    {errors.name && <p className="form-error">⚠ {errors.name}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="booking-phone">{t('मोबाइल नंबर', 'Phone Number')} *</label>
                                    <input
                                        id="booking-phone"
                                        className={`form-input ${errors.phone ? 'has-error' : ''}`}
                                        type="tel"
                                        placeholder="+91 92781 48269"
                                        value={form.phone}
                                        aria-invalid={errors.phone ? 'true' : 'false'}
                                        onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: undefined }); }}
                                    />
                                    {errors.phone && <p className="form-error">⚠ {errors.phone}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('पसंदीदा तिथि', 'Preferred Date')}</label>
                                    <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('पता / शहर / मंदिर का नाम', 'City / Address / Temple Name')}</label>
                                    <input className="form-input" placeholder={t('शहर, पता या मंदिर का नाम लिखें', 'Enter city, address, or temple name')} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('विशेष निर्देश', 'Special Instructions')}</label>
                                    <textarea className="form-textarea" placeholder={t('कोई विशेष अनुरोध या संकल्प विवरण...', 'Any special request or sankalp details...')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline-dark btn-lg" onClick={() => goToStep(2)}>{t('← वापस', '← Back')}</button>
                                <button className="btn btn-primary btn-lg" onClick={handleSubmit}>{t('समीक्षा करें →', 'Review →')}</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4 */}
                    {step === 4 && selectedService && selectedPkg && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('पूछताछ समीक्षा', 'Review Your Enquiry')}</h3>
                            {saveStatus === 'saving' && (
                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    {t('आपकी पूछताछ दर्ज की जा रही है…', 'Recording your enquiry…')}
                                </p>
                            )}
                            {saveStatus === 'saved' && (
                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--whatsapp)', marginBottom: '1rem' }}>
                                    ✓ {t('आपकी पूछताछ सुरक्षित रूप से दर्ज हो गई है', 'Your enquiry has been securely recorded')}
                                </p>
                            )}
                            {saveStatus === 'error' && (
                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gold-700)', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', marginBottom: '1rem', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                                    {t('आपका विवरण सहेजा नहीं जा सका, परंतु चिंता न करें — नीचे WhatsApp, कॉल या ईमेल से सीधे संपर्क करें, आपकी बुकिंग वैसे ही हो जाएगी।', "We couldn't save your details automatically, but don't worry — just reach us directly via WhatsApp, call, or email below and your booking will go through as usual.")}
                                </p>
                            )}
                            <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,4vw,2rem)', border: '2px solid var(--border-gold)', boxShadow: 'var(--shadow-gold)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <img src={`/images/${selectedService.image}`} alt={selectedService.nameEn} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-400)', margin: '0 auto 1rem auto', display: 'block' }} />
                                    <h3 style={{ fontFamily: 'var(--font-hindi)', marginTop: '0.5rem' }}>{lang === 'hi' ? selectedService.name : selectedService.nameEn}</h3>
                                    {lang === 'hi' && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedService.nameEn}</p>}
                                </div>
                                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                                    {[
                                        [t('पैकेज', 'Package'), `${selectedPkg.name} (${selectedPkg.nameEn})`],
                                        [t('जाप/पाठ', 'Jaap/Paath'), selectedPkg.paathCount],
                                        [t('शामिल', 'Includes'), selectedPkg.includes],
                                        [t('माध्यम', 'Mode'), modeLabel],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem', gap: '1rem' }}>
                                            <strong>{k}:</strong><span style={{ textAlign: 'right' }}>{v}</span>
                                        </div>
                                    ))}
                                    <div style={{ background: 'var(--gold-50)', border: '1px dashed var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--gold-700)', fontWeight: 600, textAlign: 'center' }}>
                                        💬 {t('मूल्य हेतु पूछताछ करें', 'Enquire Now for Pricing')}
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        {[[t('नाम', 'Name'), form.name], [t('फ़ोन', 'Phone'), form.phone], [t('तिथि', 'Date'), form.date || dateNotSet], ...(form.address ? [[t('पता', 'Address'), form.address]] : []), ...(form.notes ? [[t('विशेष', 'Notes'), form.notes]] : [])].map(([k, v]) => (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', gap: '1rem' }}>
                                                <strong>{k}:</strong><span style={{ textAlign: 'right' }}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline-dark btn-lg" onClick={() => goToStep(3)}>{t('← वापस', '← Back')}</button>
                                <a href={`https://wa.me/919278148269?text=${encodeURIComponent(whatsAppMsg)}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 {t('WhatsApp पर पूछताछ करें', 'Enquire on WhatsApp')}</a>
                                <a href="tel:+919278148269" className="btn btn-primary btn-lg">📞 {t('कॉल करें', 'Call Us')}</a>
                            </div>
                            <div className="text-center" style={{ marginTop: '1rem' }}>
                                <a href={`mailto:astrokashi369@gmail.com?subject=${encodeURIComponent(t('नई पूजा पूछताछ', 'New Pooja Enquiry'))}&body=${encodeURIComponent(emailMsg)}`} style={{ fontSize: '0.85rem', color: 'var(--gold-700)', fontWeight: 600 }}>
                                    ✉️ {t('या ईमेल से पूछताछ करें', 'Or enquire by email instead')}
                                </a>
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {t('WhatsApp पर पूछताछ विवरण भेजा जाएगा। पंडित जी आपसे मूल्य व उपलब्धता के साथ संपर्क करेंगे।', 'Your enquiry details will be sent via WhatsApp. The Pandit will contact you with pricing and availability.')}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Videos */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('जीवंत झलकियाँ', 'Live Glimpses')}</span>
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('देखें — हमारी पूजा सेवाएं वीडियो में', 'Watch — Our Pooja Services in Video')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="video-showcase-grid">
                        {videoClips.map(clip => (
                            <div className="video-showcase-card" key={clip.src}>
                                <video controls preload="none" poster={clip.poster} playsInline>
                                    <source src={clip.src} type="video/mp4" />
                                </video>
                                <p className="video-showcase-caption">{t(clip.capHi, clip.capEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
