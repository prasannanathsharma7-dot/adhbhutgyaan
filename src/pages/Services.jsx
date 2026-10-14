import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, faqJsonLd, combineJsonLd } from '../utils/seo';
import PoojaFinder from '../components/services/PoojaFinder';
import PoojaDirectory from '../components/services/PoojaDirectory';
import HighTeaExperience from '../components/services/HighTeaExperience';
import { MessageCircle, Globe2, Landmark, CheckCircle2, Heart, Home as HomeIcon, Baby, Briefcase, CalendarHeart, ArrowRight } from 'lucide-react';

export default function Services() {
    const { t, lang } = useLanguage();
    useSEO({
        title: t('हमारी पूजा सेवाएं | Adhbhut Gyaan', 'Pooja & Astrology Services in Kashi, Varanasi | Adhbhut Gyaan'),
        description: t('रुद्राभिषेक, कालसर्प दोष, त्रिपिंडी श्राद्ध, दस महाविद्या पाठ सहित 10+ प्रामाणिक पूजा सेवाएं — बनारस के विद्वान पंडितों द्वारा।', 'Book authentic pooja in Kashi, Varanasi - Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh & 10+ more Vedic services by Dr. Umang Nath Sharma.'),
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
                    q: t('दर सूची की कीमतों में क्या शामिल है?', 'What do the listed prices cover?'),
                    a: t('दर सूची की दरें बताई गई इकाई (जैसे प्रति पाठ या प्रति अनुष्ठान) के लिए हैं। आपकी आवश्यकता — पंडितों की संख्या, सामग्री, स्थान, ऑनलाइन/ऑफ़लाइन — के अनुसार अंतिम मूल्य बुकिंग से पहले WhatsApp पर स्पष्ट बता दिया जाता है, ताकि बाद में कोई अप्रत्याशित शुल्क न आए।', 'Listed rates are for the unit shown (for example per paath or per ritual). The final price for your requirement - number of Pandits, materials, location, online or in person - is confirmed clearly on WhatsApp before you book, so there are no surprises later.'),
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
                    <p style={{ marginTop: '0.9rem' }}>
                        <Link to="/price-list" className="btn btn-gold" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>{t('पूरी दर सूची देखें →', 'View the full Price List →')}</Link>
                    </p>
                </div>
            </header>

            {/* Smart Pooja Finder - draws on the whole catalog (src/catalog) */}
            <PoojaFinder />

            {/* All Services, at a glance - the detail-page services as cards + every listed pooja by category */}
            <PoojaDirectory />

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

            {/* An in-person experience with Dr. Umang Nath Sharma (moved here from the homepage) */}
            <HighTeaExperience />

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
        </div>
    );
}
