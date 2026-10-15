import { Tabs } from 'radix-ui';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ComponentProps } from 'react';

export function TabContent({ direction = 1, children, className, ...props }: ComponentProps<typeof Tabs.Content> & { direction?: number }) {
    const reduced = useReducedMotion();
    return <Tabs.Content {...props} className="min-w-0">
        {/* A local presence boundary keeps the route's initial=false from suppressing tab entrances. */}
        <AnimatePresence><motion.div key={props.value} className={className} data-ui-transition="tab"
            initial={reduced ? false : { opacity: 0, x: direction * 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}>{children}</motion.div></AnimatePresence>
    </Tabs.Content>;
}
