import type { DNSHistoryStats } from "@/api/dns-history";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { formatLatency, timeRanges, type TimeRangeKey } from "./format";

function Tile({ label, value, tone, detail }: { label: string; value: string; tone?: "danger" | "warning" | "info"; detail?: string }) {
    return <div className="min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface px-3 py-2.5">
        <dt className="truncate text-xs text-ui-muted">{label}</dt>
        <dd className={clsx("m-0 truncate text-lg font-semibold tabular-nums", tone === "danger" ? "text-ui-danger" : tone === "warning" ? "text-ui-warning" : tone === "info" ? "text-ui-info" : "text-ui-heading")}>{value}</dd>
        {detail && <dd className="m-0 truncate text-xs text-ui-muted">{detail}</dd>}
    </div>;
}

/** Aggregates for the selected period, from one stats request. */
export function DNSHistoryOverview({ range, onRangeChange, stats }: { range: TimeRangeKey; onRangeChange: (range: TimeRangeKey) => void; stats?: DNSHistoryStats }) {
    const { t, i18n } = useTranslation("dns");
    const number = (value?: number) => value === undefined ? "—" : value.toLocaleString(i18n.language);
    const percent = (part: number, total: number) => total > 0 ? `${Math.round(part / total * 100)}%` : "—";
    const cacheLookups = (stats?.cacheHits ?? 0) + (stats?.cacheMisses ?? 0);
    return <section aria-label={t("overview.label")} className="mb-4 min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="m-0 text-sm font-medium text-ui-heading">{t("overview.label")}</h2>
            <ToggleGroup type="single" value={range} onValueChange={value => value && onRangeChange(value as TimeRangeKey)} aria-label={t("overview.period")}>
                {timeRanges.map(item => <ToggleItem key={item.key} value={item.key} className="px-2.5 text-xs">{t(`range.${item.key}`)}</ToggleItem>)}
            </ToggleGroup>
        </div>
        <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            <Tile label={t("overview.total")} value={number(stats?.total)} />
            <Tile label={t("overview.success")} value={number(stats?.success)} detail={stats ? percent(stats.success, stats.total) : undefined} />
            <Tile label={t("overview.errors")} value={number(stats?.failed)} tone={stats?.failed ? "danger" : undefined} detail={stats?.timeout ? t("overview.timeouts", { count: stats.timeout }) : undefined} />
            <Tile label={t("overview.dropped")} value={number(stats?.dropped)} tone={stats?.dropped ? "warning" : undefined} detail={stats?.writeErrors ? t("overview.writeErrors", { count: stats.writeErrors }) : undefined} />
            <Tile label={t("overview.fakeip")} value={number(stats?.fakeip)} tone={stats?.fakeip ? "info" : undefined} />
            <Tile label={t("overview.cacheHitRate")} value={stats ? percent(stats.cacheHits, cacheLookups) : "—"} detail={stats && cacheLookups ? t("overview.cacheLookups", { hits: number(stats.cacheHits), misses: number(stats.cacheMisses) }) : undefined} />
            <Tile label={t("overview.avgLatency")} value={stats && stats.total ? formatLatency(stats.avgLatencyNs) : "—"} />
        </dl>
    </section>;
}
