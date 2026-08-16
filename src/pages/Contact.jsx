import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const msg = `🙏 *नया संदेश — काशी पूजा सेवा*

*नाम:* ${form.name}
*फ़ोन:* ${form.phone}
${form.email ? `*ईमेल:* ${form.email}` : ''}
${form.subject ? `*विषय:* ${form.subject}` : ''}
*संदेश:* ${form.message}`;
        window.open(`https://wa.me/919278148269?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const contactCards = [
        { icon: '💬', label: 'WhatsApp', value: '+91 92781 48269', sub: 'तुरंत जवाब • Instant Reply', href: 'https://wa.me/919278148269', color: 'var(--whatsapp)', bgColor: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.2)' },
        { icon: '📞', label: 'Phone', value: '+91 92781 48269', sub: 'सुबह 7 बजे - रात 9 बजे', href: 'tel:+919278148269', color: 'var(--gold-500)', bgColor: 'rgba(255,152,0,0.08)', borderColor: 'rgba(255,152,0,0.2)' },
        { icon: '✉️', label: 'Email', value: 'info@kashipoojaseva.com', sub: null, href: null, color: 'var(--gold-500)', bgColor: 'rgba(196,154,44,0.08)', borderColor: 'rgba(196,154,44,0.2)' },
        { icon: '📍', label: 'Office Address', value: 'J11, Pt Umang Nath Sharma,\n19, Nati Imli Rd, Ishwargangi,\nBunker Colony, Varanasi, UP 221002', sub: 'दिशा-निर्देश के लिए क्लिक करें', href: 'https://www.google.com/maps/place/J11,+Pt+Umang+Nath+Sharma,+19,+Nati+Imli+Rd,+Ishwargangi,+Bunker+Colony,+Vijay+Gram+Colony,+Naibasti,+Varanasi,+Uttar+Pradesh+221002,+India/data=!4m2!3m1!1s0x398e2f4802c93edf:0x609d2040bced58c9!18m1!1e1', color: 'var(--red-400)', bgColor: 'rgba(183,28,28,0.05)', borderColor: 'rgba(183,28,28,0.15)' },
    ];

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>संपर्क करें</span></div>
                    <h1>संपर्क करें</h1>
                    <p className="subtitle">Get in Touch with Us</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="about-story">
                        {/* Contact Cards */}
                        <div>
                            <span className="section-label">हमसे जुड़ें</span>
                            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>हमसे संपर्क करें</h2>
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
                                <h3 style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-hindi)' }}>संदेश भेजें</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Send us a Message</p>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">नाम (Name) *</label>
                                        <input className="form-input" placeholder="अपना नाम लिखें" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">मोबाइल (Phone) *</label>
                                        <input className="form-input" type="tel" placeholder="+91 92781 48269" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ईमेल (Email)</label>
                                        <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">विषय (Subject)</label>
                                        <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                            <option value="">-- चुनें --</option>
                                            <option value="पूजा बुकिंग">पूजा बुकिंग (Booking)</option>
                                            <option value="जानकारी">जानकारी (Information)</option>
                                            <option value="शिकायत">शिकायत (Complaint)</option>
                                            <option value="अन्य">अन्य (Other)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">संदेश (Message) *</label>
                                        <textarea className="form-textarea" placeholder="अपना संदेश लिखें..." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>📩 संदेश भेजें</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div style={{ marginTop: 'clamp(2rem,6vw,3rem)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>हमारा स्थान — Our Location</h3>
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', height: 'clamp(250px,40vw,400px)' }}>
                            <iframe
                                title="Office Location"
                                src="https://maps.google.com/maps?q=J11,+Pt+Umang+Nath+Sharma,+19,+Nati+Imli+Rd,+Ishwargangi,+Bunker+Colony,+Vijay+Gram+Colony,+Naibasti,+Varanasi,+Uttar+Pradesh+221002,+India&t=&z=15&ie=UTF8&iwloc=&output=embed"
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
