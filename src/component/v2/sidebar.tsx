
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { clsx } from "clsx";
import { ChevronRight } from 'lucide-react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslation } from "react-i18next";
import React from "react";

/* -------------------------------------------------------------------------- */
/*                                Sidebar Root                                */
/* -------------------------------------------------------------------------- */

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    show?: boolean;
    onHide?: () => void;
    triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, show, onHide, triggerRef, children, ...props }, ref) => {
    const desktop = useMediaQuery('(min-width: 1024px)');
    const { t } = useTranslation('nav');
    React.useEffect(() => { if (desktop && show) onHide?.(); }, [desktop, show, onHide]);
    const panelClass = clsx(
        "fixed z-[1050] bg-sidebar-bg text-sidebar-color border border-sidebar-border shadow-sidebar py-5 overflow-y-auto [&::-webkit-scrollbar]:w-0",
        className
    );
    if (desktop) return (
        <div ref={ref} className={clsx(panelClass, "top-sidebar-gap left-sidebar-gap h-[calc(100dvh-2*var(--sidebar-gap))] w-[260px] rounded-sidebar-radius")} {...props}>
            {children}
        </div>
    );
    return (
        <DialogPrimitive.Root open={Boolean(show)} onOpenChange={open => !open && onHide?.()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="sidebar-backdrop fixed inset-0 bg-black/50 z-[1040]" />
                <DialogPrimitive.Content
                    ref={ref}
                    className={clsx(panelClass, "sidebar-drawer top-0 left-0 h-dvh w-[280px] max-w-[calc(100vw-32px)] pt-[max(20px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] outline-none")}
                    aria-describedby={undefined}
                    onCloseAutoFocus={event => { event.preventDefault(); triggerRef?.current?.focus(); }}
                    {...props}
                >
                    <div className="flex items-center justify-between px-5 pb-3">
                        <DialogPrimitive.Title className="text-sm font-semibold">{t('toggle')}</DialogPrimitive.Title>
                        <DialogPrimitive.Close className="flex h-11 w-11 items-center justify-center rounded-ui-md focus-visible:ring-2 focus-visible:ring-ui-focus" aria-label={t('ui:closeNavigation')}>×</DialogPrimitive.Close>
                    </div>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
});

Sidebar.displayName = "Sidebar";

/* -------------------------------------------------------------------------- */
/*                                Sidebar List                                */
/* -------------------------------------------------------------------------- */

const SidebarNav = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <nav className={clsx("flex flex-col px-3.5 gap-1", className)} ref={ref} {...props} />
));
SidebarNav.displayName = "SidebarNav";

/* -------------------------------------------------------------------------- */
/*                                Sidebar Item                                */
/* -------------------------------------------------------------------------- */

interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
    icon?: React.ReactNode;
}

const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(({ className, active, children, icon, ...props }, ref) => {
    return (
        <a
            ref={ref}
            aria-current={active ? "page" : undefined}
            className={clsx(
                "flex items-center w-full px-3.5 py-2.5 text-sm font-medium text-sidebar-color rounded-ui-md transition-colors duration-150 border-none no-underline cursor-pointer bg-transparent outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
                "hover:bg-sidebar-hover hover:text-sidebar-active",
                active && "!bg-sidebar-active-bg !text-sidebar-active font-semibold",
                className
            )}
            {...props}
        >
            {icon && (
                <span className="flex justify-center items-center text-[1.2rem] w-6 mr-[14px] transition-transform">
                    {icon}
                </span>
            )}
            {children}
        </a>
    );
});
SidebarItem.displayName = "SidebarItem";

/* -------------------------------------------------------------------------- */
/*                            Sidebar Collapsible                             */
/* -------------------------------------------------------------------------- */

interface SidebarCollapsibleProps extends Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, 'title'> {
    title: React.ReactNode;
    active?: boolean; // If true, highlights the trigger
    icon?: React.ReactNode;
}

const SidebarCollapsible = React.forwardRef<HTMLDivElement, SidebarCollapsibleProps>(({
    className,
    children,
    title,
    active,
    icon,
    defaultOpen,
    open,
    onOpenChange,
    ...props
}, ref) => {
    return (
        <CollapsiblePrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            className={clsx(className)}
            ref={ref}
            {...props}
        >
            <CollapsiblePrimitive.Trigger asChild>
                <button
                    type="button"
                    className={clsx(
                        "group flex items-center w-full px-3.5 py-2.5 text-sm font-medium text-sidebar-color rounded-ui-md transition-colors duration-150 border-none cursor-pointer bg-transparent outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg",
                        "hover:bg-sidebar-hover hover:text-sidebar-active",
                        active && "!bg-sidebar-active-bg !text-sidebar-active font-semibold"
                    )}
                >
                    {icon && (
                        <span className="flex justify-center items-center text-[1.2rem] w-6 mr-[14px] transition-transform">
                            {icon}
                        </span>
                    )}
                    {title}
                    <ChevronRight
                        className={clsx(
                            "ml-auto text-xs opacity-60 transition-transform w-auto",
                            "group-data-[state=open]:rotate-90 group-data-[state=open]:text-sidebar-active group-data-[state=open]:opacity-100"
                        )}
                        size={16}
                    />
                </button>
            </CollapsiblePrimitive.Trigger>

            <CollapsiblePrimitive.Content className="sidebar-section overflow-hidden">
                <div className="relative ml-6 py-1 border-l border-sidebar-border">
                    {children}
                </div>
            </CollapsiblePrimitive.Content>
        </CollapsiblePrimitive.Root>
    );
});
SidebarCollapsible.displayName = "SidebarCollapsible";

/* -------------------------------------------------------------------------- */
/*                            Sidebar SubLink                                 */
/* -------------------------------------------------------------------------- */

interface SidebarSubLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
}

const SidebarSubLink = React.forwardRef<HTMLAnchorElement, SidebarSubLinkProps>(({ className, active, children, ...props }, ref) => {
    return (
        <a
            ref={ref}
            aria-current={active ? "page" : undefined}
            className={clsx(
                "relative flex min-h-11 items-center w-full pl-5 pr-3 py-3 text-[0.8125rem] text-sidebar-color opacity-80 transition-[color,background-color,opacity] duration-150 no-underline cursor-pointer bg-transparent border-none rounded-ui-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-bg",
                "hover:opacity-100 hover:text-sidebar-active hover:bg-sidebar-hover",
                // Active state
                active && "!text-sidebar-active opacity-100 font-semibold",
                // Dot indicator
                active && "before:content-[''] before:absolute before:left-[-3px] before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:rounded-full before:bg-sidebar-active before:z-10",
                className
            )}
            {...props}
        >
            {children}
        </a>
    );
});
SidebarSubLink.displayName = "SidebarSubLink";

/* -------------------------------------------------------------------------- */
/*                                Sidebar Divider                             */
/* -------------------------------------------------------------------------- */

const SidebarDivider = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("border-t border-divider my-1.5 w-full", className)} {...props} />
);

export {
    Sidebar,
    SidebarCollapsible,
    SidebarDivider,
    SidebarItem,
    SidebarNav,
    SidebarSubLink
};
