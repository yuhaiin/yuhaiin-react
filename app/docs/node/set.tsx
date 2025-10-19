import { create } from "@bufbuild/protobuf";
import { FC, useContext, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import { Node, Nodes, NodesContext } from "../common/nodes";
import { SettingTypeSelect } from "../common/switch";
import { set, set_strategy_typeSchema, setSchema } from "../pbes/node/protocol_pb";
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

        <SettingTypeSelect label="Mode" type={set_strategy_typeSchema} value={value.strategy} onChange={(v) => onChange({ ...value, strategy: v })} />

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
                        {x} - {groups.getGroupByHash(x).node}

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
                    <i className="bi bi-plus-lg" />Add
                </Button>
            </ListGroup.Item>
        </ListGroup>
    </>
}

const SelectModal: FC<{
    show: boolean,
    hash: string,
    nodes: Nodes,
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
                <Button variant="outline-secondary" onClick={() => { onHide() }}>Cancel</Button>
                <Button variant="outline-primary" onClick={() => { onSave() }}>Apply</Button>
            </Modal.Footer>
        </Modal>
    </>
}
