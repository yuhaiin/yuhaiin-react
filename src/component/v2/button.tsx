import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import * as React from "react";
import styles from "./button.module.css";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "danger" | "outline-danger" | "outline-secondary" | "primary" | "outline-primary"; // Include used variants
    size?: "default" | "sm" | "xs" | "icon"; // Added size property
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", asChild = false, size = "default", ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                className={clsx(
                    styles['custom-btn'],
                    {
                        [styles["custom-btn-danger"]]: variant === "danger",
                        [styles["custom-btn-outline-danger"]]: variant === "outline-danger",
                        [styles["custom-btn-primary"]]: variant === "primary",
                        [styles["custom-btn-outline-primary"]]: variant === "outline-primary",

                        [styles.sm]: size === "sm",
                        [styles.xs]: size === "xs",
                        [styles.icon]: size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)

Button.displayName = "Button"

export { Button };

