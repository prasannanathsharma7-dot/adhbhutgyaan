import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { isValidPhone, PHONE_HELP_HI, PHONE_HELP_EN } from '../utils/phone';

const WA = '919278148269';
const INTERESTS = [
    { id: 'rudrabhishek', hi: 'रुद्राभिषेक', en: 'Rudrabhishek' },
    { id: 'shraddh_pind_daan', hi: 'श्राद्ध / पिंडदान', en: 'Shraddh / Pind Daan' },
    { id: 'online_sankalp', hi: 'ऑनलाइन लाइव संकल्प पूजा', en: 'Online live sankalp pooja' },
    { id: 'kundli_astrology', hi: 'कुंडली / ज्योतिष परामर्श', en: 'Kundli / astrology consultation' },
    { id: 'group_pooja', hi: 'ग्रुप पूजा', en: 'Group pooja' },
    { id: 'other', hi: 'अन्य', en: 'Other' },
];
const EMPTY = { name: '', agency: '', phone: '', email: '', city: '', registrationNo: '', groupsPerYear: '', interests: [], message: '', consent: false, website: '' };

export default function B2B() {
    const { t } = useLanguage();
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | saving | done | error
    const [reference, setReference] = useState('');

    useSEO({
        title: t('टूर ऑपरेटरों के लिए काशी अनुष्ठान पार्टनर | Adhbhut Gyaan', 'Kashi Ritual Partner Programme for Tour Operators | Adhbhut Gyaan'),
        description: t(
            'वाराणसी में ट्रैवल एजेंसियों एवं टूर ऑपरेटरों के लिए अनुष्ठान साझेदार — रुद्राभिषेक, श्राद्ध, पिंडदान एवं ऑनलाइन संकल्प पूजा। पार्टनर दरों हेतु आवेदन करें।',
            'Ground ritual partner in Varanasi for travel agencies and tour operators: Rudrabhishek, shraddh, pind daan and live sankalp poojas. Apply for partner rates.'
        ),
        path: '/b2b',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Partner Programme', path: '/b2b' }])),
    });

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
    const toggleInterest = (id) => set('interests', form.interests.includes(id) ? form.interests.filter(x => x !== id) : [...form.interests, id]);

    const validate = () => {
        const e = {};
        if (form.name.trim().length < 3) e.name = t('कृपया पूरा नाम लिखें', 'Please enter your full name');
        if (form.agency.trim().length < 2) e.agency = t('कृपया एजेंसी / कंपनी का नाम लिखें', 'Please enter your agency / company name');
        if (!isValidPhone(form.phone)) e.phone = t(PHONE_HELP_HI, PHONE_HELP_EN);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t('कृपया सही ईमेल लिखें', 'Please enter a valid email');
        if (!form.consent) e.consent = t('कृपया सहमति दें', 'Please tick to confirm');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (status === 'saving' || !validate()) return;
        setStatus('saving');
        try {
            const res = await fetch('/api/b2b/partner-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, utm: (typeof window !== 'undefined' ? window.location.search : '').replace(/^\?/, '').slice(0, 200) }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.ok) { setReference(data.reference || ''); setStatus('done'); setForm(EMPTY); }
            else {
                if (data && data.fields) setErrors(data.fields);
                setStatus('error');
            }
        } catch { setStatus('error'); }
    };

    const card = { background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-md)' };
    const steps = [
        { h: t('आवेदन', 'Apply'), p: t('नीचे का फ़ॉर्म भरें या WhatsApp करें।', 'Fill the form below or message us on WhatsApp.') },
        { h: t('समीक्षा एवं बातचीत', 'Review & call'), p: t('हमारी टीम आपकी एजेंसी की जानकारी देखकर आपसे संपर्क करती है।', 'Our team reviews your details and gets in touch.') },
        { h: t('पार्टनर दर सूची', 'Partner rate card'), p: t('स्वीकृति के बाद पार्टनर दरें व शर्तें साझा की जाती हैं।', 'After approval we share partner rates and terms.') },
        { h: t('बुकिंग एवं अनुष्ठान', 'Book & perform'), p: t('यजमान का नाम, गोत्र, तिथि व माध्यम WhatsApp पर भेजें; हम पुष्टि कर अनुष्ठान सम्पन्न कराते हैं।', 'Send guest name, gotra, date and mode on WhatsApp; we confirm and perform the ritual.') },
    ];

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('पार्टनर कार्यक्रम', 'Partner Programme')}</span></div>
                    <h1>{t('काशी अनुष्ठान पार्टनर कार्यक्रम', 'Kashi Ritual Partner Programme')}</h1>
                    <p className="subtitle">{t('ट्रैवल एजेंसियों एवं टूर ऑपरेटरों के लिए — वाराणसी में प्रामाणिक वैदिक अनुष्ठान', 'For travel agencies and tour operators - authentic Vedic rituals in Varanasi for your guests')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 960 }}>
                    <p style={{ fontSize: '1.02rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {t(
                            'आपके तीर्थयात्री काशी आते हैं तो अक्सर घाट पर अनजान पंडितों से मोल-भाव करना पड़ता है। अद्भुत ज्ञान काशी के एक विद्वान परिवार की सेवा है — हम रुद्राभिषेक, श्राद्ध-पिंडदान और अन्य अनुष्ठान तय दरों पर करवाते हैं, और जो अतिथि यात्रा नहीं कर सकते उनके लिए ऑनलाइन लाइव संकल्प पूजा भी।',
                            'Pilgrim groups arriving in Kashi often end up negotiating with unknown pandits at the ghats. Adhbhut Gyaan is the service of a Kashi family of scholars: we arrange Rudrabhishek, shraddh and pind daan and other rituals at clear rates - and live online sankalp poojas for guests who cannot travel.'
                        )}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { h: t('अनुष्ठान जो हम करवाते हैं', 'Rituals we arrange'), p: t('रुद्राभिषेक · त्रिपिंडी / पार्वण / तीर्थ श्राद्ध · नारायण बलि · कालसर्प शान्ति · गृह प्रवेश · भूमि पूजन · सत्यनारायण कथा · पाठ एवं जाप', 'Rudrabhishek · Tripindi / Parvan / Tirtha Shraddh · Narayan Bali · Kalsarp Shanti · Griha Pravesh · Bhoomi Pujan · Satyanarayan Katha · paath & jaap') },
                            { h: t('ऑनलाइन संकल्प', 'Online sankalp'), p: t('यजमान के नाम-गोत्र से पूजा, लाइव वीडियो के साथ — विदेश में रह रहे अतिथियों के लिए उपयोगी।', 'Pooja in the guest\'s name and gotra with a live video - useful for guests living abroad.') },
                            { h: t('पार्टनर दरें', 'Partner rates'), p: t('स्वीकृत एजेंसियों को पार्टनर दर सूची दी जाती है; आप अपनी मार्जिन के साथ अपने ग्राहकों को बेच सकते हैं। सार्वजनिक दरें', 'Approved agencies receive a partner rate card and can resell with their own margin. Public rates are on the') + ' ' },
                        ].map((c, i) => (
                            <div key={i} style={card}>
                                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.02rem' }}>{c.h}</h3>
                                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                                    {c.p}{i === 2 && <Link to="/price-list">{t('दर सूची पृष्ठ पर हैं।', 'Price List page.')}</Link>}
                                </p>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.8rem' }}>{t('यह कैसे काम करता है', 'How it works')}</h2>
                    <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem', padding: 0, margin: '0 0 1.2rem', listStyle: 'none' }}>
                        {steps.map((s, i) => (
                            <li key={i} style={{ ...card, padding: '1rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--gold-700)', fontSize: '0.8rem' }}>{t('चरण', 'STEP')} {i + 1}</div>
                                <div style={{ fontWeight: 600, margin: '0.15rem 0 0.3rem' }}>{s.h}</div>
                                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.p}</div>
                            </li>
                        ))}
                    </ol>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                        {t(
                            'ध्यान दें: हम अनुष्ठान करवाते हैं। मंदिर-प्रवेश, घाट/नाव की अनुमति और दर्शन-समय संबंधित मंदिर व प्राधिकरणों के नियंत्रण में हैं, इसलिए उनकी गारंटी नहीं दी जाती। तिथि व उपलब्धता की पुष्टि बुकिंग से पहले की जाती है।',
                            'Please note: we arrange the rituals. Temple entry, ghat or boat permissions and darshan timings are controlled by the temples and authorities, so they are not guaranteed. Date and availability are confirmed before booking.'
                        )}
                    </p>

                    <div id="partner-form" style={{ ...card, padding: 'clamp(1.1rem, 4vw, 2rem)' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.3rem' }}>{t('पार्टनर बनने हेतु आवेदन', 'Apply to become a partner')}</h2>
                        <p style={{ margin: '0 0 1.2rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t('आवेदन की समीक्षा की जाती है; स्वीकृति के बाद पार्टनर दरें साझा होंगी।', 'Applications are reviewed; partner rates are shared after approval.')}</p>

                        {status === 'done' ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ fontSize: '2.2rem' }}>🙏</div>
                                <h3 style={{ margin: '0.4rem 0' }}>{t('आवेदन प्राप्त हुआ', 'Application received')}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>
                                    {t('हमारी टीम समीक्षा कर आपसे संपर्क करेगी। यह स्वीकृति नहीं, केवल आवेदन की प्राप्ति की सूचना है।', 'Our team will review it and get in touch. This confirms we received your application - it is not an approval.')}
                                </p>
                                {reference && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('संदर्भ', 'Reference')}: <strong>{reference}</strong></p>}
                            </div>
                        ) : (
                            <form onSubmit={submit} noValidate>
                                {status === 'error' && <p role="alert" style={{ fontSize: '0.85rem', color: '#b3261e', marginBottom: '0.9rem' }}>{t('आवेदन भेजा नहीं जा सका। कृपया फ़ील्ड जाँचें या WhatsApp करें।', 'Could not submit. Please check the fields or message us on WhatsApp.')}</p>}

                                {/* honeypot: hidden from people, bots fill it */}
                                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                                    <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => set('website', e.target.value)} /></label>
                                </div>

                                {[
                                    ['name', t('आपका नाम', 'Your name'), 'text', 'name', true],
                                    ['agency', t('एजेंसी / कंपनी का नाम', 'Agency / company name'), 'text', 'organization', true],
                                    ['phone', t('मोबाइल (WhatsApp)', 'Mobile (WhatsApp)'), 'tel', 'tel', true],
                                    ['email', t('ईमेल', 'Email'), 'email', 'email', true],
                                    ['city', t('शहर', 'City'), 'text', 'address-level2', false],
                                    ['registrationNo', t('पंजीकरण / लाइसेंस नं. (वैकल्पिक, स्व-घोषित)', 'Registration / licence no. (optional, self-reported)'), 'text', 'off', false],
                                    ['groupsPerYear', t('वर्ष में लगभग कितने ग्रुप (वैकल्पिक)', 'Approx. groups per year (optional)'), 'text', 'off', false],
                                ].map(([k, label, type, ac, req]) => (
                                    <div className="form-group" key={k}>
                                        <label className="form-label" htmlFor={`b2b-${k}`}>{label}{req ? ' *' : ''}</label>
                                        <input
                                            id={`b2b-${k}`} type={type} autoComplete={ac}
                                            inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined}
                                            className={`form-input ${errors[k] ? 'has-error' : ''}`}
                                            aria-invalid={errors[k] ? 'true' : 'false'}
                                            value={form[k]} onChange={e => set(k, e.target.value)}
                                        />
                                        {errors[k] && <p className="form-error">⚠ {errors[k]}</p>}
                                    </div>
                                ))}

                                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
                                    <legend className="form-label">{t('किन में रुचि है?', 'Interested in')}</legend>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.1rem' }}>
                                        {INTERESTS.map(i => (
                                            <label key={i.id} style={{ fontSize: '0.88rem', display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                                                <input type="checkbox" checked={form.interests.includes(i.id)} onChange={() => toggleInterest(i.id)} /> {t(i.hi, i.en)}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="b2b-message">{t('संदेश (वैकल्पिक)', 'Message (optional)')}</label>
                                    <textarea id="b2b-message" className="form-textarea" value={form.message} onChange={e => set('message', e.target.value)} />
                                </div>

                                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.86rem', marginBottom: '0.3rem' }}>
                                    <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} style={{ marginTop: 3 }} />
                                    <span>{t('मैं सहमत हूँ कि इस आवेदन के संबंध में मुझसे संपर्क किया जाए। (', 'I agree to be contacted about this application. (')}<Link to="/privacy">{t('गोपनीयता नीति', 'Privacy Policy')}</Link>)</span>
                                </label>
                                {errors.consent && <p className="form-error">⚠ {errors.consent}</p>}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>{status === 'saving' ? t('भेजा जा रहा है…', 'Submitting…') : t('आवेदन भेजें', 'Submit application')}</button>
                                    <a className="btn btn-whatsapp" target="_blank" rel="noreferrer" href={`https://wa.me/${WA}?text=${encodeURIComponent('Namaste, I am a travel agency / tour operator interested in the Kashi Ritual Partner Programme. Please share details.')}`}>
                                        <MessageCircle size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />{t('WhatsApp पर पूछें', 'Ask on WhatsApp')}
                                    </a>
                                </div>
                            </form>
                        )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem' }}>
                        {t('हमारे बारे में अधिक जानें:', 'Learn more about us:')} <Link to="/pt-umang-nath-sharma">{t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')}</Link> · <Link to="/about">{t('हमारी विरासत', 'Our heritage')}</Link> · <Link to="/price-list">{t('दर सूची', 'Price List')}</Link>
                    </p>
                </div>
            </section>
        </div>
    );
}
