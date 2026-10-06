// `?inline` makes Vite embed each (tiny) SVG as a data: URI in BOTH the browser build and the
// server-render build, so the server HTML and the hydrating client agree on every flag's src.
// (new URL(..., import.meta.url) is not rewritten in the server build and produced file:// paths.)
import flag_au from 'flag-icons/flags/4x3/au.svg?inline';
import flag_be from 'flag-icons/flags/4x3/be.svg?inline';
import flag_ca from 'flag-icons/flags/4x3/ca.svg?inline';
import flag_de from 'flag-icons/flags/4x3/de.svg?inline';
import flag_es from 'flag-icons/flags/4x3/es.svg?inline';
import flag_fr from 'flag-icons/flags/4x3/fr.svg?inline';
import flag_gb from 'flag-icons/flags/4x3/gb.svg?inline';
import flag_il from 'flag-icons/flags/4x3/il.svg?inline';
import flag_ir from 'flag-icons/flags/4x3/ir.svg?inline';
import flag_lk from 'flag-icons/flags/4x3/lk.svg?inline';
import flag_my from 'flag-icons/flags/4x3/my.svg?inline';
import flag_nl from 'flag-icons/flags/4x3/nl.svg?inline';
import flag_us from 'flag-icons/flags/4x3/us.svg?inline';
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
    au: flag_au,
    be: flag_be,
    ca: flag_ca,
    de: flag_de,
    es: flag_es,
    fr: flag_fr,
    gb: flag_gb,
    il: flag_il,
    ir: flag_ir,
    lk: flag_lk,
    my: flag_my,
    nl: flag_nl,
    us: flag_us,
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
