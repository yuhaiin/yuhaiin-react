import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { motion } from 'motion/react';
import * as React from "react";
import { ui } from "./styles";

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
                    "bg-ui-surface border border-ui-border shadow-ui-elevated rounded-ui-xl min-w-[12rem] py-2 flex flex-col z-[2000] w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)] will-change-[transform,opacity]",
                    "data-[side=bottom]:animate-slideUpAndFade data-[side=top]:animate-slideDownAndFade data-[state=closed]:animate-fadeOut",
                    className
                )}
            >
                <div className="max-h-[300px] overflow-y-auto w-full">
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
            "relative flex items-center w-full py-1.5 px-4 pl-10 text-base text-ui-fg select-none cursor-pointer outline-none bg-transparent border-0 text-left no-underline rounded-ui-md",
            "hover:bg-ui-hover hover:text-ui-heading focus:bg-ui-hover focus:text-ui-heading",
            "data-[highlighted]:bg-ui-hover data-[highlighted]:text-ui-heading",
            ui.interactive,
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
            "py-2 px-4 text-xs font-bold uppercase tracking-[0.5px] text-ui-muted bg-ui-surface-muted border-b border-ui-border",
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
            "relative flex items-center w-full py-1.5 px-4 pl-10 text-base text-ui-fg select-none cursor-pointer outline-none bg-transparent border-0 text-left no-underline rounded-ui-md",
            "hover:bg-ui-hover hover:text-ui-heading focus:bg-ui-hover focus:text-ui-heading",
            "data-[highlighted]:bg-ui-hover data-[highlighted]:text-ui-heading",
            ui.interactive,
            className
        )}
        checked={checked}
        {...props}
    >
        {/* Leave space on the left for the check icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-ui-primary">
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
