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
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs tabular-nums text-ui-muted">
            <span>↓ {formatBytes(numberValue(item.download), 1, " ")}</span>
            <span>↑ {formatBytes(numberValue(item.upload), 1, " ")}</span>
            {failures > 0 && <Badge variant="danger" pill className="px-1.5 py-1 font-medium">{failures} failed</Badge>}
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
                    <div key={item.value} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
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
                    <div key={item.value} className={`flex items-center justify-between gap-4 px-4 py-3 ${index < group.items.length - 1 ? "sm:border-r sm:border-ui-border/70" : ""}`}>
                        <span className="text-sm font-medium text-ui-heading">{item.value.toUpperCase()}</span>
                        <TrafficStats item={item} />
                    </div>
                ))}
            </div>
        )}
    </section>
);

const TelemetryOverview = ({ data, error }: { data?: TelemetrySummary; error?: string }) => {
    if (error) return <div className="py-6 text-sm text-ui-danger">{error}</div>;
    if (!data) return <div className="py-6 text-sm text-ui-muted">Loading traffic breakdown…</div>;

    const protocol = data.groups.find(group => group.dimension === "protocol");
    const dimensions = data.groups.filter(group => group.dimension !== "protocol");

    return (
        <div className="space-y-3">
            {protocol && <ProtocolSummary group={protocol} />}
            <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dimensions.map(group => <DimensionPanel key={group.dimension} group={group} />)}
            </div>
        </div>
    );
};

export default TelemetryOverview;
