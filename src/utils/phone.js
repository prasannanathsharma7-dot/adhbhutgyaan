// Phone validation for the website forms. MUST behave exactly like
// isValidPhone() in backend/_db.js (scripts/test-security.mjs checks both agree).
//
// Accepts an Indian mobile (10 digits starting 6-9, optionally written with a
// +91 / 0091 / 0 prefix) or an international number written with an explicit "+"
// or "00" prefix (E.164: 8-15 digits). Plain 11+ digit strings with no prefix are
// rejected - that is the junk/spam pattern the original check was written to stop.
export function isValidPhone(phone) {
    const raw = (phone || '').toString().trim();
    if (!raw) return false;
    const hasIntlPrefix = /^(\+|00)/.test(raw);
    const digits = raw.replace(/\D/g, '');
    if (hasIntlPrefix) {
        const national = raw.startsWith('00') ? digits.slice(2) : digits;
        if (/^91[6-9]\d{9}$/.test(national)) return true;
        return /^[1-9]\d{7,14}$/.test(national) && !/^91/.test(national);
    }
    if (/^[6-9]\d{9}$/.test(digits)) return true;
    if (/^0[6-9]\d{9}$/.test(digits)) return true;
    return false;
}

export const PHONE_HELP_HI = 'कृपया सही मोबाइल नंबर लिखें (भारतीय 10-अंक, या विदेशी नंबर +कंट्री कोड के साथ)';
export const PHONE_HELP_EN = 'Please enter a valid mobile number (10-digit Indian, or international with +country code)';
