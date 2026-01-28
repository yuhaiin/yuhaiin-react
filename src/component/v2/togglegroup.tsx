import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import { LayoutGroup, motion } from "framer-motion";
import React, { createContext, useContext, useId } from "react";

/* -------------------------------------------------------------------------- */
/*                                ToggleGroup                                 */
/* -------------------------------------------------------------------------- */

const ToggleGroupContext = createContext<{ value?: string | string[], layoutId: string, noSlide?: boolean }>({ layoutId: "default" });

const ToggleGroup = ({ className, children, value, noSlide, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { noSlide?: boolean }) => {
    const layoutId = useId();

    return (
        <ToggleGroupPrimitive.Root
            className={clsx("inline-flex bg-transparent rounded-full", className)}
            value={value as any}
            {...props}
        >
            <ToggleGroupContext.Provider value={{ value, layoutId, noSlide }}>
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

    // If noSlide is true, we do NOT pass a layoutId to motion.div.
    // This disables the shared layout animation (the sliding effect).
    const indicatorLayoutId = context.noSlide ? undefined : `${context.layoutId}-indicator`;

    return (
        <ToggleGroupPrimitive.Item
            className={clsx(
                "bg-transparent text-sidebar-color border border-sidebar-border py-[6px] px-[12px] text-[0.875rem] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center -mr-px whitespace-nowrap",
                "first:rounded-l-[12px] last:rounded-r-[12px] last:mr-0",
                "hover:bg-sidebar-hover hover:z-10",
                "data-[state=on]:bg-transparent data-[state=on]:text-sidebar-active data-[state=on]:border-sidebar-active data-[state=on]:z-20 data-[state=on]:shadow-none data-[state=on]:font-semibold",
                "focus-visible:outline-2 focus-visible:outline-[var(--bs-secondary)] focus-visible:outline-offset-2 focus-visible:z-30",
                className
            )}
            value={value}
            {...props}
            style={{ position: 'relative', zIndex: 1, ...props.style }}
        >
            {isActive && (
                <motion.div
                    layoutId={indicatorLayoutId} // Unique layoutId per group OR undefined to disable sliding
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'var(--sidebar-active-bg)', // Use CSS var or fallback
                        borderRadius: 'inherit',
                        zIndex: -1,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    initial={context.noSlide ? { opacity: 0, scale: 0.95 } : undefined}
                    animate={context.noSlide ? { opacity: 1, scale: 1 } : undefined}
                    exit={context.noSlide ? { opacity: 0, scale: 0.95 } : undefined}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </span>
        </ToggleGroupPrimitive.Item>
    );
};

ToggleItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleItem };
