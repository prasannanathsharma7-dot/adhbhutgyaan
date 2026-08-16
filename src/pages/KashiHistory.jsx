import { Link } from 'react-router-dom';

export default function KashiHistory() {
    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link><span>›</span>
                        <Link to="/about">हमारे बारे में</Link><span>›</span>
                        <span>काशी का इतिहास</span>
                    </div>
                    <h1>काशी का इतिहास</h1>
                    <p className="subtitle">History of Kashi — The Eternal City</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/kashi-history-hero.png" alt="Ancient Kashi Ghats" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">प्राचीनतम नगरी</span>
                            <h2 className="section-title">विश्व की सबसे प्राचीन जीवित नगरी</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                काशी, जिसे वाराणसी और बनारस के नाम से भी जाना जाता है, हजारों वर्षों से निरंतर बसी हुई
                                विश्व की सबसे प्राचीन नगरियों में से एक मानी जाती है। पुराणों में इसे भगवान शिव की नगरी
                                कहा गया है, जहाँ मृत्यु भी मोक्ष का द्वार बन जाती है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                Kashi, also known as Varanasi and Banaras, is considered one of the oldest continuously
                                inhabited cities in the world. In the scriptures, it is described as the city of Lord
                                Shiva — a place where even death becomes a gateway to liberation (moksha).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">आध्यात्मिक महत्व</span>
                        <h2 className="section-title">काशी क्यों है इतनी पवित्र?</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <span className="feature-icon">🕉️</span>
                            <h3 className="feature-title">काशी विश्वनाथ मंदिर</h3>
                            <p className="feature-desc">द्वादश ज्योतिर्लिंगों में एक, भगवान शिव का यह मंदिर करोड़ों भक्तों की आस्था का केंद्र है।</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🪔</span>
                            <h3 className="feature-title">गंगा आरती, दशाश्वमेध घाट</h3>
                            <p className="feature-desc">प्रतिदिन संध्या में होने वाली भव्य गंगा आरती, जो देश-विदेश से आए भक्तों को मंत्रमुग्ध कर देती है।</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📿</span>
                            <h3 className="feature-title">मोक्ष की नगरी</h3>
                            <p className="feature-desc">मान्यता है कि काशी में देह त्यागने से जीव को जन्म-मृत्यु के चक्र से मुक्ति मिलती है।</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📖</span>
                            <h3 className="feature-title">ज्ञान की परंपरा</h3>
                            <p className="feature-desc">सदियों से संस्कृत, वेद, ज्योतिष और शास्त्रों की शिक्षा का सबसे बड़ा केंद्र — जिसमें BHU एक आधुनिक कड़ी है।</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">हमारी परंपरा</span>
                            <h2 className="section-title">काशी के पंडितों की भूमिका</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                काशी के पंडित पीढ़ियों से शास्त्रोक्त विधि-विधान के संरक्षक रहे हैं। यहाँ की पूजा पद्धति
                                न केवल सबसे प्रामाणिक मानी जाती है, बल्कि इसे वेदों और पुराणों में वर्णित मूल स्वरूप के
                                सबसे निकट भी माना जाता है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                Pandits of Kashi have been custodians of scripturally accurate ritual practice for
                                generations, making Kashi-style Pooja among the most authentic forms practiced anywhere
                                in India today.
                            </p>
                            <Link to="/booking" className="btn btn-primary">पूजा बुक करें</Link>
                        </div>
                        <div className="about-image">
                            <img src="/images/kashi-vishwanath.png" alt="Kashi Vishwanath Temple" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}