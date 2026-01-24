import { clsx } from "clsx";
import * as React from "react";
import styles from "./spinner.module.css";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md";
}

const Spinner = ({ className, size = "md", ...props }: SpinnerProps) => {
    return (
        <div
            className={clsx(
                styles.spinner,
                { [styles.sm]: size === "sm" },
                className
            )}
            role="status"
            {...props}
        >
            <span style={{ display: "none" }}>Loading...</span>
        </div>
    );
};

export { Spinner };
