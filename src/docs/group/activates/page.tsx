"use client"

import { FetchProtobuf, useProtoSWR } from '@/common/proto';
import Error from '@/component/Error';
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardList, IconBox, IconBoxRounded, MainContainer } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import Loading from "@/component/v2/loading";
import { GlobalToastContext } from "@/component/v2/toast";
import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Activity, Hash, Info, Power, Zap } from 'lucide-react';
import { FC, useContext, useState } from "react";
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
            <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-3">

                {/* Left Side: Status Icon + Name & Group */}
                <div className="flex items-center flex-grow overflow-hidden gap-3 w-full md:w-auto">
                    <IconBoxRounded
                        icon={Zap}
                        color="#198754"
                        className="flex-shrink-0"
                        style={{ width: '40px', height: '40px', marginRight: '0px', border: "none" }}
                    />

                    <div className="flex flex-col overflow-hidden min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold truncate text-base">{v.name}</span>
                            <Badge className="bg-opacity-10 text-blue-600 border border-blue-600 border-opacity-25 px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                {v.group}
                            </Badge>
                        </div>
                        <small className="text-gray-500 truncate font-mono opacity-75 text-sm">
                            <Hash className="mr-1 inline" size={12} />{v.hash}
                        </small>
                    </div>
                </div>

                {/* Right Side: Action Button */}
                <div className="flex gap-2 items-center flex-shrink-0 ml-auto md:ml-0">
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        title="Close this node connection"
                        className="flex items-center gap-2"
                        style={{ minWidth: '38px' }}
                    >
                        <Power size={16} />
                        <span className="hidden sm:inline ml-1">Terminate</span>
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
                        <code className="text-sm text-gray-500 font-mono">{confirmData.name}</code>
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
                    <div className="flex items-center justify-between w-full">
                        <IconBox icon={Activity} color="#198754" title="Active Nodes" description="Live outbound connection instances" />
                        <Badge variant="success" className="bg-opacity-10 text-green-600 border border-green-600 border-opacity-25 px-3 py-2 rounded-full">
                            {data.nodes.length} Running
                        </Badge>
                    </div>
                }
            />

            {showFooter &&
                <div className="text-center mt-4 opacity-50 pb-5">
                    <small className="text-gray-500 text-sm flex items-center justify-center">
                        <Info className="mr-1" size={16} />
                        Closing a node here will force a reconnection if the rule still requires it.
                    </small>
                </div>
            }
        </MainContainer>
    );
}

export default Activates;