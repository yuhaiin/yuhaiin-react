
import * as Popover from '@radix-ui/react-popover';
import React, { FC, useEffect, useState } from 'react';
import { Input, InputProps } from './input';

export interface ComboboxItem {
    label: string;
    value: string;
    details?: string[];
}

export interface ComboboxProps extends Omit<InputProps, 'onChange'> {
    options: ComboboxItem[];
    onChange: (value: string) => void;
}

export const Combobox: FC<ComboboxProps> = ({
    value = "",
    onChange,
    options,
    className,
    placeholder,
    onFocus,
    onBlur,
    onKeyDown,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const isKeyboardNav = React.useRef(false);

    // Filter options based on value
    const filteredOptions = React.useMemo(() => {
        if (!value) return options;
        const lower = String(value).toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lower) ||
            opt.value.toLowerCase().includes(lower) ||
            opt.details?.some(d => d.toLowerCase().includes(lower))
        );
    }, [options, value]);

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(0);
        isKeyboardNav.current = true; // Ensure we scroll to top on filter change
    }, [filteredOptions]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
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
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                isKeyboardNav.current = true;
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : prev
                );
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
                <div className="w-full">
                    <Input
                        value={String(value)}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={(e) => {
                            setOpen(true);
                            onFocus?.(e);
                        }}
                        onClick={() => setOpen(true)}
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
                        className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border bg-white p-1 text-slate-950 shadow-md"
                        onWheel={(e) => e.stopPropagation()}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        align="start"
                        sideOffset={5}
                        collisionPadding={10}
                    >
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
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted=true]:bg-slate-100 data-[highlighted=true]:text-slate-900"
                                    data-highlighted={i === highlightedIndex}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    onMouseEnter={() => {
                                        isKeyboardNav.current = false;
                                        setHighlightedIndex(i);
                                    }}
                                >
                                    <span className="font-medium">{opt.label}</span>
                                    {opt.details && opt.details.length > 0 && (
                                        <div className="ml-auto flex items-center gap-2 text-slate-500">
                                            {opt.details.map((d, di) => (
                                                <span key={di} className="text-xs">{d}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            )
            }
        </Popover.Root >
    );
};
