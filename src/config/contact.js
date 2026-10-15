// Single place for the business contact details used across the site. Import from here
// instead of pasting the number into pages (it was repeated 40+ times).
export const WHATSAPP_NUMBER = '919278148269';
export const WHATSAPP_DISPLAY = '+91 92781 48269';

/** https://wa.me link with a pre-filled message. */
export function waLink(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
