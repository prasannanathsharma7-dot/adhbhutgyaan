import { useState, useEffect, useRef } from 'react';

// Thin progress bar just below the fixed navbar, showing how far down
// the current page the visitor has scrolled. Most useful on the very
// long homepage (~14,000px), but rendered globally via App.jsx since
// several other pages (long blog posts, the services listing) are also
// long enough to benefit, and a single small always-mounted component is
// simpler to reason about than conditionally rendering it per-route.
export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const tickingRef = useRef(false);

    useEffect(() => {
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, pct)));
            tickingRef.current = false;
        };
        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;
            requestAnimationFrame(update);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update();
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // Hide entirely on pages short enough that there's nothing to scroll
    // through - a bar permanently stuck at 0% or 100% is just noise.
    if (progress <= 0.5) return null;

    return (
        <div className="scroll-progress-track" aria-hidden="true">
            <div className="scroll-progress-fill" style={{ width: `${progress}%` }} />
        </div>
    );
}
