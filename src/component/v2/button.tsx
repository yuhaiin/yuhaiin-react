import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";

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

        const baseStyles = "inline-flex items-center justify-center px-3 py-1.5 text-base font-medium leading-[1.5] appearance-none bg-none shadow-none cursor-pointer bg-[var(--bs-tertiary-bg)] border border-[var(--sidebar-border-color)] text-[var(--bs-body-color)] rounded-xl transition-all duration-200 relative decoration-0 select-none align-middle hover:bg-[var(--sidebar-hover-bg)] hover:border-[var(--sidebar-active-color)] hover:text-[var(--sidebar-active-color)] hover:z-[2] hover:decoration-0 active:bg-[var(--sidebar-hover-bg)] active:border-[var(--sidebar-active-color)] active:text-[var(--sidebar-active-color)] active:shadow-none active:outline-none active:z-[3] focus-visible:bg-[var(--sidebar-hover-bg)] focus-visible:border-[var(--sidebar-active-color)] focus-visible:text-[var(--sidebar-active-color)] focus-visible:shadow-none focus-visible:outline-none focus-visible:z-[3] data-[state=open]:bg-[var(--sidebar-hover-bg)] data-[state=open]:border-[var(--sidebar-active-color)] data-[state=open]:text-[var(--sidebar-active-color)] data-[state=open]:shadow-none data-[state=open]:outline-none data-[state=open]:z-[3] disabled:bg-[var(--bs-tertiary-bg)] disabled:border-[var(--sidebar-border-color)] disabled:text-[var(--bs-body-color)] disabled:opacity-65 disabled:pointer-events-none";

        const variantStyles = {
            "default": "",
            "danger": "!bg-[var(--bs-danger)] !border-[var(--bs-danger)] !text-white hover:!border-[#b02a37] hover:!text-white hover:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] active:!border-[#b02a37] active:!text-white active:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] focus-visible:!border-[#b02a37] focus-visible:!text-white focus-visible:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
            "outline-danger": "!bg-transparent border border-[var(--bs-danger)] !text-[var(--bs-danger)] hover:!bg-[var(--bs-danger)] hover:!text-white active:!bg-[var(--bs-danger)] active:!border-[#b02a37] active:!text-white active:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] focus-visible:!bg-[var(--bs-danger)] focus-visible:!border-[#b02a37] focus-visible:!text-white focus-visible:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
            "primary": "!bg-[var(--sidebar-active-color)] !border-[var(--sidebar-active-color)] !text-white hover:opacity-90 active:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] focus-visible:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)]",
            "outline-primary": "!bg-transparent border border-[var(--sidebar-active-color)] !text-[var(--sidebar-active-color)] hover:!bg-[var(--sidebar-active-color)] hover:!text-white active:!bg-transparent active:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] focus-visible:!bg-transparent focus-visible:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)]",
            "outline-secondary": "!bg-transparent border border-[var(--sidebar-border-color)] !text-[var(--sidebar-color)] hover:!bg-[var(--sidebar-hover-bg)] hover:!border-[var(--sidebar-active-color)] hover:!text-[var(--sidebar-active-color)]"
        };

        const sizeStyles = {
            "default": "",
            "sm": "text-sm rounded-xl",
            "xs": "px-[0.4rem] py-[0.15rem] text-xs rounded-md",
            "icon": "p-[0.4rem] inline-flex items-center justify-center leading-none flex-none w-auto"
        };

        return (
            <Comp
                className={clsx(
                    baseStyles,
                    variant && variantStyles[variant],
                    size && sizeStyles[size],
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
