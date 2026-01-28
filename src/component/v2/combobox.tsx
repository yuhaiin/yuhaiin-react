
import * as Popover from '@radix-ui/react-popover';
import React, { FC, useEffect, useState } from 'react';
import { clsx } from 'clsx';
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
                <div style={{ width: '100%' }}>
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
                        className={clsx(
                            "w-[var(--radix-popover-trigger-width)] max-h-[50vh] bg-[var(--bs-body-bg)] rounded-[20px] border border-[var(--bs-border-color)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)] z-[2000] p-1 will-change-[transform,opacity]",
                            "data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
                        )}
                        onWheel={(e) => e.stopPropagation()}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        align="start"
                        sideOffset={5}
                        collisionPadding={10}
                    >
                        <div style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                overflowY: 'auto',
                                maxHeight: '49vh',
                            }}>
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
                                            "group p-2 px-3 cursor-pointer rounded-[20px] text-sm transition-colors duration-150 text-[var(--bs-body-color)]",
                                            "hover:bg-[var(--bs-tertiary-bg)] hover:text-[var(--bs-body-color)]",
                                            "data-[highlighted=true]:bg-[var(--bs-tertiary-bg)] data-[highlighted=true]:text-[var(--bs-body-color)]"
                                        )}
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
                                        <span className="font-medium block">{opt.label}</span>
                                        {opt.details && opt.details.length > 0 && (
                                            <div className="pl-0 mt-[2px] font-mono text-[0.75em] text-[var(--bs-secondary-color)] whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[var(--bs-secondary-color)] group-data-[highlighted=true]:text-[var(--bs-secondary-color)]">
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
