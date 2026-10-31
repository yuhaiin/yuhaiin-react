import { clsx } from "clsx";
import { ArrowDownWideNarrow, ChevronRight, Clock, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Card, CardBody, CardList, FilterSearch, SettingLabel } from "./card";
import { Dropdown, DropdownContent, DropdownTrigger } from "./dropdown";
import { Pagination } from "./pagination";
import { Spinner } from "./spinner";
import { motionTiming } from "./styles";
import { ToggleGroup, ToggleItem } from "./togglegroup";

type HistoryTone = "info" | "success" | "warning" | "danger" | "neutral";

const badgeTones: Record<HistoryTone, string> = {
    info: "border-ui-info/20 bg-ui-info-soft text-ui-info",
    success: "border-ui-success/20 bg-ui-success-soft text-ui-success",
    warning: "border-ui-warning/20 bg-ui-warning-soft text-ui-warning",
    danger: "border-ui-danger/20 bg-ui-danger-soft text-ui-danger",
    neutral: "border-ui-border bg-ui-surface-muted text-ui-muted",
};

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

export type HistoryMeta = {
    icon: React.ElementType;
    text: React.ReactNode;
    tone?: HistoryTone;
    /** The desktop subtitle already carries this value. */
    mobileOnly?: boolean;
};

const HistoryBadge = ({ icon: Icon, text, tone = "info" }: HistoryMeta) => (
    <span className={clsx("inline-flex shrink-0 items-center gap-1 rounded-ui-xs border px-2 py-1 text-[11px] font-medium leading-none whitespace-nowrap", badgeTones[tone])}>
        <Icon size={12} aria-hidden="true" />
        <span>{text}</span>
    </span>
);

/** Two lines below md, so a phone shows about twice as many records per screen. */
export const HistoryRow = React.memo(({ icon: Icon, iconTone = "primary", title, titleClassName = "text-ui-heading", subtitle, subtitleOnMobile = false, time, meta }: {
    icon: React.ElementType;
    iconTone?: "primary" | "danger";
    title: string;
    titleClassName?: string;
    subtitle: React.ReactNode;
    /** Appends the subtitle to the mobile line when no badge carries its value. */
    subtitleOnMobile?: boolean;
    time: string;
    meta: HistoryMeta[];
}) => (
    <div className="flex w-full min-w-0 items-center gap-3">
        <div className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border",
            iconTone === "danger" ? "border-ui-danger/20 bg-ui-danger-soft text-ui-danger" : "border-ui-primary/20 bg-ui-primary-soft text-ui-primary",
        )}>
            <Icon size={17} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 items-baseline gap-2">
                <span className={clsx("truncate text-sm font-semibold md:text-base", titleClassName)} title={title}>{title}</span>
                <small className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-ui-muted md:hidden">{time}</small>
            </div>
            <small className="hidden truncate font-mono text-xs text-ui-muted md:block">{subtitle}</small>
            <small className="truncate text-xs text-ui-muted md:hidden">
                {meta.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span aria-hidden="true"> · </span>}
                        <span className={textTones[item.tone ?? "neutral"]}>{item.text}</span>
                    </React.Fragment>
                ))}
                {subtitleOnMobile && <><span aria-hidden="true"> · </span>{subtitle}</>}
            </small>
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
            {meta.filter(item => !item.mobileOnly).map((item, index) => <HistoryBadge key={index} {...item} />)}
            <HistoryBadge icon={Clock} text={time} tone="neutral" />
            <ChevronRight size={17} className="ml-1 text-ui-muted/50" />
        </div>
    </div>
));
HistoryRow.displayName = "HistoryRow";

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
            {filter}
            <Button size="sm" className={historyToolbarButton} aria-label={uiT("refresh")} onClick={onRefresh} disabled={refreshing}>
                {refreshing ? <Spinner size="sm" /> : <RotateCw size={16} />}
            </Button>
            <Dropdown>
                <DropdownTrigger asChild><Button size="sm" className={historyToolbarButton} aria-label={uiT("sortOrder")}><ArrowDownWideNarrow size={16} /></Button></DropdownTrigger>
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

export function HistoryListSkeleton({ rows = 8 }: { rows?: number }) {
    const { t } = useTranslation("common");

    return (
        <Card>
            <CardBody className="max-md:p-1.5">
                <div data-loading="" role="status" aria-label={t("state.loading")} className="flex flex-col gap-3 motion-safe:animate-pulse max-md:gap-0">
                    {Array.from({ length: rows }, (_, index) => (
                        <div key={index} className="flex min-h-list-row items-center gap-3 px-3 py-2">
                            <div className="h-9 w-9 shrink-0 rounded-ui-md bg-ui-surface-muted" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="h-3.5 w-3/5 rounded-ui-xs bg-ui-surface-muted" />
                                <div className="h-2.5 w-2/5 rounded-ui-xs bg-ui-surface-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
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

export function HistoryList<T>({ items, getKey, onClickItem, renderRow, page, totalItems, pageSize, onPageChange, resetKey }: {
    items: T[];
    getKey: (item: T) => string;
    onClickItem: (item: T) => void;
    renderRow: (item: T) => React.ReactNode;
    page: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    /** The same key given to usePagination: filters and sorting also restart at the top. */
    resetKey: string;
}) {
    const root = useRef<HTMLDivElement>(null);
    const position = `${page}|${resetKey}`;
    const lastPosition = useRef(position);
    const [view, setView] = useState({ page, resetKey, direction: 0 });
    // Pages slide the way the reader moved; sorting and filtering only fade.
    const moved = view.page !== page || view.resetKey !== resetKey;
    const direction = !moved ? view.direction : view.resetKey === resetKey ? Math.sign(page - view.page) : 0;
    if (moved) setView({ page, resetKey, direction });
    const fresh = useFreshKeys(items.map(getKey), position);

    useLayoutEffect(() => {
        if (lastPosition.current === position) return;
        lastPosition.current = position;
        const scroller = root.current?.closest('[data-ui-transition="page"]');
        if (scroller) scroller.scrollTop = 0;
    }, [position]);

    return (
        <div ref={root}>
            <CardList
                items={items}
                animated={false}
                bodyClassName="max-md:p-1.5"
                listClassName="max-md:gap-0 max-md:divide-y max-md:divide-ui-border/60"
                listKey={position}
                listMotion={{
                    initial: { opacity: 0, x: direction * 16 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: motionTiming.slow, ease: "easeOut" },
                }}
                getKey={getKey}
                onClickItem={onClickItem}
                renderListItem={item => fresh.has(getKey(item))
                    ? <motion.div data-history-fresh="" className="w-full min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}>{renderRow(item)}</motion.div>
                    : renderRow(item)}
                footer={totalItems > pageSize ? <Pagination currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={onPageChange} /> : undefined}
            />
        </div>
    );
}
