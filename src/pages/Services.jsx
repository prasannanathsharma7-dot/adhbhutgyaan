import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, faqJsonLd, combineJsonLd } from '../utils/seo';

export default function Services() {
    const { hash } = useLocation();
    const { t, lang } = useLanguage();
    const [selectedConcern, setSelectedConcern] = useState(null);

    const concerns = [
        { id: 'health', icon: '🩺', label: t('स्वास्थ्य संबंधी समस्या', 'Health Issues'), serviceIds: ['rudrabhishek', 'purush-suktam'] },
        { id: 'marriage', icon: '💍', label: t('विवाह में देरी / मांगलिक दोष', 'Marriage Delay / Manglik Dosh'), serviceIds: ['kumbh-vivah', 'kalsarp-dosh'] },
        { id: 'money', icon: '💰', label: t('आर्थिक तंगी', 'Financial Struggles'), serviceIds: ['kanakdhara-stotra', 'shree-suktam'] },
        { id: 'ancestral', icon: '🕯️', label: t('पितृ दोष / पूर्वजों से जुड़ी समस्या', 'Pitru Dosh / Ancestral Issues'), serviceIds: ['tripindi-shradh'] },
        { id: 'career', icon: '💼', label: t('करियर / व्यापार में रुकावट', 'Career / Business Obstacles'), serviceIds: ['ganesh-atharvashirsha', 'kalsarp-dosh'] },
        { id: 'negativity', icon: '🛡️', label: t('नकारात्मक शक्ति / शत्रु बाधा', 'Negative Energy / Enemies'), serviceIds: ['vipreet-pratyangira', 'mahavidya-paath'] },
        { id: 'unsure', icon: '🔮', label: t('पता नहीं, सलाह चाहिए', 'Not Sure, Need Guidance'), serviceIds: ['astrology-consultation'] },
    ];

    const recommended = selectedConcern
        ? concerns.find(c => c.id === selectedConcern).serviceIds.map(id => servicesData.find(s => s.id === id)).filter(Boolean)
        : [];

    useSEO({
        title: t('हमारी पूजा सेवाएं | Adhbhut Gyaan', 'Pooja & Astrology Services in Kashi, Varanasi | Adhbhut Gyaan'),
        description: t('रुद्राभिषेक, कालसर्प दोष, त्रिपिंडी श्राद्ध, दस महाविद्या पाठ सहित 10+ प्रामाणिक पूजा सेवाएं — बनारस के विद्वान पंडितों द्वारा।', 'Book authentic pooja in Kashi, Varanasi - Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh, Astrology consultation & 10+ more Vedic services by Pt. Umang Nath Sharma.'),
        path: '/services',
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: 'Services', path: '/services' },
            ]),
            faqJsonLd([
                {
                    q: t('पूजा बुक करने के लिए क्या मुझे वाराणसी आना जरूरी है?', 'Do I need to visit Varanasi to book a pooja?'),
                    a: t('नहीं, हमारी अधिकतर पूजाएं ऑनलाइन (लाइव वीडियो के साथ) भी करवाई जा सकती हैं। आप विदेश में रहकर भी अपने नाम व गोत्र से पूजा करवा सकते हैं।', 'No, most of our poojas can also be performed online with a live video call. You can have the pooja performed in your name and gotra even while living abroad.'),
                },
                {
                    q: t('पूजा की कीमत में क्या शामिल है?', 'What is included in the pooja price?'),
                    a: t('पूजा मूल्य में सम्पूर्ण पूजन सामग्री, अनुभवी पंडितों की दक्षिणा और हवन (जहाँ लागू हो) शामिल है। कोई छुपा हुआ शुल्क नहीं है।', 'The price includes all pooja materials, the experienced pandits\u2019 fees, and havan where applicable. There are no hidden charges.'),
                },
                {
                    q: t('बुकिंग की पुष्टि कैसे होती है?', 'How is my booking confirmed?'),
                    a: t('बुकिंग फॉर्म भरने के बाद हमारी टीम WhatsApp या कॉल के माध्यम से 24 घंटे के भीतर आपसे संपर्क कर तारीख व विवरण पक्का करती है।', 'After you submit the booking form, our team contacts you via WhatsApp or phone within 24 hours to confirm the date and details.'),
                },
            ])
        ),
    });

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    }, [hash]);

    const overseasItems = [
        t('डॉ. उमंग नाथ शर्मा से ज्योतिष परामर्श — ऑनलाइन पूछताछ करें या अपॉइंटमेंट बुक करें', 'Astrology consultation with Dr. Umang Nath Sharma — enquire online or book an appointment'),
        t('पूजा पैकेज, श्राद्ध सहित', 'Pooja packages, including Shradh etc.'),
        t('ज्ञान सत्र एवं वार्ताएं — ऑनलाइन', 'Knowledge sessions & talks — online'),
        t('दैनिक निःशुल्क प्रसारण में ऑनलाइन पूजा सत्र जुड़ें', 'Join daily free telecast of online Pooja sessions'),
        t('बाहर स्थित पूजा हेतु पंडित बुक करें', 'Book a Pandit for out-station Pooja'),
    ];

    const varanasiItems = [
        t('डॉ. उमंग नाथ शर्मा से ज्योतिष परामर्श — सुबह 9 बजे से दोपहर 12 बजे तक हमारे स्थान पर व्यक्तिगत रूप से आएं', 'Astrology consultation with Dr. Umang Nath Sharma — visit our location in person between 9 AM – 12 PM'),
        t('ज्योतिष एवं काशी के इतिहास पर सत्र — आपके स्थान पर लाइव पूजा दर्शन व हाई-टी सत्र सहित', 'Astrology & Kashi-history session — visit to your place with live Pooja & high-tea'),
        t('ऑफ़लाइन पूजा बुकिंग — विभिन्न मंदिरों या किसी भी स्थान पर व्यक्तिगत रूप से', 'Offline Pooja bookings — in person, at temples or any venue'),
        t('व्यक्तिगत रूप से पंडित बुक करें', 'Book a Pandit, in person'),
    ];

    return (
        <div>
            {/* Page Header */}
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('सेवाएं', 'Services')}</span>
                    </div>
                    <h1>{t('हमारी पूजा सेवाएं एवं ज्योतिष परामर्श', 'Our Pooja Services & Astrology Consultation')}</h1>
                    <p className="subtitle">{t('हमारी पवित्र पूजा सेवाएं एवं डॉ. उमंग नाथ शर्मा द्वारा प्रदत्त ज्योतिषीय परामर्श', 'Our Sacred Pooja Services & Astrology Consultation, Guided by Dr. Umang Nath Sharma')}</p>
                </div>
            </header>

            {/* Smart Pooja Finder */}
            <section className="section" style={{ paddingBottom: selectedConcern ? '1rem' : undefined }}>
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('सही पूजा खोजें', 'Find the Right Pooja')}</span>
                        <h2 className="section-title">{t('आपकी समस्या क्या है?', "What's Your Concern?")}</h2>
                        <p className="section-subtitle">{t('नीचे अपनी समस्या चुनें — हम सही पूजा सुझाएंगे।', "Select your concern below and we'll suggest the right pooja.")}</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                        {concerns.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedConcern(c.id === selectedConcern ? null : c.id)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.65rem 1.2rem', borderRadius: 'var(--radius-xl)',
                                    border: c.id === selectedConcern ? 'none' : '1px solid var(--border-gold)',
                                    background: c.id === selectedConcern ? 'var(--gold-600)' : 'white',
                                    color: c.id === selectedConcern ? 'white' : 'var(--gold-700)',
                                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                }}
                            >
                                <span>{c.icon}</span> {c.label}
                            </button>
                        ))}
                    </div>

                    {selectedConcern && (
                        <div style={{ marginTop: '2rem', maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto' }}>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                {t('इसके लिए ये पूजाएं सुझाई जाती हैं:', 'These poojas are recommended for this:')}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                                {recommended.map(s => (
                                    <Link
                                        key={s.id}
                                        to={`/services/${s.id}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1rem', textDecoration: 'none' }}
                                    >
                                        <img src={`/images/${s.image}`} alt={s.nameEn} width="64" height="64" style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--gold-700)' }}>{lang === 'hi' ? s.name : s.nameEn}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('विवरण देखें →', 'View Details →')}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Special Inquiry-Only Services */}
            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('विशेष सेवाएं', 'Special Services')}</span>
                        <h2 className="section-title">{t('प्रवासी भक्तों एवं अतिथियों हेतु विशेष सेवाएं', 'Special Services for Overseas Devotees & Visiting Guests')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('केवल पूछताछ, कोई शुल्क नहीं', 'Inquiry Only, No Charges')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {/* For those sitting overseas */}
                        <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌍</div>
                            <h3 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '1.25rem' }}>{t('विदेश में बसे भक्तों हेतु', 'For Those Sitting Overseas')}</h3>
                            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {overseasItems.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                        <span style={{ color: 'var(--gold-600)', fontSize: '1.1rem' }}>✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं विदेश से हूँ और सेवाओं के बारे में पूछताछ करना चाहता हूँ।', 'Hello! I am overseas and would like to inquire about your services.'))}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                💬 {t('पूछताछ करें', 'Inquire Now')}
                            </a>
                        </div>

                        {/* For guests visiting Varanasi */}
                        <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🛕</div>
                            <h3 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '1.25rem' }}>{t('वाराणसी पधार रहे अतिथियों हेतु', 'For Guests Visiting Varanasi')}</h3>
                            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {varanasiItems.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                        <span style={{ color: 'var(--gold-600)', fontSize: '1.1rem' }}>✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं वाराणसी आ रहा/रही हूँ और सेवाओं के बारे में पूछताछ करना चाहता/चाहती हूँ।', 'Hello! I am visiting Varanasi and would like to inquire about your services.'))}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                💬 {t('पूछताछ करें', 'Inquire Now')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Services */}
            <section className="section">
                <div className="container">
                    {servicesData.map((service, index) => (
                        <div key={service.id} id={service.id} style={{ marginBottom: 'clamp(3rem, 8vw, 5rem)', scrollMarginTop: '100px' }}>
                            <div className="about-story" style={{ marginBottom: '2rem' }}>
                                {index % 2 === 0 ? (
                                    <>
                                        <div className="about-image">
                                            <img src={`/images/${service.image}`} alt={service.nameEn} width="640" height="640" loading="lazy" />
                                        </div>
                                        <ServiceInfo service={service} t={t} lang={lang} />
                                    </>
                                ) : (
                                    <>
                                        <ServiceInfo service={service} t={t} lang={lang} />
                                        <div className="about-image">
                                            <img src={`/images/${service.image}`} alt={service.nameEn} width="640" height="640" loading="lazy" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <Link to={`/services/${service.id}`} className="btn btn-outline">
                                    {t('पूरी जानकारी देखें', 'View Full Details')} →
                                </Link>
                            </div>

                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{t('उपलब्ध विकल्प', 'Available Options')}</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>{t('यह सेवा निम्न में से किसी भी तरीके से उपलब्ध है', 'This service is available in any of the following ways')}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                                {[
                                    { icon: '🌐', label: t('ऑनलाइन', 'Online') },
                                    { icon: '🏠', label: t('ऑफलाइन (आपके स्थान पर)', 'Offline (at your location)') },
                                    { icon: '📍', label: t('किसी भी अन्य स्थान पर', 'At any other location') },
                                    { icon: '🛕', label: t('मंदिर में', 'At a Temple') },
                                ].map((m, i) => (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-xl)' }}>
                                        <span>{m.icon}</span>{m.label}
                                    </span>
                                ))}
                            </div>

                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{t('पैकेज चुनें', 'Choose Your Package')}</h3>

                            <div className="package-cards">
                                {service.packages.map(pkg => (
                                    <div className={`package-card ${pkg.popular ? 'popular' : ''}`} key={pkg.nameEn}>
                                        {pkg.popular && <div className="package-popular-badge">⭐ {t('लोकप्रिय', 'Popular')}</div>}
                                        <div className="package-name">{lang === 'hi' ? pkg.name : pkg.nameEn}</div>
                                        {lang === 'hi' && <div className="package-name-en">{pkg.nameEn}</div>}
                                        <div className="package-count">{pkg.paathCount}</div>
                                        <div className="package-includes">{t('शामिल', 'Includes')}: {pkg.includes}</div>
                                        <a
                                            href={`https://wa.me/919278148269?text=${encodeURIComponent(t(
                                                `नमस्कार! मुझे "${service.name} — ${pkg.name}" के बारे में पूछताछ करनी है। कृपया अधिक जानकारी दें।`,
                                                `Hello! I would like to inquire about "${service.nameEn} — ${pkg.nameEn}". Please share more details.`
                                            ))}`}
                                            target="_blank" rel="noreferrer"
                                            className="btn btn-primary"
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            💬 {t('पूछताछ करें', 'Enquire Now')}
                                        </a>
                                    </div>
                                ))}
                            </div>

                            <div className="om-divider" style={{ marginTop: '3rem' }}>ॐ</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ServiceInfo({ service, t, lang }) {
    return (
        <div>
            <h2 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '0.25rem' }}>{lang === 'hi' ? service.name : service.nameEn}</h2>
            {lang === 'hi' && <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{service.nameEn}</p>}
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>{lang === 'hi' ? service.description : service.descriptionEn}</p>
            <div style={{ background: 'var(--gold-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold-500)', marginBottom: '1.25rem' }}>
                <strong>🕐 {t('सर्वोत्तम समय', 'Best Time')}:</strong> {lang === 'hi' ? service.bestTime : service.bestTimeEn}
            </div>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--dark-100)' }}>{t('लाभ', 'Benefits')}:</h4>
            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {service.benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--gold-600)', fontSize: '1.1rem' }}>✓</span>
                        <span>{lang === 'hi' ? b : service.benefitsEn[i]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
