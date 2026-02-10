"use client";

import { Card, CardBody, MainContainer } from '@/component/v2/card';
import { create } from '@bufbuild/protobuf';
import { useCallback, useState } from 'react';
import { useProtoSWR } from '../../common/proto';
import dynamic from '../../component/AsyncComponent';
import Loading from '../../component/v2/loading';
import { Flow, FlowContainer } from '../connections/components';
import Activates from '../group/activates/page';
import { NodeModal } from '../node/modal';
import { node } from '../pbes/api/node_pb';
import { pointSchema } from '../pbes/node/point_pb';

function HomePage() {
    const [nodeModal, setNodeModal] = useState({ show: false, point: create(pointSchema, {}) });
    const { data: now, error: now_error, isLoading: now_isLoading } = useProtoSWR(node.method.now)

    const MAX_POINTS = 120;
    const [traffic, setTraffic] = useState<{ labels: string[], upload: number[], download: number[], rawMax: number }>
        ({ labels: [], upload: [], download: [], rawMax: 0, });

    const onFlow = useCallback((lastFlow: Flow) => {
        const upload = lastFlow.upload_rate;
        const download = lastFlow.download_rate;
        const time = lastFlow.time.toLocaleTimeString();
        const pointMax = Math.max(upload, download);

        setTraffic(prev => {
            const labels = [...prev.labels, time];
            const uploadArr = [...prev.upload, upload];
            const downloadArr = [...prev.download, download];
            let rawMax = Math.max(prev.rawMax, pointMax);

            if (labels.length > MAX_POINTS) {
                labels.shift();
                if (uploadArr.shift() === rawMax || downloadArr.shift() === rawMax)
                    rawMax = Math.max(...uploadArr, ...downloadArr, 0);
            }

            return { labels, upload: uploadArr, download: downloadArr, rawMax };
        });
    }, []);



    return <div className="h-full flex flex-col box-border">
        <NodeModal
            show={nodeModal.show}
            hash={nodeModal.point.hash}
            point={nodeModal.point}
            editable={false}
            onHide={() => setNodeModal({ ...nodeModal, show: false })}
        />

        <div className="shrink-0 mb-4">
            <FlowContainer
                onFlow={onFlow}
                extra_fields={[
                    {
                        label: "TCP Endpoint",
                        value: now_isLoading ? "loading..." : now_error ? now_error.msg : (now?.tcp ?
                            <a
                                href="#"
                                className="text-blue-500 hover:underline"
                                onClick={() => { if (now?.tcp) setNodeModal({ show: true, point: now.tcp }) }}
                            >
                                {now.tcp.group}/{now.tcp.name}
                            </a> : "N/A"),
                        error: now_error ? now_error.msg : undefined
                    },
                    {
                        label: "UDP Endpoint",
                        value: now_isLoading ? "loading..." : now_error ? now_error.msg : (now?.udp ?
                            <a
                                href="#"
                                className="text-blue-500 hover:underline"
                                onClick={() => { if (now?.udp) setNodeModal({ show: true, point: now.udp }) }}
                            >
                                {now.udp.group}/{now.udp.name}
                            </a> : "N/A"),
                        error: now_error ? now_error.msg : undefined
                    }
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

const TrafficChartDynamic = dynamic(() => import('./TrafficChartv2'), { ssr: false, loading: <Loading /> });

export default HomePage;