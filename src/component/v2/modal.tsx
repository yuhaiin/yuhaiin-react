import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { useLastClickPosition } from "../../hooks/use-last-click";
import styles from "./modal.module.css";

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
                            className={styles.overlay}
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        />
                    </DialogPrimitive.Overlay>
                    <DialogPrimitive.Content asChild forceMount>
                        <motion.div
                            className={clsx(styles.content, className)}
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
    <div className={clsx(styles.header, className)} {...props}>
        {children}

        {closeButton && (
            <DialogPrimitive.Close className={styles.closeButton} aria-label="Close">
                {/* Use a standard multiplication sign, or replace with Cross2Icon from @radix-ui/react-icons */}
                <span aria-hidden="true">×</span>
            </DialogPrimitive.Close>
        )}
    </div>
);

// 3. Title (Must use DialogPrimitive.Title for accessibility)
const ModalTitle = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) => (
    <DialogPrimitive.Title
        className={clsx(styles.title, className)}
        {...props}
    />
);
ModalTitle.displayName = "ModalTitle";

// 4. Body
const ModalBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.body, className)} {...props} />
);

// 5. Footer
const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx(styles.footer, className)} {...props} />
);

export {
    Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader,
    ModalTitle, ModalTrigger
};
