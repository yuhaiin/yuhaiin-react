import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useLocaleFormat() {
    const { i18n } = useTranslation();
    const locale = i18n.language || 'en';

    return useMemo(() => ({
        dateTime: (date: Date) => new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'medium',
        }).format(date),
        time: (date: Date) => new Intl.DateTimeFormat(locale, {
            timeStyle: 'medium',
        }).format(date),
        number: (value: number) => new Intl.NumberFormat(locale).format(value),
    }), [locale]);
}
