"use client";

import { getTraffic } from "@/api/connections";
import { selectedNodes } from "@/api/nodes";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { TrafficSeries } from "@/contract/connection";
import type { Node } from "@/contract/node";
import dynamic from "../../component/AsyncComponent";
import { Flow, FlowContainer } from "../connections/components";
import Activates from "../group/activates/page";
import { NodeModal } from "../node/modal";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const trafficRanges: Array<{ key: string; label: string; interval?: TrafficSeries["interval"]; durationMs?: number }> = [
    { key: "live", label: "Live" },
    { key: "24h", label: "24H", interval: "hour", durationMs: 24 * 60 * 60 * 1000 },
    { key: "7d", label: "7D", interval: "day", durationMs: 7 * 24 * 60 * 60 * 1000 },
    { key: "30d", label: "30D", interval: "day", durationMs: 30 * 24 * 60 * 60 * 1000 },
    { key: "12m", label: "12M", interval: "month", durationMs: 365 * 24 * 60 * 60 * 1000 },
];
const MAX_POINTS = 120;

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

    const endpointValue = (node: Node | undefined) => {
        if (nowError) return nowError.msg;
        if (!node) return t("common:state.notAvailable");
        return (
            <a
                href="#"
                className="text-blue-500 hover:underline"
                onClick={(event) => {
                    event.preventDefault();
                    setNodeModal({ show: true, node });
                }}
            >
                {node.group}/{node.name}
            </a>
        );
    };

    return <div className="h-full flex flex-col box-border">
        <NodeModal
            show={nodeModal.show}
            node={nodeModal.node}
            readOnly
            onHide={() => setNodeModal({ show: false })}
        />

        <div className="shrink-0 mb-4">
            <FlowContainer
                onFlow={appendTraffic}
                extra_fields={[
                    {
                        label: t("tcpEndpoint"),
                        value: endpointValue(now?.tcp),
                        error: nowError?.msg,
                    },
                    {
                        label: t("udpEndpoint"),
                        value: endpointValue(now?.udp),
                        error: nowError?.msg,
                    },
                ]}
            />
        </div>

        <MainContainer>
            <Card className="min-h-[400px]">
                <CardHeader className="flex-wrap gap-3">
                    <div>
                        <div className="font-medium text-ui-heading">{isLiveTraffic ? "Live traffic" : "Traffic history"}</div>
                        <div className="mt-0.5 text-xs text-ui-muted">
                            {isLiveTraffic ? "Current download and upload speed" : "Download and upload totals by period"}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1" aria-label="Traffic range">
                        {trafficRanges.map(item => (
                            <Button key={item.key} size="xs" variant={item.key === range.key ? "primary" : "outline-secondary"} onClick={() => setSelectedRange(item.key)}>
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardBody className="!p-0">
                    {isLiveTraffic
                        ? <TrafficChartDynamic data={traffic} minHeight={400} />
                        : <TrafficHistoryChartDynamic data={trafficHistory} error={trafficHistoryError?.msg} minHeight={400} />}
                </CardBody>
            </Card>
        </MainContainer>

        <Activates showFooter={false} />
    </div>
}

const TrafficHistoryChartDynamic = dynamic(() => import("./TrafficHistoryChart"), { ssr: false, loading: <Loading /> });
const TrafficChartDynamic = dynamic(() => import("./TrafficChartv2"), { ssr: false, loading: <Loading /> });

export default HomePage;
