import { clsx } from 'clsx';
import React, { FC } from 'react';
import styles from './datalist.module.css';

// --- Base List Container ---
export const DataList: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ul className={clsx(styles.container, className)}>{children}</ul>
);

// --- Key-Value Item ---
interface DataListItemProps {
    label: string;
    value?: string | number | React.ReactNode | null;
    className?: string;
}

export const DataListItem: FC<DataListItemProps> = ({ label, value, className }) => {
    // Logic guard: if value is null or empty, do not render
    if (value === undefined || value === null || value === "") {
        return null;
    }


    return (
        <li className={clsx(styles.item, className)}>
            <div className={styles.content}>
                {/* Key */}
                <div className={clsx(styles.key, "notranslate")}>
                    {label}
                </div>

                {/* Value */}
                <div className={clsx(styles.value, "notranslate")}>
                    {value}
                </div>
            </div>
        </li>
    );
};

// --- Custom Item (for complex content) ---
export const DataListCustomItem: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <li className={clsx(styles.item, className)}>
        {children}
    </li>
);