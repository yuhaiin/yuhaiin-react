import { clsx } from "clsx";
import * as React from "react";

const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {

    const count = React.Children.count(children);
    const childrenWithProps = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
            let position = "middle";
            if (index === 0) position = "first";
            if (index === count - 1) position = "last";
            if (count === 1) position = "single";

            return React.cloneElement(child as React.ReactElement<any>, { groupPosition: position });
        }
        return child;
    });

    return (
        <div
            ref={ref}
            className={clsx(
                "relative flex flex-wrap items-stretch w-full",
                // Children positioning & z-index
                "[&>button]:relative [&>button]:z-[2] [&>button:focus]:z-[3]",
                "[&>input]:relative [&>input]:z-[1] [&>input:focus]:z-[3]",

                // Border radius handling for direct children (fallback for components that don't handle groupPosition)
                "[&>:first-child]:rounded-r-none",
                "[&>:last-child]:rounded-l-none",
                "[&>:not(:first-child):not(:last-child)]:rounded-none",

                // Border merging (negative margin)
                "[&>:not(:first-child)]:ml-[-1px]",

                // Flex sizing for inputs and generic divs (but allow overrides)
                "[&>input]:w-[1%] [&>input]:min-w-0 [&>input]:flex-auto",
                "[&>textarea]:w-[1%] [&>textarea]:min-w-0 [&>textarea]:flex-auto",
                // We apply this to divs too, but InputGroupText will override it
                "[&>div]:w-[1%] [&>div]:min-w-0 [&>div]:flex-auto",

                className
            )}
            {...props}
        >
            {childrenWithProps}
        </div>
    );
});
InputGroup.displayName = "InputGroup";

const InputGroupText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { groupPosition?: string }
>(({ className, groupPosition, ...props }, ref) => {

    const radiusClass =
        groupPosition === 'first' ? '!rounded-r-none !border-r-0' :
        groupPosition === 'last' ? '!rounded-l-none' :
        groupPosition === 'middle' ? '!rounded-none !border-r-0' :
        '';

    return (
        <div
            ref={ref}
            className={clsx(
                // Base
                "flex items-center px-3 py-1.5 text-base font-normal leading-[1.5] text-center whitespace-nowrap bg-tertiary-bg border border-sidebar-border rounded-[12px] text-[#212529]",
                // Dark mode
                "dark:bg-transparent dark:border-sidebar-border dark:text-body-color",
                // Fix sizing to prevent growing if InputGroup applies growth to all divs
                "!w-auto !flex-none",
                radiusClass,
                className
            )}
            {...props}
        />
    )
});
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupText };
