import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sunrise, Sparkles, Star } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { lang, toggleLang, t } = useLanguage();
    const menuButtonRef = useRef(null);
    const toolsRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setToolsOpen(false);
    }, [location]);

    // Close the "Astrology Tools" dropdown when clicking anywhere outside it.
    useEffect(() => {
        if (!toolsOpen) return;
        const handleClick = (e) => {
            if (toolsRef.current && !toolsRef.current.contains(e.target)) {
                setToolsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [toolsOpen]);

    // Close the mobile menu on Escape and send focus back to the toggle button,
    // so keyboard users are never left stranded inside a closed menu.
    useEffect(() => {
        if (!menuOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [menuOpen]);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const navClass = `navbar ${scrolled ? 'scrolled' : ''} ${!isHome ? 'solid' : ''}`;

    const links = [
        { to: '/', label: t('होम', 'Home') },
        { to: '/services', label: t('सेवाएं', 'Services') },
    ];

    const toolLinks = [
        { to: '/panchang', label: t('पंचांग', 'Panchang'), Icon: Sunrise },
        { to: '/free-kundli', label: t('फ्री कुंडली', 'Free Kundli'), Icon: Sparkles },
        { to: '/horoscope', label: t('राशिफल', 'Horoscope'), Icon: Star },
    ];

    const restLinks = [
        { to: '/booking', label: t('पूजा बुक करें', 'Book Pooja') },
        { to: '/about', label: t('हमारे बारे में', 'About Us') },
        { to: '/blog', label: t('ब्लॉग', 'Blog') },
        { to: '/contact', label: t('संपर्क करें', 'Contact') },
    ];

    const isToolActive = toolLinks.some(l => l.to === location.pathname);

    return (
        <nav className={navClass} id="navbar">
            <div className="container">
                <Link to="/" className="logo">
                    <img src="/images/logo.png" alt="" className="logo-img" width="512" height="512" />
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

                    <div className="nav-dropdown" ref={toolsRef}>
                        <button
                            type="button"
                            className={`nav-dropdown-trigger ${isToolActive ? 'active' : ''}`}
                            onClick={() => setToolsOpen(prev => !prev)}
                            aria-expanded={toolsOpen}
                            aria-haspopup="true"
                        >
                            {t('ज्योतिष टूल्स', 'Astrology Tools')} <span className={`nav-dropdown-caret ${toolsOpen ? 'open' : ''}`}>▾</span>
                        </button>
                        <div className={`nav-dropdown-menu ${toolsOpen ? 'open' : ''}`}>
                            {toolLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={location.pathname === link.to ? 'active' : ''}
                                    aria-current={location.pathname === link.to ? 'page' : undefined}
                                >
                                    <span className="nav-dropdown-icon"><link.Icon size={15} /></span> {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {restLinks.map(link => (
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
                    <Link to="/booking" className="nav-cta"><img src="/images/logo.png" alt="" className="inline-logo" width="512" height="512" /> {t('बुक करें', 'Book Now')}</Link>
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
