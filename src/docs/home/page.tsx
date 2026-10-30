import { PageHeader } from '@/component/v2/page-header';
import { useMediaQuery } from '@/hooks/use-media-query';

import { getTelemetry, getTraffic } from "@/api/connections";
import { activeNodes, selectedNodes } from "@/api/nodes";
import { Card, CardBody, CardHeader, IconBox, MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { TrafficSeries } from "@/contract/connection";
import type { Node } from "@/contract/node";
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import clsx from "clsx";
import { Activity, ArrowDownToLine, ArrowUpFromLine, Network } from "lucide-react";
import { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import dynamic from "../../component/AsyncComponent";
import { Flow, FlowContainer } from "../connections/components";
import Activates from "../group/activates/page";
import { NodeModal } from "../node/modal";
import TelemetryOverview from "./TelemetryOverview";
import SetupCard from "./SetupCard";
import { appendTrafficSample } from "./traffic";

const trafficRanges: Array<{ key: string; label: string; interval?: TrafficSeries["interval"]; durationMs?: number }> = [
    { key: "live", label: "Live" },
    { key: "24h", label: "24H", interval: "hour", durationMs: 24 * 60 * 60 * 1000 },
    { key: "7d", label: "7D", interval: "day", durationMs: 7 * 24 * 60 * 60 * 1000 },
    { key: "30d", label: "30D", interval: "day", durationMs: 30 * 24 * 60 * 60 * 1000 },
    { key: "12m", label: "12M", interval: "month", durationMs: 365 * 24 * 60 * 60 * 1000 },
];


const EndpointCard: FC<{
    label: string;
    node?: Node;
    error?: string;
    onOpen: (node: Node) => void;
}> = ({ label, node, error, onOpen }) => {
    const { t } = useTranslation(["common"]);
    const unavailable = t("state.notAvailable");

    return (
        <button
            type="button"
            disabled={!node || Boolean(error)}
            onClick={() => node && onOpen(node)}
            className={clsx(
                "group flex min-h-[76px] sm:min-h-[82px] w-full min-w-0 flex-col justify-center rounded-ui-xl border border-ui-border bg-ui-surface p-3 sm:p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus",
                node && !error
                    ? "cursor-pointer hover:border-ui-primary/35 hover:bg-ui-surface-muted/40"
                    : "cursor-default opacity-90"
            )}
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-normal text-ui-muted">{label}</span>
                <Network size={14} className="shrink-0 text-ui-muted/70 transition-colors group-hover:text-ui-primary" />
            </div>
            {error ? (
                <div className="truncate text-sm font-medium text-ui-danger" title={error}>{error}</div>
            ) : node ? (
                <div className="min-w-0 space-y-1">
                    <div className="truncate text-base font-medium text-ui-heading" title={node.name || node.id}>
                        {node.name || node.id}
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                        {node.group && (
                            <span className="shrink-0 rounded-full bg-ui-chip px-2 py-0.5 text-xs font-medium text-ui-chip-fg">
                                {node.group}
                            </span>
                        )}
                        <span className="truncate text-xs text-ui-muted">{node.chain.map(step => step.type).join(" → ")}</span>
                    </div>
                </div>
            ) : (
                <div className="text-sm font-medium text-ui-muted">{unavailable}</div>
            )}
        </button>
    );
};

function HomePage() {
    const mobile = useMediaQuery('(max-width: 639px)');
    const chartHeight = mobile ? 220 : 300;
    const { t: uiT } = useTranslation('ui');

    const { t } = useTranslation(["home", "common"]);
    const { data: active, error: activeError } = useSWR('/api/v2/nodes/active', activeNodes, { revalidateOnFocus: false, refreshInterval: 15000 });
    const [nodeModal, setNodeModal] = useState<{ show: boolean; node?: Node }>({ show: false });
    const { data: now, error: nowError } = useSWR("/api/v2/nodes/selected", selectedNodes, {
        refreshInterval: 5000,
        revalidateOnFocus: false,
    });
    const [traffic, setTraffic] = useState<{ labels: string[], upload: number[], download: number[], rawMax: number }>
        ({ labels: [], upload: [], download: [], rawMax: 0 });
    const [selectedRange, setSelectedRange] = useState("live");
    const range = useMemo(() => trafficRanges.find(item => item.key === selectedRange) ?? trafficRanges[0], [selectedRange]);
    const isLiveTraffic = range.key === "live";
    const { data: trafficHistory, error: trafficHistoryError } = useSWR(isLiveTraffic ? null : ["/api/v2/connections/traffic", range.key], () => {
        const to = new Date();
        return getTraffic(range.interval!, new Date(to.getTime() - range.durationMs!), to);
    }, {
        refreshInterval: 30000,
        revalidateOnFocus: false,
    });
    const telemetryRange = isLiveTraffic ? trafficRanges[1] : range;
    const { data: telemetry, error: telemetryError } = useSWR(["/api/v2/connections/telemetry", telemetryRange.key], () => {
        const to = new Date();
        return getTelemetry(new Date(to.getTime() - telemetryRange.durationMs!), to);
    }, {
        refreshInterval: 30000,
        revalidateOnFocus: false,
    });

    const appendTraffic = useCallback((nextFlow: Flow) => {
        setTraffic(previous => appendTrafficSample(previous, nextFlow));
    }, []);

    return (
        <div className="box-border min-h-full">
            <NodeModal
                show={nodeModal.show}
                node={nodeModal.node}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />

            <PageHeader title={t('nav:home')} className="mb-4" actions={activeError ? <span className="text-sm text-ui-danger">{activeError.msg}</span> : <span className="flex items-center gap-2 text-xs text-ui-muted"><Activity size={15} aria-hidden="true" className="text-ui-success" />{active?.items.length ?? '—'} {uiT('activeNodes')}</span>} />
            <div className="mb-4 grid grid-cols-2 shrink-0 gap-2 sm:gap-3">
                <EndpointCard
                    label={t("tcpEndpoint")}
                    node={now?.tcp}
                    error={nowError?.msg}
                    onOpen={(node) => setNodeModal({ show: true, node })}
                />
                <EndpointCard
                    label={t("udpEndpoint")}
                    node={now?.udp}
                    error={nowError?.msg}
                    onOpen={(node) => setNodeModal({ show: true, node })}
                />
            </div>

            <div className="mb-3"><FlowContainer onFlow={isLiveTraffic ? appendTraffic : undefined} variant="summary" /></div>

            <MainContainer>
                <SetupCard />
                <Card className="min-h-[240px] sm:min-h-[300px]" density="compact">
                    <CardHeader className="flex-col items-stretch gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
                        <div className="flex w-full min-w-0 items-start gap-3 sm:flex-1">
                            <IconBox
                                icon={Activity}
                                tone="neutral"
                                title={isLiveTraffic ? "Live traffic" : "Traffic history"}
                                description={isLiveTraffic ? "Current download and upload speed" : "Download and upload totals by period"}
                            />
                        </div>

                        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                            <ToggleGroup type="single" value={selectedRange} aria-label={uiT("trafficRange")} onValueChange={value => { if (value) setSelectedRange(value); }}>
                                {trafficRanges.map(item => <ToggleItem key={item.key} value={item.key}>{item.key === 'live' && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}{item.label}</ToggleItem>)}
                            </ToggleGroup>
                            <div className="flex items-center justify-end gap-3 text-xs text-ui-muted">
                                <span className="inline-flex items-center gap-1.5">
                                    <ArrowDownToLine size={12} className="text-ui-info" />
                                    {uiT("download")}</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <ArrowUpFromLine size={12} className="text-ui-success" />
                                    {uiT("upload")}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="!p-0">
                        {isLiveTraffic
                            ? <TrafficChartDynamic data={traffic} minHeight={chartHeight} />
                            : <TrafficHistoryChartDynamic data={trafficHistory} error={trafficHistoryError?.msg} minHeight={chartHeight} />}
                    </CardBody>
                </Card>

                <div className="my-5"><Activates showFooter={false} /></div>
                <Card density="compact">
                    <CardHeader className="px-4 py-3.5">
                        <IconBox
                            icon={Activity}
                            tone="neutral"
                            title={uiT("trafficBreakdown")}
                            description={`Top traffic and failures · ${isLiveTraffic ? "24H" : range.label}`}
                        />
                    </CardHeader>
                    <CardBody>
                        <TelemetryOverview data={telemetry} error={telemetryError?.msg} />
                    </CardBody>
                </Card>
            </MainContainer>

        </div>
    );
}

const TrafficHistoryChartDynamic = dynamic(() => import("./TrafficHistoryChart"), { loading: <Loading /> });
const TrafficChartDynamic = dynamic(() => import("./TrafficChartv2"), { loading: <Loading /> });

export default HomePage;
