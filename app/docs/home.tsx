import { create } from '@bufbuild/protobuf';
import { useCallback, useState } from 'react';
import { useProtoSWR } from './common/proto';
import { Flow, FlowContainer } from './connections/components';
import { NodeModal } from './node/modal';
import { node } from './pbes/api/node_pb';
import { pointSchema } from './pbes/node/point_pb';
import TrafficChart from './TrafficChart';

function Index() {
    const [nodeModal, setNodeModal] = useState({ show: false, point: create(pointSchema, {}) });
    const { data: now, error: now_error, isLoading: now_isLoading } = useProtoSWR(node.method.now)
    const [trafficData, setTrafficData] = useState<{ upload: number, download: number, time: string }[]>([]);

    const onFlow = useCallback((lastFlow: Flow) => {
        setTrafficData(prevData => {
            const newTrafficData = [...prevData, {
                upload: lastFlow.upload_rate,
                download: lastFlow.download_rate,
                time: lastFlow.time.toLocaleTimeString(),
            }];
            if (newTrafficData.length > 30) {
                newTrafficData.shift();
            }
            return newTrafficData;
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

        <div style={{ flexShrink: 0 }}>
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

        <div style={{
            flex: 1,
            marginTop: '10px',
            marginBottom: '10px',
            minHeight: 0,
        }}>
            <TrafficChart data={trafficData} />
        </div>
    </div>
}

export default Index;