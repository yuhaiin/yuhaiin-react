'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx } from 'clsx';
import { motion } from "framer-motion";
import React, { FC, useEffect, useId, useState } from 'react';
import { ExclamationCircle, Eye, EyeSlash } from 'react-bootstrap-icons';
import { Button } from './button';
import { SettingLabel } from './card';
import { Combobox } from './combobox';
import styles from './forms.module.css';
import { Input, InputProps } from './input';
import SwitchComponent from './switch';
import { Tooltip } from './tooltip';

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

interface SettingInputVerticalProps extends Omit<InputProps, 'onChange'> {
    label: React.ReactNode;
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
                <Button
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onClick={() => setShow(!show)}
                >
                    {show ? <EyeSlash /> : <Eye />}
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
                    <SliderPrimitive.Range className={styles.SliderRange} asChild>
                        <motion.span layout transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    </SliderPrimitive.Range>
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className={styles.SliderThumb} asChild>
                    <motion.span
                        layout
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    />
                </SliderPrimitive.Thumb>
            </SliderPrimitive.Root>

            <div className="d-flex justify-content-between text-muted opacity-50" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                <span>MIN: {min.toLocaleString()}</span>
                <span>MAX: {max.toLocaleString()}</span>
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
    const toBase64 = (bytes: Uint8Array | undefined) => {
        if (!bytes || bytes.length === 0) return "";
        try {
            return btoa(String.fromCharCode(...bytes));
        } catch (e) {
            return "";
        }
    };

    const [text, setText] = useState(toBase64(value));

    useEffect(() => {
        const canonical = toBase64(value);
        if (canonical !== text) {
            setText(canonical);
        }
    }, [value]);

    const handleChange = (newText: string) => {
        setText(newText);
        try {
            const binary = atob(newText);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            onChange(bytes);
        } catch (e) {
            // Keep local text active even if invalid base64
        }
    };

    const labelWithWarning = (
        <div className="d-flex align-items-center gap-1">
            {label}
            <Tooltip content="Input must be a valid Base64 string to be saved.">
                <div className="text-danger" style={{ cursor: 'help' }}>
                    <ExclamationCircle size={12} />
                </div>
            </Tooltip>
        </div>
    );

    return (
        <SettingInputVertical
            label={labelWithWarning}
            value={text}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
        />
    );
});
