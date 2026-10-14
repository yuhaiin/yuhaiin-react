import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { createContext, useContext, useId, type ComponentProps } from 'react';
import { cn, ui } from './styles';

const Selection = createContext<{ value?: string | string[]; noSlide?: boolean }>({});

export function ToggleGroup({ className, children, value, noSlide, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root> & { noSlide?: boolean }) {
    const id = useId();
    return <ToggleGroupPrimitive.Root className={cn('inline-flex min-w-0 gap-1 rounded-ui-md bg-ui-surface-muted p-1', className)} value={value as never} {...props}>
        <Selection.Provider value={{ value, noSlide }}><LayoutGroup id={id}>{children}</LayoutGroup></Selection.Provider>
    </ToggleGroupPrimitive.Root>;
}

export function ToggleItem({ className, children, value, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
    const selection = useContext(Selection);
    const reduced = useReducedMotion();
    const active = selection.value === value || Array.isArray(selection.value) && selection.value.includes(value);
    return <ToggleGroupPrimitive.Item value={value} className={cn(
        'relative isolate inline-flex min-h-field-sm min-w-0 items-center justify-center rounded-ui-sm border-0 bg-transparent px-3 py-1.5 text-sm font-medium text-ui-muted transition-colors duration-[var(--motion-fast)] max-sm:min-h-11 hover:bg-ui-hover active:bg-ui-hover data-[state=on]:text-ui-heading disabled:pointer-events-none disabled:opacity-50',
        selection.value === undefined && 'data-[state=on]:bg-ui-surface', ui.focusRing, className,
    )} {...props}>
        {active && <motion.span aria-hidden="true" layoutId={selection.noSlide ? undefined : 'segment-selection'} className="absolute inset-0 -z-10 rounded-[inherit] bg-ui-surface shadow-ui-card"
            initial={false} transition={{ duration: reduced ? 0 : 0.16, ease: 'easeOut' }} />}
        <span className="inline-flex min-w-0 items-center justify-center gap-1.5 [&>svg]:size-4">{children}</span>
    </ToggleGroupPrimitive.Item>;
}
