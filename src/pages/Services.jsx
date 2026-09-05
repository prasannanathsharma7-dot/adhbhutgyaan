import { useState } from 'react';
import { Link } from 'react-router-dom';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, faqJsonLd, combineJsonLd } from '../utils/seo';
import { Search, X, MessageCircle, Globe2, Landmark, CheckCircle2, Heart, Home as HomeIcon, Baby, Briefcase, CalendarHeart, ArrowRight } from 'lucide-react';

export default function Services() {
    const { t, lang } = useLanguage();
    const [selectedConcern, setSelectedConcern] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const concerns = [
        { id: 'health', img: 'concern-health', label: t('स्वास्थ्य संबंधी समस्या', 'Health Issues'), serviceIds: ['rudrabhishek', 'purush-suktam'] },
        { id: 'marriage', img: 'concern-marriage', label: t('विवाह में देरी / मांगलिक दोष', 'Marriage Delay / Manglik Dosh'), serviceIds: ['kumbh-vivah', 'kalsarp-dosh'] },
        { id: 'money', img: 'concern-money', label: t('आर्थिक तंगी', 'Financial Struggles'), serviceIds: ['kanakdhara-stotra', 'shree-suktam'] },
        { id: 'ancestral', img: 'concern-ancestral', label: t('पितृ दोष / पूर्वजों से जुड़ी समस्या', 'Pitru Dosh / Ancestral Issues'), serviceIds: ['tripindi-shradh'] },
        { id: 'career', img: 'concern-career', label: t('करियर / व्यापार में रुकावट', 'Career / Business Obstacles'), serviceIds: ['ganesh-atharvashirsha', 'kalsarp-dosh'] },
        { id: 'negativity', img: 'concern-negativity', label: t('नकारात्मक शक्ति / शत्रु बाधा', 'Negative Energy / Enemies'), serviceIds: ['vipreet-pratyangira', 'mahavidya-paath'] },
        { id: 'unsure', img: 'concern-unsure', label: t('पता नहीं, सलाह चाहिए', 'Not Sure, Need Guidance'), serviceIds: ['astrology-consultation'] },
    ];

    const recommended = selectedConcern
        ? concerns.find(c => c.id === selectedConcern).serviceIds.map(id => servicesData.find(s => s.id === id)).filter(Boolean)
        : [];

    const filteredServices = searchQuery.trim()
        ? servicesData.filter(s => {
            const q = searchQuery.trim().toLowerCase();
            return s.name.includes(searchQuery.trim()) ||
                s.nameEn.toLowerCase().includes(q) ||
                (s.shortDesc || '').includes(searchQuery.trim()) ||
                (s.shortDescEn || '').toLowerCase().includes(q);
        })
        : servicesData;

    useSEO({
        title: t('हमारी पूजा सेवाएं | Adhbhut Gyaan', 'Pooja & Astrology Services in Kashi, Varanasi | Adhbhut Gyaan'),
        description: t('रुद्राभिषेक, कालसर्प दोष, त्रिपिंडी श्राद्ध, दस महाविद्या पाठ सहित 10+ प्रामाणिक पूजा सेवाएं — बनारस के विद्वान पंडितों द्वारा।', 'Book authentic pooja in Kashi, Varanasi - Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh & 10+ more Vedic services by Pt. Umang Nath Sharma.'),
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
                                <img src={`/images/icons/${c.img}.jpg`} alt="" width="22" height="22" loading="lazy" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} /> {c.label}
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
                            <Globe2 size={32} style={{ marginBottom: '0.75rem', color: 'var(--gold-600)' }} />
                            <h3 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '1.25rem' }}>{t('विदेश में बसे भक्तों हेतु', 'For Those Sitting Overseas')}</h3>
                            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {overseasItems.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                        <CheckCircle2 size={16} style={{ color: 'var(--gold-600)', flexShrink: 0, marginTop: '0.15rem' }} />
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
                                <MessageCircle size={15} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('पूछताछ करें', 'Inquire Now')}
                            </a>
                        </div>

                        {/* For guests visiting Varanasi */}
                        <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            <Landmark size={32} style={{ marginBottom: '0.75rem', color: 'var(--gold-600)' }} />
                            <h3 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '1.25rem' }}>{t('वाराणसी पधार रहे अतिथियों हेतु', 'For Guests Visiting Varanasi')}</h3>
                            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {varanasiItems.map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                        <CheckCircle2 size={16} style={{ color: 'var(--gold-600)', flexShrink: 0, marginTop: '0.15rem' }} />
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
                                <MessageCircle size={15} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('पूछताछ करें', 'Inquire Now')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shubh Muhurat - a distinct paid tool (₹151), not a pooja/ritual,
                so it doesn't belong in the "Inquiry Only, No Charges" special-
                services section above, and it isn't a services.json/
                ServiceDetail entry either since its real booking flow already
                lives at /muhurat (category picker + Panchang-based date
                scan + report), not the generic service-detail template. */}
            <section className="section" style={{ background: 'var(--navy-950)' }}>
                <div className="container">
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center', color: 'var(--gold-400)' }}>
                            <CalendarHeart size={14} style={{ marginRight: '0.4rem' }} />{t('ज्योतिष टूल', 'Astrology Tool')}
                        </span>
                        <h2 className="section-title" style={{ color: 'white' }}>{t('शुभ मुहूर्त — सही तिथि चुनें', 'Shubh Muhurat - Choose the Right Date')}</h2>
                        <p style={{ color: 'var(--warm-200)', maxWidth: 600, margin: '0.5rem auto 0' }}>
                            {t('विवाह, गृह प्रवेश, नामकरण एवं व्यापार आरंभ हेतु पंचांग-आधारित शुभ मुहूर्त — केवल ₹151।', 'Panchang-based auspicious dates for Marriage, Griha Pravesh, Naamkaran, and Business Launch - just ₹151.')}
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2rem', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
                        {[
                            { Icon: Heart, hi: 'विवाह मुहूर्त', en: 'Marriage Muhurat' },
                            { Icon: HomeIcon, hi: 'गृह प्रवेश मुहूर्त', en: 'Griha Pravesh Muhurat' },
                            { Icon: Baby, hi: 'नामकरण मुहूर्त', en: 'Naamkaran Muhurat' },
                            { Icon: Briefcase, hi: 'व्यापार आरंभ मुहूर्त', en: 'Business Launch Muhurat' },
                        ].map((cat, i) => (
                            <Link to="/muhurat" key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1rem', textAlign: 'center', display: 'block', textDecoration: 'none', transition: 'background var(--dur-fast) var(--ease-out)' }}>
                                <cat.Icon size={26} style={{ color: 'var(--gold-400)', marginBottom: '0.6rem' }} />
                                <div style={{ color: 'white', fontSize: '0.88rem', fontWeight: 700 }}>{t(cat.hi, cat.en)}</div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center" style={{ marginTop: '1.75rem' }}>
                        <Link to="/muhurat" className="btn btn-primary btn-lg">
                            {t('मुहूर्त जांचें', 'Check Muhurat')} <ArrowRight size={16} style={{ marginLeft: '0.4rem', verticalAlign: '-2px' }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* All Services — tap any card to see full details, packages & pricing */}
            <section className="section">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('सभी सेवाएं', 'All Services')}</span>
                        <h2 className="section-title">{t('एक नज़र में हमारी सभी पूजा सेवाएं', 'All Our Pooja Services, At a Glance')}</h2>
                        <p className="section-subtitle">{t('किसी भी सेवा पर टैप करें — पूर्ण विवरण, पैकेज व मूल्य वहां मिलेंगे', 'Tap any service to see its full details, packages & pricing')}</p>
                    </div>

                    <div style={{ maxWidth: '480px', margin: '1.75rem auto 0', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('पूजा का नाम खोजें... (जैसे रुद्राभिषेक)', 'Search by pooja name... (e.g. Rudrabhishek)')}
                            style={{
                                width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: 'var(--radius-xl)',
                                border: '1.5px solid var(--border-gold)', fontSize: '0.95rem', background: 'white',
                            }}
                            aria-label={t('पूजा खोजें', 'Search services')}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label={t('खोज साफ़ करें', 'Clear search')}
                                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {searchQuery && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                            {filteredServices.length > 0
                                ? t(`${filteredServices.length} सेवा(एं) मिलीं`, `${filteredServices.length} service${filteredServices.length === 1 ? '' : 's'} found`)
                                : t('कोई सेवा नहीं मिली — कृपया अन्य शब्द आज़माएं', 'No services found — try a different search term')}
                        </p>
                    )}

                    <div className="service-browse-grid">
                        {filteredServices.map(service => (
                            <div key={service.id} className="service-browse-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link to={`/services/${service.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <picture>
                                        <source type="image/avif" srcSet={`/images/${service.image.replace('.jpg', '.avif')}`} />
                                        <source type="image/webp" srcSet={`/images/${service.image.replace('.jpg', '.webp')}`} />
                                        <img src={`/images/${service.image}`} alt={service.nameEn} width="80" height="80" loading="lazy" className="service-browse-img" />
                                    </picture>
                                    <div className="service-browse-body">
                                        <div className="service-browse-name">{lang === 'hi' ? service.name : service.nameEn}</div>
                                        {lang === 'hi' && <div className="service-browse-name-en">{service.nameEn}</div>}
                                        <p className="service-browse-desc">{lang === 'hi' ? service.shortDesc : service.descriptionEn}</p>
                                    </div>
                                    <span className="service-browse-arrow">→</span>
                                </Link>
                                <a
                                    href={`https://wa.me/919278148269?text=${encodeURIComponent(t(`प्रणाम, मुझे ${service.name} पूजा काशी में करवानी है।`, `Pranam, I would like to book ${service.nameEn} pooja in Kashi.`))}`}
                                    target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--whatsapp-dark)' }}
                                >
                                    <MessageCircle size={13} /> {t('WhatsApp पर सीधे बुक करें', 'Book Directly on WhatsApp')}
                                </a>
                            </div>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <a
                                href={`https://wa.me/919278148269?text=${encodeURIComponent(t(`नमस्कार! मुझे "${searchQuery}" के बारे में पूछताछ करनी है।`, `Hello! I'd like to ask about "${searchQuery}".`))}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-whatsapp"
                            >
                                <MessageCircle size={15} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('WhatsApp पर पूछें', 'Ask on WhatsApp')}
                            </a>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
