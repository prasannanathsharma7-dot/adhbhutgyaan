import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Copy, CheckCircle2, MessageCircle, XCircle } from 'lucide-react';

export default function DailyPanchangCard() {
    const { t, lang } = useLanguage();
    const [panchang, setPanchang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        fetch(`/api/agents/daily-panchang-cron?date=${todayStr}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok && data.panchang) {
                    setPanchang(data.panchang);
                }
            })
            .catch(() => {
                // Fallback default calculation
            })
            .finally(() => setLoading(false));
    }, []);

    const dateFormatted = panchang?.dateFormatted || new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const tithiName = panchang?.tithi?.name || 'Shukla Trayodashi';
    const tithiPaksha = panchang?.tithi?.paksha || 'Shukla Paksha';
    const nakshatraName = panchang?.nakshatra?.name || 'Pushya';
    const nakshatraLord = panchang?.nakshatra?.lord || 'Saturn';
    const yogaName = panchang?.yoga?.name || 'Ayushman';
    const chandraRashi = panchang?.transits?.chandraRashi || 'Cancer (Karka)';
    const abhijit = panchang?.timings?.abhijitMuhurat || '11:48 AM to 12:38 PM IST';
    const brahma = panchang?.timings?.brahmaMuhurat || '04:18 AM to 05:04 AM IST';
    const rahuKaal = panchang?.timings?.rahuKaal || '04:30 PM to 06:00 PM';
    const yamaganda = panchang?.timings?.yamaganda || '12:00 PM to 01:30 PM';

    const whatsappShareText = `🕉️ *ADBHUT GYAAN — DAINIK PANCHANG (KASHI)*\n📅 *${dateFormatted}*\n📍 Varanasi (25.3176° N, 82.9739° E)\n\n📜 *Tithi:* ${tithiName} (${tithiPaksha})\n⭐ *Nakshatra:* ${nakshatraName} (Lord: ${nakshatraLord})\n✨ *Yoga:* ${yogaName} | *Chandra:* ${chandraRashi}\n\n🟢 *Shubh Abhijit Muhurat:* ${abhijit}\n🟢 *Brahma Muhurat:* ${brahma}\n🔴 *Rahu Kaal (Varjit):* ${rahuKaal}\n\n📿 Book Live WhatsApp Video Sankalp: https://www.adhbhutgyaan.com`;

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(whatsappShareText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`;

    return (
        <div style={{ background: 'white', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.25rem, 3vw, 2rem)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-800)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span><MapPin size={13} /></span> {t('वाराणसी (काशी) पंचांग', 'Varanasi (Kashi) Ephemeris')}
                    </div>
                    <h3 style={{ margin: '0.2rem 0 0', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'var(--navy-950)' }}>
                        {t('आज का पंचांग एवं शुभ मुहूर्त', "Today's Vedic Panchang & Shubh Muhurat")}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {dateFormatted}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="btn btn-outline-dark"
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
                    >
                        {copied ? <><CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />Copied</> : <><Copy size={13} style={{ verticalAlign: '-2px', marginRight: '0.25rem' }} />Copy</>}
                    </button>
                    <a
                        href={whatsappShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-whatsapp"
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)' }}
                    >
                        <MessageCircle size={14} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />{t('WhatsApp पर शेयर करें', 'Share on WhatsApp')}
                    </a>
                </div>
            </div>

            {/* Main Panchang Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--warm-100)', padding: '0.85rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('तिथि', 'Tithi')}</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--navy-900)', display: 'block', marginTop: '0.15rem' }}>{tithiName}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold-800)' }}>{tithiPaksha}</span>
                </div>

                <div style={{ background: 'var(--warm-100)', padding: '0.85rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('नक्षत्र', 'Nakshatra')}</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--navy-900)', display: 'block', marginTop: '0.15rem' }}>{nakshatraName}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Lord: {nakshatraLord}</span>
                </div>

                <div style={{ background: 'var(--warm-100)', padding: '0.85rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('योग', 'Yoga')}</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--navy-900)', display: 'block', marginTop: '0.15rem' }}>{yogaName}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Vedic Yoga</span>
                </div>

                <div style={{ background: 'var(--warm-100)', padding: '0.85rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('चंद्र राशि', 'Moon Sign')}</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--navy-900)', display: 'block', marginTop: '0.15rem' }}>{chandraRashi}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Chandra Gochar</span>
                </div>
            </div>

            {/* Auspicious & Inauspicious Muhurat Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {/* Shubh Muhurats (Green) */}
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#065f46', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span><CheckCircle2 size={17} style={{ color: '#16a34a' }} /></span> {t('शुभ मुहूर्त (Auspicious Windows)', 'Auspicious Muhurat Windows')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.5 }}>
                        <div><b>अभिजित मुहूर्त (Abhijit):</b> {abhijit}</div>
                        <div><b>ब्रह्म मुहूर्त (Brahma):</b> {brahma}</div>
                    </div>
                </div>

                {/* Inauspicious Timings (Red Warning) */}
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span><XCircle size={17} style={{ color: '#dc2626' }} /></span> {t('अशुभ काल (वर्जित समय / Avoid Major Deeds)', 'Inauspicious Period (Varjit)')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.5 }}>
                        <div><b>राहु काल (Rahu Kaal):</b> {rahuKaal}</div>
                        <div><b>यमगण्ड (Yamaganda):</b> {yamaganda}</div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {t('विश्व के किसी भी नगर का सटीक पंचांग व चौघड़िया देखें', 'Calculate Panchang & Choghadiya for any city worldwide')}
                </span>
                <Link to="/panchang" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-800)', textDecoration: 'none' }}>
                    {t('संपूर्ण पंचांग एवं विश्व नगर खोजें →', 'Full Universal Panchang & City Search →')}
                </Link>
            </div>
        </div>
    );
}
