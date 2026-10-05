// Master switch for showing prices anywhere on the site.
//
// src/data/services.json already holds a `price` on most packages, but
// those numbers have never been published (the frontend never rendered
// them) and several look formula-derived rather than final (e.g. 108 x 30
// = 3240, 501 x 30 = 15030). Publishing unreviewed prices - on package
// cards, in WhatsApp/email enquiry text, and in Google-facing Schema.org
// markup - would be hard to walk back once crawled, so everything price-
// related reads through this one flag instead.
//
// When the final price list is confirmed: update services.json, then set
// SHOW_PRICES to true. Nothing else needs to change.
export const SHOW_PRICES = false;

/** Returns the package's price as a number only when prices are enabled and set. */
export function getPackagePrice(pkg) {
    if (!SHOW_PRICES || !pkg || !pkg.price) return null;
    return Number(pkg.price);
}

export function formatINR(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}
