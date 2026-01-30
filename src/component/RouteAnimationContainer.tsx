import { AnimatePresence, motion } from 'framer-motion';
import { useMatches } from '@tanstack/react-router';
import { AnimationProvider } from '@/context/AnimationContext';
import { useSmartAnimation } from '@/hooks/useSmartAnimation';
import React from 'react';

export function RouteAnimationContainer({ children }: { children: React.ReactNode }) {
    const direction = useSmartAnimation();
    const matches = useMatches();

    // matches[0] is the root route. matches[1] is the child route (e.g. docs, or home).
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
                <motion.div key={match.id} className="w-full h-full">
                    <Component />
                </motion.div>
            </AnimatePresence>
        </AnimationProvider>
    );
}
