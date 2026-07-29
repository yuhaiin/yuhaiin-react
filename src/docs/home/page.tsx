"use client";

import { getConnections, getTelemetry, getTraffic } from "@/api/connections";
import { listInbounds } from "@/api/inbounds";
import { selectedNodes } from "@/api/nodes";
import { Button } from "@/component/v2/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import type { TrafficSeries } from "@/contract/connection";
import clsx from "clsx";
import { Activity, ArrowDownToLine, ArrowRight, ArrowUpFromLine, BarChart3, Check, ChevronRight, Globe2, Link2, Network, Plus, Settings2, ShieldCheck } from "lucide-react";
import { FC, type ReactNode, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { formatBytes } from "../connections/components";
import { useFlow } from "../connections/components";
import dynamic from "../../component/AsyncComponent";
import TelemetryOverview from "./TelemetryOverview";
import NetworkTopology from "./NetworkTopology";
import "./home.css";

const trafficRanges: Array<{ key: string; label: string; interval?: TrafficSeries["interval"]; durationMs?: number }> = [
    { key: "live", label: "Live" },
    { key: "24h", label: "24h", interval: "hour", durationMs: 24 * 60 * 60 * 1000 },
    { key: "7d", label: "7d", interval: "day", durationMs: 7 * 24 * 60 * 60 * 1000 },
    { key: "30d", label: "30d", interval: "day", durationMs: 30 * 24 * 60 * 60 * 1000 },
];

type SetupMode = "node" | "inbound";

const StatusDot = ({ tone = "success" }: { tone?: "success" | "warning" | "muted" }) => (
    <span className={clsx("friendly-status-dot", `friendly-status-dot-${tone}`)} aria-hidden="true" />
);

const FriendlyIcon = ({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "mint" | "lilac" | "amber" }) => (
    <span className={clsx("friendly-icon", `friendly-icon-${tone}`)}>{children}</span>
);

const TrafficLegend = () => (
    <div className="friendly-traffic-legend">
        <span><i className="friendly-legend-dot friendly-legend-download" /> Download</span>
        <span><i className="friendly-legend-dot friendly-legend-upload" /> Upload</span>
    </div>
);

const LiveMiniChart: FC<{ samples: Array<{ upload: number; download: number }> }> = ({ samples }) => {
    const values = samples.slice(-8).flatMap((item) => [item.download, item.upload]);
    const max = Math.max(1, ...values);
    if (values.length === 0) {
        return <div className="friendly-mini-chart friendly-mini-chart-empty">Waiting for data</div>;
    }
    return (
        <div className="friendly-mini-chart" aria-label="Live traffic preview">
            {samples.slice(-8).map((item, index) => {
                const height = Math.max(10, Math.round((Math.max(item.download, item.upload) / max) * 38));
                return <i key={`${index}-${item.download}-${item.upload}`} style={{ height: `${height}px` }} />;
            })}
        </div>
    );
};

const SetupDialog: FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
    const [mode, setMode] = useState<SetupMode>("node");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!open) {
            setMode("node");
            setStarted(false);
        }
    }, [open]);

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="friendly-dialog">
                <ModalHeader className="friendly-dialog-header">
                    <div>
                        <ModalTitle>{started ? "Let’s get you connected" : "Add a connection"}</ModalTitle>
                        <p>{started ? "We’ll guide you through the details next." : "Choose what you want to connect first."}</p>
                    </div>
                </ModalHeader>
                <ModalBody className="friendly-dialog-body">
                    {started ? (
                        <div className="friendly-setup-started">
                            <FriendlyIcon tone="mint"><Check size={22} /></FriendlyIcon>
                            <div>
                                <strong>{mode === "node" ? "Outbound connection" : "Entry point"} selected</strong>
                            <p>The next screen starts with a friendly template, then keeps advanced settings in the background while you finish the basics.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="friendly-setup-options">
                            <button type="button" className={clsx("friendly-setup-option", mode === "node" && "is-selected")} onClick={() => setMode("node")}>
                                <FriendlyIcon tone="blue"><Globe2 size={20} /></FriendlyIcon>
                                <span><strong>Connect to a network</strong><small>Add an outbound node or service.</small></span>
                                <ChevronRight size={18} />
                            </button>
                            <button type="button" className={clsx("friendly-setup-option", mode === "inbound" && "is-selected")} onClick={() => setMode("inbound")}>
                                <FriendlyIcon tone="lilac"><Link2 size={20} /></FriendlyIcon>
                                <span><strong>Connect a device</strong><small>Add an inbound entry point.</small></span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="friendly-dialog-footer">
                    <Button variant="outline-secondary" onClick={() => onOpenChange(false)}>{started ? "Close" : "Not now"}</Button>
                    <Button onClick={() => {
                        if (!started) {
                            setStarted(true);
                            return;
                        }
                        onOpenChange(false);
                        window.location.hash = mode === "node" ? "/docs/group/" : "/docs/inbound";
                    }}>
                        {started ? "Open guided editor" : "Start setup"}
                        <ArrowRight size={16} className="ml-1" />
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function HomePage() {
    const [setupOpen, setSetupOpen] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [selectedRange, setSelectedRange] = useState("live");
    const range = useMemo(() => trafficRanges.find(item => item.key === selectedRange) ?? trafficRanges[0], [selectedRange]);
    const isLiveTraffic = range.key === "live";
    const telemetryRange = isLiveTraffic ? trafficRanges[1] : range;
    const { data: now } = useSWR("/api/v2/nodes/selected", selectedNodes, { refreshInterval: 5000, revalidateOnFocus: false });
    const { data: inboundData } = useSWR("/api/v2/inbounds", () => listInbounds({ page: 1, pageSize: 100 }), { refreshInterval: 10000, revalidateOnFocus: false });
    const { data: activeConnections } = useSWR("/api/v2/connections", getConnections, { refreshInterval: 5000, revalidateOnFocus: false });
    const flow = useFlow({ refreshInterval: 2000 });
    const { data: trafficHistory, error: trafficHistoryError } = useSWR(
        isLiveTraffic ? null : ["/api/v2/connections/traffic", range.key],
        () => getTraffic(range.interval!, new Date(Date.now() - range.durationMs!), new Date()),
        { refreshInterval: 30000, revalidateOnFocus: false },
    );
    const { data: telemetry, error: telemetryError } = useSWR(
        ["/api/v2/connections/telemetry", telemetryRange.key],
        () => getTelemetry(new Date(Date.now() - telemetryRange.durationMs!), new Date()),
        { refreshInterval: 30000, revalidateOnFocus: false },
    );
    const [liveSamples, setLiveSamples] = useState<Array<{ label: string; upload: number; download: number }>>([]);
    useEffect(() => {
        if (!isLiveTraffic) return;
        const sample = () => {
            if (!flow.data) return;
            setLiveSamples((previous) => [...previous, {
                label: new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
                upload: flow.data.uploadRate,
                download: flow.data.downloadRate,
            }].slice(-24));
        };
        sample();
        const timer = window.setInterval(sample, 2000);
        return () => window.clearInterval(timer);
    }, [flow.data, isLiveTraffic]);

    const download = flow.data?.downloadRate ?? 0;
    const upload = flow.data?.uploadRate ?? 0;
    const totalDownload = flow.data?.download ?? 0;
    const totalUpload = flow.data?.upload ?? 0;
    const activeInbound = inboundData?.items.find(item => item.enabled) ?? inboundData?.items[0];
    const connectionItems = activeConnections?.connections.slice(0, 3) ?? [];
    const isProtected = Boolean(activeInbound?.enabled && (now?.tcp || now?.udp));
    const hasControllerData = Boolean(now || inboundData || activeConnections || flow.data);
    const goTo = (path: string) => { window.location.hash = path; };
    const liveChart = useMemo(() => {
        const rawMax = Math.max(1, ...liveSamples.flatMap(item => [item.download, item.upload]));
        return {
            labels: liveSamples.map(item => item.label),
            download: liveSamples.map(item => item.download),
            upload: liveSamples.map(item => item.upload),
            rawMax,
        };
    }, [liveSamples]);
    const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("mock");

    return (
        <div className="friendly-home">
            <SetupDialog open={setupOpen} onOpenChange={setSetupOpen} />

            <div className="friendly-page-actions friendly-page-actions-compact">
                <Button variant="primary" onClick={() => setSetupOpen(true)}><Plus size={16} className="mr-1" /> Add connection</Button>
                <button type="button" className="friendly-secondary-button" onClick={() => goTo("/docs/group/")}><Settings2 size={16} /> Manage network</button>
            </div>

            <section className="friendly-surface friendly-hero-status">
                <div className="friendly-hero-header">
                    <div className="friendly-hero-message">
                    <FriendlyIcon tone={isProtected ? "mint" : "amber"}><ShieldCheck size={29} /></FriendlyIcon>
                    <div><h2>{isProtected ? "You’re protected" : hasControllerData ? "Network needs setup" : "Connecting to controller"}</h2><p>{isProtected ? "Your current path is available for traffic." : "Choose an inbound and outbound path to enable routing."}</p></div>
                    </div>
                    <div className="friendly-hero-meta">
                        <span className="friendly-hero-status-pill"><StatusDot tone={isProtected ? "success" : "warning"} /> {isProtected ? "Active" : "Not ready"}</span>
                        <span className="friendly-hero-source">{isPreview ? "Preview data" : "Live API data"}</span>
                    </div>
                </div>
                <div className="friendly-hero-traffic">
                    <div className="friendly-traffic-label"><span>Live traffic</span><small>Right now</small></div>
                    <div className="friendly-traffic-live-values">
                        <strong className="friendly-traffic-metric friendly-download"><ArrowDownToLine size={18} /> {flow.data ? formatBytes(download, 1, " ") : "—"}<small>/s</small></strong>
                        <strong className="friendly-traffic-metric friendly-upload"><ArrowUpFromLine size={18} /> {flow.data ? formatBytes(upload, 1, " ") : "—"}<small>/s</small></strong>
                    </div>
                    <div className="friendly-traffic-total-values" aria-label="Total traffic">
                        <span className="friendly-traffic-total-label">Total traffic</span>
                        <span className="friendly-total-download"><ArrowDownToLine size={15} /> {flow.data ? formatBytes(totalDownload) : "—"}</span>
                        <span className="friendly-total-upload"><ArrowUpFromLine size={15} /> {flow.data ? formatBytes(totalUpload) : "—"}</span>
                    </div>
                    <LiveMiniChart samples={liveSamples} />
                </div>
            </section>

            <NetworkTopology
                connections={activeConnections?.connections ?? []}
                dataSource={isPreview ? "Preview data" : "Live API data"}
                isConnected={isProtected}
                onManage={() => goTo("/docs/group/")}
                expanded={mapExpanded}
                onToggleExpanded={() => setMapExpanded(prev => !prev)}
            />

            <section className="friendly-surface friendly-activity">
                <div className="friendly-section-heading">
                    <div><div className="friendly-kicker"><Activity size={14} /> Recent activity</div><p>Your latest connections and events.</p></div>
                    <button type="button" className="friendly-filter-button" onClick={() => goTo("/docs/connections/history")}>All activity <ChevronRight size={15} /></button>
                </div>
                <div className="friendly-activity-list">
                    {connectionItems.length > 0 ? connectionItems.map((connection) => (
                        <div className="friendly-activity-row" key={connection.id}>
                            <FriendlyIcon tone={connection.mode === "direct" ? "mint" : "blue"}><Network size={17} /></FriendlyIcon>
                            <strong>{connection.inboundName || "Active connection"}</strong>
                            <span>{connection.destination || connection.addr || "Unknown destination"} → {connection.nodeName || connection.outbound || "Direct"}</span>
                            <time>Live now</time><StatusDot />
                        </div>
                    )) : activeConnections ? (
                        <div className="friendly-activity-empty"><Network size={17} /><span>No active connections from the current controller.</span><button type="button" onClick={() => goTo("/docs/group/")}>Manage network</button></div>
                    ) : (
                        <div className="friendly-activity-empty"><Activity size={17} /><span>Loading activity from the current controller…</span></div>
                    )}
                    {flow.data && <>
                        <div className="friendly-activity-row">
                            <FriendlyIcon tone="lilac"><ArrowUpFromLine size={17} /></FriendlyIcon>
                            <strong>Uploaded</strong><span>{formatBytes(totalUpload)}</span><time>Controller total</time><StatusDot />
                        </div>
                        <div className="friendly-activity-row">
                            <FriendlyIcon tone="blue"><ArrowDownToLine size={17} /></FriendlyIcon>
                            <strong>Downloaded</strong><span>{formatBytes(totalDownload)}</span><time>Controller total</time><StatusDot />
                        </div>
                    </>}
                </div>
                <button type="button" className="friendly-view-all" onClick={() => goTo("/docs/connections/history")}>View all activity <ArrowRight size={15} /></button>
            </section>

            <section className="friendly-surface friendly-traffic-section">
                <div className="friendly-section-heading">
                    <div><div className="friendly-kicker"><Activity size={14} /> Traffic overview</div><p>{isLiveTraffic ? "Rolling samples from current traffic polling; choose 24h for stored history." : "Stored traffic history from the controller."}</p></div>
                    <div className="friendly-range-picker" aria-label="Traffic range">
                        {trafficRanges.map(item => <button type="button" key={item.key} className={clsx(item.key === range.key && "is-selected")} onClick={() => setSelectedRange(item.key)}>{item.label}</button>)}
                    </div>
                </div>
                <TrafficLegend />
                {isLiveTraffic ? (
                    <TrafficChartDynamic mode="live" data={liveChart} emptyMessage={flow.error || undefined} minHeight={360} />
                ) : <TrafficChartDynamic mode="history" data={trafficHistory} error={trafficHistoryError?.message} minHeight={360} />}
            </section>

            <section className="friendly-surface friendly-breakdown-section">
                <div className="friendly-section-heading">
                    <div>
                        <div className="friendly-kicker"><BarChart3 size={14} /> Traffic breakdown</div>
                        <p>{`Top destinations, addresses, and routes by transferred bytes · ${telemetryRange.label}`}</p>
                    </div>
                    <span className="friendly-breakdown-hint">Sorted by controller totals</span>
                </div>
                <div className="friendly-breakdown-body">
                    <TelemetryOverview data={telemetry} error={telemetryError?.message} />
                </div>
            </section>
        </div>
    );
}

const TrafficChartDynamic = dynamic(() => import("./TrafficChart"), { ssr: false });

export default HomePage;
