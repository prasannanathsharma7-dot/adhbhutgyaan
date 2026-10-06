import { useLanguage } from '../context/LanguageContext';
import cityMeta from '../data/cityMeta.json';
import { offsetFromKashi, convertKashiTime } from '../utils/timeZone';

// The three pooja slots offered on the booking form (Booking.jsx muhuratSlots),
// in Kashi time. Kept in step with that list on purpose - this table is only
// useful if it matches what people can actually book.
const SLOTS = [
    { hi: 'प्रातःकाल', en: 'Pratahkal (morning)', from: [6, 0], to: [10, 0], ist: '6:00 AM – 10:00 AM' },
    { hi: 'मध्याह्न', en: 'Madhyahna (midday)', from: [11, 0], to: [14, 0], ist: '11:00 AM – 2:00 PM' },
    { hi: 'सायंकाल', en: 'Sayankal (evening)', from: [16, 0], to: [20, 0], ist: '4:00 PM – 8:00 PM' },
];

/**
 * City-specific, factual content for overseas pages: how far the city's clock
 * is from Kashi and what each pooja slot is in local time. This is the part of
 * a city page that is genuinely different from city to city (and useful to
 * someone deciding whether they can join a live online pooja), computed from
 * the platform's time-zone database so daylight-saving is handled correctly.
 * Cities in India have no such difference and render nothing here.
 */
export default function CityTimeTable({ cityInfo }) {
    const { t } = useLanguage();
    const meta = cityMeta[cityInfo.slug];
    if (!meta || !meta.tz) return null;

    const now = new Date();
    const off = offsetFromKashi(meta.tz, now);
    if (!off) return null;

    const h = Math.floor(off.minutes / 60);
    const m = off.minutes % 60;
    const gapEn = [h ? `${h} hour${h > 1 ? 's' : ''}` : '', m ? `${m} minutes` : ''].filter(Boolean).join(' ');
    const gapHi = [h ? `${h} घंटे` : '', m ? `${m} मिनट` : ''].filter(Boolean).join(' ');
    const dayNote = (d) => (d < 0 ? t(' (पिछला दिन)', ' (previous day)') : d > 0 ? t(' (अगला दिन)', ' (next day)') : '');
    const fmt = (slot) => {
        const a = convertKashiTime(slot.from[0], slot.from[1], meta.tz, now);
        const b = convertKashiTime(slot.to[0], slot.to[1], meta.tz, now);
        if (!a || !b) return '—';
        return `${a.time}${dayNote(a.dayShift)} – ${b.time}${dayNote(b.dayShift)}`;
    };

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: 860 }}>
                <h2 className="section-title" style={{ textAlign: 'center' }}>
                    {t(`${cityInfo.name} के समय में पूजा के समय`, `Pooja Timings in ${cityInfo.nameEn} Time`)}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '0.75rem auto 1.5rem', maxWidth: 640 }}>
                    {t(
                        `${cityInfo.name} का समय काशी (भारतीय मानक समय) से ${gapHi} ${off.ahead ? 'आगे' : 'पीछे'} है। लाइव ऑनलाइन पूजा में जुड़ने के लिए नीचे हमारे तीनों समय-खंड आपके स्थानीय समय में दिए गए हैं।`,
                        `${cityInfo.nameEn} is ${gapEn} ${off.ahead ? 'ahead of' : 'behind'} Kashi (Indian Standard Time). To join a live online pooja, here are our three booking time slots converted to your local time.`
                    )}
                </p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                            {t('पूजा समय-खंड: काशी बनाम स्थानीय समय', 'Pooja time slots: Kashi time versus local time')}
                        </caption>
                        <thead>
                            <tr style={{ background: 'var(--gold-50)', textAlign: 'left' }}>
                                <th scope="col" style={{ padding: '0.7rem 0.9rem' }}>{t('समय-खंड', 'Time slot')}</th>
                                <th scope="col" style={{ padding: '0.7rem 0.9rem' }}>{t('काशी (IST)', 'Kashi (IST)')}</th>
                                <th scope="col" style={{ padding: '0.7rem 0.9rem' }}>{t(`${cityInfo.name} में`, `In ${cityInfo.nameEn}`)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SLOTS.map(slot => (
                                <tr key={slot.en} style={{ borderTop: '1px solid var(--border-light)' }}>
                                    <th scope="row" style={{ padding: '0.7rem 0.9rem', textAlign: 'left', fontWeight: 600 }}>{t(slot.hi, slot.en)}</th>
                                    <td style={{ padding: '0.7rem 0.9rem' }}>{slot.ist}</td>
                                    <td style={{ padding: '0.7rem 0.9rem', fontWeight: 600, color: 'var(--navy-900)' }}>{fmt(slot)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.9rem' }}>
                    {t(
                        'आज की तिथि के अनुसार गणना; आपके देश में घड़ी बदलने पर समय एक घंटा बदल सकता है। सटीक तिथि व मुहूर्त पूछताछ के बाद आपसे तय किया जाता है।',
                        "Calculated for today's date; the local times can shift by an hour when your country changes its clocks. The exact date and muhurat are confirmed with you after you enquire."
                    )}
                </p>
            </div>
        </section>
    );
}
