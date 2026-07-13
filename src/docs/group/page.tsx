"use client";

import { APIError } from "@/api/client";
import { createNode, deleteNode, latencyNode, listNodes, useNode as selectNode, type NodeLatencyType } from "@/api/nodes";
import {
    LatencyDNSUrlDefault,
    LatencyDNSUrlKey,
    LatencyHTTPUrlDefault,
    LatencyHTTPUrlKey,
    LatencyIPUrlDefault,
    LatencyIPUrlKey,
    LatencyIPv6Default,
    LatencyIPv6Key,
    LatencyStunTCPUrlDefault,
    LatencyStunTCPUrlKey,
    LatencyStunUrlDefault,
    LatencyStunUrlKey,
    normalizeLatencyDNSUrl,
} from "@/common/apiurl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, IconBox, MainContainer } from "@/component/v2/card";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Input, Textarea } from "@/component/v2/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node, NodeLatencyResponse } from "@/contract/node";
import { normalizeNode } from "@/contract/node";
import clsx from "clsx";
import { Check, ChevronDown, Gauge, Layers, Network, Plus, Power, Search, Upload } from "lucide-react";
import { FC, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

function latencyMilliseconds(value: NodeLatencyValue | undefined): number | undefined {
    if (typeof value !== "string") return undefined;
    const match = /^\s*(\d+(?:\.\d+)?)\s*ms\s*$/i.exec(value);
    return match ? Number(match[1]) : undefined;
}

function latencyVariant(value: NodeLatencyValue | undefined): "secondary" | "success" | "warning" | "danger" {
    if (!value) return "secondary";
    if (typeof value === "string") {
        if (value.trim().toLowerCase() === "n/a") return "secondary";
        if (value.toLowerCase().includes("error")) return "danger";
    }
    const milliseconds = latencyMilliseconds(value);
    if (milliseconds === undefined) return "success";
    if (milliseconds < 200) return "success";
    if (milliseconds <= 1000) return "warning";
    return "danger";
}

function latencyTextClass(value: NodeLatencyValue | undefined): string {
    if (!value || typeof value !== "string" || value.trim().toLowerCase() === "n/a") return "text-ui-muted";
    if (value.toLowerCase().includes("error")) return "text-ui-danger";
    if (latencyMilliseconds(value) === undefined) return "text-ui-fg";
    return {
        success: "text-ui-success",
        warning: "text-ui-warning",
        danger: "text-ui-danger",
        secondary: "text-ui-muted",
    }[latencyVariant(value)];
}

function latencyResultValue(result: NodeLatencyResponse): NodeLatencyValue {
    if (!result.ok) return result.error || "error";
    if (result.latencyMs !== undefined) return `${result.latencyMs}ms`;
    if (result.ip) return result.ip;
    if (result.stun) return result.stun;
    return "ok";
}

const NodeLatencyBadge: FC<{ type: typeof collapsedLatencyTypes[number]; value: NodeLatencyValue | undefined; loading?: boolean }> = ({ type, value, loading }) => {
    if (!value && !loading) return null;
    return (
        <Badge variant={loading ? "secondary" : latencyVariant(value)} pill className="gap-1 px-2 py-0.5 font-medium">
            <span className="text-[0.62rem] font-semibold uppercase tracking-wide opacity-70">{type}</span>
            {loading ? <Spinner size="sm" /> : <span className="font-mono text-[0.72rem]">{latencyText(value)}</span>}
        </Badge>
    );
};

function isEmptyLatency(value: NodeLatencyValue | undefined): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return !normalized || normalized === "n/a" || normalized === "該当なし";
    }
    return false;
}

const ResultChip: FC<{ label: string; value: NodeLatencyValue | undefined; loading?: boolean }> = ({ label, value, loading }) => {
    if (!loading && isEmptyLatency(value)) return null;
    return (
        <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-ui-border/80 bg-ui-bg px-3 py-1.5">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ui-muted">{label}</span>
            {loading
                ? <Spinner size="sm" />
                : <span className={clsx("truncate text-sm font-semibold font-mono", latencyTextClass(value))}>{latencyText(value)}</span>}
        </div>
    );
};

const ResultRow: FC<{ label: string; value: NodeLatencyValue | undefined; loading?: boolean }> = ({ label, value, loading }) => {
    if (!loading && isEmptyLatency(value)) return null;
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-ui-md border border-ui-border/70 bg-ui-bg/80 px-3 py-2">
            <span className="mt-0.5 w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-ui-muted">{label}</span>
            {loading
                ? <Spinner size="sm" className="mt-0.5" />
                : (
                    <span className={clsx("min-w-0 break-all text-sm font-medium font-mono leading-snug", latencyTextClass(value))}>
                        {latencyText(value)}
                    </span>
                )}
        </div>
    );
};

const ResultGroup: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="min-w-0 space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ui-muted">{title}</div>
        <div className="space-y-2">{children}</div>
    </div>
);

const CHIP_GROUP_LIMIT = 6;

const GroupPicker: FC<{
    groups: string[];
    counts: Map<string, number>;
    value: string;
    onChange: (group: string) => void;
}> = ({ groups, counts, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if (!open) setFilter("");
    }, [open]);

    if (groups.length <= CHIP_GROUP_LIMIT) {
        return (
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {groups.map((group) => {
                    const active = group === value;
                    const count = counts.get(group) ?? 0;
                    return (
                        <button
                            key={group}
                            type="button"
                            onClick={() => onChange(group)}
                            className={clsx(
                                "inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                                active
                                    ? "border-ui-primary bg-ui-primary-soft text-ui-primary shadow-inner-subtle"
                                    : "border-ui-border bg-ui-surface text-ui-muted hover:border-ui-primary/30 hover:bg-ui-hover hover:text-ui-fg"
                            )}
                        >
                            <span className="truncate">{group}</span>
                            <span className={clsx(
                                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                                active ? "bg-ui-primary/15 text-ui-primary" : "bg-ui-chip text-ui-chip-fg"
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    }

    const filtered = filter.trim()
        ? groups.filter((group) => group.toLowerCase().includes(filter.trim().toLowerCase()))
        : groups;
    const selectedCount = counts.get(value) ?? 0;

    return (
        <Dropdown open={open} onOpenChange={setOpen}>
            <DropdownTrigger asChild>
                <Button
                    type="button"
                    variant="outline-secondary"
                    className="h-9 min-w-0 max-w-full justify-between gap-2 px-3 text-sm font-medium lg:min-w-[240px] lg:max-w-[360px]"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Layers size={15} className="shrink-0 opacity-70" />
                        <span className="truncate">{value || "Select group"}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                        {value && (
                            <span className="rounded-full bg-ui-chip px-1.5 py-0.5 text-[11px] font-semibold text-ui-chip-fg">
                                {selectedCount}
                            </span>
                        )}
                        <ChevronDown size={14} className="opacity-60" />
                    </span>
                </Button>
            </DropdownTrigger>
            <DropdownContent
                align="start"
                className="min-w-[min(320px,calc(100vw-2rem))] w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(420px,calc(100vw-2rem))]"
            >
                <div
                    className="sticky top-0 z-10 border-b border-ui-border bg-ui-surface px-2 pb-2 pt-1"
                    onKeyDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="relative">
                        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-muted" />
                        <Input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filter groups..."
                            className="h-8 pl-8 text-sm"
                            autoFocus
                        />
                    </div>
                </div>
                {filtered.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-ui-muted">No matching groups</div>
                ) : (
                    filtered.map((group) => {
                        const active = group === value;
                        const count = counts.get(group) ?? 0;
                        return (
                            <DropdownItem
                                key={group}
                                className={clsx("gap-2", active && "bg-ui-primary-soft text-ui-primary")}
                                onSelect={() => onChange(group)}
                            >
                                <span className="min-w-0 flex-1 truncate font-medium">{group}</span>
                                <span className={clsx(
                                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                                    active ? "bg-ui-primary/15 text-ui-primary" : "bg-ui-chip text-ui-chip-fg"
                                )}>
                                    {count}
                                </span>
                                {active && <Check size={14} className="shrink-0 text-ui-primary" />}
                            </DropdownItem>
                        );
                    })
                )}
            </DropdownContent>
        </Dropdown>
    );
};

const NodeItem: FC<{
    item: Node;
    onUse: () => void;
    onLatency: (type: NodeLatencyType) => void;
    onEdit: () => void;
    latency?: NodeLatencyState;
    busy?: Partial<Record<NodeLatencyType, boolean>>;
}> = ({ item, onUse, onLatency, onEdit, latency, busy }) => {
    const chain = chainLabel(item);
    const hasLatency = Boolean(busy?.tcp || busy?.udp || !isEmptyLatency(latency?.tcp) || !isEmptyLatency(latency?.udp));
    const hasIp = Boolean(busy?.ip || latency?.ip);
    const hasStun = Boolean(busy?.stun || busy?.stun_tcp || latency?.stun || latency?.stun_tcp);
    const hasAnyResult = hasLatency || hasIp || hasStun;

    return (
        <AccordionItem
            value={item.id}
            className="!mt-0 !rounded-none !border-0 !border-b !border-ui-border/80 !bg-transparent last:!border-b-0 hover:!z-0 hover:!border-ui-border/80 focus-within:!z-0 focus-within:!border-ui-border/80"
        >
            <AccordionTrigger className="gap-3 px-4 py-3 text-ui-fg hover:!bg-ui-list-hover/80 hover:!text-ui-fg data-[state=open]:!bg-ui-surface-muted/40 data-[state=open]:!text-ui-fg data-[state=open]:!border-ui-border/50">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                        className={clsx(
                            "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                            item.enabled ? "bg-ui-success shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-success)_18%,transparent)]" : "bg-ui-muted/50"
                        )}
                        title={item.enabled ? "Enabled" : "Disabled"}
                    />

                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-[0.95rem] font-semibold text-ui-heading">
                                {item.name || item.id}
                            </span>
                            {item.origin && (
                                <span className="hidden shrink-0 text-[11px] text-ui-muted sm:inline">
                                    · {item.origin}
                                </span>
                            )}
                            {!item.enabled && (
                                <Badge variant="secondary" pill className="shrink-0 px-1.5 py-0 text-[0.62rem]">
                                    Off
                                </Badge>
                            )}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-ui-muted">
                            {chain || "No chain"}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {collapsedLatencyTypes.map((type) => (
                            <NodeLatencyBadge
                                key={type}
                                type={type}
                                value={latency?.[type]}
                                loading={busy?.[type]}
                            />
                        ))}
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="!bg-ui-surface">
                <div className="space-y-3.5 px-1 pb-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ui-muted">
                        <span className="font-mono" title={item.id}>{item.id}</span>
                        {item.group && (
                            <span>
                                <span className="text-ui-muted/70">group</span>{" "}
                                <span className="text-ui-fg">{item.group}</span>
                            </span>
                        )}
                        <span>
                            <span className="text-ui-muted/70">status</span>{" "}
                            <span className={item.enabled ? "text-ui-success" : "text-ui-muted"}>
                                {item.enabled ? "enabled" : "disabled"}
                            </span>
                        </span>
                    </div>

                    {hasAnyResult ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {hasLatency && (
                                <ResultGroup title="Latency">
                                    <div className="flex flex-wrap gap-2">
                                        <ResultChip label="TCP" value={latency?.tcp} loading={busy?.tcp} />
                                        <ResultChip label="UDP" value={latency?.udp} loading={busy?.udp} />
                                    </div>
                                </ResultGroup>
                            )}

                            {hasIp && (
                                <ResultGroup title="IP">
                                    <ResultRow label="IPv4" value={latencyDetail(latency?.ip, "ipv4")} loading={busy?.ip} />
                                    <ResultRow label="IPv6" value={latencyDetail(latency?.ip, "ipv6")} loading={busy?.ip} />
                                </ResultGroup>
                            )}

                            {hasStun && (
                                <ResultGroup title="STUN">
                                    <div className="flex flex-wrap gap-2">
                                        <ResultChip label="NAT" value={latencyDetail(latency?.stun, "mapping")} loading={busy?.stun} />
                                        <ResultChip label="Filter" value={latencyDetail(latency?.stun, "filtering")} loading={busy?.stun} />
                                    </div>
                                    <ResultRow label="Mapped" value={latencyDetail(latency?.stun, "mappedAddress")} loading={busy?.stun} />
                                    <ResultRow label="TCP" value={latencyDetail(latency?.stun_tcp, "mappedAddress")} loading={busy?.stun_tcp} />
                                </ResultGroup>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-ui-muted">No test results yet.</div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ui-border/70 pt-3">
                        <Dropdown>
                            <DropdownTrigger asChild>
                                <Button size="sm" variant="outline-secondary" onClick={(e) => e.stopPropagation()}>
                                    <Gauge size={15} className="mr-1.5" />
                                    Test
                                    <ChevronDown size={14} className="ml-1" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownContent align="end" className="min-w-[180px] max-w-[220px]">
                                {latencyActions.map((action) => (
                                    <DropdownItem key={action.type} disabled={busy?.[action.type]} onSelect={() => onLatency(action.type)}>
                                        {busy?.[action.type] ? <Spinner size="sm" className="mr-2" /> : <Gauge size={16} className="mr-2" />}
                                        {action.label}
                                    </DropdownItem>
                                ))}
                            </DropdownContent>
                        </Dropdown>
                        <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onUse(); }}>
                            <Power size={15} className="mr-1.5" />
                            Use
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                            Edit
                        </Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

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
    const [query, setQuery] = useState("");
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
    const groupCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of items) {
            const group = item.group || "manual";
            counts.set(group, (counts.get(group) ?? 0) + 1);
        }
        return counts;
    }, [items]);
    const groupItems = useMemo(() => {
        if (!selectedGroup) return [];
        const inGroup = items.filter(item => (item.group || "manual") === selectedGroup);
        const q = query.trim().toLowerCase();
        if (!q) return inGroup;
        return inGroup.filter((item) => {
            const haystack = [
                item.name,
                item.id,
                item.origin,
                chainLabel(item),
                ...item.chain.map((step) => step.type),
            ].join(" ").toLowerCase();
            return haystack.includes(q);
        });
    }, [items, query, selectedGroup]);
    const modalGroups = useMemo(
        () => selectedGroup
            ? [selectedGroup, ...groups.filter(group => group !== selectedGroup)]
            : ["manual", ...groups.filter(group => group !== "manual")],
        [groups, selectedGroup],
    );

    useEffect(() => {
        if (selectedGroup && !groups.includes(selectedGroup)) setSelectedGroup("");
    }, [groups, selectedGroup]);

    useEffect(() => {
        if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0]);
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

            <Card className="mb-4 overflow-hidden">
                <CardHeader className="gap-4 px-4 py-4">
                    <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3">
                        <IconBox
                            icon={Layers}
                            tone="primary"
                            title="Outbound"
                            description={`${items.length} nodes across ${groups.length} ${groups.length === 1 ? "group" : "groups"}`}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={handleCreate}>
                                <Plus className="mr-1" size={16} /> New
                            </Button>
                            <Button variant="outline-secondary" onClick={() => setImportOpen(true)}>
                                <Upload className="mr-1" size={16} /> Import
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="space-y-4 pt-4" density="compact">
                    {groups.length === 0 ? (
                        <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ui-primary-soft text-ui-primary">
                                <Network size={22} />
                            </div>
                            <div className="text-sm font-semibold text-ui-heading">No outbound groups yet</div>
                            <div className="mt-1 text-xs text-ui-muted">Create a node or import JSON to get started.</div>
                            <div className="mt-4 flex justify-center gap-2">
                                <Button size="sm" onClick={handleCreate}>
                                    <Plus size={14} className="mr-1" /> New node
                                </Button>
                                <Button size="sm" variant="outline-secondary" onClick={() => setImportOpen(true)}>
                                    <Upload size={14} className="mr-1" /> Import
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <GroupPicker
                                    groups={groups}
                                    counts={groupCounts}
                                    value={selectedGroup}
                                    onChange={setSelectedGroup}
                                />
                                <div className="relative w-full shrink-0 sm:w-[240px] lg:w-[280px]">
                                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search nodes..."
                                        className="h-9 pl-9 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-ui-xl border border-ui-border bg-ui-surface">
                                {groupItems.length === 0 ? (
                                    <div className="px-4 py-12 text-center">
                                        <Search className="mx-auto mb-2 text-ui-muted" size={28} />
                                        <div className="text-sm font-medium text-ui-heading">
                                            {query.trim() ? "No matching nodes" : "No nodes in this group"}
                                        </div>
                                        <div className="mt-1 text-xs text-ui-muted">
                                            {query.trim()
                                                ? "Try another keyword, or clear the search."
                                                : "Add a node to this group to see it here."}
                                        </div>
                                    </div>
                                ) : (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="!mb-0 !rounded-none !border-0 !shadow-none !transition-none hover:!translate-y-0 hover:!border-transparent hover:!shadow-none"
                                    >
                                        {groupItems.map((item) => (
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
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </MainContainer>
    );
}
