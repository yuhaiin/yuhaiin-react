import * as React from "react";
import { useSecretField } from "@/auth/secret-fields";
import { useTranslation } from "react-i18next";
import { CircleAlert } from 'lucide-react';
import { cn, ui } from "./styles";

type NativeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

type InputPropsWithoutSize = Omit<NativeInputProps, "size">;

export interface InputProps extends InputPropsWithoutSize {
    /** Pass an empty string to reserve feedback space before validation. */
    error?: string;
    secret?: boolean;
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
    ({ className, size = "default", htmlSize, groupPosition, error, secret, ...props }, ref) => {
        const { t } = useTranslation('auth');
        const access = useSecretField(props.value, secret || props.type === 'password');
        const generatedId = React.useId();
        const feedbackId = `${props.id ?? generatedId}-error`;
        const inputProps = {
            ...props,
            ...("value" in props ? { value: access.masked ? '' : props.value ?? "" } : {}),
            disabled: props.disabled || access.disabled,
            ...(access.masked ? { placeholder: t('secrets.savedValue'), required: false, pattern: undefined, minLength: undefined, maxLength: undefined, type: props.type === 'password' ? 'password' : 'text', title: t('secrets.savedValue') } : {}),
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
                    // :read-only also matches file inputs, which would otherwise always look read-only.
                    props.type === "file" && "cursor-pointer py-1 text-ui-muted read-only:cursor-pointer read-only:border-ui-border read-only:bg-ui-surface file:mr-3 file:h-[28px] file:cursor-pointer file:rounded-ui-sm file:border file:border-solid file:border-ui-border file:bg-ui-surface file:px-3 file:text-sm file:font-medium file:text-ui-fg hover:file:bg-ui-hover disabled:read-only:border-ui-disabled-border disabled:read-only:bg-ui-disabled disabled:cursor-not-allowed disabled:file:cursor-not-allowed disabled:file:border-ui-disabled-border disabled:file:text-ui-disabled-fg disabled:hover:file:bg-ui-surface max-sm:py-2",
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
    secret?: boolean;
    groupPosition?: GroupPosition;
    error?: string;
    /** Machine-readable text: keys, certificates, addresses. */
    code?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, groupPosition, error, secret, code = false, style, ...props }, ref) => {
        const { t } = useTranslation('auth');
        const access = useSecretField(props.value, secret);
        const generatedId = React.useId();
        const feedbackId = `${props.id ?? generatedId}-error`;
        const textareaProps = {
            ...props,
            ...("value" in props ? { value: access.masked ? '' : props.value ?? "" } : {}),
            disabled: props.disabled || access.disabled,
            ...(access.masked ? { placeholder: t('secrets.savedValue'), required: false, minLength: undefined, maxLength: undefined, title: t('secrets.savedValue') } : {}),
        };

        return (
            <FieldFeedback error={error} id={feedbackId}><textarea
                ref={ref}
                className={cn(
                    ui.field,
                    ui.fieldFocus,
                    ui.fieldReadonly,
                    ui.fieldDisabled,
                    // Grows with its text where supported; older browsers keep the drag handle.
                    // Containment keeps long lines from widening ancestors, since field-sizing also sets the intrinsic width.
                    "min-h-20 h-auto max-h-[60dvh] py-2.5 field-sizing-content [contain:inline-size] resize-y supports-[field-sizing:content]:resize-none",
                    code && "font-mono leading-relaxed",
                    groupRadiusClass(groupPosition),
                    error && 'pr-9',
                    className
                )}
                style={props.rows ? { minHeight: `calc(${props.rows} * 1.5em + 1.25rem + 2px)`, ...style } : style}
                {...(code ? { spellCheck: false, autoCapitalize: 'off', autoCorrect: 'off' } : {})}
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
