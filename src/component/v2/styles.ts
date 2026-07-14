import { clsx, type ClassValue } from "clsx";

export const cn = (...values: ClassValue[]) => clsx(values);

export type IconTone = "primary" | "success" | "warning" | "info" | "danger" | "neutral" | "violet";

export const iconToneStyles: Record<IconTone, { color: string; border: string; background: string }> = {
    primary: {
        color: "var(--color-primary)",
        border: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
        background: "var(--color-primary-soft)",
    },
    success: {
        color: "var(--color-success)",
        border: "color-mix(in srgb, var(--color-success) 20%, transparent)",
        background: "var(--color-success-soft)",
    },
    warning: {
        color: "var(--color-warning)",
        border: "color-mix(in srgb, var(--color-warning) 20%, transparent)",
        background: "var(--color-warning-soft)",
    },
    info: {
        color: "var(--color-info)",
        border: "color-mix(in srgb, var(--color-info) 20%, transparent)",
        background: "var(--color-info-soft)",
    },
    danger: {
        color: "var(--color-danger)",
        border: "color-mix(in srgb, var(--color-danger) 20%, transparent)",
        background: "var(--color-danger-soft)",
    },
    neutral: {
        color: "var(--color-muted)",
        border: "var(--color-border)",
        background: "var(--color-surface-muted)",
    },
    violet: {
        color: "var(--color-violet)",
        border: "color-mix(in srgb, var(--color-violet) 20%, transparent)",
        background: "var(--color-violet-soft)",
    },
};

export const ui = {
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus",
    interactive: "transition-colors duration-150 ease-in-out",
    disabled: "disabled:opacity-60 disabled:pointer-events-none aria-disabled:opacity-60 aria-disabled:pointer-events-none",
    card: "bg-ui-surface border border-ui-border rounded-ui-xl shadow-ui-card",
    cardInteractive: "transition-[border-color,box-shadow,transform] duration-300 hover:border-ui-primary/30 hover:shadow-ui-elevated",
    field: "block w-full h-field px-3.5 text-[0.9375rem] font-normal leading-normal text-ui-fg bg-ui-bg border border-ui-border rounded-ui-md shadow-inner-subtle appearance-none outline-none transition-colors duration-150",
    fieldFocus: "focus:border-ui-primary focus:shadow-ui-focus focus:z-[2] focus:outline-none",
    fieldReadonly: "read-only:bg-ui-surface-muted read-only:cursor-default read-only:focus:border-ui-border read-only:focus:shadow-none",
    fieldDisabled: "disabled:bg-ui-surface-muted disabled:text-ui-muted disabled:cursor-not-allowed disabled:shadow-none",
    listRow: "flex items-center min-h-list-row p-4 cursor-pointer rounded-ui-md border border-transparent bg-ui-list transition-colors duration-200 hover:bg-ui-list-hover hover:border-ui-list-border-hover",
    sectionLabel: "block mb-2 text-[13px] font-medium leading-[1.2] text-ui-muted whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer",
    mutedText: "text-ui-muted",
    pageTitle: "font-semibold text-[1.125rem] leading-tight text-ui-heading",
    pageDescription: "mt-0.5 text-xs text-ui-muted",
    softPanel: "rounded-ui-lg bg-ui-surface-muted border border-ui-border",
    chip: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-ui-chip text-ui-chip-fg",
    switchTrack: "w-[42px] h-[25px] shrink-0 bg-ui-surface-muted rounded-full relative shadow-inner-subtle flex items-center p-[2px] border border-ui-border cursor-pointer transition-colors duration-150 ease-in-out data-[state=checked]:bg-ui-primary disabled:opacity-50 disabled:cursor-not-allowed",
    switchThumb: "block h-[21px] w-[21px] translate-x-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-out will-change-transform data-[state=checked]:translate-x-[17px]",
};
