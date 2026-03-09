'use client';

import { clsx } from "clsx";
import { AnimatePresence, motion } from 'motion/react';
import { History, Plus, Search, TriangleAlert } from 'lucide-react';
import React, { FC, useState } from 'react';
import { useElementSize } from '@/common/hooks';
import { Badge } from "./badge";

// --- Basic Card Components ---

export const Card: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div
        className={clsx(
            "flex flex-col relative mb-8 overflow-hidden bg-sidebar-bg border border-sidebar-border rounded-[20px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]",
            className
        )}
        style={{ viewTransitionName: "config-card-root", ...style }}
    >
        {children}
    </div>
);

export const CardHeader: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={clsx("flex items-center justify-between px-3 py-3 border-b border-sidebar-border", className)} style={style}>
        {children}
    </div>
);

export const CardBody: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={clsx("grow p-6", className)} style={style}>
        {children}
    </div>
);

export const CardTitle: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={clsx("flex items-center mb-3 text-[1.1rem] font-semibold", className)} style={style}>
        {children}
    </div>
);

export const CardFooter: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={clsx("px-6 py-4 bg-transparent border-t border-sidebar-border", className)} style={style}>
        {children}
    </div>
);

export const ListItem: FC<{
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    onClick?: () => void
}> = ({ children, className, style, onClick }) => (
    <div
        className={clsx(
            "flex items-center min-h-[72px] p-4 cursor-pointer rounded-xl border border-transparent transition-all duration-200",
            "bg-[var(--list-item-bg)]",
            "hover:bg-[var(--list-item-hover)] hover:border-[var(--list-item-border-hover)] hover:-translate-y-0.5",
            className
        )}
        style={style}
        onClick={onClick}
    >
        {children}
    </div>
);


// --- List Components ---

type CardListProps<T> = {
    items: T[];
    onClickItem?: (item: T, index: number) => void;
    renderListItem: (item: T, index: number) => React.ReactNode;
    footer?: React.ReactNode;
    header?: React.ReactNode;
    getKey?: (item: T) => string | number;
};

export function CardList<T>({ items, onClickItem, footer, renderListItem: body, header, getKey }: CardListProps<T>) {
    return (
        <Card>
            {header && <CardHeader>{header}</CardHeader>}
            <CardBody>
                <div className="flex flex-col gap-3">
                    {items.length > 0 ? (
                        <AnimatePresence initial={false} mode="popLayout">
                            {items.map((child, index) => {
                                const key = getKey ? getKey(child) : index;
                                return (
                                    <motion.div
                                        key={key}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ListItem onClick={onClickItem ? () => onClickItem(child, index) : undefined}>
                                            {body(child, index)}
                                        </ListItem>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-gray-500 dark:text-gray-400 p-5 opacity-50"
                        >
                            <History className="block mb-2 mx-auto" size={40} />
                            No records found.
                        </motion.div>
                    )}
                </div>
            </CardBody>
            {footer && (
                <CardFooter>
                    <div className="flex justify-center">
                        {footer}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

// --- Other Components ---

interface SettingLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

export const SettingLabel: FC<SettingLabelProps> = ({
    children,
    className,
    ...props
}) => (
    <label
        className={clsx(
            "block mb-2 text-[13px] font-medium leading-[1.2] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer dark:text-gray-400",
            className
        )}
        {...props}
    >
        {children}
    </label>
);


export const ErrorBox: FC<{ msgs: string[] }> = ({ msgs }) => {
    if (msgs.length === 0) return null;
    return (
        <div className="flex items-start gap-3 p-4 rounded bg-red-100/10 border-0 text-red-600 dark:text-red-400">
            <TriangleAlert className="mt-1" size={20} />
            <div className="grow">
                <h6 className="font-bold mb-2">Configuration Error</h6>
                <ul className="mb-0 pl-4 list-disc">
                    {msgs.map((v, index) => (
                        <li key={index}>{v}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- Row List ---

type CardRowListProps<T> = CardListProps<T> & {
    onAddNew?: (name: string) => void;
    adding?: boolean;
};

export function CardRowList<T>({
    items,
    onClickItem,
    footer,
    renderListItem: body,
    header,
    onAddNew,
    adding
}: CardRowListProps<T>) {
    const [newdata, setNewdata] = useState({ value: '' });

    return (
        <Card>
            {header && <CardHeader>{header}</CardHeader>}
            <CardBody>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {items.map((value, index) =>
                        <div key={index} className="flex">
                            <ListItem className="w-full" onClick={() => onClickItem?.(value, index)}>
                                {body(value, index)}
                            </ListItem>
                        </div>
                    )}

                    {onAddNew &&
                        <div className="flex">
                            <ListItem className="w-full border border-dashed border-sidebar-border bg-[var(--bs-secondary-bg)] px-5 py-2">
                                <div className="flex items-center w-full min-h-[42px]">
                                    <input
                                        value={newdata.value}
                                        onChange={(e) => setNewdata({ value: e.target.value })}
                                        placeholder="Create new..."
                                        className="w-full p-2 text-base bg-transparent border-0 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        onKeyDown={(e) => {
                                            if (!newdata.value || adding) return;
                                            if (e.key === 'Enter') onAddNew(newdata.value);
                                        }}
                                        autoComplete="off"
                                        disabled={adding}
                                    />
                                    <button
                                        onClick={() => {
                                            if (!newdata.value || adding) return;
                                            onAddNew(newdata.value);
                                        }}
                                        className="p-2 bg-transparent border-0 text-blue-600 dark:text-blue-400 cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
                                        disabled={adding}
                                    >
                                        {adding ? (
                                            <div className="inline-block w-5 h-5 align-text-bottom border-2 border-current border-r-transparent rounded-full animate-spin" />
                                        ) : <Plus size={20} />}
                                    </button>
                                </div>
                            </ListItem>
                        </div>
                    }
                </div>

                {items.length === 0 && !onAddNew && (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-3">
                        No records found.
                    </div>
                )}
            </CardBody>

            {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
    );
}


// --- Other Styled Components ---

export const IconBadge: FC<{ icon: React.ElementType, text: string | number, color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" }> = ({ icon: Icon, text, color = "primary" }) => (
    <Badge variant={color} className="flex items-center gap-1 !px-2 !py-1 text-[0.7rem] uppercase whitespace-nowrap">
        <Icon size={12} />
        <span>{text}</span>
    </Badge>
);

export const MainContainer: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={className} style={style}>
        {children}
    </div>
);

export const SettingsBox: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-6 bg-[var(--modal-settings-bg)] border border-[var(--modal-settings-border)] rounded-lg transition-colors duration-300">
        {children}
    </div>
);

export const IconBox: FC<{
    icon: React.ElementType,
    color: string,
    borderColor?: string,
    background?: string,
    className?: string,
    textClassName?: string,
    title?: string,
    description?: string,
    style?: React.CSSProperties
}> = ({ icon: Icon, color, borderColor, background, className, textClassName, style, title, description }) => (
    <div className="flex items-center min-w-0">
        <div
            className={clsx("flex shrink-0 items-center justify-center w-12 h-12 mr-5 text-xl rounded-[14px] border", className)}
            style={{ color: color, borderColor: borderColor || `${color}33`, background: background || `${color}1A`, ...style }}
        >
            <Icon />
        </div>
        {title &&
            <div className={clsx("overflow-hidden", textClassName)} title={`${title}${description ? ` - ${description}` : ''}`}>
                <h5 className="mb-0 font-bold truncate">{title}</h5>
                <small className="block text-gray-500 dark:text-gray-400 truncate">{description}</small>
            </div>
        }
    </div>
);

export const IconBoxRounded: FC<{
    icon: React.ElementType,
    color: string,
    borderColor?: string,
    background?: string,
    className?: string,
    style?: React.CSSProperties
}> = ({ icon: Icon, color, borderColor, background, className, style }) => (
    <div
        className={clsx("flex shrink-0 items-center justify-center w-12 h-12 rounded-full border", className)}
        style={{ color: color, borderColor: borderColor || `${color}33`, background: background || `${color}1A`, ...style }}
    >
        <Icon />
    </div>
);

export const FilterSearch: FC<{
    onEnter: (str: string) => void,
    className?: string,
    style?: React.CSSProperties, size?: 'sm' | 'lg',
    inputStyle?: React.CSSProperties,
    inputClassName?: string,
}> = ({ onEnter, className, style, size, inputStyle, inputClassName }) => {
    const [filterInput, setFilterInput] = useState('');
    return (
        <div className={clsx("relative", className)} style={style}>
            <div
                className={clsx("absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none", size === 'sm' ? "left-[0.8rem]" : "left-4")}
            >
                <Search size={size === 'sm' ? 14 : 18} />
            </div>
            <input
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder="Search..."
                onKeyDown={(e) => e.key === 'Enter' && onEnter(filterInput.toLowerCase())}
                className={clsx(
                    "w-full bg-[var(--bs-secondary-bg)] border border-sidebar-border rounded-full focus:bg-[var(--bs-body-bg)] focus:border-blue-500 focus:outline-none transition-colors",
                    size === 'sm' ? "h-8 pl-10 text-sm" : "h-10 pl-12",
                    inputClassName
                )}
                style={inputStyle}
                autoComplete="off"
            />
        </div>
    );
};

export const ErrorMsg: FC<{ msg: string, code?: string, raw?: string }> = ({ msg, code, raw }) => {
    return (
        <div className="p-4 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800/30">
            <h4 className="font-semibold text-lg mb-2">{code} - {msg}</h4>
            <pre className="mb-0 text-sm whitespace-pre-wrap">{raw}</pre>
        </div>
    );
};
