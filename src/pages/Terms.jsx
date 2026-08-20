import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Terms() {
    const { t } = useLanguage();

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('नियम एवं शर्तें', 'Terms of Service')}</span></div>
                    <h1>{t('नियम एवं शर्तें', 'Terms of Service')}</h1>
                    <p className="subtitle">{t('अंतिम अद्यतन: अगस्त 2026', 'Last updated: August 2026')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 780 }}>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>

                        <p style={{ marginBottom: '1.5rem' }}>
                            {t(
                                'यह वेबसाइट (अद्भुत ज्ञान) उपयोग करके, आप निम्नलिखित शर्तों से सहमत होते हैं।',
                                'By using this website (Adhbhut Gyaan), you agree to the following terms.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('सेवा की प्रकृति', 'Nature of the Service')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'यह वेबसाइट पूजा एवं अनुष्ठान सेवाओं की जानकारी प्रदान करती है और WhatsApp के माध्यम से पूछताछ/बुकिंग अनुरोध भेजने की सुविधा देती है। वेबसाइट पर बुकिंग फ़ॉर्म भरना अंतिम बुकिंग की पुष्टि नहीं है — पुष्टि हमारी टीम द्वारा सीधे संपर्क करने के बाद ही होती है।',
                                'This website provides information about pooja and ritual services and lets you send an enquiry or booking request via WhatsApp. Filling out the booking form on this website is not a final confirmed booking — confirmation only happens after our team contacts you directly.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('मूल्य एवं भुगतान', 'Pricing & Payment')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'इस वेबसाइट पर मूल्य प्रदर्शित नहीं किए जाते; सभी मूल्य पूछताछ के बाद WhatsApp या फ़ोन पर बताए जाते हैं और पूजा के प्रकार, पंडितों की संख्या, स्थान (ऑनलाइन/ऑफ़लाइन/मंदिर) के अनुसार भिन्न हो सकते हैं। इस वेबसाइट पर कोई ऑनलाइन भुगतान सुविधा उपलब्ध नहीं है।',
                                'Prices are not displayed on this website; all pricing is shared over WhatsApp or phone after enquiry, and may vary based on the type of pooja, number of Pandits, and mode (online/offline/temple). This website does not offer any online payment facility.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('रद्दीकरण एवं परिवर्तन', 'Cancellations & Changes')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'बुकिंग रद्द करने, तिथि बदलने, या अन्य किसी परिवर्तन के लिए कृपया सीधे WhatsApp या फ़ोन पर हमसे संपर्क करें, क्योंकि सभी बुकिंग व्यक्तिगत रूप से हमारी टीम द्वारा प्रबंधित की जाती हैं।',
                                'For cancellations, date changes, or any other modification, please contact us directly on WhatsApp or phone, as all bookings are managed individually by our team.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('वेबसाइट सामग्री', 'Website Content')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'इस वेबसाइट पर दी गई जानकारी (पूजा विधि, लाभ, ब्लॉग लेख) सामान्य जानकारी हेतु है और इसे धार्मिक या ज्योतिषीय सलाह के रूप में लिया जा सकता है, परंतु यह चिकित्सा, कानूनी या वित्तीय सलाह नहीं है।',
                                'The information on this website (pooja methods, benefits, blog articles) is provided for general and spiritual/astrological informational purposes, but it is not medical, legal, or financial advice.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('संपर्क करें', 'Contact Us')}
                        </h2>
                        <p>
                            {t('इन शर्तों संबंधी किसी भी प्रश्न के लिए हमसे संपर्क करें:', 'For any questions about these terms, contact us at:')}<br />
                            <strong>WhatsApp:</strong> +91 92781 48269<br />
                            <strong>Email:</strong> info@kashipoojaseva.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
