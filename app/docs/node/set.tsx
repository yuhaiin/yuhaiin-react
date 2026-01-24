import { Button } from "@/app/component/v2/button";
import { SettingEnumSelectVertical } from "@/app/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/app/component/v2/modal";
import { create } from "@bufbuild/protobuf";
import { clsx } from 'clsx';
import { FC, useContext, useState } from "react";
import { PlusLg, Trash } from "react-bootstrap-icons";
import { Node, Nodes, NodesContext } from "../common/nodes";
import { set, set_strategy_typeSchema, setSchema } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Set: FC<Props<set>> = ({ value, onChange, editable = true }) => {
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

        <SettingEnumSelectVertical
            label="Mode"
            type={set_strategy_typeSchema}
            value={value.strategy}
            disabled={!editable}
            onChange={(v) => onChange({ ...value, strategy: v })}
        />

        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <h6 className="fw-bold mb-0 opacity-75">Nodes</h6>
                <small className="text-muted">{value.nodes.length} entries</small>
            </div>

            <div className="border rounded-3 overflow-hidden mb-3 bg-body-tertiary">
                {value.nodes.map((x, i) => (
                    <div key={i}
                        className={clsx("p-3 border-bottom d-flex align-items-center justify-content-between", editable && "cursor-pointer hover-bg-light")}
                        style={{ lastChild: { borderBottom: 0 } } as any}
                        onClick={() => {
                            if (!editable) return
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
                        <div className="text-truncate me-3">
                            <span className="fw-medium">{groups.getGroupByHash(x).node}</span>
                            <br />
                            <small className="text-muted opacity-50 font-monospace" style={{ fontSize: '0.7rem' }}>{x}</small>
                        </div>

                        {editable && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const nodes = [...value.nodes]
                                    nodes.splice(i, 1)
                                    onChange(create(setSchema, { nodes }))
                                }}
                            >
                                <Trash />
                            </Button>
                        )}
                    </div>
                ))}

                {value.nodes.length === 0 && (
                    <div className="p-4 text-center text-muted fst-italic small">No nodes identified yet.</div>
                )}
            </div>

            {editable && (
                <div className="d-flex justify-content-end px-1">
                    <Button
                        variant="outline-primary"
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
                        <PlusLg className="me-1" /> Add Node
                    </Button>
                </div>
            )}
        </div>
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
    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent style={{ maxWidth: '600px' }}>
                <ModalHeader closeButton>
                    <ModalTitle className="fw-bold">Select Node</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div className="p-1">
                        <Node
                            data={nodes}
                            hash={hash}
                            onChangeNode={(x) => { onChange(x) }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter className="gap-2">
                    <Button variant="outline-secondary" onClick={() => { onHide() }}>Cancel</Button>
                    <Button variant="outline-secondary" onClick={() => { onSave() }}>Apply</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
