import clsx from 'clsx';
import { ReactNode } from 'react';

export function AnimatedRoute({ children, className }: { children: ReactNode, className?: string }) {
    return (
        <div
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
        </div>
    );
}
