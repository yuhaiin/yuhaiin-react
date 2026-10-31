import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type DragControls, type PanInfo } from 'motion/react';
import * as React from "react";
import { useLastClickPosition } from "../../hooks/use-last-click";
import { useMediaQuery } from "../../hooks/use-media-query";
import { cn, motionTiming, ui } from "./styles";

// --- Context ---
const ModalContext = React.createContext<{ open: boolean, transformOrigin: string, close: () => void }>({ open: false, transformOrigin: 'center center', close: () => undefined });
// Set only while the dialog renders as a bottom sheet, so the header can start a drag.
const SheetDragContext = React.createContext<DragControls | null>(null);

// --- Wrapper ---
// We wrap DialogPrimitive.Root to capture the open state and pass it down
const Modal: React.FC<React.ComponentProps<typeof DialogPrimitive.Root>> = ({ children, open, defaultOpen = false, onOpenChange, ...props }) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isOpen = open ?? internalOpen;
    const changeOpen = (next: boolean) => {
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
    };
    const getLastClick = useLastClickPosition();
    const [opening, setOpening] = React.useState({ open: isOpen, origin: "center center" });
    // Capture the click origin before the new open state is committed, so the
    // entrance animation starts from the correct point on its first frame.
    if (opening.open !== isOpen) {
        const pos = isOpen ? getLastClick() : { x: 0, y: 0 };
        setOpening({ open: isOpen, origin: pos.x !== 0 || pos.y !== 0
            ? `${pos.x}px ${pos.y}px` : "center center" });
    }
    const origin = opening.origin;

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={changeOpen} {...props}>
            <ModalContext.Provider value={{ open: isOpen, transformOrigin: origin, close: () => changeOpen(false) }}>
                {children}
            </ModalContext.Provider>
        </DialogPrimitive.Root>
    );
};

const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;


// --- Animations ---
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const contentVariants = {
    hidden: { opacity: 0, scale: 0.2, y: "-50%", x: "-50%" },
    visible: { opacity: 1, scale: 1, y: "-50%", x: "-50%", transition: {
        type: 'spring', stiffness: 300, damping: 25,
        opacity: { duration: motionTiming.normal, ease: 'easeOut' },
    } },
    exit: { opacity: 0, scale: 0.2, y: "-50%", x: "-50%", transition: { duration: motionTiming.slow, ease: 'easeInOut' } },
};

const sheetEase = [0.32, 0.72, 0, 1] as const;
const sheetVariants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { duration: 0.28, ease: sheetEase } },
    exit: { y: "100%", transition: { duration: motionTiming.slow, ease: 'easeIn' } },
};
const reducedSheetVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0 } },
    exit: { opacity: 0, transition: { duration: 0 } },
};
const SHEET_DISMISS_DISTANCE = 96;
const SHEET_DISMISS_VELOCITY = 500;

type ModalContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
    width?: number;
    /** Below md, slides up from the bottom edge and can be dragged down to close. */
    mobileSheet?: boolean;
};

// 1. Content Container
const ModalDialog = ({ className, children, style, width = 500, sheet, ...props }: Omit<ModalContentProps, 'mobileSheet'> & { sheet: boolean }) => {
    const { open, transformOrigin, close } = React.useContext(ModalContext);
    const reducedMotion = useReducedMotion();
    const dragControls = useDragControls();
    const finishDrag = (_: unknown, { offset, velocity }: PanInfo) => {
        if (offset.y > SHEET_DISMISS_DISTANCE || velocity.y > SHEET_DISMISS_VELOCITY) close();
    };
    // Resolve the viewport click in the centered dialog's local coordinates.
    // CSS keeps this correct when Radix locks scrolling or the viewport resizes.
    const localOrigin = transformOrigin === 'center center' ? transformOrigin
        : transformOrigin.split(' ').map((coordinate, index) => `calc(${coordinate} - 50${index === 0 ? 'vw' : 'dvh'} + 50%)`).join(' ');

    return (
        <AnimatePresence>
            {open && (
                <ModalPortal forceMount>
                    <DialogPrimitive.Overlay asChild forceMount>
                        <motion.div
                            data-ui-transition="overlay"
                            className="fixed inset-0 z-[1050] bg-black/50"
                            variants={overlayVariants}
                            transition={{ duration: reducedMotion ? 0 : motionTiming.normal }}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : motionTiming.slow } }}
                        />
                    </DialogPrimitive.Overlay>
                    <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                        <motion.div
                            data-ui-transition="dialog"
                            className={cn(
                                "fixed min-w-0 z-[1055] flex flex-col outline-none overflow-hidden bg-ui-surface-raised text-ui-fg border border-ui-border shadow-ui-elevated",
                                sheet
                                    ? "inset-x-0 bottom-0 w-full max-h-[85dvh] rounded-t-ui-lg border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)]"
                                    : "top-1/2 left-1/2 w-[calc(100vw-24px)] max-h-[calc(100dvh-32px)] rounded-ui-lg",
                                className
                            )}
                            variants={sheet ? (reducedMotion ? reducedSheetVariants : sheetVariants) : reducedMotion ? {
                                hidden: { opacity: 0, x: '-50%', y: '-50%' },
                                visible: { opacity: 1, transition: { duration: 0 }, x: '-50%', y: '-50%' },
                                exit: { opacity: 0, transition: { duration: 0 }, x: '-50%', y: '-50%' },
                            } : contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={sheet ? style : { maxWidth: width, transformOrigin: localOrigin, ...style }}
                            {...(sheet ? {
                                drag: 'y' as const,
                                dragListener: false,
                                dragControls,
                                dragConstraints: { top: 0, bottom: 0 },
                                dragElastic: { top: 0, bottom: 1 },
                                dragMomentum: false,
                                onDragEnd: finishDrag,
                            } : {})}
                            // Oxlint cannot express the overlap between Radix
                            // content props and Motion's props at this boundary.
                            // oxlint-disable-next-line typescript/no-explicit-any
                            {...props as any} // Framer Motion types conflict with Radix? usually fine with asChild but here we wrap motion.div
                        >
                            {sheet && (
                                <div aria-hidden="true" data-sheet-handle="" className="flex shrink-0 cursor-grab touch-none justify-center pt-2 pb-1" onPointerDown={event => dragControls.start(event)}>
                                    <span className="h-1 w-9 rounded-full bg-ui-border-strong" />
                                </div>
                            )}
                            <SheetDragContext.Provider value={sheet ? dragControls : null}>
                                {children}
                            </SheetDragContext.Provider>
                        </motion.div>
                    </DialogPrimitive.Content>
                </ModalPortal>
            )}
        </AnimatePresence>
    );
};
ModalDialog.displayName = "ModalDialog";

const ModalSheetContent = (props: Omit<ModalContentProps, 'mobileSheet'>) => {
    const narrow = useMediaQuery('(max-width: 767px)');
    return <ModalDialog sheet={narrow} {...props} />;
};

const ModalContent = ({ mobileSheet = false, ...props }: ModalContentProps) =>
    mobileSheet ? <ModalSheetContent {...props} /> : <ModalDialog sheet={false} {...props} />;
ModalContent.displayName = "ModalContent";

// 2. Header
interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    closeButton?: boolean;
}

const ModalHeader = ({
    className,
    children,
    closeButton = false, // Hidden by default
    onPointerDown,
    ...props
}: ModalHeaderProps) => {
    const { t: uiT } = useTranslation('ui');
    const dragControls = React.useContext(SheetDragContext);
    return (
    <div
        className={clsx("flex min-w-0 items-center justify-between p-4 border-b border-ui-border", dragControls && "touch-none", className)}
        onPointerDown={event => {
            onPointerDown?.(event);
            if (dragControls && !(event.target as Element).closest('button')) dragControls.start(event);
        }}
        {...props}
    >
        {children}

        {closeButton && (
            <DialogPrimitive.Close className={clsx("flex items-center justify-center p-2 -m-2 ml-auto text-2xl leading-none text-ui-muted min-h-11 min-w-11 rounded-ui-sm transition-colors duration-150 bg-transparent hover:bg-ui-hover border-0 cursor-pointer hover:opacity-100 hover:text-ui-fg hover:no-underline", ui.focusRing)} aria-label={uiT("close")}>
                {/* Use a standard multiplication sign, or replace with Cross2Icon from @radix-ui/react-icons */}
                <X size={16} aria-hidden="true" />
            </DialogPrimitive.Close>
        )}
    </div>
);
};

// 3. Title (Must use DialogPrimitive.Title for accessibility)
const ModalTitle = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) => (
    <DialogPrimitive.Title
        className={clsx("m-0 min-w-0 truncate leading-normal text-base font-medium text-ui-heading", className)}
        {...props}
    />
);
ModalTitle.displayName = "ModalTitle";

// 4. Body
const ModalBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("relative min-w-0 flex-auto overflow-x-hidden overflow-y-auto overscroll-contain p-4", className)} {...props} />
);

// 5. Footer
interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    bordered?: boolean;
    compact?: boolean;
}

const ModalFooter = ({ className, bordered = true, compact = false, ...props }: ModalFooterProps) => (
    <div
        className={clsx(
            "flex flex-wrap items-center justify-end gap-2",
            compact ? "p-3" : "p-4",
            bordered && "border-t border-ui-border",
            className
        )}
        {...props}
    />
);

export {
    Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader,
    ModalTitle, ModalTrigger
};
