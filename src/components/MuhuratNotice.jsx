import { useLanguage } from '../context/LanguageContext';

/**
 * Honest framing for everything the muhurat engine produces. The engine SCREENS days (tithi, nakshatra, weekday, plus
 * Chaturmas and Kharmas for marriage / griha pravesh); it is not a full muhurat and it does not see a person's chart.
 * Shown on the Muhurat page, on every paid report, and (compact) on the homepage widget.
 */
export default function MuhuratNotice({ category, skipped = [], coverage = null, compact = false }) {
    const { t, lang } = useLanguage();
    const fmt = (iso) => new Date(iso).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const box = { background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: compact ? '0.6rem 0.8rem' : '1rem 1.25rem', fontSize: compact ? '0.8rem' : '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' };
    return (
        <div style={box} role="note">
            {skipped.length > 0 && (
                <p style={{ margin: '0 0 0.6rem' }}>
                    <strong>{t('इन अवधियों को छोड़ा गया (शास्त्र-नियम से इनमें मुहूर्त नहीं माने जाते):', 'These periods were skipped (classical rules allow no muhurat in them):')}</strong>
                    {' '}{skipped.map((s, i) => <span key={i}>{i > 0 ? ' · ' : ''}{lang === 'hi' ? s.labelHi : s.labelEn}: {fmt(s.from)} – {fmt(s.to)}</span>)}
                </p>
            )}
            {coverage && coverage.complete === false && (
                <p style={{ margin: '0 0 0.6rem', color: '#8a3b00' }}>
                    <strong>{t('ध्यान दें:', 'Please note:')}</strong> {t(`चातुर्मास/खरमास का हमारा सत्यापित डेटा ${coverage.verifiedThrough} तक है; उसके बाद की तिथियाँ पंडित जी से अवश्य जाँच लें।`, `Our verified Chaturmas data runs through ${coverage.verifiedThrough}; please have Pandit ji check any date after that.`)}
                </p>
            )}
            <p style={{ margin: 0 }}>
                {t(
                    'ये तिथि, नक्षत्र व वार के आधार पर छाँटी गई अनुकूल तिथियाँ हैं — अंतिम मुहूर्त नहीं। गुरु/शुक्र अस्त, पंचक, भद्रा तथा आपकी कुंडली (तारा/चंद्र बल) यहाँ नहीं देखे गए। अंतिम मुहूर्त पंडित जी आपकी कुंडली देखकर तय करते हैं।',
                    'These are favourable days screened by tithi, nakshatra and weekday - not a final muhurat. Guru / Shukra asta, Panchak, Bhadra and your own chart (tara / chandra bala) are not considered here. The final muhurat is fixed by Pandit ji after seeing your kundli.'
                )}
            </p>
        </div>
    );
}
