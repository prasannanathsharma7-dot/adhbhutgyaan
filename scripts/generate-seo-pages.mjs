// Runs after `vite build`. Vite already produced dist/index.html with the
// full built <head> (hashed CSS/JS asset links, static LocalBusiness/Person/
// WebSite JSON-LD, etc). For each known route we clone that file and swap in
// route-specific <title>/<meta description>/canonical/OG/Twitter tags plus an
// extra JSON-LD block (BreadcrumbList, FAQPage, BlogPosting...), then write it
// to dist/<route>/index.html.
//
// Why: this is a client-rendered SPA, so useSEO() only updates the <head>
// AFTER React runs (inside a useEffect). Googlebot mostly copes with that,
// but Bing and non-JS scrapers (WhatsApp/Facebook link previews, etc.) only
// ever see the raw HTML — which without this script would be the same
// homepage title/description on every single page. Because Vercel serves a
// matching static file before falling back to the SPA rewrite (see
// vercel.json), a direct visit or crawl of /services now gets a real,
// unique <head> immediately; once the JS bundle loads, React Router takes
// over and useSEO keeps things in sync for client-side navigation as before.
//
// This only touches <head> metadata - it does not server-render the actual
// page content, so it's a lower-risk, incremental step rather than full SSR.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://www.adhbhutgyaan.com';

if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[seo-pages] dist/index.html not found - skipping (did `vite build` run first?)');
    process.exit(0);
}

const template = readFileSync(join(DIST, 'index.html'), 'utf-8');
const blogData = JSON.parse(readFileSync(join(ROOT, 'src/data/blog.json'), 'utf-8'));
const servicesData = JSON.parse(readFileSync(join(ROOT, 'src/data/services.json'), 'utf-8'));

function breadcrumbJsonLd(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: `${SITE_URL}${it.path}`,
        })),
    };
}

function faqJsonLd(items) {
    return {
        '@type': 'FAQPage',
        mainEntity: items.map(it => ({
            '@type': 'Question',
            name: it.q,
            acceptedAnswer: { '@type': 'Answer', text: it.a },
        })),
    };
}

function serviceJsonLd(service) {
    return {
        '@type': 'Service',
        serviceType: service.name,
        name: service.name,
        description: service.description,
        provider: { '@type': 'HinduTemple', name: 'Adhbhut Gyaan', url: `${SITE_URL}/` },
        areaServed: ['Varanasi', 'Kashi', 'Banaras', 'India', 'Worldwide (online)'],
        offers: (service.packages || []).map(pkg => ({
            '@type': 'Offer',
            name: pkg.name,
            description: pkg.includes,
            availability: 'https://schema.org/InStock',
        })),
    };
}

function combineJsonLd(...blocks) {
    const graph = blocks.filter(Boolean).map(({ '@context': _drop, ...rest }) => rest);
    if (graph.length === 0) return null;
    return { '@context': 'https://schema.org', '@graph': graph };
}

// Escapes text for safe insertion into an HTML attribute/text node.
function esc(str) {
    return (str || '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderPage(route) {
    const { path, title, description, image, jsonLd } = route;
    const canonical = `${SITE_URL}${path}`;
    const ogImage = image || `${SITE_URL}/images/og-image.jpg`;

    let html = template;

    html = html.replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`);
    html = html.replace(/(<meta name="title" content=")[^"]*(")/, `$1${esc(title)}$2`);
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`);
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
    html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogImage}$2`);
    html = html.replace(/(<meta property="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
    html = html.replace(/(<meta property="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
    html = html.replace(/(<meta property="twitter:url" content=")[^"]*(")/, `$1${canonical}$2`);
    html = html.replace(/(<meta property="twitter:image" content=")[^"]*(")/, `$1${ogImage}$2`);

    if (jsonLd) {
        const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`;
        html = html.replace('</head>', script);
    }

    const outDir = path === '/' ? DIST : join(DIST, path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html);
    console.log(`[seo-pages] wrote ${join(outDir === DIST ? '' : path, 'index.html')}`);
}

// ---- Static routes (Hindi is the site's default language) ----
const routes = [
    {
        path: '/services',
        title: 'Pooja & Astrology Services in Kashi, Varanasi | हमारी पूजा सेवाएं | Adhbhut Gyaan',
        description: 'Book authentic pooja in Kashi, Varanasi - Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh & 10+ more Vedic services by Pt. Umang Nath Sharma.',
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
            faqJsonLd([
                { q: 'पूजा बुक करने के लिए क्या मुझे वाराणसी आना जरूरी है?', a: 'नहीं, हमारी अधिकतर पूजाएं ऑनलाइन (लाइव वीडियो के साथ) भी करवाई जा सकती हैं। आप विदेश में रहकर भी अपने नाम व गोत्र से पूजा करवा सकते हैं।' },
                { q: 'पूजा की कीमत में क्या शामिल है?', a: 'पूजा मूल्य में सम्पूर्ण पूजन सामग्री, अनुभवी पंडितों की दक्षिणा और हवन (जहाँ लागू हो) शामिल है। कोई छुपा हुआ शुल्क नहीं है।' },
                { q: 'बुकिंग की पुष्टि कैसे होती है?', a: 'बुकिंग फॉर्म भरने के बाद हमारी टीम WhatsApp या कॉल के माध्यम से 24 घंटे के भीतर आपसे संपर्क कर तारीख व विवरण पक्का करती है।' },
            ])
        ),
    },
    {
        path: '/booking',
        title: 'पूजा बुक करें | Adhbhut Gyaan',
        description: '4 सरल चरणों में अपनी पूजा बुक करें — सेवा चुनें, पैकेज चुनें, विवरण भरें, और WhatsApp पर पुष्टि करें।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Book a Pooja', path: '/booking' }])),
    },
    {
        path: '/free-kundli',
        title: 'फ्री कुंडली — निःशुल्क जन्म कुंडली एवं जन्म पत्रिका ऑनलाइन | Adhbhut Gyaan',
        description: 'जन्म तिथि, समय व स्थान से मुफ्त जन्म कुंडली बनाएं — लग्न चार्ट, ग्रह स्थिति एवं दोष विश्लेषण तुरंत, काशी के ज्योतिषी डॉ. उमंग नाथ शर्मा द्वारा।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Free Kundli', path: '/free-kundli' }])),
    },
    {
        path: '/panchang',
        title: 'आज का पंचांग | शुभ मुहूर्त, राहु काल एवं चौघड़िया — Universal Dynamic Ephemeris | Adhbhut Gyaan',
        description: 'विश्व के किसी भी नगर हेतु आज का पंचांग एवं शुभ मुहूर्त: सूर्योदय-सूर्यास्त, तिथि, नक्षत्र, अभिजित मुहूर्त, राहु काल एवं चौघड़िया की वास्तविक समय गणना।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Daily Panchang', path: '/panchang' }])),
    },
    {
        path: '/horoscope',
        title: 'राशिफल — आज का राशिफल, दैनिक एवं मासिक राशिफल | Adhbhut Gyaan',
        description: 'सभी 12 राशियों का आज का राशिफल, साप्ताहिक व मासिक राशिफल — करियर, धन, स्वास्थ्य एवं प्रेम पर काशी के ज्योतिषी डॉ. उमंग नाथ शर्मा का मार्गदर्शन।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Horoscope', path: '/horoscope' }])),
    },
    {
        path: '/about',
        title: 'हमारे बारे में — शर्मा परिवार की विरासत | Adhbhut Gyaan',
        description: '400+ वर्षों की वैदिक परंपरा, तीन पीढ़ियों की गाथा — महामहोपाध्याय पं. अयोध्या नाथ शर्मा से डॉ. उमंग नाथ शर्मा तक।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }])),
    },
    {
        path: '/pt-umang-nath-sharma',
        title: 'डॉ. उमंग नाथ शर्मा — काशी के ज्योतिषाचार्य | Adhbhut Gyaan',
        description: 'डॉ. उमंग नाथ शर्मा — 400+ वर्षों की काशी वैदिक परंपरा के तीसरी पीढ़ी के वाहक, मैरीलैंड स्टेट यूनिवर्सिटी (USA) से "डॉक्टर ऑफ एस्ट्रोलॉजी"। कुंडली विश्लेषण, ग्रह दोष निवारण एवं प्रामाणिक कर्मकांड।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Dr. Umang Nath Sharma', path: '/pt-umang-nath-sharma' }])),
    },
    {
        path: '/contact',
        title: 'संपर्क करें — काशी के पंडित जी | Adhbhut Gyaan',
        description: 'WhatsApp, फ़ोन या ईमेल से हमसे संपर्क करें — पूजा बुकिंग व ज्योतिष परामर्श हेतु, वाराणसी (काशी/बनारस), उत्तर प्रदेश।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Contact Us', path: '/contact' }])),
    },
    {
        path: '/blog',
        title: 'ब्लॉग — पूजा विधि व ज्योतिष ज्ञान | Adhbhut Gyaan',
        description: 'पूजा विधि, ज्योतिष उपाय और काशी के आध्यात्मिक ज्ञान से जुड़े विस्तृत लेख।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])),
    },
    {
        path: '/privacy',
        title: 'गोपनीयता नीति | Adhbhut Gyaan',
        description: 'हम आपकी जानकारी कैसे एकत्र और उपयोग करते हैं।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }])),
    },
    {
        path: '/terms',
        title: 'नियम एवं शर्तें | Adhbhut Gyaan',
        description: 'इस वेबसाइट के उपयोग की शर्तें।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }])),
    },
    {
        path: '/muhurat',
        title: 'शुभ मुहूर्त — विवाह, गृह प्रवेश, नामकरण, व्यापार | Adhbhut Gyaan',
        description: 'अपने जीवन के महत्वपूर्ण अवसर हेतु शास्त्रोक्त शुभ मुहूर्त प्राप्त करें — पंचांग-आधारित सटीक गणना, विवाह, गृह प्रवेश, नामकरण एवं व्यापार आरंभ हेतु।',
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Muhurat', path: '/muhurat' }]),
            faqJsonLd([
                { q: 'शुभ मुहूर्त कैसे निकाला जाता है?', a: 'तिथि, नक्षत्र, वार एवं शुभ योगों के शास्त्रोक्त संयोजन के आधार पर पंचांग-गणना द्वारा शुभ मुहूर्त निकाला जाता है।' },
                { q: 'क्या मुहूर्त रिपोर्ट WhatsApp पर मिल सकती है?', a: 'हां, फॉर्म भरने के बाद आपकी रिपोर्ट का एक स्थायी लिंक बनता है जिसे आप WhatsApp पर साझा या सहेज सकते हैं।' },
            ])
        ),
    },
    {
        path: '/vastu-score',
        title: 'AI वास्तु स्कोर — जल्द आ रहा है | Adhbhut Gyaan',
        description: 'अपने घर के 2D फ्लोर प्लान से 16-ज़ोन वास्तु स्कोर एवं उपाय प्राप्त करें — जल्द उपलब्ध। मुख्य द्वार की दिशा चुनें और तुरंत वास्तु विश्लेषण पाएं।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Vastu Score', path: '/vastu-score' }])),
    },
];

// ---- Blog posts (one route per post, from blog.json) ----
for (const post of blogData) {
    routes.push({
        path: `/blog/${post.id}`,
        title: `${post.title} | Adhbhut Gyaan`,
        description: post.excerpt,
        image: `${SITE_URL}/images/${post.image}`,
        jsonLd: combineJsonLd(
            {
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.excerpt,
                image: `${SITE_URL}/images/${post.image}`,
                datePublished: post.date,
                author: { '@type': 'Organization', name: 'Adhbhut Gyaan' },
                publisher: { '@type': 'Organization', name: 'Adhbhut Gyaan' },
                mainEntityOfPage: `${SITE_URL}/blog/${post.id}`,
            },
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: 'Blog', path: '/blog' },
                { name: post.title, path: `/blog/${post.id}` },
            ])
        ),
    });
}

// ---- Individual service pages (one route per pooja, from services.json) ----
// Each pooja gets its own indexable URL so it can rank independently for
// long-tail, service-specific searches (e.g. "rudrabhishek in kashi",
// "astrology in varanasi") instead of competing with the other 10 poojas on
// one /services page. Title/description are bilingual (English keyword
// phrase + Hindi name) since the site now defaults to English but the
// Devanagari service name still matters for Hindi-language searches.
for (const service of servicesData) {
    const isAstrology = service.id === 'astrology-consultation';
    const enDescription = isAstrology
        ? `Best Astrologer in Kashi, Varanasi - Dr. Umang Nath Sharma offers kundli analysis, dosh remedies, marriage matching, online or in person.`
        : `Book ${service.nameEn} in Kashi, Varanasi with Pt. Umang Nath Sharma - authentic Vedic pooja, available online or in person.`;

    routes.push({
        path: `/services/${service.id}`,
        title: isAstrology ? `Best Astrologer in Kashi, Varanasi | ${service.name} — Adhbhut Gyaan` : `${service.nameEn} in Kashi, Varanasi | ${service.name} — Adhbhut Gyaan`,
        description: enDescription,
        image: `${SITE_URL}/images/${service.image}`,
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: 'Services', path: '/services' },
                { name: service.name, path: `/services/${service.id}` },
            ]),
            serviceJsonLd(service),
            faqJsonLd([
                {
                    q: `${service.name} बुक करने के लिए क्या वाराणसी आना जरूरी है?`,
                    a: 'नहीं, यह पूजा ऑनलाइन (लाइव वीडियो के साथ) भी करवाई जा सकती है। आप विदेश में रहकर भी अपने नाम व गोत्र से पूजा करवा सकते हैं।',
                },
                {
                    q: `${service.name} की कीमत में क्या शामिल है?`,
                    a: 'पूजा मूल्य में सम्पूर्ण पूजन सामग्री, अनुभवी पंडितों की दक्षिणा और हवन (जहाँ लागू हो) शामिल है। कोई छुपा हुआ शुल्क नहीं है। अंतिम मूल्य पंडित जी WhatsApp/कॉल पर बताते हैं।',
                },
                {
                    q: 'पूजा में कितना समय लगता है?',
                    a: `${service.name} की अवधि पैकेज के अनुसार भिन्न होती है — बुकिंग के समय पंडित जी सही समय बता देंगे।`,
                },
                {
                    q: 'बुकिंग के बाद क्या होता है?',
                    a: 'बुकिंग फॉर्म भरने या WhatsApp पर पूछताछ करने के 24 घंटों के भीतर हमारी टीम आपसे तारीख, समय एवं मूल्य निश्चित करने हेतु सम्पर्क करेगी।',
                },
            ])
        ),
    });
}

// Note: /admin and /leave-a-review are intentionally skipped - both are
// already noindex + disallowed in robots.txt, so they don't need a
// crawler-facing static page.

for (const route of routes) {
    renderPage(route);
}

// ---- sitemap.xml, auto-generated from the SAME `routes` array above ----
// Previously a hand-maintained static file in public/ - real gap found:
// 5 already-shipped pages (/muhurat, /vastu-score, and 3 new service pages)
// were completely missing from it, since nothing enforced sitemap.xml
// staying in sync with actual routes. Deriving it from `routes` here makes
// that drift structurally impossible going forward - any route added to
// this file is automatically in the sitemap too.
const today = new Date().toISOString().slice(0, 10);
const PRIORITY_OVERRIDES = { '/': '1.0', '/services': '0.9', '/booking': '0.9', '/free-kundli': '0.9' };
const sitemapUrls = routes.map(r => {
    const priority = PRIORITY_OVERRIDES[r.path] || (r.path.startsWith('/services/') ? '0.8' : r.path.startsWith('/blog/') ? '0.6' : '0.7');
    const changefreq = r.path === '/' || r.path === '/panchang' || r.path === '/horoscope' ? 'daily' : r.path.startsWith('/blog/') ? 'monthly' : 'weekly';
    return `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
writeFileSync(join(ROOT, 'public', 'sitemap.xml'), sitemapXml);
writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml);
console.log(`[seo-pages] sitemap.xml regenerated with ${routes.length} URLs.`);

console.log(`[seo-pages] done - generated ${routes.length} static pages.`);
