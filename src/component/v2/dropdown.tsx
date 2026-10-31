import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import * as React from "react";
import { cn, ui } from "./styles";

const Dropdown = DropdownMenuPrimitive.Root;
const DropdownTrigger = DropdownMenuPrimitive.Trigger;
const DropdownGroup = DropdownMenuPrimitive.Group;
const DropdownRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownContent = ({ className, sideOffset = 5, children, style, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            data-ui-transition="popover"
            sideOffset={sideOffset}
            onWheel={(e) => e.stopPropagation()}
            style={{ minWidth: "min(12rem, calc(100vw - 24px))", maxWidth: "min(520px, var(--radix-dropdown-menu-content-available-width), calc(100vw - 24px))", ...style }}
            className={cn(
                ui.menuSurface,
                "min-w-[12rem] p-1 flex flex-col w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[var(--radix-dropdown-menu-content-available-height)]",
                className
            )}
            {...props}
        >
            <div className="max-h-[min(320px,calc(var(--radix-dropdown-menu-content-available-height)-1rem))] overflow-y-auto overscroll-contain w-full">
                {children}
            </div>
        </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
);
DropdownContent.displayName = "DropdownContent";


const DropdownItem = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
    <DropdownMenuPrimitive.Item className={cn(ui.menuItem, className)} {...props} />
);
DropdownItem.displayName = "DropdownItem";


// 1. Added: DropdownLabel (for group titles)
const DropdownLabel = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
    <DropdownMenuPrimitive.Label
        className={cn("px-3 py-1.5 text-xs font-medium text-ui-muted", className)}
        {...props}
    />
);
DropdownLabel.displayName = "DropdownLabel";

// 2. Added: DropdownCheckboxItem (alternative to Form.Check)
const DropdownCheckboxItem = ({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
    <DropdownMenuPrimitive.CheckboxItem className={cn(ui.menuItem, className)} {...props}>
        <span className="min-w-0 truncate">{children}</span>
        <DropdownMenuPrimitive.ItemIndicator className={ui.menuIndicator}>
            <Check size={14} />
        </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.CheckboxItem>
);
DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

const DropdownRadioItem = ({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) => (
    <DropdownMenuPrimitive.RadioItem className={cn(ui.menuItem, className)} {...props}>
        <span className="min-w-0 truncate">{children}</span>
        <DropdownMenuPrimitive.ItemIndicator className={ui.menuIndicator}>
            <Check size={14} />
        </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
);
DropdownRadioItem.displayName = "DropdownRadioItem";

export {
    Dropdown, DropdownCheckboxItem, DropdownContent, DropdownGroup, DropdownItem,
    DropdownLabel, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger
};
