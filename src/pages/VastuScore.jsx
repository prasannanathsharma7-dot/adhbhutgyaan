import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { Compass, UploadCloud, ScanLine, FileCheck2, MessageCircle, Sparkles } from 'lucide-react';

export default function VastuScore() {
    const { t } = useLanguage();

    useSEO({
        title: t('AI वास्तु स्कोर — जल्द आ रहा है | Adhbhut Gyaan', 'AI Vastu Score — Coming Soon | Adhbhut Gyaan'),
        description: t('अपने घर के 2D फ्लोर प्लान से 16-ज़ोन वास्तु स्कोर एवं उपाय प्राप्त करें — जल्द उपलब्ध।', 'Get a 16-zone Vastu score and remedies from your home\'s 2D floor plan - coming soon.'),
        path: '/vastu-score',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Vastu Score', path: '/vastu-score' }])),
    });

    const steps = [
        { icon: UploadCloud, hi: '2D फ्लोर प्लान अपलोड करें', en: 'Upload Your 2D Floor Plan' },
        { icon: Compass, hi: 'मुख्य द्वार की दिशा चुनें (उत्तर कम्पास)', en: 'Select Main Door Direction (North Compass)' },
        { icon: ScanLine, hi: '16-ज़ोन वास्तु विश्लेषण प्राप्त करें', en: 'Get Your 16-Zone Vastu Analysis' },
        { icon: FileCheck2, hi: 'स्कोर एवं उपाय देखें', en: 'View Score & Remedies' },
    ];

    const whatsappUrl = `https://wa.me/919278148269?text=${encodeURIComponent(
        t('प्रणाम, मुझे AI वास्तु स्कोर फीचर की Waitlist/Early Access चाहिए।', 'Pranam, I would like Waitlist/Early Access for the AI Vastu Score feature.')
    )}`;

    return (
        <div>
            <section className="hero" style={{ minHeight: '45vh', background: 'var(--navy-950)' }}>
                <div className="container text-center" style={{ position: 'relative', zIndex: 2, padding: '3.5rem 0' }}>
                    <span className="section-label" style={{ justifyContent: 'center', color: 'var(--gold-400)' }}>
                        <Sparkles size={14} style={{ marginRight: '0.4rem' }} />{t('जल्द आ रहा है', 'Coming Soon')}
                    </span>
                    <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', margin: '0.5rem 0' }}>
                        {t('AI फ्लोर प्लान वास्तु इंजन', 'AI Floor Plan Vastu Engine')}
                    </h1>
                    <p style={{ color: 'var(--warm-200)', maxWidth: '640px', margin: '0 auto' }}>
                        {t('अपना 2D फ्लोर प्लान अपलोड करें, मुख्य द्वार की दिशा चुनें, और तुरंत 16-ज़ोन वास्तु स्कोर एवं उपाय प्राप्त करें।', "Upload your 2D floor plan, select your main door's direction, and instantly get a 16-zone Vastu score and remedies.")}
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 className="section-title text-center">{t('यह कैसे काम करेगा', 'How It Will Work')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginTop: '2rem', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--cream)', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                    <s.icon size={24} style={{ color: 'var(--gold-700)' }} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{i + 1}. {t(s.hi, s.en)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section" style={{ background: 'var(--cream)' }}>
                <div className="container" style={{ maxWidth: '820px' }}>
                    <h2 className="section-title text-center">{t('मूल्य निर्धारण (प्रस्तावित)', 'Pricing (Proposed)')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{t('मूल ज़ोन सारांश', 'Basic Zone Summary')}</h3>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.75rem' }}>{t('निःशुल्क', 'FREE')}</div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('16 ज़ोन का संक्षिप्त सारांश एवं सामान्य संकेत।', 'A brief 16-zone summary with general indicators.')}</p>
                        </div>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '2px solid var(--gold-500)', boxShadow: 'var(--shadow-gold)' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{t('विस्तृत 100-पॉइंट ऑडिट रिपोर्ट', 'Detailed 100-Point Audit Report')}</h3>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-700)', marginBottom: '0.75rem' }}>₹499 <span style={{ fontSize: '1rem', fontWeight: 600 }}>- ₹999</span></div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('संपूर्ण 100-पॉइंट विश्लेषण, विस्तृत दोष-सूची एवं व्यक्तिगत उपाय।', 'A complete 100-point analysis, detailed defect list, and personalized remedies.')}</p>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                        {t('* यह फीचर अभी विकासाधीन है — मूल्य अंतिम रूप से बदल सकते हैं।', '* This feature is still in development - final pricing may change.')}
                    </p>
                </div>
            </section>

            <section className="section text-center">
                <div className="container">
                    <h2 className="section-title">{t('सबसे पहले जानें', 'Be the First to Know')}</h2>
                    <p style={{ maxWidth: '520px', margin: '0.75rem auto 1.5rem', color: 'var(--text-secondary)' }}>
                        {t('इस फीचर के लॉन्च होते ही सबसे पहले सूचित होने के लिए WhatsApp पर हमसे जुड़ें।', 'Join us on WhatsApp to be notified the moment this feature launches.')}
                    </p>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                        <MessageCircle size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                        {t('Waitlist / Early Access हेतु WhatsApp करें', 'Join Waitlist / Early Access via WhatsApp')}
                    </a>
                </div>
            </section>
        </div>
    );
}
