import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { lang, toggleLang, t } = useLanguage();
    const menuButtonRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        document.body.style.overflow = '';
    }, [location]);

    // Close the mobile menu on Escape and send focus back to the toggle button,
    // so keyboard users are never left stranded inside a closed menu.
    useEffect(() => {
        if (!menuOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                document.body.style.overflow = '';
                menuButtonRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [menuOpen]);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
        document.body.style.overflow = !menuOpen ? 'hidden' : '';
    };

    const navClass = `navbar ${scrolled ? 'scrolled' : ''} ${!isHome ? 'solid' : ''}`;

    const links = [
        { to: '/', label: t('होम', 'Home') },
        { to: '/services', label: t('सेवाएं', 'Services') },
        { to: '/booking', label: t('पूजा बुक करें', 'Book Pooja') },
        { to: '/about', label: t('हमारे बारे में', 'About Us') },
        { to: '/blog', label: t('ब्लॉग', 'Blog') },
        { to: '/contact', label: t('संपर्क करें', 'Contact') },
    ];

    return (
        <nav className={navClass} id="navbar">
            <div className="container">
                <Link to="/" className="logo">
                    <img src="/images/logo.webp" alt="" className="logo-img" width="512" height="512" />
                    <div className="logo-text">
                        <span className="logo-main">अद्भुत ज्ञान</span>
                        <span className="logo-sub">Adhbhut Gyaan</span>
                    </div>
                </Link>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="primary-navigation">
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={location.pathname === link.to ? 'active' : ''}
                            aria-current={location.pathname === link.to ? 'page' : undefined}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="lang-toggle"
                        aria-label="Switch language"
                        title={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                    >
                        <span className={lang === 'hi' ? 'active' : ''}>हिं</span>
                        <span className="lang-sep">/</span>
                        <span className={lang === 'en' ? 'active' : ''}>EN</span>
                    </button>
                    <Link to="/booking" className="nav-cta"><img src="/images/logo.webp" alt="" className="inline-logo" width="512" height="512" /> {t('बुक करें', 'Book Now')}</Link>
                </div>

                <button
                    ref={menuButtonRef}
                    className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label={menuOpen ? t('मेन्यू बंद करें', 'Close menu') : t('मेन्यू खोलें', 'Open menu')}
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    );
}
