import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import React from 'react';

const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Root
        ref={ref}
        className={clsx(
            "flex flex-col w-full rounded-[20px] mb-8 relative transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] bg-[var(--sidebar-bg)] border border-[var(--sidebar-border-color)] hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]",
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
            "border border-[var(--sidebar-border-color)] bg-[var(--bs-body-bg)] overflow-hidden -mt-[1px] first:mt-0 first:rounded-t-[20px] last:rounded-b-[20px] focus-within:z-10 focus-within:relative focus-within:border-[var(--sidebar-active-color)] hover:z-10 hover:relative hover:border-[var(--sidebar-active-color)]",
            className
        )}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex m-0">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={clsx(
                "group flex-1 flex items-center justify-between p-4 text-base font-medium leading-none text-[var(--sidebar-color)] bg-transparent border-none cursor-pointer transition-all duration-200 w-full text-left hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-active-color)] data-[state=open]:bg-[var(--sidebar-hover-bg)] data-[state=open]:text-[var(--sidebar-active-color)] data-[state=open]:border-b data-[state=open]:border-[var(--sidebar-border-color)]",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown
                className="transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180"
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
            "overflow-hidden text-[var(--sidebar-color)] bg-[var(--bs-body-bg)] data-[state=open]:animate-[accordionSlideDown_300ms_ease-out] data-[state=closed]:animate-[accordionSlideUp_300ms_ease-out]",
            className
        )}
        {...props}
    >
        <div className="p-4 w-full">{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
