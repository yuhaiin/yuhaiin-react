import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";

const MotionSlot = motion(Slot);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "danger" | "outline-danger" | "outline-secondary" | "primary" | "outline-primary";
    size?: "default" | "sm" | "xs" | "icon";
    groupPosition?: "first" | "middle" | "last" | "single";
}

type CombinedButtonProps = ButtonProps & HTMLMotionProps<"button">;

const Button = React.forwardRef<HTMLButtonElement, CombinedButtonProps>(
    ({ className, variant = "default", asChild = false, size = "default", groupPosition, ...props }, ref) => {
        const Comp = asChild ? MotionSlot : motion.button

        const radiusClasses = {
            first: '!rounded-r-none !border-r-0',
            last: '!rounded-l-none',
            middle: '!rounded-none !border-r-0',
            single: '',
        };
        const radiusClass = groupPosition ? radiusClasses[groupPosition] : '';

        const baseStyles = "inline-flex items-center justify-center py-1.5 px-3 text-base leading-normal font-medium font-inherit appearance-none shadow-none cursor-pointer border rounded-[12px] transition-all duration-200 relative no-underline select-none align-middle focus:outline-none disabled:opacity-65 disabled:pointer-events-none aria-disabled:opacity-65 aria-disabled:pointer-events-none";

        const variantStyles = {
            default: clsx(
                "bg-[var(--bs-tertiary-bg)] border-sidebar-border text-[var(--bs-body-color)]",
                "hover:bg-sidebar-hover hover:border-sidebar-active hover:text-sidebar-active hover:z-20",
                "active:bg-sidebar-hover active:border-sidebar-active active:text-sidebar-active active:shadow-none active:outline-none active:z-30",
                "focus-visible:bg-sidebar-hover focus-visible:border-sidebar-active focus-visible:text-sidebar-active focus-visible:shadow-none focus-visible:outline-none focus-visible:z-30",
                "data-[state=open]:bg-sidebar-hover data-[state=open]:border-sidebar-active data-[state=open]:text-sidebar-active data-[state=open]:shadow-none data-[state=open]:outline-none data-[state=open]:z-30"
            ),
            danger: clsx(
                "!bg-[var(--bs-danger)] !border-[var(--bs-danger)] !text-white",
                "hover:!border-[#b02a37] hover:!text-white hover:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
                "active:!border-[#b02a37] active:!text-white active:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
                "focus-visible:!border-[#b02a37] focus-visible:!text-white focus-visible:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
                "data-[state=open]:!border-[#b02a37] data-[state=open]:!text-white data-[state=open]:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]"
            ),
            "outline-danger": clsx(
                "bg-transparent !border-[var(--bs-danger)] !text-[var(--bs-danger)]",
                "hover:!bg-[var(--bs-danger)] hover:!text-white",
                "active:!bg-[var(--bs-danger)] active:!border-[#b02a37] active:!text-white active:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
                "focus-visible:!bg-[var(--bs-danger)] focus-visible:!border-[#b02a37] focus-visible:!text-white focus-visible:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
                "data-[state=open]:!bg-[var(--bs-danger)] data-[state=open]:!border-[#b02a37] data-[state=open]:!text-white data-[state=open]:shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)]",
                "disabled:bg-transparent disabled:text-[var(--bs-danger)] disabled:opacity-50"
            ),
            primary: clsx(
                "!bg-sidebar-active !border-sidebar-active !text-white",
                "hover:!bg-sidebar-active hover:!border-sidebar-active hover:!text-white hover:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] hover:opacity-90",
                "active:!bg-sidebar-active active:!border-sidebar-active active:!text-white active:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] active:opacity-90",
                "focus-visible:!bg-sidebar-active focus-visible:!border-sidebar-active focus-visible:!text-white focus-visible:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] focus-visible:opacity-90",
                "data-[state=open]:!bg-sidebar-active data-[state=open]:!border-sidebar-active data-[state=open]:!text-white data-[state=open]:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] data-[state=open]:opacity-90"
            ),
            "outline-primary": clsx(
                "bg-transparent !border-sidebar-active !text-sidebar-active",
                "hover:!bg-sidebar-active hover:!text-white",
                "active:bg-transparent active:!border-sidebar-active active:!text-sidebar-active active:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)]",
                "focus-visible:bg-transparent focus-visible:!border-sidebar-active focus-visible:!text-sidebar-active focus-visible:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)]",
                "data-[state=open]:bg-transparent data-[state=open]:!border-sidebar-active data-[state=open]:!text-sidebar-active data-[state=open]:shadow-[0_0_0_0.25rem_var(--sidebar-active-color)]",
                "disabled:bg-transparent disabled:text-sidebar-active disabled:opacity-50"
            ),
            "outline-secondary": clsx(
                "bg-transparent !border-sidebar-border !text-sidebar-color",
                "hover:!bg-sidebar-hover hover:!border-sidebar-active hover:!text-sidebar-active"
            )
        };

        const sizeStyles = {
            default: "",
            sm: "h-8 px-3 text-sm rounded-[12px]", // .sm: h-8 (32px), font-size 0.875rem, radius 12px
            xs: "py-[0.15rem] px-[0.4rem] text-xs rounded-[6px]", // .xs
            icon: "p-[0.4rem] inline-flex items-center justify-center leading-none flex-none w-auto [&>i]:text-[1rem] [&>i]:align-middle [&>svg]:text-[1rem] [&>svg]:align-middle" // .icon
        };

        return (
            <Comp
                className={clsx(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    radiusClass,
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
