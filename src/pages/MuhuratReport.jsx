import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';

export default function MuhuratReport() {
    const { t } = useLanguage();
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const adminKey = searchParams.get('admin_key');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useSEO({
        title: t('आपकी शुभ मुहूर्त रिपोर्ट | Adhbhut Gyaan', 'Your Shubh Muhurat Report | Adhbhut Gyaan'),
        path: `/muhurat/report/${orderId}`,
        noindex: true, // contains a real customer's name and personal booking details -
        // this permanent link is meant to be shared privately (WhatsApp), not
        // discovered via public search, so it must never be indexed.
    });

    useEffect(() => {
        const url = `/api/muhurat-booking?orderId=${orderId}${adminKey ? `&admin_key=${encodeURIComponent(adminKey)}` : ''}`;
        fetch(url)
            .then(res => res.json())
            .then(json => {
                if (!json.ok) { setError(json.error); return; }
                setData(json);
            })
            .catch(() => setError(t('रिपोर्ट लोड करने में त्रुटि हुई', 'Failed to load the report')));
    }, [orderId, adminKey]);

    if (error) {
        return (
            <div className="container section text-center">
                <p style={{ color: '#b91c1c' }}>{error}</p>
                <Link to="/muhurat" className="btn btn-outline-dark">{t('वापस जाएं', 'Go Back')}</Link>
            </div>
        );
    }
    if (!data) {
        return <div className="container section text-center"><p>{t('लोड हो रहा है...', 'Loading...')}</p></div>;
    }

    const { order, isAdminView } = data;
    const whatsappUrl = `https://wa.me/919278148269?text=${encodeURIComponent(
        t(`प्रणाम, मेरी मुहूर्त रिपोर्ट (Order ID: ${orderId}) तैयार है। ₹151 शुल्क हेतु कृपया UPI/QR भेजें।`,
          `Pranam, my Muhurat report (Order ID: ${orderId}) is ready. Please share UPI/QR for the ₹151 payment.`)
    )}`;

    return (
        <div className="container section" style={{ maxWidth: '780px' }}>
            {isAdminView && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} /> {t('एडमिन दृश्य सक्रिय', 'Admin view active')}
                </div>
            )}
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                <h1 className="section-title">{order.categoryLabel ? (t(order.categoryLabel.nameHi, order.categoryLabel.nameEn)) : t('शुभ मुहूर्त रिपोर्ट', 'Shubh Muhurat Report')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{t('के लिए', 'for')} {order.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID: {orderId}</p>
            </div>

            {order.matches.length === 0 ? (
                <p className="text-center">{t('इस अवधि में कोई शुभ तिथि नहीं मिली — कृपया अवधि बढ़ाएं।', 'No auspicious dates found in this period - please try a longer range.')}</p>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {order.matches.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                            <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 700 }}>{new Date(m.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{m.tithi} · {m.nakshatra} · {m.vara}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '2.5rem', textAlign: 'center', background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-700)', marginBottom: '0.5rem' }}>₹151</div>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {t('इस मुहूर्त-सेवा का शुल्क — विस्तृत, व्यक्तिगत परामर्श एवं मुहूर्त-पुष्टि हेतु डॉ. उमंग नाथ शर्मा से WhatsApp पर संपर्क करें।', "The fee for this Muhurat service - for detailed, personalized consultation and confirmation, contact Dr. Umang Nath Sharma on WhatsApp.")}
                </p>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                    <MessageCircle size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                    {t('₹151 भुगतान हेतु WhatsApp करें', 'Pay ₹151 via WhatsApp')}
                </a>
            </div>
        </div>
    );
}
