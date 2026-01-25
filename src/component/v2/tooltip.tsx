import { AnimatePresence, motion } from "framer-motion";
import { FC, ReactNode, useState } from "react";
import { createPortal } from "react-dom";

export const Tooltip: FC<{ children: ReactNode, content: ReactNode }> = ({ children, content }) => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ left: 0, top: 0 });

    const show = (e: React.MouseEvent | React.FocusEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Position above the element
        setCoords({
            left: rect.left + rect.width / 2,
            top: rect.top - 8
        });
        setVisible(true);
    };

    const hide = () => setVisible(false);

    return (
        <div onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} style={{ display: 'inline-flex' }}>
            {children}
            {createPortal(
                <AnimatePresence>
                    {visible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.2, y: "-100%", x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: "-100%", x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.2, y: "-100%", x: "-50%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{
                                position: 'fixed',
                                left: coords.left,
                                top: coords.top,
                                transformOrigin: 'center bottom',
                                // transform is handled by motion (x/y)
                                backgroundColor: 'rgba(0,0,0,0.85)',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                pointerEvents: 'none',
                                zIndex: 9999,
                                maxWidth: 200,
                                whiteSpace: 'normal',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                textAlign: 'center'
                            }}
                        >
                            {content}
                            {/* Arrow */}
                            <div style={{
                                position: 'absolute',
                                bottom: -4,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                borderWidth: '4px 4px 0',
                                borderStyle: 'solid',
                                borderColor: 'rgba(0,0,0,0.85) transparent transparent transparent'
                            }} />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
