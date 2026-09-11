import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useLocaleFormat() {
    const { i18n } = useTranslation();
    const locale = i18n.language || 'en';

    return useMemo(() => {
        const dateTimeFormat = new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'medium',
        });
        const timeFormat = new Intl.DateTimeFormat(locale, {
            timeStyle: 'medium',
        });
        const numberFormat = new Intl.NumberFormat(locale);

        return {
            dateTime: (date: Date) => dateTimeFormat.format(date),
            time: (date: Date) => timeFormat.format(date),
            number: (value: number) => numberFormat.format(value),
        };
    }, [locale]);
}
