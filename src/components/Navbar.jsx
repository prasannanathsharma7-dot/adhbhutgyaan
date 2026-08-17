import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { lang, toggleLang, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        document.body.style.overflow = '';
    }, [location]);

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
                    <img src="/images/logo.png" alt="" className="logo-img" />
                    <div className="logo-text">
                        <span className="logo-main">एस्ट्रो काशी</span>
                        <span className="logo-sub">Astro Kashi</span>
                    </div>
                </Link>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={location.pathname === link.to ? 'active' : ''}
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
                    <Link to="/booking" className="nav-cta"><img src="/images/logo.png" alt="" className="inline-logo" /> {t('बुक करें', 'Book Now')}</Link>
                </div>

                <button
                    className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    );
}
