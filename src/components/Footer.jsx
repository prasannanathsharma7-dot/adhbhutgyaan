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
                            <a href="https://www.facebook.com/share/1GAD1LMAq5/" target="_blank" rel="noreferrer" className="social-link facebook" aria-label="Facebook">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                            </a>
                            <a href="https://www.instagram.com/adhbhutgyaan369?utm_source=qr&igsi=djNteHl2dXBlOGQ0" target="_blank" rel="noreferrer" className="social-link instagram" aria-label="Instagram">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                            <a href="https://youtube.com/@adhbhutgyaan4911?si=5OE9xsdrvnGUj_dq" target="_blank" rel="noreferrer" className="social-link youtube" aria-label="YouTube">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                            </a>
                            <a href="https://wa.me/919278148269" target="_blank" rel="noreferrer" className="social-link whatsapp" aria-label="WhatsApp">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            </a>
                            <a href="tel:+919278148269" className="social-link phone" aria-label={t('कॉल करें', 'Call')}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
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
                            <span>J11/19, Pt Umang Nath Sharma, Nati Imli Rd<br/>Ishwargangi, Varanasi, UP 221001</span>
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
                            <span>astrokashi369@gmail.com</span>
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
