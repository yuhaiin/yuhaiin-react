"use client"

import { Badge } from "@/app/component/v2/badge";
import { Button } from "@/app/component/v2/button";
import { CardList, IconBox, IconBoxRounded, MainContainer } from "@/app/component/v2/card";
import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Hash, InfoCircle, LightningChargeFill, Power } from 'react-bootstrap-icons';
import Loading from "../../../component/loading";
import { ConfirmModal } from "../../../component/v2/confirm";
import { GlobalToastContext } from "../../../component/v2/toast";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { NodeModal } from "../../node/modal";
import { node } from "../../pbes/api/node_pb";
import { point, pointSchema } from "../../pbes/node/point_pb";

// --- Component: Individual Active Node Row ---
const ActiveNodeItem: FC<{
    v: point,
    onClose: () => void
}> = ({ v, onClose }) => {
    return (
        <>
            <div className="d-flex w-100 flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">

                {/* Left Side: Status Icon + Name & Group */}
                <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3 w-100 w-md-auto">
                    <IconBoxRounded
                        icon={LightningChargeFill}
                        color="#198754"
                        className="flex-shrink-0"
                        style={{ width: '40px', height: '40px', marginRight: '0px', border: "none" }}
                    />

                    <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-truncate fs-6">{v.name}</span>
                            <Badge variant="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                {v.group}
                            </Badge>
                        </div>
                        <small className="text-muted text-truncate font-monospace opacity-75">
                            <Hash className="me-1" />{v.hash}
                        </small>
                    </div>
                </div>

                {/* Right Side: Action Button */}
                <div className="d-flex gap-2 align-items-center flex-shrink-0 ms-auto ms-md-0">
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        title="Close this node connection"
                        className="d-flex align-items-center gap-2"
                        style={{ minWidth: '38px' }}
                    >
                        <Power />
                        <span className="d-none d-sm-inline ms-1">Terminate</span>
                    </Button>
                </div>
            </div >
        </>
    );
};

function Activates({ showFooter = true }: { showFooter?: boolean }) {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(node.method.activates);

    const [modalHash, setModalHash] = useState({ hash: "", show: false, point: create(pointSchema, {}) });
    const [confirmData, setConfirmData] = useState({ show: false, name: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data == undefined) return <Loading />

    const handleCloseNode = (hash: string) => {
        FetchProtobuf(node.method.close, create(StringValueSchema, { value: hash }))
            .then(async ({ error }) => {
                if (error !== undefined) {
                    ctx.Error(`Failed to close node: ${error.msg}`);
                } else {
                    ctx.Info(`Node ${hash.substring(0, 8)}... terminated`);
                    await mutate();
                }
                setConfirmData({ show: false, name: "" });
            });
    };

    return (
        <MainContainer>
            {/* Confirmation for Closing Node */}
            <ConfirmModal
                show={confirmData.show}
                title={
                    <div className="py-2">
                        <p className="mb-1">Are you sure you want to <strong>terminate</strong> this active node connection?</p>
                        <code className="small text-muted">{confirmData.name}</code>
                    </div>
                }
                onHide={() => setConfirmData(prev => { return { ...prev, show: false } })}
                onOk={() => handleCloseNode(confirmData.name)}
            />

            {/* Node Detail Modal */}
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                point={modalHash.point}
                editable={false}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />

            <CardList
                items={data.nodes
                    .sort((a, b) => a.hash.localeCompare(b.hash))
                }
                renderListItem={(v) => <ActiveNodeItem v={v} onClose={() => setConfirmData({ show: true, name: v.hash })} />}
                onClickItem={(v) => setModalHash({ hash: v.hash, show: true, point: v })}
                header={
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <IconBox icon={LightningChargeFill} color="success" title="Active Nodes" description="Live outbound connection instances" />
                        <Badge variant="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">
                            {data.nodes.length} Running
                        </Badge>
                    </div>
                }
            />

            {showFooter &&
                <div className="text-center mt-4 opacity-50 pb-5">
                    <small className="text-muted">
                        <InfoCircle className="me-1" />
                        Closing a node here will force a reconnection if the rule still requires it.
                    </small>
                </div>
            }
        </MainContainer>
    );
}

export default Activates;