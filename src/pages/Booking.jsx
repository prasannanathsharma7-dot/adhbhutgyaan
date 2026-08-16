import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import servicesData from '../data/services.json';

export default function Booking() {
    const [searchParams] = useSearchParams();
    const preServiceId = searchParams.get('service');
    const prePkgName = searchParams.get('package');

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', date: '', address: '', notes: '' });

    // Pre-select from URL
    useEffect(() => {
        if (preServiceId) {
            const svc = servicesData.find(s => s.id === preServiceId);
            if (svc) {
                setSelectedService(svc);
                if (prePkgName) {
                    const pkg = svc.packages.find(p => p.nameEn === prePkgName);
                    if (pkg) { setSelectedPkg(pkg); setStep(3); return; }
                }
                setStep(2);
            }
        }
    }, [preServiceId, prePkgName]);

    const goToStep = (n) => { setStep(n); window.scrollTo({ top: 200, behavior: 'smooth' }); };

    const handleSubmit = () => {
        if (!form.name.trim()) { alert('कृपया अपना नाम लिखें'); return; }
        if (!form.phone.trim() || form.phone.length < 10) { alert('कृपया सही मोबाइल नंबर लिखें'); return; }
        goToStep(4);
    };

    const whatsAppMsg = selectedService && selectedPkg ? `🙏 *नमस्कार! नई पूजा बुकिंग*

*सेवा:* ${selectedService.name} (${selectedService.nameEn})
*पैकेज:* ${selectedPkg.name} (${selectedPkg.nameEn})
*जाप/पाठ:* ${selectedPkg.paathCount}
// *दक्षिणा:* ₹${selectedPkg.price.toLocaleString('en-IN')}/-

*नाम:* ${form.name}
*फ़ोन:* ${form.phone}
*तिथि:* ${form.date || 'पंडित जी से तय होगी'}
${form.address ? `*पता:* ${form.address}` : ''}
${form.notes ? `*विशेष:* ${form.notes}` : ''}

कृपया बुकिंग कन्फर्म करें। 🙏` : '';

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>पूजा बुक करें</span></div>
                    <h1>पूजा बुक करें</h1>
                    <p className="subtitle">Book Your Pooja in 4 Simple Steps</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
                    {/* Steps */}
                    <div className="wizard-steps">
                        {['पूजा चुनें', 'पैकेज चुनें', 'विवरण भरें', 'पुष्टि करें'].map((label, i) => (
                            <div key={i} className={`wizard-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}>
                                <div className="wizard-step-number">{i + 1}</div>
                                <span className="wizard-step-label">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>पूजा सेवा चुनें</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Select a Pooja Service</p>
                            <div className="service-select-grid">
                                {servicesData.map(svc => (
                                    <div key={svc.id}
                                        className={`service-select-card ${selectedService?.id === svc.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedService(svc)}
                                        style={{ padding: 0, overflow: 'hidden' }}
                                    >
                                        <img src={`/images/${svc.image}`} alt={svc.nameEn} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                                        <div style={{ padding: '1.25rem' }}>
                                            <h4 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '0.25rem' }}>{svc.name}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{svc.nameEn}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <button className="btn btn-primary btn-lg" disabled={!selectedService} onClick={() => goToStep(2)}>
                                    आगे बढ़ें → Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && selectedService && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>पैकेज चुनें</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Select Your Package for {selectedService.nameEn}</p>
                            <div className="package-cards">
                                {selectedService.packages.map(pkg => (
                                    <div key={pkg.nameEn}
                                        className={`package-card ${pkg.popular ? 'popular' : ''} ${selectedPkg?.nameEn === pkg.nameEn ? 'selected' : ''}`}
                                        onClick={() => setSelectedPkg(pkg)}
                                    >
                                        {pkg.popular && <div className="package-popular-badge">⭐ लोकप्रिय</div>}
                                        <div className="package-name">{pkg.name}</div>
                                        <div className="package-name-en">{pkg.nameEn}</div>
                                        {/* <div className="package-price">₹{pkg.price.toLocaleString('en-IN')} <span>/-</span></div> */}
                                        <div className="package-count">{pkg.paathCount}</div>
                                        <div className="package-includes">शामिल: {pkg.includes}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline-dark btn-lg" onClick={() => goToStep(1)}>← वापस</button>
                                <button className="btn btn-primary btn-lg" disabled={!selectedPkg} onClick={() => goToStep(3)}>आगे बढ़ें →</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>अपना विवरण भरें</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter Your Details</p>
                            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                                <div className="form-group">
                                    <label className="form-label">पूरा नाम (Full Name) *</label>
                                    <input className="form-input" placeholder="अपना नाम लिखें" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">मोबाइल नंबर (Phone) *</label>
                                    <input className="form-input" type="tel" placeholder="+91 92781 48269" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">पसंदीदा तिथि (Preferred Date)</label>
                                    <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">पता / शहर (City / Address)</label>
                                    <input className="form-input" placeholder="शहर या पता लिखें" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">विशेष निर्देश (Special Instructions)</label>
                                    <textarea className="form-textarea" placeholder="कोई विशेष अनुरोध या संकल्प विवरण..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline-dark btn-lg" onClick={() => goToStep(2)}>← वापस</button>
                                <button className="btn btn-primary btn-lg" onClick={handleSubmit}>समीक्षा करें →</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4 */}
                    {step === 4 && selectedService && selectedPkg && (
                        <div className="wizard-panel">
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>बुकिंग समीक्षा</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Review Your Booking</p>
                            <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem,4vw,2rem)', border: '2px solid var(--border-gold)', boxShadow: 'var(--shadow-gold)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <img src={`/images/${selectedService.image}`} alt={selectedService.nameEn} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-400)', margin: '0 auto 1rem auto', display: 'block' }} />
                                    <h3 style={{ fontFamily: 'var(--font-hindi)', marginTop: '0.5rem' }}>{selectedService.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedService.nameEn}</p>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                                    {[
                                        ['पैकेज', `${selectedPkg.name} (${selectedPkg.nameEn})`],
                                        ['जाप/पाठ', selectedPkg.paathCount],
                                        ['शामिल', selectedPkg.includes],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                                            <strong>{k}:</strong><span>{v}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                        <strong>दक्षिणा:</strong>
                                        {/* <span style={{ color: 'var(--gold-700)', fontWeight: 700, fontSize: '1.2rem' }}>₹{selectedPkg.price.toLocaleString('en-IN')}/-</span> */}
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        {[['नाम', form.name], ['फ़ोन', form.phone], ['तिथि', form.date || 'पंडित जी से तय होगी'], ...(form.address ? [['पता', form.address]] : []), ...(form.notes ? [['विशेष', form.notes]] : [])].map(([k, v]) => (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                <strong>{k}:</strong><span>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline-dark btn-lg" onClick={() => goToStep(3)}>← वापस</button>
                                <a href={`https://wa.me/919278148269?text=${encodeURIComponent(whatsAppMsg)}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 WhatsApp पर कन्फर्म</a>
                                <a href="tel:+919278148269" className="btn btn-primary btn-lg">📞 कॉल करें</a>
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                WhatsApp पर बुकिंग विवरण भेजा जाएगा। पंडित जी आपसे संपर्क करेंगे।
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
