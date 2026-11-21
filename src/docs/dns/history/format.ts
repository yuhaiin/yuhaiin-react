import type { DNSHistoryFilter, DNSHistoryRecord } from "@/api/dns-history";
import type { HistoryTone } from "@/component/v2/history-list";

/** Every outcome the backend reports; `other_rcode` covers FORMERR, NOTIMP and the like. */
export const outcomes = ["success", "nxdomain", "nodata", "servfail", "refused", "other_rcode", "timeout", "canceled", "rejected", "dropped", "malformed", "write_error", "internal_error"] as const;
export type Outcome = typeof outcomes[number];

/** Delivered answers, delivered error responses and request failures. */
export const answeredOutcomes: Outcome[] = ["success", "nxdomain", "nodata"];
export const failedOutcomes: Outcome[] = outcomes.filter(outcome => !answeredOutcomes.includes(outcome));

export const queryTypes = ["A", "AAAA", "HTTPS", "SVCB", "CNAME", "PTR", "TXT", "MX", "SRV", "NS", "SOA", "CAA", "ANY"] as const;

export const timeRanges = [
    { key: "1h", ms: 60 * 60 * 1000 },
    { key: "24h", ms: 24 * 60 * 60 * 1000 },
    { key: "3d", ms: 3 * 24 * 60 * 60 * 1000 },
    { key: "all", ms: 0 },
] as const;
export type TimeRangeKey = typeof timeRanges[number]["key"];

export function rangeStart(key: TimeRangeKey, now = Date.now()): number | undefined {
    const ms = timeRanges.find(range => range.key === key)?.ms ?? 0;
    return ms ? now - ms : undefined;
}

export function outcomeTone(outcome: string): HistoryTone {
    switch (outcome) {
        case "success": return "success";
        case "nxdomain": case "nodata": return "neutral";
        case "servfail": case "refused": case "other_rcode": case "canceled": return "warning";
        default: return "danger";
    }
}

/** Badge colors follow the outcome tone; neutral answers stay quiet. */
export function outcomeBadge(outcome: string): "success" | "muted" | "warning" | "danger" {
    const tone = outcomeTone(outcome);
    return tone === "neutral" || tone === "info" ? "muted" : tone;
}

export function formatLatency(ns?: number): string {
    if (ns === undefined || ns === null || !Number.isFinite(ns)) return "—";
    if (ns < 1_000_000) return `${Math.max(0, ns / 1000).toFixed(ns < 10_000 ? 1 : 0)} µs`;
    if (ns < 1_000_000_000) return `${(ns / 1_000_000).toFixed(ns < 10_000_000 ? 1 : 0)} ms`;
    return `${(ns / 1_000_000_000).toFixed(2)} s`;
}

export function clientAddress(record: Pick<DNSHistoryRecord, "clientIp" | "clientPort">): string {
    if (!record.clientIp) return "";
    if (!record.clientPort) return record.clientIp;
    return record.clientIp.includes(":") ? `[${record.clientIp}]:${record.clientPort}` : `${record.clientIp}:${record.clientPort}`;
}

/** Process paths are long; the list shows the executable name. */
export function processName(path?: string): string {
    if (!path) return "";
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || path;
}

export type FilterState = Required<Pick<DNSHistoryFilter, "queryType" | "transport" | "sourceType" | "inboundId" | "process" | "resolver" | "server" | "outcome" | "domain">> & {
    fakeipOnly: boolean;
    range: TimeRangeKey;
};

export const emptyFilters: FilterState = { domain: "", queryType: "", transport: "", sourceType: "", inboundId: "", process: "", resolver: "", server: "", outcome: "", fakeipOnly: false, range: "24h" };

/** Filters changed from the defaults, shown as a count on the filter button. */
export function activeFilterCount(filters: FilterState): number {
    return (Object.keys(emptyFilters) as (keyof FilterState)[]).filter(key => filters[key] !== emptyFilters[key]).length;
}

export function toRequestFilter(filters: FilterState, query: string, now = Date.now()): DNSHistoryFilter {
    const { range, ...rest } = filters;
    return { ...rest, query, from: rangeStart(range, now) };
}
