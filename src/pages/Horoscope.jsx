import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { AlertTriangle, MessageCircle } from 'lucide-react';

const RASHIS = [
    { id: 'mesha', name: 'मेष', nameEn: 'Aries', symbol: '♈' },
    { id: 'vrishabha', name: 'वृषभ', nameEn: 'Taurus', symbol: '♉' },
    { id: 'mithuna', name: 'मिथुन', nameEn: 'Gemini', symbol: '♊' },
    { id: 'karka', name: 'कर्क', nameEn: 'Cancer', symbol: '♋' },
    { id: 'simha', name: 'सिंह', nameEn: 'Leo', symbol: '♌' },
    { id: 'kanya', name: 'कन्या', nameEn: 'Virgo', symbol: '♍' },
    { id: 'tula', name: 'तुला', nameEn: 'Libra', symbol: '♎' },
    { id: 'vrishchika', name: 'वृश्चिक', nameEn: 'Scorpio', symbol: '♏' },
    { id: 'dhanu', name: 'धनु', nameEn: 'Sagittarius', symbol: '♐' },
    { id: 'makara', name: 'मकर', nameEn: 'Capricorn', symbol: '♑' },
    { id: 'kumbha', name: 'कुंभ', nameEn: 'Aquarius', symbol: '♒' },
    { id: 'meena', name: 'मीन', nameEn: 'Pisces', symbol: '♓' },
];

export default function Horoscope() {
    const { t, lang } = useLanguage();
    const [period, setPeriod] = useState('daily');
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useSEO({
        title: t('राशिफल — आज का राशिफल, दैनिक एवं मासिक राशिफल | Adhbhut Gyaan', 'Free Daily Horoscope — Aaj Ka Rashifal, Today\'s & Monthly Horoscope | Adhbhut Gyaan'),
        description: t('सभी 12 राशियों का आज का राशिफल, साप्ताहिक व मासिक राशिफल — करियर, धन, स्वास्थ्य एवं प्रेम पर काशी के ज्योतिषी डॉ. उमंग नाथ शर्मा का मार्गदर्शन।', "Free daily horoscope for all 12 zodiac signs (rashi) - today's and monthly horoscope on career, money, health and love, by Kashi astrologer Dr. Umang Nath Sharma."),
        path: '/horoscope',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Horoscope', path: '/horoscope' },
        ])),
    });

    const fetchHoroscope = async (rashi, chosenPeriod) => {
        setSelected(rashi);
        setPeriod(chosenPeriod);
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await fetch(`/api/horoscope?rashi=${rashi.id}&period=${chosenPeriod}`);
            const data = await res.json();
            if (data.ok) {
                setResult(data);
            } else {
                setError(data.error || t('राशिफल लाने में समस्या हुई।', 'Could not load the horoscope.'));
            }
        } catch (err) {
            setError(t('नेटवर्क समस्या — दोबारा प्रयास करें।', 'Network error — please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="page-header">
                <div className="container text-center">
                    <h1>{t('राशिफल', 'Horoscope')}</h1>
                    <p className="subtitle">{t('अपनी राशि चुनें — आज का या इस महीने का राशिफल जानें', "Pick your rashi — find out today's or this month's horoscope")}</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                        <button
                            type="button"
                            className={`btn ${period === 'daily' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => { setPeriod('daily'); if (selected) fetchHoroscope(selected, 'daily'); }}
                        >
                            {t('दैनिक', 'Daily')}
                        </button>
                        <button
                            type="button"
                            className={`btn ${period === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => { setPeriod('monthly'); if (selected) fetchHoroscope(selected, 'monthly'); }}
                        >
                            {t('मासिक', 'Monthly')}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                        {RASHIS.map(rashi => (
                            <button
                                key={rashi.id}
                                type="button"
                                onClick={() => fetchHoroscope(rashi, period)}
                                style={{
                                    background: selected?.id === rashi.id ? 'var(--navy-900)' : 'white',
                                    color: selected?.id === rashi.id ? 'var(--gold-300)' : 'var(--navy-900)',
                                    border: '1px solid var(--border-gold)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '1.25rem 0.75rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all var(--dur-normal) var(--ease-out)',
                                    boxShadow: 'var(--shadow-sm)',
                                }}
                            >
                                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.35rem' }}>{rashi.symbol}</span>
                                <strong style={{ fontSize: '0.9rem', display: 'block' }}>{lang === 'hi' ? rashi.name : rashi.nameEn}</strong>
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div className="text-center" style={{ padding: '2rem' }}>
                            <p>{t('राशिफल तैयार किया जा रहा है…', 'Preparing your horoscope…')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center" style={{ padding: '1rem', color: '#dc2626' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertTriangle size={15} />{error}</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div style={{ maxWidth: '680px', margin: '0 auto', background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ fontSize: '2.5rem' }}>{result.rashi.symbol}</span>
                                <h2 style={{ margin: '0.35rem 0 0' }}>{lang === 'hi' ? result.rashi.name : result.rashi.nameEn}</h2>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {result.period === 'monthly' ? t('इस महीने का राशिफल', "This Month's Horoscope") : t('आज का राशिफल', "Today's Horoscope")}
                                </p>
                            </div>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                {result.text}
                            </p>
                            <div className="text-center" style={{ marginTop: '1.5rem' }}>
                                <a
                                    href={`https://wa.me/919818227189?text=${encodeURIComponent(t('नमस्कार! मुझे अपनी सटीक जन्म-कुंडली के अनुसार परामर्श चाहिए।', 'Hello! I would like a consultation based on my exact birth chart.'))}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-whatsapp"
                                >
                                    <MessageCircle size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />{t('सटीक परामर्श के लिए WhatsApp करें', 'WhatsApp for a Personalized Reading')}
                                </a>
                            </div>
                        </div>
                    )}

                    {!result && !loading && !error && (
                        <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                            <p>{t('ऊपर अपनी राशि चुनें', 'Pick your rashi above to begin')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
