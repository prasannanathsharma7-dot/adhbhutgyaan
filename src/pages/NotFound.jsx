import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';

export default function NotFound() {
    const { t } = useLanguage();
    const { pathname } = useLocation();

    useSEO({
        title: t('पृष्ठ नहीं मिला | Adhbhut Gyaan', 'Page Not Found | Adhbhut Gyaan'),
        description: t('यह पृष्ठ उपलब्ध नहीं है।', 'This page is not available.'),
        path: pathname,
        noindex: true,
    });

    return (
        <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <div className="container text-center">
                <div className="hero-om" style={{ color: 'var(--gold-500)', marginBottom: '1rem' }}>ॐ</div>
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.75rem' }}>404</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    {t('क्षमा करें, यह पृष्ठ नहीं मिला।', "Sorry, we couldn't find that page.")}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <Link to="/" className="btn btn-primary">{t('होम पर जाएं', 'Go to Home')}</Link>
                    <Link to="/services" className="btn btn-outline">{t('सेवाएं देखें', 'View Services')}</Link>
                    <Link to="/contact" className="btn btn-outline">{t('संपर्क करें', 'Contact Us')}</Link>
                </div>
            </div>
        </div>
    );
}
