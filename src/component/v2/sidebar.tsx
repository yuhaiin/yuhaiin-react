"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                                Sidebar Root                                */
/* -------------------------------------------------------------------------- */

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    show?: boolean;
    onHide?: () => void;
}

// Helper hook for media query
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);
    return matches;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, show, onHide, children, ...props }, ref) => {
    const isDesktop = useMediaQuery("(min-width: 992px)");

    // Determine animation state
    // On Desktop: Always visible (x: 0)
    // On Mobile: Visible if show=true, else Hidden (x: -100%)
    const animateState = isDesktop ? "visible" : (show ? "visible" : "hidden");

    const sidebarVariants = {
        hidden: { x: "calc(-100% - 80px)", opacity: 1 }, // Mobile Hidden: extra offset for margin
        visible: { x: "0%", opacity: 1 },    // Visible (Desktop or Mobile Open)
    };

    return (
        <>
            <motion.div
                ref={ref}
                className={clsx(
                    "fixed z-[1050] overflow-y-auto left-[var(--sidebar-gap)] top-[var(--sidebar-gap)] h-[calc(100vh-(var(--sidebar-gap)*2))] w-[260px] rounded-[var(--sidebar-radius)] border border-[var(--sidebar-border-color)] bg-[var(--sidebar-bg)] py-6 shadow-[var(--sidebar-box-shadow)] text-[var(--sidebar-color)] scrollbar-none lg:translate-x-0 lg:shadow-[var(--sidebar-box-shadow)] lg:max-w-none max-w-[calc(100vw-32px)] w-[280px] lg:w-[260px]",
                    className
                )}
                initial={false} // Prevent initial animation on hydration if possible, or just default.
                animate={animateState}
                variants={sidebarVariants}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                {...(props as any)}
            >
                {children}
            </motion.div>

            {/* Overlay for mobile - Only render when shown and NOT desktop */}
            <AnimatePresence>
                {show && !isDesktop && (
                    <motion.div
                        className="fixed inset-0 z-[1040] bg-black/50 lg:hidden"
                        onClick={onHide}
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
        </>
    );
});
Sidebar.displayName = "Sidebar";

/* -------------------------------------------------------------------------- */
/*                                Sidebar List                                */
/* -------------------------------------------------------------------------- */

const SidebarNav = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <nav className={clsx("flex flex-col gap-1.5 px-4 m-0 list-none", className)} ref={ref} {...props} />
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
            className={clsx(
                "group flex items-center w-full px-[18px] py-[12px] text-[0.95rem] font-medium text-[var(--sidebar-color)] rounded-[14px] transition-all duration-200 border border-transparent tracking-[0.3px] cursor-pointer hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-active-color)]",
                active && "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-color)] font-semibold shadow-[var(--sidebar-active-glow)] border-transparent",
                className
            )}
            {...props}
        >
            {icon && (
                <span className="mr-3.5 flex h-6 w-6 items-center justify-center text-[1.2rem] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-rotate-[5deg]">
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
                        "group flex items-center w-full px-[18px] py-[12px] text-[0.95rem] font-medium text-[var(--sidebar-color)] rounded-[14px] transition-all duration-200 border border-transparent tracking-[0.3px] cursor-pointer hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-active-color)]",
                        active && "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-color)] font-semibold shadow-[var(--sidebar-active-glow)] border-transparent"
                    )}
                >
                    {icon && (
                        <span className="mr-3.5 flex h-6 w-6 items-center justify-center text-[1.2rem] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-rotate-[5deg]">
                            {icon}
                        </span>
                    )}
                    {title}
                    <ChevronRight
                        className="ml-auto h-auto text-xs opacity-60 transition-transform duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:text-[var(--sidebar-active-color)] group-data-[state=open]:opacity-100"
                        size={16}
                    />
                </button>
            </CollapsiblePrimitive.Trigger>

            <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                <div className="relative ml-7 border-l border-[var(--sidebar-border-color)] py-1.5">
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
            className={clsx(
                "relative flex w-full items-center border-none bg-transparent px-3 py-2 text-[0.85rem] text-[var(--sidebar-color)] opacity-80 decoration-0 transition-all duration-200",
                !active && "hover:translate-x-1 hover:rounded-lg hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-active-color)] hover:opacity-100",
                active && "font-semibold text-[var(--sidebar-active-color)] opacity-100 transform-none before:absolute before:-left-[4px] before:top-1/2 before:z-10 before:block before:h-[7px] before:w-[7px] before:-translate-y-1/2 before:rounded-full before:border-[2px] before:border-[var(--sidebar-active-color)] before:bg-[var(--sidebar-bg)] before:shadow-[0_0_8px_var(--sidebar-active-color)] before:content-['']",
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
    <div className={clsx("w-full border-t border-[var(--divider-color)] my-2", className)} {...props} />
);

export {
    Sidebar,
    SidebarCollapsible,
    SidebarDivider,
    SidebarItem,
    SidebarNav,
    SidebarSubLink
};
