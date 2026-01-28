import { clsx } from "clsx";
import * as React from "react";

// 1. Get all property types for native Input
type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

// 2. Crucial step: use Omit to exclude the native 'size' property
// Tell TS: "I want all properties except size"
type InputPropsWithoutSize = Omit<NativeInputProps, "size">;

// 3. Define the new interface for the component
export interface InputProps extends InputPropsWithoutSize {
    // Redefine size as our desired string type
    size?: "default" | "sm";

    // (Optional) If you really need the native numeric 'size' that controls width, expose it with another name
    htmlSize?: number;

    groupPosition?: 'first' | 'middle' | 'last' | 'single';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, size = "default", htmlSize, groupPosition, ...props }, ref) => {

        // 4. Important: destructure size.
        // Since HTML tags don't accept size="sm", we shouldn't pass it to <input>
        // ...props now contains native properties like onClick, onChange, value, etc., excluding size

        const radiusClass =
            groupPosition === 'first' ? '!rounded-r-none !border-r-0' :
                groupPosition === 'last' ? '!rounded-l-none' :
                    groupPosition === 'middle' ? '!rounded-none !border-r-0' :
                        '';

        return (
            <input
                ref={ref}
                // Pass to the native size attribute if width control is needed
                size={htmlSize}
                className={clsx(
                    "block w-full px-[0.875rem] h-[38px] text-[0.9375rem] font-normal leading-normal text-[var(--bs-body-color)] bg-[var(--bs-body-bg)] border-[0.2px] border-[var(--bs-border-color-translucent,rgba(0,0,0,0.15))] rounded-[6px] shadow-[inset_0_0.5px_0px_rgba(0,0,0,0.05)] appearance-none outline-none transition-colors duration-150 ease-in-out",
                    "focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)] focus:z-[2] focus:outline-none",
                    "read-only:bg-[var(--bs-tertiary-bg,#f8f9fa)] read-only:border-[var(--bs-border-color-translucent,rgba(0,0,0,0.1))] read-only:cursor-default",
                    "read-only:focus:border-[var(--bs-border-color)] read-only:focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]",
                    "disabled:bg-[var(--bs-secondary-bg,#e9ecef)] disabled:text-[var(--bs-secondary-color)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none",
                    "placeholder:not-italic",
                    {
                        "py-1 px-2.5 text-[0.8125rem] rounded-[6px]": size === "sm",
                    },
                    radiusClass,
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={clsx(
                    "block w-full px-[0.875rem] text-[0.9375rem] font-normal leading-normal text-[var(--bs-body-color)] bg-[var(--bs-body-bg)] border-[0.2px] border-[var(--bs-border-color-translucent,rgba(0,0,0,0.15))] rounded-[6px] shadow-[inset_0_0.5px_0px_rgba(0,0,0,0.05)] appearance-none outline-none transition-colors duration-150 ease-in-out",
                    "focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)] focus:z-[2] focus:outline-none",
                    "read-only:bg-[var(--bs-tertiary-bg,#f8f9fa)] read-only:border-[var(--bs-border-color-translucent,rgba(0,0,0,0.1))] read-only:cursor-default",
                    "read-only:focus:border-[var(--bs-border-color)] read-only:focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]",
                    "disabled:bg-[var(--bs-secondary-bg,#e9ecef)] disabled:text-[var(--bs-secondary-color)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none",
                    "min-h-[38px] h-auto py-2", // Textarea specific
                    className
                )}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea";
