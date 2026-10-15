import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';
import { WHATSAPP_DISPLAY } from '../config/contact';

// The notice's version lives in src/config/privacy.js (shown below, recorded with consent).

// scripts/test-privacy.mjs checks this text against the code: every third-party service the backend or the
// browser actually calls must be named here, and the old statements that were no longer true must be gone.
const SECTIONS = [
    {
        h: ['हम कौन हैं', 'Who we are'],
        p: [[
            'अद्भुत ज्ञान काशी (वाराणसी) में डॉ. उमंग नाथ शर्मा के परिवार द्वारा संचालित पूजा, पाठ एवं ज्योतिष सेवा है। पता: J11/19, नाटी इमली रोड, ईश्वरगंगी, वाराणसी 221001।',
            'Adhbhut Gyaan is the pooja, paath and astrology service run by Dr. Umang Nath Sharma\u2019s family in Kashi (Varanasi). Address: J11/19, Nati Imli Road, Ishwargangi, Varanasi 221001.',
        ]],
    },
    {
        h: ['हम क्या जानकारी लेते हैं और कब', 'What we collect, and when'],
        ul: [
            ['बुकिंग / पूछताछ फ़ॉर्म: नाम, मोबाइल, ईमेल (वैकल्पिक), सेवा, माध्यम, पसंदीदा तिथि/समय, पता तथा जन्म तिथि (यदि आप दें), टिप्पणी, भाषा, और आप हमारी साइट तक कैसे पहुँचे (UTM / रेफ़रर / पेज)। यह हमारे डेटाबेस में सहेजा जाता है और हमारी टीम को ईमेल/WhatsApp सूचना के रूप में जाता है।',
             'Booking / enquiry form: name, mobile, email (optional), service, mode, preferred date and slot, address and date of birth (if you give them), notes, language, and how you reached our site (UTM / referrer / landing page). It is saved in our database and sent to our team as an email / WhatsApp notification.'],
            ['संपर्क फ़ॉर्म: नाम, फ़ोन, ईमेल, विषय, संदेश — सहेजा जाता है और हमें ईमेल किया जाता है।',
             'Contact form: name, phone, email, subject and message - saved and emailed to us.'],
            ['निःशुल्क कुंडली: नाम, जन्म तिथि/समय/स्थान तथा वैकल्पिक लिंग/प्रश्न से आपकी कुंडली आपके ब्राउज़र में गणना होती है। जब तक आप “मुझसे संपर्क करें” का बॉक्स टिक नहीं करते, कुछ भी सहेजा नहीं जाता। टिक करने पर नाम, फ़ोन, ईमेल, जन्म विवरण, कुंडली का सार तथा आपका प्रश्न हमारे डेटाबेस में सहेजा जाता है और हमारी टीम को भेजा जाता है। PDF डाउनलोड करने पर ये विवरण सुरक्षित (HTTPS) रूप से हमारे सर्वर को भेजे जाते हैं, PDF बनाने में उपयोग होते हैं और सहेजे नहीं जाते।',
             'Free Kundli: your name, birth date / time / place and optional gender / question are used to calculate your kundli in your browser. Nothing is saved unless you tick the \u201ccontact me\u201d box. If you tick it, your name, phone, email, birth details, a summary of the chart and your question are saved in our database and sent to our team. If you download the PDF, these details are sent to our server over HTTPS, used to build the PDF, and not stored.'],
            ['समीक्षाएँ: नाम, फ़ोन, रेटिंग, समीक्षा, सेवा और शहर (वैकल्पिक)। स्वीकृति के बाद केवल नाम, शहर, रेटिंग, सेवा और समीक्षा-पाठ सार्वजनिक दिखाया जाता है; फ़ोन नहीं।',
             'Reviews: name, phone, rating, review text, service and city (optional). After approval only the name, city, rating, service and text are shown publicly - never the phone number.'],
            ['शुभ मुहूर्त रिपोर्ट: नाम, फ़ोन, स्थान तथा चुने गए विकल्प। न्यूज़लेटर: ईमेल।',
             'Shubh Muhurat reports: name, phone, location and the options you chose. Newsletter: email address.'],
            ['WhatsApp सहायक: यदि आप हमारे WhatsApp नंबर पर संदेश भेजते हैं, तो आपका नंबर, संदेश और उत्तर Meta के WhatsApp Cloud API तथा AI सेवाओं से संसाधित होते हैं, और संदर्भ बनाए रखने के लिए हाल की बातचीत (अधिकतम 20 संदेश) हमारे डेटाबेस में रखी जाती है। वेबसाइट चैट के संदेश उत्तर बनाने हेतु AI सेवाओं को भेजे जाते हैं।',
             'WhatsApp assistant: if you message our WhatsApp number, your number, messages and the replies are processed through Meta\u2019s WhatsApp Cloud API and AI services, and recent conversation history (up to 20 messages) is kept in our database to keep context. Messages typed into the website chat are sent to AI services to produce a reply.'],
            ['तकनीकी: दुरुपयोग रोकने हेतु आपका IP पता थोड़े समय के लिए गिना जाता है और अपने-आप मिट जाता है; भाषा-पसंद केवल आपके ब्राउज़र में रहती है। स्थान खोजते समय (जन्म-स्थान / शहर) आपका लिखा नाम OpenStreetMap (Nominatim) को निर्देशांक खोजने हेतु भेजा जाता है। वीडियो पृष्ठ पर YouTube वीडियो खुलने पर YouTube अपनी कुकीज़ लगा सकता है।',
             'Technical: to stop abuse, your IP address is counted for a short time and deleted automatically; your language choice stays in your browser only. When you search for a place (birth place / city) the text you type is sent to OpenStreetMap (Nominatim) to find coordinates. On the Videos page, YouTube may set its own cookies when its videos load.'],
        ],
    },
    {
        h: ['हम इसका उपयोग क्यों करते हैं', 'Why we use it'],
        p: [[
            'आपकी पूछताछ का उत्तर देने, पूजा/परामर्श सेवा देने, कुंडली व पंचांग की गणना करने, दुरुपयोग रोकने और अपनी सेवा सुधारने के लिए। हम आपकी जानकारी बेचते नहीं हैं। इस साइट पर विज्ञापन या तीसरे-पक्ष के विश्लेषण (analytics) ट्रैकर नहीं हैं।',
            'To answer your enquiry, deliver the pooja / consultation, calculate your kundli and panchang, prevent abuse, and improve the service. We do not sell your information. This site has no advertising or third-party analytics trackers.',
        ]],
    },
    {
        h: ['कौन-सी सेवाएँ आपकी जानकारी संसाधित करती हैं', 'Who processes it for us'],
        p: [[
            'वेबसाइट होस्टिंग: Vercel। बैकएंड: Google Cloud। डेटाबेस: MongoDB होस्टिंग सेवा। ईमेल सूचना: Google (Gmail)। AI उत्तर: Google Gemini और Anthropic। WhatsApp: Meta। स्थान खोज: OpenStreetMap। वीडियो: YouTube। इनमें से कुछ सेवाएँ भारत से बाहर डेटा संसाधित कर सकती हैं।',
            'Website hosting: Vercel. Backend: Google Cloud. Database: a MongoDB hosting service. Email notifications: Google (Gmail). AI replies: Google Gemini and Anthropic. WhatsApp: Meta. Place search: OpenStreetMap. Video: YouTube. Some of these services may process data outside India.',
        ]],
    },
    {
        h: ['हम कितने समय तक रखते हैं', 'How long we keep it'],
        p: [[
            'पूछताछ और बुकिंग रिकॉर्ड तब तक रखे जाते हैं जब तक वे आपकी सेवा और हमारे व्यावसायिक रिकॉर्ड के लिए आवश्यक हैं; आपके कहने पर हम उन्हें हटा देते हैं (जब तक कानूनन रखना आवश्यक न हो)। हमारी टीम को भेजी गई जो सूचना पहुँच न सके, वह पुनः प्रयास हेतु कतार में तब तक रहती है जब तक पहुँच न जाए या बार-बार विफल न हो जाए। IP की दुरुपयोग-रोक गिनती अल्प अवधि बाद अपने-आप मिट जाती है।',
            'Enquiry and booking records are kept for as long as they are needed to serve you and for our business records, and we delete them when you ask (unless the law requires us to keep them). A notification to our team that could not be delivered stays in a retry queue until it is delivered or has failed repeatedly. The IP counters used to stop abuse expire automatically after a short window.',
        ]],
    },
    {
        h: ['आपके विकल्प', 'Your choices'],
        p: [[
            'आप कभी भी अपनी जानकारी देखने, सुधारने या हटाने का अनुरोध कर सकते हैं, और “संपर्क करें” की सहमति वापस ले सकते हैं। नीचे दिए गए WhatsApp या ईमेल पर लिखें; हम यथाशीघ्र उत्तर देंगे।',
            'You can ask us at any time to show, correct or delete your information, and withdraw your \u201ccontact me\u201d consent. Write to us on WhatsApp or by email below and we will reply as soon as we can.',
        ]],
    },
    {
        h: ['संवेदनशील जानकारी एवं सुरक्षा', 'Sensitive information and security'],
        p: [[
            'जन्म विवरण तथा स्वास्थ्य, विवाह या आर्थिक प्रश्न निजी हो सकते हैं — केवल वही साझा करें जिसमें आप सहज हों। हम इन्हें केवल आपकी कुंडली/परामर्श के लिए उपयोग करते हैं। साइट HTTPS पर चलती है और प्रशासनिक पहुँच गुप्त कुंजियों से सीमित है; फिर भी कोई प्रणाली पूर्णतः सुरक्षित नहीं होती।',
            'Birth details and questions about health, marriage or money can be personal - share only what you are comfortable with. We use them only for your kundli / consultation. The site runs over HTTPS and administrative access is limited by secret keys; still, no system is perfectly secure.',
        ]],
    },
];

export default function Privacy() {
    const { t } = useLanguage();

    useSEO({
        title: t('गोपनीयता नीति | Adhbhut Gyaan', 'Privacy Policy | Adhbhut Gyaan'),
        description: t('अद्भुत ज्ञान वेबसाइट, पूजा बुकिंग, निःशुल्क कुंडली एवं WhatsApp सहायक के उपयोग पर आपकी जानकारी कैसे एकत्र, उपयोग व सुरक्षित की जाती है।', 'How Adhbhut Gyaan collects, uses and protects your information when you use the website, book a pooja, generate a free kundli or use the WhatsApp assistant.'),
        path: '/privacy',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Privacy Policy', path: '/privacy' },
        ])),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('गोपनीयता नीति', 'Privacy Policy')}</span></div>
                    <h1>{t('गोपनीयता नीति', 'Privacy Policy')}</h1>
                    <p className="subtitle">{t('संस्करण 2.0 · अंतिम अद्यतन: 14 अक्टूबर 2026', 'Version 2.0 · Last updated: 14 October 2026')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ maxWidth: 780 }}>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                        {SECTIONS.map(({ h, p, ul }) => (
                            <div key={h[1]}>
                                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>{t(h[0], h[1])}</h2>
                                {p && p.map((para, i) => <p key={i} style={{ marginBottom: '1rem' }}>{t(para[0], para[1])}</p>)}
                                {ul && <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>{ul.map((li, i) => <li key={i} style={{ marginBottom: '0.7rem' }}>{t(li[0], li[1])}</li>)}</ul>}
                            </div>
                        ))}
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '0.75rem' }}>{t('संपर्क करें', 'Contact us')}</h2>
                        <p>
                            {t('गोपनीयता संबंधी किसी भी प्रश्न या अनुरोध के लिए:', 'For any privacy question or request:')}<br />
                            <strong>WhatsApp:</strong> {WHATSAPP_DISPLAY}<br />
                            <strong>Email:</strong> astrokashi369@gmail.com
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
