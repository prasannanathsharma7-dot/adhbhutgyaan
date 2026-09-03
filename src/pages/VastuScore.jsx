import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { calculateVastuScore, getRemedy, DIRECTIONS, DIRECTION_LABEL_HI, DIRECTION_LABEL_EN, ROOM_RULES } from '../utils/vastuEngine';
import { Compass, MessageCircle, Lock, CheckCircle2, AlertTriangle, MinusCircle, RefreshCw } from 'lucide-react';

const TIER_ICON = { ideal: CheckCircle2, acceptable: MinusCircle, avoid: AlertTriangle, neutral: MinusCircle };
const TIER_COLOR = { ideal: '#16a34a', acceptable: '#ca8a04', avoid: '#dc2626', neutral: 'var(--text-secondary)' };

export default function VastuScore() {
    const { t, lang } = useLanguage();
    const DIRECTION_LABEL = lang === 'hi' ? DIRECTION_LABEL_HI : DIRECTION_LABEL_EN;
    const [placements, setPlacements] = useState({ mainDoor: '', kitchen: '', poojaRoom: '', masterBedroom: '', toilet: '' });
    const [result, setResult] = useState(null);

    useSEO({
        title: t('AI वास्तु स्कोर — अपने घर का निःशुल्क वास्तु विश्लेषण | Adhbhut Gyaan', 'Vastu Score — Free Instant Vastu Analysis for Your Home | Adhbhut Gyaan'),
        description: t('मुख्य द्वार, रसोई, पूजा घर, शयन कक्ष एवं शौचालय की दिशा बताएं — तुरंत शास्त्रोक्त वास्तु स्कोर एवं उपाय प्राप्त करें।', "Tell us your Main Door, Kitchen, Pooja Room, Bedroom, and Toilet directions - get an instant, scripturally-grounded Vastu score and remedies."),
        path: '/vastu-score',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Vastu Score', path: '/vastu-score' }])),
    });

    const allFilled = Object.values(placements).every(Boolean);

    const handleCalculate = () => {
        if (!allFilled) return;
        setResult(calculateVastuScore(placements));
    };

    const handleReset = () => {
        setPlacements({ mainDoor: '', kitchen: '', poojaRoom: '', masterBedroom: '', toilet: '' });
        setResult(null);
    };

    const whatsappUrl = `https://wa.me/919278148269?text=${encodeURIComponent(t(
        `प्रणाम, मुझे अपने घर का विस्तृत 100-पॉइंट वास्तु ऑडिट चाहिए।\nमेरा वास्तु स्कोर: ${result?.percentage}%\n${Object.entries(placements).map(([k, v]) => `${ROOM_RULES[k].nameHi}: ${DIRECTION_LABEL_HI[v]}`).join('\n')}`,
        `Pranam, I would like a detailed 100-point Vastu audit for my home.\nMy Vastu Score: ${result?.percentage}%\n${Object.entries(placements).map(([k, v]) => `${ROOM_RULES[k].nameEn}: ${DIRECTION_LABEL_EN[v]}`).join('\n')}`
    ))}`;

    return (
        <div>
            <section className="hero" style={{ minHeight: '38vh', background: 'var(--navy-950)' }}>
                <div className="container text-center" style={{ position: 'relative', zIndex: 2, padding: '3rem 0' }}>
                    <span className="section-label" style={{ justifyContent: 'center', color: 'var(--gold-400)' }}>
                        <Compass size={14} style={{ marginRight: '0.4rem' }} />{t('वास्तु स्कोर', 'Vastu Score')}
                    </span>
                    <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', margin: '0.5rem 0' }}>
                        {t('अपने घर का निःशुल्क वास्तु स्कोर पाएं', "Get Your Home's Free Vastu Score")}
                    </h1>
                    <p style={{ color: 'var(--warm-200)', maxWidth: '620px', margin: '0 auto' }}>
                        {t('मुख्य द्वार, रसोई, पूजा घर, शयन कक्ष एवं शौचालय की दिशा बताएं — शास्त्रोक्त वास्तु नियमों पर आधारित तुरंत विश्लेषण।', "Tell us the direction of your Main Door, Kitchen, Pooja Room, Bedroom, and Toilet - get an instant analysis based on classical Vastu Shastra principles.")}
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container" style={{ maxWidth: 640 }}>
                    {!result ? (
                        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                            {Object.entries(ROOM_RULES).map(([roomKey, rule]) => (
                                <div className="form-group" key={roomKey}>
                                    <label className="form-label">{lang === 'hi' ? rule.nameHi : rule.nameEn}</label>
                                    <select
                                        className="form-select"
                                        value={placements[roomKey]}
                                        onChange={e => setPlacements(p => ({ ...p, [roomKey]: e.target.value }))}
                                    >
                                        <option value="">{t('दिशा चुनें', 'Select direction')}</option>
                                        {DIRECTIONS.map(d => (
                                            <option key={d} value={d}>{DIRECTION_LABEL[d]}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                disabled={!allFilled}
                                onClick={handleCalculate}
                                style={{ width: '100%', justifyContent: 'center', opacity: allFilled ? 1 : 0.5, marginTop: '0.5rem' }}
                            >
                                <Compass size={16} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                                {t('मेरा वास्तु स्कोर देखें', 'Calculate My Vastu Score')}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="text-center" style={{ marginBottom: '1.75rem' }}>
                                <div style={{ fontSize: '3.2rem', fontWeight: 800, color: result.percentage >= 70 ? '#16a34a' : result.percentage >= 40 ? '#ca8a04' : '#dc2626' }}>
                                    {result.percentage}%
                                </div>
                                <p style={{ color: 'var(--text-secondary)' }}>{t('आपका वास्तु स्कोर (मूल विश्लेषण)', 'Your Vastu Score (Basic Analysis)')}</p>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.75rem' }}>
                                {result.results.map(r => {
                                    const Icon = TIER_ICON[r.tier];
                                    return (
                                        <div key={r.roomKey} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                                            <Icon size={20} style={{ color: TIER_COLOR[r.tier], flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lang === 'hi' ? ROOM_RULES[r.roomKey].nameHi : ROOM_RULES[r.roomKey].nameEn}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{DIRECTION_LABEL[r.direction]} — {t({ ideal: 'आदर्श', acceptable: 'स्वीकार्य', avoid: 'दोषपूर्ण', neutral: 'सामान्य' }[r.tier], { ideal: 'Ideal', acceptable: 'Acceptable', avoid: 'Defect', neutral: 'Neutral' }[r.tier])}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ position: 'relative', marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
                                <div aria-hidden="true" style={{ filter: 'blur(6px)', opacity: 0.55, padding: '1.5rem', pointerEvents: 'none', userSelect: 'none' }}>
                                    <h3 style={{ margin: '0 0 0.75rem' }}>{t('विस्तृत 100-पॉइंट वास्तु ऑडिट', 'Detailed 100-Point Vastu Audit')}</h3>
                                    {result.results.filter(r => r.tier !== 'ideal').map(r => (
                                        <p key={r.roomKey} style={{ margin: '0 0 0.5rem' }}>{getRemedy(r.roomKey, lang)}</p>
                                    ))}
                                </div>
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,17,15,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem' }}>
                                    <Lock size={26} style={{ color: 'var(--gold-400)', marginBottom: '0.6rem' }} />
                                    <h3 style={{ color: 'white', margin: '0 0 0.4rem', fontSize: '1.1rem' }}>{t('विस्तृत 100-पॉइंट वास्तु ऑडिट', 'Detailed 100-Point Vastu Audit')}</h3>
                                    <p style={{ color: 'var(--warm-200)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 0 1.1rem' }}>
                                        {t('प्रत्येक दोष हेतु विस्तृत उपाय, यंत्र-स्थापना एवं व्यक्तिगत परामर्श — ₹499 - ₹999', 'Detailed remedies for each defect, yantra placement guidance, and a personal consultation - ₹499 - ₹999')}
                                    </p>
                                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg" style={{ whiteSpace: 'normal', maxWidth: '100%' }}>
                                        <MessageCircle size={17} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                                        {t('विस्तृत ऑडिट हेतु WhatsApp करें', 'Get Detailed Audit via WhatsApp')}
                                    </a>
                                </div>
                            </div>

                            <button type="button" className="btn btn-outline-dark" onClick={handleReset} style={{ width: '100%', justifyContent: 'center' }}>
                                <RefreshCw size={15} style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />
                                {t('दोबारा गणना करें', 'Recalculate')}
                            </button>
                        </div>
                    )}
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                        {t('* यह विश्लेषण 5 प्रमुख कक्षों पर आधारित सामान्य मार्गदर्शन है, संपूर्ण 16-ज़ोन शास्त्रोक्त गणना नहीं — सटीक एवं व्यक्तिगत विश्लेषण हेतु परामर्श लें।', '* This is general guidance based on 5 key rooms, not a full 16-zone classical calculation - consult for a precise, personalized analysis.')}
                    </p>
                </div>
            </section>
        </div>
    );
}
