import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

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
        { to: '/', label: 'Home' },
        { to: '/services', label: 'सेवाएं' },
        { to: '/booking', label: 'Book Pooja' },
        { to: '/about', label: 'हमारे बारे में' },
        { to: '/blog', label: 'ब्लॉग' },
        { to: '/contact', label: 'Contact' },
    ];

    return (
        <nav className={navClass} id="navbar">
            <div className="container">
                <Link to="/" className="logo">
                    <img src="/images/logo.png" alt="" className="logo-img" />
                    <div className="logo-text">
                        <span className="logo-main">काशी पूजा सेवा</span>
                        <span className="logo-sub">Kashi Pooja Seva</span>
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
                    <Link to="/booking" className="nav-cta"><img src="/images/logo.png" alt="" className="inline-logo" /> Book Now</Link>
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
