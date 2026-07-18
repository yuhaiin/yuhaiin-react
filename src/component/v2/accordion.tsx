import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import React from 'react';

const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Root
        ref={ref}
        className={clsx(
            "relative flex min-w-0 max-w-full flex-col w-full rounded-ui-xl mb-8 border border-transparent shadow-ui-card",
            className
        )}
        {...props}
    />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={clsx(
            "min-w-0 max-w-full border border-ui-border bg-ui-surface overflow-hidden -mt-px",
            "first:mt-0 first:rounded-t-ui-xl last:rounded-b-ui-xl",
            "focus-within:relative focus-within:z-10 focus-within:border-ui-primary/40",
            "hover:relative hover:z-10 hover:border-ui-primary/40",
            className
        )}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="m-0 flex min-w-0">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={clsx(
                "group flex min-w-0 flex-1 items-center justify-between p-4 text-base font-medium leading-none text-sidebar-color bg-transparent border-0 border-b border-transparent cursor-pointer transition-colors duration-200 w-full text-left",
                "hover:!bg-sidebar-hover hover:!text-sidebar-active",
                "data-[state=open]:bg-sidebar-hover data-[state=open]:text-sidebar-active data-[state=open]:border-ui-border",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown
                className={clsx("shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180")}
                size={16}
                aria-hidden
            />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={clsx(
            // Match surface, not page bg — avoids a light band while height animates.
            "min-w-0 max-w-full overflow-hidden text-ui-fg bg-ui-surface will-change-[height]",
            "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
            className
        )}
        {...props}
    >
        <div className="min-w-0 w-full p-4">{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
