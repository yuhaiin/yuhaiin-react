import { motion } from 'framer-motion';
import { useAnimation } from '@/context/AnimationContext';
import clsx from 'clsx';
import { ReactNode } from 'react';

const variants = {
    enter: (direction: number) => ({
        y: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        zIndex: 0,
    }),
    center: {
        zIndex: 1,
        y: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        y: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

export function AnimatedRoute({ children, className }: { children: ReactNode, className?: string }) {
    const { direction } = useAnimation();

    return (
        <motion.div
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={clsx(
                // positioning & size
                'absolute inset-0 box-border h-full w-full',

                // scrolling
                'overflow-y-auto overflow-x-hidden',

                // performance hints
                'will-change-[transform,opacity]',

                // padding - mobile
                'pt-[80px] px-[20px] pb-[20px]',

                // padding - desktop
                'lg:pt-[20px] lg:pl-[292px]',
                className
            )}
        >
            {children}
        </motion.div>
    );
}
