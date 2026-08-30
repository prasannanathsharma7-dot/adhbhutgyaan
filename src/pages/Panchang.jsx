import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { calculateGlobalPanchang } from '../utils/astroEngine';

// Default Kashi Anchor (Guaranteed Fallback)
const VARANASI_DEFAULT = {
    cityName: 'Varanasi (Kashi)',
    countryName: 'India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezoneOffsetHours: 5.5,
    source: 'default', // 'gps' | 'search' | 'default'
};

export default function Panchang() {
    const { t } = useLanguage();

    // Date State
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

    // Location State
    const [location, setLocation] = useState(VARANASI_DEFAULT);
    const [gpsStatus, setGpsStatus] = useState('prompting'); // prompting | granted | denied | error
    const [gpsNotice, setGpsNotice] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    // Global Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef(null);

    // Choghadiya View Mode: 'day' | 'night'
    const [choghadiyaTab, setChoghadiyaTab] = useState('day');
    const [copied, setCopied] = useState(false);

    // 1. AUTOMATIC BROWSER GEOLOCATION ON PAGE LOAD (RESILIENT ERROR HANDLING)
    useEffect(() => {
        if (typeof window === 'undefined' || !navigator?.geolocation) {
            setGpsStatus('denied');
            setGpsNotice(t('डिफ़ॉल्ट रूप से वाराणसी (काशी) पंचांग प्रदर्शित हो रहा है। अपना नगर ऊपर खोजें।', 'Defaulting to Varanasi (Kashi). Search your city above.'));
            return;
        }

        setIsLocating(true);

        const geoTimeout = setTimeout(() => {
            setIsLocating(false);
            if (gpsStatus === 'prompting') {
                setGpsStatus('denied');
                setGpsNotice(t('डिफ़ॉल्ट रूप से वाराणसी (काशी) पंचांग प्रदर्शित हो रहा है। अपना नगर ऊपर खोजें।', 'Defaulting to Varanasi (Kashi). Search your city above.'));
            }
        }, 6000);

        try {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    clearTimeout(geoTimeout);
                    setIsLocating(false);
                    try {
                        const lat = pos?.coords?.latitude || 25.3176;
                        const lng = pos?.coords?.longitude || 82.9739;
                        const tzOffset = -new Date().getTimezoneOffset() / 60;

                        setGpsStatus('granted');

                        // Non-blocking reverse geocode with fallback
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
                                headers: { 'Accept-Language': 'en' },
                            });
                            if (res.ok) {
                                const data = await res.json();
                                const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || data?.address?.state || 'Your Location';
                                const country = data?.address?.country || 'Detected Location';

                                setLocation({
                                    cityName: city,
                                    countryName: country,
                                    latitude: lat,
                                    longitude: lng,
                                    timezoneOffsetHours: tzOffset,
                                    source: 'gps',
                                });
                                setGpsNotice(t(`📍 आपका स्थान स्वतः खोजा गया: ${city}, ${country}`, `📍 Auto-detected your location: ${city}, ${country}`));
                                return;
                            }
                        } catch {
                            // Reverse geocode failed, keep coordinates
                        }

                        setLocation({
                            cityName: 'Detected Location',
                            countryName: 'Local GPS',
                            latitude: lat,
                            longitude: lng,
                            timezoneOffsetHours: tzOffset,
                            source: 'gps',
                        });
                        setGpsNotice(t('📍 GPS निर्देशांक सफलतापूर्वक प्राप्त हुए।', '📍 GPS coordinates detected successfully.'));
                    } catch (err) {
                        console.warn('Geolocation parse error:', err);
                        setLocation(VARANASI_DEFAULT);
                        setGpsStatus('error');
                    }
                },
                (err) => {
                    clearTimeout(geoTimeout);
                    setIsLocating(false);
                    setGpsStatus('denied');
                    setGpsNotice(t('डिफ़ॉल्ट रूप से वाराणसी (काशी) पंचांग प्रदर्शित हो रहा है। अपना नगर ऊपर खोजें।', 'Defaulting to Varanasi (Kashi). Search your city above.'));
                },
                { timeout: 5000, enableHighAccuracy: false, maximumAge: 60000 }
            );
        } catch (err) {
            clearTimeout(geoTimeout);
            setIsLocating(false);
            setGpsStatus('denied');
        }

        return () => clearTimeout(geoTimeout);
    }, [t]);

    // 2. GLOBAL CITY SEARCH (NOMINATIM DEBOUNCE WITH TRY-CATCH)
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&addressdetails=1`, {
                    headers: { 'Accept-Language': 'en' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSuggestions(data);
                        setIsDropdownOpen(true);
                    } else {
                        setSuggestions([]);
                    }
                }
            } catch (err) {
                console.warn('City search error:', err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close search dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectLocation = (item) => {
        try {
            const lat = parseFloat(item?.lat) || 25.3176;
            const lng = parseFloat(item?.lon) || 82.9739;
            const parts = (item?.display_name || '').split(',');
            const city = parts[0]?.trim() || item?.name || 'Selected City';
            const country = parts[parts.length - 1]?.trim() || '';

            const approxTz = Math.round((lng / 15) * 2) / 2;

            setLocation({
                cityName: city,
                countryName: country,
                latitude: lat,
                longitude: lng,
                timezoneOffsetHours: approxTz,
                source: 'search',
            });

            setSearchQuery(`${city}, ${country}`);
            setIsDropdownOpen(false);
            setGpsNotice(t(`📍 स्थान चुना गया: ${city}, ${country}`, `📍 Location selected: ${city}, ${country}`));
        } catch (err) {
            console.error('Location selection error:', err);
        }
    };

    // 3. COMPUTE REAL-TIME DYNAMIC PANCHANG WITH GUARANTEED FALLBACK
    const panchangData = useMemo(() => {
        try {
            return calculateGlobalPanchang({
                date: selectedDate,
                latitude: location?.latitude ?? 25.3176,
                longitude: location?.longitude ?? 82.9739,
                cityName: location?.cityName ?? 'Varanasi (Kashi)',
                countryName: location?.countryName ?? 'India',
                timezoneOffsetHours: location?.timezoneOffsetHours ?? 5.5,
            });
        } catch (err) {
            console.error('Panchang calculation error:', err);
            return calculateGlobalPanchang({});
        }
    }, [selectedDate, location]);

    const cityName = panchangData?.location?.city || 'Varanasi (Kashi)';
    const countryName = panchangData?.location?.country || 'India';
    const dateFormatted = panchangData?.dateFormatted || selectedDate;

    // Dynamic SEO
    useSEO({
        title: t(
            `आज का पंचांग — ${cityName} (${dateFormatted}) | शुभ मुहूर्त, राहु काल एवं चौघड़िया`,
            `Today's Panchang — ${cityName} (${dateFormatted}) | Shubh Muhurat, Rahu Kaal & Choghadiya`
        ),
        description: t(
            `${cityName} का आज का पंचांग एवं शुभ मुहूर्त: सूर्योदय ${panchangData?.solar?.sunrise || '05:45 AM'}, सूर्यास्त ${panchangData?.solar?.sunset || '06:30 PM'}, तिथि ${panchangData?.tithi?.name || 'Shukla Pratipada'}, नक्षत्र ${panchangData?.nakshatra?.name || 'Ashwini'}, अभिजित मुहूर्त ${panchangData?.muhurats?.abhijit || '11:45 AM - 12:35 PM'}, राहु काल ${panchangData?.inauspicious?.rahuKaal || '04:30 PM - 06:00 PM'} एवं चौघड़िया।`,
            `Today's Panchang & Shubh Muhurat for ${cityName}: Sunrise ${panchangData?.solar?.sunrise || '05:45 AM'}, Sunset ${panchangData?.solar?.sunset || '06:30 PM'}, Tithi ${panchangData?.tithi?.name || 'Shukla Pratipada'}, Nakshatra ${panchangData?.nakshatra?.name || 'Ashwini'}, Abhijit Muhurat ${panchangData?.muhurats?.abhijit || '11:45 AM - 12:35 PM'}, Rahu Kaal ${panchangData?.inauspicious?.rahuKaal || '04:30 PM - 06:00 PM'} & Choghadiya.`
        ),
        path: '/panchang',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Panchang', path: '/panchang' },
        ])),
    });

    // Quick Date Shifters
    const shiftDate = (days) => {
        try {
            const current = new Date(selectedDate);
            if (isNaN(current.getTime())) {
                setSelectedDate(new Date().toISOString().slice(0, 10));
                return;
            }
            current.setDate(current.getDate() + days);
            setSelectedDate(current.toISOString().slice(0, 10));
        } catch {
            setSelectedDate(new Date().toISOString().slice(0, 10));
        }
    };

    const resetToToday = () => {
        setSelectedDate(new Date().toISOString().slice(0, 10));
    };

    // WhatsApp Share Payload Formatter
    const shareText = `🕉️ *ADBHUT GYAAN — DAINIK PANCHANG*
📍 *${cityName}, ${countryName}*
📅 *${dateFormatted}*
────────────────────────────
📜 *TITHI:* ${panchangData?.tithi?.name || 'Shukla Pratipada'} (${panchangData?.tithi?.paksha || 'Shukla Paksha'})
⭐ *NAKSHATRA:* ${panchangData?.nakshatra?.name || 'Ashwini'} (Lord: ${panchangData?.nakshatra?.lord || 'Ketu'})
✨ *YOGA:* ${panchangData?.yoga?.name || 'Siddhi'} | *KARANA:* ${panchangData?.karana?.name || 'Bava'}
☀️ *SURYA RASHI:* ${panchangData?.transits?.suryaRashi || 'Leo (Simha)'}
🌙 *CHANDRA RASHI:* ${panchangData?.transits?.chandraRashi || 'Aries (Mesha)'}

⏰ *LOCAL SOLAR TIMINGS:*
• Sunrise: ${panchangData?.solar?.sunrise || '05:45 AM'} | Sunset: ${panchangData?.solar?.sunset || '06:30 PM'}
• Solar Noon: ${panchangData?.solar?.solarNoon || '12:07 PM'}

🟢 *SHUBH MUHURAT:*
• *Abhijit Muhurat:* ${panchangData?.muhurats?.abhijit || '11:45 AM - 12:35 PM'} ✅
• *Brahma Muhurat:* ${panchangData?.muhurats?.brahma || '04:15 AM - 05:00 AM'} 🧘
• *Amrit Kaal:* ${panchangData?.muhurats?.amritKaal || '08:30 AM - 09:50 AM'} ✨

🔴 *ASHUBH KAAL (VARJIT):*
• *Rahu Kaal:* ${panchangData?.inauspicious?.rahuKaal || '04:30 PM - 06:00 PM'} ⏳
• *Yamaganda:* ${panchangData?.inauspicious?.yamaganda || '09:00 AM - 10:30 AM'}
• *Gulika Kaal:* ${panchangData?.inauspicious?.gulikaKaal || '01:30 PM - 03:00 PM'}

🙏 *DAILY CHANT:*
"${panchangData?.vara?.dailyChant || 'Om Namah Shivaya'}" (108 times)

────────────────────────────
📿 Book Live WhatsApp Video Sankalp Pooja: https://www.adhbhutgyaan.com/panchang
🙏 _Dr. Umang Nath Sharma | Adhbhut Gyaan_`;

    const handleCopy = () => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => {});
        }
    };

    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    // Safe Choghadiya Slots
    const activeChoghadiyaList = (choghadiyaTab === 'day' ? panchangData?.choghadiya?.day : panchangData?.choghadiya?.night) || [];

    return (
        <div style={{ background: 'var(--warm-50)', minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Header Banner */}
            <header className="page-header" style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-850) 100%)', padding: 'clamp(2rem, 5vw, 3.5rem) 0 2rem' }}>
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">{t('होम', 'Home')}</Link>
                        <span>›</span>
                        <span>{t('दैनिक पंचांग', 'Daily Panchang')}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', margin: '0.5rem 0' }}>
                        {t('दैनिक वैदिक पंचांग एवं शुभ मुहूर्त', 'Universal Dynamic Vedic Panchang')}
                    </h1>
                    <p className="subtitle" style={{ maxWidth: '720px', margin: '0.5rem auto 0', color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                        {t(
                            'सटीक अक्षांश-देशांतर एवं स्थानीय सूर्योदय-सूर्यास्त आधारित वैदिक पंचांग — विश्व के किसी भी नगर हेतु त्वरित गणना।',
                            'Precise coordinate-based astronomical Vedic ephemeris — Instant Sunrise, Tithi, Rahu Kaal, Abhijit & Choghadiya worldwide.'
                        )}
                    </p>
                </div>
            </header>

            <div className="container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
                {/* Geolocation & Universal City Search Bar */}
                <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-gold)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div ref={searchRef} style={{ position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                                🔍 {t('विश्व का कोई भी शहर / गांव खोजें (Any City Worldwide)', 'Search Any City, Town or Zipcode Worldwide')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={t('जैसे: London, New York, Tokyo, Dubai, Mumbai, Varanasi...', 'e.g. London, New York, Tokyo, Dubai, Mumbai, Varanasi...')}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                {(isSearching || isLocating) && (
                                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}>
                                        ⏳
                                    </span>
                                )}
                            </div>

                            {/* Dropdown Suggestions */}
                            {isDropdownOpen && suggestions.length > 0 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', marginTop: '0.3rem', boxShadow: 'var(--shadow-lg)', zIndex: 50, maxHeight: '240px', overflowY: 'auto' }}>
                                    {suggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectLocation(item)}
                                            style={{ padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: 'var(--navy-900)', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-50)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                        >
                                            📍 <b>{item?.display_name || item?.name}</b>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date Navigation Strip */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                                📅 {t('पंचांग तिथि चुनें (Select Date)', 'Select Date')}
                            </label>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => shiftDate(-1)} className="btn btn-outline-dark" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>
                                    ◀ {t('कल', 'Prev')}
                                </button>
                                <button type="button" onClick={resetToToday} className="btn btn-gold" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                                    {t('आज', 'Today')}
                                </button>
                                <button type="button" onClick={() => shiftDate(1)} className="btn btn-outline-dark" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>
                                    {t('कल', 'Next')} ▶
                                </button>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    style={{ width: 'auto', flex: 1, minWidth: '130px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Geolocation Status / Notice Bar */}
                    {gpsNotice && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem', color: location?.source === 'gps' ? '#065f46' : 'var(--text-secondary)' }}>
                            <div>
                                {location?.source === 'gps' && <span style={{ background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, marginRight: '0.4rem' }}>✓ GPS Active</span>}
                                {gpsNotice}
                            </div>
                            <div style={{ color: 'var(--gold-800)', fontWeight: 600 }}>
                                🌐 Lat: {panchangData?.location?.latitude ?? '25.3176'}° | Lon: {panchangData?.location?.longitude ?? '82.9739'}° | {panchangData?.location?.timezoneOffset ?? 'UTC+5.5'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Location & Solar Telemetry Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{t('सूर्योदय', 'Local Sunrise')}</span>
                        <strong style={{ fontSize: '1.25rem', color: '#ea580c', display: 'block', marginTop: '0.2rem' }}>☀️ {panchangData?.solar?.sunrise || '05:45 AM'}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Day Length: {panchangData?.solar?.dayLength || '12h 45m'}</span>
                    </div>

                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{t('सूर्यास्त', 'Local Sunset')}</span>
                        <strong style={{ fontSize: '1.25rem', color: '#7c2d12', display: 'block', marginTop: '0.2rem' }}>🌅 {panchangData?.solar?.sunset || '06:30 PM'}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Solar Noon: {panchangData?.solar?.solarNoon || '12:07 PM'}</span>
                    </div>

                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{t('दिन एवं देवता', 'Vara & Deity')}</span>
                        <strong style={{ fontSize: '1.15rem', color: panchangData?.vara?.themeColor || '#0284c7', display: 'block', marginTop: '0.2rem' }}>{panchangData?.vara?.name || 'Somavara'}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{panchangData?.vara?.deity || 'Lord Shiva'}</span>
                    </div>

                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{t('सूर्य / चंद्र राशि', 'Sun & Moon Signs')}</span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)', display: 'block', marginTop: '0.2rem' }}>☀️ {(panchangData?.transits?.suryaRashi || 'Leo (Simha)').split(' ')[0]}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-800)', fontWeight: 600 }}>🌙 {(panchangData?.transits?.chandraRashi || 'Aries (Mesha)').split(' ')[0]}</span>
                    </div>
                </div>

                {/* Main Content Grid: 5 Limbs & Muhurats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Left Column: 5 Limbs of Panchang */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-light)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--navy-900)' }}>
                                📜 {t('पंचांग के पांच अंग', 'Five Vedic Limbs (Panchang)')}
                            </h3>
                            <span style={{ fontSize: '0.75rem', background: 'var(--warm-100)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--navy-800)', fontWeight: 600 }}>
                                {cityName}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><b>📜 {t('तिथि', 'Tithi')}:</b></span>
                                <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>{panchangData?.tithi?.name || 'Shukla Pratipada'} ({panchangData?.tithi?.paksha || 'Shukla Paksha'})</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><b>⭐ {t('नक्षत्र', 'Nakshatra')}:</b></span>
                                <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>{panchangData?.nakshatra?.name || 'Ashwini'} (Pada {panchangData?.nakshatra?.pada || 1}) · {panchangData?.nakshatra?.lord || 'Ketu'}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><b>✨ {t('योग', 'Yoga')}:</b></span>
                                <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>{panchangData?.yoga?.name || 'Siddhi'}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><b>🪷 {t('करण', 'Karana')}:</b></span>
                                <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>{panchangData?.karana?.name || 'Bava'}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><b>🕉️ {t('वार (दिन)', 'Vara / Day')}:</b></span>
                                <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>{panchangData?.vara?.name || 'Somavara'}</span>
                            </div>
                        </div>

                        {/* Daily Vedic Guidance */}
                        <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--navy-950)' }}>
                            <strong>🙏 {t('दैनिक वैदिक मार्गदर्शन', "Today's Vedic Upasana")}:</strong>
                            <p style={{ margin: '0.25rem 0 0' }}>
                                {panchangData?.vedicGuidance || `Today is an auspicious day for prayers and devotion.`}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Auspicious & Inauspicious Muhurats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Shubh Muhurats (Green Card) */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
                                <span>🟢</span> {t('शुभ मुहूर्त (Auspicious Muhurat Windows)', 'Auspicious Muhurat Windows')}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.85rem' }}>
                                <div style={{ background: 'white', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>अभिजित मुहूर्त (Abhijit)</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem' }}>{panchangData?.muhurats?.abhijit || '11:45 AM - 12:35 PM'}</div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>ब्रह्म मुहूर्त (Brahma)</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem' }}>{panchangData?.muhurats?.brahma || '04:15 AM - 05:00 AM'}</div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>अमृत काल (Amrit Kaal)</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem' }}>{panchangData?.muhurats?.amritKaal || '08:30 AM - 09:50 AM'}</div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>गोधूलि मुहूर्त (Godhuli)</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem' }}>{panchangData?.muhurats?.godhuli || '06:18 PM - 06:42 PM'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Inauspicious Kaal (Red Card) */}
                        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
                                <span>🔴</span> {t('अशुभ काल (वर्जित समय / Inauspicious Kaal)', 'Inauspicious Period (Varjit)')}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div style={{ background: 'white', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700 }}>राहु काल</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem', fontSize: '0.78rem' }}>{panchangData?.inauspicious?.rahuKaal || '04:30 PM - 06:00 PM'}</div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700 }}>यमगण्ड</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem', fontSize: '0.78rem' }}>{panchangData?.inauspicious?.yamaganda || '09:00 AM - 10:30 AM'}</div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700 }}>गुलिक काल</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.15rem', fontSize: '0.78rem' }}>{panchangData?.inauspicious?.gulikaKaal || '01:30 PM - 03:00 PM'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day & Night Choghadiya Section */}
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900)' }}>
                                🌟 {t('आज का चौघड़िया (Day & Night Choghadiya)', 'Dynamic Choghadiya Timings')}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {t('शुभ कार्यों हेतु अमृत, शुभ, एवं लाभ चौघड़िया का चयन करें।', 'Choose Amrit, Shubh or Labh Choghadiya slots for auspicious tasks.')}
                            </p>
                        </div>

                        {/* Day / Night Toggle */}
                        <div style={{ display: 'flex', background: 'var(--warm-100)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
                            <button
                                type="button"
                                onClick={() => setChoghadiyaTab('day')}
                                style={{
                                    border: 'none',
                                    background: choghadiyaTab === 'day' ? 'white' : 'transparent',
                                    color: choghadiyaTab === 'day' ? 'var(--navy-900)' : 'var(--text-secondary)',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    padding: '0.4rem 1rem',
                                    borderRadius: 'var(--radius-full)',
                                    boxShadow: choghadiyaTab === 'day' ? 'var(--shadow-sm)' : 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                ☀️ {t('दिन का चौघड़िया', 'Day Choghadiya')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setChoghadiyaTab('night')}
                                style={{
                                    border: 'none',
                                    background: choghadiyaTab === 'night' ? 'white' : 'transparent',
                                    color: choghadiyaTab === 'night' ? 'var(--navy-900)' : 'var(--text-secondary)',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    padding: '0.4rem 1rem',
                                    borderRadius: 'var(--radius-full)',
                                    boxShadow: choghadiyaTab === 'night' ? 'var(--shadow-sm)' : 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                🌙 {t('रात का चौघड़िया', 'Night Choghadiya')}
                            </button>
                        </div>
                    </div>

                    {/* Choghadiya Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        {activeChoghadiyaList.map((slot, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '0.85rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: slot?.isAuspicious ? '1px solid #86efac' : (slot?.type === 'Inauspicious' ? '1px solid #fecaca' : '1px solid var(--border-light)'),
                                    background: slot?.isAuspicious ? '#f0fdf4' : (slot?.type === 'Inauspicious' ? '#fef2f2' : 'var(--warm-50)'),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.2rem',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                                        {slot?.badge || '🔵'} {slot?.name || 'Slot'}
                                    </strong>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: slot?.isAuspicious ? '#15803d' : (slot?.type === 'Inauspicious' ? '#b91c1c' : '#1e40af') }}>
                                        {slot?.quality || 'Neutral'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    ⏰ {slot?.timeRange || ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 1-Click WhatsApp Share Card & Pooja CTA */}
                <div style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-850) 100%)', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <span style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            💬 {t('शेयर करें अथवा संकल्प बुक करें', 'Share Today’s Panchang & Book Sankalp')}
                        </span>
                        <h3 style={{ margin: '0.35rem 0 0.5rem', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: 'white' }}>
                            {t('शुभ मुहूर्त में प्रत्यक्ष लाइव वीडियो संकल्प पूजा करवाएं', 'Book Direct 1-on-1 Live WhatsApp Video Sankalp in Kashi')}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                            {t(
                                'काशी के विद्वान पंडितों द्वारा गंगा तट पर आपके नाम एवं गोत्र से प्रत्यक्ष लाइव 1-on-1 व्हाट्सएप वीडियो कॉल पर संकल्प सम्पन्न करवाएं।',
                                'Connect face-to-face with learned Kashi Pandits for live sankalp rituals performed in your name and gotra.'
                            )}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="btn btn-outline"
                            style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
                        >
                            {copied ? '✓ Copied' : '📋 Copy Digest'}
                        </button>
                        <a
                            href={whatsappShareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-whatsapp"
                            style={{ padding: '0.75rem 1.25rem' }}
                        >
                            💬 {t('WhatsApp पर शेयर करें', 'Share on WhatsApp')}
                        </a>
                        <Link to="/booking" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
                            📿 {t('पूजा बुक करें', 'Book Pooja Now')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
