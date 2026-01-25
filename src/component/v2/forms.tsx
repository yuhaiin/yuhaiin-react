'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx } from 'clsx';
import React, { FC, useId, useState } from 'react';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { SettingLabel } from './card';
import { Combobox } from './combobox';
import styles from './forms.module.css';
import { Input, InputProps } from './input';
import SwitchComponent from './switch';

// --- Re-export for convenience ---
export { SwitchCard } from './switch';


// --- SettingCheck ---
const SettingCheckComponent: FC<{ label: string, checked: boolean, onChange: (c: boolean) => void, className?: string, disabled?: boolean }> =
    ({ label, checked, onChange, className, disabled }) => {
        return (
            <div className={clsx(styles.formRow, className, disabled && styles.disabled)}>
                <label className={styles.formLabel}>{label}</label>
                <div className={styles.formControl}>
                    <SwitchComponent checked={checked} onCheckedChange={onChange} disabled={disabled} />
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

/*

export const SettingInputVertical: FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}> = React.memo(({ label, value, onChange, placeholder, className }) => {
    return (
        <div className={className}>
            <SettingLabel>{label}</SettingLabel>
            <Form.Control
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
});

 */

interface SettingInputVerticalProps extends Omit<InputProps, 'onChange'> {
    label: string;
    // Redefine onChange to match business needs (pass string directly)
    onChange: (val: string) => void;
    reminds?: Remind[];
}

export const SettingInputVertical: FC<SettingInputVerticalProps> = React.memo(({
    label,
    value,
    onChange,
    placeholder,
    className,
    reminds,
    size,      // Receive the previously defined size
    ...rest    // Receive other native properties like disabled, readOnly, type, etc.
}) => {

    const id = useId(); // Auto-generate unique ID

    return (
        <div className={`${styles.formVertical} ${className || ''}`}>
            {/* 1. Associate Label and Input */}
            <SettingLabel htmlFor={id} style={{ marginBottom: '0.5rem', display: 'block' }}>
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
    const [show, setShow] = useState(false);

    return (
        <div className={`${styles.formVertical} ${className}`}>
            <SettingLabel className={styles.formLabel}>{label}</SettingLabel>
            <div style={{ display: 'flex' }}>
                <input
                    type={show ? "text" : "password"}
                    className={styles.input}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onClick={() => setShow(!show)}
                >
                    {show ? <EyeSlash /> : <Eye />}
                </button>
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
}> = React.memo(({ label, value, min, max, step, unit, onChange, className }) => {
    return (
        <div className={`${styles.formVertical} ${className}`}>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <SettingLabel className={`${styles.formLabel} mb-0`}>{label}</SettingLabel>
                <div className="text-primary fw-bold font-monospace small bg-primary bg-opacity-10 px-2 py-1 rounded">
                    {value.toLocaleString()} {unit}
                </div>
            </div>

            <SliderPrimitive.Root
                className={styles.SliderRoot}
                value={[value]}
                onValueChange={(newValue) => onChange(newValue[0])}
                min={min}
                max={max}
                step={step}
            >
                <SliderPrimitive.Track className={styles.SliderTrack}>
                    <SliderPrimitive.Range className={styles.SliderRange} />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className={styles.SliderThumb} />
            </SliderPrimitive.Root>

            <div className="d-flex justify-content-between text-muted opacity-50" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                <span>MIN: {min.toLocaleString()}</span>
                <span>MAX: {max.toLocaleString()}</span>
            </div>
        </div>
    );
});


