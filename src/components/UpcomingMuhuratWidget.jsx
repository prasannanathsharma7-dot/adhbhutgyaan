import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { findMuhurat, CATEGORY_RULES } from '../utils/muhuratEngine';
import { CalendarHeart, ArrowRight } from 'lucide-react';

// Shows the next 3 genuinely-computed upcoming auspicious dates (Vivah
// Muhurat, by default the most commonly-searched category) within the
// next 60 days - real urgency from real computed astrology, not an
// invented countdown or fake scarcity claim.
const DAY_MS = 86400000;
const WINDOW_DAYS = 60;
const CHUNK_DAYS = 14;

export default function UpcomingMuhuratWidget() {
    const { t, lang } = useLanguage();
    // The dates depend on TODAY, so they cannot be part of the page HTML built at deploy time
    // (it would show a stale list, and React hydration would reject the mismatch). The server
    // HTML and the first browser render therefore both show the same reserved-height
    // placeholder (see .muhurat-reserve in index.css - heights measured per screen width, so
    // the page below does not jump; an earlier version that popped in late measured CLS 0.4).
    // The real dates are computed just after, in small slices on idle time: one 60-day search
    // used to run as a single ~100ms+ task (on a mid-range phone) in the middle of first render.
    // Starts with the next 14 days and stops as soon as 3 dates are found.
    const [matches, setMatches] = useState(null); // null = not computed yet

    useEffect(() => {
        let cancelled = false;
        const start = new Date();
        const found = [];
        let slice = 0;
        const later = (fn) => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 60));
        const step = () => {
            if (cancelled) return;
            try {
                const from = new Date(start.getTime() + slice * CHUNK_DAYS * DAY_MS);
                const to = new Date(Math.min(from.getTime() + (CHUNK_DAYS - 1) * DAY_MS, start.getTime() + WINDOW_DAYS * DAY_MS));
                found.push(...findMuhurat('vivah', from, to, 25.3176, 82.9739, 5.5).matches);
            } catch {
                /* skip this slice */
            }
            slice++;
            if (found.length >= 3 || slice * CHUNK_DAYS > WINDOW_DAYS) setMatches(found.slice(0, 3));
            else later(step);
        };
        later(step);
        return () => { cancelled = true; };
    }, []);

    if (matches === null) {
        return <section data-nosnapshot="true" className="section muhurat-reserve" style={{ paddingTop: '1rem', paddingBottom: '1rem' }} aria-hidden="true" />;
    }

    if (matches.length === 0) return null;

    return (
        <section data-nosnapshot="true" className="section" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
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
