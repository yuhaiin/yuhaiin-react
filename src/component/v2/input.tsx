import { clsx } from "clsx";
import * as React from "react";
import { ui } from "./styles";

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
                    ui.field,
                    ui.fieldFocus,
                    ui.fieldReadonly,
                    ui.fieldDisabled,
                    "placeholder:not-italic",
                    {
                        "h-field-sm py-1 px-2.5 text-[0.8125rem] rounded-ui-xs": size === "sm",
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
                    ui.field,
                    ui.fieldFocus,
                    ui.fieldReadonly,
                    ui.fieldDisabled,
                    "min-h-field h-auto py-2",
                    className
                )}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea";
