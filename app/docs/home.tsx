import { create } from '@bufbuild/protobuf';
import { useState } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { useProtoSWR } from './common/proto';
import { useFlow } from './connections/components';
import { NodeModal } from './node/modal';
import { node } from './pbes/node/grpc/node_pb';
import { pointSchema } from './pbes/node/point/point_pb';

function Index() {
    const [nodeModal, setNodeModal] = useState({ show: false, point: create(pointSchema, {}) });

    const { data: lastFlow, error: flow_error, isLoading: flow_isLoading } = useFlow()

    const { data: now, error: now_error, isLoading: now_isLoading } = useProtoSWR(node.method.now)

    return <div>

        <NodeModal
            show={nodeModal.show}
            hash={nodeModal.point.hash}
            point={nodeModal.point}
            editable={false}
            onHide={() => setNodeModal({ ...nodeModal, show: false })}
        />

        <Card className="mb-3">
            <ListGroup variant="flush">

                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">Download</div>
                        <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">{flow_isLoading ? "loading..." : flow_error ? flow_error.msg : lastFlow.download_rate}</div>
                    </div>
                </ListGroup.Item>


                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">Upload</div>
                        <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">{flow_isLoading ? "loading..." : flow_error ? flow_error.msg : lastFlow.upload_rate}</div>
                    </div>
                </ListGroup.Item>


                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">TCP</div>
                        <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">
                            {now_isLoading ? "loading..." : now_error ? now_error.msg :
                                <a
                                    href="#"
                                    onClick={() => { setNodeModal({ show: true, point: now.tcp }) }}
                                >{now.tcp.group}/{now.tcp.name}</a>
                            }
                        </div>
                    </div>
                </ListGroup.Item>


                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">UDP</div>
                        <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">
                            {now_isLoading ? "loading..." : now_error ? now_error.msg :
                                <a
                                    href="#"
                                    onClick={() => { setNodeModal({ show: true, point: now.udp }) }}
                                >{now.udp.group}/{now.udp.name}</a>
                            }
                        </div>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    </div>
}

export default Index;