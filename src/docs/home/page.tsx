"use client";

import { getTelemetry, getTraffic } from "@/api/connections";
import { selectedNodes } from "@/api/nodes";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, IconBox, MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { TrafficSeries } from "@/contract/connection";
import type { Node } from "@/contract/node";
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

const trafficRanges: Array<{ key: string; label: string; interval?: TrafficSeries["interval"]; durationMs?: number }> = [
    { key: "live", label: "Live" },
    { key: "24h", label: "24H", interval: "hour", durationMs: 24 * 60 * 60 * 1000 },
    { key: "7d", label: "7D", interval: "day", durationMs: 7 * 24 * 60 * 60 * 1000 },
    { key: "30d", label: "30D", interval: "day", durationMs: 30 * 24 * 60 * 60 * 1000 },
    { key: "12m", label: "12M", interval: "month", durationMs: 365 * 24 * 60 * 60 * 1000 },
];
const MAX_POINTS = 120;

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
                "group flex min-h-[92px] w-full min-w-0 flex-col justify-center rounded-ui-xl border border-ui-border bg-ui-surface p-4 text-left shadow-ui-card transition-colors",
                node && !error
                    ? "cursor-pointer hover:border-ui-primary/35 hover:bg-ui-surface-muted/40"
                    : "cursor-default opacity-90"
            )}
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ui-muted">{label}</span>
                <Network size={14} className="shrink-0 text-ui-muted/70 transition-colors group-hover:text-ui-primary" />
            </div>
            {error ? (
                <div className="truncate text-sm font-medium text-ui-danger" title={error}>{error}</div>
            ) : node ? (
                <div className="min-w-0 space-y-1">
                    <div className="truncate text-sm font-semibold text-ui-heading" title={node.name || node.id}>
                        {node.name || node.id}
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                        {node.group && (
                            <span className="shrink-0 rounded-full bg-ui-chip px-2 py-0.5 text-[11px] font-medium text-ui-chip-fg">
                                {node.group}
                            </span>
                        )}
                        <span className="truncate font-mono text-[11px] text-ui-muted" title={node.id}>{node.id}</span>
                    </div>
                </div>
            ) : (
                <div className="text-sm font-medium text-ui-muted">{unavailable}</div>
            )}
        </button>
    );
};

function HomePage() {
    const { t } = useTranslation(["home", "common"]);
    const [nodeModal, setNodeModal] = useState<{ show: boolean; node?: Node }>({ show: false });
    const { data: now, error: nowError } = useSWR("/api/v2/nodes/selected", selectedNodes, {
        refreshInterval: 5000,
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
        const time = nextFlow.time.toLocaleTimeString();
        const pointMax = Math.max(nextFlow.uploadRate, nextFlow.downloadRate);

        setTraffic(prevState => {
            const labels = [...prevState.labels, time];
            const upload = [...prevState.upload, nextFlow.uploadRate];
            const download = [...prevState.download, nextFlow.downloadRate];
            let rawMax = Math.max(prevState.rawMax, pointMax);

            if (labels.length > MAX_POINTS) {
                labels.shift();
                if (upload.shift() === rawMax || download.shift() === rawMax) rawMax = Math.max(...upload, ...download, 0);
            }

            return { labels, upload, download, rawMax };
        });
    }, []);

    return (
        <div className="box-border flex h-full flex-col">
            <NodeModal
                show={nodeModal.show}
                node={nodeModal.node}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />

            <div className="mb-3 shrink-0">
                <FlowContainer onFlow={appendTraffic} />
            </div>

            <div className="mb-4 grid shrink-0 gap-3 sm:grid-cols-2">
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

            <MainContainer>
                <Card className="min-h-[400px]" density="compact">
                    <CardHeader className="gap-3 px-4 py-3.5">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                            <IconBox
                                icon={Activity}
                                tone="primary"
                                title={isLiveTraffic ? "Live traffic" : "Traffic history"}
                                description={isLiveTraffic ? "Current download and upload speed" : "Download and upload totals by period"}
                            />
                        </div>

                        <div className="flex flex-col items-stretch gap-2 sm:items-end">
                            <div
                                className="inline-flex flex-wrap items-center rounded-full border border-ui-border bg-ui-surface-muted/50 p-1"
                                aria-label="Traffic range"
                            >
                                {trafficRanges.map(item => {
                                    const active = item.key === range.key;
                                    return (
                                        <Button
                                            key={item.key}
                                            size="xs"
                                            variant={active ? "primary" : "outline-secondary"}
                                            className={clsx(
                                                "!rounded-full border-transparent shadow-none",
                                                !active && "!bg-transparent !text-ui-muted hover:!bg-ui-hover hover:!text-ui-fg"
                                            )}
                                            onClick={() => setSelectedRange(item.key)}
                                        >
                                            {item.key === "live" && (
                                                <span className={clsx(
                                                    "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                                                    active ? "bg-white animate-pulse" : "bg-ui-muted"
                                                )} />
                                            )}
                                            {item.label}
                                        </Button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-end gap-3 text-[11px] text-ui-muted">
                                <span className="inline-flex items-center gap-1.5">
                                    <ArrowDownToLine size={12} className="text-sky-500" />
                                    Download
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <ArrowUpFromLine size={12} className="text-emerald-500" />
                                    Upload
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="!p-0">
                        {isLiveTraffic
                            ? <TrafficChartDynamic data={traffic} minHeight={400} />
                            : <TrafficHistoryChartDynamic data={trafficHistory} error={trafficHistoryError?.msg} minHeight={400} />}
                    </CardBody>
                </Card>

                <Card density="compact">
                    <CardHeader className="px-4 py-3.5">
                        <IconBox
                            icon={Activity}
                            tone="violet"
                            title="Traffic breakdown"
                            description={`Top traffic and failures · ${isLiveTraffic ? "24H" : range.label}`}
                        />
                    </CardHeader>
                    <CardBody className="pt-4" density="compact">
                        <TelemetryOverview data={telemetry} error={telemetryError?.msg} />
                    </CardBody>
                </Card>
            </MainContainer>

            <Activates showFooter={false} />
        </div>
    );
}

const TrafficHistoryChartDynamic = dynamic(() => import("./TrafficHistoryChart"), { ssr: false, loading: <Loading /> });
const TrafficChartDynamic = dynamic(() => import("./TrafficChartv2"), { ssr: false, loading: <Loading /> });

export default HomePage;
