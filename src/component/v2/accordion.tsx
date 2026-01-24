import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import React from 'react';
import { ChevronDown } from 'react-bootstrap-icons';
import styles from './accordion.module.css';

const Accordion = ({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) => (
    <AccordionPrimitive.Root
        className={clsx(styles.root, className)}
        {...props}
    />
);
Accordion.displayName = "Accordion";

const AccordionItem = ({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) => (
    <AccordionPrimitive.Item
        className={clsx(styles.item, className)}
        {...props}
    />
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = ({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
    <AccordionPrimitive.Header className="d-flex m-0">
        <AccordionPrimitive.Trigger
            className={clsx(styles.trigger, className)}
            {...props}
        >
            {children}
            <ChevronDown className={clsx(styles.chevron)} aria-hidden />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = ({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) => (
    <AccordionPrimitive.Content
        className={clsx(styles.content, className)}
        {...props}
    >
        <div className={styles.contentInner}>{children}</div>
    </AccordionPrimitive.Content>
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
