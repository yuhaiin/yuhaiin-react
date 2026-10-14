import { bytesToBase64 } from "@/common/base64";

import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx } from 'clsx';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import React, { FC, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { SettingLabel } from './card';
import { Combobox } from './combobox';
import { Input, InputProps } from './input';
import { ui } from './styles';
import SwitchComponent from './switch';
import { Tooltip } from './tooltip';

// --- Re-export for convenience ---
export { SwitchCard } from './switch';


// --- SettingCheck ---
const SettingCheckComponent: FC<{ label: string, checked: boolean, onChange: (c: boolean) => void, className?: string, disabled?: boolean }> =
    ({ label, checked, onChange, className, disabled }) => {
        return (
            <div className={clsx("flex items-center mb-[var(--field-margin,var(--space-field))]", className, disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
                <label className="basis-[150px] shrink-0 mr-6 font-medium">{label}</label>
                <div className="grow min-w-0 relative">
                    <SwitchComponent ariaLabel={label} checked={checked} onCheckedChange={onChange} disabled={disabled} />
                </div>
            </div>
        )
    }
export const SettingCheck = React.memo(SettingCheckComponent)


export interface Remind {
    label: string
    value: string
    label_children?: string[]
}

export * from './select';


// --- Input Components ---

interface SettingInputVerticalProps extends Omit<InputProps, 'onChange'> {
    label: React.ReactNode;
    // Redefine onChange to match business needs (pass string directly)
    onChange: (val: string) => void;
    reminds?: Remind[];
    showAllOnFocus?: boolean;
}

export const SettingInputVertical: FC<SettingInputVerticalProps> = React.memo(({
    label,
    value,
    onChange,
    placeholder,
    className,
    reminds,
    showAllOnFocus,
    size,      // Receive the previously defined size
    ...rest    // Receive other native properties like disabled, readOnly, type, etc.
}) => {

    const id = useId(); // Auto-generate unique ID

    return (
        <div className={clsx("relative mb-[var(--field-margin,var(--space-field))] flex min-w-0 max-w-full flex-col", className)}>
            {/* 1. Associate Label and Input */}
            <SettingLabel htmlFor={id} className="mb-2 block">
                {label}
            </SettingLabel>

            {reminds ? (
                <Combobox
                    id={id}
                    size={size}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    options={reminds.map(r => ({ label: r.label, value: r.value, details: r.label_children }))}
                    showAllOnFocus={showAllOnFocus}
                    {...rest}
                />
            ) : (
                <Input
                    id={id}
                    size={size}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    {...rest} // 2. Spread all other properties
                />
            )}
        </div>
    );
});

export const SettingPasswordVertical: FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}> = React.memo(({ label, value, onChange, placeholder, className }) => {
    const { t } = useTranslation('common');
    const [show, setShow] = useState(false);
    const id = useId();

    return (
        <div className={clsx("flex flex-col mb-[var(--field-margin,var(--space-field))] relative", className)}>
            <SettingLabel htmlFor={id} className="mb-2 basis-auto mr-0 font-medium">{label}</SettingLabel>
            <div className="flex">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    groupPosition="first"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                <Button
                    type="button"
                    groupPosition="last"
                    onClick={() => setShow(!show)}
                    aria-label={show ? t('form.hidePassword') : t('form.showPassword')}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
            </div>
        </div>
    );
});


// --- Slider/Range Components ---

export const SettingRangeVertical: FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (val: number) => void;
    className?: string;
    disabled?: boolean;
}> = React.memo(({ label, value, min, max, step, unit, onChange, className, disabled }) => {
    const { t } = useTranslation('common');
    return (
        <div className={clsx("flex flex-col mb-[var(--field-margin,var(--space-field))] relative", className)}>
            <div className="flex justify-between items-center mb-1">
                <SettingLabel className="mb-0 font-medium">{label}</SettingLabel>
                <div className="text-ui-heading font-medium font-mono text-sm bg-ui-surface-muted px-2 py-1 rounded-ui-xs">
                    {value.toLocaleString()} {unit}
                </div>
            </div>

            <SliderPrimitive.Root
                className="group relative flex items-center select-none touch-none w-full h-11 data-[disabled]:cursor-not-allowed"
                value={[value]}
                onValueChange={(newValue) => onChange(newValue[0])}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            >
                <SliderPrimitive.Track className="bg-ui-border-strong relative grow rounded-full h-1">
                    <SliderPrimitive.Range className="absolute bg-ui-primary group-data-[disabled]:bg-ui-disabled-fg rounded-full h-full" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    aria-label={label}
                    aria-valuetext={`${value.toLocaleString()} ${unit ?? ''}`}
                    className={clsx(
                        "relative flex size-11 items-center justify-center rounded-full bg-transparent outline-none sm:size-5 before:size-4 before:rounded-full before:border before:border-ui-border-strong before:bg-ui-surface before:shadow-ui-control hover:before:border-ui-primary data-[disabled]:before:bg-ui-disabled data-[disabled]:before:border-ui-disabled-border",
                        ui.focusRing
                    )}
                />
            </SliderPrimitive.Root>

            <div className="flex justify-between text-ui-tertiary text-xs font-normal tabular-nums">
                <span>{t('form.min')}: {min.toLocaleString()}</span>
                <span>{t('form.max')}: {max.toLocaleString()}</span>
            </div>
        </div>
    );
});


// --- Byte Array Input Component ---

export const SettingInputBytes: FC<{
    label: string;
    value: Uint8Array | undefined;
    onChange: (val: Uint8Array) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}> = React.memo(({ label, value, onChange, placeholder, className, disabled }) => {
    const { t } = useTranslation('common');
    const canonical = bytesToBase64(value);
    const lastCanonical = useRef(canonical);
    const [text, setText] = useState(canonical);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        if (canonical !== lastCanonical.current) {
            lastCanonical.current = canonical;
            setText(canonical);
            setInvalid(false);
        }
    }, [canonical]);

    const handleChange = (newText: string) => {
        setText(newText);
        try {
            const binary = atob(newText);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            lastCanonical.current = bytesToBase64(bytes);
            setInvalid(false);
            onChange(bytes);
        } catch {
            setInvalid(true);
        }
    };

    const labelWithWarning = (
        <div className="flex items-center gap-1">
            {label}
            <Tooltip content={t('form.base64Warning')}>
                <div className="text-ui-danger cursor-help">
                    <CircleAlert size={12} />
                </div>
            </Tooltip>
        </div>
    );

    return (
        <SettingInputVertical
            label={labelWithWarning}
            value={text}
            aria-invalid={invalid}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
        />
    );
});
