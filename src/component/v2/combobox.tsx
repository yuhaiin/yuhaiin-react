
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import React, { FC, useState } from 'react';
import { Input, InputProps } from './input';

export interface ComboboxItem {
    label: string;
    value: string;
    details?: string[];
}

export interface ComboboxProps extends Omit<InputProps, 'onChange'> {
    options: ComboboxItem[];
    onChange: (value: string) => void;
    /** Show every suggestion when the field is focused, before the user starts typing. */
    showAllOnFocus?: boolean;
}

export const Combobox: FC<ComboboxProps> = ({
    value = "",
    onChange,
    options,
    showAllOnFocus = false,
    className,
    placeholder,
    onFocus,
    onBlur,
    onKeyDown,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [showAllOptions, setShowAllOptions] = useState(false);
    // Track the highlighted option by identity, not by an index that may be
    // invalidated when a parent passes a new options array.
    const [highlightedValue, setHighlightedValue] = useState<string | null>(null);

    const isKeyboardNav = React.useRef(false);

    // Filter options based on value
    const filteredOptions = React.useMemo(() => {
        if (!value || (showAllOnFocus && showAllOptions)) return options;
        const lower = String(value).toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lower) ||
            opt.value.toLowerCase().includes(lower) ||
            opt.details?.some(d => d.toLowerCase().includes(lower))
        );
    }, [options, value, showAllOnFocus, showAllOptions]);

    const highlightedIndex = Math.max(0, filteredOptions.findIndex(item => item.value === highlightedValue));
    const highlightIndex = (index: number) => setHighlightedValue(filteredOptions[index]?.value ?? null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                if (showAllOnFocus) setShowAllOptions(true);
                setOpen(true);
                e.preventDefault();
            }
            onKeyDown?.(e);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                isKeyboardNav.current = true;
                highlightIndex(Math.min(highlightedIndex + 1, filteredOptions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                isKeyboardNav.current = true;
                highlightIndex(Math.max(highlightedIndex - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    onChange(filteredOptions[highlightedIndex].value);
                    setOpen(false);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setOpen(false);
                break;
            case 'Tab':
                setOpen(false);
                break;
            default:
                break;
        }

        onKeyDown?.(e);
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Anchor asChild>
                <div style={{ width: '100%' }}>
                    <Input
                        value={String(value)}
                        onChange={(e) => {
                            setShowAllOptions(false);
                            setHighlightedValue(null);
                            isKeyboardNav.current = true;
                            onChange(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={(e) => {
                            if (showAllOnFocus) setShowAllOptions(true);
                            setOpen(true);
                            onFocus?.(e);
                        }}
                        onClick={() => {
                            if (showAllOnFocus) setShowAllOptions(true);
                            setOpen(true);
                        }}
                        onBlur={onBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={className}
                        {...rest}
                    />
                </div>
            </Popover.Anchor>

            {/* Only render portal content if we have options to show */}
            {filteredOptions.length > 0 && (
                <Popover.Portal>
                    <Popover.Content
                        className={clsx(
                            "w-[var(--radix-popover-trigger-width)] max-h-[50vh] bg-ui-surface-raised rounded-ui-lg border border-ui-border shadow-ui-elevated z-[2000] p-1 will-change-[transform,opacity]",
                            "data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
                        )}

                        onWheel={(e) => e.stopPropagation()}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        align="start"
                        sideOffset={5}
                        collisionPadding={10}
                    >
                        <div className="rounded-ui-md overflow-hidden">
                            <div className="w-full h-full overflow-y-auto max-h-[49vh]">
                                {filteredOptions.map((opt, i) => (
                                    <div
                                        key={`${opt.value}-${i}`}
                                        ref={(el) => {
                                            if (isKeyboardNav.current && i === highlightedIndex && el) {
                                                el.scrollIntoView({ block: 'nearest' });
                                                isKeyboardNav.current = false;
                                            }
                                        }}
                                        className={clsx(
                                            "group min-h-8 max-sm:min-h-11 p-2 px-3 cursor-pointer rounded-ui-md text-sm transition-colors duration-[var(--motion-fast)] text-ui-fg",
                                            "hover:bg-ui-hover hover:text-ui-fg",
                                            "data-[highlighted=true]:bg-ui-hover data-[highlighted=true]:text-ui-fg data-[highlighted=true]:ring-1 data-[highlighted=true]:ring-inset data-[highlighted=true]:ring-ui-focus"
                                        )}
                                        data-highlighted={i === highlightedIndex}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                        }}
                                        onMouseEnter={() => {
                                            isKeyboardNav.current = false;
                                            highlightIndex(i);
                                        }}
                                    >
                                        <span className="font-normal block truncate">{opt.label}</span>
                                        {opt.details && opt.details.length > 0 && (
                                            <div className="pl-0 mt-[2px] font-mono text-[0.75em] text-ui-muted whitespace-nowrap overflow-hidden text-ellipsis">
                                                {opt.details.map((d, di) => (
                                                    <span key={di} className="inline-block mr-[6px] last:mr-0 after:content-[','] last:after:content-['']">{d}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            )
            }
        </Popover.Root >
    );
};
