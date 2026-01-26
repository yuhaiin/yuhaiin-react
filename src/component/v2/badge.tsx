import { clsx } from 'clsx';
import React, { FC } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    pill?: boolean;
}

const variants = {
    primary: "bg-[var(--bs-primary)] text-[var(--bs-primary)]",
    secondary: "bg-[var(--bs-secondary)] text-[var(--bs-secondary)]",
    success: "bg-[var(--bs-success)] text-[var(--bs-success)]",
    danger: "bg-[var(--bs-danger)] text-[var(--bs-danger)]",
    warning: "bg-[var(--bs-warning)] text-[var(--bs-warning)]",
    info: "bg-[var(--bs-info)] text-[var(--bs-info)]",
    light: "bg-[var(--bs-light)] text-[var(--bs-light)]",
    dark: "bg-[var(--bs-dark)] text-[var(--bs-dark)]",
};

export const Badge: FC<BadgeProps> = ({ variant = "primary", pill, className, children, ...props }) => {
    return (
        <span
            className={clsx(
                "inline-block py-[0.35em] px-[0.65em] text-[0.75em] font-medium leading-none text-center whitespace-nowrap align-baseline border border-current bg-opacity-10",
                variants[variant],
                pill ? "rounded-[50rem]" : "rounded-[0.375rem]",
                className
            )}
            style={{
                // Fallback for opacity if Tailwind utility doesn't catch the variable reference correctly
                // Using standard CSS variable manipulation if possible, or just relying on the class.
                // Actually, the simplest way to get "bg-opacity-10" effect with variables that are Hex
                // is difficult without color-mix.
                // Let's use standard border and text, and a low opacity background.
                // But wait, the original code had `bg-opacity-10`.
                // Let's use `bg-opacity-10` utility from Tailwind which sets `--tw-bg-opacity: 0.1`.
                // For this to work with `bg-[var(--bs-primary)]`, strict Tailwind v4 might handle it?
                // If not, we might get solid colors.
                // Let's rely on `color-mix` for safety in style if needed, or better, use the RGB vars we know exist.
                backgroundColor: `rgba(var(--bs-${variant}-rgb), 0.1)`,
                color: `var(--bs-${variant})`,
                borderColor: `rgba(var(--bs-${variant}-rgb), 0.25)`
            }}
            {...props}
        >
            {children}
        </span>
    );
};
