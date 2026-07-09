"use client";

import { selectedNodes } from "@/api/nodes";
import { Card, CardBody, MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { Node } from "@/contract/node";
import dynamic from "../../component/AsyncComponent";
import { Flow, FlowContainer } from "../connections/components";
import Activates from "../group/activates/page";
import { NodeModal } from "../node/modal";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const MAX_POINTS = 120;

function HomePage() {
    const { t } = useTranslation(["home", "common"]);
    const [nodeModal, setNodeModal] = useState<{ show: boolean; node?: Node }>({ show: false });
    const { data: now, error: nowError } = useSWR("/api/v2/nodes/selected", selectedNodes, {
        refreshInterval: 5000,
    });
    const [traffic, setTraffic] = useState<{ labels: string[], upload: number[], download: number[], rawMax: number }>
        ({ labels: [], upload: [], download: [], rawMax: 0 });

    const appendTraffic = useCallback((nextFlow: Flow) => {
        const time = nextFlow.time.toLocaleTimeString();
        const pointMax = Math.max(nextFlow.uploadRate, nextFlow.downloadRate);

        setTraffic(prevState => {
            const labels = [...prevState.labels, time];
            const uploadArr = [...prevState.upload, nextFlow.uploadRate];
            const downloadArr = [...prevState.download, nextFlow.downloadRate];
            let rawMax = Math.max(prevState.rawMax, pointMax);

            if (labels.length > MAX_POINTS) {
                labels.shift();
                if (uploadArr.shift() === rawMax || downloadArr.shift() === rawMax) {
                    rawMax = Math.max(...uploadArr, ...downloadArr, 0);
                }
            }

            return { labels, upload: uploadArr, download: downloadArr, rawMax };
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
                <CardBody className="!p-0">
                    <TrafficChartDynamic data={traffic} minHeight={400} />
                </CardBody>
            </Card>
        </MainContainer>

        <Activates showFooter={false} />
    </div>
}

const TrafficChartDynamic = dynamic(() => import("./TrafficChartv2"), { ssr: false, loading: <Loading /> });

export default HomePage;
