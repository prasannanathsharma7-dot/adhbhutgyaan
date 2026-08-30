import { Link } from 'react-router-dom';
import blogData from '../data/blog.json';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gallery, videoClips } from '../data/media';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

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
    const { t, lang } = useLanguage();

    useSEO({
        title: t('ब्लॉग — पूजा विधि व ज्योतिष ज्ञान | Adhbhut Gyaan', 'Blog — Pooja Rituals & Astrology Knowledge | Adhbhut Gyaan'),
        description: t('पूजा विधि, ज्योतिष उपाय और काशी के आध्यात्मिक ज्ञान से जुड़े विस्तृत लेख।', 'In-depth articles on pooja rituals, astrological remedies, and the spiritual knowledge of Kashi.'),
        path: '/blog',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
        ])),
    });

    return (
        <div ref={pageRef}>
            {/* Hero Banner */}
            <section className="page-hero" id="blog-hero">
                <div className="page-hero-bg">
                    <img src="/images/hero-banaras.jpg" alt="Kashi Ghats" />
                </div>
                <div className="page-hero-overlay" />
                <div className="page-hero-content">
                    <span className="section-label" style={{ color: 'var(--gold-300)', justifyContent: 'center' }}>{t('ज्ञान एवं आध्यात्म', 'Knowledge & Spirituality')}</span>
                    <h1>{t('ब्लॉग / लेख', 'Blog / Articles')}</h1>
                    <p>{t('पूजा विधि, ज्योतिष उपाय और काशी के आध्यात्मिक ज्ञान से जुड़े विस्तृत लेख', 'In-depth articles on pooja rituals, astrological remedies, and the spiritual knowledge of Kashi')}</p>
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
                                    <span className="blog-card-category">{lang === 'hi' ? post.category : post.categoryEn}</span>
                                </div>
                                <div className="blog-card-body">
                                    <div className="blog-card-meta">
                                        <span>📅 {new Date(post.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span>⏱️ {post.readTime}</span>
                                    </div>
                                    <h2 className="blog-card-title">{lang === 'hi' ? post.title : post.titleEn}</h2>
                                    <p className="blog-card-excerpt">{lang === 'hi' ? post.excerpt : post.excerptEn}</p>
                                    <span className="blog-card-link">{t('पूरा पढ़ें →', 'Read More →')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery & Videos */}
            <section className="section section-warm" id="blog-gallery">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('झलकियाँ', 'Glimpses')}</span>
                        <h2 className="section-title">{t('हमारी सेवाओं की तस्वीरें', 'Photos from Our Services')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                        {gallery.slice(4, 12).map(item => (
                            <div key={item.src} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--cream)' }}>
                                <img src={item.src} alt={item.capEn} loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                                <p style={{ padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t(item.capHi, item.capEn)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <span className="section-label">{t('वीडियो', 'Videos')}</span>
                        <h2 className="section-title">{t('वीडियो में हमारी पूजा सेवाएं', 'Our Pooja Services in Video')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="video-showcase-grid">
                        {videoClips.map(clip => (
                            <div className="video-showcase-card" key={clip.src} style={{ background: 'var(--dark-100)' }}>
                                <video controls preload="none" poster={clip.poster} playsInline>
                                    <source src={clip.src} type="video/mp4" />
                                </video>
                                <p className="video-showcase-caption">{t(clip.capHi, clip.capEn)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center" style={{ marginTop: '1.5rem' }}>
                        <Link to="/about" className="btn btn-gold">{t('पूरी गैलरी देखें →', 'View Full Gallery →')}</Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section section-dark" id="blog-cta">
                <div className="container text-center">
                    <h2 style={{ color: 'var(--gold-300)', marginBottom: '1rem' }}>{t('पूजा बुक करना चाहते हैं?', 'Want to Book a Pooja?')}</h2>
                    <p style={{ color: 'var(--warm-200)', maxWidth: 550, margin: '0 auto 2rem', lineHeight: 1.8 }}>
                        {t('काशी के अनुभवी पंडितों द्वारा शास्त्रोक्त विधि से सभी प्रकार की पूजा सेवाएं उपलब्ध हैं। अभी बुक करें!', 'All kinds of pooja services are available, performed authentically by experienced Pandits of Kashi. Book now!')}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/booking" className="btn btn-primary btn-lg"><img src="/images/logo.png" alt="" className="inline-logo" /> {t('पूजा बुक करें', 'Book a Pooja')}</Link>
                        <a href={`https://wa.me/919818227189?text=${encodeURIComponent(t('नमस्कार! मैं ब्लॉग पढ़कर आया हूँ, पूजा के बारे में जानना चाहता हूँ।', 'Hello! I read your blog and would like to know more about pooja services.'))}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">💬 {t('WhatsApp करें', 'WhatsApp Us')}</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
