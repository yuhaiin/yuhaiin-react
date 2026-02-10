import { AnimatePresence, motion } from 'motion/react';
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
        <div onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} className="inline-flex">
            {children}
            {createPortal(
                <AnimatePresence>
                    {visible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.2, y: "-100%", x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: "-100%", x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.2, y: "-100%", x: "-50%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="fixed p-[6px_10px] text-xs leading-normal text-white bg-black/85 rounded whitespace-normal text-center shadow-[0_2px_10px_rgba(0,0,0,0.2)] z-[9999] max-w-[200px] pointer-events-none origin-[center_bottom]"
                            style={{
                                left: coords.left,
                                top: coords.top,
                                // transform is handled by motion (x/y)
                            }}
                        >
                            {content}
                            {/* Arrow */}
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[4px] border-x-[4px] border-b-0 border-solid border-[rgba(0,0,0,0.85)_transparent_transparent_transparent]" />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
