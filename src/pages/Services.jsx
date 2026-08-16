import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import servicesData from '../data/services.json';

export default function Services() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    }, [hash]);

    return (
        <div>
            {/* Page Header */}
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link><span>›</span><span>सेवाएं (Services)</span>
                    </div>
                    <h1>हमारी पूजा सेवाएं</h1>
                    <p className="subtitle">Our Sacred Pooja Services</p>
                </div>
            </header>

            {/* All Services */}
            <section className="section">
                <div className="container">
                    {servicesData.map((service, index) => (
                        <div key={service.id} id={service.id} style={{ marginBottom: 'clamp(3rem, 8vw, 5rem)', scrollMarginTop: '100px' }}>
                            <div className="about-story" style={{ marginBottom: '2rem' }}>
                                {index % 2 === 0 ? (
                                    <>
                                        <div className="about-image">
                                            <img src={`/images/${service.image}`} alt={service.nameEn} loading="lazy" />
                                        </div>
                                        <ServiceInfo service={service} />
                                    </>
                                ) : (
                                    <>
                                        <ServiceInfo service={service} />
                                        <div className="about-image">
                                            <img src={`/images/${service.image}`} alt={service.nameEn} loading="lazy" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>पैकेज चुनें</h3>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose Your Package</p>

                            <div className="package-cards">
                                {service.packages.map(pkg => (
                                    <div className={`package-card ${pkg.popular ? 'popular' : ''}`} key={pkg.nameEn}>
                                        {pkg.popular && <div className="package-popular-badge">⭐ लोकप्रिय</div>}
                                        <div className="package-name">{pkg.name}</div>
                                        <div className="package-name-en">{pkg.nameEn}</div>
                                        {/* <div className="package-price">₹{pkg.price.toLocaleString('en-IN')} <span>/-</span></div> */}
                                        <div className="package-count">{pkg.paathCount}</div>
                                        <div className="package-includes">शामिल: {pkg.includes}</div>
                                        <Link to={`/booking?service=${service.id}&package=${pkg.nameEn}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                            📅 बुक करें
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <div className="om-divider" style={{ marginTop: '3rem' }}>ॐ</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ServiceInfo({ service }) {
    return (
        <div>
      
            <h2 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '0.25rem' }}>{service.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{service.nameEn}</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>{service.description}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1rem' }}>{service.descriptionEn}</p>
            <div style={{ background: 'var(--gold-50)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold-500)', marginBottom: '1.25rem' }}>
                <strong>🕐 सर्वोत्तम समय:</strong> {service.bestTime} ({service.bestTimeEn})
            </div>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--dark-100)' }}>लाभ (Benefits):</h4>
            <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {service.benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--gold-600)', fontSize: '1.1rem' }}>✓</span>
                        <span>{b} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({service.benefitsEn[i]})</span></span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
