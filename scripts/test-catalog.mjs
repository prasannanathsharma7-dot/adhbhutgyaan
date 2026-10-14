// Catalog integrity tests: the Pooja Finder, the "At a Glance" directory and the price list must
// always describe the same set of poojas. Fails loudly if someone adds/renames a ritual in one
// place and forgets the others. No network, no database.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCatalog, categoriesOf, searchCatalog, groupByCategory, recommendForConcern } from '../src/catalog/catalog.js';
import { CONCERNS, SERVICE_LINKS, SERVICE_CATEGORY, SERVICE_CONCERNS, ITEM_CONCERNS, FEATURED_ORDER } from '../src/catalog/taxonomy.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const services = read('src/data/services.json');
const priceList = read('src/data/priceList.json');
const catalog = buildCatalog({ services, priceList });
const categories = categoriesOf(priceList);

let passed = 0, failed = 0;
const check = (c, n) => { if (c) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}`); } else { failed++; console.log(`  \x1b[31m✗ ${n}\x1b[0m`); } };
const concernIds = new Set(CONCERNS.map(c => c.id));
const serviceIds = new Set(services.map(s => s.id));
const itemNos = new Set(priceList.items.map(i => i.no));

console.log('\n\x1b[1m[1] Links between services.json, priceList.json and the taxonomy\x1b[0m');
check(Object.entries(SERVICE_LINKS).every(([no, id]) => itemNos.has(Number(no)) && serviceIds.has(id)), 'every SERVICE_LINKS pair points at a real price-list item and a real service');
check(new Set(Object.values(SERVICE_LINKS)).size === Object.keys(SERVICE_LINKS).length, 'a service is linked to at most one price-list item');
check(services.every(s => SERVICE_LINKS && (Object.values(SERVICE_LINKS).includes(s.id) || SERVICE_CATEGORY[s.id])), 'every service is either linked to an item or has an explicit directory category');
check(Object.keys(SERVICE_CATEGORY).every(id => serviceIds.has(id)), 'SERVICE_CATEGORY has no stale service ids');
check(services.every(s => (SERVICE_CONCERNS[s.id] || []).length > 0), 'every service has at least one concern');
check(Object.keys(SERVICE_CONCERNS).every(id => serviceIds.has(id)), 'SERVICE_CONCERNS has no stale service ids');
check(Object.keys(ITEM_CONCERNS).every(no => itemNos.has(Number(no)) && !SERVICE_LINKS[no]), 'ITEM_CONCERNS has no stale item numbers and never tags a service-linked item twice');
check([...Object.values(SERVICE_CONCERNS), ...Object.values(ITEM_CONCERNS)].every(list => list.every(c => concernIds.has(c))), 'every concern id used in the tables exists in CONCERNS');
check(Object.values(FEATURED_ORDER).every(list => list.every(id => serviceIds.has(id))), 'every hand-picked featured service exists');

console.log('\n\x1b[1m[2] The catalog covers every pooja exactly once\x1b[0m');
const keys = catalog.map(e => e.key);
check(new Set(keys).size === keys.length, 'entry keys are unique');
check(catalog.length === services.length + priceList.items.length - Object.keys(SERVICE_LINKS).length, `entry count = ${services.length} services + ${priceList.items.length} items - ${Object.keys(SERVICE_LINKS).length} merged = ${catalog.length}`);
check(priceList.items.every(i => catalog.filter(e => e.itemNo === i.no).length === 1), 'every published price-list item appears exactly once');
check(services.every(s => catalog.filter(e => e.serviceId === s.id).length === 1), 'every detail-page service appears exactly once');
check(catalog.every(e => e.nameHi && e.nameEn), 'every entry has Hindi and English names');
check(catalog.every(e => categories.some(c => c.id === e.categoryId)), 'every entry belongs to a known directory category');
check(groupByCategory(catalog, categories).reduce((n, g) => n + g.entries.length, 0) === catalog.length, 'the directory groups lose no entry');
check(catalog.filter(e => e.serviceId).every(e => e.detailPath === `/services/${e.serviceId}` && e.image), 'detail-page services carry a detail path and image');
check(catalog.filter(e => !e.serviceId).every(e => !e.detailPath), 'listed-only rituals never link to a detail page that does not exist');

console.log('\n\x1b[1m[3] Pooja Finder: every pooja is reachable from some concern\x1b[0m');
check(catalog.every(e => e.concerns.length > 0), 'every pooja is tagged with at least one concern');
check(CONCERNS.every(c => { const r = recommendForConcern(catalog, c.id); return r.featured.length + r.more.length > 0; }), 'every concern has at least one suggestion');
const reachable = new Set(CONCERNS.flatMap(c => { const r = recommendForConcern(catalog, c.id); return [...r.featured, ...r.more].map(e => e.key); }));
check(reachable.size === catalog.length, `all ${catalog.length} poojas are reachable through the Finder`);
const legacy = { health: ['rudrabhishek', 'purush-suktam'], marriage: ['kumbh-vivah', 'kalsarp-dosh'], money: ['kanakdhara-stotra', 'shree-suktam'], ancestral: ['tripindi-shradh'], career: ['ganesh-atharvashirsha', 'kalsarp-dosh'], negativity: ['vipreet-pratyangira', 'mahavidya-paath'], unsure: ['astrology-consultation'] };
check(Object.entries(legacy).every(([c, ids]) => { const f = recommendForConcern(catalog, c).featured.map(e => e.serviceId); return ids.every((id, i) => f[i] === id); }), 'the original 7 concerns still lead with their original hand-picked suggestions');
check(recommendForConcern(catalog, 'health').more.every(e => !e.serviceId), '"more" lists only poojas without their own page (no duplicates of the cards)');

console.log('\n\x1b[1m[4] Prices: only owner-approved numbers are ever shown\x1b[0m');
check(catalog.filter(e => e.price.status !== 'approved').every(e => e.price.min === null && e.price.max === null), 'unapproved / on-request entries carry no number');
check(catalog.filter(e => e.price.status === 'approved').every(e => e.price.min > 0 && e.price.max >= e.price.min), 'approved entries carry a valid price');
check(catalog.find(e => e.serviceId === 'astrology-consultation').price.min === 501, 'astrology consultation is ₹501');
check(Object.entries(SERVICE_LINKS).every(([no, id]) => { const e = catalog.find(x => x.serviceId === id); const i = priceList.items.find(x => x.no === Number(no)); return e.price.status === i.status && e.price.min === i.min && e.price.max === i.max; }), 'a service merged with a price-list item shows exactly that item\'s price');
check(catalog.filter(e => e.serviceId && e.itemNo == null && e.serviceId !== 'astrology-consultation').every(e => e.price.status === 'verify'), 'services without a reviewed rate show "price on WhatsApp" (draft package prices stay hidden)');

console.log('\n\x1b[1m[5] Search (Hindi, English, number)\x1b[0m');
check(searchCatalog(catalog, '').length === catalog.length, 'empty query returns everything');
check(searchCatalog(catalog, 'rudra')[0].serviceId === 'rudrabhishek', '"rudra" ranks Rudrabhishek first');
check(searchCatalog(catalog, 'RUDRA').length === searchCatalog(catalog, 'rudra').length, 'search is case-insensitive');
check(searchCatalog(catalog, 'गीता').some(e => e.itemNo === 14), 'Hindi query "गीता" finds the Gita paath');
check(searchCatalog(catalog, '38')[0].serviceId === 'tripindi-shradh', 'price-list number "38" finds Tripindi Shraddh (merged with its service)');
check(searchCatalog(catalog, 'qqzzxx').length === 0, 'nonsense returns nothing');
check(searchCatalog(catalog, 'jaap').length >= 20, '"jaap" finds the many jaap entries');

console.log(`\n\x1b[1mCATALOG TESTS: ${passed + failed} run | ${passed} passed | ${failed} failed\x1b[0m`);
process.exit(failed ? 1 : 0);
