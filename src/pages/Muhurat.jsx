import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { Heart, Home as HomeIcon, Baby, Briefcase, Sparkles, Loader2 } from 'lucide-react';

const CATEGORIES = [
    { id: 'vivah', icon: Heart, nameHi: 'विवाह मुहूर्त', nameEn: 'Marriage Muhurat' },
    { id: 'grihapravesh', icon: HomeIcon, nameHi: 'गृह प्रवेश मुहूर्त', nameEn: 'Griha Pravesh Muhurat' },
    { id: 'naamkaran', icon: Baby, nameHi: 'नामकरण मुहूर्त', nameEn: 'Naamkaran Muhurat' },
    { id: 'business', icon: Briefcase, nameHi: 'व्यापार आरंभ मुहूर्त', nameEn: 'Business Launch Muhurat' },
];

export default function Muhurat() {
    const { t, lang } = useLanguage();
    const navigate = useNavigate();
    const [category, setCategory] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', monthsAhead: 3 });
    const [status, setStatus] = useState('idle'); // idle | loading | error
    const [error, setError] = useState('');

    useSEO({
        title: t('शुभ मुहूर्त — विवाह, गृह प्रवेश, नामकरण, व्यापार | Adhbhut Gyaan', 'Shubh Muhurat — Marriage, Housewarming, Naming, Business | Adhbhut Gyaan'),
        description: t('अपने जीवन के महत्वपूर्ण अवसर हेतु शास्त्रोक्त शुभ मुहूर्त प्राप्त करें — पंचांग-आधारित सटीक गणना।', 'Get a scripturally-grounded auspicious Muhurat for your important life events - accurate Panchang-based calculation.'),
        path: '/muhurat',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Muhurat', path: '/muhurat' }])),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !form.name.trim() || !form.phone.trim()) return;
        setStatus('loading');
        setError('');
        try {
            const res = await fetch('/api/muhurat-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, name: form.name, phone: form.phone, monthsAhead: form.monthsAhead }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || 'Something went wrong');
            navigate(`/muhurat/report/${data.orderId}`);
        } catch (err) {
            setStatus('error');
            setError(err.message);
        }
    };

    return (
        <div>
            <section className="hero" style={{ minHeight: '40vh', background: 'var(--navy-950)' }}>
                <div className="container text-center" style={{ position: 'relative', zIndex: 2, padding: '3rem 0' }}>
                    <span className="section-label" style={{ justifyContent: 'center', color: 'var(--gold-400)' }}>
                        <Sparkles size={14} style={{ marginRight: '0.4rem' }} />{t('शुभ मुहूर्त', 'Shubh Muhurat')}
                    </span>
                    <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', margin: '0.5rem 0' }}>
                        {t('अपने महत्वपूर्ण अवसर हेतु सही तिथि चुनें', 'Choose the Right Date for Your Important Occasion')}
                    </h1>
                    <p style={{ color: 'var(--warm-200)', maxWidth: '600px', margin: '0 auto' }}>
                        {t('पंचांग-आधारित शास्त्रोक्त गणना — विवाह, गृह प्रवेश, नामकरण एवं व्यापार आरंभ हेतु।', 'Scripturally-grounded, Panchang-based calculation for marriage, housewarming, naming ceremony, and business launch.')}
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container" style={{ maxWidth: '720px' }}>
                    <h2 className="section-title text-center">{t('1. अवसर चुनें', '1. Choose the Occasion')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                        {CATEGORIES.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setCategory(c.id)}
                                style={{
                                    padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', cursor: 'pointer',
                                    border: category === c.id ? '2px solid var(--gold-500)' : '1px solid var(--border-light)',
                                    background: category === c.id ? 'var(--gold-50)' : 'white',
                                }}
                            >
                                <c.icon size={26} style={{ color: 'var(--gold-600)', marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{lang === 'hi' ? c.nameHi : c.nameEn}</div>
                            </button>
                        ))}
                    </div>

                    {category && (
                        <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem', background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                            <h3 style={{ marginBottom: '1.25rem' }}>{t('2. अपनी जानकारी दें', '2. Your Details')}</h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{t('नाम', 'Name')}</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{t('फ़ोन नंबर', 'Phone Number')}</label>
                                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="+91 92781 48269"
                                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{t('कितने महीनों में', 'Search within')}</label>
                                <select value={form.monthsAhead} onChange={e => setForm(f => ({ ...f, monthsAhead: Number(e.target.value) }))}
                                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                    <option value={1}>{t('1 महीना', '1 month')}</option>
                                    <option value={3}>{t('3 महीने', '3 months')}</option>
                                    <option value={6}>{t('6 महीने', '6 months')}</option>
                                    <option value={12}>{t('12 महीने', '12 months')}</option>
                                </select>
                            </div>
                            {error && <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
                            <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ width: '100%', justifyContent: 'center' }}>
                                {status === 'loading' ? <Loader2 size={16} className="spin" style={{ marginRight: '0.4rem' }} /> : null}
                                {status === 'loading' ? t('गणना हो रही है...', 'Calculating...') : t('शुभ मुहूर्त प्राप्त करें', 'Get Shubh Muhurat')}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
