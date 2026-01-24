'use client';

import { DescEnum, DescEnumValue } from '@bufbuild/protobuf';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx } from 'clsx';
import React, { FC, useId, useMemo, useState } from 'react';
import { Check, ChevronDown, Eye, EyeSlash } from 'react-bootstrap-icons';
import { SettingLabel } from './card';
import {
    Dropdown,
    DropdownCheckboxItem,
    DropdownContent,
    DropdownTrigger
} from './dropdown';
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


// --- Select Components ---

interface SelectItem {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    items: SelectItem[];
    placeholder?: string;
    disabled?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    viewportClassName?: string;
    size?: 'sm' | 'lg';
}

export const Select: FC<SelectProps> = ({ value, onValueChange, items, placeholder, disabled, triggerClassName, contentClassName, viewportClassName, size }) => {
    const internalValue = value === "" ? "___EMPTY___" : value;

    return (
        <SelectPrimitive.Root value={internalValue} onValueChange={(val) => onValueChange(val === "___EMPTY___" ? "" : val)} disabled={disabled}>
            <SelectPrimitive.Trigger className={clsx(styles.selectTrigger, size === 'sm' && styles.selectTriggerSm, triggerClassName, disabled && styles.disabled)} aria-label={placeholder}>
                <SelectPrimitive.Value placeholder={placeholder} />
                <SelectPrimitive.Icon>
                    <ChevronDown />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content className={clsx(styles.selectContent, contentClassName)}>
                    <SelectPrimitive.Viewport className={viewportClassName}>
                        {items.map((item, index) => {
                            const itemValue = item.value === "" ? "___EMPTY___" : item.value;
                            return (
                                <SelectPrimitive.Item key={`${itemValue}-${index}`} value={itemValue} className={styles.selectItem}>
                                    <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                                    <SelectPrimitive.ItemIndicator className={styles.selectItemIndicator}>
                                        <Check />
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            )
                        })}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

export const SwitchSelect: FC<{ value: boolean, onChange: (x: boolean) => void, disabled?: boolean }> = ({ value, onChange, disabled }) => {
    const items: SelectItem[] = [
        { value: "true", label: "TRUE" },
        { value: "false", label: "FALSE" },
    ];
    return <Select value={String(value)} onValueChange={(val) => onChange(val === 'true')} items={items} disabled={disabled} />;
}

const SettingSelectComponent: FC<{
    label: string,
    value: string,
    values: string[],
    onChange: (x: string) => void,
    emptyChoose?: boolean,
    emptyChooseName?: string,
    disabled?: boolean
}> = ({ label, value, values, onChange, emptyChoose, emptyChooseName, disabled }) => {
    const items: SelectItem[] = values.map(v => ({ value: v, label: v }));
    if (emptyChoose) {
        items.unshift({ value: "", label: emptyChooseName ?? "Choose..." });
    }
    return (
        <div className={clsx(styles.formRow, disabled && styles.disabled)}>
            <label className={styles.formLabel}>{label}</label>
            <div className={styles.formControl}>
                <Select value={value} onValueChange={onChange} items={items} disabled={disabled} />
            </div>
        </div>
    );
}
export const SettingSelect = React.memo(SettingSelectComponent);


const FormSelectComponent: FC<{
    value: string,
    values: string[] | [string, string][],
    onChange: (x: string) => void,
    format?: (v: string) => string,
    emptyChoose?: boolean,
    emptyChooseName?: string,
    disabled?: boolean,
    triggerClassName?: string
}> = ({ value, values, onChange, format, emptyChoose, emptyChooseName, disabled, triggerClassName }) => {
    const items: SelectItem[] = values.map((v) => {
        const itemValue = typeof v === 'string' ? v : v[1];
        const itemLabel = typeof v === 'string' ? v : v[0];
        return { value: itemValue, label: format ? format(itemLabel) : itemLabel };
    });
    if (emptyChoose) {
        items.unshift({ value: "", label: emptyChooseName ?? "Choose..." });
    }
    return <Select value={value} onValueChange={onChange} items={items} disabled={disabled} triggerClassName={triggerClassName} />;
}
export const FormSelect = React.memo(FormSelectComponent);

const DropdownSelectComponent: FC<{
    values: string[],
    items: string[],
    onUpdate: (x: string[]) => void,
    triggerClassName?: string,
    placeholder?: string
}> = ({ values, items, onUpdate, triggerClassName, placeholder = "Choose..." }) => {
    return (
        <Dropdown>
            <DropdownTrigger asChild>
                <div
                    className={clsx(styles.selectTrigger, triggerClassName)}
                    style={{ cursor: 'pointer' }}
                >
                    <span className={clsx("text-truncate", values.length === 0 && "opacity-50")}>
                        {values.length === 0 ? placeholder : values.join(", ")}
                    </span>
                    <ChevronDown className="opacity-50" />
                </div>
            </DropdownTrigger>
            <DropdownContent style={{ minWidth: 'min(300px, 90vw)' }}>
                {items.map((v) => (
                    <DropdownCheckboxItem
                        key={v}
                        checked={values.includes(v)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => onUpdate(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])}
                    >
                        {v}
                    </DropdownCheckboxItem>
                ))}
            </DropdownContent>
        </Dropdown>
    );
}
export const DropdownSelect = React.memo(DropdownSelectComponent);


const SettingSelectVerticalComponent: FC<{
    label: string;
    value: string;
    values: string[] | [string, string][];
    onChange: (val: string) => void;
    emptyChoose?: boolean;
    emptyChooseName?: string;
    format?: (v: string) => string;
    className?: string;
    disabled?: boolean;
}> = ({ label, value, values, onChange, emptyChoose, emptyChooseName, format, className, disabled }) => {
    const items: SelectItem[] = values.map(v => {
        const itemValue = typeof v === 'string' ? v : v[1];
        const itemLabel = typeof v === 'string' ? v : v[0];
        return { value: itemValue, label: format ? format(itemLabel) : itemLabel };
    });

    if (emptyChoose) {
        items.unshift({ value: "", label: emptyChooseName ?? "Choose..." });
    }
    return (
        <div className={clsx(styles.formVertical, className, disabled && styles.disabled)}>
            <SettingLabel className={styles.formLabel}>{label}</SettingLabel>
            <Select value={value} onValueChange={onChange} items={items} disabled={disabled} />
        </div>
    );
};
export const SettingSelectVertical = React.memo(SettingSelectVerticalComponent);

const SettingEnumSelectVerticalComponent: FC<{
    label: string;
    type: DescEnum;
    value: number;
    onChange: (val: number) => void;
    filter?: (v: DescEnumValue) => boolean;
    format?: (v: number) => string;
    emptyChoose?: boolean;
    className?: string;
    disabled?: boolean;
}> = ({ label, type, value, onChange, filter, format, emptyChoose, className, disabled }) => {
    const items: SelectItem[] = useMemo(() => {
        let values = type.values;
        if (filter) values = values.filter(filter);
        return values.map(v => ({ value: String(v.number), label: format ? format(v.number) : v.name }));
    }, [type, filter, format]);

    if (emptyChoose) {
        items.unshift({ value: "", label: "Choose..." });
    }

    return (
        <div className={clsx(styles.formVertical, className, disabled && styles.disabled)}>
            <SettingLabel className={styles.formLabel}>{label}</SettingLabel>
            <Select value={String(value)} onValueChange={(val) => onChange(Number(val))} items={items} disabled={disabled} />
        </div>
    );
};
export const SettingEnumSelectVertical = React.memo(SettingEnumSelectVerticalComponent);


const SettingTypeSelectComponent: FC<{
    label?: string,
    type: DescEnum,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: DescEnumValue) => boolean
    format?: (v: number) => string,
    emptyChoose?: boolean,
    disabled?: boolean,
    className?: string,
    triggerClassName?: string,
    size?: 'sm' | 'lg'
}> = ({ label, type, value, onChange, filter, format, emptyChoose, disabled, className, triggerClassName, size }) => {
    const items: SelectItem[] = useMemo(() => {
        let values = type.values;
        if (filter) values = values.filter(filter);
        return values.map(v => ({ value: String(v.number), label: format ? format(v.number) : v.name }));
    }, [type, filter, format]);

    if (emptyChoose) {
        items.unshift({ value: "", label: "Choose..." });
    }

    return (
        <div className={clsx(styles.formRow, disabled && styles.disabled, className)}>
            {label && <label className={styles.formLabel}>{label}</label>}
            <div className={styles.formControl}>
                <Select value={String(value)} onValueChange={(val) => onChange(Number(val))} items={items} disabled={disabled} triggerClassName={triggerClassName} size={size} />
            </div>
        </div>
    );
}
export const SettingTypeSelect = React.memo(SettingTypeSelectComponent);


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
}

export const SettingInputVertical: FC<SettingInputVerticalProps> = React.memo(({
    label,
    value,
    onChange,
    placeholder,
    className,
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

            <Input
                id={id}
                size={size}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                {...rest} // 2. Spread all other properties
            />
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


