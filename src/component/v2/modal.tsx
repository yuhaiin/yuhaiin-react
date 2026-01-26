import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { useLastClickPosition } from "../../hooks/use-last-click";

// --- Context ---
const ModalContext = React.createContext<{ open: boolean, transformOrigin: string }>({ open: false, transformOrigin: 'center center' });

// --- Wrapper ---
// We wrap DialogPrimitive.Root to capture the open state and pass it down
const Modal: React.FC<React.ComponentProps<typeof DialogPrimitive.Root>> = ({ children, open, onOpenChange, ...props }) => {
    const getLastClick = useLastClickPosition();
    const [origin, setOrigin] = React.useState("center center");

    // Capture origin only when opening
    React.useEffect(() => {
        if (open) {
            const pos = getLastClick();
            if (pos.x !== 0 || pos.y !== 0) {
                setOrigin(`${pos.x}px ${pos.y}px`);
                return;
            }
        }
        // Reset or keep previous? Keeping previous is fine, but if we close and open elsewhere?
        // If open is false, we don't care.
    }, [open]);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
            <ModalContext.Provider value={{ open: !!open, transformOrigin: origin }}>
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
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const contentVariants = {
    hidden: { opacity: 0, scale: 0.2, y: "-50%", x: "-50%" },
    visible: {
        opacity: 1,
        scale: 1,
        y: "-50%",
        x: "-50%",
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        opacity: 0,
        scale: 0.2, // Shrink back
        y: "-50%",
        x: "-50%",
        transition: { duration: 0.2 }
    }
};


// 1. Content Container
const ModalContent = ({ className, children, style, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) => {
    const { open, transformOrigin } = React.useContext(ModalContext);

    return (
        <AnimatePresence>
            {open && (
                <ModalPortal forceMount>
                    <DialogPrimitive.Overlay asChild forceMount>
                        <motion.div
                            className="fixed inset-0 z-[1050] bg-black/50"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        />
                    </DialogPrimitive.Overlay>
                    <DialogPrimitive.Content asChild forceMount>
                        <motion.div
                            className={clsx(
                                "fixed top-1/2 left-1/2 z-[1055] w-[90vw] max-w-[500px] max-h-[85vh] flex flex-col p-[5px] rounded-[32px] bg-[var(--bs-body-bg)] text-[var(--bs-modal-color)] border border-[var(--bs-modal-border-color)] shadow-[var(--bs-modal-box-shadow)] outline-none overflow-hidden will-change-[transform,opacity]",
                                className
                            )}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ transformOrigin, ...style }}
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
}: ModalHeaderProps) => (
    <div className={clsx("flex items-center justify-between p-4 border-b border-[var(--sidebar-border-color,#dee2e6)]", className)} {...props}>
        {children}

        {closeButton && (
            <DialogPrimitive.Close className="ml-auto -mr-2 -my-2 p-2 bg-transparent border-none cursor-pointer text-2xl leading-none text-[var(--bs-secondary-color,#6c757d)] opacity-50 transition-opacity transition-colors flex items-center justify-center hover:opacity-100 hover:text-[var(--bs-body-color,#000)] focus:outline-none" aria-label="Close">
                {/* Use a standard multiplication sign, or replace with Cross2Icon from @radix-ui/react-icons */}
                <span aria-hidden="true">×</span>
            </DialogPrimitive.Close>
        )}
    </div>
);

// 3. Title (Must use DialogPrimitive.Title for accessibility)
const ModalTitle = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) => (
    <DialogPrimitive.Title
        className={clsx("m-0 text-xl font-medium leading-[1.5]", className)}
        {...props}
    />
);
ModalTitle.displayName = "ModalTitle";

// 4. Body
const ModalBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("relative flex-1 overflow-y-auto p-4", className)} {...props} />
);

// 5. Footer
const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("flex flex-wrap items-center justify-end gap-2 p-3 border-t border-[var(--sidebar-border-color)]", className)} {...props} />
);

export {
    Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader,
    ModalTitle, ModalTrigger
};
