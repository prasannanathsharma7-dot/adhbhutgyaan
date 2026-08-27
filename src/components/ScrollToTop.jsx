import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // React Router's client-side navigation does NOT natively scroll to
        // a #hash fragment the way a full browser page load does - so
        // without this, every #anchor link on the site (quick-nav pills,
        // triptych links, 'As Featured In' strip) would silently just land
        // at the top of the target page instead of the intended section.
        if (hash) {
            // Lazy-loaded page chunks (React.lazy) can take a moment to
            // download and mount, especially on a first visit to that route
            // over a slow connection - so retry a few times with increasing
            // delay before giving up, rather than a single fixed-delay check.
            const id = hash.slice(1);
            const delays = [50, 150, 350, 700];
            const timers = [];
            let found = false;

            delays.forEach(delay => {
                timers.push(setTimeout(() => {
                    if (found) return;
                    const el = document.getElementById(id);
                    if (el) {
                        found = true;
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (delay === delays[delays.length - 1]) {
                        window.scrollTo(0, 0);
                    }
                }, delay));
            });

            return () => timers.forEach(clearTimeout);
        }

        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}
