import { clsx } from "clsx";
import { ArrowDown, ArrowDownWideNarrow, ArrowUp, ArrowUpDown, ListFilter, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { FilterSearch, SettingLabel } from "./card";
import { Dropdown, DropdownContent, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from "./dropdown";
import { Pagination } from "./pagination";
import { Spinner } from "./spinner";
import { cn, motionTiming, ui } from "./styles";
import { ToggleGroup, ToggleItem } from "./togglegroup";

export type HistoryTone = "info" | "success" | "warning" | "danger" | "neutral";

const textTones: Record<HistoryTone, string> = {
    info: "text-ui-info",
    success: "text-ui-success",
    warning: "text-ui-warning",
    danger: "text-ui-danger",
    neutral: "text-ui-muted",
};

export function formatProtocolLabel(value?: string) {
    if (!value) return "Unknown";
    return value.split("_").join("/").toUpperCase();
}

/** Today's records need only the time; older ones must say which day they belong to. */
export function formatHistoryTime(date: Date, now = new Date()) {
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString();
    const year = date.getFullYear() === now.getFullYear() ? undefined : "numeric";
    return date.toLocaleString(undefined, { year, month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** FilterSearch already lowercases the query. */
export function matchesHistorySearch(query: string, ...fields: (string | undefined)[]) {
    return !query || fields.some(field => field?.toLowerCase().includes(query));
}

export type HistorySortOrder = "asc" | "desc";

/** Clicking the active column flips it; a new column starts in its natural order. */
export function nextHistorySort(field: string, sortBy: string, sortOrder: HistorySortOrder): { sortBy: string; sortOrder: HistorySortOrder } {
    if (field === sortBy) return { sortBy, sortOrder: sortOrder === "asc" ? "desc" : "asc" };
    return { sortBy: field, sortOrder: field === "Time" || field === "Count" ? "desc" : "asc" };
}

/**
 * A column of the history table. Below md a row collapses to two lines: the
 * primary cell with the `aside` cell beside it, then the remaining cells.
 */
export type HistoryColumn<T> = {
    id: string;
    header: string;
    /** CSS grid track used from md up. */
    width: string;
    cell: (item: T) => React.ReactNode;
    /** Wording for the collapsed mobile line, where there is no column header. */
    mobileCell?: (item: T) => React.ReactNode;
    /** Accessible name of the primary cell's button. */
    label?: (item: T) => string;
    role?: "primary" | "aside";
    numeric?: boolean;
    sortKey?: string;
    /** A single-choice filter offered from the column header; the first option means "all". */
    filter?: HistoryColumnFilter;
    tone?: HistoryTone;
    mono?: boolean;
};

export type HistoryColumnFilter = {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
};

function ColumnFilter({ filter, align }: { filter: HistoryColumnFilter; align: "start" | "end" }) {
    const active = filter.value !== filter.options[0]?.value;
    const current = filter.options.find(option => option.value === filter.value)?.label ?? filter.value;
    return <Dropdown>
        <DropdownTrigger asChild>
            <button type="button" aria-label={`${filter.label}: ${current}`} title={current}
                className={cn("relative inline-flex size-7 shrink-0 items-center justify-center rounded-ui-sm hover:bg-ui-hover hover:text-ui-heading", ui.focusRing, active ? "text-ui-primary" : "text-ui-tertiary")}>
                <ListFilter size={13} aria-hidden="true" />
                {active && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-ui-primary" />}
            </button>
        </DropdownTrigger>
        <DropdownContent align={align} className="w-auto min-w-[160px] max-w-[240px]">
            <DropdownRadioGroup value={filter.value} onValueChange={filter.onChange}>
                {filter.options.map(option => <DropdownRadioItem key={option.value} value={option.value}>{option.label}</DropdownRadioItem>)}
            </DropdownRadioGroup>
        </DropdownContent>
    </Dropdown>;
}

/** Primary cell content: a title with an optional muted second line. */
export function HistoryTitle({ title, detail, detailTone = "neutral" }: { title: string; detail?: React.ReactNode; detailTone?: HistoryTone }) {
    return <>
        <span className="block truncate text-sm font-medium text-ui-heading" title={title}>{title}</span>
        {detail && <span className={clsx("block truncate text-xs leading-[18px]", textTones[detailTone])}>{detail}</span>}
    </>;
}

function HistoryHeader<T>({ columns, template, sortBy, sortOrder, onSort }: {
    columns: HistoryColumn<T>[]; template: string; sortBy?: string; sortOrder?: HistorySortOrder; onSort?: (field: string) => void;
}) {
    return <div role="rowgroup" className="hidden border-b border-ui-border bg-ui-surface-muted/40 md:block">
        <div role="row" className="grid items-center gap-x-3 px-3 py-1" style={{ gridTemplateColumns: template }}>
            {columns.map(column => {
                const active = column.sortKey !== undefined && column.sortKey === sortBy;
                const sort = active ? sortOrder === "asc" ? "ascending" : "descending" : "none";
                const filter = column.filter && <ColumnFilter filter={column.filter} align={column.numeric ? "end" : "start"} />;
                if (!column.sortKey || !onSort) return <div key={column.id} role="columnheader" className={clsx("flex min-h-9 min-w-0 items-center gap-1 text-xs text-ui-muted", column.numeric && "justify-end")}>
                    <span className="min-w-0 truncate">{column.header}</span>{filter}
                </div>;
                // Numeric columns align right, so their sort arrow sits before the label.
                return <div key={column.id} role="columnheader" aria-sort={sort} className="flex min-w-0 items-center gap-1">
                    <button type="button" onClick={() => onSort(column.sortKey!)}
                        className={cn("relative inline-flex min-h-9 w-full min-w-0 items-center rounded-ui-sm text-xs font-medium hover:text-ui-heading", column.numeric ? "justify-end" : "justify-start", ui.focusRing, active ? "text-ui-heading" : "text-ui-muted")}>
                        <span className={cn("relative min-w-0 max-w-full", column.numeric ? "pl-4" : "pr-4")}>
                            <span className="block truncate">{column.header}</span>
                            <span className={cn("absolute top-1/2 -translate-y-1/2", column.numeric ? "left-0" : "right-0")} aria-hidden="true">
                                {active ? sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} className="text-ui-tertiary" />}
                            </span>
                        </span>
                    </button>
                    {filter}
                </div>;
            })}
        </div>
    </div>;
}

function cellClass<T>(column: HistoryColumn<T>) {
    return clsx("min-w-0 truncate", column.numeric && "text-right tabular-nums", column.mono && "font-mono", column.role !== "primary" && "text-xs", textTones[column.tone ?? "neutral"]);
}

function HistoryTableRow<T>({ item, columns, template, onClick, fresh }: {
    item: T; columns: HistoryColumn<T>[]; template: string; onClick: (item: T) => void; fresh: boolean;
}) {
    const primary = columns.find(column => column.role === "primary") ?? columns[0];
    const aside = columns.find(column => column.role === "aside");
    const rest = columns.filter(column => column !== primary && column !== aside);
    const Row = fresh ? motion.div : "div";
    // From md up every cell is a grid column in declaration order; below md the
    // rest collapse into one dotted line under the title.
    return <Row role="row" onClick={() => onClick(item)} {...(fresh ? { "data-history-fresh": "", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, ease: "easeOut" as const } } : {})}
        style={{ "--history-columns": template } as React.CSSProperties}
        className="grid min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 border-b border-ui-border/60 bg-ui-surface px-3 py-2 text-sm last:border-b-0 hover:bg-ui-hover focus-within:bg-ui-hover md:min-h-[52px] md:[grid-template-columns:var(--history-columns)]">
        {columns.map(column => {
            if (column === primary) return <div key={column.id} role="cell" className="col-start-1 row-start-1 min-w-0 md:col-auto md:row-auto">
                <button type="button" aria-label={column.label?.(item)} className={cn("block w-full min-w-0 rounded-ui-sm text-left", ui.focusRing)}>{column.cell(item)}</button>
            </div>;
            if (column === aside) return <div key={column.id} role="cell" className={clsx(cellClass(column), "col-start-2 row-start-1 md:col-auto md:row-auto")}>{column.cell(item)}</div>;
            return <div key={column.id} role="cell" className={clsx(cellClass(column), "hidden md:block")}>{column.cell(item)}</div>;
        })}
        {/* Below md the secondary cells share one line under the title. */}
        {rest.length > 0 && <div className="col-span-2 row-start-2 min-w-0 truncate text-xs text-ui-muted md:hidden">
            {rest.map((column, index) => <React.Fragment key={column.id}>{index > 0 && <span aria-hidden="true"> · </span>}<span className={textTones[column.tone ?? "neutral"]}>{(column.mobileCell ?? column.cell)(item)}</span></React.Fragment>)}
        </div>}
    </Row>;
}

/** Borderless below lg, where the bar sits directly on the page instead of in its own frame. */
export const historyToolbarButton = "max-lg:border-transparent max-lg:bg-transparent max-lg:shadow-none";

export function HistoryToolbar({ onSearch, filter, onRefresh, refreshing, sortOrder, onSortOrderChange, sortBy, onSortByChange, sortOptions }: {
    onSearch: (query: string) => void;
    filter?: React.ReactNode;
    onRefresh: () => void;
    refreshing: boolean;
    sortOrder: "asc" | "desc";
    onSortOrderChange: (order: "asc" | "desc") => void;
    sortBy: string;
    onSortByChange: (field: string) => void;
    sortOptions: { value: string; label: string }[];
}) {
    const { t: uiT } = useTranslation("ui");

    return (
        <div className="flex w-full items-center justify-end gap-1 lg:w-auto lg:gap-2 lg:rounded-ui-lg lg:border lg:border-ui-border lg:bg-ui-surface-muted/50 lg:p-2">
            <FilterSearch
                onSearch={onSearch}
                size="sm"
                className="min-w-0 flex-1 lg:flex-none"
                inputClassName="max-sm:h-11 max-sm:text-base"
            />
            {/* From md up the table header sorts and filters; the toolbar keeps them for phones. */}
            {filter && <div className="contents md:hidden">{filter}</div>}
            <Button size="sm" className={historyToolbarButton} aria-label={uiT("refresh")} onClick={onRefresh} disabled={refreshing}>
                {refreshing ? <Spinner size="sm" /> : <RotateCw size={16} />}
            </Button>
            <Dropdown>
                <DropdownTrigger asChild><Button size="sm" className={cn(historyToolbarButton, "md:hidden")} aria-label={uiT("sortOrder")}><ArrowDownWideNarrow size={16} /></Button></DropdownTrigger>
                <DropdownContent align="end" className="w-[min(320px,calc(100vw-2rem))] min-w-0 max-w-[calc(100vw-2rem)] p-3">
                    <div className="mb-3">
                        <SettingLabel>{uiT("sortOrder")}</SettingLabel>
                        <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && onSortOrderChange(v as "asc" | "desc")} className="w-full">
                            <ToggleItem value="asc" className="grow">{uiT("ascLabel")}</ToggleItem>
                            <ToggleItem value="desc" className="grow">{uiT("descLabel")}</ToggleItem>
                        </ToggleGroup>
                    </div>
                    <SettingLabel>{uiT("sortBy")}</SettingLabel>
                    <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && onSortByChange(v)} className="flex w-full flex-wrap whitespace-nowrap">
                        {sortOptions.map(option => <ToggleItem key={option.value} value={option.value} className="grow px-3">{option.label}</ToggleItem>)}
                    </ToggleGroup>
                </DropdownContent>
            </Dropdown>
        </div>
    );
}

const tableFrame = "min-w-0 overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface";

export function HistoryListSkeleton({ rows = 8 }: { rows?: number }) {
    const { t } = useTranslation("common");

    return (
        <div data-loading="" role="status" aria-label={t("state.loading")} className={cn(tableFrame, "motion-safe:animate-pulse")}>
            <div className="hidden h-[38px] border-b border-ui-border bg-ui-surface-muted/40 md:block" />
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="flex min-h-[52px] items-center gap-3 border-b border-ui-border/60 px-3 py-2 last:border-b-0">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="h-3.5 w-3/5 rounded-ui-xs bg-ui-surface-muted" />
                        <div className="h-2.5 w-2/5 rounded-ui-xs bg-ui-surface-muted md:hidden" />
                    </div>
                    <div className="hidden h-3 w-16 rounded-ui-xs bg-ui-surface-muted md:block" />
                    <div className="h-3 w-20 rounded-ui-xs bg-ui-surface-muted" />
                </div>
            ))}
        </div>
    );
}

/** Rows a refresh added to the current view; changing the page or filters adds none. */
function useFreshKeys(keys: string[], position: string) {
    const signature = keys.join("\n");
    const [known, setKnown] = useState({ signature, position, keys: new Set(keys), fresh: new Set<string>() });
    if (known.signature === signature && known.position === position) return known.fresh;
    const fresh = new Set(known.position === position ? keys.filter(key => !known.keys.has(key)) : []);
    setKnown({ signature, position, keys: new Set(keys), fresh });
    return fresh;
}

export function HistoryList<T>({ label, items, columns, getKey, onClickItem, page, totalItems, pageSize, onPageChange, resetKey, sortBy, sortOrder, onSort, empty }: {
    label: string;
    items: T[];
    columns: HistoryColumn<T>[];
    getKey: (item: T) => string;
    onClickItem: (item: T) => void;
    page: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    /** The same key given to usePagination: filters and sorting also restart at the top. */
    resetKey: string;
    sortBy?: string;
    sortOrder?: HistorySortOrder;
    onSort?: (field: string) => void;
    empty?: React.ReactNode;
}) {
    const { t } = useTranslation("common");
    const root = useRef<HTMLDivElement>(null);
    const position = `${page}|${resetKey}`;
    const lastPosition = useRef(position);
    const [view, setView] = useState({ page, resetKey, direction: 0 });
    // Pages slide the way the reader moved; sorting and filtering only fade.
    const moved = view.page !== page || view.resetKey !== resetKey;
    const direction = !moved ? view.direction : view.resetKey === resetKey ? Math.sign(page - view.page) : 0;
    if (moved) setView({ page, resetKey, direction });
    const fresh = useFreshKeys(items.map(getKey), position);
    const template = columns.map(column => column.width).join(" ");

    useLayoutEffect(() => {
        if (lastPosition.current === position) return;
        lastPosition.current = position;
        const scroller = root.current?.closest('[data-ui-transition="page"]');
        if (scroller) scroller.scrollTop = 0;
    }, [position]);

    return (
        <div ref={root} className="space-y-3">
            <section role="table" aria-label={label} aria-rowcount={totalItems} className={tableFrame}>
                <HistoryHeader columns={columns} template={template} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                <motion.div key={position} role="rowgroup" initial={{ opacity: 0, x: direction * 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: motionTiming.slow, ease: "easeOut" }}>
                    {items.map(item => <HistoryTableRow key={getKey(item)} item={item} columns={columns} template={template}
                        onClick={onClickItem} fresh={fresh.has(getKey(item))} />)}
                    {!items.length && <div className="min-h-[160px] p-6 text-center text-sm text-ui-muted">{empty ?? t("state.noRecords")}</div>}
                </motion.div>
            </section>
            {totalItems > pageSize && <div className="flex justify-center"><Pagination currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} /></div>}
        </div>
    );
}
