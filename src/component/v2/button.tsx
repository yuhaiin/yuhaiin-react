import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { HTMLMotionProps, motion } from 'motion/react';
import * as React from "react";
import { ui } from "./styles";

const MotionSlot = motion.create(Slot);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "danger" | "outline-danger" | "outline-secondary" | "primary" | "outline-primary";
    size?: "default" | "sm" | "xs" | "icon";
    groupPosition?: "first" | "middle" | "last" | "single";
    animated?: boolean;
}

type CombinedButtonProps = ButtonProps & HTMLMotionProps<"button">;

const Button = React.forwardRef<HTMLButtonElement, CombinedButtonProps>(
    ({ className, variant = "default", asChild = false, size = "default", groupPosition, animated = false, ...props }, ref) => {
        const hasMotionProps = animated ||
            "whileHover" in props ||
            "whileTap" in props ||
            "animate" in props ||
            "initial" in props ||
            "exit" in props ||
            "layout" in props ||
            "transition" in props;
        const Comp = asChild ? (hasMotionProps ? MotionSlot : Slot) : (hasMotionProps ? motion.button : "button");

        const radiusClasses = {
            first: 'rounded-r-none border-r-0',
            last: 'rounded-l-none',
            middle: 'rounded-none border-r-0',
            single: '',
        };
        const radiusClass = groupPosition ? radiusClasses[groupPosition] : '';

        const baseStyles = clsx(
            "inline-flex items-center justify-center py-1.5 px-3 text-base leading-normal font-medium font-inherit appearance-none shadow-none cursor-pointer border rounded-ui-md relative no-underline select-none align-middle",
            ui.interactive,
            ui.focusRing,
            ui.disabled
        );

        const variantStyles = {
            default: clsx(
                "bg-ui-surface-muted border-ui-border text-ui-fg",
                "hover:bg-ui-hover hover:border-ui-primary hover:text-ui-primary hover:z-20",
                "active:bg-ui-hover active:border-ui-primary active:text-ui-primary active:shadow-none active:z-30",
                "data-[state=open]:bg-ui-hover data-[state=open]:border-ui-primary data-[state=open]:text-ui-primary data-[state=open]:shadow-none data-[state=open]:z-30"
            ),
            danger: clsx(
                "bg-ui-danger border-ui-danger text-white",
                "hover:border-ui-danger hover:text-white hover:shadow-ui-focus",
                "active:border-ui-danger active:text-white active:shadow-ui-focus",
                "data-[state=open]:border-ui-danger data-[state=open]:text-white data-[state=open]:shadow-ui-focus"
            ),
            "outline-danger": clsx(
                "bg-transparent border-ui-danger text-ui-danger",
                "hover:bg-ui-danger hover:text-white",
                "active:bg-ui-danger active:border-ui-danger active:text-white active:shadow-ui-focus",
                "data-[state=open]:bg-ui-danger data-[state=open]:border-ui-danger data-[state=open]:text-white data-[state=open]:shadow-ui-focus",
                "disabled:bg-transparent disabled:text-ui-danger disabled:opacity-50"
            ),
            primary: clsx(
                "bg-ui-primary border-ui-primary text-white",
                "hover:bg-ui-primary hover:border-ui-primary hover:text-white hover:shadow-ui-focus hover:opacity-90",
                "active:bg-ui-primary active:border-ui-primary active:text-white active:shadow-ui-focus active:opacity-90",
                "data-[state=open]:bg-ui-primary data-[state=open]:border-ui-primary data-[state=open]:text-white data-[state=open]:shadow-ui-focus data-[state=open]:opacity-90"
            ),
            "outline-primary": clsx(
                "bg-transparent border-ui-primary text-ui-primary",
                "hover:bg-ui-primary hover:text-white",
                "active:bg-transparent active:border-ui-primary active:text-ui-primary active:shadow-ui-focus",
                "data-[state=open]:bg-transparent data-[state=open]:border-ui-primary data-[state=open]:text-ui-primary data-[state=open]:shadow-ui-focus",
                "disabled:bg-transparent disabled:text-ui-primary disabled:opacity-50"
            ),
            "outline-secondary": clsx(
                "bg-transparent border-ui-border text-ui-muted",
                "hover:bg-ui-hover hover:border-ui-primary hover:text-ui-primary"
            )
        };

        const sizeStyles = {
            default: "",
            sm: "h-field-sm px-3 text-sm rounded-ui-md",
            xs: "py-[0.15rem] px-1.5 text-xs rounded-ui-xs",
            icon: "p-1.5 inline-flex items-center justify-center leading-none flex-none w-auto [&>i]:text-[1rem] [&>i]:align-middle [&>svg]:text-[1rem] [&>svg]:align-middle"
        };

        const motionProps = animated ? {
            whileHover: { scale: 1.05, filter: "brightness(1.05)" },
            whileTap: { scale: 0.95 },
            transition: { type: "spring", stiffness: 400, damping: 17 },
        } : {};

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
                {...motionProps}
                {...props}
            />
        )
    }
)

Button.displayName = "Button"

export { Button };
