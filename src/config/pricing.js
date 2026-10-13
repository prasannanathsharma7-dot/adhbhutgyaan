// Master switch + per-package approval for showing prices on package cards,
// in WhatsApp/email enquiry text and in Schema.org markup.
//
// src/data/services.json still holds DRAFT package prices that were never
// reviewed (several look formula-derived, e.g. 108 x 30 = 3240, and some differ
// widely from the pandit's own rate slip). A package price is shown ONLY when that
// package also has `"priceApproved": true`. Today that is just the astrology
// consultation (final price Rs 501, set by the owner). To publish another package
// price: set its `price` to the FINAL amount and add `"priceApproved": true`.
//
// The broader rate list (paath/shraddh/jaap/yagya) lives in src/data/priceList.json
// and the /price-list page - see scripts/build-price-list.mjs.
export const SHOW_PRICES = true;

/** Returns the package's price as a number only when prices are enabled, set AND approved. */
export function getPackagePrice(pkg) {
    if (!SHOW_PRICES || !pkg || !pkg.price || pkg.priceApproved !== true) return null;
    return Number(pkg.price);
}

export function formatINR(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}
