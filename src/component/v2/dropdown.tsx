import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import * as React from "react";

const Dropdown = DropdownMenuPrimitive.Root;
const DropdownTrigger = DropdownMenuPrimitive.Trigger;
const DropdownGroup = DropdownMenuPrimitive.Group;

const DropdownContent = ({ className, sideOffset = 4, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            sideOffset={sideOffset}
            asChild
            onWheel={(e) => e.stopPropagation()}
            {...props}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={clsx(
                    "z-[2000] flex flex-col min-w-[12rem] w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)] py-2 rounded-[20px] bg-[var(--bs-body-bg,#ffffff)] border border-[var(--bs-border-color,#dee2e6)] shadow-[var(--bs-box-shadow,0_0.5rem_1rem_rgba(0,0,0,0.15))]",
                    className
                )}
            >
                <div className="w-full max-h-[300px] overflow-y-auto">
                    {children}
                </div>
            </motion.div>
        </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
);
DropdownContent.displayName = "DropdownContent";


const DropdownItem = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
    <DropdownMenuPrimitive.Item
        className={clsx(
            "relative flex w-full items-center px-4 py-1.5 pl-10 text-base text-[var(--bs-body-color,#212529)] select-none cursor-pointer outline-none bg-transparent border-none rounded-[20px] hover:bg-[var(--bs-tertiary-bg,#e9ecef)] hover:text-[var(--bs-emphasis-color,#000000)] focus:bg-[var(--bs-tertiary-bg,#e9ecef)] focus:text-[var(--bs-emphasis-color,#000000)] data-[highlighted]:bg-[var(--bs-tertiary-bg,#e9ecef)] data-[highlighted]:text-[var(--bs-emphasis-color,#000000)]",
            className
        )}
        {...props}
    />
);
DropdownItem.displayName = "DropdownItem";


// 1. Added: DropdownLabel (for group titles)
const DropdownLabel = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
    <DropdownMenuPrimitive.Label
        className={clsx(
            "px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--bs-secondary-color,#6c757d)] bg-[var(--bs-tertiary-bg,#f8f9fa)] border-b border-[var(--bs-border-color,#dee2e6)]",
            className
        )}
        {...props}
    />
);
DropdownLabel.displayName = "DropdownLabel";

// 2. Added: DropdownCheckboxItem (alternative to Form.Check)
const DropdownCheckboxItem = ({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
    <DropdownMenuPrimitive.CheckboxItem
        className={clsx(
            "relative flex w-full items-center px-4 py-1.5 pl-10 text-base text-[var(--bs-body-color,#212529)] select-none cursor-pointer outline-none bg-transparent border-none rounded-[20px] hover:bg-[var(--bs-tertiary-bg,#e9ecef)] hover:text-[var(--bs-emphasis-color,#000000)] focus:bg-[var(--bs-tertiary-bg,#e9ecef)] focus:text-[var(--bs-emphasis-color,#000000)] data-[highlighted]:bg-[var(--bs-tertiary-bg,#e9ecef)] data-[highlighted]:text-[var(--bs-emphasis-color,#000000)]",
            className
        )}
        checked={checked}
        {...props}
    >
        {/* Leave space on the left for the check icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 text-[var(--bs-primary,#0d6efd)]">
            <DropdownMenuPrimitive.ItemIndicator>
                <CheckIcon />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
);
DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

export {
    Dropdown, DropdownCheckboxItem, DropdownContent, DropdownGroup, DropdownItem,
    DropdownLabel, DropdownTrigger
};
