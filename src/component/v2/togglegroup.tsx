import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import { LayoutGroup, motion } from "framer-motion";
import React, { createContext, useContext, useId } from "react";
import styles from "./togglegroup.module.css";

/* -------------------------------------------------------------------------- */
/*                                ToggleGroup                                 */
/* -------------------------------------------------------------------------- */

const ToggleGroupContext = createContext<{ value?: string | string[], layoutId: string, noSlide?: boolean }>({ layoutId: "default" });

const ToggleGroup = ({ className, children, value, noSlide, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { noSlide?: boolean }) => {
    const layoutId = useId();

    return (
        <ToggleGroupPrimitive.Root
            className={clsx(styles.root, className)}
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
            className={clsx(styles.item, className)}
            value={value}
            {...props}
            style={{ position: 'relative', zIndex: 1, ...props.style }}
        >
            {isActive && (
                <motion.div
                    layoutId={indicatorLayoutId} // Unique layoutId per group OR undefined to disable sliding
                    className={styles.indicator}
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
