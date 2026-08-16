import { Link } from 'react-router-dom';

export default function FamilyTree() {
    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link><span>›</span>
                        <Link to="/about">हमारे बारे में</Link><span>›</span>
                        <span>हमारा परिवार एवं वंशावली</span>
                    </div>
                    <h1>हमारा परिवार एवं वंशावली</h1>
                    <p className="subtitle">Our Family & Family Tree — A Bicentennial Legacy</p>
                </div>
            </header>

            {/* Intro */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/family-portrait.png" alt="Sharma Family Portrait" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">वंश परिचय</span>
                            <h2 className="section-title">दो सदियों की अखंड ज्योतिष परंपरा</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                शर्मा परिवार की गाथा केवल एक वंशावली नहीं, बल्कि वैदिक विज्ञान की अक्षुण्ण शक्ति का
                                प्रमाण है। दो सदियों से अधिक समय से यह परिवार प्राचीन ज्योतिषीय ज्ञान और आधुनिक
                                अंतरराष्ट्रीय पहचान के संगम का प्रतिनिधित्व करता है।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                The saga of the Sharma family is a testament to the enduring potency of Vedic sciences
                                spanning over two centuries — a rare confluence of ancestral wisdom and global recognition.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Family Tree Diagram */}
            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">वंश वृक्ष</span>
                        <h2 className="section-title">Family Tree</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <img
                            src="/images/family-tree-diagram.png"
                            alt="Sharma Family Tree Diagram"
                            loading="lazy"
                            style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                </div>
            </section>

            {/* Generation 1 */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">पीढ़ी I</span>
                            <h2 className="section-title">महामहोपाध्याय पं. अयोध्या नाथ शर्मा</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                19वीं शताब्दी में इस वंश की आधारशिला महामहोपाध्याय पंडित अयोध्या नाथ शर्मा ने रखी।
                                काशी में संस्कृत विद्वता और ज्योतिषीय शुद्धता के शिखर पुरुष रहे, उन्हें बनारस हिंदू
                                विश्वविद्यालय (BHU) की भूमि पूजन सम्पन्न कराने का पवित्र दायित्व सौंपा गया था।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                The foundation of this legacy was laid in the 19th century by Mahamahopadhyaya Pandit
                                Ayodhya Nath Sharma, entrusted with performing the Bhoomi Pujan for Banaras Hindu
                                University (BHU). A road leading to his Pathshala was later named in his honor by the
                                British administration in recognition of his scholarship.
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="/images/ayodhya-nath-sharma.png" alt="Pt. Ayodhya Nath Sharma" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Generation 2 */}
            <section className="section section-warm">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/shambhu-nath-sharma.png" alt="Pt. Shambhu Nath Sharma" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">पीढ़ी II</span>
                            <h2 className="section-title">पंडित शंभू नाथ शर्मा</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                1962 में बिहार एवं रांची के राज गुरु के रूप में सम्मानित हुए। प्रधानमंत्री इंदिरा गांधी
                                और राष्ट्रपति बी.डी. जत्ती जैसे शीर्ष नेतृत्व को आध्यात्मिक व ज्योतिषीय मार्गदर्शन दिया।
                                1971 में 50 देशों से लोग व्यक्तिगत रूप से उनसे मिलने भारत आए।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                Appointed Raj Guru of Bihar and Ranchi in 1962, he guided leaders such as Prime
                                Minister Indira Gandhi and President B.D. Jatti. In 1971, seekers from 50 nations
                                travelled to India to meet him, and he was later hailed as an "Enlightened Soul"
                                across Europe and North America. He also founded the Kamda Kali Mandir and supported
                                scholarships for Sanskrit students in need.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Generation 3 */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">पीढ़ी III</span>
                            <h2 className="section-title">डॉ. उमंग नाथ शर्मा</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                वर्तमान पीढ़ी में यह विरासत डॉ. उमंग नाथ शर्मा के माध्यम से नई ऊँचाइयों तक पहुँची है।
                                मैरीलैंड विश्वविद्यालय, अमेरिका द्वारा उन्हें ज्योतिष में डॉक्टरेट की उपाधि से सम्मानित
                                किया गया। वर्ष 2019 में जापान के हुलु टीवी ने उनके जीवन और ज्योतिषीय पद्धति पर एक
                                विस्तृत वृत्तचित्र प्रस्तुत किया।
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                In the modern era, Dr. Umang Nath Sharma bridges ancestral tradition with academic
                                rigor. He was conferred a Doctorate in Astrology by the University of Maryland, USA,
                                and in 2019, Japan's Hulu TV produced a documentary on his life and methodology —
                                carrying the Sharma legacy, born on the ghats of Varanasi, to a global stage.
                            </p>
                            <Link to="/booking" className="btn btn-primary">पूजा बुक करें</Link>
                        </div>
                        <div className="about-image">
                            <img src="/images/umang-nath-sharma.jpeg" alt="Dr. Umang Nath Sharma" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Summary strip */}
            <section className="section section-dark">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">200+</div>
                            <div className="stat-label">वर्षों की वंशावली{'\n'}Years of Lineage</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">3</div>
                            <div className="stat-label">पीढ़ियाँ{'\n'}Generations</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">देशों से मान्यता{'\n'}Countries of Recognition</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">2019</div>
                            <div className="stat-label">हुलु वृत्तचित्र{'\n'}Hulu Documentary</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}