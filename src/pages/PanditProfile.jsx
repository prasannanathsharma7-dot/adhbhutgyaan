import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { MessageCircle, MapPin, Clock, Award, BookOpen, Landmark, ShieldCheck, Sparkles } from 'lucide-react';

const WHATSAPP_NUMBER = '919278148269';

export default function PanditProfile() {
    const { t, lang } = useLanguage();

    useSEO({
        title: t(
            'डॉ. उमंग नाथ शर्मा — काशी के ज्योतिषाचार्य | Adhbhut Gyaan',
            'Dr. Umang Nath Sharma — Vedic Astrologer & Priest, Kashi | Adhbhut Gyaan'
        ),
        description: t(
            'डॉ. उमंग नाथ शर्मा — 400+ वर्षों की काशी वैदिक परंपरा के तीसरी पीढ़ी के वाहक, मैरीलैंड स्टेट यूनिवर्सिटी (USA) से "डॉक्टर ऑफ एस्ट्रोलॉजी"। कुंडली विश्लेषण, ग्रह दोष निवारण एवं प्रामाणिक कर्मकांड।',
            'Dr. Umang Nath Sharma — 3rd-generation bearer of a 400+ year Kashi Vedic lineage, conferred "Doctor of Astrology" by Maryland State University, USA. Kundli analysis, planetary dosha remedies & authentic Vedic rites.'
        ),
        path: '/pt-umang-nath-sharma',
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: 'Dr. Umang Nath Sharma', path: '/pt-umang-nath-sharma' },
            ]),
            {
                '@context': 'https://schema.org',
                '@type': 'Person',
                '@id': 'https://www.adhbhutgyaan.com/#umang-nath-sharma',
                name: 'Dr. Umang Nath Sharma',
                jobTitle: t('ज्योतिषाचार्य एवं पुरोहित', 'Vedic Astrologer & Priest'),
                image: 'https://www.adhbhutgyaan.com/images/heritage/umang-with-ayodhya-portrait.jpg',
                url: 'https://www.adhbhutgyaan.com/pt-umang-nath-sharma',
                worksFor: { '@id': 'https://www.adhbhutgyaan.com/#business' },
                address: { '@type': 'PostalAddress', addressLocality: 'Varanasi', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' },
            }
        ),
    });

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        t(
            'प्रणाम, मुझे डॉ. उमंग नाथ शर्मा जी से परामर्श हेतु समय चाहिए।',
            'Pranam, I would like to schedule a consultation with Dr. Umang Nath Sharma ji.'
        )
    )}`;

    const badges = [
        { icon: Landmark, text: t('400+ वर्षों की वंशानुगत काशी परंपरा', '400+ Years Hereditary Kashi Lineage') },
        { icon: Award, text: t('"डॉक्टर ऑफ एस्ट्रोलॉजी" — मैरीलैंड स्टेट यूनिवर्सिटी, USA', 'Doctor of Astrology — Maryland State University, USA') },
        { icon: BookOpen, text: t('2019 में जापान के Hulu TV द्वारा वृत्तचित्र का विषय', 'Subject of a 2019 Documentary by Japan\u2019s Hulu TV') },
    ];

    const mediaMentions = [
        { img: 'press-bbc', label: 'BBC London', note: t('पारिवारिक परंपरा पर', "On the family's tradition") },
        { img: 'press-newspaper', label: t('दैनिक जागरण', 'Dainik Jagran'), note: t('वृत्तचित्र व परंपरा पर रिपोर्ट', 'Coverage of the documentary & tradition') },
        { img: 'us-doctorate', label: t('अमेरिकी डॉक्टरेट', 'American Doctorate'), note: 'Maryland State University' },
    ];

    const pillars = [
        {
            icon: ShieldCheck,
            title: t('100% शास्त्रोक्त शुद्धता', '100% Scriptural Precision'),
            desc: t('प्रत्येक अनुष्ठान वेद-शास्त्र में वर्णित विधि-विधान से ही सम्पन्न किया जाता है — कोई शॉर्टकट नहीं।', 'Every ritual is performed exactly as prescribed in the Vedic scriptures - no shortcuts, no improvisation.'),
        },
        {
            icon: Sparkles,
            title: t('भय-मुक्त, वैज्ञानिक दृष्टिकोण', 'Zero Fear-Mongering'),
            desc: t('डर दिखाकर सेवाएं बेचने में हमारा विश्वास नहीं — केवल सत्य, स्पष्ट एवं सम्मानजनक मार्गदर्शन।', 'We don\u2019t sell through fear or superstition - only honest, clear, and respectful guidance.'),
        },
        {
            icon: Landmark,
            title: t('गंगा तट पर प्रामाणिक अनुष्ठान', 'Authentic Ganga Ghat Rituals'),
            desc: t('पूजाएं काशी के पवित्र घाटों एवं मंदिरों में ही सम्पन्न होती हैं, जैसा शास्त्रों में निर्दिष्ट है।', 'Rituals are performed at Kashi\u2019s actual sacred ghats and temples, exactly as the scriptures specify the location matters.'),
        },
    ];

    return (
        <div>
            {/* AUTHORITY HEADER */}
            <section style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 100%)', padding: 'clamp(3rem, 8vw, 5rem) 0 clamp(2.5rem, 6vw, 4rem)' }}>
                <div className="container">
                    <nav aria-label="breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        <Link to="/" style={{ color: 'var(--gold-400)' }}>{t('होम', 'Home')}</Link>
                        <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>›</span>
                        <span style={{ color: 'var(--text-muted)' }}>{t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')}</span>
                    </nav>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 'clamp(1.75rem, 4vw, 3rem)', alignItems: 'center' }}>
                        <div style={{
                            position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            border: '2px solid var(--gold-500)', boxShadow: '0 0 40px rgba(196,154,44,0.25), var(--shadow-lg)',
                            background: 'rgba(255,255,255,0.03)',
                        }}>
                            <img
                                src="/images/heritage/umang-with-ayodhya-portrait.jpg"
                                alt={t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')}
                                width="600" height="800"
                                style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '3/4', objectFit: 'cover' }}
                                fetchPriority="high"
                            />
                        </div>

                        <div>
                            <span className="section-label" style={{ color: 'var(--gold-400)' }}>{t('तृतीय पीढ़ी — मुख्य ज्योतिषाचार्य', '3rd Generation — Chief Astrologer')}</span>
                            <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', margin: '0.5rem 0 0.75rem' }}>{t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')}</h1>
                            <p style={{ color: 'var(--warm-200)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '540px' }}>
                                {t(
                                    'काशी के शर्मा परिवार की 400 वर्षों की वैदिक परंपरा के वर्तमान वाहक — कुंडली विश्लेषण, ग्रह दोष निवारण एवं प्रामाणिक कर्मकांड में निपुण।',
                                    'The present bearer of the Sharma family\u2019s 400-year Vedic tradition in Kashi - specializing in Kundli analysis, planetary dosha remedies, and authentic Vedic rites.'
                                )}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1.5rem 0' }}>
                                {badges.map((b, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--gold-300)', fontSize: '0.92rem', fontWeight: 600 }}>
                                        <b.icon size={17} style={{ flexShrink: 0 }} />
                                        <span>{b.text}</span>
                                    </div>
                                ))}
                            </div>

                            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                                <MessageCircle size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                                {t('परामर्श हेतु WhatsApp करें', 'WhatsApp for Consultation')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* MEDIA MENTIONS STRIP */}
            <section style={{ background: 'var(--warm-100)', padding: '1.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(1.5rem, 5vw, 3rem)' }}>
                        {mediaMentions.map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={`/images/icons/${m.img}.jpg`} alt="" width="36" height="36" loading="lazy" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-gold)' }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>{m.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.note}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LINEAGE & SCHOLARLY BIO */}
            <section className="section">
                <div className="container" style={{ maxWidth: '780px' }}>
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('वंश-परंपरा', 'Lineage & Scholarship')}</span>
                        <h2 className="section-title">{t('चार शताब्दियों की अखंड परंपरा', 'An Unbroken Four-Century Tradition')}</h2>
                    </div>
                    <p style={{ fontSize: '1.02rem', lineHeight: 1.85, color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
                        {t(
                            'महामहोपाध्याय पं. अयोध्या नाथ शर्मा से आरंभ हुई काशी की यह वैदिक परंपरा — जिन्हें बनारस हिंदू विश्वविद्यालय (BHU) का भूमि पूजन कराने का पावन दायित्व सौंपा गया था — आज डॉ. उमंग नाथ शर्मा के माध्यम से तीसरी पीढ़ी में प्रवाहित हो रही है। पारिवारिक वंशानुगत ज्ञान एवं आधुनिक शैक्षणिक कठोरता का यह अनूठा संगम — मैरीलैंड स्टेट यूनिवर्सिटी, अमेरिका द्वारा प्रदत्त "डॉक्टर ऑफ एस्ट्रोलॉजी" की उपाधि में परिलक्षित होता है — डॉ. शर्मा को कुंडली विश्लेषण, ग्रह दोष निवारण, तंत्र-मंत्र एवं समस्त वैदिक कर्मकांड में विशेष निपुणता प्रदान करता है।',
                            'This Vedic tradition began with Mahamahopadhyaya Pt. Ayodhya Nath Sharma - entrusted with performing the Bhoomi Pujan for Banaras Hindu University (BHU) - and flows today, in its third generation, through Dr. Umang Nath Sharma. A rare confluence of hereditary family wisdom and modern academic rigor - reflected in his "Doctor of Astrology" degree from Maryland State University, USA - gives Dr. Sharma particular mastery over Kundli analysis, planetary dosha remedies, tantra, and the full range of Vedic Karmakand.'
                        )}
                    </p>

                    {/* 3 Sacred Pillars */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '2.5rem' }}>
                        {pillars.map((p, i) => (
                            <div key={i} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
                                <p.icon size={28} style={{ color: 'var(--gold-600)', marginBottom: '0.75rem' }} />
                                <h3 style={{ fontSize: '0.98rem', marginBottom: '0.5rem' }}>{p.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DUAL CONSULTATION MODES */}
            <section className="section" style={{ background: 'var(--cream)' }}>
                <div className="container">
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('परामर्श', 'Consultation')}</span>
                        <h2 className="section-title">{t('परामर्श कैसे प्राप्त करें', 'How to Get a Consultation')}</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem', maxWidth: '820px', margin: '2rem auto 0' }}>
                        <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                            <Landmark size={28} style={{ color: 'var(--gold-600)', marginBottom: '0.75rem' }} />
                            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t('काशी में प्रत्यक्ष भेंट', 'In-Person in Varanasi')}</h3>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {t('J11/19, नाति इमली रोड, ईश्वरगंगी, वाराणसी', 'J11/19, Nati Imli Road, Ishwargangi, Varanasi')}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                <Clock size={14} /> {t('प्रातः 9 बजे - मध्याह्न 12 बजे', '9 AM - 12 PM')}
                            </div>
                            <a href="https://www.google.com/maps/search/?api=1&query=J11%2F19%2C+Nati+Imli+Rd%2C+Ishwargangi%2C+Varanasi" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-700)' }}>
                                <MapPin size={14} /> {t('Google मैप्स पर देखें', 'View on Google Maps')}
                            </a>
                        </div>
                        <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                            <MessageCircle size={28} style={{ color: 'var(--whatsapp)', marginBottom: '0.75rem' }} />
                            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t('विश्व भर से WhatsApp / वीडियो परामर्श', 'Worldwide WhatsApp / Video')}</h3>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {t('विदेश में हैं? लाइव वीडियो कॉल पर सीधा परामर्श लें — दुनिया के किसी भी कोने से।', 'Living abroad? Get a direct live video consultation - from anywhere in the world.')}
                            </p>
                            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                                <MessageCircle size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} /> {t('अभी बुक करें', 'Book Now')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
