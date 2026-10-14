import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { waLink } from '../../config/contact';

/** Image card for one of the services that has its own detail page. */
export default function ServiceCard({ entry }) {
    const { t, lang } = useLanguage();
    return (
        <div className="service-browse-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to={entry.detailPath} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <picture>
                    <source type="image/avif" srcSet={`/images/${entry.image.replace('.jpg', '.avif')}`} />
                    <source type="image/webp" srcSet={`/images/${entry.image.replace('.jpg', '.webp')}`} />
                    <img src={`/images/${entry.image}`} alt={entry.nameEn} width="80" height="80" loading="lazy" className="service-browse-img" />
                </picture>
                <div className="service-browse-body">
                    <div className="service-browse-name">{lang === 'hi' ? entry.nameHi : entry.nameEn}</div>
                    {lang === 'hi' && <div className="service-browse-name-en">{entry.nameEn}</div>}
                    <p className="service-browse-desc">{lang === 'hi' ? entry.shortDescHi : entry.shortDescEn}</p>
                </div>
                <span className="service-browse-arrow">→</span>
            </Link>
            <a
                href={waLink(t(`प्रणाम, मुझे ${entry.nameHi} पूजा काशी में करवानी है।`, `Pranam, I would like to book ${entry.nameEn} pooja in Kashi.`))}
                target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--whatsapp-dark)' }}
            >
                <MessageCircle size={13} /> {t('WhatsApp पर सीधे बुक करें', 'Book Directly on WhatsApp')}
            </a>
        </div>
    );
}
