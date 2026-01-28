import { clsx } from "clsx";
import * as React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md";
}

const Spinner = ({ className, size = "md", ...props }: SpinnerProps) => {
    // Tailwind size classes
    const sizeClass = size === "sm" ? "w-4 h-4 border-2" : "w-6 h-6 border-4";

    return (
        <div
            className={clsx(
                "inline-block rounded-full animate-spin border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
                sizeClass,
                className
            )}
            role="status"
            {...props}
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export { Spinner };
