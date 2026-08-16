import { useLanguage } from '../context/LanguageContext';

export default function WhatsAppFloat() {
    const { t } = useLanguage();
    return (
        <a
            href={`https://wa.me/919278148269?text=${encodeURIComponent(t('नमस्कार! मैं पूजा बुक करना चाहता हूँ।', 'Hello! I would like to book a pooja.'))}`}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-float"
            aria-label="WhatsApp Chat"
        >
            💬
        </a>
    );
}
