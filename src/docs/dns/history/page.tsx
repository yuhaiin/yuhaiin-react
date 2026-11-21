import { getDNSHistorySettings, getDNSHistoryStats, listDNSHistory, type DNSHistoryRecord } from "@/api/dns-history";
import { listInbounds } from "@/api/inbounds";
import { can } from "@/auth/session";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { FilterSearch, MainContainer } from "@/component/v2/card";
import { HistoryList, HistoryListSkeleton, HistorySortMenu, HistoryTitle, formatHistoryTime, historyToolbarButton, nextHistorySort, type HistoryColumn, type HistorySortOrder } from "@/component/v2/history-list";
import Loading from "@/component/v2/loading";
import { PageHeader } from "@/component/v2/page-header";
import { Spinner } from "@/component/v2/spinner";
import { useServerPageClamp } from "@/hooks/use-pagination";
import { Database, ListFilter, RotateCw, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { DNSHistoryDetail } from "./detail";
import { DNSHistoryFilters } from "./filters";
import { activeFilterCount, emptyFilters, formatLatency, outcomeBadge, processName, rangeStart, toRequestFilter, type FilterState, type TimeRangeKey } from "./format";
import { DNSHistoryOverview } from "./overview";
import { DNSHistorySettingsModal } from "./settings";

export const PAGE_SIZE = 50;

const sortFields = { Time: "time", Domain: "domain", Type: "type", Result: "result", Latency: "latency" } as const;
type SortKey = keyof typeof sortFields;

/**
 * Numbered pages over a window that ends at `anchor`: requests arriving while
 * the reader pages do not shift the pages. Refresh moves the window.
 */
export default function DNSHistoryPage() {
    const { t } = useTranslation("dns");
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<FilterState>(emptyFilters);
    // Relative ranges resolve once per view so every page shares one window.
    const [anchor, setAnchor] = useState(() => Date.now());
    const [page, setPage] = useState(1);
    // Column sort keys; the server sorts because it pages.
    const [sortBy, setSortBy] = useState<SortKey>("Time");
    const [sortOrder, setSortOrder] = useState<HistorySortOrder>("desc");
    const [range, setRange] = useState<TimeRangeKey>("24h");
    const [selected, setSelected] = useState<DNSHistoryRecord>();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const request = useMemo(() => ({ ...toRequestFilter(filters, query, anchor), sortBy: sortFields[sortBy], sortOrder }), [filters, query, anchor, sortBy, sortOrder]);
    const listKey = JSON.stringify(request);
    const view = `${listKey}|${anchor}`;
    // Each result remembers the view it belongs to: while the next page loads
    // the previous rows stay, and the page transition runs when the new rows arrive.
    const list = useSWR(["/api/v2/dns/history", listKey, anchor, page], async () => ({ ...await listDNSHistory({ ...request, to: anchor + 1 }, page, PAGE_SIZE), view }), { keepPreviousData: true, revalidateOnFocus: false });
    useServerPageClamp(list.data ? { page: list.data.page, pageSize: list.data.limit, total: list.data.total } : undefined, page, setPage);
    const stats = useSWR(["/api/v2/dns/history/stats", range, anchor], () => getDNSHistoryStats(rangeStart(range, anchor) ?? 1), { revalidateOnFocus: false, shouldRetryOnError: false });
    const settings = useSWR("/api/v2/dns/history/settings", getDNSHistorySettings, { revalidateOnFocus: false });
    const readsInbounds = can("inbounds:read");
    const inbounds = useSWR(filtersOpen && readsInbounds ? "/api/v2/inbounds/dns-history-filter" : null, () => listInbounds({ pageSize: 200 }), { revalidateOnFocus: false });

    const restart = () => { setPage(1); setAnchor(Date.now()); };
    // A new anchor is a new key for the list and the overview: one request each.
    const refresh = restart;

    const sourceLabel = (item: DNSHistoryRecord) => t(`source.${item.sourceType}`, { defaultValue: item.sourceType });
    // The domain keeps a minimum and the largest share; secondary text columns
    // share what is left. Bounded tracks such as minmax(0,9rem) would grow
    // to their maximum before the domain's fr track and squeeze it to zero.
    // Process and resolver need an xl table; narrower ones keep them in the detail.
    const columns: HistoryColumn<DNSHistoryRecord>[] = [
        { id: "domain", header: t("column.domain"), sortKey: "Domain", width: "minmax(10rem,3fr)", role: "primary",
          label: item => t("column.openDetail", { domain: item.domain || t("detail.unknownDomain") }),
          cell: item => <HistoryTitle title={item.domain || t("detail.unknownDomain")}
              detail={item.error && !item.rcode ? item.error : item.answerSummary || [processName(item.processName), item.clientIp].filter(Boolean).join(" · ") || undefined}
              detailTone={item.error && !item.rcode ? "danger" : "neutral"} /> },
        { id: "type", header: t("column.type"), sortKey: "Type", width: "4rem", mono: true, cell: item => item.domain ? item.queryType : "—" },
        { id: "source", header: t("column.source"), width: "minmax(0,1fr)",
          cell: item => <span title={[sourceLabel(item), item.inboundName || item.inboundId, item.transport.toUpperCase()].filter(Boolean).join(" · ")}>{item.inboundName || item.inboundId || sourceLabel(item)}</span>,
          mobileCell: item => item.inboundName || item.inboundId || sourceLabel(item) },
        { id: "process", header: t("column.process"), width: "minmax(0,1fr)", from: "xl", cell: item => <span title={item.processName}>{processName(item.processName) || "—"}</span>, mobileCell: () => null },
        { id: "resolver", header: t("column.resolver"), width: "minmax(0,1fr)", from: "xl", cell: item => <span title={item.server}>{item.resolverLabel || item.resolver || "—"}</span>, mobileCell: () => null },
        { id: "result", header: t("column.result"), sortKey: "Result", width: "8rem", cell: item => <ResultCell item={item} /> },
        { id: "latency", header: t("column.latency"), sortKey: "Latency", width: "4.5rem", numeric: true, mono: true, cell: item => formatLatency(item.durationNs) },
        { id: "time", header: t("column.time"), sortKey: "Time", width: "6rem", numeric: true, mono: true, role: "aside", cell: item => formatHistoryTime(new Date(item.createdAt)) },
    ];

    const sort = (field: string) => { const next = nextHistorySort(field, sortBy, sortOrder); setSortBy(next.sortBy as SortKey); setSortOrder(next.sortOrder); setPage(1); };
    const filterCount = activeFilterCount(filters);
    const enabled = settings.data?.enabled;
    const items = list.data?.items ?? [];
    const total = list.data?.total ?? 0;
    const shownPage = list.data?.page ?? page;
    const resetKey = list.data?.view ?? view;

    return <MainContainer className="flex min-h-full min-w-0 flex-col">
        <DNSHistoryDetail summary={selected} onClose={() => setSelected(undefined)} />
        <DNSHistoryFilters open={filtersOpen} onOpenChange={setFiltersOpen} value={filters}
            inbounds={readsInbounds ? inbounds.data?.items.map(item => ({ id: item.id, name: item.name })) : undefined}
            onApply={next => { setFilters(next); setFiltersOpen(false); restart(); }} />
        <DNSHistorySettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings.data} recorder={stats.data?.recorder}
            onSaved={saved => { void settings.mutate(saved, { revalidate: false }); void stats.mutate(); }}
            onCleared={() => { restart(); void stats.mutate(); }} />

        <PageHeader title={t("title")} className="mb-4" stickyActions
            description={<span className="text-xs">{t("description")}</span>}
            actions={<div className="flex w-full items-center justify-end gap-1 lg:w-auto lg:gap-2">
                <FilterSearch onSearch={value => { setQuery(value); restart(); }} size="sm" className="min-w-0 flex-1 lg:w-72 lg:flex-none" inputClassName="max-sm:h-11 max-sm:text-base" />
                <Button size="sm" className={`relative ${historyToolbarButton}`} aria-label={t("filters.open", { count: filterCount })} onClick={() => setFiltersOpen(true)}>
                    <ListFilter size={16} aria-hidden="true" /><span className="hidden lg:inline">{t("filters.title")}</span>
                    {filterCount > 0 && <Badge variant="primary" pill className="px-1.5 py-0 text-[11px]">{filterCount}</Badge>}
                </Button>
                <HistorySortMenu sortBy={sortBy} sortOrder={sortOrder} onSortByChange={field => { setSortBy(field as SortKey); setPage(1); }} onSortOrderChange={order => { setSortOrder(order); setPage(1); }}
                    sortOptions={(Object.keys(sortFields) as SortKey[]).map(key => ({ value: key, label: t(`column.${sortFields[key]}`) }))} />
                <Button size="sm" className={historyToolbarButton} aria-label={t("refresh")} onClick={refresh} disabled={list.isValidating}>
                    {list.isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}
                </Button>
                <Button size="sm" className={historyToolbarButton} aria-label={t("settings.title")} onClick={() => setSettingsOpen(true)}><Settings2 size={16} /></Button>
            </div>} />

        {enabled === false && <p role="status" className="mb-4 rounded-ui-md border border-ui-warning/40 bg-ui-warning-soft p-3 text-sm text-ui-warning">
            {t("disabledNotice")} <button type="button" className="underline" onClick={() => setSettingsOpen(true)}>{t("disabledAction")}</button>
        </p>}

        <DNSHistoryOverview range={range} onRangeChange={value => { setRange(value); setAnchor(Date.now()); }} stats={stats.data} />

        {list.error && !list.data ? <Loading code={list.error.code} onRetry={() => void list.mutate()}>{list.error.msg ?? String(list.error)}</Loading>
            : !list.data ? <HistoryListSkeleton />
            : <HistoryList label={t("title")} items={items} columns={columns} getKey={item => String(item.id)} onClickItem={setSelected}
                sortBy={sortBy} sortOrder={sortOrder} onSort={sort}
                page={shownPage} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} resetKey={resetKey}
                empty={enabled === false ? t("emptyDisabled") : filterCount || query ? t("emptyFiltered") : t("empty")} />}
    </MainContainer>;
}

/** The outcome, plus FakeIP and cache markers that matter when reading a row. */
function ResultCell({ item }: { item: DNSHistoryRecord }) {
    const { t } = useTranslation("dns");
    return <span className="inline-flex min-w-0 items-center gap-1">
        <Badge variant={outcomeBadge(item.outcome)} className="truncate">{t(`outcome.${item.outcome}`, { defaultValue: item.outcome })}</Badge>
        {item.fakeip.returned && <Badge variant="info" title={item.fakeip.ipv4 || item.fakeip.ipv6}>{t("marker.fakeip")}</Badge>}
        {item.cacheStatus === "hit" && <Database size={13} className="shrink-0 text-ui-muted" role="img" aria-label={t("cache.hit")}><title>{t("cache.hit")}</title></Database>}
    </span>;
}
