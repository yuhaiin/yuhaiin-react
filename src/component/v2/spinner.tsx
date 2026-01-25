import { clsx } from "clsx";
import { motion } from "framer-motion";
import * as React from "react";
import styles from "./spinner.module.css";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md";
}

const transition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
}

const Spinner = ({ className, size = "md", ...props }: SpinnerProps) => {
    const width = size === "sm" ? 16 : 24;
    const strokeWidth = size === "sm" ? 3 : 4; // Thicker stroke for small
    const radius = size === "sm" ? 6 : 10;
    const center = size === "sm" ? 8 : 12;

    return (
        <div
            className={clsx(
                styles.spinnerContainer, // New class or reuse generic
                className
            )}
            role="status"
            {...props}
            style={{
                width,
                height: width,
                display: 'inline-flex',
                // Reset any existing spinner styles from external class if needed
                ...props.style
            }}
        >
            <motion.svg
                width={width}
                height={width}
                viewBox={`0 0 ${width} ${width}`}
                xmlns="http://www.w3.org/2000/svg"
                animate={{ rotate: 360 }}
                transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                }}
            >
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ pathLength: 0.75 }}
                    // Optional: Add "breathing" dash animation
                    animate={{ pathLength: [0.75, 0.25, 0.75], rotate: [0, 180, 360], strokeDashoffset: [0, -10, 0] }} // Complex breathing
                // Or simple static partial circle rotating
                // Let's stick to simple rotating partial circle for now, or the classic "indeterminate"
                // Simplest clean look: static pathLength, rotating svg.
                />
            </motion.svg>
            <span style={{ display: "none" }}>Loading...</span>
        </div>
    );
};

export { Spinner };
