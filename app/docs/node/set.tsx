import { create } from "@bufbuild/protobuf";
import { FC, useContext, useEffect, useState } from "react";
import { Button, FloatingLabel, ListGroup, Modal } from "react-bootstrap";
import { NodesContext } from "../common/nodes";
import { FormSelect } from "../common/switch";
import { nodes_response } from "../pbes/node/grpc/node_pb";
import { set, setSchema } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Set: FC<Props<set>> = ({ value, onChange }) => {
    const groups = useContext(NodesContext);
    const [modalData, setModalData] = useState<{ show: boolean, hash: string, onSave: (x: string) => void }>({ show: false, hash: "", onSave: () => { } });

    return <>
        <SelectModal
            show={modalData.show}
            hash={modalData.hash}
            nodes={groups}
            onHide={() => { setModalData(prev => { return { ...prev, show: false } }) }}
            onChange={(x) => { setModalData(prev => { return { ...prev, hash: x } }) }}
            onSave={() => {
                modalData.onSave(modalData.hash);
                setModalData(prev => { return { ...prev, show: false } })
            }}
        />

        <ListGroup variant="flush">
            {
                value.nodes.map((x, i) => {
                    return <ListGroup.Item key={i}
                        action
                        className="align-items-center d-flex justify-content-between"
                        style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                        onClick={() => {
                            setModalData({
                                show: true,
                                hash: x,
                                onSave: (x: string) => {
                                    const nodes = [...value.nodes]
                                    nodes[i] = x
                                    onChange(create(setSchema, { nodes }))
                                }
                            })
                        }}
                    >
                        {x} - {getGroup(x, groups).node}


                        <Button
                            variant="outline-danger"
                            as="span"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                const nodes = [...value.nodes]
                                nodes.splice(i, 1)
                                onChange(create(setSchema, { nodes }))
                            }}
                        >
                            <i className="bi-trash"></i></Button>
                    </ListGroup.Item>
                })
            }


            <ListGroup.Item className="d-sm-flex">
                <Button
                    variant="outline-success"
                    className="flex-grow-1"
                    onClick={() => {
                        setModalData({
                            show: true,
                            hash: "",
                            onSave: (x: string) => {
                                if (value.nodes.includes(x)) return
                                onChange(create(setSchema, { nodes: [...value.nodes, x] }))
                            }
                        })
                    }}
                >
                    <i className="bi bi-plus-lg" />New
                </Button>
            </ListGroup.Item>
        </ListGroup>
    </>
}


const getGroup = (hash: string, data?: nodes_response): { group: string, node: string } => {
    if (data === undefined || hash === "") return { group: "", node: "" }
    for (const group in data.groups) {
        for (const node in data.groups[group].nodesV2) {
            if (data.groups[group].nodesV2[node] === hash) return { group: group, node: node }
        }
    }

    return { group: "", node: "" }
}

const SelectModal: FC<{
    show: boolean,
    hash: string,
    nodes?: nodes_response,
    onHide: () => void,
    onChange: (x: string) => void
    onSave: () => void
}> = ({ show, hash, nodes, onHide, onChange, onSave }) => {
    return <>
        <Modal show={show} onHide={() => { onHide() }} centered>
            <Modal.Body>
                <Node
                    data={nodes}
                    hash={hash}
                    onChangeNode={(x) => { onChange(x) }}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => { onHide() }}>Close</Button>
                <Button variant="outline-primary" onClick={() => { onSave() }}>Save</Button>
            </Modal.Footer>
        </Modal>
    </>
}

const Node = (props: {
    hash: string,
    data?: nodes_response,
    onChangeNode: (x: string) => void
}) => {
    const [group, setGroup] = useState({ data: getGroup(props.hash, props.data) })
    useEffect(() => {
        if (props.hash) setGroup({ data: getGroup(props.hash, props.data) })
    }, [props.hash, props.data]);

    return <>
        <FloatingLabel label="Group" className="mb-2" >
            <FormSelect emptyChoose value={group.data.group}
                onChange={(x) => { setGroup({ data: { group: x, node: "" } }) }}
                values={Object.keys(props.data ? props.data.groups : {}).sort((a, b) => { return a <= b ? -1 : 1 })}
            />
        </FloatingLabel>

        <FloatingLabel label="Node">
            <FormSelect
                emptyChoose
                value={props.hash}
                onChange={(x) => { props.onChangeNode(x) }}
                values={Object.entries(props.data ? props.data.groups[group.data.group]?.nodesV2 ?? {} : {}).sort((a, b) => { return a <= b ? -1 : 1 })}
            />
        </FloatingLabel>
    </>
}
