import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Privacy() {
    const { t } = useLanguage();

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('गोपनीयता नीति', 'Privacy Policy')}</span></div>
                    <h1>{t('गोपनीयता नीति', 'Privacy Policy')}</h1>
                    <p className="subtitle">{t('अंतिम अद्यतन: अगस्त 2026', 'Last updated: August 2026')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 780 }}>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>

                        <p style={{ marginBottom: '1.5rem' }}>
                            {t(
                                'एस्ट्रो काशी ("हम", "हमारा") आपकी गोपनीयता का सम्मान करता है। यह पृष्ठ बताता है कि जब आप हमारी वेबसाइट का उपयोग करते हैं या पूजा बुकिंग हेतु फ़ॉर्म भरते हैं, तो हम कौन सी जानकारी एकत्र करते हैं और उसका उपयोग कैसे करते हैं।',
                                'Astro Kashi ("we", "our", "us") respects your privacy. This page explains what information we collect and how we use it when you use our website or fill out a form to enquire about or book a pooja.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('हम क्या जानकारी एकत्र करते हैं', 'What Information We Collect')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'जब आप बुकिंग या संपर्क फ़ॉर्म भरते हैं, तो हम केवल वही जानकारी लेते हैं जो आप स्वयं देते हैं — जैसे आपका नाम, मोबाइल नंबर, ईमेल (यदि दिया गया हो), पता/शहर, पूजा की पसंदीदा तिथि, और आपका संदेश। हम कोई भुगतान जानकारी (कार्ड नंबर, बैंक विवरण) एकत्र नहीं करते, क्योंकि हमारी वेबसाइट पर कोई ऑनलाइन भुगतान सुविधा नहीं है।',
                                "When you fill out a booking or contact form, we only collect what you choose to give us — your name, phone number, email (if provided), address/city, preferred pooja date, and your message. We do not collect any payment information (card numbers, bank details), because our website does not process online payments."
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('हम इसका उपयोग कैसे करते हैं', 'How We Use It')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'जब आप बुकिंग फ़ॉर्म सबमिट करते हैं, तो आपकी दी गई जानकारी एक WhatsApp संदेश के रूप में सीधे हमारे व्यावसायिक नंबर पर भेजी जाती है, ताकि हम आपसे पूजा की पुष्टि, मूल्य और उपलब्धता के बारे में संपर्क कर सकें। हम यह जानकारी किसी तीसरे पक्ष को नहीं बेचते या साझा नहीं करते। हम इस जानकारी को किसी सर्वर डेटाबेस में संग्रहीत नहीं करते — यह केवल WhatsApp के माध्यम से भेजी जाती है, जो स्वयं WhatsApp/Meta की अपनी गोपनीयता नीति के अंतर्गत आता है।',
                                "When you submit a booking form, the details you provide are sent as a WhatsApp message directly to our business number, so we can contact you about confirming your pooja, pricing, and availability. We do not sell or share this information with any third party. We do not store this information in any server database ourselves — it is only transmitted via WhatsApp, which is separately governed by WhatsApp/Meta's own privacy policy."
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('कुकीज़ और ट्रैकिंग', 'Cookies & Tracking')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'हमारी वेबसाइट आपकी भाषा वरीयता (हिंदी/English) को याद रखने के लिए आपके ब्राउज़र में स्थानीय रूप से एक सेटिंग सहेजती है। यह जानकारी हमारे किसी सर्वर पर नहीं भेजी जाती।',
                                'Our website saves your language preference (Hindi/English) locally in your browser so it remembers your choice. This information is not sent to any of our servers.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('आपके अधिकार', 'Your Rights')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'चूंकि आपकी जानकारी WhatsApp पर भेजी जाती है, आप किसी भी समय हमसे उस बातचीत को हटाने का अनुरोध कर सकते हैं। यदि आपने हमें ईमेल किया है, तो आप उसी ईमेल पर हमसे संपर्क करके अपनी जानकारी हटाने का अनुरोध कर सकते हैं।',
                                'Since your information is sent to us via WhatsApp, you can ask us at any time to delete that conversation. If you have emailed us, you can contact us at the same email address to request deletion of your information.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('संपर्क करें', 'Contact Us')}
                        </h2>
                        <p>
                            {t('गोपनीयता संबंधी किसी भी प्रश्न के लिए हमसे संपर्क करें:', 'For any privacy-related questions, contact us at:')}<br />
                            <strong>WhatsApp:</strong> +91 92781 48269<br />
                            <strong>Email:</strong> info@kashipoojaseva.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
