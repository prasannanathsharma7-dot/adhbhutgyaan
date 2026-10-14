// Unified pooja catalog: ONE list that the Pooja Finder, the "At a Glance" directory and
// (later) any other consumer read. Pure functions - the data is passed in, so this file has
// no JSON/React imports and is covered by scripts/test-catalog.mjs.
//
//   entry = {
//     key, serviceId|null, itemNo|null,       identity (a ritual that is both a service and a price-list
//     nameHi, nameEn, categoryId,             item is ONE entry carrying both)
//     detailPath|null, image|null,            set only for the 14 detail-page services
//     shortDescHi|null, shortDescEn|null,
//     price: { status, min, max, unit },      numbers ONLY when status === 'approved' (owner-approved)
//     concerns: string[]
//   }
import { CONCERNS, EXTRA_CATEGORIES, SERVICE_LINKS, SERVICE_CATEGORY, SERVICE_CONCERNS, ITEM_CONCERNS, FEATURED_ORDER } from './taxonomy.js';

export function buildCatalog({ services, priceList }) {
    const linkedItems = new Map(Object.entries(SERVICE_LINKS).map(([no, id]) => [id, Number(no)]));
    const itemsByNo = new Map(priceList.items.map(i => [i.no, i]));
    const entries = [];

    // 1) the 14 detail-page services (in services.json order), merged with their price-list item if linked
    for (const s of services) {
        const itemNo = linkedItems.get(s.id) ?? null;
        const item = itemNo != null ? itemsByNo.get(itemNo) : null;
        let price;
        if (s.id === 'astrology-consultation') {
            price = { status: 'approved', min: priceList.consultation.price, max: priceList.consultation.price, unit: 'session' };
        } else if (item) {
            price = { status: item.status, min: item.min, max: item.max, unit: item.unit };
        } else {
            // no reviewed rate for this service: the draft package prices in services.json stay hidden
            price = { status: 'verify', min: null, max: null, unit: 'ritual' };
        }
        entries.push({
            key: `svc:${s.id}`, serviceId: s.id, itemNo,
            nameHi: s.name, nameEn: s.nameEn, categoryId: item ? item.category : SERVICE_CATEGORY[s.id],
            detailPath: `/services/${s.id}`, image: s.image || null,
            shortDescHi: s.shortDesc || null, shortDescEn: s.descriptionEn || s.shortDescEn || null,
            price, concerns: SERVICE_CONCERNS[s.id] || [],
        });
    }

    // 2) every other published price-list item
    for (const it of priceList.items) {
        if (SERVICE_LINKS[it.no]) continue;
        entries.push({
            key: `item:${it.no}`, serviceId: null, itemNo: it.no,
            nameHi: it.nameHi, nameEn: it.nameEn, categoryId: it.category,
            detailPath: null, image: null, shortDescHi: null, shortDescEn: null,
            price: { status: it.status, min: it.min, max: it.max, unit: it.unit },
            concerns: ITEM_CONCERNS[it.no] || [],
        });
    }
    return entries;
}

export function categoriesOf(priceList) {
    return [...EXTRA_CATEGORIES, ...priceList.categories];
}

const norm = (s) => (s || '').toString().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

/** Search across Hindi + English names, short descriptions and the price-list number. Empty query = everything. */
export function searchCatalog(entries, query) {
    const q = norm(query);
    if (!q) return entries;
    const scored = [];
    for (const e of entries) {
        const names = [norm(e.nameEn), norm(e.nameHi)];
        let score = 0;
        if (e.itemNo != null && String(e.itemNo) === q) score = 100;
        else if (names.some(n => n.startsWith(q))) score = 80;
        else if (names.some(n => n.includes(q))) score = 60;
        else if ([norm(e.shortDescEn), norm(e.shortDescHi)].some(d => d && d.includes(q))) score = 20;
        if (score) scored.push({ e, score });
    }
    return scored.sort((a, b) => b.score - a.score).map(x => x.e);
}

/** Directory sections in display order, each with its entries (empty sections are dropped). */
export function groupByCategory(entries, categories) {
    return categories
        .map(c => ({ ...c, entries: entries.filter(e => e.categoryId === c.id) }))
        .filter(g => g.entries.length > 0);
}

/**
 * Suggestions for a concern: `featured` = detail-page services (hand-picked ones first),
 * `more` = every other listed ritual tagged with the concern, in price-list order.
 */
export function recommendForConcern(entries, concernId) {
    const tagged = entries.filter(e => e.concerns.includes(concernId));
    const order = FEATURED_ORDER[concernId] || [];
    const rank = (e) => { const i = order.indexOf(e.serviceId); return i === -1 ? order.length : i; };
    const featured = tagged.filter(e => e.serviceId).sort((a, b) => rank(a) - rank(b));
    const more = tagged.filter(e => !e.serviceId).sort((a, b) => a.itemNo - b.itemNo);
    return { featured, more };
}

export { CONCERNS };
