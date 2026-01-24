import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import * as React from "react";
import styles from "./modal.module.css";

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

// 1. Content Container
const ModalContent = ({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) => (
    <ModalPortal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
            className={clsx(styles.content, className)}
            {...props}
        >
            {children}
        </DialogPrimitive.Content>
    </ModalPortal>
);
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
