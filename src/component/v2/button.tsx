import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { HTMLMotionProps, motion, useReducedMotion } from 'motion/react';
import * as React from "react";
import { Spinner } from "./spinner";
import { cn, ui } from "./styles";

const MotionSlot = motion.create(Slot);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "ghost" | "default" | "danger" | "outline-danger" | "outline-secondary" | "primary" | "outline-primary";
    size?: "default" | "sm" | "xs" | "icon";
    groupPosition?: "first" | "middle" | "last" | "single";
    animated?: boolean;
    /** Native buttons retain their label and width while an action is pending. */
    loading?: boolean;
}

type CombinedButtonProps = ButtonProps & HTMLMotionProps<"button">;

const Button = React.forwardRef<HTMLButtonElement, CombinedButtonProps>(
    ({ className, variant = "default", asChild = false, size = "default", groupPosition, animated = false, loading = false, children, disabled, ...props }, ref) => {
        const reducedMotion = useReducedMotion();
        const hasMotionProps = animated ||
            "whileHover" in props ||
            "whileTap" in props ||
            "animate" in props ||
            "initial" in props ||
            "exit" in props ||
            "layout" in props ||
            "transition" in props;
        const Comp = (asChild ? (hasMotionProps ? MotionSlot : Slot) : (hasMotionProps ? motion.button : "button")) as React.ElementType;

        const radiusClasses = {
            first: '!rounded-r-none !border-r-0',
            last: '!rounded-l-none',
            middle: '!rounded-none !border-r-0',
            single: '',
        };
        const radiusClass = groupPosition ? radiusClasses[groupPosition] : '';

        const baseStyles = clsx(
            "inline-flex items-center justify-center whitespace-nowrap gap-2 px-3 py-1.5 text-sm leading-normal font-medium font-inherit appearance-none shadow-none cursor-pointer border rounded-ui-md relative no-underline select-none align-middle",
            "transition-[color,background-color,border-color,transform,scale] duration-150 ease-out active:duration-100 motion-safe:active:scale-[0.98]",
            ui.focusRing,
            ui.disabled
        );

        const variantStyles = {
            ghost: "bg-transparent border-transparent text-ui-muted hover:bg-ui-hover hover:text-ui-fg active:bg-ui-surface-muted data-[state=open]:bg-ui-hover",
            default: "bg-ui-surface border-ui-border text-ui-fg hover:bg-ui-hover hover:border-ui-border-strong active:bg-ui-surface-muted data-[state=open]:bg-ui-hover",
            danger: "bg-ui-danger border-ui-danger text-ui-danger-foreground hover:brightness-95 active:brightness-90",
            "outline-danger": "bg-transparent border-ui-danger/50 text-ui-danger hover:bg-ui-danger-soft hover:border-ui-danger active:bg-ui-danger-soft",
            primary: "bg-ui-primary border-transparent text-ui-primary-foreground hover:bg-ui-primary-hover active:bg-ui-primary-active data-[state=open]:bg-ui-primary-active",
            "outline-primary": "bg-transparent border-ui-primary/60 text-ui-primary hover:bg-ui-primary-soft hover:border-ui-primary active:bg-ui-primary-soft data-[state=open]:bg-ui-primary-soft",
            "outline-secondary": "bg-transparent border-ui-border text-ui-muted hover:bg-ui-hover hover:border-ui-border-strong hover:text-ui-fg active:bg-ui-surface-muted",
        };

        const sizeStyles = {
            default: "h-field",
            sm: "h-field-sm px-3 text-sm rounded-ui-md",
            xs: "h-7 px-2 text-xs rounded-ui-sm",
            icon: "p-1.5 inline-flex items-center justify-center leading-none flex-none h-field-sm w-8 [&>i]:text-[1rem] [&>i]:align-middle [&>svg]:text-[1rem] [&>svg]:align-middle"
        };

        const motionProps: HTMLMotionProps<"button"> = animated && !reducedMotion ? {
            whileTap: { scale: 0.98 },
            transition: { duration: 0.1, ease: "easeOut" },
        } : {};

        return (
            <Comp
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    "max-sm:min-h-11",
                    size === "icon" && "max-sm:min-w-11",
                    radiusClass,
                    className
                )}
                ref={ref}
                {...motionProps}
                {...props}
                disabled={disabled || loading}
                aria-busy={loading || props['aria-busy']}
            >
                {asChild ? children : <span className={cn("inline-flex w-full min-w-0 items-center justify-[inherit] gap-[inherit] [&>svg]:m-0 [&_svg]:size-4 [&_svg]:shrink-0", loading && "opacity-0")}>{children}</span>}
                {loading && !asChild && <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><Spinner size="sm" /></span>}
            </Comp>
        )
    }
)

Button.displayName = "Button"

export { Button };
