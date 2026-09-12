"use client"

import { activeNodes, closeNode } from "@/api/nodes";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardRowList, IconBox, IconBoxRounded, MainContainer } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import Loading, { Error } from "@/component/v2/loading";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node } from "@/contract/node";
import { Activity, Hash, Info, Power, Zap } from "lucide-react";
import { FC, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import { NodeModal } from "../../node/modal";

const ActiveNodeItem: FC<{ v: Node, onClose: () => void }> = ({ v, onClose }) => {
    return (
        <div className="grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
                <IconBoxRounded
                    icon={Zap}
                    tone="success"
                    className="flex-shrink-0"
                    style={{ width: "40px", height: "40px", marginRight: "0px", border: "none" }}
                />
                <div className="min-w-0">
                    <div className="mb-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="break-words font-semibold text-ui-heading sm:truncate">{v.name}</span>
                        <Badge className="border border-ui-primary/25 bg-ui-primary-soft px-2 py-1 text-ui-primary" style={{ fontSize: "0.65rem" }}>
                            {v.group}
                        </Badge>
                    </div>
                    <div className="break-all text-sm font-mono text-ui-muted opacity-75 sm:truncate">
                        <Hash className="mr-1 inline" size={12} />{v.id}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:justify-self-end">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    title="Close this node connection"
                    className="flex items-center gap-2 justify-self-end"
                    style={{ minWidth: "38px" }}
                >
                    <Power size={16} />
                    <span className="hidden sm:inline ml-1">Terminate</span>
                </Button>
            </div>
        </div>
    );
};

function Activates({ showFooter = true }: { showFooter?: boolean }) {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/nodes/active", activeNodes, {
        revalidateOnFocus: false,
        // Home embeds this list under live traffic work; refresh less aggressively there.
        refreshInterval: showFooter ? 0 : 15000,
    });
    const [confirmData, setConfirmData] = useState({ show: false, id: "" });
    const [nodeModal, setNodeModal] = useState<{ show: boolean; node?: Node }>({ show: false });

    const sortedNodes = useMemo(() => {
        return [...(data?.items ?? [])].sort((a, b) => a.id.localeCompare(b.id));
    }, [data]);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />

    const handleCloseNode = (id: string) => {
        closeNode(id)
            .then(async () => {
                ctx.Info(`Node ${id.substring(0, 8)}... terminated`);
                await mutate();
            })
            .catch((err) => ctx.Error(`Failed to close node: ${err.msg ?? err}`))
            .finally(() => setConfirmData({ show: false, id: "" }));
    };

    return (
        <MainContainer>
            <NodeModal
                show={nodeModal.show}
                node={nodeModal.node}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />
            <ConfirmModal
                show={confirmData.show}
                title={
                    <div className="py-2">
                        <p className="mb-1">Are you sure you want to <strong>terminate</strong> this active node connection?</p>
                        <code className="text-sm text-ui-muted font-mono">{confirmData.id}</code>
                    </div>
                }
                onHide={() => setConfirmData(prev => ({ ...prev, show: false }))}
                onOk={() => handleCloseNode(confirmData.id)}
            />

            <CardRowList
                layout="list"
                items={sortedNodes}
                animated={false}
                getKey={(v) => v.id}
                renderListItem={(v) => <ActiveNodeItem v={v} onClose={() => setConfirmData({ show: true, id: v.id })} />}
                onClickItem={(v) => setNodeModal({ show: true, node: v })}
                header={
                    <div className="flex w-full items-center justify-between gap-3">
                        <IconBox icon={Activity} tone="success" title="Active Nodes" description="Live outbound connection instances" />
                        <Badge variant="success" className="shrink-0 rounded-full border border-ui-success/25 bg-ui-success-soft px-3 py-2 text-ui-success">
                            {sortedNodes.length} Running
                        </Badge>
                    </div>
                }
            />

            {showFooter &&
                <div className="mt-4 px-3 pb-5 text-center text-xs text-ui-muted">
                    <small className="flex items-center justify-center leading-relaxed">
                        <Info className="mr-1 shrink-0" size={16} />
                        Closing a node here will force a reconnection if the rule still requires it.
                    </small>
                </div>
            }
        </MainContainer>
    );
}

export default Activates;
