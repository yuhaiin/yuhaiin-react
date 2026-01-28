"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from 'lucide-react';
import React from "react";

/* -------------------------------------------------------------------------- */
/*                                Sidebar Root                                */
/* -------------------------------------------------------------------------- */

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    show?: boolean;
    onHide?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, show, onHide, children, ...props }, ref) => {
    return (
        <>
            <motion.div
                ref={ref}
                className={clsx(
                    "fixed z-[1050] top-sidebar-gap h-[calc(100vh-2*var(--sidebar-gap))] w-[260px] bg-sidebar-bg text-sidebar-color rounded-sidebar-radius border border-sidebar-border shadow-sidebar py-6 overflow-y-auto backdrop-filter-none [&::-webkit-scrollbar]:w-0",
                    // Mobile specific overrides
                    "lg:w-[260px] w-[280px] max-w-[calc(100vw-32px)] lg:max-w-none lg:shadow-sidebar shadow-none lg:m-0",
                    "left-[-300px] lg:left-sidebar-gap",
                    className
                )}
                initial={false} // Prevent initial animation on hydration if possible, or just default.
                animate={show ? { x: 320 } : { x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                {...(props as any)}
            >
                {children}
            </motion.div>

            {/* Overlay for mobile - Only render when shown and NOT desktop */}
            <AnimatePresence>
                {show && (
                    <motion.div
                        className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1040] lg:hidden"
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
    <nav className={clsx("flex flex-col px-4 gap-[6px]", className)} ref={ref} {...props} />
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
                "flex items-center w-full px-[18px] py-[12px] text-[0.95rem] font-medium text-sidebar-color rounded-[14px] transition-all duration-200 border-none tracking-[0.3px] no-underline cursor-pointer bg-transparent outline-none focus:outline-none",
                "hover:bg-sidebar-hover hover:text-sidebar-active [&>svg]:hover:scale-[1.15] [&>svg]:hover:-rotate-[5deg]",
                active && "!bg-sidebar-active-bg !text-sidebar-active font-semibold shadow-sidebar-active",
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
                        "group flex items-center w-full px-[18px] py-[12px] text-[0.95rem] font-medium text-sidebar-color rounded-[14px] transition-all duration-200 border-none tracking-[0.3px] cursor-pointer bg-transparent outline-none focus:outline-none",
                        "hover:bg-sidebar-hover hover:text-sidebar-active [&>span>svg]:hover:scale-[1.15] [&>span>svg]:hover:-rotate-[5deg]",
                        active && "!bg-sidebar-active-bg !text-sidebar-active font-semibold shadow-sidebar-active"
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

            <CollapsiblePrimitive.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                <div className="relative ml-[28px] py-[6px] border-l border-sidebar-border">
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
                "relative flex items-center w-full pl-[24px] pr-[12px] py-[8px] text-[0.85rem] text-sidebar-color opacity-80 transition-colors duration-200 no-underline cursor-pointer bg-transparent border-none",
                "hover:opacity-100 hover:text-sidebar-active hover:bg-sidebar-hover hover:rounded-[8px] hover:translate-x-[4px]",
                // Active state
                active && "text-sidebar-active opacity-100 font-semibold hover:translate-x-0",
                // Dot indicator
                active && "before:content-[''] before:absolute before:left-[-4px] before:top-1/2 before:-translate-y-1/2 before:w-[7px] before:h-[7px] before:rounded-full before:bg-sidebar-bg before:border-2 before:border-sidebar-active before:shadow-sidebar-active before:z-10",
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
    <div className={clsx("border-t border-divider my-2 w-full", className)} {...props} />
);

export {
    Sidebar,
    SidebarCollapsible,
    SidebarDivider,
    SidebarItem,
    SidebarNav,
    SidebarSubLink
};
