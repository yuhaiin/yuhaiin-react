"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import React from "react";
import styles from "./togglegroup.module.css";

/* -------------------------------------------------------------------------- */
/*                                ToggleGroup                                 */
/* -------------------------------------------------------------------------- */

const ToggleGroup = ({ className, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) => (
    <ToggleGroupPrimitive.Root
        className={clsx(styles.root, className)}
        {...props}
    >
        {children}
    </ToggleGroupPrimitive.Root>
);

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

/* -------------------------------------------------------------------------- */
/*                                ToggleItem                                  */
/* -------------------------------------------------------------------------- */

const ToggleItem = ({ className, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) => (
    <ToggleGroupPrimitive.Item
        className={clsx(styles.item, className)}
        {...props}
    >
        {children}
    </ToggleGroupPrimitive.Item>
);

ToggleItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleItem };
