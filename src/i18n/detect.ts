import {
    fallbackLanguage,
    isLanguagePreference,
    isSupportedLanguage,
    LanguagePreference,
    LanguagePreferenceKey,
    SupportedLanguage,
} from './languages';

export function normalizeLanguageTag(tag?: string): SupportedLanguage | undefined {
    const base = tag?.trim().toLowerCase().split('-')[0];
    return isSupportedLanguage(base) ? base : undefined;
}

export function detectBrowserLanguage(): SupportedLanguage {
    if (typeof navigator === 'undefined') return fallbackLanguage;

    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of candidates) {
        const normalized = normalizeLanguageTag(tag);
        if (normalized) return normalized;
    }

    return fallbackLanguage;
}

export function readLanguagePreference(): LanguagePreference {
    if (typeof window === 'undefined') return 'auto';

    const stored = window.localStorage.getItem(LanguagePreferenceKey);
    return isLanguagePreference(stored) ? stored : 'auto';
}

export function resolveLanguage(preference: LanguagePreference): SupportedLanguage {
    return preference === 'auto' ? detectBrowserLanguage() : preference;
}

export function writeLanguagePreference(preference: LanguagePreference) {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(LanguagePreferenceKey, preference);
}
