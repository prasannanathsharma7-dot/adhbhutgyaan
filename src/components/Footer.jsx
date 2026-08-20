import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="footer" id="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/images/logo.png" alt="" className="logo-img" />
                            <div className="logo-text">
                                <span className="logo-main">अद्भुत ज्ञान</span>
                                <span className="logo-sub">Adhbhut Gyaan</span>
                            </div>
                        </div>
                        <p className="footer-desc">
                            {t(
                                'बनारस (काशी) के अनुभवी एवं विद्वान पंडितों द्वारा शास्त्रोक्त विधि से सभी प्रकार की पूजा सेवाएं। ऑनलाइन बुकिंग उपलब्ध।',
                                'Authentic pooja services performed by experienced, learned Pandits of Banaras (Kashi). Online booking available.'
                            )}
                        </p>
                        <div className="footer-social">
                            <a href="https://youtube.com/@adhbhutgyaan4911?si=5OE9xsdrvnGUj_dq" target="_blank" rel="noreferrer" className="social-link youtube" aria-label="YouTube">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                            </a>
                            <a href="https://wa.me/919278148269" target="_blank" rel="noreferrer" className="social-link whatsapp" aria-label="WhatsApp">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">{t('त्वरित लिंक', 'Quick Links')}</h4>
                        <div className="footer-links">
                            <Link to="/">🏠 {t('होम', 'Home')}</Link>
                            <Link to="/services"><img src="/images/logo.png" alt="" className="inline-logo" /> {t('सेवाएं', 'Services')}</Link>
                            <Link to="/booking">📅 {t('पूजा बुक करें', 'Book Pooja')}</Link>
                            <Link to="/about">👤 {t('हमारे बारे में', 'About')}</Link>
                            <Link to="/blog">📝 {t('ब्लॉग', 'Blog')}</Link>
                            <Link to="/contact">📞 {t('संपर्क करें', 'Contact')}</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">{t('पूजा सेवाएं', 'Pooja Services')}</h4>
                        <div className="footer-links">
                            <Link to="/services#rudrabhishek">{t('रुद्राभिषेक', 'Rudrabhishek')}</Link>
                            <Link to="/services#shree-suktam">{t('श्री सूक्तम्', 'Shree Suktam')}</Link>
                            <Link to="/services#mahavidya-paath">{t('दस महाविद्या पाठ', 'Dus Mahavidya Paath')}</Link>
                            <Link to="/services#kalsarp-dosh">{t('कालसर्प दोष', 'Kalsarp Dosh')}</Link>
                            <Link to="/services#tripindi-shradh">{t('त्रिपिंडी श्राद्ध', 'Tripindi Shradh')}</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">{t('संपर्क करें', 'Contact Us')}</h4>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">📍</span>
                            <span>J11, Pt Umang Nath Sharma, 19, Nati Imli Rd<br/>Ishwargangi, Bunker Colony, Varanasi, UP 221002</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">📞</span>
                            <span>+91 92781 48269</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">💬</span>
                            <span>WhatsApp: +91 92781 48269</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">✉️</span>
                            <span>info@kashipoojaseva.com</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 {t('अद्भुत ज्ञान', 'Adhbhut Gyaan')} | Adhbhut Gyaan. {t('सर्वाधिकार सुरक्षित।', 'All rights reserved.')} · <Link to="/privacy" style={{ color: 'inherit' }}>{t('गोपनीयता नीति', 'Privacy Policy')}</Link> · <Link to="/terms" style={{ color: 'inherit' }}>{t('नियम एवं शर्तें', 'Terms')}</Link></span>
                    <span>{t('बनारस में निर्मित', 'Made in Banaras')} <img src="/images/logo.png" alt="Banaras" className="inline-logo-sm" /></span>
                </div>
            </div>
        </footer>
    );
}
