import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import React from 'react';
import { ChevronDown } from 'react-bootstrap-icons';
import styles from './accordion.module.css';

const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Root
        ref={ref}
        className={clsx(styles.accordion, className)}
        {...props}
    />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={clsx(styles.item, className)}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="d-flex m-0">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={clsx(styles.trigger, className)}
            {...props}
        >
            {children}
            <ChevronDown className={clsx(styles.chevron)} aria-hidden />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={clsx(styles.content, className)}
        {...props}
    >
        <div className={styles.contentInner}>{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
