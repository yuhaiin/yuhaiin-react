import * as React from "react";
import { CircleAlert } from 'lucide-react';
import { cn, ui } from "./styles";

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

type InputPropsWithoutSize = Omit<NativeInputProps, "size">;

export interface InputProps extends InputPropsWithoutSize {
    /** Pass an empty string to reserve feedback space before validation. */
    error?: string;
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
    ({ className, size = "default", htmlSize, groupPosition, error, ...props }, ref) => {
        const generatedId = React.useId();
        const feedbackId = `${props.id ?? generatedId}-error`;
        const inputProps = {
            ...props,
            ...("value" in props ? { value: props.value ?? "" } : {}),
        };

        return (
            <FieldFeedback error={error} id={feedbackId}><input
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
                    error && 'pr-9',
                    className
                )}
                {...inputProps}
                aria-invalid={Boolean(error) || props['aria-invalid'] || undefined}
                aria-describedby={[props['aria-describedby'], error ? feedbackId : undefined].filter(Boolean).join(' ') || undefined}
            /></FieldFeedback>
        );
    }
);

Input.displayName = "Input";

export { Input };

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    groupPosition?: GroupPosition;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, groupPosition, error, ...props }, ref) => {
        const generatedId = React.useId();
        const feedbackId = `${props.id ?? generatedId}-error`;
        const textareaProps = {
            ...props,
            ...("value" in props ? { value: props.value ?? "" } : {}),
        };

        return (
            <FieldFeedback error={error} id={feedbackId}><textarea
                ref={ref}
                className={cn(
                    ui.field,
                    ui.fieldFocus,
                    ui.fieldReadonly,
                    ui.fieldDisabled,
                    "min-h-field h-auto py-2.5",
                    groupRadiusClass(groupPosition),
                    error && 'pr-9',
                    className
                )}
                {...textareaProps}
                aria-invalid={Boolean(error) || props['aria-invalid'] || undefined}
                aria-describedby={[props['aria-describedby'], error ? feedbackId : undefined].filter(Boolean).join(' ') || undefined}
            /></FieldFeedback>
        )
    }
)
Textarea.displayName = "Textarea";

/** Optional reserved feedback line; existing controls keep their native wrapper. */
export function FieldFeedback({ error, id, children }: { error?: string; id: string; children: React.ReactNode }) {
    if (error === undefined) return children;
    return <div className="min-w-0 w-full">
        <div className="relative">{children}</div>
        <p id={id} aria-live="polite" className="m-0 mt-1 flex min-h-[18px] items-start gap-1.5 text-xs leading-normal text-ui-danger">
            {error && <><CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" /><span>{error}</span></>}
        </p>
    </div>;
}
