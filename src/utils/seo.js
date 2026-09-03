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
// Structured areaServed - proper Country/Place typed entities rather than
// bare strings, per Schema.org's recommendation for areaServed. Reused
// across LocalBusiness and every Service schema for consistency.
export const STRUCTURED_AREA_SERVED = [
    { '@type': 'City', name: 'Varanasi' },
    { '@type': 'Country', name: 'India' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Place', name: 'Worldwide (Online Services)' },
];

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
        areaServed: STRUCTURED_AREA_SERVED,
        // In-person delivery (one of the site's 3 delivery tiers - see
        // Booking.jsx) happens at the physical Varanasi location during
        // this specific window; online/WhatsApp booking itself remains
        // possible any time per the LocalBusiness's broader hours.
        hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '09:00',
            closes: '12:00',
            description: 'In-person pooja hours at the Varanasi location; online booking available 24/7.',
        },
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
        '@type': ['LocalBusiness', 'HinduTemple', 'ProfessionalService'],
        name: 'Adhbhut Gyaan - Pt. Umang Nath Sharma',
        image: `${SITE_URL}/images/logo.png`,
        '@id': `${SITE_URL}/#business`,
        url: `${SITE_URL}/`,
        telephone: '+919278148269',
        email: 'astrokashi369@gmail.com',
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
            latitude: 25.326913,
            longitude: 83.007403,
        },
        areaServed: STRUCTURED_AREA_SERVED,
        // Two distinct windows, both real (confirmed directly): general
        // contact/consultation (WhatsApp/phone/online) runs 07:00-21:00
        // daily; in-person pooja bookings AT the physical Varanasi
        // location specifically run 09:00-12:00. Schema.org's
        // openingHoursSpecification has no clean way to label WHICH
        // activity a given window applies to at the LocalBusiness level,
        // so the broader contactability window is kept here (matches
        // what's already live and verified) - the narrower in-person
        // window is attached to the specific in-person Service entries
        // instead (see serviceJsonLd's hoursAvailable), where Schema.org
        // does support that distinction cleanly.
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '07:00',
            closes: '21:00',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '58',
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
