// whatsappRedirect.js
// Builds the pre-filled WhatsApp message for the "Unlock Full 24-Page
// Kundali PDF" paywall CTA. Keeps the exact wording in one place so the
// price/flow can be updated without touching the UI component.

const WHATSAPP_NUMBER = '919278148269';
export const FULL_KUNDLI_PDF_PRICE_INR = 501;

/**
 * details: { name, dob, tob, pob, lang, numeralSystem }
 * Returns a ready-to-use https://wa.me/... URL.
 */
export function buildFullKundliUnlockUrl(details) {
    const { name, dob, tob, pob, lang = 'hi', numeralSystem = 'latin' } = details;

    const langLabel = lang === 'hi' ? 'हिंदी' : 'English';
    const numeralLabel = numeralSystem === 'devanagari' ? 'देवनागरी अंक' : 'Latin अंक';

    const message = lang === 'hi'
        ? `प्रणाम, मुझे मेरी पूर्ण 24-पृष्ठ कुंडली PDF चाहिए।\n\nनाम: ${name}\nजन्म तिथि: ${dob}\nजन्म समय: ${tob}\nजन्म स्थान: ${pob}\nभाषा: ${langLabel}\nअंक प्रणाली: ${numeralLabel}\n\nकृपया ₹${FULL_KUNDLI_PDF_PRICE_INR} के भुगतान हेतु UPI/QR कोड भेजें।`
        : `Pranam, I would like to unlock my full 24-page Kundli PDF.\n\nName: ${name}\nDOB: ${dob}\nTOB: ${tob}\nPOB: ${pob}\nLanguage: ${langLabel}\nNumeral System: ${numeralLabel}\n\nPlease share a UPI/QR code so I can pay ₹${FULL_KUNDLI_PDF_PRICE_INR}.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
