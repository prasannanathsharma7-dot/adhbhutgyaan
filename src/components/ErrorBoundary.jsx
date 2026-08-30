import { Component } from 'react';

// A deployment happening while someone has the site open in a tab is a very
// common cause of a hard crash: React tries to lazy-load a page's JS chunk,
// but the old chunk file no longer exists at the new deployment's hash, so
// the dynamic import fails. That's not a real bug in the code - it just
// needs a fresh page load to pick up the new build. Detect that specific
// case and auto-reload once, instead of showing visitors a scary "something
// went wrong" page for what a simple refresh would have fixed.
const RELOAD_GUARD_KEY = 'kps_chunk_reload_at';
const RELOAD_GUARD_WINDOW_MS = 15000; // don't attempt a second auto-reload within 15s (avoids a loop if the deploy is genuinely broken), but do allow one again after that (e.g. for a later, separate deploy in a long-lived tab)

function isChunkLoadError(error) {
    const msg = (error && error.message || '').toLowerCase();
    return (
        msg.includes('failed to fetch dynamically imported module') ||
        msg.includes('error loading dynamically imported module') ||
        msg.includes('importing a module script failed') ||
        (msg.includes('loading chunk') && msg.includes('failed'))
    );
}

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Site error caught by boundary:', error, info);

        if (isChunkLoadError(error)) {
            let recentlyTried = false;
            try {
                const lastAttempt = parseInt(sessionStorage.getItem(RELOAD_GUARD_KEY), 10);
                recentlyTried = Number.isFinite(lastAttempt) && (Date.now() - lastAttempt) < RELOAD_GUARD_WINDOW_MS;
            } catch {
                // sessionStorage can throw in some private-browsing modes -
                // treat as "not tried recently" and fall through to reload.
            }
            if (!recentlyTried) {
                try { sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now())); } catch { /* ignore */ }
                window.location.reload();
                return;
            }
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '80vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    padding: '2rem', fontFamily: "'Poppins', sans-serif",
                }}>
                    <div style={{ fontSize: '2.5rem', color: '#D4A843', marginBottom: '1rem' }}>ॐ</div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0D1030' }}>
                        कुछ गड़बड़ हो गई — Something went wrong
                    </h1>
                    <p style={{ color: '#4A4F72', marginBottom: '1.5rem', maxWidth: 420 }}>
                        कृपया पृष्ठ को पुनः लोड करें, या हमसे सीधे WhatsApp पर संपर्क करें।<br />
                        Please reload the page, or contact us directly on WhatsApp.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                background: 'linear-gradient(135deg, #FFD54F, #C49A2C)', color: '#080A20',
                                border: 'none', padding: '0.85rem 1.75rem', borderRadius: '999px',
                                fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem',
                            }}
                        >
                            होम पर जाएं
                        </button>
                        <a
                            href="https://wa.me/919818227189"
                            target="_blank" rel="noreferrer"
                            style={{
                                background: '#25D366', color: 'white', textDecoration: 'none',
                                padding: '0.85rem 1.75rem', borderRadius: '999px',
                                fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center',
                            }}
                        >
                            💬 WhatsApp करें
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
