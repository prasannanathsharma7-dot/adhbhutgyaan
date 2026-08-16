import { useParams, Link, Navigate } from 'react-router-dom';
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

export default function BlogPost() {
    const { slug } = useParams();
    const pageRef = useInView();
    const post = blogData.find(p => p.id === slug);

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
                    <span className="blog-post-category-badge">{post.category}</span>
                    <h1>{post.title}</h1>
                    <p className="blog-post-title-en">{post.titleEn}</p>
                    <div className="blog-post-meta">
                        <span>📅 {new Date(post.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>⏱️ {post.readTime} पढ़ने का समय</span>
                        <span>📂 {post.categoryEn}</span>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="section" id="blog-post-content">
                <div className="container">
                    <article className="blog-article">
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
                                <h3>पूजा बुक करें — काशी पूजा सेवा</h3>
                                <p>काशी के अनुभवी पंडितों द्वारा शास्त्रोक्त विधि से सम्पूर्ण पूजन कार्य। अभी WhatsApp पर संपर्क करें!</p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {post.serviceId && (
                                        <Link to={`/booking?service=${post.serviceId}`} className="btn btn-primary">
                                            <img src="/images/logo.png" alt="" className="inline-logo" /> यह पूजा बुक करें
                                        </Link>
                                    )}
                                    <a href="https://wa.me/919278148269?text=नमस्कार! मैं ब्लॉग पढ़कर आया हूँ।" target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                                        💬 WhatsApp करें
                                    </a>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Related Articles */}
                    <div className="blog-related">
                        <h3 className="blog-related-heading">और पढ़ें</h3>
                        <div className="blog-related-grid">
                            {relatedPosts.map(rp => (
                                <Link to={`/blog/${rp.id}`} className="blog-related-card" key={rp.id}>
                                    <img src={`/images/${rp.image}`} alt={rp.titleEn} loading="lazy" />
                                    <div className="blog-related-card-body">
                                        <span className="blog-related-card-category">{rp.category}</span>
                                        <h4>{rp.title}</h4>
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
