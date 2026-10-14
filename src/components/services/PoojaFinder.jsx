import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { catalog, CONCERNS, recommendForConcern } from '../../catalog';
import { waLink } from '../../config/contact';
import PoojaRow from './PoojaRow';

/** "What is your concern?" -> suggested poojas, drawn from the WHOLE catalog (not just the 14 detail pages). */
export default function PoojaFinder() {
    const { t, lang } = useLanguage();
    const [selected, setSelected] = useState(null);
    const resultsRef = useRef(null);
    const concern = CONCERNS.find(c => c.id === selected);
    const { featured, more } = useMemo(() => (selected ? recommendForConcern(catalog, selected) : { featured: [], more: [] }), [selected]);

    // Selecting a concern renders the results below the fold on mobile with no visual change to
    // draw the eye there (a real user saw the button highlight and nothing else), so scroll the
    // results into view, offset for the fixed navbar.
    useEffect(() => {
        if (!selected || !resultsRef.current) return;
        const navbar = document.querySelector('.navbar');
        const offset = (navbar?.offsetHeight || 70) + 12;
        window.scrollTo({ top: resultsRef.current.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }, [selected]);

    return (
        <section className="section" style={{ paddingBottom: selected ? '1rem' : undefined }}>
            <div className="container">
                <div className="text-center">
                    <span className="section-label">{t('सही पूजा खोजें', 'Find the Right Pooja')}</span>
                    <h2 className="section-title">{t('आपकी समस्या क्या है?', "What's Your Concern?")}</h2>
                    <p className="section-subtitle">{t('नीचे अपनी समस्या चुनें — हम सही पूजा सुझाएंगे।', "Select your concern below and we'll suggest the right pooja.")}</p>
                </div>

                <div className="concern-filter-list" role="group" aria-label={t('समस्या चुनें', 'Choose a concern')} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                    {CONCERNS.map(c => (
                        <button
                            key={c.id} type="button" aria-pressed={c.id === selected}
                            onClick={() => setSelected(c.id === selected ? null : c.id)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.2rem', borderRadius: 'var(--radius-xl)',
                                border: c.id === selected ? 'none' : '1px solid var(--border-gold)',
                                background: c.id === selected ? 'var(--gold-600)' : 'white',
                                color: c.id === selected ? 'white' : 'var(--gold-800)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                            }}
                        >
                            {c.image && <img src={`/images/icons/${c.image}.jpg`} alt="" width="22" height="22" loading="lazy" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />}
                            {lang === 'hi' ? c.hi : c.en}
                        </button>
                    ))}
                </div>

                {concern && (
                    <div ref={resultsRef} style={{ marginTop: '2rem', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {t('इसके लिए ये पूजाएं सुझाई जाती हैं:', 'These poojas are recommended for this:')}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                            {featured.map(s => (
                                <Link key={s.key} to={s.detailPath} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '0.85rem 1rem', textDecoration: 'none' }}>
                                    <img src={`/images/${s.image}`} alt={s.nameEn} width="64" height="64" style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gold-800)' }}>{lang === 'hi' ? s.nameHi : s.nameEn}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('विवरण देखें →', 'View Details →')}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {more.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
                                    {t(`इसी समस्या हेतु अन्य पूजा-पाठ (${more.length})`, `More poojas & paath for this concern (${more.length})`)}
                                </h3>
                                <ul className="pooja-list">{more.map(e => <PoojaRow key={e.key} entry={e} />)}</ul>
                            </div>
                        )}

                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'center' }}>
                            {t(
                                'ये सुझाव शास्त्रीय परम्परा पर आधारित मार्गदर्शन हैं — परिणाम की कोई गारंटी नहीं। आपकी कुंडली के अनुसार सही पूजा पंडित जी तय करते हैं।',
                                'These are suggestions based on traditional practice, not a guarantee of any outcome. Pandit ji confirms the right pooja for your chart.'
                            )}{' '}
                            <a href="#pooja-directory">{t('सभी पूजाएं देखें ↓', 'See every pooja ↓')}</a>
                            {' · '}
                            <a href={waLink(`Namaste, I need guidance on the right pooja for: ${concern.en}.`)} target="_blank" rel="noreferrer"><MessageCircle size={12} style={{ verticalAlign: '-1px' }} /> {t('पंडित जी से पूछें', 'Ask Pandit ji')}</a>
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
