import { AnimatePresence, motion } from 'framer-motion';
import { useMatches, Outlet } from '@tanstack/react-router';
import { AnimationProvider } from '@/context/AnimationContext';
import { useSmartAnimation } from '@/hooks/useSmartAnimation';
import React from 'react';
import clsx from 'clsx';

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        zIndex: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

export function RouteAnimationContainer({ children }: { children: React.ReactNode }) {
    const direction = useSmartAnimation();
    const matches = useMatches();

    // matches[0] is the root route. matches[1] is the child route (e.g. docs, or home).
    // We want to render the component of the child route.
    const match = matches[1];

    if (!match) {
        return <>{children}</>;
    }

    // Accessing component from the route definition associated with the match
    // We cast to any because the strict type might not expose .route.component directly on RouteMatch in all versions
    const Component = (match as any).route?.component || (match as any).component;

    if (!Component) {
        return <>{children}</>;
    }

    return (
        <AnimationProvider value={{ direction }}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                    key={match.id}
                    className={clsx(
                        // Crucial for popLayout: absolute positioning to allow overlap
                        'absolute inset-0',
                        // Size and box model
                        'w-full h-full box-border',
                        // Scrolling (if we want the scroll container to animate)
                        'overflow-y-auto overflow-x-hidden',
                        // Performance hints
                        'will-change-[transform,opacity]'
                    )}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <Component />
                </motion.div>
            </AnimatePresence>
        </AnimationProvider>
    );
}
