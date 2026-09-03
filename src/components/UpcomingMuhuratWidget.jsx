import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { findMuhurat, CATEGORY_RULES } from '../utils/muhuratEngine';
import { CalendarHeart, ArrowRight } from 'lucide-react';

// Shows the next 3 genuinely-computed upcoming auspicious dates (Vivah
// Muhurat, by default the most commonly-searched category) within the
// next 60 days - real urgency from real computed astrology, not an
// invented countdown or fake scarcity claim.
export default function UpcomingMuhuratWidget() {
    const { t, lang } = useLanguage();
    const [matches, setMatches] = useState(null);

    useEffect(() => {
        try {
            const start = new Date();
            const end = new Date(start.getTime() + 60 * 86400000);
            const result = findMuhurat('vivah', start, end, 25.3176, 82.9739, 5.5);
            setMatches(result.matches.slice(0, 3));
        } catch {
            setMatches([]);
        }
    }, []);

    if (matches === null || matches.length === 0) return null;

    return (
        <section className="section" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div className="container">
                <div style={{ background: 'linear-gradient(135deg, var(--navy-950), var(--navy-900))', borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.5rem' }}>
                            <CalendarHeart size={15} /> {t('आगामी शुभ मुहूर्त', 'Upcoming Auspicious Dates')}
                        </div>
                        <p style={{ color: 'white', fontSize: '0.95rem', margin: 0 }}>
                            {t('अगले 60 दिनों में विवाह हेतु शुभ मुहूर्त — पंचांग-आधारित सटीक गणना।', "Upcoming Vivah Muhurats in the next 60 days - real Panchang-based calculation.")}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: '2 1 320px' }}>
                        {matches.map((m, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', textAlign: 'center', minWidth: '110px' }}>
                                <div style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: '0.95rem' }}>
                                    {m.date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                                </div>
                                <div style={{ color: 'var(--warm-200)', fontSize: '0.7rem', marginTop: '0.15rem' }}>{m.nakshatra}</div>
                            </div>
                        ))}
                    </div>
                    <Link to="/muhurat" className="btn btn-primary" style={{ flexShrink: 0 }}>
                        {t('सभी मुहूर्त देखें', 'View All Muhurats')} <ArrowRight size={15} style={{ marginLeft: '0.3rem', verticalAlign: '-2px' }} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
