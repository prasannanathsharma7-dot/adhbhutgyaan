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

// Bhakoot Kuta — one of the classical 8 "kutas" in Vedic Ashtakoot marriage
// matching, based purely on the distance (in signs) between two Moon signs
// (Rashi). This is a real, named classical technique — not a random score —
// though full marriage matching also weighs 7 other kutas (Nadi, Gana, etc.)
// that need actual birth nakshatra data, which is why this widget is framed
// as a quick first look, with a nudge toward a full consultation for anyone
// seriously considering marriage compatibility.
function getBhakootResult(rashiA, rashiB, t) {
    const idxA = RASHIS.findIndex(r => r.id === rashiA);
    const idxB = RASHIS.findIndex(r => r.id === rashiB);
    const dist = ((idxB - idxA + 12) % 12) + 1; // 1-12, distance from A to B
    const reverseDist = ((idxA - idxB + 12) % 12) + 1;

    if (dist === 1) {
        return { tier: 'excellent', label: t('उत्तम मेल', 'Excellent Match'),
            note: t('एक ही राशि — विचार, स्वभाव व जीवनशैली में गहरी समानता।', 'Same Rashi — deep natural alignment in thinking, temperament and lifestyle.') };
    }
    if ([6, 8].includes(dist) || [6, 8].includes(reverseDist)) {
        return { tier: 'caution', label: t('षडाष्टक — विशेष ध्यान आवश्यक', 'Shad-Ashtak — Needs Attention'),
            note: t('यह दूरी भकूट दोष दर्शाती है — विवाह हेतु पूर्ण कुंडली मिलान द्वारा अन्य 7 कूटों की जांच आवश्यक।', 'This distance indicates Bhakoot Dosha — for marriage, a full Kundli match checking the other 7 kutas is recommended before any decision.') };
    }
    if ([2, 12].includes(dist) || [2, 12].includes(reverseDist)) {
        return { tier: 'caution', label: t('द्विर्द्वादश — सामान्य से कम', 'Dwirdwadasha — Below Average'),
            note: t('संवाद व समझौते पर अतिरिक्त प्रयास लाभकारी रहेगा।', 'Extra effort on communication and give-and-take will help this pairing.') };
    }
    if ([5, 9].includes(dist)) {
        return { tier: 'excellent', label: t('त्रिकोण — उत्तम मेल', 'Trine — Excellent Match'),
            note: t('स्वाभाविक समझ व सहयोग की प्रबल संभावना।', 'Strong natural understanding and cooperation between these signs.') };
    }
    if (dist === 7) {
        return { tier: 'good', label: t('सप्तम — पूरक स्वभाव', 'Opposition — Complementary Natures'),
            note: t('विपरीत गुण, जो संतुलन व आकर्षण दोनों ला सकते हैं।', 'Contrasting qualities that can bring both balance and strong attraction.') };
    }
    return { tier: 'good', label: t('सामान्य मेल', 'Good Match'),
        note: t('संतुलित संबंध की संभावना — व्यक्तिगत कुंडली विवरण से अधिक स्पष्टता मिलेगी।', 'A workable, balanced pairing — a personal Kundli reading will give a fuller picture.') };
}

export default function Horoscope() {
    const { t, lang } = useLanguage();
    const [period, setPeriod] = useState('daily');
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rashiA, setRashiA] = useState('');
    const [rashiB, setRashiB] = useState('');

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
                                    href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मुझे अपनी सटीक जन्म-कुंडली के अनुसार परामर्श चाहिए।', 'Hello! I would like a consultation based on my exact birth chart.'))}`}
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

            {/* Rashi Compatibility Checker — interactive, uses the classical
                Bhakoot Kuta (Moon-sign distance) technique from Vedic
                Ashtakoot matching, framed as a quick first look rather than
                a substitute for a full Kundli-based marriage match. */}
            <section className="section" style={{ background: 'var(--cream)' }}>
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('राशि मेल जांचें', 'Compatibility Checker')}</span>
                        <h2 className="section-title">{t('दो राशियों का मेल जानें', 'Check Two Rashis\u2019 Compatibility')}</h2>
                        <p className="section-subtitle">{t('भकूट पद्धति पर आधारित त्वरित मेल — पूर्ण विवाह मिलान हेतु परामर्श लें', 'A quick classical-method check — for a full marriage match, book a personal consultation')}</p>
                    </div>

                    <div style={{ maxWidth: '600px', margin: '2rem auto 0', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--navy-900)' }}>{t('पहली राशि', 'First Rashi')}</label>
                            <select
                                value={rashiA}
                                onChange={(e) => setRashiA(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', background: 'white', fontSize: '0.95rem' }}
                            >
                                <option value="">{t('चुनें', 'Select')}</option>
                                {RASHIS.map(r => (
                                    <option key={r.id} value={r.id}>{r.symbol} {lang === 'hi' ? r.name : r.nameEn}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--navy-900)' }}>{t('दूसरी राशि', 'Second Rashi')}</label>
                            <select
                                value={rashiB}
                                onChange={(e) => setRashiB(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', background: 'white', fontSize: '0.95rem' }}
                            >
                                <option value="">{t('चुनें', 'Select')}</option>
                                {RASHIS.map(r => (
                                    <option key={r.id} value={r.id}>{r.symbol} {lang === 'hi' ? r.name : r.nameEn}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {rashiA && rashiB && (() => {
                        const res = getBhakootResult(rashiA, rashiB, t);
                        const tierColor = res.tier === 'excellent' ? '#16a34a' : res.tier === 'good' ? '#2563eb' : '#d97706';
                        const rA = RASHIS.find(r => r.id === rashiA);
                        const rB = RASHIS.find(r => r.id === rashiB);
                        return (
                            <div style={{ maxWidth: '600px', margin: '1.75rem auto 0', background: 'white', border: `1.5px solid ${tierColor}`, borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                    {rA.symbol} <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>+</span> {rB.symbol}
                                </div>
                                <h3 style={{ color: tierColor, margin: '0 0 0.6rem' }}>{res.label}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{res.note}</p>
                                <div style={{ marginTop: '1.25rem' }}>
                                    <a
                                        href={`https://wa.me/919278148269?text=${encodeURIComponent(t(`नमस्कार! मुझे ${lang === 'hi' ? rA.name : rA.nameEn} व ${lang === 'hi' ? rB.name : rB.nameEn} की पूर्ण कुंडली मिलान करवानी है।`, `Hello! I'd like a full Kundli match between ${rA.nameEn} and ${rB.nameEn}.`))}`}
                                        target="_blank" rel="noreferrer"
                                        className="btn btn-whatsapp"
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        <MessageCircle size={13} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />{t('पूर्ण कुंडली मिलान हेतु WhatsApp करें', 'WhatsApp for a Full Kundli Match')}
                                    </a>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>
        </div>
    );
}
