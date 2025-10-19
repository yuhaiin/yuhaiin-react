import { create } from '@bufbuild/protobuf';
import { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useProtoSWR } from './common/proto';
import { FlowContainer } from './connections/components';
import { NodeModal } from './node/modal';
import { node } from './pbes/api/node_pb';
import { pointSchema } from './pbes/node/point_pb';

function Index() {
    const [nodeModal, setNodeModal] = useState({ show: false, point: create(pointSchema, {}) });
    const { data: now, error: now_error, isLoading: now_isLoading } = useProtoSWR(node.method.now)

    return <div>

        <NodeModal
            show={nodeModal.show}
            hash={nodeModal.point.hash}
            point={nodeModal.point}
            editable={false}
            onHide={() => setNodeModal({ ...nodeModal, show: false })}
        />

        <FlowContainer
            end_content={
                <>
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
                </>
            }
        />

    </div>
}

export default Index;