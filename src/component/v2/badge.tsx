import React, { FC } from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "muted";
    pill?: boolean;
}

const variantStyles: Record<string, string> = {
    primary: "bg-ui-primary-soft text-ui-primary",
    secondary: "bg-ui-chip text-ui-chip-fg",
    muted: "bg-ui-chip text-ui-chip-fg",
    success: "bg-ui-success-soft text-ui-success",
    danger: "bg-ui-danger-soft text-ui-danger",
    warning: "bg-ui-warning-soft text-ui-warning",
    info: "bg-ui-info-soft text-ui-info",
    light: "bg-white/10 text-ui-heading",
    dark: "bg-ui-chip text-ui-heading",
};

export const Badge: FC<BadgeProps> = ({ variant = "primary", pill, className, children, ...props }) => {
    return (
        <span
            className={clsx(
                "inline-flex items-center justify-center px-[0.65em] py-[0.35em] text-xs font-bold leading-none",
                variantStyles[variant] || variantStyles.primary,
                pill ? "rounded-full" : "rounded-ui-xs",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
