import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import servicesData from '../data/services.json';

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

    return (
        <div ref={pageRef}>
            {/* HERO */}
            <section className="hero" id="hero">
                <div className="hero-bg">
                    <img src="/images/hero-banaras.png" alt="Varanasi Ghats at Sunrise" />
                </div>
                <div className="hero-overlay" />
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-om">ॐ</div>
                        <h1 className="hero-title-hindi">काशी पूजा सेवा</h1>
                        <p className="hero-title-en">Kashi Pooja Seva</p>
                        <p className="hero-desc">
                            बनारस (काशी) के अनुभवी और विद्वान पंडितों द्वारा<br />
                            सभी प्रकार की पूजा, पाठ, जप और हवन सेवाएं<br />
                            <strong style={{ color: 'var(--gold-300)' }}>घर बैठे ऑनलाइन बुक करें</strong>
                        </p>
                        <div className="hero-actions">
                            <Link to="/services" className="btn btn-primary btn-lg"><img src="/images/logo.png" alt="" className="inline-logo" /> सेवाएं देखें</Link>
                            <a href="https://wa.me/919278148269?text=नमस्कार! मैं पूजा बुक करना चाहता हूँ।" target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">💬 WhatsApp करें</a>
                        </div>
                        <div className="hero-stats">
                            {[
                                { num: '25+', label: 'वर्षों का अनुभव' },
                                { num: '10,000+', label: 'सफल पूजन' },
                                { num: '5,000+', label: 'संतुष्ट भक्तगण' },
                                { num: '50+', label: 'पूजा प्रकार' },
                            ].map(s => (
                                <div className="hero-stat" key={s.label}>
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
                        <span className="section-label">हमारी सेवाएं</span>
                        <h2 className="section-title">पवित्र पूजा एवं अनुष्ठान</h2>
                        <p className="section-subtitle">काशी (बनारस) के विद्वान पंडितों द्वारा शास्त्रोक्त विधि से सभी प्रकार की पूजा, पाठ, जप और हवन सम्पन्न करवाएं।</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="service-card-grid">
                        {servicesData.map((service, i) => {
                            const minPrice = Math.min(...service.packages.map(p => p.price));
                            return (
                                <div className={`card fade-up stagger-${i + 1}`} key={service.id}>
                                    <div className="card-image-wrapper">
                                        <img src={`/images/${service.image}`} alt={service.nameEn} className="card-image" loading="lazy" />
                                        <span className="card-badge">{service.bestTimeEn}</span>
                                    </div>
                                    <div className="card-body">
                    
                                        <h3 className="card-title">{service.name}</h3>
                                        <p className="card-title-en">{service.nameEn}</p>
                                        <p className="card-desc">{service.shortDesc}</p>
                                        {/* <p className="card-price">Starting from <strong>₹{minPrice.toLocaleString('en-IN')}</strong></p> */}
                                        <div className="card-actions">
                                            <Link to={`/services#${service.id}`} className="btn btn-primary btn-sm">विवरण देखें</Link>
                                            <Link to={`/booking?service=${service.id}`} className="btn btn-sm" style={{ color: 'var(--gold-700)', border: '2px solid var(--gold-500)', background: 'transparent' }}>Book Now</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/services" className="btn btn-gold">सभी सेवाएं देखें →</Link>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="section section-warm" id="why-us">
                <div className="container">
                    <div className="text-center fade-up">
                        <span className="section-label">हमें क्यों चुनें?</span>
                        <h2 className="section-title">काशी की परम्परा, आपके द्वार</h2>
                        <p className="section-subtitle">हजारों वर्षों की आध्यात्मिक परम्परा के वाहक, बनारस के अनुभवी पंडित — अब ऑनलाइन उपलब्ध।</p>
                    </div>
                    <div className="om-divider"><img src="/images/logo.png" alt="" className="inline-logo-md" /></div>
                    <div className="features-grid">
                        {[
                            { icon: '🏛️', title: 'काशी के विद्वान पंडित', desc: 'बनारस हिंदू विश्वविद्यालय और संस्कृत विद्यापीठ से शिक्षित, अनुभवी एवं प्रमाणित पंडित।' },
                            { icon: '📖', title: 'शास्त्रोक्त विधि', desc: 'वेद और शास्त्रों के अनुसार शुद्ध विधि-विधान से सम्पूर्ण पूजन कार्य सम्पन्न।' },
                            { icon: '🌐', title: 'ऑनलाइन बुकिंग', desc: 'घर बैठे आसानी से पूजा बुक करें। WhatsApp या वेबसाइट से तुरंत बुकिंग।' },
                            { icon: '📹', title: 'लाइव पूजा विकल्प', desc: 'वीडियो कॉल के माध्यम से पूजा में शामिल हों — देश-विदेश कहीं से भी।' },
                            { icon: '📦', title: 'पूजा सामग्री डिलीवरी', desc: 'पूजा के लिए आवश्यक सभी सामग्री — पूरे भारत में डिलीवरी उपलब्ध।' },
                            { icon: '💰', title: 'उचित दक्षिणा', desc: 'सभी पूजा सेवाओं की कीमत पारदर्शी और उचित। कोई छुपी लागत नहीं।' },
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
                        <span className="section-label">भक्तों के अनुभव</span>
                        <h2 className="section-title">हमारे भक्तगण क्या कहते हैं</h2>
                    </div>
                    <div className="testimonials-grid">
                        {[
                            { text: 'बनारस से दूर रहकर भी काशी के पंडित जी द्वारा इतनी शुद्ध विधि से पूजा करवा पाना बहुत अच्छा अनुभव रहा। पूरे परिवार को शांति मिली।', name: 'राजेश शर्मा', loc: 'दिल्ली, भारत', av: 'र' },
                            { text: 'महामृत्युंजय जप के बाद पत्नी की तबियत में चमत्कारिक सुधार हुआ। पंडित जी का ज्ञान और विधि दोनों अद्भुत हैं। बहुत आभारी हूँ।', name: 'Suresh Patel', loc: 'Mumbai, India', av: 'S' },
                            { text: 'Being in the US, I missed having authentic Kashi pandits for our Griha Pravesh. Their online service was incredible — felt like being right in Banaras!', name: 'Priya Gupta', loc: 'New Jersey, USA', av: 'P' },
                        ].map((t, i) => (
                            <div className={`testimonial-card fade-up stagger-${i + 1}`} key={i}>
                                <div className="testimonial-stars">★★★★★</div>
                                <div className="testimonial-quote">"</div>
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.av}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-location">{t.loc}</div>
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
                    <img src="/images/ganga-aarti.png" alt="Ganga Aarti" loading="lazy" />
                </div>
                <div className="cta-overlay" />
                <div className="cta-content container">
                    <div className="hero-om" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>ॐ</div>
                    <h2 className="cta-title fade-up">आज ही पूजा बुक करें</h2>
                    <p className="cta-subtitle fade-up">काशी के अनुभवी पंडितों से शास्त्रोक्त विधि से पूजा करवाएं।<br />WhatsApp पर तुरंत बुकिंग उपलब्ध।</p>
                    <div className="cta-actions fade-up">
                        <Link to="/booking" className="btn btn-primary btn-lg">📅 अभी बुक करें</Link>
                        <a href="https://wa.me/919278148269?text=नमस्कार!" target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 WhatsApp पर बात करें</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
