import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice, UNIT_LABELS } from '../../utils/pricing';
import { waLink } from '../../config/contact';

/** One compact line of the pooja directory / finder results. Shows a price ONLY for owner-approved items. */
export default function PoojaRow({ entry }) {
    const { t, lang } = useLanguage();
    const { price } = entry;
    const unit = UNIT_LABELS[price.unit]?.[lang === 'hi' ? 'hi' : 'en'] || '';
    const priceText = price.status === 'approved'
        ? (price.min === price.max ? formatPrice(price.min) : `${formatPrice(price.min)} – ${formatPrice(price.max)}`)
        : (price.status === 'ask' ? t('दर पूछें', 'Price on request') : t('मूल्य हेतु WhatsApp करें', 'Price on WhatsApp'));
    const enquiry = waLink(`Namaste, I would like to enquire about "${entry.nameEn} / ${entry.nameHi}". Please share the details and availability.`);

    return (
        <li className="pooja-row">
            <span className="pooja-row-names">
                {entry.detailPath
                    ? <Link to={entry.detailPath} className="pooja-row-name">{lang === 'hi' ? entry.nameHi : entry.nameEn}</Link>
                    : <span className="pooja-row-name">{lang === 'hi' ? entry.nameHi : entry.nameEn}</span>}
                <span className="pooja-row-alt">{lang === 'hi' ? entry.nameEn : entry.nameHi}</span>
            </span>
            <span className={`pooja-row-price${price.status === 'approved' ? ' is-priced' : ''}`}>
                {priceText}
                {price.status === 'approved' && unit && <small>{unit}</small>}
            </span>
            <span className="pooja-row-actions">
                {entry.detailPath && <Link to={entry.detailPath} className="pooja-row-link">{t('विवरण', 'Details')}</Link>}
                <a href={enquiry} target="_blank" rel="noreferrer" className="pooja-row-wa" aria-label={`${t('WhatsApp पर पूछें', 'Enquire on WhatsApp')}: ${entry.nameEn}`}>
                    <MessageCircle size={18} aria-hidden="true" />
                </a>
            </span>
        </li>
    );
}
