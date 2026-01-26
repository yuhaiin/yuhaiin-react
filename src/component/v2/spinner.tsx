import { clsx } from "clsx";
import { motion } from "framer-motion";
import * as React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md";
}

const Spinner = ({ className, size = "md", ...props }: SpinnerProps) => {
    const width = size === "sm" ? 16 : 24;
    const strokeWidth = size === "sm" ? 3 : 4; // Thicker stroke for small
    const radius = size === "sm" ? 6 : 10;
    const center = size === "sm" ? 8 : 12;

    return (
        <div
            className={clsx(
                "inline-flex",
                className
            )}
            role="status"
            {...props}
            style={{
                width,
                height: width,
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
                />
            </motion.svg>
            <span style={{ display: "none" }}>Loading...</span>
        </div>
    );
};

export { Spinner };
