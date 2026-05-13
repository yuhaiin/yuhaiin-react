import { clsx, type ClassValue } from "clsx";

export const cn = (...values: ClassValue[]) => clsx(values);

export const ui = {
    focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus",
    interactive: "transition-colors duration-150 ease-in-out",
    disabled: "disabled:opacity-60 disabled:pointer-events-none aria-disabled:opacity-60 aria-disabled:pointer-events-none",
    card: "bg-ui-surface border border-ui-border rounded-ui-xl shadow-ui-card",
    cardInteractive: "transition-[border-color,box-shadow,transform] duration-300 hover:border-ui-primary/30 hover:shadow-ui-elevated",
    field: "block w-full h-field px-3.5 text-[0.9375rem] font-normal leading-normal text-ui-fg bg-ui-bg border border-ui-border rounded-ui-xs shadow-inner-subtle appearance-none outline-none transition-colors duration-150",
    fieldFocus: "focus:border-ui-primary focus:shadow-ui-focus focus:z-[2] focus:outline-none",
    fieldReadonly: "read-only:bg-ui-surface-muted read-only:cursor-default read-only:focus:border-ui-border read-only:focus:shadow-none",
    fieldDisabled: "disabled:bg-ui-surface-muted disabled:text-ui-muted disabled:cursor-not-allowed disabled:shadow-none",
    listRow: "flex items-center min-h-list-row p-4 cursor-pointer rounded-ui-md border border-transparent bg-ui-list transition-colors duration-200 hover:bg-ui-list-hover hover:border-ui-list-border-hover",
    sectionLabel: "block mb-2 text-[13px] font-medium leading-[1.2] text-ui-muted whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer",
};
