"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { clsx } from "clsx";
import React from "react";
import { ChevronRight } from 'react-bootstrap-icons';
import styles from "./sidebar.module.css";

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
            <div
                ref={ref}
                className={clsx(styles.root, show && styles.show, className)}
                {...props}
            >
                {children}
            </div>
            {/* Overlay for mobile */}
            <div
                className={clsx(styles.overlay, show && styles.show, "d-lg-none")}
                onClick={onHide}
                aria-hidden="true"
            />
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
                <button type="button" className={clsx(styles.trigger, active && styles.active)}>
                    {icon}
                    {title}
                    <ChevronRight className={styles.triggerIcon} />
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
