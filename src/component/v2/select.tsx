'use client';

import { DescEnum, DescEnumValue } from '@/common/plain';
import * as SelectPrimitive from '@radix-ui/react-select';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import React, { CSSProperties, FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingLabel } from './card';
import {
    Dropdown,
    DropdownCheckboxItem,
    DropdownContent,
    DropdownTrigger
} from './dropdown';
import { ui } from './styles';

export interface SelectItem {
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
    groupPosition?: 'first' | 'middle' | 'last' | 'single';
}

import { motion } from 'motion/react';

export const Select: FC<SelectProps> = ({ value, onValueChange, items, placeholder, disabled, triggerClassName, contentClassName, viewportClassName, size, groupPosition }) => {
    const internalValue = value === "" ? "___EMPTY___" : value;
    const safeItems = Array.isArray(items) ? items : [];

    const radiusClass =
        groupPosition === 'first' ? '!rounded-r-none !border-r-0' :
            groupPosition === 'last' ? '!rounded-l-none' :
                groupPosition === 'middle' ? '!rounded-none !border-r-0' :
                    '';

    return (
        <SelectPrimitive.Root
            value={internalValue}
            onValueChange={(val) => onValueChange(val === "___EMPTY___" ? "" : val)}
            disabled={disabled}
        >
            <SelectPrimitive.Trigger className={clsx(
                "flex items-center justify-between rounded-ui-md px-3 text-sm leading-none h-field gap-[5px] bg-ui-bg text-ui-fg border border-ui-border w-full cursor-pointer",
                ui.interactive,
                ui.focusRing,
                "hover:bg-ui-surface-muted hover:border-ui-border data-[state=open]:border-ui-primary",
                size === 'sm' && "h-field-sm text-[0.875rem] px-2.5",
                radiusClass,
                triggerClassName,
                disabled && "opacity-60 pointer-events-none"
            )} aria-label={placeholder}>
                <SelectPrimitive.Value placeholder={placeholder} />
                <SelectPrimitive.Icon>
                    <ChevronDown className="opacity-50 shrink-0" size={16} />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    className={clsx(
                        "overflow-hidden bg-ui-surface rounded-ui-xl border border-ui-border shadow-ui-elevated z-[2000] max-h-[var(--radix-select-content-available-height)] origin-[var(--radix-select-content-transform-origin)] will-change-[transform,opacity]",
                        "data-[state=open]:animate-slideDownAndFade data-[state=closed]:animate-slideUpAndFade",
                        "data-[side=top]:data-[state=open]:animate-slideUpAndFadeIn data-[side=bottom]:data-[state=open]:animate-slideDownAndFadeIn",
                        contentClassName
                    )}
                    position="popper"
                    sideOffset={5}
                    align="start"
                    style={{ width: 'var(--radix-select-trigger-width)' }}
                    asChild
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <SelectPrimitive.Viewport className={clsx("p-[5px] overflow-y-auto max-h-[50vh] max-h-[var(--radix-select-content-available-height)]", viewportClassName)}>
                            {safeItems.map((item, index) => {
                                const itemValue = item.value === "" ? "___EMPTY___" : item.value;
                                return (
                                    <SelectPrimitive.Item key={`${itemValue}-${index}`} value={itemValue} className={clsx(
                                        "text-sm leading-none text-ui-fg rounded-ui-md flex items-center h-field-sm pl-[25px] pr-[35px] relative select-none cursor-pointer",
                                        "data-[highlighted]:bg-ui-hover data-[highlighted]:text-ui-heading",
                                        ui.interactive
                                    )}>
                                        <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                                        <SelectPrimitive.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                                            <Check size={14} />
                                        </SelectPrimitive.ItemIndicator>
                                    </SelectPrimitive.Item>
                                )
                            })}
                        </SelectPrimitive.Viewport>
                    </motion.div>
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
    const { t } = useTranslation('common');
    const safeValues = Array.isArray(values) ? values : [];
    const items: SelectItem[] = safeValues.map(v => ({ value: v, label: v }));
    if (emptyChoose) {
        items.unshift({ value: "", label: emptyChooseName ?? t('state.choose') });
    }
    return (
        <div className={clsx("flex items-center mb-4 flex-wrap", disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
            <label className="basis-[150px] shrink-0 mr-6 font-medium max-[576px]:basis-full max-[576px]:mr-0 max-[576px]:mb-2">{label}</label>
            <div className="grow min-w-0 relative">
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
    triggerClassName?: string,
    groupPosition?: 'first' | 'middle' | 'last' | 'single'
}> = ({ value, values, onChange, format, emptyChoose, emptyChooseName, disabled, triggerClassName, groupPosition }) => {
    const { t } = useTranslation('common');
    const safeValues = Array.isArray(values) ? values : [];
    const items: SelectItem[] = safeValues.map((v) => {
        const itemValue = typeof v === 'string' ? v : v[1];
        const itemLabel = typeof v === 'string' ? v : v[0];
        return { value: itemValue, label: format ? format(itemLabel) : itemLabel };
    });
    if (emptyChoose) {
        items.unshift({ value: "", label: emptyChooseName ?? t('state.choose') });
    }
    return <Select value={value} onValueChange={onChange} items={items} disabled={disabled} triggerClassName={triggerClassName} groupPosition={groupPosition} />;
}
export const FormSelect = React.memo(FormSelectComponent);

const DropdownSelectComponent: FC<{
    values: string[],
    items: string[],
    onUpdate: (x: string[]) => void,
    triggerClassName?: string,
    placeholder?: string,
    groupPosition?: 'first' | 'middle' | 'last' | 'single'
}> = ({ values, items, onUpdate, triggerClassName, placeholder, groupPosition }) => {
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
                <div
                    className={clsx(
                        "flex items-center justify-between rounded-ui-md px-3 text-sm leading-none h-field gap-[5px] bg-ui-bg text-ui-fg border border-ui-border w-full cursor-pointer",
                        ui.interactive,
                        ui.focusRing,
                        "hover:bg-ui-surface-muted hover:border-ui-border data-[state=open]:border-ui-primary",
                        radiusClass,
                        triggerClassName
                    )}
                >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        {safeValues.length > 0 && (
                            <span className="inline-flex items-center justify-center bg-ui-primary-soft text-ui-primary text-[0.75rem] font-semibold h-[20px] min-w-[20px] px-[6px] rounded-full leading-none">
                                {safeValues.length}
                            </span>
                        )}
                        <span className={clsx("truncate", safeValues.length === 0 && "opacity-50")}>
                            {safeValues.length === 0 ? resolvedPlaceholder : safeValues.join(", ")}
                        </span>
                    </div>
                    <ChevronDown className="opacity-50 flex-shrink-0" size={16} />
                </div>
            </DropdownTrigger>
            <DropdownContent className="min-w-[min(300px,90vw)]">
                {safeItems.map((v) => (
                    <DropdownCheckboxItem
                        key={v}
                        checked={safeValues.includes(v)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => onUpdate(safeValues.includes(v) ? safeValues.filter((x) => x !== v) : [...safeValues, v])}
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
        <div className={clsx("flex flex-col mb-4 relative", className, disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
            <SettingLabel className="mb-2 basis-auto mr-0 font-medium">{label}</SettingLabel>
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
    className?: string;
    disabled?: boolean;
}> = ({ label, type, value, onChange, filter, format, className, disabled }) => {
    const items: SelectItem[] = useMemo(() => {
        let values = type.values;
        if (filter) values = values.filter(filter);
        return values.map(v => ({ value: String(v.number), label: format ? format(v.number) : v.name }));
    }, [type, filter, format]);

    return (
        <div className={clsx("flex flex-col mb-4 relative", className, disabled && "opacity-60 pointer-events-none grayscale-[0.5]")}>
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
        <div className={clsx("flex items-center mb-4 flex-wrap", disabled && "opacity-60 pointer-events-none grayscale-[0.5]", className)} style={style}>
            {label && <label className="basis-[150px] shrink-0 mr-6 font-medium max-[576px]:basis-full max-[576px]:mr-0 max-[576px]:mb-2">{label}</label>}
            <div className="grow min-w-0 relative">
                <Select value={String(value)} onValueChange={(val) => onChange(Number(val))} items={items} disabled={disabled} triggerClassName={triggerClassName} size={size} />
            </div>
        </div>
    );
}
export const SettingTypeSelect = React.memo(SettingTypeSelectComponent);
