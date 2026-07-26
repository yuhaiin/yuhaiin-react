"use client"

import { activeNodes, closeNode } from "@/api/nodes";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardList, IconBoxRounded, MainContainer } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import Loading, { Error } from "@/component/v2/loading";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node } from "@/contract/node";
import { Activity, Hash, Info, Power, Zap } from "lucide-react";
import { FC, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import { NodeModal } from "../../node/modal";
import { PageHeader } from "@/component/v2/page-header";
import { PageStatStrip } from "@/component/v2/page-patterns";
import { ResourceWorkspace } from "@/component/v2/resource-workspace";

const ActiveNodeItem: FC<{ v: Node, onClose: () => void }> = ({ v, onClose }) => {
    return (
        <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center flex-grow overflow-hidden gap-3 w-full md:w-auto">
                <IconBoxRounded
                    icon={Zap}
                    tone="success"
                    className="flex-shrink-0"
                    style={{ width: "40px", height: "40px", marginRight: "0px", border: "none" }}
                />
                <div className="flex flex-col overflow-hidden min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold truncate text-base">{v.name}</span>
                        <Badge className="bg-ui-primary-soft text-ui-primary border border-ui-primary/25 px-2 py-1" style={{ fontSize: "0.65rem" }}>
                            {v.group}
                        </Badge>
                    </div>
                    <small className="text-ui-muted truncate font-mono opacity-75 text-sm">
                        <Hash className="mr-1 inline" size={12} />{v.id}
                    </small>
                </div>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0 ml-auto md:ml-0">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    title="Close this node connection"
                    className="flex items-center gap-2"
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
        <MainContainer className="product-page page-skin-network page-skin-active">
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

            <PageHeader
                eyebrow="Outbound"
                title="Active connections"
                description="Inspect the outbound instances currently serving traffic and close one if needed."
                icon={Activity}
                actions={<Badge variant="success" className="bg-ui-success-soft text-ui-success border border-ui-success/25 px-3 py-2 rounded-full">{sortedNodes.length} Running</Badge>}
            />
            <PageStatStrip
                stats={[
                    { label: "Running", value: sortedNodes.length, hint: "active outbound paths", icon: Activity, tone: "success" },
                    { label: "Protocols", value: new Set(sortedNodes.map((node) => node.chain[0]?.type)).size, hint: "protocol families", icon: Zap, tone: "primary" },
                    { label: "Closable", value: sortedNodes.length, hint: "sessions you can stop", icon: Power, tone: "violet" },
                    { label: "Health", value: sortedNodes.length ? "Serving" : "Idle", hint: "current runtime state", icon: Activity, tone: "warning" },
                ]}
                className="mb-5"
            />
            <ResourceWorkspace
                icon={Activity}
                eyebrow="Runtime"
                title="What is serving traffic"
                description="This is the live outbound runtime, not the saved node list. Close an instance here when you need it to reconnect cleanly."
                links={[{ label: "Saved nodes", href: "#/docs/group/" }, { label: "Live connections", href: "#/docs/connections/v2" }]}
            >
                <CardList
                    items={sortedNodes}
                    animated={false}
                    renderListItem={(v) => <ActiveNodeItem v={v} onClose={() => setConfirmData({ show: true, id: v.id })} />}
                    onClickItem={(v) => setNodeModal({ show: true, node: v })}
                />
            </ResourceWorkspace>

            {showFooter &&
                <div className="text-center mt-4 opacity-50 pb-5">
                    <small className="text-ui-muted text-sm flex items-center justify-center">
                        <Info className="mr-1" size={16} />
                        Closing a node here will force a reconnection if the rule still requires it.
                    </small>
                </div>
            }
        </MainContainer>
    );
}

export default Activates;
