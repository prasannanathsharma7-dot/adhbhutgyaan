import { Component } from 'react';

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
                            href="https://wa.me/919278148269"
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
