import { Coffee, Sparkle, MessageCircleQuestion, Gem } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/** "An Exclusive Celestial Rendezvous" - the in-person high-tea session with Dr. Umang Nath Sharma.
 *  An event-style offering (not a bookable pooja), so it lives with the Special Services, not on the homepage. */
export default function HighTeaExperience() {
    const { t } = useLanguage();
    return (
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--navy-950), var(--navy-900))' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                    <div>
                        <img src="/images/heritage/umang-with-ayodhya-portrait.jpg" alt={t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')} width="500" height="600" loading="lazy" style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }} />
                    </div>
                    <div>
                        <span className="section-label" style={{ color: 'var(--gold-400)' }}>
                            <Coffee size={14} style={{ marginRight: '0.4rem' }} />{t('एक विशेष आमंत्रण', 'An Exclusive Invitation')}
                        </span>
                        <h2 style={{ color: 'white', marginTop: '0.5rem' }}>{t('एक असाधारण खगोलीय मिलन', 'An Exclusive Celestial Rendezvous')}</h2>
                        <p style={{ color: 'var(--gold-300)', fontStyle: 'italic', marginTop: '0.3rem' }}>{t('वैदिक ज्योतिष, सनातन ज्ञान एवं काशी में हाई टी', 'Vedic Astrology, Time-Honored Wisdom & High Tea in Varanasi')}</p>
                        <p style={{ color: 'var(--warm-200)', marginTop: '1rem' }}>
                            {t(
                                'काशी, वह शाश्वत नगरी है जहाँ ब्रह्मांडीय ऊर्जाएं सांसारिक अस्तित्व से मिलती हैं। हम आपको डॉ. उमंग नाथ शर्मा — अद्भुत ज्ञान के मुख्य ज्योतिषी — के साथ एक विशेष हाई-टी अनुभव हेतु सादर आमंत्रित करते हैं। ज्योतिष शास्त्र पर अपनी गहन पकड़ के लिए विश्व-विख्यात, डॉ. शर्मा साधकों को ब्रह्मांडीय संरचना की अंतरंग यात्रा पर ले जाते हैं।',
                                "Varanasi, the eternal city of Kashi, is a spiritual landscape where cosmic energies intersect with earthly existence. We cordially invite you to an exclusive high-tea experience with Dr. Umang Nath Sharma — Chief Astrologer at Adhbhut Gyaan. Globally acclaimed for his profound command over Jyotish Shastra, Dr. Sharma leads seekers through an intimate exploration of cosmic architecture."
                            )}
                        </p>
                        <div style={{ display: 'grid', gap: '0.7rem', marginTop: '1.5rem' }}>
                            {[
                                { Icon: Sparkle, hi: 'रहस्यमयी काशी — नगरी का आध्यात्मिक इतिहास एक ज्योतिषी की दृष्टि से', en: 'Mystic Kashi - the city\'s spiritual history through an astrologer\'s eyes' },
                                { Icon: Gem, hi: 'व्यक्तिगत जन्म-कुंडली की झलक एवं वर्तमान ग्रह-दशा पर मार्गदर्शन', en: 'Personalized birth-chart micro-insights and guidance on current planetary Dashas' },
                                { Icon: MessageCircleQuestion, hi: 'अंतरंग प्रश्नोत्तर — सीधे विश्व-विख्यात ज्योतिषी से प्रश्न पूछने का दुर्लभ अवसर', en: 'Intimate Q&A circle - a rare chance to ask a globally recognized authority directly' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                    <item.Icon size={17} style={{ color: 'var(--gold-400)', flexShrink: 0, marginTop: '0.15rem' }} />
                                    <span style={{ color: 'var(--warm-200)', fontSize: '0.92rem' }}>{t(item.hi, item.en)}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ color: 'var(--warm-300)', fontSize: '0.82rem', marginTop: '1.25rem', fontStyle: 'italic' }}>
                            💡 {t('सत्र से पूर्व अपनी सटीक जन्म-तिथि, समय एवं जन्म-स्थान तैयार रखें — तथा काशी के पारम्परिक कुल्हड़ चाय का भी आनंद लें।', 'Please have your exact date, time, and city of birth ready before the session - and yes, leave some appetite for the traditional kulhad chai.')}
                        </p>
                        <a
                            href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं "हाई टी विद द एस्ट्रोलॉजर" सत्र के बारे में जानना चाहता हूं।', 'Hello! I would like to know more about the "High Tea with the Astrologer" session.'))}`}
                            target="_blank" rel="noreferrer" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}
                        >
                            {t('इस अनुभव हेतु पूछें', 'Enquire About This Experience')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
