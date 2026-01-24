import { clsx } from "clsx";
import * as React from "react";
import styles from "./input.module.css";

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
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, size = "default", htmlSize, ...props }, ref) => {

        // 4. Important: destructure size.
        // Since HTML tags don't accept size="sm", we shouldn't pass it to <input>
        // ...props now contains native properties like onClick, onChange, value, etc., excluding size

        return (
            <input
                ref={ref}
                // Pass to the native size attribute if width control is needed
                size={htmlSize}
                className={clsx(
                    styles.input,
                    {
                        // Apply CSS based on the size string
                        [styles.sm]: size === "sm",
                    },
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
                    styles.input,
                    className
                )}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea";
