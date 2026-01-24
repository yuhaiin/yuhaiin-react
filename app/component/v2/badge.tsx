import React, { FC } from 'react';
// To completely remove BS dependency, we can use a span with classes.
import clsx from 'clsx';
// Global bootstrap CSS is available, so 'badge' class works.

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    pill?: boolean;
}

export const Badge: FC<BadgeProps> = ({ variant = "primary", pill, className, children, ...props }) => {
    // Basic mapping to Bootstrap classes
    // .text-bg-primary, .text-bg-secondary etc. are standard in BS5 for badges
    // or .bg-primary .text-light (older).
    // Let's use `text-bg-{variant}` which is the preferred BS5 way for badges that sets both bg and color.

    // Note: User wanted "secondary" style for buttons, maybe badges too?
    // Keep standard variants for now, user can choose 'secondary' when using the component.

    return (
        <span
            className={clsx(
                "badge",
                `text-bg-${variant}`,
                pill && "rounded-pill",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
