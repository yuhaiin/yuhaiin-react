'use client';

import { clsx } from "clsx";
import { AnimatePresence, motion } from 'motion/react';
import { History, Plus, Search, TriangleAlert } from 'lucide-react';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from "./badge";
import { ui } from "./styles";

type Density = "compact" | "normal";

// --- Basic Card Components ---

export const Card: FC<{
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    interactive?: boolean,
    noMargin?: boolean,
    density?: Density
}> = ({ children, className, style, interactive = false, noMargin = false, density = "normal" }) => (
    <div
        className={clsx(
            "flex flex-col relative overflow-hidden",
            ui.card,
            interactive && ui.cardInteractive,
            !noMargin && (density === "compact" ? "mb-4" : "mb-8"),
            className
        )}
        style={{ viewTransitionName: "config-card-root", ...style }}
    >
        {children}
    </div>
);

export const CardHeader: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={clsx("flex items-center justify-between px-3 py-3 border-b border-ui-border", className)} style={style}>
        {children}
    </div>
);

export const CardBody: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties, density?: Density }> = ({ children, className, style, density = "normal" }) => (
    <div className={clsx("grow", density === "compact" ? "p-4" : "p-6", className)} style={style}>
        {children}
    </div>
);

export const CardTitle: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={clsx("flex items-center mb-3 text-[1.1rem] font-semibold text-ui-heading", className)} style={style}>
        {children}
    </div>
);

export const CardFooter: FC<{
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    bordered?: boolean,
    compact?: boolean
}> = ({ children, className, style, bordered = true, compact = false }) => (
    <div
        className={clsx(
            compact ? "px-4 py-3" : "px-6 py-4",
            "bg-transparent",
            bordered && "border-t border-ui-border",
            className
        )}
        style={style}
    >
        {children}
    </div>
);

export const ListItem: FC<{
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    onClick?: () => void,
    selected?: boolean,
    disabled?: boolean,
    density?: Density
}> = ({ children, className, style, onClick, selected = false, disabled = false, density = "normal" }) => (
    <div
        className={clsx(
            ui.listRow,
            density === "compact" && "min-h-0 p-3",
            selected && "border-ui-primary bg-ui-primary-soft text-ui-primary",
            disabled ? "cursor-not-allowed opacity-60" : onClick && "cursor-pointer",
            className
        )}
        style={style}
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled || undefined}
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
    animated?: boolean | "auto";
    animationLimit?: number;
    density?: Density;
};

export function CardList<T>({
    items,
    onClickItem,
    footer,
    renderListItem: body,
    header,
    getKey,
    animated = "auto",
    animationLimit = 100,
    density = "normal"
}: CardListProps<T>) {
    const { t } = useTranslation('common');
    const shouldAnimate = animated === true || (animated === "auto" && items.length <= animationLimit);

    const renderItem = (child: T, index: number) => {
        const key = getKey ? getKey(child) : index;
        const item = (
            <ListItem density={density} onClick={onClickItem ? () => onClickItem(child, index) : undefined}>
                {body(child, index)}
            </ListItem>
        );

        if (!shouldAnimate) {
            return <div key={key}>{item}</div>;
        }

        return (
            <motion.div
                key={key}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
            >
                {item}
            </motion.div>
        );
    };

    return (
        <Card density={density}>
            {header && <CardHeader>{header}</CardHeader>}
            <CardBody density={density}>
                <div className="flex flex-col gap-3">
                    {items.length > 0 ? (
                        shouldAnimate ? (
                            <AnimatePresence initial={false} mode="popLayout">
                                {items.map(renderItem)}
                            </AnimatePresence>
                        ) : items.map(renderItem)
                    ) : (
                        <div className="text-center text-ui-muted p-5 opacity-50">
                            <History className="block mb-2 mx-auto" size={40} />
                            {t('state.noRecords')}
                        </div>
                    )}
                </div>
            </CardBody>
            {footer && (
                <CardFooter compact={density === "compact"}>
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
            ui.sectionLabel,
            className
        )}
        {...props}
    >
        {children}
    </label>
);

export const ErrorBox: FC<{ msgs: string[] }> = ({ msgs }) => {
    const { t } = useTranslation('common');

    if (msgs.length === 0) return null;
    return (
        <div className="flex items-start gap-3 p-4 rounded-ui-sm bg-ui-danger-soft border-0 text-ui-danger">
            <TriangleAlert className="mt-1" size={20} />
            <div className="grow">
                <h6 className="font-bold mb-2">{t('state.configurationError', { defaultValue: 'Configuration Error' })}</h6>
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
    adding,
    animated = "auto",
    animationLimit = 100,
    density = "normal"
}: CardRowListProps<T>) {
    const { t } = useTranslation('common');
    const [newdata, setNewdata] = useState({ value: '' });
    const shouldAnimate = animated === true || (animated === "auto" && items.length <= animationLimit);

    const renderRowItem = (value: T, index: number) => {
        const item = (
            <div className="flex">
                <ListItem density={density} className="w-full" onClick={() => onClickItem?.(value, index)}>
                    {body(value, index)}
                </ListItem>
            </div>
        );

        if (!shouldAnimate) {
            return <React.Fragment key={index}>{item}</React.Fragment>;
        }

        return (
            <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
            >
                {item}
            </motion.div>
        );
    };

    return (
        <Card density={density}>
            {header && <CardHeader>{header}</CardHeader>}
            <CardBody density={density}>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
                    {shouldAnimate ? (
                        <AnimatePresence initial={false} mode="popLayout">
                            {items.map(renderRowItem)}
                        </AnimatePresence>
                    ) : items.map(renderRowItem)}

                    {onAddNew &&
                        <div className="flex">
                            <ListItem density={density} className="w-full border border-dashed border-ui-border bg-ui-surface-muted px-5 py-2">
                                <div className="flex items-center w-full min-h-[42px]">
                                    <input
                                        value={newdata.value}
                                        onChange={(e) => setNewdata({ value: e.target.value })}
                                        placeholder={t('state.createNew')}
                                        className="w-full p-2 text-base bg-transparent border-0 focus:outline-none placeholder:text-ui-muted"
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
                                        className={clsx(
                                            "p-2 bg-transparent border-0 text-ui-primary cursor-pointer disabled:text-ui-muted disabled:cursor-not-allowed",
                                            ui.focusRing
                                        )}
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
                    <div className="text-center text-ui-muted p-3">
                        {t('state.noRecords')}
                    </div>
                )}
            </CardBody>

            {footer && <CardFooter compact={density === "compact"}>{footer}</CardFooter>}
        </Card>
    );
}

// --- Other Styled Components ---

export const IconBadge: FC<{ icon: React.ElementType, text: string | number, color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" }> = ({ icon: Icon, text, color = "primary" }) => (
    <Badge variant={color} className="flex items-center gap-1 px-2 py-1 text-[0.7rem] uppercase whitespace-nowrap">
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
    <div className="p-6 bg-ui-surface-muted border border-ui-border rounded-ui-sm transition-colors duration-300">
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
            className={clsx("flex shrink-0 items-center justify-center w-icon-lg h-icon-lg mr-5 text-xl rounded-ui-lg border", className)}
            style={{ color: color, borderColor: borderColor || `${color}33`, background: background || `${color}1A`, ...style }}
        >
            <Icon />
        </div>
        {title &&
            <div className={clsx("overflow-hidden", textClassName)} title={`${title}${description ? ` - ${description}` : ''}`}>
                <h5 className="mb-0 font-bold truncate text-ui-heading">{title}</h5>
                <small className="block text-ui-muted truncate">{description}</small>
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
        className={clsx("flex shrink-0 items-center justify-center w-icon-lg h-icon-lg rounded-full border", className)}
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
    const { t } = useTranslation('common');
    const [filterInput, setFilterInput] = useState('');
    return (
        <div className={clsx("relative", className)} style={style}>
            <div
                className={clsx("absolute top-1/2 -translate-y-1/2 text-ui-muted pointer-events-none", size === 'sm' ? "left-[0.8rem]" : "left-4")}
            >
                <Search size={size === 'sm' ? 14 : 18} />
            </div>
            <input
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder={t('state.search')}
                onKeyDown={(e) => e.key === 'Enter' && onEnter(filterInput.toLowerCase())}
                className={clsx(
                    "w-full bg-ui-surface-muted border border-ui-border rounded-full focus:bg-ui-bg focus:border-ui-primary focus:outline-none transition-colors",
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
        <div className="p-4 rounded-ui-sm bg-ui-danger-soft text-ui-danger border border-ui-danger/30">
            <h4 className="font-semibold text-lg mb-2">{code} - {msg}</h4>
            <pre className="mb-0 text-sm whitespace-pre-wrap">{raw}</pre>
        </div>
    );
};
