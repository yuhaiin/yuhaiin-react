"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { clsx } from "clsx";
import { ChevronRight } from 'lucide-react';
import React from "react";
import styles from "./sidebar.module.css";

/* -------------------------------------------------------------------------- */
/*                                Sidebar Root                                */
/* -------------------------------------------------------------------------- */

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    show?: boolean;
    onHide?: () => void;
}

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// ... existing imports ...

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
                className={clsx(styles.root, className)}
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
                        className={clsx(styles.overlay, "lg:hidden")}
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
    <nav className={clsx(styles.list, className)} ref={ref} {...props} />
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
            className={clsx(styles.item, active && styles.active, className)}
            {...props}
        >
            {icon && icon}
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
                <button type="button" className={clsx(styles.item, styles.trigger, active && styles.active)}>
                    {icon}
                    {title}
                    <ChevronRight className={styles.triggerIcon} size={16} />
                </button>
            </CollapsiblePrimitive.Trigger>

            <CollapsiblePrimitive.Content className={styles.content}>
                <div className={styles.submenu}>
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
            className={clsx(styles.subLink, active && styles.active, className)}
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
    <div className={clsx(styles.divider, className)} {...props} />
);

export {
    Sidebar,
    SidebarCollapsible,
    SidebarDivider,
    SidebarItem,
    SidebarNav,
    SidebarSubLink
};
