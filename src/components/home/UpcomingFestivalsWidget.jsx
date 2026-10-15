import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarHeart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import festivalData from '../../data/festivals.json';
import { todayIST, formatDay, windowText } from '../../utils/istFormat';

// The next three festivals with their Varanasi tithi times, straight from src/data/festivals.json (verified dates, tithi
// windows from the Panchang engine at build time). It replaced the "Upcoming Vivah Muhurats" widget, which computed 60
// days of muhurats on the visitor's phone and showed marriage dates that classical rules exclude. No astronomy code runs
// here, so the homepage no longer loads the engine at all.
export default function UpcomingFestivalsWidget() {
    const { t, lang } = useLanguage();
    const [today, setToday] = useState(null);
    useEffect(() => { setToday(todayIST()); }, []); // after mount: server HTML and first client render are identical

    if (today === null) {
        return <section data-nosnapshot="true" className="section festival-reserve" style={{ paddingTop: '1rem', paddingBottom: '1rem' }} aria-hidden="true" />;
    }
    const upcoming = festivalData.festivals.filter(f => f.date >= today).slice(0, 3);
    if (upcoming.length === 0) return null; // season data ran out: nothing is better than something stale

    return (
        <section data-nosnapshot="true" className="section" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div className="container">
                <div style={{ background: 'linear-gradient(135deg, var(--navy-950), var(--navy-900))', borderRadius: 'var(--radius-xl)', padding: '1.5rem 1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ flex: '1 1 240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                            <CalendarHeart size={15} aria-hidden="true" /> {t('आने वाले पर्व', 'Upcoming festivals')}
                        </div>
                        <p style={{ color: 'white', fontSize: '0.95rem', margin: 0 }}>{t('काशी (वाराणसी) की तिथि के अनुसार तारीख़ व समय', 'Dates and tithi times for Kashi (Varanasi)')}</p>
                    </div>
                    <ul style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: '2 1 320px', listStyle: 'none', margin: 0, padding: 0 }}>
                        {upcoming.map(f => (
                            <li key={f.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', flex: '1 1 150px' }}>
                                <div style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: '0.95rem' }}>{formatDay(f.date, lang)}</div>
                                <div style={{ color: 'white', fontSize: '0.85rem', marginTop: '0.15rem' }}>{lang === 'hi' ? f.nameHi : f.nameEn}</div>
                            </li>
                        ))}
                    </ul>
                    <Link to="/festivals" className="btn btn-primary" style={{ flexShrink: 0 }}>
                        {t('सभी पर्व व तिथि-समय', 'All festivals & tithi times')} <ArrowRight size={15} style={{ marginLeft: '0.3rem', verticalAlign: '-2px' }} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
