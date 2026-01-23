"use client";

import { Card, CardBody, MainContainer } from '@/app/component/cardlist';
import { create } from '@bufbuild/protobuf';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import Loading from '../../component/loading';
import { useProtoSWR } from '../common/proto';
import { Flow, FlowContainer } from '../connections/components';
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
            let labels = [...prev.labels, time];
            let uploadArr = [...prev.upload, upload];
            let downloadArr = [...prev.download, download];
            let rawMax = Math.max(prev.rawMax, pointMax);

            if (labels.length > MAX_POINTS) {
                labels.shift();
                if (uploadArr.shift() === rawMax || downloadArr.shift() === rawMax)
                    rawMax = Math.max(...uploadArr, ...downloadArr, 0);
            }

            return { labels, upload: uploadArr, download: downloadArr, rawMax };
        });
    }, []);



    return <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    }}>
        <NodeModal
            show={nodeModal.show}
            hash={nodeModal.point.hash}
            point={nodeModal.point}
            editable={false}
            onHide={() => setNodeModal({ ...nodeModal, show: false })}
        />

        <div style={{ flexShrink: 0, marginBottom: '1rem' }}>
            <FlowContainer
                onFlow={onFlow}
                extra_fields={[
                    {
                        label: "TCP Endpoint",
                        value: now_isLoading ? "loading..." : now_error ? now_error.msg :
                            <a
                                href="#"
                                onClick={() => { setNodeModal({ show: true, point: now.tcp }) }}
                            >
                                {now.tcp.group}/{now.tcp.name}
                            </a>,
                        error: now_error ? now_error.msg : undefined
                    },
                    {
                        label: "UDP Endpoint",
                        value: now_isLoading ? "loading..." : now_error ? now_error.msg :
                            <a
                                href="#"
                                onClick={() => { setNodeModal({ show: true, point: now.udp }) }}
                            >
                                {now.udp.group}/{now.udp.name}
                            </a>,
                        error: now_error ? now_error.msg : undefined
                    }
                ]}
            />
        </div>


        <MainContainer>
            <Card style={{ minHeight: '400px' }}>
                <CardBody>
                    <TrafficChartDynamic data={traffic} minHeight={400} />
                </CardBody>
            </Card>
        </MainContainer>

        <ActiveNodesDynamic showFooter={false} />
    </div>
}

const TrafficChartDynamic = dynamic(() => import('./TrafficChartv2'), { ssr: false, loading: () => <Loading /> });
const ActiveNodesDynamic = dynamic(() => import('../group/activates/page'), { ssr: false, loading: () => <Loading /> });

export default HomePage;