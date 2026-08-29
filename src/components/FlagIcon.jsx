// Renders a small country flag as a real SVG image instead of a flag emoji.
//
// Why: flag emoji (e.g. 🇫🇷) are built from Unicode "regional indicator"
// letter pairs, and rendering them as a picture depends entirely on the
// device having a color emoji font that draws that combination. Android and
// iOS both do; most desktop browsers on Windows do not (Chrome/Edge/Firefox
// on Windows fall back to the two bare letters, or nothing) - so the same
// testimonial that shows a flag on a phone shows a gap on a Windows laptop.
// A bundled SVG (via the `flag-icons` package) looks identical everywhere.
//
// `flag` accepts either a flag emoji (looked up in FLAG_EMOJI_TO_ISO below)
// or a raw ISO 3166-1 alpha-2 code directly. Anything not recognised (e.g.
// the 🌐 globe used for "international / unspecified") renders as plain text
// so it still shows something reasonable.

const FLAG_EMOJI_TO_ISO = {
    '🇦🇺': 'au', '🇧🇪': 'be', '🇨🇦': 'ca', '🇩🇪': 'de', '🇪🇸': 'es',
    '🇫🇷': 'fr', '🇬🇧': 'gb', '🇮🇱': 'il', '🇮🇷': 'ir', '🇱🇰': 'lk',
    '🇲🇾': 'my', '🇳🇱': 'nl', '🇺🇸': 'us',
};

// Vite bundles only the specific flag SVGs actually imported below, not the
// whole flag-icons package.
const FLAG_SVGS = {
    au: new URL('flag-icons/flags/4x3/au.svg', import.meta.url).href,
    be: new URL('flag-icons/flags/4x3/be.svg', import.meta.url).href,
    ca: new URL('flag-icons/flags/4x3/ca.svg', import.meta.url).href,
    de: new URL('flag-icons/flags/4x3/de.svg', import.meta.url).href,
    es: new URL('flag-icons/flags/4x3/es.svg', import.meta.url).href,
    fr: new URL('flag-icons/flags/4x3/fr.svg', import.meta.url).href,
    gb: new URL('flag-icons/flags/4x3/gb.svg', import.meta.url).href,
    il: new URL('flag-icons/flags/4x3/il.svg', import.meta.url).href,
    ir: new URL('flag-icons/flags/4x3/ir.svg', import.meta.url).href,
    lk: new URL('flag-icons/flags/4x3/lk.svg', import.meta.url).href,
    my: new URL('flag-icons/flags/4x3/my.svg', import.meta.url).href,
    nl: new URL('flag-icons/flags/4x3/nl.svg', import.meta.url).href,
    us: new URL('flag-icons/flags/4x3/us.svg', import.meta.url).href,
};

export default function FlagIcon({ flag, style }) {
    if (!flag) return null;
    const iso = FLAG_EMOJI_TO_ISO[flag] || (FLAG_SVGS[flag] ? flag : null);
    const src = iso ? FLAG_SVGS[iso] : null;

    if (!src) {
        // Unmapped (e.g. the 🌐 globe for unspecified/international) - this
        // is a plain Unicode symbol, not a flag sequence, so it renders fine
        // as text on every platform already.
        return <span aria-hidden="true">{flag}</span>;
    }

    return (
        <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width="18"
            height="14"
            style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: '2px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', ...style }}
        />
    );
}
