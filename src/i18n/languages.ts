export const supportedLanguages = ['en', 'ja', 'ko'] as const;

export type SupportedLanguage = typeof supportedLanguages[number];
export type LanguagePreference = 'auto' | SupportedLanguage;

export const fallbackLanguage: SupportedLanguage = 'en';
export const LanguagePreferenceKey = 'yuhaiin.webui.language';

export const languageOptions: Array<{
    value: LanguagePreference;
    label: string;
}> = [
    { value: 'auto', label: 'Auto' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
];

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
    return supportedLanguages.includes(value as SupportedLanguage);
}

export function isLanguagePreference(value: string | null | undefined): value is LanguagePreference {
    return value === 'auto' || isSupportedLanguage(value);
}
