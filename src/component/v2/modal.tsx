import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import * as React from "react";
import { useLastClickPosition } from "../../hooks/use-last-click";
import { cn, motionTiming, ui } from "./styles";

// --- Context ---
const ModalContext = React.createContext<{ open: boolean, transformOrigin: string }>({ open: false, transformOrigin: 'center center' });

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
            <ModalContext.Provider value={{ open: isOpen, transformOrigin: origin }}>
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

// 1. Content Container
const ModalContent = ({ className, children, style, width = 500, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { width?: number }) => {
    const { open, transformOrigin } = React.useContext(ModalContext);
    const reducedMotion = useReducedMotion();
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
                                "fixed top-1/2 left-1/2 min-w-0 w-[calc(100vw-24px)] max-h-[calc(100dvh-32px)] z-[1055] flex flex-col outline-none overflow-hidden bg-ui-surface-raised text-ui-fg border border-ui-border rounded-ui-lg shadow-ui-elevated",
                                className
                            )}
                            variants={reducedMotion ? {
                                hidden: { opacity: 0, x: '-50%', y: '-50%' },
                                visible: { opacity: 1, transition: { duration: 0 }, x: '-50%', y: '-50%' },
                                exit: { opacity: 0, transition: { duration: 0 }, x: '-50%', y: '-50%' },
                            } : contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ maxWidth: width, transformOrigin: localOrigin, ...style }}
                            // Oxlint cannot express the overlap between Radix
                            // content props and Motion's props at this boundary.
                            // oxlint-disable-next-line typescript/no-explicit-any
                            {...props as any} // Framer Motion types conflict with Radix? usually fine with asChild but here we wrap motion.div
                        >
                            {children}
                        </motion.div>
                    </DialogPrimitive.Content>
                </ModalPortal>
            )}
        </AnimatePresence>
    );
};
ModalContent.displayName = "ModalContent";

// 2. Header
interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    closeButton?: boolean;
}

const ModalHeader = ({
    className,
    children,
    closeButton = false, // Hidden by default
    ...props
}: ModalHeaderProps) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className={clsx("flex min-w-0 items-center justify-between p-4 border-b border-ui-border", className)} {...props}>
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
    <div className={clsx("relative min-w-0 flex-auto overflow-x-hidden overflow-y-auto p-4", className)} {...props} />
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
