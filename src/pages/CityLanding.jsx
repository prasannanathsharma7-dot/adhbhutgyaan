import { useParams, Link, Navigate } from 'react-router-dom';
import citiesData from '../data/cities.json';
import servicesData from '../data/services.json';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { MessageCircle, Video, MapPin, Home as HomeIcon, CheckCircle2 } from 'lucide-react';

// Popular services to feature on every city page - a curated subset
// (not all 14) so the page stays scannable rather than repeating the
// full services listing.
const FEATURED_SERVICE_IDS = ['rudrabhishek', 'kalsarp-dosh', 'griha-pravesh', 'navgrah-shanti', 'mahamrityunjaya-jaap'];

export default function CityLanding() {
    const { city } = useParams();
    const { t } = useLanguage();
    const cityInfo = citiesData.find(c => c.slug === city);

    if (!cityInfo) return <Navigate to="/services" replace />;

    const featuredServices = FEATURED_SERVICE_IDS
        .map(id => servicesData.find(s => s.id === id))
        .filter(Boolean);

    const cityName = t(cityInfo.name, cityInfo.nameEn);

    useSEO({
        title: t(
            `${cityInfo.name} से पूजा बुक करें — काशी के पंडित | Adhbhut Gyaan`,
            `Book Pooja from ${cityInfo.nameEn} — Kashi Pandits | Adhbhut Gyaan`
        ),
        description: t(
            `${cityInfo.name} में रहते हुए भी काशी के प्रामाणिक पंडितों से पूजा करवाएं — ऑनलाइन लाइव वीडियो, अथवा पंडित जी आपके घर पर।`,
            `Book authentic Kashi Pandits for pooja while living in ${cityInfo.nameEn} - online with live video, or Pandit ji comes to your home.`
        ),
        path: `/pandit-for-pooja/${cityInfo.slug}`,
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: `Pooja in ${cityInfo.nameEn}`, path: `/pandit-for-pooja/${cityInfo.slug}` },
            ])
        ),
    });

    return (
        <div className="page-content">
            <section className="section section-dark" style={{ paddingBottom: '2.5rem' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('होम', 'Home')}</Link> › {t(`${cityInfo.name} में पूजा`, `Pooja in ${cityInfo.nameEn}`)}
                    </div>
                    <h1 style={{ color: 'white', marginTop: '0.75rem' }}>
                        {t(`${cityInfo.name} से काशी के पंडितों द्वारा पूजा बुक करें`, `Book Pooja from ${cityInfo.nameEn} with Kashi's Pandits`)}
                    </h1>
                    <p style={{ color: 'var(--warm-200)', maxWidth: 640, marginTop: '0.75rem' }}>
                        {t(
                            `${cityInfo.name} में स्थानीय पंडित ढूंढने की आवश्यकता नहीं — काशी की 400+ वर्षों की वैदिक परंपरा अब आपके शहर में भी सुलभ है।`,
                            `No need to search for a local pandit in ${cityInfo.nameEn} - Kashi's 400+ year Vedic tradition is now accessible right where you are.`
                        )}
                    </p>
                </div>
            </section>

            {/* 3 delivery modes - the same real, already-established options
                the rest of the site offers, framed specifically for someone
                searching from this city. */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title" style={{ textAlign: 'center' }}>
                        {t(`${cityInfo.name} से पूजा करवाने के 3 तरीके`, `3 Ways to Get Your Pooja Done from ${cityInfo.nameEn}`)}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
                        {[
                            { Icon: Video, hi: 'लाइव वीडियो के साथ ऑनलाइन', en: 'Online with Live Video', descHi: `घर बैठे ${cityInfo.name} से पूजा देखें, संकल्प करें।`, descEn: `Watch and take Sankalp from ${cityInfo.nameEn}, right from home.` },
                            { Icon: MapPin, hi: 'काशी में स्वयं आकर', en: 'In Person, at Kashi', descHi: 'काशी की पवित्र भूमि पर स्वयं उपस्थित होकर पूजा करवाएं।', descEn: 'Be personally present on Kashi\'s sacred ground for the ritual.' },
                            { Icon: HomeIcon, hi: `पंडित जी आपके घर ${cityInfo.name} में`, en: `Pandit Ji Comes to Your Home in ${cityInfo.nameEn}`, descHi: 'चयनित सेवाओं हेतु पंडित जी आपके शहर आकर पूजा सम्पन्न करवाते हैं।', descEn: 'For select services, Pandit ji travels to your city to perform the ritual.' },
                        ].map((mode, i) => (
                            <div key={i} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
                                <mode.Icon size={28} style={{ color: 'var(--gold-600)', marginBottom: '0.75rem' }} />
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t(mode.hi, mode.en)}</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{t(mode.descHi, mode.descEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured services, each linking to its real detail page */}
            <section className="section" style={{ background: 'var(--cream)' }}>
                <div className="container">
                    <h2 className="section-title" style={{ textAlign: 'center' }}>
                        {t(`${cityInfo.name} में लोकप्रिय पूजा सेवाएं`, `Popular Pooja Services for ${cityInfo.nameEn}`)}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                        {featuredServices.map(service => (
                            <Link key={service.id} to={`/services/${service.id}`} style={{ display: 'block', background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                    <CheckCircle2 size={18} style={{ color: 'var(--gold-600)', flexShrink: 0, marginTop: '0.15rem' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{t(service.name, service.nameEn)}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t(service.shortDesc, service.shortDescEn)}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/services" className="btn btn-outline-dark">
                            {t('सभी सेवाएं देखें', 'View All Services')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section section-dark">
                <div className="container text-center">
                    <h2 style={{ color: 'white' }}>{t(`${cityInfo.name} से अभी बुकिंग करें`, `Book Now from ${cityInfo.nameEn}`)}</h2>
                    <p style={{ color: 'var(--warm-200)', maxWidth: 560, margin: '0.75rem auto 1.5rem' }}>
                        {t('WhatsApp पर संपर्क करें — पंडित जी आपकी आवश्यकता एवं उपलब्ध विकल्पों के बारे में बताएंगे।', 'Contact us on WhatsApp - Pandit ji will guide you through your options.')}
                    </p>
                    <a
                        href={`https://wa.me/919278148269?text=${encodeURIComponent(t(`नमस्कार! मैं ${cityInfo.name} से हूं और पूजा बुक करना चाहता हूं।`, `Hello! I am from ${cityInfo.nameEn} and would like to book a pooja.`))}`}
                        target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg"
                    >
                        <MessageCircle size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                        {t('WhatsApp करें', 'WhatsApp Us')}
                    </a>
                </div>
            </section>
        </div>
    );
}
