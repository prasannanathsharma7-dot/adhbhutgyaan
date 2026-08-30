import { useParams, Link, Navigate } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, serviceJsonLd, faqJsonLd, combineJsonLd } from '../utils/seo';

export default function ServiceDetail() {
    const { id } = useParams();
    const { t, lang } = useLanguage();
    const service = servicesData.find(s => s.id === id);

    // Unknown slug -> send to the main services listing rather than a dead end.
    if (!service) return <Navigate to="/services" replace />;

    const name = lang === 'hi' ? service.name : service.nameEn;
    const description = lang === 'hi' ? service.description : service.descriptionEn;

    const isAstrology = service.id === 'astrology-consultation';
    const enDescription = isAstrology
        ? 'Best Astrologer in Kashi, Varanasi - Dr. Umang Nath Sharma offers kundli analysis, dosh remedies, marriage matching, online or in person.'
        : `Book ${service.nameEn} in Kashi, Varanasi with Pt. Umang Nath Sharma - authentic Vedic pooja, available online or in person.`;

    const faqItems = [
        {
            q: t(`${service.name} बुक करने के लिए क्या वाराणसी आना जरूरी है?`, `Do I need to visit Varanasi to book ${service.nameEn}?`),
            a: t('नहीं, यह पूजा ऑनलाइन (लाइव वीडियो के साथ) भी करवाई जा सकती है। आप विदेश में रहकर भी अपने नाम व गोत्र से पूजा करवा सकते हैं।', 'No, this pooja can also be performed online with a live video call. You can have it performed in your name and gotra even while living abroad.'),
        },
        {
            q: t(`${service.name} की कीमत में क्या शामिल है?`, `What is included in the price of ${service.nameEn}?`),
            a: t('पूजा मूल्य में सम्पूर्ण पूजन सामग्री, अनुभवी पंडितों की दक्षिणा और हवन (जहाँ लागू हो) शामिल है। कोई छुपा हुआ शुल्क नहीं है। अंतिम मूल्य पंडित जी WhatsApp/कॉल पर बताते हैं।', "The price includes all pooja materials, the experienced pandits\u2019 fees, and havan where applicable. There are no hidden charges. Pandit ji confirms the exact final price on WhatsApp/call."),
        },
        {
            q: t('पूजा में कितना समय लगता है?', 'How long does the pooja take?'),
            a: t(`${service.name} की अवधि पैकेज के अनुसार भिन्न होती है — बुकिंग के समय पंडित जी सही समय बता देंगे।`, `The duration of ${service.nameEn} varies by package - Pandit ji will confirm the exact time when you book.`),
        },
        {
            q: t('बुकिंग के बाद क्या होता है?', 'What happens after I book?'),
            a: t('बुकिंग फॉर्म भरने या WhatsApp पर पूछताछ करने के 24 घंटों के भीतर हमारी टीम आपसे तारीख, समय एवं मूल्य निश्चित करने हेतु सम्पर्क करेगी।', 'Within 24 hours of submitting the form or messaging on WhatsApp, our team will contact you to confirm the date, time, and price.'),
        },
    ];

    useSEO({
        title: t(`${service.name} — बुक करें | Adhbhut Gyaan`, isAstrology ? `Best Astrologer in Kashi, Varanasi | ${service.name} — Adhbhut Gyaan` : `${service.nameEn} in Kashi, Varanasi | ${service.name} — Adhbhut Gyaan`),
        description: t(service.shortDesc, enDescription),
        path: `/services/${service.id}`,
        image: `https://www.adhbhutgyaan.com/images/${service.image}`,
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: 'Services', path: '/services' },
                { name, path: `/services/${service.id}` },
            ]),
            serviceJsonLd(service, lang),
            faqJsonLd(faqItems)
        ),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('होम', 'Home')}</Link><span>›</span>
                        <Link to="/services">{t('सेवाएं', 'Services')}</Link><span>›</span>
                        <span>{name}</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-hindi)' }}>{name}</h1>
                    {lang === 'hi' && <p className="subtitle">{service.nameEn}</p>}
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="about-story" style={{ marginBottom: '2rem' }}>
                        <div className="about-image">
                            <img src={`/images/${service.image}`} alt={service.nameEn} width="640" height="640" fetchPriority="high" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>{description}</p>
                            <div style={{ background: 'var(--gold-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold-500)', marginBottom: '1.25rem' }}>
                                <strong>🕐 {t('सर्वोत्तम समय', 'Best Time')}:</strong> {lang === 'hi' ? service.bestTime : service.bestTimeEn}
                            </div>
                            <h2 style={{ marginBottom: '0.75rem', color: 'var(--dark-100)', fontSize: '1.15rem' }}>{t('लाभ', 'Benefits')}:</h2>
                            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                {service.benefits.map((b, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--gold-600)', fontSize: '1.1rem' }}>✓</span>
                                        <span>{lang === 'hi' ? b : service.benefitsEn[i]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {isAstrology && (
                        <div style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>✦ {t('निःशुल्क कुंडली मांगें', 'Request a Free Kundli')}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {t('कोई स्वचालित सॉफ्टवेयर नहीं — डॉ. उमंग नाथ शर्मा स्वयं आपकी कुंडली देखेंगे।', 'No automated software - Dr. Umang Nath Sharma personally reviews your birth chart.')}
                            </p>
                            <Link to="/free-kundli" className="btn btn-primary">✦ {t('अभी मांगें', 'Request Now')}</Link>
                        </div>
                    )}

                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{t('उपलब्ध विकल्प', 'Available Options')}</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>{t('यह सेवा निम्न में से किसी भी तरीके से उपलब्ध है', 'This service is available in any of the following ways')}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                        {(isAstrology
                            ? [
                                { icon: '🌐', label: t('ऑनलाइन', 'Online') },
                                { icon: '🏛️', label: t('व्यक्तिगत रूप से (हमारे वाराणसी स्थान पर)', 'In-person (at our Varanasi office)') },
                            ]
                            : [
                                { icon: '🌐', label: t('ऑनलाइन', 'Online') },
                                { icon: '🏠', label: t('ऑफलाइन (आपके स्थान पर)', 'Offline (at your location)') },
                                { icon: '📍', label: t('किसी भी अन्य स्थान पर', 'At any other location') },
                                { icon: '🛕', label: t('मंदिर में', 'At a Temple') },
                            ]
                        ).map((m, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-xl)' }}>
                                <span>{m.icon}</span>{m.label}
                            </span>
                        ))}
                    </div>

                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{t('पैकेज चुनें', 'Choose Your Package')}</h2>
                    <div className="package-cards">
                        {service.packages.map(pkg => (
                            <div className={`package-card ${pkg.popular ? 'popular' : ''}`} key={pkg.nameEn}>
                                {pkg.popular && <div className="package-popular-badge">⭐ {t('लोकप्रिय', 'Popular')}</div>}
                                <div className="package-name">{lang === 'hi' ? pkg.name : pkg.nameEn}</div>
                                {lang === 'hi' && <div className="package-name-en">{pkg.nameEn}</div>}
                                <div className="package-count">{pkg.paathCount}</div>
                                <div className="package-includes">{t('शामिल', 'Includes')}: {pkg.includes}</div>
                                <a
                                    href={`https://wa.me/919818227189?text=${encodeURIComponent(t(
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

                    <h2 style={{ textAlign: 'center', marginTop: '3.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>{t('अक्सर पूछे जाने वाले प्रश्न', 'Frequently Asked Questions')}</h2>
                    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {faqItems.map((item, i) => (
                            <details key={i} className="faq-item">
                                <summary>{item.q}</summary>
                                <p>{item.a}</p>
                            </details>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link to="/services" className="btn btn-outline">
                            ← {t('सभी सेवाएं देखें', 'View All Services')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
