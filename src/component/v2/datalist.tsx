import { clsx } from 'clsx';
import React, { FC } from 'react';

// --- Base List Container ---
export const DataList: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ul className={clsx("list-none p-0 m-0", className)}>{children}</ul>
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
        <li className={clsx("py-4 border-b border-sidebar-border last:border-b-0 transition-colors duration-200", className)}>
            <div className="flex flex-col gap-1 min-[576px]:flex-row min-[576px]:justify-between min-[576px]:items-start min-[576px]:gap-4">
                {/* Key */}
                <div className="notranslate shrink-0 min-w-[120px] text-sm font-semibold text-sidebar-header capitalize leading-normal">
                    {label}
                </div>

                {/* Value */}
                <div className="notranslate grow text-[15px] font-normal text-sidebar-color leading-normal break-all min-[576px]:text-right">
                    {value}
                </div>
            </div>
        </li>
    );
};

// --- Custom Item (for complex content) ---
export const DataListCustomItem: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <li className={clsx("py-4 border-b border-sidebar-border last:border-b-0 transition-colors duration-200", className)}>
        {children}
    </li>
);
