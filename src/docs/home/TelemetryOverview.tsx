import type { TelemetryGroup, TelemetrySummary } from "@/contract/connection";
import { Badge } from "@/component/v2/badge";
import { formatBytes } from "./format";

const titles: Record<TelemetryGroup["dimension"], string> = {
    protocol: "Protocol",
    inbound: "Inbound",
    source: "Source address",
    addr: "Address",
    outbound: "Outbound node",
    process: "Process",
    rule: "Rule",
    tag: "Tag",
    destination: "Destination",
};

function numberValue(value: string): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

const TrafficStats = ({ item }: { item: TelemetryGroup["items"][number] }) => {
    const failures = numberValue(item.failures);

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-xs tabular-nums text-ui-muted sm:shrink-0 sm:justify-end">
            <span>↓ {formatBytes(numberValue(item.download), 1, " ")}</span>
            <span>↑ {formatBytes(numberValue(item.upload), 1, " ")}</span>
            {failures > 0 && <Badge variant="danger" pill className="px-1.5 py-1 font-medium">{`${failures} failed`}</Badge>}
        </div>
    );
};

const DimensionPanel = ({ group }: { group: TelemetryGroup }) => (
    <section className="overflow-hidden rounded-ui-lg border border-ui-border/80 bg-ui-surface/20">
        <h3 className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-muted">{titles[group.dimension]}</h3>
        {group.items.length === 0 ? (
            <div className="border-t border-ui-border/70 px-4 py-4 text-sm text-ui-muted">No records in this range.</div>
        ) : (
            <div className="border-t border-ui-border/70 divide-y divide-ui-border/70">
                {group.items.map(item => (
                    <div key={item.value} className="grid min-w-0 grid-cols-1 items-center gap-2 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
                        <div className="min-w-0 truncate text-sm font-medium text-ui-heading" title={item.value}>{item.value}</div>
                        <TrafficStats item={item} />
                    </div>
                ))}
            </div>
        )}
    </section>
);

const ProtocolSummary = ({ group }: { group: TelemetryGroup }) => (
    <section className="overflow-hidden rounded-ui-lg border border-ui-border/80 bg-ui-surface/20">
        <h3 className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ui-muted">{titles.protocol}</h3>
        {group.items.length === 0 ? (
            <div className="border-t border-ui-border/70 px-4 py-4 text-sm text-ui-muted">No records in this range.</div>
        ) : (
            <div className="grid border-t border-ui-border/70 sm:grid-cols-2">
                {group.items.map((item, index) => (
                    <div key={item.value} className={`flex min-w-0 flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${index < group.items.length - 1 ? "sm:border-r sm:border-ui-border/70" : ""}`}>
                        <span className="text-sm font-medium text-ui-heading">{item.value.toUpperCase()}</span>
                        <TrafficStats item={item} />
                    </div>
                ))}
            </div>
        )}
    </section>
);

const RankedPanel = ({ group, title }: { group: TelemetryGroup; title: string }) => {
    const items = [...group.items]
        .map(item => ({ ...item, total: numberValue(item.download) + numberValue(item.upload) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    const max = Math.max(1, ...items.map(item => item.total));

    return (
        <section className="friendly-ranking-panel">
            <div className="friendly-ranking-heading">
                <div>
                    <h3>{title}</h3>
                    <p>Sorted by downloaded + uploaded bytes</p>
                </div>
                <Badge variant="secondary" pill>{`Top ${items.length}`}</Badge>
            </div>
            {items.length === 0 ? (
                <div className="friendly-ranking-empty">No records in this range.</div>
            ) : (
                <div className="friendly-ranking-list">
                    {items.map((item, index) => (
                        <div className="friendly-ranking-row" key={item.value}>
                            <span className="friendly-ranking-index">{index + 1}</span>
                            <div className="friendly-ranking-copy">
                                <div className="friendly-ranking-label" title={item.value}>{item.value || "Unknown address"}</div>
                                <div className="friendly-ranking-track"><span style={{ width: `${Math.max(8, Math.round((item.total / max) * 100))}%` }} /></div>
                            </div>
                            <TrafficStats item={item} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

const TelemetryOverview = ({ data, error }: { data?: TelemetrySummary; error?: string }) => {
    if (error) return <div className="py-6 text-sm text-ui-danger">{error}</div>;
    if (!data) return <div className="py-6 text-sm text-ui-muted">Loading traffic breakdown…</div>;

    const protocol = data.groups.find(group => group.dimension === "protocol");
    const address = data.groups.find(group => group.dimension === "addr");
    const destination = data.groups.find(group => group.dimension === "destination");
    const dimensions = data.groups.filter(group => group.dimension !== "protocol" && group.dimension !== "addr" && group.dimension !== "destination");

    return (
        <div className="space-y-3">
            {protocol && <ProtocolSummary group={protocol} />}
            {(address || destination) && (
                <div className="friendly-ranking-grid">
                    {address && <RankedPanel group={address} title="Top addresses" />}
                    {destination && <RankedPanel group={destination} title="Top destinations" />}
                </div>
            )}
            <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dimensions.filter(group => group !== address).map(group => <DimensionPanel key={group.dimension} group={group} />)}
            </div>
        </div>
    );
};

export default TelemetryOverview;
