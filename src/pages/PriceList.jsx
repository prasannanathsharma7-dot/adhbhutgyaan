import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { formatPrice, UNIT_LABELS } from '../utils/pricing';
import priceList from '../data/priceList.json';
import { waLink, WHATSAPP_DISPLAY } from '../config/contact';

const UPDATED = { hi: 'अक्टूबर 2026', en: 'October 2026' };

const norm = (s) => (s || '').toString().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim();

export default function PriceList() {
    const { t, lang } = useLanguage();
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('all');

    useSEO({
        title: t('पूजा-पाठ दर सूची | Adhbhut Gyaan', 'Pooja & Paath Price List - Kashi | Adhbhut Gyaan'),
        description: t(
            'काशी के विद्वान पंडितों द्वारा पाठ, श्राद्ध, जाप, यज्ञ एवं ज्योतिष परामर्श की दर सूची — स्पष्ट दरें, WhatsApp पर पुष्टि।',
            'Price list for paath, shraddh, jaap, yagya and astrology consultation by the Pandits of Kashi - clear rates, confirmed on WhatsApp.'
        ),
        path: '/price-list',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Price List', path: '/price-list' }])),
    });

    const q = norm(query);
    const visible = useMemo(() => priceList.items.filter(it => {
        if (cat !== 'all' && it.category !== cat) return false;
        if (!q) return true;
        return norm(it.nameEn).includes(q) || norm(it.nameHi).includes(q) || String(it.no) === q;
    }), [q, cat]);

    const unitText = (u) => (UNIT_LABELS[u] ? UNIT_LABELS[u][lang === 'hi' ? 'hi' : 'en'] : '');

    const priceCell = (it) => {
        if (it.status === 'approved') {
            const amount = it.min === it.max ? formatPrice(it.min) : `${formatPrice(it.min)} – ${formatPrice(it.max)}`;
            return (<><strong style={{ color: 'var(--gold-700)', fontSize: '1.02rem' }}>{amount}</strong>{unitText(it.unit) && <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)' }}>{unitText(it.unit)}</span>}</>);
        }
        return <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{it.status === 'ask' ? t('दर पूछें', 'Price on request') : t('मूल्य हेतु WhatsApp करें', 'Price on WhatsApp')}</span>;
    };

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('दर सूची', 'Price List')}</span></div>
                    <h1>{t('पूजा-पाठ दर सूची', 'Pooja & Paath Price List')}</h1>
                    <p className="subtitle">{t('काशी के पंडितों द्वारा — स्पष्ट दरें, बुकिंग से पहले पुष्टि', 'By the Pandits of Kashi - clear rates, confirmed before you book')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 900 }}>
                    {/* Consultation - the one flat, final price */}
                    <div style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{t(priceList.consultation.nameHi, priceList.consultation.nameEn)}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('डॉ. उमंग नाथ शर्मा के साथ — ऑनलाइन या वाराणसी में', 'With Dr. Umang Nath Sharma - online or in Varanasi')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-700)', lineHeight: 1.1 }}>{formatPrice(priceList.consultation.price)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('प्रति सत्र', 'per session')}</div>
                            <Link to="/booking?service=astrology-consultation" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>{t('परामर्श बुक करें', 'Book Consultation')}</Link>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                        {t(
                            'दरें बताई गई इकाई (जैसे प्रति पाठ या प्रति अनुष्ठान) के लिए हैं। आपकी आवश्यकता — पंडितों की संख्या, सामग्री, स्थान, ऑनलाइन/ऑफ़लाइन — के अनुसार अंतिम मूल्य बुकिंग से पहले WhatsApp पर स्पष्ट बता दिया जाता है। अंतिम अद्यतन: ' + UPDATED.hi + '।',
                            'Rates are for the unit shown (for example per paath or per ritual). The final price for your requirement - number of Pandits, materials, location, online or in person - is confirmed clearly on WhatsApp before you book. Last updated: ' + UPDATED.en + '.'
                        )}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ position: 'relative', flex: '1 1 240px' }}>
                            <span className="sr-only">{t('सेवा खोजें', 'Search services')}</span>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} aria-hidden="true" />
                            <input
                                type="search"
                                className="form-input"
                                style={{ paddingLeft: 36, width: '100%' }}
                                placeholder={t('खोजें — जैसे रुद्राभिषेक, Gita, 38', 'Search - e.g. Rudrabhishek, गीता, 38')}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </label>
                    </div>
                    <div role="tablist" aria-label={t('श्रेणी', 'Category')} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[{ id: 'all', nameHi: 'सभी', nameEn: 'All' }, ...priceList.categories].map(c => (
                            <button
                                key={c.id} type="button" role="tab" aria-selected={cat === c.id}
                                onClick={() => setCat(c.id)}
                                style={{ padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-gold)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: cat === c.id ? 'var(--gold-600)' : 'white', color: cat === c.id ? 'white' : 'var(--gold-700)' }}
                            >{t(c.nameHi, c.nameEn)}</button>
                        ))}
                    </div>

                    {visible.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                            {t('कोई सेवा नहीं मिली। कृपया WhatsApp पर पूछें —', 'No matching service. Please ask us on WhatsApp -')}{' '}
                            <a href={waLink('Namaste, I am looking for a pooja that I could not find on the price list.')} target="_blank" rel="noreferrer">{WHATSAPP_DISPLAY}</a>
                        </p>
                    )}

                    {priceList.categories.filter(c => visible.some(i => i.category === c.id)).map(c => (
                        <div key={c.id} style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.6rem', color: 'var(--text-primary)' }}>{t(c.nameHi, c.nameEn)}</h2>
                            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'white' }}>
                                {visible.filter(i => i.category === c.id).map((it, idx) => (
                                    <div key={it.no} style={{ display: 'grid', gridTemplateColumns: '2.2rem 1fr auto auto', gap: '0.75rem', alignItems: 'center', padding: '0.7rem 0.9rem', borderTop: idx ? '1px solid var(--border-light)' : 'none' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{it.no}</span>
                                        <span>
                                            <span style={{ fontWeight: 600 }}>{t(it.nameHi, it.nameEn)}</span>
                                            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lang === 'hi' ? it.nameEn : it.nameHi}</span>
                                        </span>
                                        <span style={{ textAlign: 'right', minWidth: 96 }}>{priceCell(it)}</span>
                                        <a
                                            href={waLink(`Namaste, I would like to enquire about "${it.nameEn} / ${it.nameHi}" (price list #${it.no}). Please share the details and availability.`)}
                                            target="_blank" rel="noreferrer"
                                            aria-label={`${t('WhatsApp पर पूछें', 'Enquire on WhatsApp')}: ${it.nameEn}`}
                                            style={{ color: 'var(--whatsapp, #25D366)', display: 'inline-flex' }}
                                        ><MessageCircle size={20} /></a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        {t('सूची में न मिलने वाले अनुष्ठान भी करवाए जा सकते हैं — WhatsApp पर पूछें।', 'Rituals not on this list can also be arranged - just ask on WhatsApp.')}
                    </p>
                </div>
            </section>
        </div>
    );
}
