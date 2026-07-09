"use client";

import { APIError } from "@/api/client";
import { createNode, deleteNode, latencyNode, listNodes, useNode as selectNode, type NodeLatencyType } from "@/api/nodes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, MainContainer } from "@/component/v2/card";
import { DataList, DataListItem } from "@/component/v2/datalist";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "@/component/v2/dropdown";
import { Textarea } from "@/component/v2/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node, NodeLatencyResponse } from "@/contract/node";
import { normalizeNode } from "@/contract/node";
import {
    LatencyDNSUrlDefault,
    LatencyDNSUrlKey,
    LatencyHTTPUrlDefault,
    LatencyHTTPUrlKey,
    LatencyIPUrlDefault,
    LatencyIPUrlKey,
    LatencyIPv6Default,
    LatencyIPv6Key,
    normalizeLatencyDNSUrl,
    LatencyStunTCPUrlDefault,
    LatencyStunTCPUrlKey,
    LatencyStunUrlDefault,
    LatencyStunUrlKey,
} from "@/common/apiurl";
import { Check, ChevronDown, Gauge, Network, Plus, Power, Upload } from "lucide-react";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useLocalStorage } from "usehooks-ts";
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
import { NodeModal } from "../node/modal";

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

function errorRaw(raw: unknown): string | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw === "string") return raw;
    try {
        return JSON.stringify(raw);
    } catch {
        return String(raw);
    }
}

function chainLabel(node: Node): string {
    return node.chain.map((item) => item.type).join(" -> ");
}

type NodeIPLatency = NonNullable<NodeLatencyResponse["ip"]>;
type NodeSTUNLatency = NonNullable<NodeLatencyResponse["stun"]>;
type NodeLatencyValue = string | NodeIPLatency | NodeSTUNLatency;
type NodeLatencyState = Partial<Record<NodeLatencyType, NodeLatencyValue>>;

const collapsedLatencyTypes = ["tcp", "udp"] as const;
const latencyActions: Array<{ type: NodeLatencyType; label: string }> = [
    { type: "tcp", label: "TCP Ping" },
    { type: "udp", label: "UDP Ping" },
    { type: "stun", label: "STUN Test" },
    { type: "stun_tcp", label: "STUN TCP Test" },
    { type: "ip", label: "IP Check" },
];

function latencyText(value: NodeLatencyValue | undefined): string {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    if (isIPLatency(value)) {
        return [value.ipv4, value.ipv6].filter(Boolean).join(" / ") || "N/A";
    }
    return value.mapping || value.mappedAddress || value.xorMappedAddress || value.filtering || "N/A";
}

type LatencyDetailKey = "ipv4" | "ipv6" | "mapping" | "filtering" | "mappedAddress" | "xorMappedAddress";

function latencyDetail(value: NodeLatencyValue | undefined, key: LatencyDetailKey): string {
    if (!value || typeof value === "string") return "N/A";
    if (isIPLatency(value)) {
        switch (key) {
            case "ipv4":
                return value.ipv4 || "N/A";
            case "ipv6":
                return value.ipv6 || "N/A";
            default:
                return "N/A";
        }
    }
    switch (key) {
        case "mapping":
            return value.mapping || "N/A";
        case "filtering":
            return value.filtering || "N/A";
        case "mappedAddress":
            return value.mappedAddress || "N/A";
        case "xorMappedAddress":
            return value.xorMappedAddress || "N/A";
        default:
            return "N/A";
    }
}

function isIPLatency(value: NodeIPLatency | NodeSTUNLatency): value is NodeIPLatency {
    return "ipv4" in value || "ipv6" in value;
}

function latencyVariant(value: NodeLatencyValue | undefined): "secondary" | "success" | "danger" {
    if (!value) return "secondary";
    if (typeof value === "string" && value.toLowerCase().includes("error")) return "danger";
    return "success";
}

function latencyResultValue(result: NodeLatencyResponse): NodeLatencyValue {
    if (!result.ok) return result.error || "error";
    if (result.latencyMs !== undefined) return `${result.latencyMs}ms`;
    if (result.ip) return result.ip;
    if (result.stun) return result.stun;
    return "ok";
}

const LatencyInfo: FC<{
    label: string;
    value: string;
    loading?: boolean;
}> = ({ label, value, loading }) => (
    <div className="rounded-ui-lg border border-ui-border bg-ui-surface px-3 py-2">
        <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.04em] text-ui-muted">{label}</div>
        <div className="flex min-h-6 items-center text-sm font-semibold text-ui-fg">
            {loading ? <Spinner size="sm" /> : <span className="break-all">{value || "N/A"}</span>}
        </div>
    </div>
);

const NodeItem: FC<{
    item: Node;
    onUse: () => void;
    onLatency: (type: NodeLatencyType) => void;
    onEdit: () => void;
    latency?: NodeLatencyState;
    busy?: Partial<Record<NodeLatencyType, boolean>>;
}> = ({ item, onUse, onLatency, onEdit, latency, busy }) => (
    <AccordionItem value={item.id}>
        <AccordionTrigger>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(220px,0.38fr)_minmax(0,1fr)_auto] md:items-center">
                <div className="flex min-w-0 items-center">
                    <div className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                        <Network size={20} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{item.name || item.id}</span>
                        <span className="truncate font-mono text-xs text-ui-muted">{item.id}</span>
                    </div>
                </div>
                <div className="grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-2">
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Origin</span>
                        <span className="font-medium text-ui-fg">{item.origin}</span>
                    </div>
                    <div className="flex min-w-0 items-baseline gap-1">
                        <span className="shrink-0 text-ui-muted/70">Chain</span>
                        <span className="min-w-0 break-all font-mono font-medium text-ui-fg">{chainLabel(item)}</span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2">
                    {collapsedLatencyTypes.map(type => (
                        <Badge key={type} variant={latencyVariant(latency?.[type])} className="font-mono">
                            {type.toUpperCase()} {latencyText(latency?.[type])}
                        </Badge>
                    ))}
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <DataList>
                    <DataListItem label="Group" value={item.group || "-"} />
                    <DataListItem label="Origin" value={item.origin} />
                    <DataListItem label="Chain" value={chainLabel(item)} />
                    <DataListItem label="Enabled" value={item.enabled ? "true" : "false"} />
                </DataList>
                <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
                    <div className="mb-3 text-sm font-semibold text-ui-muted">Latency Metrics</div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
                        <LatencyInfo label="TCP Latency" value={latencyText(latency?.tcp)} loading={busy?.tcp} />
                        <LatencyInfo label="UDP Latency" value={latencyText(latency?.udp)} loading={busy?.udp} />
                        {(latency?.ip || busy?.ip) && (
                            <>
                                <LatencyInfo label="IPv4" value={latencyDetail(latency?.ip, "ipv4")} loading={busy?.ip} />
                                <LatencyInfo label="IPv6" value={latencyDetail(latency?.ip, "ipv6")} loading={busy?.ip} />
                            </>
                        )}
                        {(latency?.stun || busy?.stun) && (
                            <>
                                <LatencyInfo label="NAT Type" value={latencyDetail(latency?.stun, "mapping")} loading={busy?.stun} />
                                <LatencyInfo label="Filtering" value={latencyDetail(latency?.stun, "filtering")} loading={busy?.stun} />
                                <LatencyInfo label="Mapped Address" value={latencyDetail(latency?.stun, "mappedAddress")} loading={busy?.stun} />
                            </>
                        )}
                        {(latency?.stun_tcp || busy?.stun_tcp) && (
                            <LatencyInfo label="STUN TCP IP" value={latencyDetail(latency?.stun_tcp, "mappedAddress")} loading={busy?.stun_tcp} />
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-ui-border pt-3 lg:col-span-2">
                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button size="sm" variant="outline-secondary">
                                <Gauge size={16} className="mr-2" />
                                Test
                                <ChevronDown size={14} className="ml-1" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="min-w-[180px] max-w-[220px]">
                            {latencyActions.map(action => (
                                <DropdownItem key={action.type} disabled={busy?.[action.type]} onSelect={() => onLatency(action.type)}>
                                    {busy?.[action.type] ? <Spinner size="sm" className="mr-2" /> : <Gauge size={16} className="mr-2" />}
                                    {action.label}
                                </DropdownItem>
                            ))}
                        </DropdownContent>
                    </Dropdown>
                    <Button size="sm" variant="outline-primary" onClick={onUse}>
                        <Power size={16} className="mr-2" />
                        Use
                    </Button>
                    <Button size="sm" onClick={onEdit}>
                        Edit
                    </Button>
                </div>
            </div>
        </AccordionContent>
    </AccordionItem>
);

const NodeImportModal: FC<{
    show: boolean;
    group: string;
    onHide: () => void;
    onSaved: () => void;
}> = ({ show, group, onHide, onSaved }) => {
    const ctx = useContext(GlobalToastContext);
    const [text, setText] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) return;
        setText("");
        setError("");
    }, [show]);

    const parse = (): Node[] => {
        const parsed = JSON.parse(text) as unknown;
        const rawItems = Array.isArray(parsed)
            ? parsed
            : parsed && typeof parsed === "object" && "items" in parsed && Array.isArray((parsed as { items?: unknown }).items)
                ? (parsed as { items: unknown[] }).items
                : [parsed];
        return rawItems.map((item) => {
            const node = item && typeof item === "object" ? item as Partial<Node> : {};
            return normalizeNode({ ...node, group: node.group || group });
        });
    };

    const save = () => {
        let nodes: Node[];
        try {
            nodes = parse();
            if (nodes.length === 0) throw new Error("No nodes found");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
            return;
        }

        setSaving(true);
        Promise.all(nodes.map((node) => createNode(node)))
            .then(() => {
                ctx.Info(`Imported ${nodes.length} node${nodes.length > 1 ? "s" : ""}`);
                onSaved();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                setError(apiErr?.msg ?? (err instanceof Error ? err.message : String(err)));
            })
            .finally(() => setSaving(false));
    };

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent className="max-w-[800px]">
                <ModalHeader closeButton>
                    <ModalTitle>Import JSON</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Textarea
                        className="min-h-[55vh] font-mono text-sm"
                        value={text}
                        onChange={(event) => {
                            setText(event.target.value);
                            setError("");
                        }}
                        placeholder='{"id":"node-id","name":"node-name","group":"manual","origin":"manual","enabled":true,"chain":[{"type":"direct","direct":{}}]}'
                    />
                    {error && <div className="mt-3 rounded-ui-lg border border-ui-danger/40 bg-ui-danger/10 p-3 text-sm text-ui-danger">{error}</div>}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onHide}>Close</Button>
                    <Button onClick={save} disabled={saving || !text.trim()}>
                        {saving ? <Spinner size="sm" className="mr-2" /> : <Check size={16} className="mr-2" />}
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default function Group() {
    const ctx = useContext(GlobalToastContext);
    const [showdata, setShowdata] = useState({ show: false, id: "", new: false });
    const [importOpen, setImportOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [latency, setLatency] = useLocalStorage<Record<string, NodeLatencyState>>("latency-v2-contract", {});
    const [busyLatency, setBusyLatency] = useState<Record<string, Partial<Record<NodeLatencyType, boolean>>>>({});
    const [latencyHTTP] = useLocalStorage(LatencyHTTPUrlKey, LatencyHTTPUrlDefault);
    const [latencyDNS] = useLocalStorage(LatencyDNSUrlKey, LatencyDNSUrlDefault);
    const [latencyIPv6] = useLocalStorage(LatencyIPv6Key, LatencyIPv6Default);
    const [latencyIPUrl] = useLocalStorage(LatencyIPUrlKey, LatencyIPUrlDefault);
    const [latencyStunUrl] = useLocalStorage(LatencyStunUrlKey, LatencyStunUrlDefault);
    const [latencyStunTCPUrl] = useLocalStorage(LatencyStunTCPUrlKey, LatencyStunTCPUrlDefault);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/nodes/all", () => listNodes({ page: 1, pageSize: 10000 }), { revalidateOnFocus: false });

    const apiError = errorOf(error);
    const items = useMemo(() => data?.items ?? [], [data?.items]);
    const groups = useMemo(() => {
        const values = new Set(items.map(item => item.group || "manual"));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [items]);
    const groupItems = useMemo(
        () => selectedGroup ? items.filter(item => (item.group || "manual") === selectedGroup) : [],
        [items, selectedGroup],
    );
    const modalGroups = useMemo(
        () => selectedGroup
            ? [selectedGroup, ...groups.filter(group => group !== selectedGroup)]
            : ["manual", ...groups.filter(group => group !== "manual")],
        [groups, selectedGroup],
    );

    useEffect(() => {
        if (selectedGroup && !groups.includes(selectedGroup)) setSelectedGroup("");
    }, [groups, selectedGroup]);

    if (apiError) return <ErrorDisplay statusCode={apiError.code} title={apiError.msg} raw={errorRaw(apiError.raw)} />;
    if (isLoading || data === undefined) return <Loading />;

    const deleteCurrentNode = () => {
        const id = showdata.id;
        deleteNode(id)
            .then(() => {
                ctx.Info("Removed successful");
                setShowdata((prev) => ({ ...prev, show: false }));
                void mutate();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Remove failed");
            });
    };

    const handleCreate = () => {
        setShowdata({ show: true, id: "", new: true });
    };

    const handleUse = (id: string) => {
        selectNode(id)
            .then(() => ctx.Info(`Use ${id} successful`))
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Use failed");
            });
    };

    const handleLatency = (id: string, type: NodeLatencyType) => {
        setBusyLatency((prev) => ({ ...prev, [id]: { ...prev[id], [type]: true } }));
        latencyNode(id, type, {
            tcpURL: latencyHTTP,
            udpHost: normalizeLatencyDNSUrl(latencyDNS),
            ipURL: latencyIPUrl,
            stunHost: latencyStunUrl,
            stunTCPHost: latencyStunTCPUrl,
            ipv6: latencyIPv6,
        })
            .then((result) => {
                setLatency((prev) => ({ ...prev, [id]: { ...prev[id], [type]: latencyResultValue(result) } }));
                if (!result.ok) ctx.Error(result.error ?? "Latency failed");
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                setLatency((prev) => ({ ...prev, [id]: { ...prev[id], [type]: "error" } }));
                ctx.Error(apiErr?.msg ?? "Latency failed");
            })
            .finally(() => setBusyLatency((prev) => ({ ...prev, [id]: { ...prev[id], [type]: false } })));
    };

    return (
        <MainContainer>
            <NodeModal
                show={showdata.show}
                id={showdata.id}
                isNew={showdata.new}
                editable
                groups={modalGroups}
                onHide={(save) => {
                    if (save) void mutate();
                    setShowdata((prev) => ({ ...prev, show: false }));
                }}
                onDelete={deleteCurrentNode}
            />
            <NodeImportModal
                show={importOpen}
                group={selectedGroup || "manual"}
                onHide={() => setImportOpen(false)}
                onSaved={() => {
                    setImportOpen(false);
                    void mutate();
                }}
            />

            <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
                <Dropdown>
                    <DropdownTrigger asChild>
                        <Button variant="outline-secondary" className="min-w-[128px] justify-between">
                            {selectedGroup || "Group"}
                            <ChevronDown size={16} className="ml-2" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownContent align="end" className="min-w-[180px] max-w-[260px]">
                        <DropdownLabel>Groups</DropdownLabel>
                        {groups.length === 0 ? (
                            <DropdownItem disabled>No groups</DropdownItem>
                        ) : groups.map(group => {
                            const count = items.filter(item => (item.group || "manual") === group).length;
                            return (
                                <DropdownItem key={group} onSelect={() => setSelectedGroup(group)} className="justify-between gap-3">
                                    <span className="truncate">{group}</span>
                                    <span className="text-xs text-ui-muted">{count}</span>
                                </DropdownItem>
                            );
                        })}
                    </DropdownContent>
                </Dropdown>
                <Button onClick={handleCreate}>
                    <Plus className="mr-1" size={16} /> New
                </Button>
                <Button variant="outline-secondary" onClick={() => setImportOpen(true)}>
                    <Upload className="mr-1" size={16} /> Import
                </Button>
            </div>

            {!selectedGroup ? (
                <Card className="mb-4">
                    <CardBody>
                        <div className="py-4 text-center font-semibold text-ui-muted">
                            Please select a group to display nodes.
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <Card className="mb-4">
                    <CardBody>
                        {groupItems.length === 0 ? (
                            <div className="rounded-ui-lg border border-dashed border-ui-border p-6 text-center text-ui-muted">No nodes in this group.</div>
                        ) : (
                            <Accordion type="multiple" className="mb-0 shadow-none">
                                {groupItems.map(item => (
                                    <NodeItem
                                        key={item.id}
                                        item={item}
                                        latency={latency[item.id]}
                                        busy={busyLatency[item.id]}
                                        onUse={() => handleUse(item.id)}
                                        onLatency={(type) => handleLatency(item.id, type)}
                                        onEdit={() => setShowdata({ show: true, id: item.id, new: false })}
                                    />
                                ))}
                            </Accordion>
                        )}
                    </CardBody>
                </Card>
            )}
        </MainContainer>
    );
}
