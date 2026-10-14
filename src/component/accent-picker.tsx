import { ACCENTS } from '@/common/theme';
import { useTheme } from '@/common/ThemeProvider';
import { Check } from 'lucide-react';
import { RadioGroup } from 'radix-ui';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, ui } from './v2/styles';

/** Immediate, keyboard-accessible preview of the shared accent palette. */
export function AccentPicker() {
    const { t } = useTranslation('webui');
    const { accent, setAccent } = useTheme();
    const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
        if (!step && event.key !== 'Home' && event.key !== 'End') return;
        const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
        const index = items.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        // Select synchronously: a quick keyup can precede Radix's deferred focus.
        event.preventDefault(); event.stopPropagation();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + step + items.length) % items.length;
        items[nextIndex].focus();
        setAccent(ACCENTS[nextIndex]);
    };
    return <RadioGroup.Root onKeyDownCapture={handleKey} value={accent} onValueChange={value => {
        const next = ACCENTS.find(item => item === value);
        if (next) setAccent(next);
    }} aria-label={t('theme.accent')} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ACCENTS.map(value => <RadioGroup.Item key={value} value={value} aria-label={t(`theme.accents.${value}`)}
            className={cn('flex min-h-11 items-center gap-2 rounded-ui-md border border-ui-border bg-ui-surface px-3 py-2 text-sm text-ui-fg transition-colors hover:border-ui-border-strong data-[state=checked]:border-ui-primary data-[state=checked]:bg-ui-selected', ui.focusRing)}>
            <span data-accent={value} className="shrink-0"><span className="accent-swatch block size-4 rounded-full" /></span>
            <span className="min-w-0 flex-1 text-left">{t(`theme.accents.${value}`)}</span>
            <RadioGroup.Indicator><Check size={14} aria-hidden="true" /></RadioGroup.Indicator>
        </RadioGroup.Item>)}
    </RadioGroup.Root>;
}
