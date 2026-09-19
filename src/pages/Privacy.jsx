import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

export default function Privacy() {
    const { t } = useLanguage();

    useSEO({
        title: t('गोपनीयता नीति | Adhbhut Gyaan', 'Privacy Policy | Adhbhut Gyaan'),
        description: t('हम आपकी जानकारी कैसे एकत्र और उपयोग करते हैं।', 'How we collect and use your information.'),
        path: '/privacy',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Privacy Policy', path: '/privacy' },
        ])),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('गोपनीयता नीति', 'Privacy Policy')}</span></div>
                    <h1>{t('गोपनीयता नीति', 'Privacy Policy')}</h1>
                    <p className="subtitle">{t('अंतिम अद्यतन: सितंबर 2026', 'Last updated: September 2026')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 780 }}>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>

                        <p style={{ marginBottom: '1.5rem' }}>
                            {t(
                                'अद्भुत ज्ञान ("हम", "हमारा") आपकी गोपनीयता का सम्मान करता है। यह पृष्ठ बताता है कि जब आप हमारी वेबसाइट का उपयोग करते हैं या पूजा बुकिंग हेतु फ़ॉर्म भरते हैं, तो हम कौन सी जानकारी एकत्र करते हैं और उसका उपयोग कैसे करते हैं।',
                                'Adhbhut Gyaan ("we", "our", "us") respects your privacy. This page explains what information we collect and how we use it when you use our website or fill out a form to enquire about or book a pooja.'
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
                                'जब आप बुकिंग या संपर्क फ़ॉर्म सबमिट करते हैं, तो आपकी दी गई जानकारी हमारे सुरक्षित डेटाबेस में सहेजी जाती है और हमारी टीम को ईमेल या WhatsApp द्वारा सूचित किया जा सकता है। इसका उपयोग केवल आपकी पूछताछ संभालने, तिथि व उपलब्धता की पुष्टि करने और सेवा संबंधी संचार के लिए किया जाता है। हम आपकी जानकारी बेचते नहीं हैं। WhatsApp/Meta और ईमेल प्रदाताओं द्वारा संसाधित जानकारी उनकी अपनी गोपनीयता नीतियों के अंतर्गत भी आती है।',
                                'When you submit a booking or contact form, the information you provide is stored in our secured database and our team may be notified by email or WhatsApp. We use it only to handle your enquiry, confirm dates and availability, and communicate about the requested service. We do not sell your information. Information processed by WhatsApp/Meta and email providers is also subject to their respective privacy policies.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('कुकीज़ और ट्रैकिंग', 'Cookies & Tracking')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'हमारी वेबसाइट भाषा वरीयता जैसी सेटिंग आपके ब्राउज़र में सहेजती है। बुकिंग के समय, अभियान स्रोत (जैसे UTM टैग), रेफर करने वाली वेबसाइट का डोमेन और लैंडिंग पेज जैसी सीमित तकनीकी जानकारी भी दर्ज की जा सकती है, ताकि हमें समझ आए कि पूछताछ कहाँ से आई।',
                                'Our website saves settings such as your language preference in your browser. When a booking enquiry is submitted, limited attribution data such as campaign tags, the referring website domain, and the landing page may also be recorded so we can understand where the enquiry came from.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('आपके अधिकार', 'Your Rights')}
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            {t(
                                'आप किसी भी समय हमसे संपर्क करके अपनी पूछताछ से जुड़ी व्यक्तिगत जानकारी को देखने, सुधारने या हटाने का अनुरोध कर सकते हैं। कानूनी, सुरक्षा या रिकॉर्ड-रखाव की आवश्यकता होने पर कुछ जानकारी सीमित अवधि तक रखी जा सकती है।',
                                'You may contact us at any time to request access to, correction of, or deletion of personal information connected with your enquiry. Some information may be retained for a limited period where required for legal, security, or record-keeping purposes.'
                            )}
                        </p>

                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                            {t('संपर्क करें', 'Contact Us')}
                        </h2>
                        <p>
                            {t('गोपनीयता संबंधी किसी भी प्रश्न के लिए हमसे संपर्क करें:', 'For any privacy-related questions, contact us at:')}<br />
                            <strong>WhatsApp:</strong> +91 92781 48269<br />
                            <strong>Email:</strong> astrokashi369@gmail.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
