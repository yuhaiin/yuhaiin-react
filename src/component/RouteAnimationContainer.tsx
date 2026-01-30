import { AnimatePresence, motion } from 'framer-motion';
import { useMatches, Outlet } from '@tanstack/react-router';
import { AnimationProvider } from '@/context/AnimationContext';
import { useSmartAnimation } from '@/hooks/useSmartAnimation';
import React from 'react';

export function RouteAnimationContainer({ children }: { children: React.ReactNode }) {
    const direction = useSmartAnimation();
    const matches = useMatches();

    // matches[0] is the root route. matches[1] is the child route (e.g. docs, or home).
    // We want to render the component of the child route.
    const match = matches[1];

    if (!match) {
        return <>{children}</>;
    }

    const Component = match.component as React.ComponentType<any>;

    return (
        <AnimationProvider value={{ direction }}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div key={match.id} className="w-full h-full">
                    <Component />
                </motion.div>
            </AnimatePresence>
        </AnimationProvider>
    );
}
