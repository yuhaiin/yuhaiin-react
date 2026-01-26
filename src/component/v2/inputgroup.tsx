import { clsx } from "clsx";
import * as React from "react";

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={clsx(
            "relative flex w-full flex-wrap items-stretch",
            "[&>input]:relative [&>input]:flex-[1_1_auto] [&>input]:w-[1%] [&>input]:min-w-0",
            "[&>textarea]:relative [&>textarea]:flex-[1_1_auto] [&>textarea]:w-[1%] [&>textarea]:min-w-0",
            "[&>div]:relative [&>div]:flex-[1_1_auto] [&>div]:w-[1%] [&>div]:min-w-0",
            "[&>button]:relative [&>button]:z-[2]",
            "[&>:first-child]:rounded-r-none",
            "[&>:last-child]:rounded-l-none",
            "[&>:not(:first-child):not(:last-child)]:rounded-none",
            "[&>input:focus]:z-10 [&>button:focus]:z-10",
            className
        )}
        {...props}
    />
));
InputGroup.displayName = "InputGroup";

const InputGroupText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={clsx(
            "flex items-center px-3 py-1.5 text-sm font-normal leading-normal text-muted-foreground whitespace-nowrap bg-muted border border-input rounded-xl text-center",
            className
        )}
        {...props}
    />
));
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupText };
