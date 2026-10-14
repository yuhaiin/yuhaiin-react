import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { FC, ReactElement, ReactNode, cloneElement, isValidElement, useId, useState } from 'react';

/** Collision-aware tooltip. The trigger keeps its own accessible name. */
export const Tooltip: FC<{ children: ReactNode; content: ReactNode; id?: string; openOnClick?: boolean }> = ({ children, content, id, openOnClick = false }) => {
    const generatedId = useId();
    const [visible, setVisible] = useState(false);
    const [pinned, setPinned] = useState(false);
    return <TooltipPrimitive.Provider delayDuration={200}>
        <TooltipPrimitive.Root open={visible} onOpenChange={next => { if (!pinned) setVisible(next); }}>
            <TooltipPrimitive.Trigger asChild>
                <span className="inline-flex" onBlur={() => { setVisible(false); setPinned(false); }}
                    onClick={openOnClick ? () => { setVisible(!pinned); setPinned(!pinned); } : undefined}>
                    {isValidElement(children) ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
                        'aria-describedby': [...new Set([children.props && (children.props as { 'aria-describedby'?: string })['aria-describedby'], visible ? id ?? generatedId : undefined].filter(Boolean))].join(' ') || undefined,
                    }) : children}
                </span>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content id={id ?? generatedId} data-ui-transition="popover" sideOffset={6} collisionPadding={8}
                    onEscapeKeyDown={() => { setPinned(false); setVisible(false); }}
                    className="z-[9999] max-w-[min(240px,calc(100vw-16px))] rounded-ui-lg border border-ui-border bg-ui-surface-raised px-3 py-2 text-xs leading-normal text-ui-fg shadow-ui-elevated data-[state=delayed-open]:animate-slideUpAndFade data-[state=instant-open]:animate-slideUpAndFade data-[state=closed]:animate-fadeOut">
                    {content}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>;
};
