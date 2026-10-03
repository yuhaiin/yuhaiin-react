import * as React from "react";
import { cn, ui } from "./styles";

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

type InputPropsWithoutSize = Omit<NativeInputProps, "size">;

export interface InputProps extends InputPropsWithoutSize {
    size?: "default" | "sm";

    /** Native input width in characters. */
    htmlSize?: number;

    groupPosition?: 'first' | 'middle' | 'last' | 'single';
}

type GroupPosition = 'first' | 'middle' | 'last' | 'single';

const groupRadiusClass = (groupPosition?: GroupPosition) =>
    groupPosition === 'first' ? '!rounded-r-none !border-r-0' :
        groupPosition === 'last' ? '!rounded-l-none' :
            groupPosition === 'middle' ? '!rounded-none !border-r-0' :
                '';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, size = "default", htmlSize, groupPosition, ...props }, ref) => {
        const inputProps = {
            ...props,
            ...("value" in props ? { value: props.value ?? "" } : {}),
        };

        return (
            <input
                ref={ref}
                size={htmlSize}
                className={cn(
                    ui.field,
                    ui.fieldFocus,
                    ui.fieldReadonly,
                    ui.fieldDisabled,
                    "placeholder:not-italic max-sm:min-h-11",
                    {
                        "min-h-field": size === "default",
                        "h-field-sm min-h-field-sm py-1 px-2.5 sm:text-[0.8125rem]": size === "sm",
                    },
                    groupRadiusClass(groupPosition),
                    className
                )}
                {...inputProps}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    groupPosition?: GroupPosition;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, groupPosition, ...props }, ref) => {
        const textareaProps = {
            ...props,
            ...("value" in props ? { value: props.value ?? "" } : {}),
        };

        return (
            <textarea
                ref={ref}
                className={cn(
                    ui.field,
                    ui.fieldFocus,
                    ui.fieldReadonly,
                    ui.fieldDisabled,
                    "min-h-field h-auto py-2",
                    groupRadiusClass(groupPosition),
                    className
                )}
                {...textareaProps}
            />
        )
    }
)
Textarea.displayName = "Textarea";
