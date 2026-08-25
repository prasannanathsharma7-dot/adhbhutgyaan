import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        try {
            return localStorage.getItem('kps_lang') || 'en';
        } catch {
            return 'en';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('kps_lang', lang);
        } catch {
            /* ignore */
        }
        document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    }, [lang]);

    const toggleLang = () => setLang(prev => (prev === 'hi' ? 'en' : 'hi'));

    // t(hindiText, englishText) => returns the text for the active language
    const t = (hi, en) => (lang === 'hi' ? hi : (en ?? hi));

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
    return ctx;
}
