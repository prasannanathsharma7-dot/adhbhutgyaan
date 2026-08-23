import { useParams, Link, Navigate } from 'react-router-dom';
import blogData from '../data/blog.json';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
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

export default function BlogPost() {
    const { slug } = useParams();
    const pageRef = useInView();
    const post = blogData.find(p => p.id === slug);
    const { t, lang } = useLanguage();

    useSEO({
        title: post ? `${lang === 'hi' ? post.title : post.titleEn} | Adhbhut Gyaan` : t('ब्लॉग | Adhbhut Gyaan', 'Blog | Adhbhut Gyaan'),
        description: post ? (lang === 'hi' ? post.excerpt : post.excerptEn) : '',
        path: post ? `/blog/${post.id}` : '/blog',
        image: post ? `https://www.adhbhutgyaan.com/images/${post.image}` : undefined,
        jsonLd: post ? combineJsonLd(
            {
                '@type': 'BlogPosting',
                headline: lang === 'hi' ? post.title : post.titleEn,
                description: lang === 'hi' ? post.excerpt : post.excerptEn,
                image: `https://www.adhbhutgyaan.com/images/${post.image}`,
                datePublished: post.date,
                author: { '@type': 'Organization', name: 'Adhbhut Gyaan' },
                publisher: { '@type': 'Organization', name: 'Adhbhut Gyaan' },
                mainEntityOfPage: `https://www.adhbhutgyaan.com/blog/${post.id}`,
            },
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: 'Blog', path: '/blog' },
                { name: lang === 'hi' ? post.title : post.titleEn, path: `/blog/${post.id}` },
            ])
        ) : null,
    });

    if (!post) return <Navigate to="/blog" replace />;

    // Find related posts (exclude current)
    const relatedPosts = blogData.filter(p => p.id !== post.id).slice(0, 3);

    return (
        <div ref={pageRef}>
            {/* Article Hero */}
            <section className="page-hero blog-post-hero" id="blog-post-hero">
                <div className="page-hero-bg">
                    <img src={`/images/${post.image}`} alt={post.titleEn} />
                </div>
                <div className="page-hero-overlay" />
                <div className="page-hero-content">
                    <span className="blog-post-category-badge">{lang === 'hi' ? post.category : post.categoryEn}</span>
                    <h1>{lang === 'hi' ? post.title : post.titleEn}</h1>
                    {lang === 'hi' && <p className="blog-post-title-en">{post.titleEn}</p>}
                    <div className="blog-post-meta">
                        <span>📅 {new Date(post.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>⏱️ {post.readTime} {t('पढ़ने का समय', 'read')}</span>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="section" id="blog-post-content">
                <div className="container">
                    <article className="blog-article">
                        {lang === 'en' && (
                            <p style={{ background: 'var(--gold-50)', borderLeft: '4px solid var(--gold-500)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                This article includes both Hindi and English text as originally written.
                            </p>
                        )}
                        {post.content.map((block, i) => {
                            if (block.type === 'heading') {
                                return <h2 key={i} className="blog-article-heading">{block.text}</h2>;
                            }
                            if (block.type === 'paragraph') {
                                return <p key={i} className="blog-article-paragraph">{block.text}</p>;
                            }
                            if (block.type === 'list') {
                                return (
                                    <ul key={i} className="blog-article-list">
                                        {block.items.map((item, j) => (
                                            <li key={j}>{item}</li>
                                        ))}
                                    </ul>
                                );
                            }
                            return null;
                        })}

                        {/* CTA Box inside article */}
                        <div className="blog-article-cta">
                            <div className="blog-article-cta-content">
                                <img src="/images/logo.png" alt="" className="blog-article-cta-logo" />
                                <h3>{t('पूजा बुक करें — अद्भुत ज्ञान', 'Book a Pooja — Adhbhut Gyaan')}</h3>
                                <p>{t('काशी के अनुभवी पंडितों द्वारा शास्त्रोक्त विधि से सम्पूर्ण पूजन कार्य। अभी WhatsApp पर संपर्क करें!', 'Complete pooja rituals performed authentically by experienced Pandits of Kashi. Contact us on WhatsApp now!')}</p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {post.serviceId && (
                                        <Link to={`/booking?service=${post.serviceId}`} className="btn btn-primary">
                                            <img src="/images/logo.png" alt="" className="inline-logo" /> {t('यह पूजा बुक करें', 'Book This Pooja')}
                                        </Link>
                                    )}
                                    <a href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं ब्लॉग पढ़कर आया हूँ।', 'Hello! I read your blog article.'))}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                                        💬 {t('WhatsApp करें', 'WhatsApp Us')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Related Articles */}
                    <div className="blog-related">
                        <h3 className="blog-related-heading">{t('और पढ़ें', 'Read More')}</h3>
                        <div className="blog-related-grid">
                            {relatedPosts.map(rp => (
                                <Link to={`/blog/${rp.id}`} className="blog-related-card" key={rp.id}>
                                    <img src={`/images/${rp.image}`} alt={rp.titleEn} loading="lazy" />
                                    <div className="blog-related-card-body">
                                        <span className="blog-related-card-category">{lang === 'hi' ? rp.category : rp.categoryEn}</span>
                                        <h4>{lang === 'hi' ? rp.title : rp.titleEn}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
