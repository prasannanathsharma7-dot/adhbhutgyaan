import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import { triptych, videoClips, youtubeUploadsPlaylistId, youtubeChannelId } from '../data/media';
import useSEO from '../hooks/useSEO';

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
    // Only autoplay the ambient hero clip when the visitor hasn't asked their
    // device to reduce motion; otherwise the still image is shown instead.
    const [playHeroVideo, setPlayHeroVideo] = useState(false);
    const [heroVideoOk, setHeroVideoOk] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => setPlayHeroVideo(!mq.matches);
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

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
        description: t('पं. उमंग नाथ शर्मा (काशी, वाराणसी) द्वारा रुद्राभिषेक, कालसर्प दोष, त्रिपिंडी श्राद्ध जैसी सभी पूजा सेवाएं — ऑनलाइन या वाराणसी में प्रत्यक्ष बुक करें।', 'Book Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh and other authentic poojas with Pt. Umang Nath Sharma and the pandits of Kashi (Varanasi) — online or in person in Banaras.'),
        path: '/',
    });

    return (
        <div ref={pageRef}>
            {/* HERO */}
            <section className="hero" id="hero">
                <div className="hero-bg">
                    {playHeroVideo && heroVideoOk ? (
                        <video
                            src="/videos/hero-diyas.mp4"
                            poster="/images/havan-samuhik-wide.png"
                            autoPlay
                            muted
                            loop
                            playsInline
                            aria-hidden="true"
                            onError={() => setHeroVideoOk(false)}
                        />
                    ) : (
                        <img src="/images/havan-samuhik-wide.png" alt={t('काशी में सम्पन्न सामूहिक हवन', 'Collective havan performed in Kashi')} width="1400" height="788" fetchPriority="high" />
                    )}
                </div>
                <div className="hero-overlay" />
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-om">ॐ</div>
                        <h1 className="hero-title-hindi">{t('अद्भुत ज्ञान', 'Adhbhut Gyaan')}</h1>
                        <p className="hero-title-en">{t('पं. उमंग नाथ शर्मा — काशी, वाराणसी', 'Pt. Umang Nath Sharma — Kashi, Varanasi')}</p>
                        <p className="hero-desc">
                            {t(
                                <>बनारस (काशी) के अनुभवी और विद्वान पंडितों द्वारा<br />सभी प्रकार की पूजा, पाठ, जप, हवन एवं ज्योतिष परामर्श<br /><strong style={{ color: 'var(--gold-300)' }}>घर बैठे ऑनलाइन बुक करें</strong></>,
                                <>Authentic pooja, paath, jaap, havan &amp; astrology consultation<br />by experienced, learned Pandits of Banaras (Kashi)<br /><strong style={{ color: 'var(--gold-300)' }}>Book online from anywhere in the world</strong></>
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
                            <div className="triptych-card" key={item.capEn}>
                                <img src={item.src} alt={item.capEn} loading="lazy" />
                                <div className="triptych-overlay">
                                    <span className="triptych-caption">{t(item.capHi, item.capEn)} <span className="arrow">›</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES PREVIEW */}
            <section className="section" id="services-preview">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('हमारी सेवाएं', 'Our Services')}</span>
                        <h2 className="section-title">{t('पवित्र पूजा एवं अनुष्ठान', 'Sacred Poojas & Rituals')}</h2>
                        <p className="section-subtitle">{t('काशी (बनारस) के विद्वान पंडितों द्वारा शास्त्रोक्त विधि से सभी प्रकार की पूजा, पाठ, जप और हवन सम्पन्न करवाएं।', 'Get every kind of pooja, paath, jaap and havan performed by learned Pandits of Kashi (Banaras) according to authentic Vedic methods.')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="icon-service-grid">
                        {servicesData.map((service, i) => {
                            const icons = {
                                'vipreet-pratyangira': '🔥',
                                'mahavidya-paath': '🕉️',
                                'tripindi-shradh': '🙏',
                                'kalsarp-dosh': '🔯',
                                'rudrabhishek': '🔱',
                                'shree-suktam': '🪷',
                                'kanakdhara-stotra': '✨',
                                'ganesh-atharvashirsha': '🐘',
                                'purush-suktam': '📿',
                                'kumbh-vivah': '💍',
                            };
                            return (
                                <div className={`icon-service-card fade-up stagger-${(i % 5) + 1}`} key={service.id}>
                                    <div className="icon-service-icon">{icons[service.id] || '🕉️'}</div>
                                    <h3 className="icon-service-title">{lang === 'hi' ? service.name : service.nameEn}</h3>
                                    <p className="icon-service-desc">{service.shortDesc}</p>
                                    <Link to={`/services#${service.id}`} className="icon-service-link">{t('विवरण देखें', 'Know More')} →</Link>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/services" className="btn btn-gold">{t('सभी सेवाएं देखें →', 'View All Services →')}</Link>
                    </div>
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
                                'कुंडली विश्लेषण, ग्रह दोष निवारण, विवाह मिलान और जीवन की हर समस्या का ज्योतिषीय समाधान — काशी की 400+ वर्षों की परम्परा के साथ।',
                                'Kundli analysis, planetary dosh remedies, marriage matching, and astrological solutions for every life concern — backed by 400+ years of Kashi tradition.'
                            )}
                        </p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="astro-consult-grid">
                        <div className="astro-consult-photo fade-up">
                            <img src="/images/heritage/umang-with-ayodhya-portrait.jpg" alt={t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')} loading="lazy" />
                        </div>
                        <div className="astro-consult-options">
                            <div className="astro-consult-card fade-up">
                                <span className="astro-consult-icon">🏛️</span>
                                <h3>{t('ऑफलाइन परामर्श', 'Offline Consultation')}</h3>
                                <p>
                                    {t(
                                        'सुबह 9 बजे से दोपहर 12 बजे के बीच सीधे हमारे स्थान (वाराणसी) पर आकर व्यक्तिगत रूप से परामर्श लें।',
                                        'Visit us directly at our location in Varanasi between 9 AM – 12 PM for an in-person consultation.'
                                    )}
                                </p>
                            </div>
                            <div className="astro-consult-card fade-up stagger-2">
                                <span className="astro-consult-icon">🌐</span>
                                <h3>{t('ऑनलाइन परामर्श', 'Online Consultation')}</h3>
                                <p>
                                    {t(
                                        'देश-विदेश कहीं से भी — WhatsApp पर पूछताछ करें या अपनी अपॉइंटमेंट बुक करें।',
                                        'From anywhere in the world — send an enquiry on WhatsApp or book your appointment.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center fade-up" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मुझे ज्योतिष परामर्श के लिए अपॉइंटमेंट चाहिए।', 'Hello! I would like to book an astrology consultation appointment.'))}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 {t('अपॉइंटमेंट के लिए पूछें', 'Enquire for Appointment')}</a>
                        <Link to="/contact" className="btn btn-outline btn-lg">📅 {t('अपॉइंटमेंट बुक करें', 'Book Appointment')}</Link>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="section section-warm" id="why-us">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('हमें क्यों चुनें?', 'Why Choose Us?')}</span>
                        <h2 className="section-title">{t('काशी की परम्परा, आपके द्वार', "Kashi's Tradition, At Your Door")}</h2>
                        <p className="section-subtitle">{t('हजारों वर्षों की आध्यात्मिक परम्परा के वाहक, बनारस के अनुभवी पंडित — अब ऑनलाइन उपलब्ध।', 'Experienced Pandits of Banaras, carrying forward thousands of years of spiritual tradition — now available online.')}</p>
                    </div>
                    <div className="om-divider"><img src="/images/logo.png" alt="" className="inline-logo-md" width="512" height="512" /></div>
                    <div className="features-grid">
                        {[
                            { icon: '🏛️', title: t('काशी के विद्वान पंडित', 'Learned Pandits of Kashi'), desc: t('बनारस हिंदू विश्वविद्यालय और संस्कृत विद्यापीठ से शिक्षित, अनुभवी एवं प्रमाणित पंडित।', 'Experienced, certified Pandits educated at Banaras Hindu University and Sanskrit Vidyapeeth.') },
                            { icon: '📖', title: t('शास्त्रोक्त विधि', 'Authentic Vedic Methods'), desc: t('वेद और शास्त्रों के अनुसार शुद्ध विधि-विधान से सम्पूर्ण पूजन कार्य सम्पन्न।', 'Every ritual performed exactly as prescribed by the Vedas and scriptures.') },
                            { icon: '🌐', title: t('ऑनलाइन बुकिंग', 'Online Booking'), desc: t('घर बैठे आसानी से पूजा बुक करें। WhatsApp या वेबसाइट से तुरंत बुकिंग।', 'Book a pooja easily from home. Instant booking via WhatsApp or our website.') },
                            { icon: '📹', title: t('लाइव पूजा विकल्प', 'Live Pooja Option'), desc: t('वीडियो कॉल के माध्यम से पूजा में शामिल हों — देश-विदेश कहीं से भी।', 'Join your pooja live via video call — from anywhere in the world.') },
                            { icon: '📦', title: t('पूजा सामग्री डिलीवरी', 'Pooja Samagri Delivery'), desc: t('पूजा के लिए आवश्यक सभी सामग्री — पूरे भारत में डिलीवरी उपलब्ध।', 'All materials needed for your pooja — delivered anywhere in India.') },
                            { icon: '💰', title: t('उचित दक्षिणा', 'Fair Pricing'), desc: t('सभी पूजा सेवाओं की कीमत पारदर्शी और उचित। कोई छुपी लागत नहीं।', 'Transparent, fair pricing on every service. No hidden costs.') },
                        ].map((f, i) => (
                            <div className={`feature-card fade-up stagger-${i + 1}`} key={i}>
                                <span className="feature-icon">{f.icon}</span>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section" id="testimonials">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">{t('भक्तों के अनुभव', 'Devotee Experiences')}</span>
                        <h2 className="section-title">{t('हमारे भक्तगण क्या कहते हैं', 'What Our Devotees Say')}</h2>
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
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('वीडियो में हमारी पूजा सेवाएं', 'Our Pooja Services in Video')}</h2>
                        <p style={{ color: 'var(--warm-200)', marginTop: '0.5rem' }}>{t('वास्तविक अनुष्ठानों की झलक — जैसा है वैसा', 'Real ceremonies, exactly as they happen')}</p>
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
                            ▶️ {t('YouTube पर सब्सक्राइब करें', 'Subscribe on YouTube')}
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section" id="cta">
                <div className="cta-bg">
                    <img src="/images/havan-samuhik-wide.png" alt={t('सामूहिक हवन — काशी', 'Collective havan in Kashi')} width="1400" height="788" loading="lazy" />
                </div>
                <div className="cta-overlay" />
                <div className="cta-content container">
                    <div className="hero-om" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>ॐ</div>
                    <h2 className="cta-title fade-up">{t('आज ही पूजा बुक करें', 'Book Your Pooja Today')}</h2>
                    <p className="cta-subtitle fade-up">
                        {t(
                            <>काशी के अनुभवी पंडितों से शास्त्रोक्त विधि से पूजा करवाएं।<br />WhatsApp पर तुरंत बुकिंग उपलब्ध।</>,
                            <>Get your pooja performed authentically by experienced Pandits of Kashi.<br />Instant booking available on WhatsApp.</>
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
