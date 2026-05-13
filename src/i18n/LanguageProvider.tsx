import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import i18n from './index';
import { readLanguagePreference, resolveLanguage, writeLanguagePreference } from './detect';
import { LanguagePreference, SupportedLanguage } from './languages';
import { TranslatedDocument } from './TranslatedDocument';

type LanguageContextType = {
    preference: LanguagePreference;
    language: SupportedLanguage;
    setPreference: (preference: LanguagePreference) => void;
};

const initialPreference = readLanguagePreference();
const initialLanguage = resolveLanguage(initialPreference);

const LanguageContext = createContext<LanguageContextType>({
    preference: initialPreference,
    language: initialLanguage,
    setPreference: () => undefined,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [preference, setPreferenceState] = useState<LanguagePreference>(initialPreference);
    const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

    const setPreference = useCallback((next: LanguagePreference) => {
        writeLanguagePreference(next);
        setPreferenceState(next);
        setLanguage(resolveLanguage(next));
    }, []);

    useEffect(() => {
        i18n.changeLanguage(language);
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        if (preference !== 'auto') return;

        const onLanguageChange = () => setLanguage(resolveLanguage('auto'));
        window.addEventListener('languagechange', onLanguageChange);
        return () => window.removeEventListener('languagechange', onLanguageChange);
    }, [preference]);

    const value = useMemo(() => ({
        preference,
        language,
        setPreference,
    }), [language, preference, setPreference]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
            <TranslatedDocument language={language} />
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
