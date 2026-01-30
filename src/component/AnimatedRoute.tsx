import clsx from 'clsx';
import { ReactNode } from 'react';

export function AnimatedRoute({ children, className }: { children: ReactNode, className?: string }) {
    return (
        <div
            className={clsx(
                // layout
                'w-full h-full',

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
