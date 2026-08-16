import { Link } from 'react-router-dom';

export default function WhyPooja() {
    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link><span>›</span>
                        <Link to="/about">हमारे बारे में</Link><span>›</span>
                        <span>पूजा क्यों आवश्यक है</span>
                    </div>
                    <h1>पूजा क्यों आवश्यक है</h1>
                    <p className="subtitle">Why Pooja is Important</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/pooja-hero.png" alt="Traditional Pooja Ritual" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">शास्त्रीय दृष्टिकोण</span>
                            <h2 className="section-title">पूजा — ऊर्जा, अनुशासन और श्रद्धा का संगम</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                पूजा केवल एक धार्मिक कर्मकांड नहीं, बल्कि मंत्र, यंत्र और तंत्र के समन्वय से उत्पन्न एक
                                वैज्ञानिक प्रक्रिया है। सही उच्चारण, सही समय (मुहूर्त) और सही विधि से की गई पूजा वातावरण
                                में सकारात्मक ऊर्जा का संचार करती है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                Pooja is not merely a religious ritual — it's a structured practice combining mantra
                                (sound vibration), yantra (sacred geometry), and precise timing to channel positive
                                energy into one's environment and consciousness.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">लाभ</span>
                        <h2 className="section-title">नियमित पूजा के लाभ</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <span className="feature-icon">🧘</span>
                            <h3 className="feature-title">मानसिक शांति</h3>
                            <p className="feature-desc">नियमित पूजा और मंत्र जाप मन को स्थिर करते हैं और तनाव को कम करते हैं।</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🏠</span>
                            <h3 className="feature-title">घर में सकारात्मकता</h3>
                            <p className="feature-desc">हवन और पूजा से वातावरण शुद्ध होता है, नकारात्मक ऊर्जा दूर होती है।</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">⭐</span>
                            <h3 className="feature-title">ग्रह दोष निवारण</h3>
                            <p className="feature-desc">विशेष पूजाएं ग्रहों की प्रतिकूल स्थिति के प्रभाव को शांत करने में सहायक मानी जाती हैं।</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🙏</span>
                            <h3 className="feature-title">संस्कार व परंपरा</h3>
                            <p className="feature-desc">पूजा हमारी सांस्कृतिक जड़ों से जोड़ती है और आगे की पीढ़ियों तक परंपरा पहुँचाती है।</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">विधि-विधान</span>
                            <h2 className="section-title">शुद्ध विधि से पूजा क्यों जरूरी है</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                शास्त्रों में स्पष्ट कहा गया है कि अशुद्ध उच्चारण या अपूर्ण विधि से की गई पूजा अपेक्षित
                                फल नहीं देती। इसलिए काशी के प्रशिक्षित पंडितों द्वारा शास्त्रोक्त विधि से पूजा कराना
                                अत्यंत महत्वपूर्ण माना जाता है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                Scriptures emphasize that a Pooja performed with incorrect pronunciation or incomplete
                                procedure does not yield its intended benefits — which is why having a trained Pandit
                                conduct rituals with correct Vedic method matters.
                            </p>
                            <Link to="/booking" className="btn btn-primary">पूजा बुक करें</Link>
                        </div>
                        <div className="about-image">
                            <img src="/images/havan-fire.png" alt="Havan Ceremony" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}