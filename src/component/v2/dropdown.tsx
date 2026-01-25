import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import * as React from "react";
import styles from "./dropdown.module.css";

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
                className={clsx(styles.content, className)}
            >
                <div className={styles.scrollArea}>
                    {children}
                </div>
            </motion.div>
        </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
);
DropdownContent.displayName = "DropdownContent";


const DropdownItem = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
    <DropdownMenuPrimitive.Item
        className={clsx(styles.item, className)}
        {...props}
    />
);
DropdownItem.displayName = "DropdownItem";


// 1. Added: DropdownLabel (for group titles)
const DropdownLabel = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
    <DropdownMenuPrimitive.Label
        className={clsx(styles.label, className)}
        {...props}
    />
);
DropdownLabel.displayName = "DropdownLabel";

// 2. Added: DropdownCheckboxItem (alternative to Form.Check)
const DropdownCheckboxItem = ({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
    <DropdownMenuPrimitive.CheckboxItem
        className={clsx(styles.item, styles.checkboxItem, className)}
        checked={checked}
        {...props}
    >
        {/* Leave space on the left for the check icon */}
        <span className={styles.iconContainer}>
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
