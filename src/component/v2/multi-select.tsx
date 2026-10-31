import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './styles';

export interface MultiSelectOption { value: string; label: ReactNode; ariaLabel?: string; disabled?: boolean }

/** Wrapping chips over native checkboxes, so forms, fieldset disabling and keyboard use keep working. */
export function MultiSelectChips({ options, value, onChange, disabled, className }: {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    disabled?: boolean;
    className?: string;
}) {
    return <div className={cn('flex min-w-0 flex-wrap gap-2', className)}>
        {options.map(option => <label key={option.value} className={cn(
            'inline-flex min-h-9 min-w-0 cursor-pointer items-center gap-1.5 rounded-full border border-ui-border bg-ui-surface px-3 py-1 text-sm text-ui-muted transition-colors max-sm:min-h-11',
            'hover:border-ui-border-strong hover:text-ui-fg',
            'has-[:checked]:border-ui-primary has-[:checked]:bg-ui-selected has-[:checked]:font-medium has-[:checked]:text-ui-heading',
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ui-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ui-surface',
            'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:disabled]:hover:border-ui-border has-[:disabled]:hover:text-ui-muted',
        )}>
            <input type="checkbox" className="peer sr-only" aria-label={option.ariaLabel} checked={value.includes(option.value)} disabled={disabled || option.disabled}
                onChange={() => onChange(value.includes(option.value) ? value.filter(item => item !== option.value) : [...value, option.value])} />
            {/* The indicator keeps its space, so selecting never reflows the row. */}
            <span aria-hidden="true" className="flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border border-ui-border-strong text-transparent transition-colors peer-checked:border-ui-primary peer-checked:bg-ui-primary peer-checked:text-ui-surface"><Check size={10} strokeWidth={3} /></span>
            <span className="min-w-0 break-words">{option.label}</span>
        </label>)}
    </div>;
}
