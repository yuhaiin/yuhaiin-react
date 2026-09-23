"use client";

import { clearResolverCache, getResolverCache } from "@/api/resolvers";
import { APIError } from "@/api/client";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, IconBox } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import { Input } from "@/component/v2/input";
import { Select } from "@/component/v2/select";
import { GlobalToastContext } from "@/component/v2/toast";
import type { DNSCacheEntry, DNSCacheRecord } from "@/contract/resolver";
import { Database, RefreshCw, Search, Trash2 } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

function cacheKey(resolver: string, domain: string) {
    return `${resolver}\u0000${domain}`;
}

function formatTTL(seconds: number) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function recordSearchText(record: DNSCacheRecord) {
    return `${record.section} ${record.type} ${record.value}`.toLowerCase();
}

function matchesSearch(entry: DNSCacheEntry, query: string) {
    if (!query) return true;
    return [entry.resolver, entry.domain, entry.queryType, entry.rcode]
        .join(" ")
        .toLowerCase()
        .includes(query) || entry.records.some((record) => recordSearchText(record).includes(query));
}

type DomainGroup = {
    resolver: string;
    domain: string;
    entries: DNSCacheEntry[];
};

const EMPTY_CACHE_ENTRIES: DNSCacheEntry[] = [];

export function DNSCache() {
    const ctx = useContext(GlobalToastContext);
    const [query, setQuery] = useState("");
    const [selectedResolver, setSelectedResolver] = useState("");
    const [confirm, setConfirm] = useState<{ resolver: string; domain: string } | null>(null);
    const [clearing, setClearing] = useState<string | null>(null);
    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/resolver/cache", getResolverCache, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    });

    const allEntries = data?.items ?? EMPTY_CACHE_ENTRIES;
    const filteredEntries = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return allEntries.filter((entry) => matchesSearch(entry, normalized));
    }, [allEntries, query]);

    const groups = useMemo(() => {
        const grouped = new Map<string, DomainGroup>();
        for (const entry of filteredEntries) {
            const key = cacheKey(entry.resolver, entry.domain);
            const current = grouped.get(key);
            if (current) {
                current.entries.push(entry);
            } else {
                grouped.set(key, { resolver: entry.resolver, domain: entry.domain || ".", entries: [entry] });
            }
        }

        return [...grouped.values()].sort((a, b) => {
            const resolverOrder = a.resolver.localeCompare(b.resolver);
            return resolverOrder || a.domain.localeCompare(b.domain);
        });
    }, [filteredEntries]);

    const resolverGroups = useMemo(() => {
        const grouped = new Map<string, DomainGroup[]>();
        for (const group of groups) {
            const current = grouped.get(group.resolver);
            if (current) current.push(group);
            else grouped.set(group.resolver, [group]);
        }
        return [...grouped.entries()];
    }, [groups]);

    const selectedResolverGroup = resolverGroups.find(([resolver]) => resolver === selectedResolver) ?? resolverGroups[0];
    const activeResolver = selectedResolverGroup?.[0] ?? "";
    const activeDomains = selectedResolverGroup?.[1] ?? [];
    const activeEntryCount = activeDomains.reduce((count, domain) => count + domain.entries.length, 0);

    const handleClear = (resolver: string, domain: string) => {
        const key = cacheKey(resolver, domain);
        setClearing(key);
        clearResolverCache(resolver, domain)
            .then(({ removed }) => {
                ctx.Info(removed > 0 ? `Cleared ${removed} DNS cache entr${removed === 1 ? "y" : "ies"}.` : "No matching DNS cache entries found.");
                void mutate();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Clear DNS cache failed");
            })
            .finally(() => setClearing(null));
    };

    const apiError = errorOf(error);
    if (apiError) return <Loading code={apiError.code}>{apiError.msg}</Loading>;
    if (isLoading || data === undefined) return <Loading />;

    return (
        <>
            <ConfirmModal
                show={confirm !== null}
                title="Clear DNS Cache"
                content={confirm ? <>Clear all cached query types for <span className="font-bold text-ui-primary">{confirm.domain}</span> in resolver <span className="font-bold text-ui-primary">{confirm.resolver}</span>?</> : undefined}
                onOk={() => {
                    if (confirm) handleClear(confirm.resolver, confirm.domain);
                }}
                onHide={() => setConfirm(null)}
            />

            <Card density="compact" className="w-full max-h-[min(75dvh,56rem)] overflow-hidden">
                <CardHeader className="shrink-0">
                    <div className="flex w-full flex-col items-stretch gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <IconBox icon={Database} tone="info" title="DNS Cache" description="Runtime Resolver Cache" />
                        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                            <div className="relative min-w-0 flex-1 xl:w-[320px]">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" aria-hidden="true" />
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search resolver, domain, type..."
                                    aria-label="Search DNS cache"
                                    className="w-full pl-9"
                                />
                            </div>
                            <Button type="button" size="sm" variant="outline-secondary" onClick={() => void mutate()} disabled={isValidating}>
                                <RefreshCw size={15} className={isValidating ? "mr-1 animate-spin" : "mr-1"} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody density="compact" className="flex min-h-0 flex-col overflow-hidden">
                    <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-ui-muted">
                        <span>{allEntries.length} active cache entr{allEntries.length === 1 ? "y" : "ies"}</span>
                        {query.trim() && (
                            <span>
                                {filteredEntries.length} matching entr{filteredEntries.length === 1 ? "y" : "ies"}
                                {resolverGroups.length > 1 && <> across {resolverGroups.length} resolvers</>}
                            </span>
                        )}
                    </div>

                    {allEntries.length === 0 ? (
                        <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">
                            No active DNS cache entries.
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">
                            No DNS cache entries match your search.
                        </div>
                    ) : (
                        <section className="flex min-h-0 flex-1 flex-col rounded-ui-lg border border-ui-border bg-ui-surface-muted/30">
                            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-ui-border px-4 py-3">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    {resolverGroups.length > 1 ? (
                                        <Select
                                            value={activeResolver}
                                            onValueChange={setSelectedResolver}
                                            items={resolverGroups.map(([resolver, domains]) => ({
                                                value: resolver,
                                                label: `${resolver} · ${domains.length} domain${domains.length === 1 ? "" : "s"}`,
                                            }))}
                                            placeholder="Select resolver"
                                            triggerClassName="w-full max-w-[22rem]"
                                        />
                                    ) : (
                                        <>
                                            <span className="min-w-0 truncate text-sm font-semibold text-ui-heading">{activeResolver}</span>
                                            <Badge variant="secondary" pill>{activeDomains.length} domain{activeDomains.length === 1 ? "" : "s"}</Badge>
                                        </>
                                    )}
                                </div>
                                <span className="text-xs text-ui-muted">{activeEntryCount} QTYPE entries</span>
                            </div>
                            <div
                                className="min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                                role="region"
                                aria-label={`DNS cache domains for ${activeResolver}`}
                                tabIndex={0}
                            >
                                <div className="flex flex-col gap-3 p-3">
                                    {activeDomains.map((domain) => <DNSCacheDomain key={cacheKey(domain.resolver, domain.domain)} group={domain} clearing={clearing === cacheKey(domain.resolver, domain.domain)} onClear={() => setConfirm({ resolver: domain.resolver, domain: domain.domain })} />)}
                                </div>
                            </div>
                        </section>
                    )}
                </CardBody>
            </Card>
        </>
    );
}

function DNSCacheDomain({ group, clearing, onClear }: { group: DomainGroup; clearing: boolean; onClear: () => void }) {
    return (
        <div className="overflow-hidden rounded-ui-md border border-ui-border bg-ui-surface">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ui-border/70 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                    <code className="break-all text-sm font-semibold text-ui-heading">{group.domain}</code>
                    <Badge variant="muted" pill>{group.entries.length} QTYPE{group.entries.length === 1 ? "" : "s"}</Badge>
                </div>
                <Button type="button" size="xs" variant="outline-danger" onClick={onClear} disabled={clearing} title={`Clear ${group.domain}`}>
                    {clearing ? <RefreshCw size={14} className="mr-1 animate-spin" /> : <Trash2 size={14} className="mr-1" />}
                    Clear
                </Button>
            </div>
            <div className="flex flex-col divide-y divide-ui-border/70">
                {group.entries
                    .slice()
                    .sort((a, b) => a.queryType.localeCompare(b.queryType))
                    .map((entry) => <DNSCacheEntryRow key={`${entry.queryType}-${entry.rcode}`} entry={entry} />)}
            </div>
        </div>
    );
}

function DNSCacheEntryRow({ entry }: { entry: DNSCacheEntry }) {
    return (
        <details className="group/details">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-3 py-2.5 text-sm hover:bg-ui-surface-muted [&::-webkit-details-marker]:hidden">
                <span className="font-mono font-semibold text-ui-primary">{entry.queryType}</span>
                <Badge variant={entry.rcode === "NOERROR" ? "success" : "warning"} pill>{entry.rcode || "UNKNOWN"}</Badge>
                <span className="ml-auto text-xs text-ui-muted">TTL {formatTTL(entry.expiresIn)}</span>
                <span className="text-ui-muted transition-transform group-open/details:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <div className="border-t border-ui-border/70 bg-ui-surface-muted/30 px-3 py-3">
                {entry.records.length === 0 ? (
                    <span className="text-xs text-ui-muted">No resource records in this response.</span>
                ) : (
                    <div className="flex flex-col gap-2">
                        {entry.records.map((record, index) => <DNSCacheRecordRow key={`${record.section}-${record.type}-${index}`} record={record} />)}
                    </div>
                )}
            </div>
        </details>
    );
}

function DNSCacheRecordRow({ record }: { record: DNSCacheRecord }) {
    return (
        <div className="flex min-w-0 flex-wrap items-start gap-2 rounded-ui-sm border border-ui-border/70 bg-ui-surface px-2.5 py-2 text-xs">
            <Badge variant="secondary">{record.section}</Badge>
            <Badge variant="info">{record.type}</Badge>
            <code className="min-w-0 flex-1 break-all whitespace-pre-wrap text-ui-fg">{record.value}</code>
        </div>
    );
}
