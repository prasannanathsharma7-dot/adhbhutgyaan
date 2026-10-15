import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import festivalData from '../data/festivals.json';
import { catalog } from '../catalog';
import { waLink } from '../config/contact';
import { todayIST, formatDay, formatIST, windowText, tithiLabel } from '../utils/istFormat';

// Festivals and tithi calendar for Kashi (Varanasi). The festival list is verified data (src/data/festivals.json, built by
// scripts/build-festivals.mjs and test-locked); the 60-day tithi calendar is computed on the visitor's device, only when it
// scrolls into view, from the same verified Panchang engine.
const byKey = new Map(catalog.map(e => [e.key, e]));

const KIND = {
    amavasya: { en: 'Amavasya', hi: 'अमावस्या', useEn: 'Traditionally: tarpan, pind daan and other Pitru karma.', useHi: 'परम्परा: तर्पण, पिंडदान व पितृ-कर्म।' },
    purnima: { en: 'Purnima', hi: 'पूर्णिमा', useEn: 'Traditionally: Satyanarayan katha, Ganga snan and daan.', useHi: 'परम्परा: सत्यनारायण कथा, गंगा-स्नान व दान।' },
    ekadashi: { en: 'Ekadashi', hi: 'एकादशी', useEn: 'Vishnu vrat; Vishnu Sahasranama paath.', useHi: 'विष्णु व्रत; विष्णु सहस्रनाम पाठ।' },
    pradosh: { en: 'Pradosh', hi: 'प्रदोष', useEn: 'Shiva worship in the evening (Trayodashi at pradosh).', useHi: 'सायं शिव-पूजन (प्रदोष में त्रयोदशी)।' },
};

function TithiCalendar() {
    const { t, lang } = useLanguage();
    const ref = useRef(null);
    const [events, setEvents] = useState(null);

    useEffect(() => {
        const el = ref.current; if (!el) return undefined;
        let cancelled = false; let observer = null;
        const run = async () => {
            const { tithiEvents } = await import('../utils/tithiWindows.js'); // the astronomy engine is loaded only now
            const [y, m, d] = todayIST().split('-').map(Number);
            if (!cancelled) setEvents(tithiEvents([y, m, d], 60));
        };
        if (typeof IntersectionObserver === 'undefined') run();
        else { observer = new IntersectionObserver((es) => { if (es.some(e => e.isIntersecting)) { observer.disconnect(); run(); } }, { rootMargin: '400px 0px' }); observer.observe(el); }
        return () => { cancelled = true; if (observer) observer.disconnect(); };
    }, []);

    const groups = events && ['amavasya', 'purnima', 'ekadashi', 'pradosh'].map(k => ({ k, rows: events.filter(e => (k === 'ekadashi' ? e.kind.startsWith('ekadashi') : e.kind === k)) }));
    const win = (e) => windowText({ tithi: e.tithi, start: e.start ? new Date(e.start).toISOString() : null, end: e.end ? new Date(e.end).toISOString() : null }, lang);

    return (
        <section ref={ref} className="section" style={{ minHeight: events ? undefined : 360 }} aria-labelledby="tithi-cal-h">
            <div className="container" style={{ maxWidth: 900 }}>
                <h2 id="tithi-cal-h" className="section-title text-center">{t('अगले 60 दिन का तिथि-कैलेंडर', 'Tithi calendar - next 60 days')}</h2>
                <p className="section-subtitle text-center">{t('अमावस्या, पूर्णिमा, एकादशी व प्रदोष — काशी के सूर्योदय के अनुसार, तिथि के आरंभ-समाप्ति समय सहित', 'Amavasya, Purnima, Ekadashi and Pradosh for Kashi, with the exact start and end of each tithi')}</p>
                {!events && <p className="text-center" style={{ color: 'var(--text-muted)' }} role="status">{t('गणना हो रही है…', 'Calculating…')}</p>}
                {groups && groups.map(({ k, rows }) => rows.length > 0 && (
                    <div key={k} style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{lang === 'hi' ? KIND[k].hi : KIND[k].en}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{lang === 'hi' ? KIND[k].useHi : KIND[k].useEn}</p>
                        <ul className="pooja-list">
                            {rows.map((e) => (
                                <li key={e.date + e.kind} className="pooja-row">
                                    <span className="pooja-row-names"><span className="pooja-row-name">{formatDay(e.date, lang)}</span><span className="pooja-row-alt">{win(e)}</span></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function Festivals() {
    const { t, lang } = useLanguage();
    const [today, setToday] = useState(null);
    useEffect(() => { setToday(todayIST()); }, []);

    useSEO({
        title: t('पर्व व त्योहार अक्टूबर–नवंबर 2026 — काशी की तिथि के अनुसार | Adhbhut Gyaan', 'Hindu Festivals Oct-Nov 2026 - Dates & Tithi Times for Kashi (Varanasi) | Adhbhut Gyaan'),
        description: t('दशहरा, शरद पूर्णिमा, करवा चौथ, धनतेरस, दीवाली, भाई दूज, देव उठनी एकादशी व देव दीपावली 2026 की तारीख़ें तथा काशी के तिथि-समय।', 'Dussehra, Sharad Purnima, Karwa Chauth, Dhanteras, Diwali, Bhai Dooj, Dev Uthani Ekadashi and Dev Deepawali 2026: dates and tithi start/end times for Kashi (Varanasi).'),
        path: '/festivals',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Festivals', path: '/festivals' }])),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('पर्व', 'Festivals')}</span></div>
                    <h1>{t('पर्व एवं तिथि-कैलेंडर — काशी', 'Festivals & Tithi Calendar - Kashi')}</h1>
                    <p className="subtitle">{t('अक्टूबर–नवंबर 2026 · वाराणसी की तिथि के अनुसार तारीख़ व समय', 'October-November 2026 · dates and times for Varanasi')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 900 }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        {t('तारीख़ें हर पर्व के शास्त्रीय नियम (उदय तिथि, प्रदोष, अपराह्न, चंद्रोदय आदि) से तय हैं और अनेक प्रकाशित पंचांगों से मिलाई गई हैं; समय हमारे सत्यापित पंचांग-इंजन से, वाराणसी (IST) के लिए। स्मार्त/वैष्णव या कुल-परम्परा से भिन्नता हो सकती है — अपने पंडित जी से पुष्टि करें।', 'Dates follow each festival\'s classical rule (udaya tithi, pradosh, aparahna, moonrise...) and were checked against several published panchangs; times come from our verified Panchang engine for Varanasi (IST). Smarta / Vaishnava or family traditions can differ - please confirm with your Pandit ji.')}
                    </p>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {festivalData.festivals.map(f => {
                            const past = today !== null && f.date < today;
                            const chips = f.poojas.map(k => byKey.get(k)).filter(Boolean);
                            return (
                                <article key={f.id} id={f.id} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.25rem', opacity: past ? 0.55 : 1 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                        <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{lang === 'hi' ? f.nameHi : f.nameEn}</h2>
                                        <div style={{ fontWeight: 700, color: 'var(--gold-800)' }}>
                                            {formatDay(f.date, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            {f.alsoDate && <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-muted)' }}> {t('(वैष्णव:', '(Vaishnava:')} {formatDay(f.alsoDate, lang, { day: 'numeric', month: 'short' })})</span>}
                                        </div>
                                    </div>
                                    <p style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{lang === 'hi' ? f.noteHi : f.noteEn}</p>
                                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>{t('तिथि:', 'Tithi:')}</strong> {windowText(f.window, lang)} <span style={{ fontSize: '0.75rem' }}>(IST)</span></p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                        {chips.length > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('इस अवसर पर प्रायः:', 'Commonly done around this day:')}</span>}
                                        {chips.map(e => (e.detailPath
                                            ? <Link key={e.key} to={e.detailPath} className="pooja-row-link" style={{ border: '1px solid var(--border-gold)', borderRadius: 999, padding: '0.15rem 0.7rem' }}>{lang === 'hi' ? e.nameHi : e.nameEn}</Link>
                                            : <Link key={e.key} to="/services#pooja-directory" className="pooja-row-link" style={{ border: '1px solid var(--border-gold)', borderRadius: 999, padding: '0.15rem 0.7rem' }}>{lang === 'hi' ? e.nameHi : e.nameEn}</Link>))}
                                        <a href={waLink(`Namaste, I would like to arrange a pooja for ${f.nameEn} (${f.date}).`)} target="_blank" rel="noreferrer" className="pooja-row-wa" style={{ marginLeft: 'auto' }} aria-label={`${t('WhatsApp पर पूछें', 'Enquire on WhatsApp')}: ${f.nameEn}`}><MessageCircle size={20} aria-hidden="true" /></a>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                        {t('इस सूची में वही पर्व हैं जिनकी तारीख़ कई प्रकाशित पंचांगों से मेल खाती है। अगले मौसम के पर्व जुड़ते रहेंगे।', 'Only festivals whose dates agree across several published panchangs are listed. The next season\'s festivals will be added.')}
                    </p>
                </div>
            </section>

            <TithiCalendar />
        </div>
    );
}
