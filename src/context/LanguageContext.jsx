import { createContext, useContext, useState, useEffect, useLayoutEffect, useRef } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    // Always starts as 'en': the server-rendered HTML is English, and React hydration requires
    // the first client render to match it exactly. A visitor's SAVED language is applied
    // immediately afterwards, before the browser paints (useLayoutEffect).
    //
    // Nothing is set in state unless the saved language is actually Hindi: an unconditional
    // setState here forced a synchronous second render of the whole app right after hydration
    // (a measured ~400ms task on a throttled phone) for every visitor, to no purpose.
    const [lang, setLang] = useState('en');
    const pendingSavedRef = useRef(null); // saved language still waiting to be applied

    useLayoutEffect(() => {
        try {
            const saved = localStorage.getItem('kps_lang');
            if (saved === 'hi') {
                pendingSavedRef.current = 'hi';
                setLang('hi');
            }
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        // Don't overwrite the saved choice with the initial 'en' before it has been applied.
        if (pendingSavedRef.current && pendingSavedRef.current !== lang) return;
        pendingSavedRef.current = null;
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
