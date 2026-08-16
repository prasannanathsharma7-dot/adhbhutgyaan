import { Link } from 'react-router-dom';

export default function About() {
    const heritageCards = [
        {
            tagEn: 'History',
            image: '/images/kashi-history.png',
            title: 'काशी का इतिहास',
            titleEn: 'History of Kashi',
            desc: 'जानिए कैसे काशी हजारों वर्षों से ज्ञान, आध्यात्म और मोक्ष का केंद्र रही है — गंगा के तट से लेकर विश्वनाथ मंदिर तक की यात्रा।',
            link: '/kashi-history',
        },
        {
            tagEn: 'Knowledge',
            image: '/images/pooja-importance.png',
            title: 'पूजा क्यों आवश्यक है',
            titleEn: 'Why Pooja is Important',
            desc: 'शास्त्रों के अनुसार पूजा का महत्व, इसके पीछे का विज्ञान और यह हमारे जीवन में सकारात्मक ऊर्जा कैसे लाती है।',
            link: '/why-pooja',
        },
        {
            tagEn: 'Family',
            image: '/images/family-tree.png',
            title: 'हमारा परिवार एवं वंशावली',
            titleEn: 'Our Family & Family Tree',
            desc: 'दो सदियों से अधिक पुरानी शर्मा वंशावली — पीढ़ी दर पीढ़ी ज्योतिष और वेद परंपरा की अखंड धारा।',
            link: '/family-tree',
        },
    ];

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>हमारे बारे में</span></div>
                    <h1>हमारे बारे में</h1>
                    <p className="subtitle">About Kashi Pooja Seva</p>
                </div>
            </header>

            {/* Our Story */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/temple-diyas.png" alt="Temple Diyas" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">हमारी कहानी</span>
                            <h2 className="section-title">काशी की प्राचीन परम्परा के वाहक</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                हम बनारस (काशी) में स्थित पंडितों का एक समूह हैं जो पीढ़ियों से शास्त्रोक्त विधि-विधान से पूजा, पाठ, जप और हवन करा रहे हैं। हमारे पंडित बनारस हिंदू विश्वविद्यालय, संपूर्णानंद संस्कृत विश्वविद्यालय जैसे प्रतिष्ठित संस्थानों से शिक्षित हैं।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                We are a group of experienced Pandits based in Banaras (Kashi), carrying forward a tradition spanning generations. Our Pandits are educated from renowned institutions like BHU and Sampurnanand Sanskrit University.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                अब हम अपनी सेवाओं को ऑनलाइन भी उपलब्ध करा रहे हैं ताकि देश-विदेश में रहने वाले भक्तगण भी काशी के पंडितों की सेवाओं का लाभ उठा सकें।
                            </p>
                            <Link to="/booking" className="btn btn-primary"><img src="/images/logo.png" alt="" className="inline-logo" /> पूजा बुक करें</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Heritage Card Grid: Kashi History / Why Pooja / Family Tree */}
            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">जानिए और</span>
                        <h2 className="section-title">हमारी विरासत को समझें</h2>
                        <p className="section-subtitle">Explore Our Heritage</p>
                    </div>
                    <div className="om-divider">ॐ</div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginTop: '2.5rem',
                        }}
                    >
                        {heritageCards.map((card, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'var(--bg-card, #fff)',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.14)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Image */}
                                <div style={{ position: 'relative', width: '100%', paddingTop: '58%' }}>
                                    <img
                                        src={card.image}
                                        alt={card.titleEn}
                                        loading="lazy"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>

                                {/* Body */}
                                <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <span
                                        style={{
                                            alignSelf: 'flex-end',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: 'var(--gold-700, #b8860b)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.03em',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        {card.tagEn}
                                    </span>

                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.3rem', lineHeight: 1.3 }}>
                                        {card.title}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                        {card.titleEn}
                                    </p>

                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                                        {card.desc}
                                    </p>

                                    <div style={{ marginTop: 'auto' }}>
                                        <Link
                                            to={card.link}
                                            style={{
                                                color: 'var(--gold-700, #b8860b)',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            और जानें →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="section section-dark">
                <div className="container">
                    <div className="stats-grid">
                        {[
                            { num: '25+', label: 'वर्षों का अनुभव\nYears of Experience' },
                            { num: '10,000+', label: 'सफल पूजन\nPoojas Performed' },
                            { num: '5,000+', label: 'संतुष्ट भक्तगण\nHappy Devotees' },
                            { num: '50+', label: 'पूजा प्रकार\nService Types' },
                        ].map(s => (
                            <div className="stat-card" key={s.num}>
                                <div className="stat-number">{s.num}</div>
                                <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">हमारे मूल्य</span>
                        <h2 className="section-title">Our Core Values</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="features-grid">
                        {[
                            { icon: '📖', title: 'शास्त्रोक्त विधि', desc: 'Authentic Vedic Methods — हर पूजा शुद्ध विधि से सम्पन्न' },
                            { icon: '🤝', title: 'विश्वास और पारदर्शिता', desc: 'Trust & Transparency — कोई छुपी लागत नहीं' },
                            { icon: '❤️', title: 'भक्त सेवा', desc: 'Devotee First — भक्तों का कल्याण हमारी प्राथमिकता' },
                            { icon: '🌍', title: 'वैश्विक पहुँच', desc: 'Global Reach — देश-विदेश कहीं भी, काशी की सेवा आपके पास' },
                        ].map((v, i) => (
                            <div className="feature-card" key={i}>
                                <span className="feature-icon">{v.icon}</span>
                                <h3 className="feature-title">{v.title}</h3>
                                <p className="feature-desc">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Special Home Session */}
            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">विशेष सेवा</span>
                        <h2 className="section-title">घर पर ज्योतिष एवं पूजा सत्र</h2>
                        <p className="section-subtitle">Astrology, History & Live Pooja — At Your Doorstep</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="about-story">
                        <div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                यह एक विशेष अनुभव है जिसमें हमारे विद्वान पंडित स्वयं आपके निवास पर आते हैं।
                                सत्र की शुरुआत एक विस्तृत ज्योतिषीय एवं पारिवारिक पृष्ठभूमि चर्चा से होती है,
                                साथ ही काशी के इतिहास और उसकी आध्यात्मिक परम्परा की जानकारी भी साझा की जाती है।
                                इसके पश्चात जीवंत (live) पूजा सम्पन्न कराई जाती है, और सत्र का समापन एक आत्मीय
                                हाई टी सेशन के साथ होता है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                This is a personalized in-home experience where our scholar Pandit visits you directly.
                                The session begins with an in-depth astrology and background consultation, along with
                                insights into the history and spiritual heritage of Kashi. This is followed by a live
                                Pooja performed at your residence, concluding with a warm high-tea session together.
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.25rem' }}>
                                <li>ज्योतिष एवं पारिवारिक पृष्ठभूमि सत्र — Astrology & Background Session</li>
                                <li>काशी का इतिहास — History of Kashi & its Spiritual Legacy</li>
                                <li>आपके निवास पर जीवंत पूजा — Live Pooja at Your Residence</li>
                                <li>हाई टी सत्र — High Tea Session</li>
                            </ul>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                यह सत्र हमारे गुरु परंपरा — बीस दशकों से अधिक पुरानी शर्मा वंशावली — की धारा में
                                आधारित है, जिसे बीएचयू की भूमि पूजन से लेकर अंतरराष्ट्रीय मान्यता तक पहचाना गया है,
                                और जिसे जापान के हुलु टीवी द्वारा वर्ष 2019 में एक वृत्तचित्र (documentary) के
                                माध्यम से भी प्रलेखित किया गया।
                            </p>
                            <Link to="/booking" className="btn btn-primary">
                                <img src="/images/logo.png" alt="" className="inline-logo" /> सत्र बुक करें
                            </Link>
                        </div>
                        <div className="about-image">
                            <img src="/images/home-visit-pooja.png" alt="Home Visit Pooja & High Tea Session" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Kashi */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">हमारा ठिकाना</span>
                            <h2 className="section-title">काशी — विश्व की आध्यात्मिक राजधानी</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                बनारस (वाराणसी) दुनिया के सबसे प्राचीन शहरों में से एक है और हिंदू धर्म की आध्यात्मिक राजधानी मानी जाती है। गंगा नदी के तट पर बसा यह पवित्र शहर — काशी विश्वनाथ मंदिर, दशाश्वमेध घाट की गंगा आरती, और अगणित मंदिरों का घर है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                Banaras (Varanasi) is one of the oldest cities in the world and the spiritual capital of Hinduism. Home to Kashi Vishwanath Temple and the iconic Ganga Aarti at Dashashwamedh Ghat.
                            </p>
                            <p style={{ color: 'var(--gold-700)', fontWeight: 600, fontStyle: 'italic' }}>
                                "काशी में जो पूजा होती है, उसका फल सर्वोत्तम होता है।"
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="/images/ganga-aarti.png" alt="Ganga Aarti" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}