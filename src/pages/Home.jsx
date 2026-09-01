import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import { triptych, videoClips, youtubeUploadsPlaylistId, youtubeChannelId } from '../data/media';
import useSEO from '../hooks/useSEO';
import { localBusinessJsonLd, combineJsonLd } from '../utils/seo';
import DailyPanchangCard from '../components/DailyPanchangCard';
import { heritageSummary, testimonials } from '../data/heritage';
import FlagIcon from '../components/FlagIcon';
import { SquarePlay } from 'lucide-react';

function useInView() {
    const ref = useRef();
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
            { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
        );
        el.querySelectorAll('.fade-up').forEach(child => obs.observe(child));
        return () => obs.disconnect();
    }, []);
    return ref;
}

export default function Home() {
    const pageRef = useInView();
    const { t, lang } = useLanguage();
    const [liveReviews, setLiveReviews] = useState(null);

    useEffect(() => {
        fetch('/api/reviews?limit=6')
            .then((r) => r.json())
            .then((data) => {
                if (data.ok && Array.isArray(data.items) && data.items.length >= 3) {
                    setLiveReviews(data.items);
                }
            })
            .catch(() => { /* fall back to static testimonials below */ });
    }, []);

    useSEO({
        title: t('पं. उमंग नाथ शर्मा | अद्भुत ज्ञान — काशी, वाराणसी में ऑनलाइन पूजा बुकिंग', 'Pt. Umang Nath Sharma | Adhbhut Gyaan — Pandit & Online Pooja Booking in Kashi, Varanasi'),
        description: t('पं. उमंग नाथ शर्मा (काशी) द्वारा रुद्राभिषेक, कालसर्प दोष, त्रिपिंडी श्राद्ध जैसी पूजा सेवाएं एवं ज्योतिष परामर्श — ऑनलाइन या वाराणसी में बुक करें।', 'Book pooja and astrology consultation in Kashi, Varanasi - Rudrabhishek, Kalsarp Dosh Nivaran & more. Live online pooja for NRIs worldwide.'),
        path: '/',
        jsonLd: combineJsonLd(localBusinessJsonLd()),
    });

    return (
        <div ref={pageRef}>
            {/* HERO */}
            <section className="hero" id="hero">
                <div className="hero-bg">
                    <picture>
                        <source
                            type="image/avif"
                            srcSet="/images/gallery/havan-group-mobile-480w.avif 480w, /images/gallery/havan-group-tablet-768w.avif 768w, /images/gallery/havan-group-desktop-1280w.avif 1280w"
                            sizes="100vw"
                        />
                        <source
                            type="image/webp"
                            srcSet="/images/gallery/havan-group-mobile-480w.webp 480w, /images/gallery/havan-group-tablet-768w.webp 768w, /images/gallery/havan-group-desktop-1280w.webp 1280w"
                            sizes="100vw"
                        />
                        <img src="/images/gallery/havan-group.jpg" alt={t('काशी में सम्पन्न सामूहिक हवन', 'Collective havan performed in Kashi')} width="1280" height="720" fetchPriority="high" />
                    </picture>
                </div>
                <div className="hero-overlay" />
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-om">ॐ</div>
                        <h1 className="hero-title-hindi">{t('अद्भुत ज्ञान', 'Adhbhut Gyaan')}</h1>
                        <p className="hero-title-en"><Link to="/pt-umang-nath-sharma" style={{ color: 'inherit' }}>{t('पं. उमंग नाथ शर्मा', 'Pt. Umang Nath Sharma')}</Link> {t('— काशी, वाराणसी', '— Kashi, Varanasi')}</p>
                        <p className="hero-desc">
                            {t(
                                <>बनारस (काशी) के अनुभवसम्पन्न एवं विद्वत्तापूर्ण पंडितों द्वारा<br />समस्त प्रकार की पूजा, पाठ, जप, हवन एवं ज्योतिषीय परामर्श<br /><strong style={{ color: 'var(--gold-300)' }}>गृह बैठे ऑनलाइन बुक करें</strong></>,
                                <>Authentic pooja, paath, jaap, havan &amp; astrology consultation<br />performed by seasoned, erudite Pandits of Banaras (Kashi)<br /><strong style={{ color: 'var(--gold-300)' }}>Book online from anywhere in the world</strong></>
                            )}
                        </p>
                        <div className="hero-actions">
                            <Link to="/services" className="btn btn-primary btn-lg"><img src="/images/logo.png" alt="" className="inline-logo" width="512" height="512" /> {t('सेवाएं देखें', 'View Services')}</Link>
                            <a href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं पूजा बुक करना चाहता हूँ।', 'Hello! I would like to book a pooja.'))}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">💬 {t('WhatsApp करें', 'WhatsApp Us')}</a>
                        </div>
                        <div className="hero-stats">
                            {[
                                { num: '400+', label: t('वर्षों का अनुभव', 'Years of Experience') },
                                { num: '1,000,000+', label: t('सफल पूजन', 'Poojas Performed') },
                                { num: '100,000+', label: t('संतुष्ट भक्तगण', 'Happy Devotees') },
                                { num: '50+', label: t('पूजा प्रकार', 'Service Types') },
                            ].map(s => (
                                <div className="hero-stat" key={s.num}>
                                    <span className="hero-stat-number">{s.num}</span>
                                    <span className="hero-stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-visual-ring">
                            <img src="/images/gallery/devi-shringar.jpg" alt={t('माँ का पुष्प श्रृंगार — काशी', 'Floral adornment of the Goddess — Kashi')} width="640" height="640" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>

            {/* TRIPTYCH */}
            <section className="section" style={{ paddingBottom: 0 }}>
                <div className="container">
                    <div className="triptych">
                        {triptych.map(item => (
                            <Link className="triptych-card" key={item.capEn} to={item.link}>
                                <img src={item.src} alt={item.capEn} loading="lazy" />
                                <div className="triptych-overlay">
                                    <span className="triptych-caption">{t(item.capHi, item.capEn)} <span className="arrow">›</span></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS — 3-Step Process Flow */}
            <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: '1rem' }}>
                <div className="container">
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('प्रक्रिया', 'How It Works')}</span>
                        <h2 className="section-title">{t('तीन सरल चरणों में पूजा', 'Your Pooja, in 3 Simple Steps')}</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem', position: 'relative' }}>
                        {[
                            {
                                num: '1',
                                title: t('पूजा चुनें व संकल्प विवरण दें', 'Choose Your Pooja & Share Sankalp Details'),
                                desc: t('अपनी आवश्यकता अनुसार पूजा चुनें और अपना नाम, गोत्र व संकल्प विवरण साझा करें।', 'Select the pooja you need and share your name, gotra & sankalp details with us.'),
                            },
                            {
                                num: '2',
                                title: t('काशी के पंडितों द्वारा लाइव वैदिक अनुष्ठान', 'Live Vedic Ritual by Kashi Pandits'),
                                desc: t('हमारे अनुभवी पंडितगण शास्त्रोक्त विधि-विधान से आपकी पूजा सम्पन्न करते हैं।', 'Our experienced Pandits perform your pooja exactly as prescribed by the scriptures.'),
                            },
                            {
                                num: '3',
                                title: t('WhatsApp पर वीडियो प्रमाण व प्रसाद प्राप्ति', 'Video Proof & Prasad on WhatsApp'),
                                desc: t('पूजा का वीडियो प्रमाण WhatsApp पर प्राप्त करें एवं प्रसाद अपने पते पर मंगवाएं।', 'Receive video proof of your pooja on WhatsApp, and have prasad delivered to your address.'),
                            },
                        ].map((step, i) => (
                            <div key={step.num} className={`fade-up stagger-${i + 1}`} style={{ position: 'relative', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 1.5rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '48px', height: '48px', margin: '0 auto 1rem', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', color: 'var(--navy-950)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800,
                                    fontFamily: 'var(--font-heading)', boxShadow: 'var(--shadow-md)',
                                }}>
                                    {step.num}
                                </div>
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VEDIC TRUST & AUTHENTICITY BADGES */}
            <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: '1rem' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div style={{ background: 'white', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <img src="/images/icons/vedic-manuscript.jpg" alt="" width="48" height="48" loading="lazy" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                    {t('४००+ वर्षों की वैदिक परम्परा', '400+ Years Vedic Lineage')}
                                </h3>
                                <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {t('महामहोपाध्याय पं. अयोध्या नाथ शर्मा से डॉ. उमंग नाथ शर्मा तक तीन पीढ़ियों की विरासत।', 'Authentic hereditary Sharma tradition continuing across generations in Varanasi.')}
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'white', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <img src="/images/icons/ganga-rituals.jpg" alt="" width="48" height="48" loading="lazy" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                    {t('१००% प्रामाणिक गंगा घाट पूजन', '100% Authentic Ganga Rituals')}
                                </h3>
                                <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {t('दशाश्वमेध एवं मणिकर्णिका घाट पर शुद्ध वैदिक ब्राह्मणों द्वारा विधिपूर्वक संकल्प।', 'Solemnized on sacred Kashi Ghats with pure Gangajal, Bhasma & sacred samagri.')}
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'white', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <img src="/images/icons/live-video-pooja.jpg" alt="" width="48" height="48" loading="lazy" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                    {t('लाइव संकल्प एवं वीडियो प्रमाण', 'Live Sankalp & Video Proof')}
                                </h3>
                                <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {t('आपके नाम व गोत्र से पूजन के उपरांत वीडियो प्रमाण सीधे WhatsApp पर प्रेषित।', 'Personalized HD video proof with your Name & Gotra dispatched directly to WhatsApp.')}
                                </p>
                            </div>
                        </div>

                        <div style={{ background: 'white', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <img src="/images/icons/astrologer-analysis.jpg" alt="" width="48" height="48" loading="lazy" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                    {t('वास्तविक ज्योतिषी विश्लेषण', 'Real Astrologer Analysis')}
                                </h3>
                                <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {t('कोई ऑटोमेटेड सॉफ्टवेयर नहीं — डॉ. उमang नाथ शर्मा द्वारा व्यक्तिगत कुंडली परीक्षण।', 'Zero generic computer bot readings. Hand-analyzed Janam Patrika from Kashi.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* LEGACY & GLOBAL RECOGNITION — our strongest differentiator (a
                400-year, three-generation lineage trusted by heads of state
                and covered by international media) lives on the About page;
                this teaser surfaces it here so visitors see it without
                having to scroll deep into About Us. */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('विरासत', 'Our Legacy')}</span>
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('चार शताब्दियों की विरासत, विश्व स्तर पर सम्मानित', 'Four Centuries of Legacy, Recognized on the World Stage')}</h2>
                        <p className="section-subtitle">{t('महामहोपाध्याय पं. अयोध्या नाथ शर्मा से डॉ. उमंग नाथ शर्मा तक — तीन पीढ़ियाँ, एक अखंड परम्परा', 'From Mahamahopadhyaya Pt. Ayodhya Nath Sharma to Dr. Umang Nath Sharma — three generations, one unbroken tradition')}</p>
                    </div>
                    <div className="stats-grid" style={{ marginTop: '2rem' }}>
                        {heritageSummary.map(h => (
                            <div className="stat-card" key={h.labelEn}>
                                <img src={`/images/icons/${h.img}.jpg`} alt="" width="52" height="52" loading="lazy" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.5rem' }} />
                                <div className="stat-label" style={{ fontWeight: 700, color: 'var(--gold-300)', marginBottom: '0.35rem' }}>{t(h.label, h.labelEn)}</div>
                                <div className="stat-label" style={{ fontSize: '0.8rem' }}>{t(h.desc, h.descEn)}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '2.5rem' }}>
                        {testimonials.filter(tst => tst.notable).map(tst => (
                            <div key={tst.name} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                                <p style={{ color: 'white', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '0.85rem' }}>
                                    "{t(tst.quoteHi, tst.quoteEn)}"
                                </p>
                                <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FlagIcon flag={tst.flag} /> {t(tst.notableHi, tst.notableEn)}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{tst.name} — {tst.place}</div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/about" className="btn btn-primary">
                            {t('हमारी पूरी गाथा पढ़ें →', 'Read Our Full Legacy →')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* FREE KUNDLI HIGHLIGHT CALLOUT */}
            <section className="section" style={{ padding: '1.5rem 0' }}>
                <div className="container">
                    <div style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 100%)', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', border: '1px solid rgba(212,168,67,0.3)', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ maxWidth: '650px' }}>
                            <span style={{ background: 'rgba(212,168,67,0.2)', color: 'var(--gold-400)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.6rem' }}>
                                🔮 {t('विशेष सेवा — निःशुल्क जन्म कुंडली', 'Special Service — Free Janam Kundli')}
                            </span>
                            <h2 style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: 'white', fontFamily: 'var(--font-heading)' }}>
                                {t('अपनी कुंडली का निःशुल्क परीक्षण करवाएं', 'Get Your Free Kundli Analysis by a Real Kashi Astrologer')}
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                                {t('विवाह विलंब, करियर, कालसर्प अथवा पितृ दोष? डॉ. उमंग नाथ शर्मा स्वयं आपकी जन्म पत्रिका का विश्लेषण करेंगे।', 'Facing career obstacles, marriage delay, or planetary doshas? Submit birth details for personalized Vedic guidance.')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Link to="/free-kundli" className="btn btn-primary btn-lg" style={{ boxShadow: '0 4px 15px rgba(212,168,67,0.4)' }}>
                                📜 {t('फ्री कुंडली फॉर्म भरें', 'Check Free Kundli Now')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* LIVE DAILY PANCHANG & SHUBH MUHURAT */}
            <section className="section" style={{ paddingTop: '1rem', paddingBottom: '2.5rem' }}>
                <div className="container">
                    <DailyPanchangCard />
                </div>
            </section>

            {/* ASTROLOGY CONSULTATION */}
            <section className="section section-warm" id="astrology-consultation">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('ज्योतिष परामर्श', 'Astrology Consultation')}</span>
                        <h2 className="section-title">{t('डॉ. उमंग नाथ शर्मा से ज्योतिष परामर्श लें', 'Astrology Consultation with Dr. Umang Nath Sharma')}</h2>
                        <p className="section-subtitle">
                            {t(
                                'कुंडली विश्लेषण, ग्रह दोष निवारण, विवाह मिलान एवं जीवन की प्रत्येक समस्या का ज्योतिषीय समाधान — काशी की 400 वर्षों से अधिक पुरातन परम्परा के साथ।',
                                'Kundli analysis, planetary dosh remedies, marriage matching, and astrological solutions for every concern of life — upheld by over 400 years of Kashi tradition.'
                            )}
                        </p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="astro-consult-grid">
                        <div className="astro-consult-photo fade-up">
                            <Link to="/pt-umang-nath-sharma">
                                <img src="/images/heritage/umang-with-ayodhya-portrait.jpg" alt={t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')} loading="lazy" />
                            </Link>
                        </div>
                        <div className="astro-consult-options">
                            <div className="astro-consult-card fade-up">
                                <span className="astro-consult-icon">🏛️</span>
                                <h3>{t('ऑफलाइन परामर्श', 'Offline Consultation')}</h3>
                                <p>
                                    {t(
                                        'प्रातः 9 से मध्याह्न 12 बजे के मध्य स्वयं हमारे स्थान (वाराणसी) पर पधारकर व्यक्तिगत रूप से परामर्श प्राप्त करें।',
                                        'Visit us directly at our location in Varanasi between 9 AM – 12 PM for a personal, in-person consultation.'
                                    )}
                                </p>
                            </div>
                            <div className="astro-consult-card fade-up stagger-2">
                                <span className="astro-consult-icon">🌐</span>
                                <h3>{t('ऑनलाइन परामर्श', 'Online Consultation')}</h3>
                                <p>
                                    {t(
                                        'देश-विदेश में कहीं से भी — WhatsApp पर पूछताछ करें अथवा अपनी अपॉइंटमेंट सुनिश्चित करें।',
                                        'From anywhere across the globe — send an enquiry on WhatsApp or secure your appointment.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center fade-up" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/free-kundli" className="btn btn-gold btn-lg">✦ {t('निःशुल्क कुंडली मांगें', 'Request Free Kundli')}</Link>
                        <a href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मुझे ज्योतिष परामर्श के लिए अपॉइंटमेंट चाहिए।', 'Hello! I would like to book an astrology consultation appointment.'))}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 {t('अपॉइंटमेंट के लिए पूछें', 'Enquire for Appointment')}</a>
                        <Link to="/contact" className="btn btn-outline btn-lg">📅 {t('अपॉइंटमेंट बुक करें', 'Book Appointment')}</Link>
                    </div>
                </div>
            </section>

            {/* SERVICES PREVIEW */}
            <section className="section" id="services-preview">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('हमारी सेवाएं', 'Our Services')}</span>
                        <h2 className="section-title">{t('पवित्र पूजा एवं अनुष्ठान', 'Sacred Poojas & Rituals')}</h2>
                        <p className="section-subtitle">{t('काशी (बनारस) के मनीषी पंडितों द्वारा शास्त्रोक्त विधि-विधान से समस्त प्रकार की पूजा, पाठ, जप और हवन सम्पन्न करवाएं।', 'Avail every form of pooja, paath, jaap and havan, performed by erudite Pandits of Kashi (Banaras) in strict accordance with authentic Vedic methods.')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="icon-service-grid">
                        {servicesData.map((service, i) => {
                            const images = {
                                'vipreet-pratyangira': 'service-vipreet-pratyangira',
                                'mahavidya-paath': 'service-mahavidya-paath',
                                'tripindi-shradh': 'service-tripindi-shradh',
                                'kalsarp-dosh': 'service-kalsarp-dosh',
                                'rudrabhishek': 'service-rudrabhishek',
                                'shree-suktam': 'service-shree-suktam',
                                'kanakdhara-stotra': 'service-kanakdhara-stotra',
                                'ganesh-atharvashirsha': 'service-ganesh-atharvashirsha',
                                'purush-suktam': 'service-purush-suktam',
                                'kumbh-vivah': 'service-kumbh-vivah',
                                'astrology-consultation': 'service-astrology-consultation',
                            };
                            return (
                                <div className={`icon-service-card fade-up stagger-${(i % 5) + 1}`} key={service.id}>
                                    <img src={`/images/icons/${images[service.id] || 'service-astrology-consultation'}.jpg`} alt="" width="64" height="64" loading="lazy" className="icon-service-icon-img" />
                                    <h3 className="icon-service-title">{lang === 'hi' ? service.name : service.nameEn}</h3>
                                    <p className="icon-service-desc">{lang === 'hi' ? service.shortDesc : (service.shortDescEn || service.shortDesc)}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <a
                                            href={`https://wa.me/919278148269?text=${encodeURIComponent(t(`प्रणाम, मुझे ${service.name} पूजा काशी में करवानी है।`, `Pranam, I would like to book ${service.nameEn} pooja in Kashi.`))}`}
                                            target="_blank" rel="noreferrer"
                                            className="icon-service-link"
                                            style={{ color: 'var(--whatsapp-dark)' }}
                                        >
                                            {t('WhatsApp बुक करें', 'WhatsApp Book')}
                                        </a>
                                        <span style={{ color: 'var(--border-light)' }}>|</span>
                                        <Link to={`/services/${service.id}`} className="icon-service-link">{t('विधि व महत्व', 'Know More')} →</Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/services" className="btn btn-gold">{t('सभी सेवाएं देखें →', 'View All Services →')}</Link>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="section section-warm" id="why-us">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('हमें क्यों चुनें?', 'Why Choose Us?')}</span>
                        <h2 className="section-title">{t('काशी की परम्परा, आपके द्वार', "Kashi's Tradition, At Your Door")}</h2>
                        <p className="section-subtitle">{t('सहस्राब्दियों की आध्यात्मिक परम्परा के वाहक, बनारस के अनुभवसम्पन्न पंडित — अब ऑनलाइन सुलभ।', 'Accomplished Pandits of Banaras, upholding millennia of spiritual tradition — now accessible online.')}</p>
                    </div>
                    <div className="om-divider"><img src="/images/logo.png" alt="" className="inline-logo-md" width="512" height="512" /></div>
                    <div className="features-grid">
                        {[
                            { img: 'institutional-recognition', title: t('काशी के विद्वत्तापूर्ण पंडित', 'Erudite Pandits of Kashi'), desc: t('बनारस हिंदू विश्वविद्यालय और संस्कृत विद्यापीठ से शिक्षित, अनुभवसम्पन्न एवं प्रमाणित पंडितगण।', 'Accomplished, certified Pandits, educated at Banaras Hindu University and Sanskrit Vidyapeeth.') },
                            { img: 'vedic-manuscript', title: t('शास्त्रोक्त विधि-विधान', 'Authentic Vedic Methods'), desc: t('वेद एवं शास्त्रों के अनुसार शुद्ध विधि-विधान से सम्पूर्ण पूजन कार्य सम्पन्न।', 'Every ritual performed with precision, exactly as prescribed by the Vedas and scriptures.') },
                            { img: 'online-booking', title: t('ऑनलाइन बुकिंग', 'Online Booking'), desc: t('गृह बैठे सुगमता से पूजा बुक करें। WhatsApp अथवा वेबसाइट से त्वरित बुकिंग।', 'Book a pooja with ease, from the comfort of home. Swift booking via WhatsApp or our website.') },
                            { img: 'live-video-pooja', title: t('लाइव पूजा विकल्प', 'Live Pooja Option'), desc: t('वीडियो कॉल के माध्यम से पूजा में सम्मिलित हों — देश-विदेश में कहीं से भी।', 'Join your pooja live via video call — from anywhere across the globe.') },
                            { img: 'samagri-delivery', title: t('पूजा सामग्री डिलीवरी', 'Pooja Samagri Delivery'), desc: t('पूजा हेतु आवश्यक समस्त सामग्री — सम्पूर्ण भारत में डिलीवरी उपलब्ध।', 'Every material essential to your pooja — delivered anywhere across India.') },
                            { img: 'fair-pricing', title: t('उचित दक्षिणा', 'Fair Pricing'), desc: t('समस्त पूजा सेवाओं का मूल्य पारदर्शी एवं उचित। कोई छुपी हुई लागत नहीं।', 'Transparent, equitable pricing on every service. No hidden costs, ever.') },
                        ].map((f, i) => (
                            <div className={`feature-card fade-up stagger-${i + 1}`} key={i}>
                                <img src={`/images/icons/${f.img}.jpg`} alt="" width="56" height="56" loading="lazy" className="feature-icon-img" />
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who this is for - audience segments */}
            <section className="section">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('किसके लिए है', "Who It's For")}</span>
                        <h2 className="section-title">{t('हर भक्त के लिए उपयुक्त', 'Designed for Every Devotee')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { img: 'individuals-praying', title: t('व्यक्तिगत भक्त', 'Individuals'), desc: t('स्वयं की मनोकामना पूर्ति, दोष निवारण अथवा नियमित पूजा-पाठ हेतु।', 'For your own wishes, dosh remedies, or regular pooja-paath.') },
                            { img: 'families-pooja', title: t('परिवार', 'Families'), desc: t('पितृ श्राद्ध, वंश-वृद्धि, विवाह में बाधा निवारण जैसे पारिवारिक अनुष्ठान।', 'Family rituals like ancestral rites, lineage blessings, and marriage-obstacle remedies.') },
                            { img: 'nri-abroad', title: t('प्रवासी भारतीय (NRI)', 'NRIs Abroad'), desc: t('विदेश में रहते हुए भी लाइव वीडियो के साथ अपने नाम व गोत्र से पूजा करवाएं।', 'Have a pooja performed in your name and gotra, live on video, from anywhere in the world.') },
                            { img: 'business-pooja', title: t('व्यवसायी', 'Businesses'), desc: t('व्यापार वृद्धि, वास्तु दोष निवारण एवं कार्यालय हेतु शुभ पूजा।', 'Business growth, vastu dosh remedies, and auspicious poojas for your office.') },
                        ].map((seg, i) => (
                            <div className={`feature-card fade-up stagger-${i + 1}`} key={i}>
                                <img src={`/images/icons/${seg.img}.jpg`} alt="" width="56" height="56" loading="lazy" className="feature-icon-img" />
                                <h3 className="feature-title">{seg.title}</h3>
                                <p className="feature-desc">{seg.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured In - compact press strip, links to full showcase on About page */}
            <section className="section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div className="container">
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                        {t('मीडिया एवं मान्यता', 'As Featured In')}
                    </p>
                    <Link to="/about#press" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(1rem, 4vw, 2.5rem)', textDecoration: 'none' }}>
                        {[
                            { img: 'press-bbc', label: 'BBC London' },
                            { img: 'press-newspaper', label: 'दैनिक जागरण' },
                            { img: 'us-doctorate', label: t('अमेरिकी डॉक्टरेट', 'US Doctorate') },
                            { img: 'handshake-trust', label: t('भूतपूर्व उपराष्ट्रपति', 'Former Vice President') },
                        ].map((m, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                <img src={`/images/icons/${m.img}.jpg`} alt="" width="28" height="28" loading="lazy" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} /> {m.label}
                            </span>
                        ))}
                    </Link>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section" id="testimonials">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('भक्तों के अनुभव', 'Devotee Experiences')}</span>
                        <h2 className="section-title">{t('हमारे भक्तगण क्या कहते हैं', 'In Our Devotees\' Own Words')}</h2>
                    </div>
                    <div className="testimonials-grid">
                        {(liveReviews || [
                            {
                                text: t('बनारस से दूर रहकर भी काशी के पंडित जी द्वारा इतनी शुद्ध विधि से पूजा करवा पाना बहुत अच्छा अनुभव रहा। पूरे परिवार को शांति मिली।', 'Even while living far from Banaras, having the pooja performed so authentically by a Kashi Pandit was a wonderful experience. Our whole family found peace.'),
                                name: 'राजेश शर्मा', loc: t('दिल्ली, भारत', 'Delhi, India'), av: 'र', rating: 5,
                            },
                            {
                                text: t('महामृत्युंजय जप के बाद पत्नी की तबियत में चमत्कारिक सुधार हुआ। पंडित जी का ज्ञान और विधि दोनों अद्भुत हैं। बहुत आभारी हूँ।', "After the Mahamrityunjay Jaap, my wife's health improved remarkably. The Pandit's knowledge and method were both wonderful. Very grateful."),
                                name: 'Suresh Patel', loc: t('मुंबई, भारत', 'Mumbai, India'), av: 'S', rating: 5,
                            },
                            {
                                text: t('अमेरिका में रहते हुए हमारे गृह प्रवेश के लिए प्रामाणिक काशी पंडित मिलना मुश्किल था। इनकी ऑनलाइन सेवा अद्भुत रही — बिल्कुल बनारस में होने जैसा अनुभव!', 'Being in the US, I missed having authentic Kashi pandits for our Griha Pravesh. Their online service was incredible — felt like being right in Banaras!'),
                                name: 'Priya Gupta', loc: t('न्यू जर्सी, अमेरिका', 'New Jersey, USA'), av: 'P', rating: 5,
                            },
                        ]).map((tst, i) => {
                            // Live reviews from the API use {name, text, rating, location, serviceName};
                            // static fallback uses {name, text, loc, av, rating}.
                            const displayLoc = tst.loc || tst.location || tst.serviceName || '';
                            const displayAv = tst.av || (tst.name || '?').trim().charAt(0).toUpperCase();
                            const stars = '★'.repeat(tst.rating || 5) + '☆'.repeat(5 - (tst.rating || 5));
                            return (
                                <div className={`testimonial-card fade-up stagger-${i + 1}`} key={tst._id || i}>
                                    <div className="testimonial-stars">{stars}</div>
                                    <div className="testimonial-quote">"</div>
                                    <p className="testimonial-text">{tst.text}</p>
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar">{displayAv}</div>
                                        <div>
                                            <div className="testimonial-name">{tst.name}</div>
                                            <div className="testimonial-location">{displayLoc}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* VIDEOS */}
            <section className="section section-dark" id="videos">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('जीवंत झलकियाँ', 'Live Glimpses')}</span>
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('वीडियो में हमारी पूजा सेवाएं', 'Our Pooja Services, Captured on Video')}</h2>
                        <p style={{ color: 'var(--warm-200)', marginTop: '0.5rem' }}>{t('वास्तविक अनुष्ठानों की सजीव झलक — यथावत, बिना किसी बनावट के', 'Authentic ceremonies, exactly as they unfold')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>

                    <div className="video-showcase-grid" style={{ marginBottom: '2.5rem' }}>
                        {videoClips.map(clip => (
                            <div className="video-showcase-card" key={clip.src}>
                                <video controls preload="none" poster={clip.poster} playsInline>
                                    <source src={clip.src} type="video/mp4" />
                                </video>
                                <p className="video-showcase-caption">{t(clip.capHi, clip.capEn)}</p>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ textAlign: 'center', color: 'var(--gold-300)', marginBottom: '1rem', fontFamily: 'var(--font-hindi)' }}>
                        {t('हमारे YouTube चैनल पर और देखें', 'See More on Our YouTube Channel')}
                    </h3>
                    <div className="youtube-embed-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/videoseries?list=${youtubeUploadsPlaylistId}`}
                            title="YouTube video playlist"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                    <div className="text-center" style={{ marginTop: '1.5rem' }}>
                        <a href={`https://www.youtube.com/channel/${youtubeChannelId}`} target="_blank" rel="noreferrer" className="btn btn-primary">
                            <SquarePlay size={16} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('YouTube पर सब्सक्राइब करें', 'Subscribe on YouTube')}
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section" id="cta">
                <div className="cta-bg">
                    <img src="/images/gallery/havan-group.jpg" alt={t('सामूहिक हवन — काशी', 'Collective havan in Kashi')} width="1280" height="720" loading="lazy" />
                </div>
                <div className="cta-overlay" />
                <div className="cta-content container">
                    <div className="hero-om" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>ॐ</div>
                    <h2 className="cta-title fade-up">{t('आज ही पूजा बुक करें', 'Book Your Pooja Today')}</h2>
                    <p className="cta-subtitle fade-up">
                        {t(
                            <>काशी के अनुभवसम्पन्न पंडितों से शास्त्रोक्त विधि-विधान द्वारा पूजा सम्पन्न करवाएं।<br />WhatsApp पर तत्काल बुकिंग उपलब्ध।</>,
                            <>Have your pooja performed authentically by accomplished Pandits of Kashi.<br />Instant booking available on WhatsApp.</>
                        )}
                    </p>
                    <div className="cta-actions fade-up">
                        <Link to="/booking" className="btn btn-primary btn-lg">📅 {t('अभी बुक करें', 'Book Now')}</Link>
                        <a href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार!', 'Hello!'))}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 {t('WhatsApp पर बात करें', 'Chat on WhatsApp')}</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
