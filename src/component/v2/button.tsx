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

        return (
            <Comp
                className={clsx(
                    // Base Styles
                    "inline-flex items-center justify-center py-1.5 px-3 text-base font-medium leading-6 appearance-none bg-tertiary-bg border border-sidebar-border text-body-color rounded-[12px] transition-all duration-200 relative no-underline select-none align-middle",
                    // Hover
                    "hover:bg-sidebar-hover hover:border-sidebar-active hover:text-sidebar-active hover:z-[2] hover:no-underline",
                    // Active / Focus
                    "focus:outline-none active:bg-sidebar-hover active:border-sidebar-active active:text-sidebar-active active:shadow-none active:outline-none active:z-[3] focus-visible:bg-sidebar-hover focus-visible:border-sidebar-active focus-visible:text-sidebar-active focus-visible:shadow-none focus-visible:outline-none focus-visible:z-[3]",
                    // Disabled
                    "disabled:bg-tertiary-bg disabled:!border-sidebar-border disabled:text-body-color disabled:opacity-65 disabled:pointer-events-none disabled:z-0",

                    {
                        // Danger
                        " !bg-danger !border-danger !text-white hover:!border-[#b02a37] hover:!text-white hover:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] active:!border-[#b02a37] active:!text-white active:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] focus-visible:!border-[#b02a37] focus-visible:!text-white focus-visible:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] disabled:!bg-danger disabled:!border-danger disabled:!opacity-65": variant === "danger",

                        // Outline Danger
                        "!bg-transparent !border !border-danger !text-danger hover:!bg-danger hover:!text-white active:!bg-danger active:!border-[#b02a37] active:!text-white active:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] focus-visible:!bg-danger focus-visible:!border-[#b02a37] focus-visible:!text-white focus-visible:!shadow-[0_0_0_0.25rem_rgba(220,53,69,0.5)] disabled:!bg-transparent disabled:!text-danger disabled:!opacity-50": variant === "outline-danger",

                        // Primary (Secondary Gray Style)
                        "!bg-sidebar-active !border-sidebar-active !text-white hover:!bg-sidebar-active hover:!border-sidebar-active hover:!text-white hover:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] hover:!opacity-90 active:!bg-sidebar-active active:!border-sidebar-active active:!text-white active:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] active:!opacity-90 focus-visible:!bg-sidebar-active focus-visible:!border-sidebar-active focus-visible:!text-white focus-visible:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] focus-visible:!opacity-90 disabled:!bg-sidebar-active disabled:!border-sidebar-active disabled:!opacity-65": variant === "primary",

                        // Outline Primary
                        "!bg-transparent !border !border-sidebar-active !text-sidebar-active hover:!bg-sidebar-active hover:!text-white active:!bg-transparent active:!border-sidebar-active active:!text-sidebar-active active:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] focus-visible:!bg-transparent focus-visible:!border-sidebar-active focus-visible:!text-sidebar-active focus-visible:!shadow-[0_0_0_0.25rem_var(--sidebar-active-color)] disabled:!bg-transparent disabled:!text-sidebar-active disabled:!opacity-50": variant === "outline-primary",

                        // Outline Secondary (Default-ish)
                        "!bg-transparent !border !border-sidebar-border !text-sidebar-color hover:!bg-sidebar-hover hover:!border-sidebar-active hover:!text-sidebar-active": variant === "outline-secondary",

                        // Sizes
                        "!text-sm !rounded-[12px]": size === "sm",
                        "!px-[0.4rem] !py-[0.15rem] !text-xs !rounded-[6px]": size === "xs",
                        "!p-[0.4rem] !inline-flex !items-center !justify-center !leading-none !flex-none !w-auto [&>svg]:!text-[1rem] [&>svg]:!align-middle": size === "icon",
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
