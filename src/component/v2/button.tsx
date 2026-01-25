import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";
import styles from "./button.module.css";

const MotionSlot = motion(Slot);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "danger" | "outline-danger" | "outline-secondary" | "primary" | "outline-primary"; // Include used variants
    size?: "default" | "sm" | "xs" | "icon"; // Added size property
}

// Combine Motion props with Button props
// Using Omit to avoid type conflicts if any (though HTMLMotionProps extends HTMLAttributes)
type CombinedButtonProps = ButtonProps & HTMLMotionProps<"button">;

const Button = React.forwardRef<HTMLButtonElement, CombinedButtonProps>(
    ({ className, variant = "default", asChild = false, size = "default", ...props }, ref) => {
        const Comp = asChild ? MotionSlot : motion.button

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
                whileHover={{ scale: 1.05, filter: "brightness(1.05)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...props}
            />
        )
    }
)

Button.displayName = "Button"

export { Button };

