import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import { LayoutGroup, motion } from "framer-motion";
import React, { createContext, useContext, useId } from "react";

/* -------------------------------------------------------------------------- */
/*                                ToggleGroup                                 */
/* -------------------------------------------------------------------------- */

const ToggleGroupContext = createContext<{ value?: string | string[], layoutId: string }>({ layoutId: "default" });

const ToggleGroup = ({ className, children, value, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) => {
    const layoutId = useId();

    return (
        <ToggleGroupPrimitive.Root
            className={clsx("inline-flex bg-transparent rounded-full", className)}
            value={value as any}
            {...props}
        >
            <ToggleGroupContext.Provider value={{ value, layoutId }}>
                <LayoutGroup id={layoutId}>
                    {children}
                </LayoutGroup>
            </ToggleGroupContext.Provider>
        </ToggleGroupPrimitive.Root>
    );
};

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

/* -------------------------------------------------------------------------- */
/*                                ToggleItem                                  */
/* -------------------------------------------------------------------------- */

const ToggleItem = ({ className, children, value, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) => {
    const context = useContext(ToggleGroupContext);
    const isActive = context.value === value || (Array.isArray(context.value) && context.value.includes(value));

    return (
        <ToggleGroupPrimitive.Item
            className={clsx(
                "relative flex items-center justify-center bg-transparent px-3 py-1.5 text-sm font-medium text-[var(--sidebar-color)] border border-[var(--sidebar-border-color)] -mr-px cursor-pointer transition-all duration-200 first:rounded-l-xl last:rounded-r-xl last:mr-0 hover:bg-[var(--sidebar-hover-bg)] hover:z-10 focus-visible:outline-2 focus-visible:outline-[var(--bs-secondary)] focus-visible:outline-offset-2 focus-visible:z-30 data-[state=on]:bg-transparent data-[state=on]:text-[var(--sidebar-active-color)] data-[state=on]:border-[var(--sidebar-active-color)] data-[state=on]:z-20 data-[state=on]:font-semibold",
                className
            )}
            value={value}
            {...props}
            style={{ position: 'relative', zIndex: 1, ...props.style }}
        >
            {isActive && (
                <motion.div
                    layoutId={`${context.layoutId}-indicator`} // Unique layoutId per group
                    className="absolute inset-0 z-[-1] rounded-[inherit] bg-[var(--sidebar-active-bg)] shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            <span className="relative z-[2]">
                {children}
            </span>
        </ToggleGroupPrimitive.Item>
    );
};

ToggleItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleItem };
