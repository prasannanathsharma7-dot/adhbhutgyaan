import { Link } from 'react-router-dom';
import blogData from '../data/blog.json';
import { useEffect, useRef } from 'react';

function useInView() {
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        const currentRef = ref.current;
        if (currentRef) {
            const elements = currentRef.querySelectorAll('.fade-up');
            elements.forEach(el => observer.observe(el));
        }

        return () => {
            if (currentRef) {
                const elements = currentRef.querySelectorAll('.fade-up');
                elements.forEach(el => observer.unobserve(el));
            }
        };
    }, []);
    return ref;
}

export default function Blog() {
    const pageRef = useInView();

    return (
        <div ref={pageRef}>
            {/* Hero Banner */}
            <section className="page-hero" id="blog-hero">
                <div className="page-hero-bg">
                    <img src="/images/hero-banaras.png" alt="Kashi Ghats" />
                </div>
                <div className="page-hero-overlay" />
                <div className="page-hero-content">
                    <span className="section-label" style={{ color: 'var(--gold-300)', justifyContent: 'center' }}>ज्ञान एवं आध्यात्म</span>
                    <h1>ब्लॉग / लेख</h1>
                    <p>पूजा विधि, ज्योतिष उपाय और काशी के आध्यात्मिक ज्ञान से जुड़े विस्तृत लेख</p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="section" id="blog-listing">
                <div className="container">
                    <div className="blog-grid">
                        {blogData.map((post, i) => (
                            <Link to={`/blog/${post.id}`} className={`blog-card fade-up stagger-${i + 1}`} key={post.id}>
                                <div className="blog-card-image">
                                    <img src={`/images/${post.image}`} alt={post.titleEn} loading="lazy" />
                                    <span className="blog-card-category">{post.category}</span>
                                </div>
                                <div className="blog-card-body">
                                    <div className="blog-card-meta">
                                        <span>📅 {new Date(post.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span>⏱️ {post.readTime}</span>
                                    </div>
                                    <h2 className="blog-card-title">{post.title}</h2>
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                    <span className="blog-card-link">पूरा पढ़ें →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section section-dark" id="blog-cta">
                <div className="container text-center">
                    <h2 style={{ color: 'var(--gold-300)', marginBottom: '1rem' }}>पूजा बुक करना चाहते हैं?</h2>
                    <p style={{ color: 'var(--warm-200)', maxWidth: 550, margin: '0 auto 2rem', lineHeight: 1.8 }}>
                        काशी के अनुभवी पंडितों द्वारा शास्त्रोक्त विधि से सभी प्रकार की पूजा सेवाएं उपलब्ध हैं। अभी बुक करें!
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/booking" className="btn btn-primary btn-lg"><img src="/images/logo.png" alt="" className="inline-logo" /> पूजा बुक करें</Link>
                        <a href="https://wa.me/919278148269?text=नमस्कार! मैं ब्लॉग पढ़कर आया हूँ, पूजा के बारे में जानना चाहता हूँ।" target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 WhatsApp करें</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
