const SITE_URL = 'https://www.adhbhutgyaan.com';

/**
 * Builds a BreadcrumbList JSON-LD block (no @context — combine() adds it).
 * items: [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, ...]
 */
export function breadcrumbJsonLd(items) {
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

/**
 * Builds an FAQPage JSON-LD block (no @context — combine() adds it).
 * items: [{ q: 'Question?', a: 'Answer text' }, ...]
 */
export function faqJsonLd(items) {
    return {
        '@type': 'FAQPage',
        mainEntity: items.map(it => ({
            '@type': 'Question',
            name: it.q,
            acceptedAnswer: { '@type': 'Answer', text: it.a },
        })),
    };
}

/**
 * Builds a Service JSON-LD block for an individual pooja/service detail page
 * (no @context — combine() adds it). Helps the page rank for long-tail,
 * service-specific searches (e.g. "rudrabhishek puja varanasi price")
 * independently of the general /services listing page.
 */
export function serviceJsonLd(service, lang) {
    const name = lang === 'hi' ? service.name : service.nameEn;
    const description = lang === 'hi' ? service.description : service.descriptionEn;
    return {
        '@type': 'Service',
        serviceType: name,
        name,
        description,
        provider: {
            '@type': 'HinduTemple',
            name: 'Adhbhut Gyaan',
            url: `${SITE_URL}/`,
        },
        areaServed: ['Varanasi', 'Kashi', 'Banaras', 'India', 'Worldwide (online)'],
        offers: (service.packages || []).map(pkg => ({
            '@type': 'Offer',
            name: lang === 'hi' ? pkg.name : pkg.nameEn,
            description: pkg.includes,
            availability: 'https://schema.org/InStock',
        })),
    };
}

/**
 * Builds LocalBusiness and HinduTemple structured JSON-LD for Google Knowledge Graph.
 */
export function localBusinessJsonLd() {
    return {
        '@type': ['LocalBusiness', 'HinduTemple'],
        name: 'Adhbhut Gyaan - Pt. Umang Nath Sharma',
        image: `${SITE_URL}/images/logo.png`,
        '@id': `${SITE_URL}/#business`,
        url: `${SITE_URL}/`,
        telephone: '+919278148269',
        priceRange: '₹₹',
        sameAs: [
            'https://www.facebook.com/share/1GAD1LMAq5/',
            'https://www.instagram.com/adhbhutgyaan369',
            'https://youtube.com/@adhbhutgyaan4911',
        ],
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'J11/19, Nati Imli Rd, Ishwargangi',
            addressLocality: 'Varanasi',
            addressRegion: 'Uttar Pradesh',
            postalCode: '221001',
            addressCountry: 'IN',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 25.3176,
            longitude: 82.9739,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '07:00',
            closes: '21:00',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '142',
        },
    };
}

/**
 * Combines one or more JSON-LD blocks (BreadcrumbList, FAQPage, BlogPosting, etc.)
 * into a single @graph under one shared @context, for use with useSEO's jsonLd prop.
 * Strips any per-item @context so it doesn't conflict with the graph-level one.
 */
export function combineJsonLd(...blocks) {
    const graph = blocks
        .filter(Boolean)
        .map(({ '@context': _drop, ...rest }) => rest);
    if (graph.length === 0) return null;
    return { '@context': 'https://schema.org', '@graph': graph };
}
