import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Sticky in-page jump-navigation for the homepage, which has grown to
// ~14,000px tall across this project (Legacy, Panchang, Consultation,
// Services, Testimonials, Videos and more). Surfaces 6 of the most
// useful jump-targets rather than all ~13 sections, to stay scannable.
// Appears only after scrolling past the hero (so it doesn't compete with
// the hero's own CTAs), and highlights whichever section is currently
// in view using the same IntersectionObserver pattern already used
// elsewhere in this codebase (Home.jsx's fade-up reveal, Blog.jsx/
// BlogPost.jsx's table-of-contents highlighting) for consistency.
const SECTIONS = [
    { id: 'legacy', hi: 'विरासत', en: 'Legacy' },
    { id: 'panchang', hi: 'पंचांग', en: 'Panchang' },
    { id: 'astrology-consultation', hi: 'परामर्श', en: 'Consultation' },
    { id: 'services-preview', hi: 'सेवाएं', en: 'Services' },
    { id: 'testimonials', hi: 'समीक्षाएं', en: 'Reviews' },
    { id: 'videos', hi: 'वीडियो', en: 'Videos' },
];

export default function QuickNav() {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(null);
    const tickingRef = useRef(false);

    useEffect(() => {
        const heroEl = document.getElementById('hero');
        const sectionEls = SECTIONS
            .map(s => document.getElementById(s.id))
            .filter(Boolean);
        if (!heroEl || sectionEls.length === 0) return;

        // Show/hide based on whether the hero is still on screen - a
        // plain scroll-position check (rather than another observer) is
        // simplest here since it's just a single boolean threshold.
        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;
            requestAnimationFrame(() => {
                const heroBottom = heroEl.getBoundingClientRect().bottom;
                setVisible(heroBottom < 80);
                tickingRef.current = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Scroll-spy: highlight whichever section's top has most recently
        // crossed a line near the upper part of the viewport, which reads
        // as "active" more naturally than requiring full visibility.
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
        );
        sectionEls.forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', onScroll);
            observer.disconnect();
        };
    }, []);

    if (!visible) return null;

    return (
        <nav className="quick-nav" aria-label={t('पेज नेविगेशन', 'Page navigation')}>
            <div className="quick-nav-inner">
                {SECTIONS.map(s => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className={`quick-nav-link${active === s.id ? ' active' : ''}`}
                    >
                        {t(s.hi, s.en)}
                    </a>
                ))}
            </div>
        </nav>
    );
}
