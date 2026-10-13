import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import React from 'react';

const AccordionAppearance = React.createContext<'panel' | 'list'>('panel');

const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & { appearance?: 'panel' | 'list' }>(({ className, appearance = 'panel', ...props }, ref) => (
    <AccordionAppearance.Provider value={appearance}><AccordionPrimitive.Root
        ref={ref}
        className={clsx(
            "relative flex w-full min-w-0 max-w-full flex-col",
            appearance === 'list' ? "mb-0" : "mb-8 rounded-ui-xl border border-transparent shadow-ui-card",
            className
        )}
        {...props}
    /></AccordionAppearance.Provider>
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...props }, ref) => {
    const appearance = React.useContext(AccordionAppearance);
    return <AccordionPrimitive.Item ref={ref} className={clsx(
        "min-w-0 max-w-full overflow-hidden",
        appearance === 'list'
            ? "border-b border-ui-border/45 last:border-b-0"
            : "-mt-px border border-ui-border bg-ui-surface first:mt-0 first:rounded-t-ui-xl last:rounded-b-ui-xl focus-within:relative focus-within:z-10 focus-within:border-ui-primary/40 hover:relative hover:z-10 hover:border-ui-primary/40",
        className
    )} {...props} />;
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => {
    const appearance = React.useContext(AccordionAppearance);
    return <AccordionPrimitive.Header className="m-0 flex min-w-0">
        <AccordionPrimitive.Trigger ref={ref} className={clsx(
            "group flex w-full min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent text-left font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus",
            appearance === 'list'
                ? "rounded-ui-lg px-3 py-3.5 text-ui-fg hover:bg-ui-surface-muted/65 data-[state=open]:bg-ui-surface-muted/40"
                : "justify-between border-b border-transparent p-4 text-base leading-none text-sidebar-color hover:!bg-sidebar-hover hover:!text-sidebar-active data-[state=open]:border-ui-border data-[state=open]:bg-sidebar-hover data-[state=open]:text-sidebar-active",
            className
        )} {...props}>
            {children}
            <ChevronDown className={clsx("shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180", appearance === 'list' && 'text-ui-muted/60')} size={16} aria-hidden />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>;
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, style, ...props }, ref) => {
    const appearance = React.useContext(AccordionAppearance);
    const [contentHeight, setContentHeight] = React.useState<number>();
    const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

    const setContentRef = React.useCallback((node: HTMLDivElement | null) => {
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;

        if (!node) return;

        const updateHeight = () => {
            const nextHeight = node.scrollHeight;
            setContentHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight);
        };

        updateHeight();
        if (typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver(updateHeight);
        observer.observe(node);
        resizeObserverRef.current = observer;
    }, []);

    React.useEffect(() => () => resizeObserverRef.current?.disconnect(), []);

    const measuredStyle = contentHeight === undefined
        ? style
        : {
            ...style,
            "--radix-accordion-content-height": `${contentHeight}px`,
            "--radix-collapsible-content-height": `${contentHeight}px`,
        } as React.CSSProperties;

    return (
        <AccordionPrimitive.Content
            ref={ref}
            className={clsx(
                // Match surface, not page bg — avoids a light band while height animates.
                "min-w-0 max-w-full overflow-hidden text-ui-fg will-change-[height]",
                appearance === 'list' ? 'bg-transparent' : 'bg-ui-surface',
                "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
                className
            )}
            style={measuredStyle}
            {...props}
        >
            <div ref={setContentRef} className={clsx("min-w-0 w-full p-4", appearance === 'list' && 'pt-3 sm:pl-16')}>{children}</div>
        </AccordionPrimitive.Content>
    );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
