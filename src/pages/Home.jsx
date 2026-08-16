import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';

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

    return (
        <div ref={pageRef}>
            {/* HERO */}
            <section className="hero" id="hero">
                <div className="hero-bg">
                    <img src="/images/hero-banaras.jpg" alt="Varanasi Ghats at Sunrise" />
                </div>
                <div className="hero-overlay" />
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-om">ॐ</div>
                        <h1 className="hero-title-hindi">{t('काशी पूजा सेवा', 'Kashi Pooja Seva')}</h1>
                        <p className="hero-title-en">{t('Kashi Pooja Seva', 'काशी पूजा सेवा')}</p>
                        <p className="hero-desc">
                            {t(
                                <>बनारस (काशी) के अनुभवी और विद्वान पंडितों द्वारा<br />सभी प्रकार की पूजा, पाठ, जप और हवन सेवाएं<br /><strong style={{ color: 'var(--gold-300)' }}>घर बैठे ऑनलाइन बुक करें</strong></>,
                                <>Authentic pooja, paath, jaap &amp; havan services<br />by experienced, learned Pandits of Banaras (Kashi)<br /><strong style={{ color: 'var(--gold-300)' }}>Book online from anywhere in the world</strong></>
                            )}
                        </p>
                        <div className="hero-actions">
                            <Link to="/services" className="btn btn-primary btn-lg"><img src="/images/logo.png" alt="" className="inline-logo" /> {t('सेवाएं देखें', 'View Services')}</Link>
                            <a href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं पूजा बुक करना चाहता हूँ।', 'Hello! I would like to book a pooja.'))}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">💬 {t('WhatsApp करें', 'WhatsApp Us')}</a>
                        </div>
                        <div className="hero-stats">
                            {[
                                { num: '25+', label: t('वर्षों का अनुभव', 'Years of Experience') },
                                { num: '10,000+', label: t('सफल पूजन', 'Poojas Performed') },
                                { num: '5,000+', label: t('संतुष्ट भक्तगण', 'Happy Devotees') },
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
                            <img src="/images/bada-ganesh-ji.png" alt="Bada Ganesh Ji - Varanasi" />
                        </div>
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
                    <div className="service-card-grid">
                        {servicesData.map((service, i) => {
                            return (
                                <div className={`card fade-up stagger-${i + 1}`} key={service.id}>
                                    <div className="card-image-wrapper">
                                        <img src={`/images/${service.image}`} alt={service.nameEn} className="card-image" loading="lazy" />
                                        <span className="card-badge">{service.bestTimeEn}</span>
                                    </div>
                                    <div className="card-body">
                                        <h3 className="card-title">{lang === 'hi' ? service.name : service.nameEn}</h3>
                                        {lang === 'hi' && <p className="card-title-en">{service.nameEn}</p>}
                                        <p className="card-desc">{service.shortDesc}</p>
                                        <div className="card-actions">
                                            <Link to={`/services#${service.id}`} className="btn btn-primary btn-sm">{t('विवरण देखें', 'View Details')}</Link>
                                            <a
                                                href={`https://wa.me/919278148269?text=${encodeURIComponent(t(`नमस्कार! मुझे "${service.name}" के बारे में पूछताछ करनी है।`, `Hello! I would like to inquire about "${service.nameEn}".`))}`}
                                                target="_blank" rel="noreferrer"
                                                className="btn btn-sm" style={{ color: 'var(--gold-700)', border: '2px solid var(--gold-500)', background: 'transparent' }}
                                            >
                                                💬 {t('पूछताछ करें', 'Enquire Now')}
                                            </a>
                                        </div>
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
                        <p className="section-subtitle">{t('हजारों वर्षों की आध्यात्मिक परम्परा के वाहक, बनारस के अनुभवी पंडित — अब ऑनलाइन उपलब्ध।', 'Experienced Pandits of Banaras, carrying forward thousands of years of spiritual tradition — now available online.')}</p>
                    </div>
                    <div className="om-divider"><img src="/images/logo.png" alt="" className="inline-logo-md" /></div>
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
                        {[
                            {
                                text: t('बनारस से दूर रहकर भी काशी के पंडित जी द्वारा इतनी शुद्ध विधि से पूजा करवा पाना बहुत अच्छा अनुभव रहा। पूरे परिवार को शांति मिली।', 'Even while living far from Banaras, having the pooja performed so authentically by a Kashi Pandit was a wonderful experience. Our whole family found peace.'),
                                name: 'राजेश शर्मा', loc: t('दिल्ली, भारत', 'Delhi, India'), av: 'र'
                            },
                            {
                                text: t('महामृत्युंजय जप के बाद पत्नी की तबियत में चमत्कारिक सुधार हुआ। पंडित जी का ज्ञान और विधि दोनों अद्भुत हैं। बहुत आभारी हूँ।', "After the Mahamrityunjay Jaap, my wife's health improved remarkably. The Pandit's knowledge and method were both wonderful. Very grateful."),
                                name: 'Suresh Patel', loc: t('मुंबई, भारत', 'Mumbai, India'), av: 'S'
                            },
                            {
                                text: t('अमेरिका में रहते हुए हमारे गृह प्रवेश के लिए प्रामाणिक काशी पंडित मिलना मुश्किल था। इनकी ऑनलाइन सेवा अद्भुत रही — बिल्कुल बनारस में होने जैसा अनुभव!', 'Being in the US, I missed having authentic Kashi pandits for our Griha Pravesh. Their online service was incredible — felt like being right in Banaras!'),
                                name: 'Priya Gupta', loc: t('न्यू जर्सी, अमेरिका', 'New Jersey, USA'), av: 'P'
                            },
                        ].map((tst, i) => (
                            <div className={`testimonial-card fade-up stagger-${i + 1}`} key={i}>
                                <div className="testimonial-stars">★★★★★</div>
                                <div className="testimonial-quote">"</div>
                                <p className="testimonial-text">{tst.text}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{tst.av}</div>
                                    <div>
                                        <div className="testimonial-name">{tst.name}</div>
                                        <div className="testimonial-location">{tst.loc}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section" id="cta">
                <div className="cta-bg">
                    <img src="/images/ganga-aarti.jpg" alt="Ganga Aarti" loading="lazy" />
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
