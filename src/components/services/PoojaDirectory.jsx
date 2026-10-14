import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { catalog, categories, detailServiceCount, searchCatalog, groupByCategory } from '../../catalog';
import { waLink } from '../../config/contact';
import PoojaRow from './PoojaRow';
import ServiceCard from './ServiceCard';

/** "All Our Pooja Services, At a Glance": the 14 detail-page services as cards, plus EVERY listed pooja grouped by category. */
export default function PoojaDirectory() {
    const { t, lang } = useLanguage();
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('all');

    const matches = useMemo(() => searchCatalog(catalog, query), [query]);
    const visible = useMemo(() => (cat === 'all' ? matches : matches.filter(e => e.categoryId === cat)), [matches, cat]);
    const cards = visible.filter(e => e.serviceId);
    const groups = useMemo(() => groupByCategory(visible, categories), [visible]);
    const countIn = (id) => matches.filter(e => e.categoryId === id).length;
    const autoOpen = Boolean(query.trim()) || cat !== 'all';
    const chip = (active) => ({
        padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-gold)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
        background: active ? 'var(--gold-800)' : 'white', color: active ? 'white' : 'var(--gold-800)',
    });

    return (
        <section className="section" id="pooja-directory">
            <div className="container">
                <div className="text-center">
                    <span className="section-label">{t('सभी सेवाएं', 'All Services')}</span>
                    <h2 className="section-title">{t('एक नज़र में हमारी सभी पूजा सेवाएं', 'All Our Pooja Services, At a Glance')}</h2>
                    <p className="section-subtitle">
                        {t(
                            `कुल ${catalog.length} पूजा, पाठ एवं अनुष्ठान — इनमें ${detailServiceCount} की पूरी विवरण-पृष्ठ सहित जानकारी`,
                            `${catalog.length} poojas, paath & rituals in all - ${detailServiceCount} of them with full detail pages`
                        )}
                    </p>
                </div>

                <div style={{ maxWidth: 480, margin: '1.75rem auto 0', position: 'relative' }}>
                    <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('पूजा का नाम खोजें... (जैसे रुद्राभिषेक, गीता, 38)', 'Search by pooja name... (e.g. Rudrabhishek, गीता, 38)')}
                        style={{ width: '100%', padding: '0.85rem 2.6rem 0.85rem 2.75rem', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-gold)', fontSize: '0.95rem', background: 'white' }}
                        aria-label={t('पूजा खोजें', 'Search services')}
                    />
                    {query && (
                        <button type="button" onClick={() => setQuery('')} aria-label={t('खोज साफ़ करें', 'Clear search')}
                            style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div role="group" aria-label={t('श्रेणी', 'Category')} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', margin: '1rem 0 0' }}>
                    <button type="button" aria-pressed={cat === 'all'} onClick={() => setCat('all')} style={chip(cat === 'all')}>{t('सभी', 'All')} ({matches.length})</button>
                    {categories.map(c => (
                        <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} style={chip(cat === c.id)}>
                            {lang === 'hi' ? c.nameHi : c.nameEn} ({countIn(c.id)})
                        </button>
                    ))}
                </div>

                {(query || cat !== 'all') && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }} aria-live="polite">
                        {visible.length > 0
                            ? t(`${visible.length} पूजा/पाठ मिले`, `${visible.length} found`)
                            : t('कोई पूजा नहीं मिली — कृपया अन्य शब्द आज़माएं', 'Nothing found - try a different search term')}
                    </p>
                )}

                {cards.length > 0 && (
                    <>
                        <h3 style={{ fontSize: '1.05rem', margin: '1.75rem 0 0', textAlign: 'center' }}>{t('विस्तृत जानकारी वाली सेवाएं', 'Services with full details')}</h3>
                        <div className="service-browse-grid">{cards.map(e => <ServiceCard key={e.key} entry={e} />)}</div>
                    </>
                )}

                {groups.length > 0 && (
                    <div style={{ maxWidth: 900, margin: '2.25rem auto 0' }}>
                        <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem', textAlign: 'center' }}>{t('संपूर्ण पूजा-पाठ सूची', 'Complete pooja directory')}</h3>
                        {groups.map(g => (
                            <details key={`${g.id}-${autoOpen}`} open={autoOpen} className="pooja-group">
                                <summary>
                                    <span>{lang === 'hi' ? g.nameHi : g.nameEn}</span>
                                    <span className="pooja-group-count">{g.entries.length}</span>
                                </summary>
                                <ul className="pooja-list">{g.entries.map(e => <PoojaRow key={e.key} entry={e} />)}</ul>
                            </details>
                        ))}
                        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.7 }}>
                            {t('दरें बताई गई इकाई के लिए हैं; आपकी आवश्यकता का अंतिम मूल्य बुकिंग से पहले WhatsApp पर बताया जाता है। ', 'Rates are per the unit shown; the final price for your requirement is confirmed on WhatsApp before you book. ')}
                            <Link to="/price-list">{t('पूरी दर सूची →', 'Full price list →')}</Link>
                        </p>
                    </div>
                )}

                {visible.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a href={waLink(t(`नमस्कार! मुझे "${query}" के बारे में पूछताछ करनी है।`, `Hello! I'd like to ask about "${query}".`))} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                            <MessageCircle size={15} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('WhatsApp पर पूछें', 'Ask on WhatsApp')}
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}
