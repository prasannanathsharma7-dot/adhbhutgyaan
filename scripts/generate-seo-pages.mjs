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

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
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
const citiesData = JSON.parse(readFileSync(join(ROOT, 'src/data/cities.json'), 'utf-8'));

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

const STRUCTURED_AREA_SERVED = [
    { '@type': 'City', name: 'Varanasi' },
    { '@type': 'Country', name: 'India' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Place', name: 'Worldwide (Online Services)' },
];

function serviceJsonLd(service) {
    return {
        '@type': 'Service',
        serviceType: service.name,
        name: service.name,
        description: service.description,
        provider: { '@type': 'HinduTemple', name: 'Adhbhut Gyaan', url: `${SITE_URL}/` },
        areaServed: STRUCTURED_AREA_SERVED,
        hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '09:00',
            closes: '12:00',
            description: 'In-person pooja hours at the Varanasi location; online booking available 24/7.',
        },
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
// Titles longer than ~70 characters are cut off in search results. Prefer
// "primary | suffix", fall back to just the primary part when too long.
function capTitle(primary, suffix, max = 70) {
    const full = suffix ? `${primary} | ${suffix}` : primary;
    return full.length <= max ? full : primary;
}

function esc(str) {
    return (str || '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ---- Server-rendered HTML (src/entry-server.jsx -> dist-ssr/, built by `npm run build`) ----
// Each page's real markup is rendered here at build time and placed inside #root, so it is
// visible before any JavaScript arrives; the browser then hydrates it (src/main.jsx).
// A page whose server render reports any error is left un-rendered (the app then renders
// it client-side exactly as before) rather than shipping half a page.
if (template.includes('id="seo-prerender"') || !template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html was already processed by this script - run `vite build` first.');
}
const SSR_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.mjs');
const ssrRender = existsSync(SSR_ENTRY) ? (await import(pathToFileURL(SSR_ENTRY).href)).render : null;
const ssrFailures = [];
let ssrCount = 0;
async function ssrHtml(path) {
    if (!ssrRender) return '';
    try {
        const { html, errors } = await ssrRender(path);
        if (errors.length || !/<h1[\s>]/.test(html)) { ssrFailures.push(`${path}: ${errors[0] || 'no <h1> rendered'}`); return ''; }
        ssrCount++;
        return html;
    } catch (e) {
        ssrFailures.push(`${path}: ${String(e.message).slice(0, 100)}`);
        return '';
    }
}

// ---- Inline CSS, and de-prioritise JavaScript (pages are server-rendered) ----
// The one stylesheet used to be a separate render-blocking request: the browser had to download
// the HTML, discover the <link>, then fetch the CSS before painting anything (two sequential
// round trips - Lighthouse put the cost at ~900ms on a slow phone). Inlining it removes the
// second trip. Each page's HTML grows by the CSS size (~12KB compressed), which is fine here:
// after the first page, navigation is client-side and never re-downloads HTML.
// The JS bundles are marked low priority: the page is already visible from HTML + CSS, so the
// network should deliver the HTML, CSS, fonts and hero image first and hydration scripts next.
const CSS_FILE = ASSET_FILES_FOR_CSS();
function ASSET_FILES_FOR_CSS() { const f = readdirSync(join(DIST, 'assets')).find(n => /^index-.*\.css$/.test(n)); return f ? readFileSync(join(DIST, 'assets', f), 'utf-8') : ''; }
function withInlineCssAndLowPriorityJs(html) {
    if (CSS_FILE) html = html.replace(/<link rel="stylesheet"[^>]*href="\/assets\/index-[^"]+\.css"[^>]*>/, () => `<style>${CSS_FILE}</style>`);
    html = html.replace(/<script type="module"([^>]*)src="\/assets\//g, (m, mid) => (mid.includes('fetchpriority') ? m : `<script type="module"${mid}fetchpriority="low" src="/assets/`));
    html = html.replace(/<link rel="modulepreload"([^>]*)>/g, (m, mid) => (mid.includes('fetchpriority') ? m : `<link rel="modulepreload"${mid} fetchpriority="low">`));
    return html;
}

// ---- Font preloads ----
// Fonts are self-hosted and fingerprinted (e.g. poppins-latin-400-normal-AbC123.woff2),
// so the preload URLs can only be known after the build. Preloading just the few
// faces used above the fold lets the browser fetch them in parallel with the JS
// instead of discovering them only after CSS has been parsed.
const ASSET_FILES = readdirSync(join(DIST, 'assets'));
const FONT_PRELOADS = ['poppins-latin-400-normal', 'poppins-latin-600-normal', 'playfair-display-latin-700-normal']
    .map(n => ASSET_FILES.find(f => f.startsWith(n + '-') && f.endsWith('.woff2')))
    .filter(Boolean)
    .map(f => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin>`)
    .join('\n  ');
function withFontPreloads(html) {
    html = html.replace(/<link rel="preload" as="font"[^>]*>\s*/g, '');
    return html.replace('</head>', () => `  ${FONT_PRELOADS}\n</head>`);
}

// ---- Crawler-visible page text (see scripts/snapshot-content.mjs) ----
const fileKeyFor = (p) => (p === '/' ? 'index' : p.replace(/^\//, '').replace(/\//g, '__'));
const SITE_NAV = `<nav aria-label="Site"><a href="/">Home</a> <a href="/services">Services</a> <a href="/booking">Book Pooja</a> <a href="/about">About</a> <a href="/blog">Blog</a> <a href="/contact">Contact</a> <a href="/panchang">Daily Panchang</a> <a href="/horoscope">Horoscope</a> <a href="/free-kundli">Free Kundli</a> <a href="/muhurat">Shubh Muhurat</a> <a href="/vastu-score">Vastu Score</a> <a href="/pandit-for-pooja">Cities We Serve</a> ${servicesData.map(s => `<a href="/services/${s.id}">${esc(s.nameEn)}</a>`).join(' ')}</nav>`;
async function withPrerender(html, path) {
    // Idempotent: drop any block from an earlier run (it contains no nested <div>s).
    html = html.replace(/\n?<div id="seo-prerender">[\s\S]*?<\/div>/, '');
    const ssr = await ssrHtml(path);
    const file = join(ROOT, 'prerender', fileKeyFor(path) + '.html');
    let extra = existsSync(file) ? readFileSync(file, 'utf-8') : '';
    // The visible server-rendered page is English, so the hidden crawler block only needs to
    // add what the page does not already show: the Hindi text (and the site-wide link list).
    if (ssr) extra = (extra.match(/<section lang="hi">[\s\S]*?<\/section>/) || [''])[0];
    if (!ssr && !extra) return html;
    const block = `<div id="root">${ssr}</div>\n<div id="seo-prerender">${SITE_NAV}\n${extra}</div>`;
    return html.replace('<div id="root"></div>', () => block);
}

async function renderPage(route) {
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

    html = withInlineCssAndLowPriorityJs(withFontPreloads(await withPrerender(html, path)));

    const outDir = path === '/' ? DIST : join(DIST, path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html);
    console.log(`[seo-pages] wrote ${join(outDir === DIST ? '' : path, 'index.html')}`);
}

// ---- Static routes (Hindi is the site's default language) ----
const routes = [
    {
        path: '/services',
        title: 'Pooja & Astrology Services in Kashi, Varanasi | Adhbhut Gyaan',
        description: 'Book authentic pooja in Kashi, Varanasi - Rudrabhishek, Kalsarp Dosh Nivaran, Tripindi Shradh & 10+ more Vedic services by Pt. Umang Nath Sharma.',
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
            faqJsonLd([
                { q: 'पूजा बुक करने के लिए क्या मुझे वाराणसी आना जरूरी है?', a: 'नहीं, हमारी अधिकतर पूजाएं ऑनलाइन (लाइव वीडियो के साथ) भी करवाई जा सकती हैं। आप विदेश में रहकर भी अपने नाम व गोत्र से पूजा करवा सकते हैं।' },
                { q: 'पूजा की कीमत में क्या शामिल है?', a: 'पूजा मूल्य में सम्पूर्ण पूजन सामग्री, अनुभवी पंडितों की दक्षिणा और हवन (जहाँ लागू हो) शामिल है। कोई छुपा हुआ शुल्क नहीं है।' },
                { q: 'बुकिंग की पुष्टि कैसे होती है?', a: 'बुकिंग फॉर्म भरने के बाद हमारी टीम WhatsApp या कॉल के माध्यम से 24 घंटे के भीतर आपसे संपर्क कर तारीख व विवरण पक्का करती है।' },
                { q: 'काशी में पूजा की प्रामाणिकता की क्या गारंटी है?', a: 'सभी पूजाएं काशी के प्रमाणित शास्त्रीय पंडितों द्वारा, वैदिक परंपरा एवं शास्त्रोक्त विधि-विधान अनुसार सम्पन्न की जाती हैं — डॉ. उमंग नाथ शर्मा की तीन पीढ़ियों की 400+ वर्षों की विरासत के अंतर्गत।' },
                { q: 'क्या मुझे पूजा का लाइव प्रमाण मिलेगा?', a: 'हां, ऑनलाइन संकल्प के दौरान आपको लाइव WhatsApp वीडियो कॉल द्वारा वास्तविक समय में पूजा देखने का अवसर मिलता है — साथ ही पूजा के फोटो/वीडियो प्रमाण भी भेजे जाते हैं।' },
                { q: 'विदेश (NRI) में रहने वाले भक्त कैसे बुकिंग करें?', a: 'विदेश से भी बुकिंग सरल है — WhatsApp पर अपना नाम, गोत्र व जन्म विवरण भेजें, अंतरराष्ट्रीय भुगतान स्वीकार किया जाता है, एवं पूजा का समय आपके स्थानीय समय-क्षेत्र अनुसार समन्वित किया जाता है।' },
                { q: 'क्या घर पर पूजा सामग्री भेजी जाती है?', a: 'हां, यदि आप घर बैठे संकल्प करना चाहते हैं तो अनुरोध पर आवश्यक पूजा सामग्री आपके पते पर भेजी जा सकती है — विवरण हेतु WhatsApp पर पूछें।' },
                // English equivalents added alongside the Hindi entries above
                // (same FAQPage, not a separate page) - a pragmatic choice
                // given this site doesn't have separate URL-based language
                // routes (e.g. /en/services vs /hi/services) for true i18n;
                // this at least lets both Hindi- and English-language search
                // queries match relevant FAQ content on the same URL.
                { q: 'How does online pooja booking in Kashi work?', a: 'You share your name, Gotra, and Sankalp requirements via WhatsApp or our booking form; our Kashi-based Pandits perform the pooja at the scheduled time and connect with you live for the Sankalp - no travel to Varanasi required.' },
                { q: 'Will I receive video proof with my Sankalp?', a: 'Yes - during online Sankalp you get a live WhatsApp video call to watch the pooja in real time, and photo/video proof of the completed ritual is also shared with you afterward.' },
                { q: 'What is included in the pooja price?', a: 'The price includes complete pooja samagri (ritual materials), the experienced Pandits\' Dakshina, and Havan where applicable - there are no hidden charges.' },
                { q: 'How is my booking confirmed?', a: 'After you submit the booking form, our team contacts you via WhatsApp or call within 24 hours to confirm the date and details.' },
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
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Free Kundli', path: '/free-kundli' }]),
            {
                '@type': 'Service',
                serviceType: 'Free Janam Kundli Analysis',
                name: 'Free Janam Kundli (Birth Chart) Analysis',
                description: 'Instant, free Vedic birth-chart (Janam Kundli) generation - Lagna, Rashi, Nakshatra, planetary positions, and dosha analysis, computed with Lahiri Ayanamsa. A locked, detailed Planetary Doshas & Career/Marriage forecast is available via 1-on-1 consultation with the Pandits of Kashi.',
                provider: { '@type': 'HinduTemple', name: 'Adhbhut Gyaan', url: `${SITE_URL}/` },
                areaServed: STRUCTURED_AREA_SERVED,
                offers: {
                    '@type': 'Offer',
                    name: 'Free Kundli Report',
                    price: '0',
                    priceCurrency: 'INR',
                    availability: 'https://schema.org/InStock',
                },
            }
        ),
    },
    {
        path: '/panchang',
        title: 'आज का पंचांग | शुभ मुहूर्त, राहु काल एवं चौघड़िया | Adhbhut Gyaan',
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
        description: 'डॉ. उमंग नाथ शर्मा — 400+ वर्षों की काशी वैदिक परंपरा, मैरीलैंड यूनिवर्सिटी से "डॉक्टर ऑफ एस्ट्रोलॉजी"। कुंडली विश्लेषण एवं ग्रह दोष निवारण।',
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
        path: '/pandit-for-pooja',
        title: 'Pandit for Pooja — Cities We Serve | Adhbhut Gyaan',
        description: "Book Kashi's pandits from India, Nepal, the USA, UK, Canada, Australia, Mauritius, Trinidad, Guyana or Fiji - live online pooja with video.",
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Cities We Serve', path: '/pandit-for-pooja' }])),
    },
    {
        path: '/privacy',
        title: 'गोपनीयता नीति | Adhbhut Gyaan',
        description: 'अद्भुत ज्ञान वेबसाइट, पूजा बुकिंग व निःशुल्क कुंडली के उपयोग पर आपकी जानकारी कैसे एकत्र, उपयोग व सुरक्षित की जाती है।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }])),
    },
    {
        path: '/terms',
        title: 'नियम एवं शर्तें | Adhbhut Gyaan',
        description: 'अद्भुत ज्ञान वेबसाइट, पूजा बुकिंग एवं निःशुल्क ज्योतिष टूल्स के उपयोग की शर्तें।',
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
        title: 'AI वास्तु स्कोर — अपने घर का निःशुल्क वास्तु विश्लेषण | Adhbhut Gyaan',
        description: 'मुख्य द्वार, रसोई, पूजा घर, शयन कक्ष एवं शौचालय की दिशा बताएं — तुरंत शास्त्रोक्त वास्तु स्कोर एवं उपाय प्राप्त करें।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Vastu Score', path: '/vastu-score' }])),
    },
];

// ---- Blog posts (one route per post, from blog.json) ----
for (const post of blogData) {
    routes.push({
        path: `/blog/${post.id}`,
        title: capTitle(post.title, 'Adhbhut Gyaan'),
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

// ---- City-specific landing pages (one route per city, from cities.json) ----
// Targets "pandit for pooja in [city]" style long-tail local search intent
// for people outside Kashi - genuinely served by the site's existing
// online/at-Kashi/pandit-travels-to-you delivery model, not a new service.
for (const c of citiesData) {
    routes.push({
        path: `/pandit-for-pooja/${c.slug}`,
        title: capTitle(`Book Pooja from ${c.nameEn} — Kashi Pandits`, 'Adhbhut Gyaan'),
        description: `Book authentic Kashi Pandits for pooja while living in ${c.nameEn} - online with live video, or Pandit ji comes to your home.`,
        jsonLd: combineJsonLd(
            breadcrumbJsonLd([
                { name: 'Home', path: '/' },
                { name: `Pooja in ${c.nameEn}`, path: `/pandit-for-pooja/${c.slug}` },
            ])
        ),
    });
}
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
        title: isAstrology ? capTitle('Best Astrologer in Kashi, Varanasi', service.name) : capTitle(`${service.nameEn} in Kashi, Varanasi`, service.name),
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
    await renderPage(route);
}

// ---- sitemap.xml, auto-generated from the SAME `routes` array above ----
// Previously a hand-maintained static file in public/ - real gap found:
// 5 already-shipped pages (/muhurat, /vastu-score, and 3 new service pages)
// were completely missing from it, since nothing enforced sitemap.xml
// staying in sync with actual routes. Deriving it from `routes` here makes
// that drift structurally impossible going forward - any route added to
// this file is automatically in the sitemap too.
const today = new Date().toISOString().slice(0, 10);

// Honest <lastmod>: previously every URL was stamped with the build date, so
// every page claimed to have changed on every deploy. Google learns to ignore
// lastmod from sites that do that. Now a page's date only moves when its own
// content (title, description, crawler text) actually changes; the hash/date
// pairs live in scripts/lastmod-cache.json, which must be COMMITTED after a
// local run so Vercel's throwaway build disk does not forget them. Blog posts
// start from their real publication date instead of the first-build date.
const LASTMOD_FILE = join(ROOT, 'scripts', 'lastmod-cache.json');
const lastmodCache = existsSync(LASTMOD_FILE) ? JSON.parse(readFileSync(LASTMOD_FILE, 'utf-8')) : {};
function lastmodFor(path, title, description, firstSeen = today) {
    const pre = join(ROOT, 'prerender', fileKeyFor(path) + '.html');
    const fingerprint = JSON.stringify([title, description, existsSync(pre) ? readFileSync(pre, 'utf-8') : '']);
    const hash = createHash('sha1').update(fingerprint).digest('hex').slice(0, 12);
    const prev = lastmodCache[path];
    if (!prev) lastmodCache[path] = { hash, date: firstSeen };
    else if (prev.hash !== hash) lastmodCache[path] = { hash, date: today };
    return lastmodCache[path].date;
}
const postDateFor = (path) => { const m = path.match(/^\/blog\/(.+)$/); const post = m && blogData.find(p => String(p.id) === m[1]); return post && post.date ? post.date : today; };
const PRIORITY_OVERRIDES = { '/': '1.0', '/services': '0.9', '/booking': '0.9', '/free-kundli': '0.9' };
// The homepage ('/') is a real gap found here: it's never in `routes` above
// (that array only covers pages built by cloning+templating the built
// index.html - the homepage itself IS that built index.html, handled by
// its own direct edits earlier in this script, not by this loop) - so a
// site with 38 sitemap URLs had NONE of them be the actual root homepage.
// Deliberately NOT adding '/' to `routes` itself to fix this, since that
// array also drives the per-route page-cloning logic below, and cloning
// index.html onto itself risks corrupting its carefully-maintained
// static JSON-LD/meta-tags - this only touches the sitemap output.
const HOME_LASTMOD = lastmodFor('/', 'home', 'home');
const homeUrl = `  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${HOME_LASTMOD}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${PRIORITY_OVERRIDES['/']}</priority>\n  </url>`;
const sitemapUrls = routes.map(r => {
    const priority = PRIORITY_OVERRIDES[r.path] || (r.path.startsWith('/services/') ? '0.8' : r.path.startsWith('/blog/') ? '0.6' : '0.7');
    const changefreq = r.path === '/' || r.path === '/panchang' || r.path === '/horoscope' ? 'daily' : r.path.startsWith('/blog/') ? 'monthly' : 'weekly';
    return `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <lastmod>${lastmodFor(r.path, r.title, r.description, postDateFor(r.path))}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${homeUrl}\n${sitemapUrls}\n</urlset>\n`;
writeFileSync(join(ROOT, 'public', 'sitemap.xml'), sitemapXml);
writeFileSync(LASTMOD_FILE, JSON.stringify(lastmodCache, null, 1) + '\n');
writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml);
// The homepage is dist/index.html itself (not cloned above) - add its crawler text in place.
writeFileSync(join(DIST, 'index.html'), withInlineCssAndLowPriorityJs(withFontPreloads(await withPrerender(readFileSync(join(DIST, 'index.html'), 'utf-8'), '/'))));
console.log(`[seo-pages] server-rendered ${ssrCount} pages${ssrFailures.length ? `, ${ssrFailures.length} left client-rendered: ` + ssrFailures.slice(0, 6).join(' | ') : ''}`);

console.log(`[seo-pages] sitemap.xml regenerated with ${routes.length + 1} URLs.`);


// ---- llms.txt: a plain-language map of the site for AI assistants (llmstxt.org) ----
// Generated from the same data as the pages so the services list cannot drift.
// Only states what the site itself already says; no prices (not published yet).
const llmsTxt = `# Adhbhut Gyaan

> Authentic Vedic pooja and astrology services from Kashi (Varanasi), by Pt. Dr. Umang Nath Sharma - a Kashi Vedic family tradition of 400+ years. Poojas can be booked online (live video, with your own Sankalp) or in person at Kashi.

## Services
${servicesData.map(s => `- [${s.nameEn}](${SITE_URL}/services/${s.id}): ${(s.shortDescEn || '').replace(/\s+/g, ' ').trim()}`).join('\n')}

## Free tools
- [Daily Panchang](${SITE_URL}/panchang): tithi, nakshatra, Rahu Kaal, Abhijit Muhurat and Choghadiya for any city
- [Daily and monthly Horoscope](${SITE_URL}/horoscope): for all 12 rashis, from live planetary transits
- [Free Vedic Kundli](${SITE_URL}/free-kundli): Lagna, Chandra and Surya Kundali with planetary positions (Lahiri ayanamsa)
- [Shubh Muhurat](${SITE_URL}/muhurat): marriage, griha pravesh, naamkaran and business launch dates
- [Vastu Score](${SITE_URL}/vastu-score): basic Vastu analysis of a home

## About
- [About Adhbhut Gyaan](${SITE_URL}/about): lineage, press and recognition
- [Dr. Umang Nath Sharma](${SITE_URL}/pt-umang-nath-sharma)
- [Cities we serve](${SITE_URL}/pandit-for-pooja): online pooja from India, Nepal, USA, UK, Canada, Australia, Mauritius, Trinidad, Guyana and Fiji
- [Blog](${SITE_URL}/blog): articles on poojas, doshas and Vedic astrology
- [Book a pooja](${SITE_URL}/booking)

## Contact
- WhatsApp / phone: +91 92781 48269
- Email: astrokashi369@gmail.com
- Address: J11/19, Pt Umang Nath Sharma, Nati Imli Rd, Ishwargangi, Varanasi, UP 221001
`;
writeFileSync(join(ROOT, 'public', 'llms.txt'), llmsTxt);
writeFileSync(join(DIST, 'llms.txt'), llmsTxt);

console.log(`[seo-pages] done - generated ${routes.length} static pages.`);
