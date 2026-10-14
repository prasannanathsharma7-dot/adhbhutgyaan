import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, ScrollText, CalendarDays, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { waLink } from '../config/contact';

// Link-in-bio landing page for Instagram (bio link: /links?utm_source=instagram&utm_medium=bio).
// ~98% of the account's views come from Reels watched by non-followers, so this page has one
// job: get a mobile visitor to WhatsApp / Free Kundli / Price List in one tap.
// It is deliberately NOT in the sitemap or the prerender list and is marked noindex.
export default function Links() {
    const { t } = useLanguage();
    // The enquiry text carries where the visitor came from, so every WhatsApp lead can be
    // attributed without any tracking script (e.g. "(via instagram)"). Read AFTER mount: this
    // page is prerendered at build time (no query string), so reading it during render would
    // make the browser's first render differ from the server HTML (hydration mismatch).
    const [via, setVia] = useState('');
    useEffect(() => {
        const source = (new URLSearchParams(window.location.search).get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
        setVia(source ? ` (via ${source})` : '');
    }, []);

    useSEO({
        title: t('अद्भुत ज्ञान — काशी से वैदिक पूजा एवं ज्योतिष', 'Adhbhut Gyaan - Vedic Pooja & Astrology from Kashi'),
        description: t('काशी से वैदिक पूजा सेवा, कुंडली एवं ज्योतिष परामर्श।', 'Vedic pooja seva, kundli and astrology guidance from Holy Kashi.'),
        path: '/links',
        noindex: true,
    });

    const wa = (text) => waLink(text + via);
    const buttons = [
        { href: wa('Namaste, I would like to book a pooja / get guidance.'), external: true, Icon: MessageCircle, label: t('WhatsApp पर बुकिंग / पूछताछ', 'Book / ask on WhatsApp'), primary: true },
        { to: '/free-kundli', Icon: Sparkles, label: t('निःशुल्क कुंडली', 'Free Kundli') },
        { to: '/price-list', Icon: ScrollText, label: t('पूजा-पाठ दर सूची', 'Pooja & Paath Price List') },
        { to: '/booking?service=astrology-consultation', Icon: CalendarDays, label: t('ज्योतिष परामर्श — ₹501', 'Astrology Consultation - ₹501') },
        { to: '/panchang', Icon: Sun, label: t('आज का पंचांग', "Today's Panchang") },
    ];
    const btn = (primary) => ({
        display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.95rem 1.1rem', borderRadius: 'var(--radius-xl)',
        fontWeight: 600, fontSize: '1rem', textDecoration: 'none', boxSizing: 'border-box',
        background: primary ? 'var(--whatsapp, #25D366)' : 'white', color: primary ? 'white' : 'var(--text-primary)',
        border: primary ? 'none' : '1px solid var(--border-gold)', boxShadow: 'var(--shadow-md)',
    });

    return (
        <section className="section" style={{ minHeight: '70vh', paddingTop: 'calc(var(--nav-height, 72px) + 2rem)' }}>
            <div className="container" style={{ maxWidth: 460, textAlign: 'center' }}>
                <img src="/images/logo-192.webp" alt="" width="96" height="96" style={{ borderRadius: '50%', border: '2px solid var(--border-gold)' }} />
                <h1 style={{ fontSize: '1.5rem', margin: '0.8rem 0 0.2rem' }}>{t('अद्भुत ज्ञान', 'Adhbhut Gyaan')}</h1>
                <p style={{ margin: '0 0 1.4rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {t('काशी से वैदिक पूजा सेवा · कुंडली एवं ज्योतिष परामर्श · नाम-गोत्र से लाइव संकल्प पूजा', 'Vedic pooja seva from Holy Kashi · Kundli & astrology guidance · Live sankalp pooja in your name & gotra')}
                </p>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {buttons.map(({ href, to, external, Icon, label, primary }) => (
                        external
                            ? <a key={label} href={href} target="_blank" rel="noreferrer" style={btn(primary)}><Icon size={20} aria-hidden="true" /><span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>{label}</span></a>
                            : <Link key={label} to={to} style={btn(primary)}><Icon size={20} aria-hidden="true" /><span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>{label}</span></Link>
                    ))}
                </div>
                <p style={{ marginTop: '1.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Link to="/about">{t('हमारे बारे में', 'About us')}</Link>
                </p>
            </div>
        </section>
    );
}
