import { Link } from 'react-router-dom';
import citiesData from '../data/cities.json';
import cityMeta from '../data/cityMeta.json';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

const REGIONS = [
    ['India', 'भारत', 'India'], ['Nepal', 'नेपाल', 'Nepal'], ['USA', 'अमेरिका', 'USA'], ['UK', 'यूनाइटेड किंगडम', 'United Kingdom'],
    ['Canada', 'कनाडा', 'Canada'], ['Australia', 'ऑस्ट्रेलिया', 'Australia'], ['Mauritius', 'मॉरीशस', 'Mauritius'],
    ['Trinidad', 'त्रिनिदाद', 'Trinidad'], ['Guyana', 'गुयाना', 'Guyana'], ['Fiji', 'फिजी', 'Fiji'],
];

// Index of every city page. Before this existed none of the 111 city pages was
// linked from anywhere on the site (they were reachable only via the sitemap),
// and a page nothing links to is treated as unimportant by search engines.
export default function CityHub() {
    const { t } = useLanguage();

    useSEO({
        title: t('पूजा के लिए पंडित — हम जहाँ सेवा देते हैं | Adhbhut Gyaan', 'Pandit for Pooja — Cities We Serve | Adhbhut Gyaan'),
        description: t(
            'काशी के पंडितों से भारत, नेपाल, अमेरिका, ब्रिटेन, कनाडा, ऑस्ट्रेलिया, मॉरीशस, त्रिनिदाद, गुयाना व फिजी से पूजा बुक करें — लाइव वीडियो के साथ।',
            "Book Kashi's pandits from India, Nepal, the USA, UK, Canada, Australia, Mauritius, Trinidad, Guyana or Fiji - live online pooja with video."
        ),
        path: '/pandit-for-pooja',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Cities We Serve', path: '/pandit-for-pooja' }])),
    });

    return (
        <div className="page-content">
            <section className="section section-dark" style={{ paddingBottom: '2.5rem' }}>
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link> › {t('हम जहाँ सेवा देते हैं', 'Cities We Serve')}</div>
                    <h1 style={{ color: 'white', marginTop: '0.75rem' }}>{t('पूजा के लिए पंडित — हम जहाँ सेवा देते हैं', 'Pandit for Pooja — Cities We Serve')}</h1>
                    <p style={{ color: 'var(--warm-200)', maxWidth: 680, marginTop: '0.75rem' }}>
                        {t(
                            'आप जहाँ भी रहते हों, काशी के पंडित आपकी पूजा करा सकते हैं — लाइव वीडियो के साथ ऑनलाइन, आपके स्वयं के संकल्प के साथ, अथवा काशी आकर प्रत्यक्ष। अपना शहर चुनें और अपने स्थानीय समय में पूजा के समय-खंड देखें।',
                            "Wherever you live, Kashi's pandits can perform your pooja - online with live video and your own Sankalp, or in person at Kashi. Pick your city to see pooja time slots in your local time."
                        )}
                    </p>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    {REGIONS.map(([key, hi, en]) => {
                        const list = citiesData.filter(c => (cityMeta[c.slug] || {}).region === key).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
                        if (!list.length) return null;
                        return (
                            <div key={key} style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{t(hi, en)}</h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                    {list.map(c => (
                                        <li key={c.slug}>
                                            <Link to={`/pandit-for-pooja/${c.slug}`} className="btn btn-outline-dark" style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem' }}>{t(c.name, c.nameEn)}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                    <div className="text-center" style={{ marginTop: '2rem' }}>
                        <Link to="/services" className="btn btn-primary">{t('सभी सेवाएं देखें', 'View All Services')}</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
