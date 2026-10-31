import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeClasses = extendTailwindMerge({
    extend: {
        classGroups: {
            h: ['h-field', 'h-field-sm'],
            'min-h': ['min-h-field', 'min-h-field-sm'],
        },
    },
});

export const cn = (...values: ClassValue[]) => mergeClasses(clsx(values));

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
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface",
    interactive: "transition-colors duration-[var(--motion-fast)] ease-out",
    disabled: "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none",
    card: "bg-ui-surface border border-ui-border rounded-ui-lg",
    cardInteractive: "transition-colors duration-[var(--motion-fast)] hover:border-ui-primary/30",
    field: "block w-full h-field px-3 text-base sm:text-sm font-normal leading-normal text-ui-fg bg-ui-surface border border-ui-border rounded-ui-sm hover:border-ui-border-strong appearance-none outline-none transition-colors duration-[var(--motion-fast)]",
    fieldFocus: "aria-invalid:border-ui-danger aria-invalid:focus:border-ui-danger aria-invalid:focus:ring-ui-danger focus:border-ui-primary focus:ring-2 focus:ring-ui-primary focus:ring-offset-2 focus:ring-offset-ui-surface focus:z-[2] focus:outline-none",
    fieldReadonly: "read-only:bg-ui-readonly read-only:border-ui-border-strong/50 read-only:cursor-text",
    fieldDisabled: "disabled:bg-ui-disabled disabled:border-ui-disabled-border disabled:text-ui-disabled-fg disabled:cursor-not-allowed disabled:shadow-none",
    listRow: "flex items-center min-h-list-row px-3 py-2 cursor-pointer rounded-ui-md border border-transparent bg-ui-surface transition-colors duration-[var(--motion-fast)] hover:bg-ui-list-hover hover:border-ui-list-border-hover",
    sectionLabel: "block mb-2 text-[13px] font-normal leading-[1.5] text-ui-muted whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer",
    mutedText: "text-ui-muted",
    pageTitle: "font-semibold text-2xl leading-[var(--leading-heading)] tracking-tight text-ui-heading",
    sectionTitle: "m-0 text-base font-medium leading-snug text-ui-heading",
    cardTitle: "m-0 text-sm font-medium leading-snug text-ui-heading",
    bodyText: "text-sm font-normal leading-relaxed text-ui-fg",
    metadata: "text-xs font-normal text-ui-muted",
    pageDescription: "mt-0.5 text-xs text-ui-muted",
    softPanel: "rounded-ui-lg bg-ui-surface-muted border border-ui-border",
    chip: "rounded-full border border-ui-border px-2 py-0.5 text-xs font-normal leading-normal bg-ui-chip text-ui-chip-fg",
    selectTrigger: "flex min-w-0 w-full items-center justify-between gap-2 rounded-ui-sm border border-ui-border bg-ui-surface px-3 h-field max-sm:min-h-11 text-sm leading-none text-ui-fg cursor-pointer hover:bg-ui-hover hover:border-ui-border-strong data-[state=open]:border-ui-primary aria-invalid:border-ui-danger",
    menuSurface: "z-[2000] overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface-raised shadow-ui-elevated data-[state=closed]:animate-fadeOut data-[side=top]:data-[state=open]:animate-slideUpAndFadeIn data-[side=bottom]:data-[state=open]:animate-slideDownAndFadeIn",
    menuItem: "relative flex w-full min-w-0 items-center gap-2 min-h-8 max-sm:min-h-11 px-3 py-1.5 text-sm text-ui-fg text-left rounded-ui-sm select-none cursor-pointer outline-none transition-colors duration-[var(--motion-fast)] ease-out data-[highlighted]:bg-ui-menu-highlight data-[highlighted]:text-ui-heading data-[state=checked]:font-medium data-[state=checked]:text-ui-heading data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
    menuIndicator: "ml-auto shrink-0 inline-flex items-center justify-center text-ui-primary",
    switchTrack: "w-[42px] h-[24px] shrink-0 bg-ui-surface-muted rounded-full relative flex items-center p-[2px] border border-ui-border-strong cursor-pointer transition-colors duration-[var(--motion-fast)] ease-out data-[state=checked]:bg-ui-primary data-[state=checked]:border-ui-primary group-data-[disabled]:bg-ui-disabled group-data-[disabled]:border-ui-disabled-border disabled:cursor-not-allowed",
    switchThumb: "block h-[18px] w-[18px] translate-x-0 rounded-full bg-ui-heading data-[state=checked]:bg-ui-primary-foreground group-data-[disabled]:bg-ui-disabled-fg shadow-ui-control transition-transform duration-[var(--motion-normal)] ease-out will-change-transform data-[state=checked]:translate-x-[18px]",
};

/** Seconds for Motion; CSS durations use the corresponding global tokens. */
export const motionTiming = { fast: 0.12, normal: 0.16, slow: 0.2 } as const;
