'use client';

import { clsx } from "clsx";
import React, { FC, useState } from 'react';
import { ClockHistory, ExclamationTriangleFill, PlusLg, Search } from "react-bootstrap-icons";
import styles from './card.module.css';

// --- Basic Card Components ---

export const Card: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${styles.card} ${className ? className : ''}`} style={style}>
        {children}
    </div>
);

export const CardHeader: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${styles.cardHeader} ${className ? className : ''}`} style={style}>
        {children}
    </div>
);

export const CardBody: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${styles.cardBody} ${className || ''}`} style={style}>
        {children}
    </div>
);

export const CardTitle: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${styles.cardTitle} ${className || ''}`} style={style}>
        {children}
    </div>
);

export const CardFooter: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${styles.cardFooter} ${className ? className : ''}`} style={style}>
        {children}
    </div>
);

export const ListItem: FC<{
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    onClick?: () => void
}> = ({ children, className, style, onClick }) => (
    <div className={`${styles.listItem} ${className}`} style={style} onClick={onClick}>
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
};

export function CardList<T>({ items, onClickItem, footer, renderListItem: body, header }: CardListProps<T>) {
    return (
        <Card>
            {header && <CardHeader>{header}</CardHeader>}
            <CardBody>
                <div className={styles.listContainer}>
                    {items.length > 0 ? (
                        items.map((child, index) => (
                            <ListItem key={index} onClick={onClickItem ? () => onClickItem(child, index) : undefined}>
                                {body(child, index)}
                            </ListItem>
                        ))
                    ) : (
                        <div className="text-center text-muted p-5 opacity-50">
                            <ClockHistory className="fs-1 d-block mb-2 mx-auto" />
                            No records found.
                        </div>
                    )}
                </div>
            </CardBody>
            {footer && (
                <CardFooter>
                    <div className="d-flex justify-content-center">
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
    ...props // Receive and pass through all standard label attributes including htmlFor
}) => (
    <label
        className={clsx(styles.settingLabel, className)}
        {...props}
    >
        {children}
    </label>
);


export const ErrorBox: FC<{ msgs: string[] }> = ({ msgs }) => {
    if (msgs.length === 0) return null;
    return (
        <div className={styles.errorBox}>
            <ExclamationTriangleFill className="me-3 mt-1 fs-5" />
            <div className="flex-grow-1">
                <h6 className="fw-bold mb-2">Configuration Error</h6>
                <ul className="mb-0 ps-3">
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
                <div className={styles.cardRowGrid}>
                    {items.map((value, index) =>
                        <div key={index}>
                            <ListItem onClick={() => onClickItem?.(value, index)}>
                                {body(value, index)}
                            </ListItem>
                        </div>
                    )}

                    {onAddNew &&
                        <div>
                            <ListItem className={styles.newItemBox}>
                                <div className={styles.inputGroup}>
                                    <input
                                        value={newdata.value}
                                        onChange={(e) => setNewdata({ value: e.target.value })}
                                        placeholder="Create new..."
                                        className={styles.seamlessInput}
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
                                        className={styles.seamlessBtn}
                                        disabled={adding}
                                    >
                                        {adding ? <div className={styles.spinner} /> : <PlusLg className="fs-5" />}
                                    </button>
                                </div>
                            </ListItem>
                        </div>
                    }
                </div>

                {items.length === 0 && !onAddNew && (
                    <div className="text-center text-muted p-3">
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
    <div className={`d-flex align-items-center gap-1 px-2 py-1 rounded bg-${color} bg-opacity-10 text-${color}`} style={{ fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        <Icon />
        <span className="text-uppercase">{text}</span>
    </div>
);

export const MainContainer: FC<{ children: React.ReactNode, className?: string, style?: React.CSSProperties }> = ({ children, className, style }) => (
    <div className={`${className ? className : ''}`} style={style}>
        {children}
    </div>
);

export const SettingsBox: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={styles.settingsBox}>
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
    <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
        <div
            className={clsx(styles.iconBox, className)}
            style={{ color: color, borderColor: borderColor || `${color}33`, background: background || `${color}1A`, ...style }}
        >
            <Icon />
        </div>
        {title &&
            <div className={clsx("overflow-hidden", textClassName)} title={`${title}${description ? ` - ${description}` : ''}`}>
                <h5 className="mb-0 fw-bold text-truncate">{title}</h5>
                <small className="text-muted text-truncate d-block">{description}</small>
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
        className={`${styles.iconBox} rounded-circle ${className}`}
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
        <div className={clsx(styles.filterSearchWrapper, className)} style={style}>
            <Search className={`${styles.filterSearchIcon} ${size === 'sm' ? styles.sm : ''}`} style={size === 'sm' ? { left: '0.8rem', fontSize: '0.8rem' } : undefined} />
            <input
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                placeholder="Search..."
                onKeyDown={(e) => e.key === 'Enter' && onEnter(filterInput.toLowerCase())}
                className={clsx(styles.filterSearchInput, size === 'sm' && styles.filterSearchInputSm, inputClassName)}
                style={inputStyle}
                autoComplete="off"
            />
        </div>
    );
};

export const ErrorMsg: FC<{ msg: string, code?: string, raw?: string }> = ({ msg, code, raw }) => {
    return (
        <div className={`${styles.errorBox} ${styles.errorMsg}`}>
            <h4 className="alert-heading">{code} - {msg}</h4>
            <pre className="mb-0 small">{raw}</pre>
        </div>
    );
};

