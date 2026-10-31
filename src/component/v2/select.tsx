
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import React, { CSSProperties, FC, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingLabel } from './card';
import {
    Dropdown,
    DropdownCheckboxItem,
    DropdownContent,
    DropdownTrigger
} from './dropdown';
import { FieldFeedback } from './input';
import { cn, ui } from './styles';

export type DescEnumValue = {
    number: number;
    name: string;
};

export type DescEnum = {
    values: DescEnumValue[];
};

export interface SelectItem {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    items: SelectItem[];
    placeholder?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    disabled?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    viewportClassName?: string;
    size?: 'sm' | 'lg';
    error?: string;
    ariaDescribedBy?: string;
    ariaInvalid?: boolean;
    groupPosition?: 'first' | 'middle' | 'last' | 'single';
}


export const Select: FC<SelectProps> = ({ value, onValueChange, items, placeholder, ariaLabel, ariaLabelledBy, disabled, triggerClassName, contentClassName, viewportClassName, size, groupPosition, error, ariaDescribedBy, ariaInvalid }) => {
    const feedbackId = useId();
    const safeItems = Array.isArray(items) ? items : [];
    let emptyValue = "___EMPTY___";
    while (safeItems.some(item => item.value === emptyValue)) emptyValue += "_";
    const internalValue = value === "" ? emptyValue : value;

    const radiusClass =
        groupPosition === 'first' ? '!rounded-r-none !border-r-0' :
            groupPosition === 'last' ? '!rounded-l-none' :
                groupPosition === 'middle' ? '!rounded-none !border-r-0' :
                    '';

    return (
        <FieldFeedback error={error} id={feedbackId}><SelectPrimitive.Root
            value={internalValue}
            onValueChange={(val) => onValueChange(val === emptyValue ? "" : val)}
            disabled={disabled}
        >
            <SelectPrimitive.Trigger className={cn(
                ui.selectTrigger,
                ui.interactive,
                ui.focusRing,
                size === 'sm' && "h-field-sm text-[0.875rem] px-2.5",
                radiusClass,
                triggerClassName,
                disabled && "bg-ui-disabled border-ui-disabled-border text-ui-disabled-fg cursor-not-allowed"
            )} aria-label={ariaLabel ?? placeholder} aria-labelledby={ariaLabelledBy} aria-invalid={Boolean(error) || ariaInvalid || undefined} aria-describedby={[ariaDescribedBy, error ? feedbackId : undefined].filter(Boolean).join(' ') || undefined}>
                <SelectPrimitive.Value className="min-w-0 flex-1 truncate text-left" placeholder={placeholder} />
                <SelectPrimitive.Icon>
                    <ChevronDown className="text-ui-tertiary shrink-0" size={16} />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    className={cn(
                        ui.menuSurface,
                        "max-h-[var(--radix-select-content-available-height)]",
                        contentClassName
                    )}
                    position="popper"
                    sideOffset={5}
                    align="start"
                    data-ui-transition="popover"
                    style={{ width: 'var(--radix-select-trigger-width)' }}
                >

                        <SelectPrimitive.Viewport className={cn("p-1 overflow-y-auto overscroll-contain max-h-[min(320px,var(--radix-select-content-available-height))]", viewportClassName)}>
                            {safeItems.map((item, index) => {
                                const itemValue = item.value === "" ? emptyValue : item.value;
                                return (
                                    <SelectPrimitive.Item key={`${itemValue}-${index}`} value={itemValue} className={ui.menuItem}>
                                        <SelectPrimitive.ItemText className="min-w-0 truncate">{item.label}</SelectPrimitive.ItemText>
                                        <SelectPrimitive.ItemIndicator className={ui.menuIndicator}>
                                            <Check size={14} />
                                        </SelectPrimitive.ItemIndicator>
                                    </SelectPrimitive.Item>
                                )
                            })}
                        </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root></FieldFeedback>
    );
}

const DropdownSelectComponent: FC<{
    values: string[],
    items: string[],
    onUpdate: (x: string[]) => void,
    format?: (value: string) => string,
    triggerClassName?: string,
    placeholder?: string,
    groupPosition?: 'first' | 'middle' | 'last' | 'single'
}> = ({ values, items, onUpdate, triggerClassName, placeholder, groupPosition, format = value => value }) => {
    const { t } = useTranslation('common');
    const safeValues = Array.isArray(values) ? values : [];
    const safeItems = Array.isArray(items) ? items : [];
    const resolvedPlaceholder = placeholder ?? t('state.choose');
    const radiusClass =
        groupPosition === 'first' ? '!rounded-r-none !border-r-0' :
            groupPosition === 'last' ? '!rounded-l-none' :
                groupPosition === 'middle' ? '!rounded-none !border-r-0' :
                    '';

    return (
        <Dropdown>
            <DropdownTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        ui.selectTrigger,
                        ui.interactive,
                        ui.focusRing,
                        radiusClass,
                        triggerClassName
                    )}
                >
                    <span className="flex items-center gap-2 overflow-hidden min-w-0">
                        {safeValues.length > 0 && (
                            <span className="inline-flex items-center justify-center bg-ui-primary-soft text-ui-primary text-[0.75rem] font-semibold h-[20px] min-w-[20px] px-[6px] rounded-full leading-none">
                                {safeValues.length}
                            </span>
                        )}
                        <span className={cn("truncate", safeValues.length === 0 && "text-ui-muted")}>
                            {safeValues.length === 0 ? resolvedPlaceholder : safeValues.map(format).join(", ")}
                        </span>
                    </span>
                    <ChevronDown className="text-ui-tertiary flex-shrink-0" size={16} />
                </button>
            </DropdownTrigger>
            <DropdownContent className="min-w-[min(300px,90vw)]">
                {safeItems.map((v) => (
                    <DropdownCheckboxItem
                        key={v}
                        checked={safeValues.includes(v)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => onUpdate(safeValues.includes(v) ? safeValues.filter((x) => x !== v) : [...safeValues, v])}
                    >
                        {format(v)}
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
    const safeValues = Array.isArray(values) ? values : [];
    const items: SelectItem[] = safeValues.map(v => {
        const itemValue = typeof v === 'string' ? v : v[1];
        const itemLabel = typeof v === 'string' ? v : v[0];
        return { value: itemValue, label: format ? format(itemLabel) : itemLabel };
    });

    if (emptyChoose) {
        items.unshift({ value: "", label: emptyChooseName ?? "Choose..." });
    }
    return (
        <div className={cn("flex flex-col mb-[var(--field-margin,var(--space-field))] relative", className, disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
            <SettingLabel className="mb-2 basis-auto mr-0 font-medium">{label}</SettingLabel>
            <Select value={value} onValueChange={onChange} items={items} disabled={disabled} ariaLabel={label} />
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
    className?: string;
    disabled?: boolean;
}> = ({ label, type, value, onChange, filter, format, className, disabled }) => {
    const items: SelectItem[] = useMemo(() => {
        let values = type.values;
        if (filter) values = values.filter(filter);
        return values.map(v => ({ value: String(v.number), label: format ? format(v.number) : v.name }));
    }, [type, filter, format]);

    return (
        <div className={cn("flex flex-col mb-[var(--field-margin,var(--space-field))] relative", className, disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
            <SettingLabel className="mb-2 basis-auto mr-0 font-medium">{label}</SettingLabel>
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
    style?: CSSProperties
}> = ({ label, type, value, onChange, filter, format, emptyChoose, disabled, className, triggerClassName, size, style }) => {
    const items: SelectItem[] = useMemo(() => {
        let values = type.values;
        if (filter) values = values.filter(filter);
        return values.map(v => ({ value: String(v.number), label: format ? format(v.number) : v.name }));
    }, [type, filter, format]);

    if (emptyChoose) {
        items.unshift({ value: "", label: "Choose..." });
    }

    return (
        <div className={cn("flex items-center mb-[var(--field-margin,var(--space-field))] flex-wrap", disabled && "opacity-60 pointer-events-none grayscale-[0.5]", className)} style={style}>
            {label && <label className="basis-[150px] shrink-0 mr-6 font-medium max-[576px]:basis-full max-[576px]:mr-0 max-[576px]:mb-2">{label}</label>}
            <div className="grow min-w-0 relative">
                <Select value={String(value)} onValueChange={(val) => onChange(Number(val))} items={items} disabled={disabled} triggerClassName={triggerClassName} size={size} />
            </div>
        </div>
    );
}
export const SettingTypeSelect = React.memo(SettingTypeSelectComponent);
