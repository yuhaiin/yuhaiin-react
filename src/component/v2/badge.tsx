import React, { FC } from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "muted";
    pill?: boolean;
    dot?: boolean;
}

const variantStyles: Record<string, string> = {
    primary: "bg-ui-primary-soft text-ui-primary",
    secondary: "bg-ui-chip text-ui-chip-fg border-ui-border",
    muted: "bg-ui-chip text-ui-chip-fg border-ui-border",
    success: "bg-ui-success-soft text-ui-success",
    danger: "bg-ui-danger-soft text-ui-danger",
    warning: "bg-ui-warning-soft text-ui-warning",
    info: "bg-ui-info-soft text-ui-info",
    light: "bg-white/10 text-ui-heading",
    dark: "bg-ui-chip text-ui-heading",
};

export const Badge: FC<BadgeProps> = ({ variant = "secondary", pill, dot, className, children, ...props }) => {
    return (
        <span
            className={clsx(
                "inline-flex items-center justify-center gap-1.5 border border-transparent px-2 py-0.5 text-xs font-medium leading-[1.4] tabular-nums",
                variantStyles[variant] || variantStyles.primary,
                pill ? "rounded-full" : "rounded-ui-xs",
                className
            )}
            {...props}
        >
            {dot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />}{children}
        </span>
    );
};
