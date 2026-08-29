import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { gallery, pressHighlights, triptych, videoClips, youtubeUploadsPlaylistId, youtubeChannelId } from '../data/media';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

import { generations, heritageSummary, testimonials, testimonialFlags, moreTestimonials, moreTestimonialFlags } from '../data/heritage';

const values = [
    { icon: '📖', title: 'शास्त्रोक्त विधि', titleEn: 'Authentic Vedic Methods', desc: 'प्रत्येक पूजा शुद्ध एवं शास्त्रोक्त विधि से सम्पन्न', descEn: 'Every pooja performed with impeccable, time-honored precision' },
    { icon: '🤝', title: 'विश्वास एवं पारदर्शिता', titleEn: 'Trust & Transparency', desc: 'कोई छिपा हुआ शुल्क नहीं', descEn: 'No concealed costs, ever' },
    { icon: '❤️', title: 'भक्त सेवा', titleEn: 'Devotee First', desc: 'भक्तों का कल्याण ही हमारी सर्वोच्च प्राथमिकता', descEn: "Devotees' wellbeing remains our foremost priority" },
    { icon: '🌍', title: 'वैश्विक पहुँच', titleEn: 'Global Reach', desc: 'देश-विदेश में कहीं भी, काशी की सेवा आपके निकट', descEn: "Kashi's service, delivered wherever you may be in the world" },
];

export default function About() {
    const { t, lang } = useLanguage();

    useSEO({
        title: t('हमारे बारे में — शर्मा परिवार की विरासत | Adhbhut Gyaan', 'Dr. Umang Nath Sharma — Best Astrologer in Kashi, Varanasi | Adhbhut Gyaan'),
        description: t('400+ वर्षों की वैदिक परंपरा, तीन पीढ़ियों की गाथा — महामहोपाध्याय पं. अयोध्या नाथ शर्मा से डॉ. उमंग नाथ शर्मा तक।', 'Dr. Umang Nath Sharma, renowned Kashi Astrologer and Vedic Pandit - four centuries of tradition across three generations, from Mahamahopadhyaya Pt. Ayodhya Nath Sharma to today.'),
        path: '/about',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' },
        ])),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('हमारे बारे में', 'About Us')}</span></div>
                    <h1>{t('हमारे बारे में', 'About Us')}</h1>
                    <p className="subtitle">{t('About Adhbhut Gyaan — शर्मा परिवार की गौरवशाली विरासत', 'About Adhbhut Gyaan — The Storied Legacy of the Sharma Family')}</p>
                </div>
            </header>

            {/* Quick nav - the page has grown to 13 sections, so a jump-to bar helps */}
            <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: '60px', zIndex: 50, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <div className="container" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem' }}>
                    {[
                        { id: 'press', label: t('मीडिया', 'Press') },
                        { id: 'chief-astrologer', label: t('प्रधान ज्योतिषाचार्य', 'Chief Astrologer') },
                        { id: 'generations', label: t('तीन पीढ़ियाँ', 'Generations') },
                        { id: 'testimonials-1980', label: t('प्रशंसापत्र', 'Testimonials') },
                        { id: 'our-testimonials', label: t('और पत्र', 'More Letters') },
                        { id: 'gallery', label: t('यादें', 'Gallery') },
                    ].map(item => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            style={{ flexShrink: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold-700)', background: 'white', border: '1px solid var(--border-gold)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-xl)', textDecoration: 'none' }}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Triptych - evocative opener */}
            <section className="section" style={{ paddingBottom: 0 }}>
                <div className="container">
                    <div className="triptych">
                        {triptych.map(item => (
                            <div className="triptych-card" key={item.capEn}>
                                <img src={item.src} alt={item.capEn} loading="lazy" />
                                <div className="triptych-overlay">
                                    <span className="triptych-caption">{lang === 'hi' ? item.capHi : item.capEn} <span className="arrow">›</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/temple-diyas.jpg" alt="Temple Diyas" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">{t('हमारी कहानी', 'Our Story')}</span>
                            <h2 className="section-title">{t('काशी की प्राचीन परम्परा के वाहक', "Carrying Kashi's Ancient Tradition Forward")}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                {t(
                                    'शर्मा परिवार की गाथा मात्र एक वंशावली नहीं, बल्कि चार शताब्दियों से अधिक समय तक वैदिक विज्ञान की अक्षुण्ण शक्ति का प्रमाण है। यह वंश प्राचीन आध्यात्मिक ज्ञान और आधुनिक वैश्विक मान्यता के दुर्लभ संगम का प्रतीक है। पीढ़ी-दर-पीढ़ी परिवार के पंडितों द्वारा वाराणसी एवं विश्व भर के भक्तों की सेवा करते हुए यह विरासत आज एक विशाल एवं निरंतर अनुष्ठान-सेवा का रूप ले चुकी है।',
                                    'The saga of the Sharma family is a profound testament to the enduring potency of Vedic sciences, spanning over four centuries — a rare confluence of ancient metaphysical wisdom and modern global recognition, born in the ghats of Varanasi. Across generations of family Pandits serving devotees from Varanasi and around the world, this legacy has grown into a large and continuing body of ritual service.'
                                )}
                            </p>
                            <Link to="/booking" className="btn btn-primary"><img src="/images/logo.png" alt="" className="inline-logo" /> {t('पूजा बुक करें', 'Book a Pooja')}</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Heritage Summary strip */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '1rem' }}>
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('विरासत का सारांश', 'Summary of the Heritage')}</h2>
                    </div>
                    <div className="stats-grid">
                        {heritageSummary.map(h => (
                            <div className="stat-card" key={h.labelEn}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{h.icon}</div>
                                <div className="stat-label" style={{ fontWeight: 700, color: 'var(--gold-300)', marginBottom: '0.35rem' }}>{t(h.label, h.labelEn)}</div>
                                <div className="stat-label" style={{ fontSize: '0.8rem' }}>{t(h.desc, h.descEn)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Press & Recognition - the family's most prestigious credibility
                markers get their own showcase instead of blending into the
                general photo gallery further down the page. */}
            <section className="section" id="press">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('मीडिया एवं मान्यता', 'Press & Recognition')}</span>
                        <h2 className="section-title">{t('विश्व स्तर पर सम्मानित', 'Recognized on the World Stage')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
                        {pressHighlights.map(item => (
                            <div key={item.src} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-gold)', background: 'white' }}>
                                <div style={{ position: 'absolute', top: '0.9rem', left: '0.9rem', zIndex: 2, background: 'var(--gold-600)', color: 'white', fontWeight: 700, fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-xl)', letterSpacing: '0.02em' }}>
                                    {t(item.badge, item.badgeEn)}
                                </div>
                                <img src={item.src} alt={item.badgeEn} loading="lazy" style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
                                <p style={{ padding: '1rem 1.1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t(item.capHi, item.capEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chief Astrologer Spotlight */}
            <section className="section" id="chief-astrologer">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('वर्तमान प्रधान', 'Current Head')}</span>
                        <h2 className="section-title">{t('प्रधान ज्योतिषाचार्य — डॉ. उमंग नाथ शर्मा', 'Chief Astrologer — Dr. Umang Nath Sharma')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/heritage/umang-with-ayodhya-portrait.jpg" alt="Dr. Umang Nath Sharma" loading="lazy" style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t(
                                    'डॉ. उमंग नाथ शर्मा शर्मा परिवार की वैदिक परंपरा के वर्तमान प्रधान एवं परिवार के एकमात्र प्रशिक्षित ज्योतिषाचार्य हैं — इनसे वरिष्ठ या इनके समकक्ष अन्य कोई नहीं है। अद्भुत ज्ञान से जुड़े अन्य सभी पंडितगण शास्त्रोक्त कर्मकांड — पूजा, हवन, अनुष्ठान — सम्पन्न कराने में दक्ष एवं प्रशिक्षित हैं, जबकि ज्योतिषीय परामर्श, कुंडली विश्लेषण एवं भविष्यवाणी का दायित्व विशेष रूप से डॉ. शर्मा ही वहन करते हैं।',
                                    'Dr. Umang Nath Sharma is the current head of the Sharma family\'s Vedic tradition and the family\'s sole trained astrologer — no one is senior to him or his equal in this role. Every other Pandit associated with Adhbhut Gyaan is skilled and trained in performing scripture-based karmakand — pooja, havan, and rituals — while astrological consultation, horoscope analysis, and prediction are Dr. Sharma\'s exclusive responsibility.'
                                )}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                {t(
                                    'मैरीलैंड स्टेट यूनिवर्सिटी, अमेरिका द्वारा "डॉक्टर ऑफ एस्ट्रोलॉजी" की उपाधि से सम्मानित, और सन् 2019 में जापान के Hulu TV द्वारा जिन पर एक वृत्तचित्र बनाई गई — डॉ. शर्मा ही अद्भुत ज्ञान की समस्त ज्योतिषीय गतिविधियों का मार्गदर्शन करते हैं।',
                                    'Conferred the degree of "Doctor of Astrology" by Maryland State University, USA, and the subject of a 2019 documentary by Japan\'s Hulu TV — Dr. Sharma personally guides every astrological activity at Adhbhut Gyaan.'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Three Generations Timeline */}
            <section className="section section-warm" id="generations">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('तीन पीढ़ियाँ, एक विरासत', 'Three Generations, One Legacy')}</span>
                        <h2 className="section-title">{t('शर्मा वंश की गाथा', 'Chronicles of the Sharma Lineage')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('वैदिक विद्वता की एक चतुःशताब्दी यात्रा', 'A Four-Century Odyssey of Vedic Erudition')}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '640px', margin: '0.75rem auto 0', lineHeight: 1.7 }}>
                            {t(
                                'परिवार की वैदिक परंपरा चार शताब्दियों से अधिक पुरानी मानी जाती है। नीचे हम तीन प्रलेखित पीढ़ियों की गाथा प्रस्तुत करते हैं, जिनके चित्र व प्रमाण आज भी उपलब्ध हैं।',
                                "The family's Vedic tradition is held to stretch back over four centuries. Below, we present the story of the three most recent, documented generations — those for whom photographs and records survive today."
                            )}
                        </p>
                    </div>
                    <div className="om-divider">ॐ</div>

                    {generations.map((g, i) => (
                        <div key={g.gen} className="about-story" style={{ marginBottom: i === generations.length - 1 ? 0 : 'clamp(2.5rem, 6vw, 4rem)' }}>
                            {i % 2 === 0 ? (
                                <>
                                    <div className="about-image">
                                        <img src={g.img} alt={g.nameEn} loading="lazy" style={{ objectFit: 'cover' }} />
                                    </div>
                                    <GenText g={g} t={t} lang={lang} />
                                </>
                            ) : (
                                <>
                                    <GenText g={g} t={t} lang={lang} />
                                    <div className="about-image">
                                        <img src={g.img} alt={g.nameEn} loading="lazy" style={{ objectFit: 'cover' }} />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="section section-dark">
                <div className="container">
                    <div className="stats-grid">
                        {[
                            { num: '400+', label: t('वर्षों का अनुभव', 'Years of Experience') },
                            { num: '1,000,000+', label: t('सफल पूजन', 'Poojas Performed') },
                            { num: '100,000+', label: t('संतुष्ट भक्तगण', 'Happy Devotees') },
                            { num: '50+', label: t('पूजा प्रकार', 'Service Types') },
                        ].map(s => (
                            <div className="stat-card" key={s.num}>
                                <div className="stat-number">{s.num}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* International Testimonials */}
            <section className="section" id="testimonials-1980">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('अंतरराष्ट्रीय प्रशंसापत्र', 'International Testimonials')}</span>
                        <h2 className="section-title">{t('चार दशकों से भक्तों का विश्वास', "Devotees' Trust for Four Decades")}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('1979 से संरक्षित', 'Preserved Since 1979')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <p style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {t(
                            '1979 से 1983 के बीच दुनिया भर से आए साधकों ने पं. शम्भु नाथ शर्मा को धन्यवाद-पत्र लिखे। इनमें से कुछ मूल पत्र, उनके नाम और स्थान सहित, यहाँ प्रस्तुत हैं।',
                            'Between 1979 and 1983, seekers from around the world wrote letters of gratitude to Pandit Shambhu Nath Sharma. A selection of these original testimonials, with names and locations as given, is presented below.'
                        )}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        <span style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            ✉️ {testimonials.length} {t('पत्र', 'Letters')}
                        </span>
                        <span style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>{testimonialFlags.join(' ')}</span>
                            {testimonialFlags.length}+ {t('देश', 'Countries')}
                        </span>
                        <span style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            📅 1979–1983
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                        {testimonials.map((tst, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                background: 'linear-gradient(165deg, #FFFCF5 0%, var(--cream) 100%)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                            }}>
                                {/* Airmail stripe - evokes the original international letters */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                                    background: 'repeating-linear-gradient(-45deg, #B8860B 0 10px, #fff 10px 20px, #8B0000 20px 30px, #fff 30px 40px)',
                                    opacity: 0.55,
                                }} />
                                {tst.notable && (
                                    <div style={{ alignSelf: 'flex-start', background: 'var(--dark-100)', color: 'var(--gold-300)', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 'var(--radius-xl)', letterSpacing: '0.02em' }}>
                                        🎖️ {t(tst.notableHi, tst.notableEn)}
                                    </div>
                                )}
                                <span style={{ fontSize: '1.8rem', color: 'var(--gold-400)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>&ldquo;</span>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>{t(tst.quoteHi, tst.quoteEn)}</p>
                                <div style={{ borderTop: '1px dashed var(--border-gold)', paddingTop: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{tst.flag || '🌐'}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gold-700)', fontSize: '0.9rem' }}>{tst.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{tst.place}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
                        {t(
                            'मूल पत्रों से लिया गया, भाषा को थोड़ा सरल किया गया है। पूर्ण पते गोपनीयता हेतु संक्षिप्त किए गए हैं।',
                            'Adapted from original letters; full street addresses abbreviated for privacy.'
                        )}
                    </p>
                </div>
            </section>

            {/* Our Testimonials - additional letters found in the same original archive,
                kept in their own section so they display separately from the first batch. */}
            <section className="section section-warm" id="our-testimonials">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('हमारे प्रशंसापत्र', 'Our Testimonials')}</span>
                        <h2 className="section-title">{t('संग्रह से और भी पत्र', 'More Letters From the Archive')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('1973 से 1982 के मध्य', 'From Between 1973 and 1982')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        <span style={{ background: 'white', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            ✉️ {moreTestimonials.length} {t('पत्र', 'Letters')}
                        </span>
                        <span style={{ background: 'white', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>{moreTestimonialFlags.join(' ')}</span>
                            {moreTestimonialFlags.length}+ {t('देश', 'Countries')}
                        </span>
                        <span style={{ background: 'white', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            📅 1973–1982
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                        {moreTestimonials.map((tst, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                background: 'linear-gradient(165deg, #FFFCF5 0%, var(--cream) 100%)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                                    background: 'repeating-linear-gradient(-45deg, #B8860B 0 10px, #fff 10px 20px, #8B0000 20px 30px, #fff 30px 40px)',
                                    opacity: 0.55,
                                }} />
                                <span style={{ fontSize: '1.8rem', color: 'var(--gold-400)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>&ldquo;</span>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>{t(tst.quoteHi, tst.quoteEn)}</p>
                                <div style={{ borderTop: '1px dashed var(--border-gold)', paddingTop: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{tst.flag}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gold-700)', fontSize: '0.9rem' }}>{tst.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{tst.place}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
                        {t(
                            'मूल पत्रों से लिया गया, भाषा को थोड़ा सरल किया गया है। पूर्ण पते गोपनीयता हेतु संक्षिप्त किए गए हैं।',
                            'Adapted from original letters; full street addresses abbreviated for privacy.'
                        )}
                    </p>
                </div>
            </section>

            {/* Heritage Gallery */}
            <section className="section section-warm" id="gallery">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('यादें', 'Memories')}</span>
                        <h2 className="section-title">{t('हमारी यात्रा के क्षण', 'Moments from Our Journey')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {gallery.map(item => (
                            <div key={item.src} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--cream)' }}>
                                <img src={item.src} alt={item.capEn} loading="lazy" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                                <p style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t(item.capHi, item.capEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Videos */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center">
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
                        {t('हमारे YouTube चैनल पर अधिक देखें', 'Explore Further on Our YouTube Channel')}
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

            {/* Values */}
            <section className="section" id="mission">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('हमारे मूल्य', 'Our Values')}</span>
                        <h2 className="section-title">{t('हमारे मूल सिद्धांत', 'Our Core Values')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="features-grid">
                        {values.map((v, i) => (
                            <div className="feature-card" key={i}>
                                <span className="feature-icon">{v.icon}</span>
                                <h3 className="feature-title">{t(v.title, v.titleEn)}</h3>
                                <p className="feature-desc">{t(v.desc, v.descEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kashi */}
            <section className="section section-warm">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">{t('हमारा ठिकाना', 'Our Home')}</span>
                            <h2 className="section-title">{t('काशी — विश्व की आध्यात्मिक राजधानी', "Kashi — The World's Spiritual Capital")}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t(
                                    'बनारस (वाराणसी) दुनिया के सबसे प्राचीन शहरों में से एक है और हिंदू धर्म की आध्यात्मिक राजधानी मानी जाती है। गंगा नदी के तट पर बसा यह पवित्र शहर — काशी विश्वनाथ मंदिर, दशाश्वमेध घाट की गंगा आरती, और अगणित मंदिरों का घर है।',
                                    'Banaras (Varanasi) stands among the oldest cities on Earth, revered as the spiritual capital of Hinduism. This sacred city on the banks of the Ganga is home to the Kashi Vishwanath Temple, the resplendent Ganga Aarti at Dashashwamedh Ghat, and countless other temples.'
                                )}
                            </p>
                            <p style={{ color: 'var(--gold-700)', fontWeight: 600, fontStyle: 'italic' }}>
                                {t('"काशी में जो पूजा होती है, उसका फल सर्वोत्तम होता है।"', '"A pooja performed in Kashi yields the most auspicious results."')}
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="/images/ganga-aarti.jpg" alt="Ganga Aarti" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function GenText({ g, t, lang }) {
    return (
        <div>
            <span className="section-label" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>{t(`पीढ़ी ${g.gen}`, `Generation ${g.gen}`)}</span>
            {g.gen === 'III' && (
                <span style={{ display: 'inline-block', marginLeft: '0.6rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--navy-950)', background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-xl)', verticalAlign: 'middle' }}>
                    {t('वर्तमान प्रधान', 'Current Head')}
                </span>
            )}
            <h3 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '0.15rem', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>{lang === 'hi' ? g.name : g.nameEn}</h3>
            {lang === 'en' && <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-hindi)' }}>{g.name}</p>}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{t(g.era, g.eraEn)}</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{t(g.body, g.bodyEn)}</p>
        </div>
    );
}
