// Runtime wiring (Vite resolves the JSON imports). Everything else imports from here.
import services from '../data/services.json';
import priceList from '../data/priceList.json';
import { buildCatalog, categoriesOf } from './catalog.js';

export const catalog = buildCatalog({ services, priceList });
export const categories = categoriesOf(priceList);
export const detailServiceCount = services.length;
export { CONCERNS, searchCatalog, groupByCategory, recommendForConcern } from './catalog.js';
