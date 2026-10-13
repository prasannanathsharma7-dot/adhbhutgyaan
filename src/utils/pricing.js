// Single source of truth for how a public (website) price is derived from the
// pandit's own rate. Used by scripts/build-price-list.mjs (to generate
// src/data/priceList.json) and by scripts/test-pricing.mjs. The frontend only
// ever reads the already-computed public prices - the underlying rates are NOT
// shipped to the browser.

export const MARKUP_PERCENT = 10;

// Rounding policy (so a price never shows ugly paise-level numbers):
//   result under Rs 100  -> nearest Rs 0.50   (these are per-paath unit rates)
//   Rs 100 and above     -> nearest Rs 5
// Halves round up. 1e-9 absorbs floating-point noise (e.g. 125 * 1.1 = 137.50000000000003).
export function roundPublic(raw) {
    const step = raw < 100 ? 0.5 : 5;
    return Math.floor(raw / step + 0.5 + 1e-9) * step;
}

export function publicPrice(base) {
    return roundPublic(base * (1 + MARKUP_PERCENT / 100));
}

/** 6.5 -> "₹6.5", 1210 -> "₹1,210" */
export function formatPrice(amount) {
    if (amount == null || Number.isNaN(amount)) return '';
    const hasHalf = Math.abs(amount - Math.round(amount)) > 1e-9;
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: hasHalf ? 1 : 0, maximumFractionDigits: 1 });
}

export const UNIT_LABELS = {
    paath:   { hi: 'प्रति पाठ',        en: 'per paath' },
    ritual:  { hi: 'प्रति अनुष्ठान',    en: 'per ritual' },
    day:     { hi: 'प्रतिदिन',          en: 'per day' },
    per1000: { hi: 'प्रति 1,000 जाप',   en: 'per 1,000 jaap' },
    session: { hi: 'प्रति सत्र',        en: 'per session' },
    unclear: { hi: '',                 en: '' },
};
