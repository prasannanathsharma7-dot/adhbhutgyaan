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
        title: 'हमारी पूजा सेवाएं | Adhbhut Gyaan',
        description: 'रुद्राभिषेक, कालसर्प दोष, त्रिपिंडी श्राद्ध, दस महाविद्या पाठ सहित 10+ प्रामाणिक पूजा सेवाएं — बनारस के विद्वान पंडितों द्वारा।',
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
        path: '/about',
        title: 'हमारे बारे में — शर्मा परिवार की विरासत | Adhbhut Gyaan',
        description: '400+ वर्षों की वैदिक परंपरा, तीन पीढ़ियों की गाथा — महामहोपाध्याय पं. अयोध्या नाथ शर्मा से डॉ. उमंग नाथ शर्मा तक।',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }])),
    },
    {
        path: '/contact',
        title: 'संपर्क करें | Adhbhut Gyaan',
        description: 'WhatsApp, फ़ोन या ईमेल से हमसे संपर्क करें — वाराणसी, उत्तर प्रदेश।',
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

// Note: /admin and /leave-a-review are intentionally skipped - both are
// already noindex + disallowed in robots.txt, so they don't need a
// crawler-facing static page.

for (const route of routes) {
    renderPage(route);
}

console.log(`[seo-pages] done - generated ${routes.length} static pages.`);
