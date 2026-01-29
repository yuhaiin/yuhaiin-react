import React, { FC } from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    pill?: boolean;
}

const variantStyles: Record<string, string> = {
    primary: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    secondary: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    info: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    light: "bg-white/10 text-gray-800 dark:text-white",
    dark: "bg-gray-900/10 text-gray-900 dark:text-gray-100 dark:bg-white/10",
};

export const Badge: FC<BadgeProps> = ({ variant = "primary", pill, className, children, ...props }) => {
    return (
        <span
            className={clsx(
                "inline-flex items-center justify-center px-[0.65em] py-[0.35em] text-xs font-bold leading-none",
                variantStyles[variant] || variantStyles.primary,
                pill ? "rounded-full" : "rounded",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
