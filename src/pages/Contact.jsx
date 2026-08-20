import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';

export default function Contact() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [errors, setErrors] = useState({});
    const { t, lang } = useLanguage();

    useSEO({
        title: t('संपर्क करें | Adhbhut Gyaan', 'Contact Us | Adhbhut Gyaan'),
        description: t('WhatsApp, फ़ोन या ईमेल से हमसे संपर्क करें — वाराणसी, उत्तर प्रदेश।', 'Get in touch with us via WhatsApp, phone, or email — Varanasi, Uttar Pradesh.'),
        path: '/contact',
    });

    const validate = () => {
        const next = {};
        if (!form.name.trim()) {
            next.name = t('कृपया अपना नाम लिखें', 'Please enter your name');
        }
        if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
            next.phone = t('कृपया सही मोबाइल नंबर लिखें (कम से कम 10 अंक)', 'Please enter a valid phone number (at least 10 digits)');
        }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            next.email = t('कृपया सही ईमेल पता लिखें', 'Please enter a valid email address');
        }
        if (!form.message.trim()) {
            next.message = t('कृपया अपना संदेश लिखें', 'Please write your message');
        }
        setErrors(next);
        if (Object.keys(next).length > 0) {
            const firstKey = next.name ? 'name' : next.phone ? 'phone' : next.email ? 'email' : 'message';
            const el = document.getElementById(`contact-${firstKey}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus({ preventScroll: true });
            }
            return false;
        }
        return true;
    };

    const saveMessageToServer = async () => {
        setSaveStatus('saving');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                }),
            });
            setSaveStatus(res.ok ? 'saved' : 'error');
        } catch {
            setSaveStatus('error');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const msg = `🙏 *${t('नया संदेश — अद्भुत ज्ञान', 'New Message — Adhbhut Gyaan')}*

*${t('नाम', 'Name')}:* ${form.name}
*${t('फ़ोन', 'Phone')}:* ${form.phone}
${form.email ? `*${t('ईमेल', 'Email')}:* ${form.email}` : ''}
${form.subject ? `*${t('विषय', 'Subject')}:* ${form.subject}` : ''}
*${t('संदेश', 'Message')}:* ${form.message}`;
        window.open(`https://wa.me/919278148269?text=${encodeURIComponent(msg)}`, '_blank');
        saveMessageToServer();
    };

    const handleEmailSubmit = () => {
        if (!validate()) return;
        const body = `${t('नाम', 'Name')}: ${form.name}
${t('फ़ोन', 'Phone')}: ${form.phone}
${form.subject ? `${t('विषय', 'Subject')}: ${form.subject}` : ''}

${form.message}`;
        window.location.href = `mailto:info@kashipoojaseva.com?subject=${encodeURIComponent(form.subject || t('वेबसाइट से संदेश', 'Message from website'))}&body=${encodeURIComponent(body)}`;
        saveMessageToServer();
    };

    const contactCards = [
        { icon: '💬', label: 'WhatsApp', value: '+91 92781 48269', sub: t('तुरंत जवाब', 'Instant Reply'), href: 'https://wa.me/919278148269', color: 'var(--whatsapp)', bgColor: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.2)' },
        { icon: '📞', label: t('फ़ोन', 'Phone'), value: '+91 92781 48269', sub: t('सुबह 7 बजे - रात 9 बजे', '7 AM - 9 PM'), href: 'tel:+919278148269', color: 'var(--gold-500)', bgColor: 'rgba(255,152,0,0.08)', borderColor: 'rgba(255,152,0,0.2)' },
        { icon: '✉️', label: t('ईमेल', 'Email'), value: 'info@kashipoojaseva.com', sub: t('क्लिक करके ईमेल भेजें', 'Click to send an email'), href: 'mailto:info@kashipoojaseva.com', color: 'var(--gold-500)', bgColor: 'rgba(196,154,44,0.08)', borderColor: 'rgba(196,154,44,0.2)' },
        { icon: '📍', label: t('कार्यालय का पता', 'Office Address'), value: 'J11/19, Pt Umang Nath Sharma,\nNati Imli Rd, Ishwargangi,\nVaranasi, UP 221001', sub: t('दिशा-निर्देश के लिए क्लिक करें', 'Click for directions'), href: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('J11/19, Pt Umang Nath Sharma, Nati Imli Rd, Ishwargangi, Varanasi, UP 221001'), color: 'var(--red-400)', bgColor: 'rgba(183,28,28,0.05)', borderColor: 'rgba(183,28,28,0.15)' },
    ];

    const subjectOptions = [
        { v: 'पूजा बुकिंग', hi: 'पूजा बुकिंग', en: 'Booking' },
        { v: 'जानकारी', hi: 'जानकारी', en: 'Information' },
        { v: 'शिकायत', hi: 'शिकायत', en: 'Complaint' },
        { v: 'अन्य', hi: 'अन्य', en: 'Other' },
    ];

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('संपर्क करें', 'Contact')}</span></div>
                    <h1>{t('संपर्क करें', 'Contact Us')}</h1>
                    <p className="subtitle">{t('हमसे संपर्क करें', 'Get in Touch with Us')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="about-story">
                        {/* Contact Cards */}
                        <div>
                            <span className="section-label">{t('हमसे जुड़ें', 'Connect With Us')}</span>
                            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>{t('हमसे संपर्क करें', 'Contact Us')}</h2>
                            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                                {contactCards.map(card => {
                                    const Wrapper = card.href ? 'a' : 'div';
                                    return (
                                        <Wrapper key={card.label} href={card.href} target={card.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                                            style={{
                                                display: 'flex', gap: '1rem', alignItems: 'center', padding: 'clamp(0.75rem,3vw,1.25rem)',
                                                background: card.bgColor, border: `2px solid ${card.borderColor}`,
                                                borderRadius: 'var(--radius-lg)', transition: 'all var(--dur-normal) var(--ease-out)'
                                            }}
                                        >
                                            <div style={{
                                                width: 50, height: 50, background: card.color, borderRadius: 'var(--radius-full)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
                                            }}>
                                                {card.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--dark-100)', marginBottom: '0.15rem' }}>{card.label}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{card.value}</div>
                                                {card.sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{card.sub}</div>}
                                            </div>
                                        </Wrapper>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,4vw,2rem)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-hindi)' }}>{t('संदेश भेजें', 'Send us a Message')}</h3>
                                {saveStatus === 'saving' && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-1rem', marginBottom: '1rem' }}>
                                        {t('आपका संदेश दर्ज किया जा रहा है…', 'Recording your message…')}
                                    </p>
                                )}
                                {saveStatus === 'saved' && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--whatsapp)', marginTop: '-1rem', marginBottom: '1rem' }}>
                                        ✓ {t('आपका संदेश सुरक्षित रूप से दर्ज हो गया है', 'Your message has been securely recorded')}
                                    </p>
                                )}
                                {saveStatus === 'error' && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--gold-700)', background: 'var(--gold-50)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                                        {t('संदेश सहेजा नहीं जा सका, परंतु आपका WhatsApp/ईमेल संदेश वैसे ही भेज दिया गया है।', "We couldn't save a copy on our side, but your WhatsApp/email message was still sent as normal.")}
                                    </p>
                                )}
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="contact-name">{t('नाम', 'Name')} *</label>
                                        <input
                                            id="contact-name"
                                            className={`form-input ${errors.name ? 'has-error' : ''}`}
                                            placeholder={t('अपना नाम लिखें', 'Enter your name')}
                                            value={form.name}
                                            aria-invalid={errors.name ? 'true' : 'false'}
                                            onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                                        />
                                        {errors.name && <p className="form-error">⚠ {errors.name}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="contact-phone">{t('मोबाइल', 'Phone')} *</label>
                                        <input
                                            id="contact-phone"
                                            className={`form-input ${errors.phone ? 'has-error' : ''}`}
                                            type="tel"
                                            placeholder="+91 92781 48269"
                                            value={form.phone}
                                            aria-invalid={errors.phone ? 'true' : 'false'}
                                            onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: undefined }); }}
                                        />
                                        {errors.phone && <p className="form-error">⚠ {errors.phone}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="contact-email">{t('ईमेल', 'Email')}</label>
                                        <input
                                            id="contact-email"
                                            className={`form-input ${errors.email ? 'has-error' : ''}`}
                                            type="email"
                                            placeholder="your@email.com"
                                            value={form.email}
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                            onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                                        />
                                        {errors.email && <p className="form-error">⚠ {errors.email}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('विषय', 'Subject')}</label>
                                        <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                            <option value="">-- {t('चुनें', 'Select')} --</option>
                                            {subjectOptions.map(o => (
                                                <option key={o.v} value={o.v}>{lang === 'hi' ? o.hi : o.en}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="contact-message">{t('संदेश', 'Message')} *</label>
                                        <textarea
                                            id="contact-message"
                                            className={`form-textarea ${errors.message ? 'has-error' : ''}`}
                                            placeholder={t('अपना संदेश लिखें...', 'Write your message...')}
                                            value={form.message}
                                            aria-invalid={errors.message ? 'true' : 'false'}
                                            onChange={e => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: undefined }); }}
                                        />
                                        {errors.message && <p className="form-error">⚠ {errors.message}</p>}
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}>💬 {t('WhatsApp पर भेजें', 'Send via WhatsApp')}</button>
                                    <button type="button" onClick={handleEmailSubmit} className="btn btn-outline-dark" style={{ width: '100%', justifyContent: 'center' }}>✉️ {t('ईमेल से भेजें', 'Send via Email')}</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div style={{ marginTop: 'clamp(2rem,6vw,3rem)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>{t('हमारा स्थान', 'Our Location')}</h3>
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', height: 'clamp(250px,40vw,400px)' }}>
                            <iframe
                                title="Office Location"
                                src={"https://maps.google.com/maps?q=" + encodeURIComponent('J11/19, Pt Umang Nath Sharma, Nati Imli Rd, Ishwargangi, Varanasi, Uttar Pradesh 221001, India') + "&t=&z=15&ie=UTF8&iwloc=&output=embed"}
                                width="100%" height="100%" style={{ border: 0 }}
                                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
