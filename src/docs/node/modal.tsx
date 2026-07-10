"use client";

import { createNode, getNode, saveNode } from "@/api/nodes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { useClipboard } from "@/component/v2/clipboard";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Select, SettingInputBytes, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { InputBytesList, InputList } from "@/component/v2/listeditor";
import Loading, { Error as ErrorDisplay } from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node, NodeOrigin, NodeProtocol, NodeProtocolConfig, NodeProtocolType } from "@/contract/node";
import { createDefaultNode, createDefaultProtocol, normalizeNode, normalizeProtocol, patchProtocolConfig, protocolTypes } from "@/contract/node";
import { ArrowDown, ArrowUp, Clipboard, ClipboardCheck, Plus, Trash } from "lucide-react";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type NodeModalProps = {
    show: boolean;
    id?: string;
    hash?: string;
    node?: Node;
    editable?: boolean;
    onHide: (saved?: boolean) => void;
    onSave?: () => void;
    groups?: string[];
    onDelete?: () => void;
    readOnly?: boolean;
    isNew?: boolean;
};

type APIError = {
    code?: number;
    msg?: string;
    raw?: unknown;
};

function errorMessage(error: unknown) {
    if (error && typeof error === "object" && "msg" in error && typeof (error as APIError).msg === "string") {
        return (error as APIError).msg ?? "request failed";
    }
    if (error instanceof Error) return error.message;
    return String(error);
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

function cloneNode(value: Node) {
    return normalizeNode(JSON.parse(JSON.stringify(value)) as Node);
}

function prettyJSON(value: unknown) {
    return JSON.stringify(value ?? {}, null, 2);
}

function stringValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
}

function numberValue(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function boolValue(value: unknown): boolean {
    return value === true;
}

function base64ToBytes(value: unknown): Uint8Array {
    if (value instanceof Uint8Array) return value;
    if (Array.isArray(value)) return Uint8Array.from(value.filter((item): item is number => typeof item === "number"));
    if (typeof value !== "string" || value === "") return new Uint8Array(0);
    try {
        return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    } catch {
        return new TextEncoder().encode(value);
    }
}

function bytesToBase64(value: Uint8Array): string {
    let binary = "";
    value.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function originValues(): NodeOrigin[] {
    return ["reserve", "remote", "manual"];
}

const NodeModalComponent: FC<NodeModalProps> = ({
    show,
    id,
    hash,
    node,
    editable = false,
    onHide,
    onSave,
    groups,
    onDelete,
    readOnly,
    isNew,
}) => {
    const { t } = useTranslation(["node", "common"]);
    const ctx = useContext(GlobalToastContext);
    const nodeId = id ?? hash ?? node?.id ?? "";
    const canEdit = editable && !readOnly;
    const [draft, setDraft] = useState<Node | undefined>();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<APIError | undefined>();
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });

    const title = draft?.name || node?.name || nodeId || "Node";
    const defaultGroup = groups?.[0] ?? "manual";
    const groupOptions = useMemo(() => {
        const values = new Set([...(groups ?? []), draft?.group, "manual"].filter(Boolean) as string[]);
        return Array.from(values);
    }, [groups, draft?.group]);

    useEffect(() => {
        if (!show) return;

        if (node) {
            setDraft(cloneNode(node));
            setError(undefined);
            return;
        }

        if (isNew) {
            setDraft(createDefaultNode(defaultGroup));
            setError(undefined);
            return;
        }

        if (!nodeId) {
            setDraft(undefined);
            setError({ code: 400, msg: "node id is empty" });
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(undefined);
        getNode(nodeId)
            .then((value) => {
                if (!cancelled) setDraft(cloneNode(value));
            })
            .catch((err) => {
                if (!cancelled) setError({ code: err.code, msg: errorMessage(err), raw: err.raw });
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [show, node, nodeId, isNew, defaultGroup]);

    const updateDraft = (patch: Partial<Node>) => {
        setDraft(prev => normalizeNode({ ...(prev ?? createDefaultNode()), ...patch }));
    };

    const updateProtocol = (index: number, protocol: NodeProtocol) => {
        setDraft(prev => {
            const base = normalizeNode(prev);
            const chain = [...base.chain];
            chain[index] = normalizeProtocol(protocol);
            return normalizeNode({ ...base, chain });
        });
    };

    const moveProtocol = (index: number, direction: -1 | 1) => {
        setDraft(prev => {
            const base = normalizeNode(prev);
            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= base.chain.length) return base;
            const chain = [...base.chain];
            [chain[index], chain[nextIndex]] = [chain[nextIndex], chain[index]];
            return normalizeNode({ ...base, chain });
        });
    };

    const removeProtocol = (index: number) => {
        setDraft(prev => {
            const base = normalizeNode(prev);
            const chain = base.chain.filter((_, current) => current !== index);
            return normalizeNode({ ...base, chain: chain.length > 0 ? chain : [createDefaultProtocol("direct")] });
        });
    };

    const handleSave = async () => {
        if (!draft) return;
        setSaving(true);
        try {
            const normalized = normalizeNode(draft);
            const saved = isNew ? await createNode(normalized) : await saveNode(normalized);
            setDraft(cloneNode(saved));
            ctx.Info(t("common:state.saved", { defaultValue: "Saved" }));
            onSave?.();
            onHide(true);
        } catch (err) {
            ctx.Error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        if (!draft) return;
        const text = prettyJSON(normalizeNode(draft));
        try {
            await copy(text);
            ctx.Info(t("copySuccess", { defaultValue: "Copied" }));
        } catch (err) {
            ctx.Error(t("copyFailed", { message: errorMessage(err), defaultValue: "Copy failed" }));
        }
    };

    return (
        <>
            {manualCopyModal}
            <Modal open={show} onOpenChange={(open) => !open && onHide()}>
                <ModalContent className="!w-[calc(100vw-2rem)] md:!w-[calc(100vw-4rem)] !max-w-[1280px]">
                <ModalHeader closeButton className="border-b-0 pb-0">
                    <ModalTitle className="font-bold">{title}</ModalTitle>
                </ModalHeader>

                <ModalBody className="pt-2">
                    {error ? (
                        <ErrorDisplay statusCode={error.code ?? 500} title={error.msg ?? "request failed"} raw={errorRaw(error.raw)} />
                    ) : loading || !draft ? (
                        <Loading />
                    ) : readOnly ? (
                        <NodeProtocolChain
                            chain={draft.chain}
                            editable={false}
                            onProtocolChange={updateProtocol}
                            onMoveProtocol={moveProtocol}
                            onRemoveProtocol={removeProtocol}
                            onAddProtocol={(type) => updateDraft({ chain: [...draft.chain, createDefaultProtocol(type)] })}
                        />
                    ) : (
                        <NodeEditor
                            value={draft}
                            editable={canEdit}
                            groups={groupOptions}
                            onChange={updateDraft}
                            onProtocolChange={updateProtocol}
                            onMoveProtocol={moveProtocol}
                            onRemoveProtocol={removeProtocol}
                            onAddProtocol={(type) => updateDraft({ chain: [...draft.chain, createDefaultProtocol(type)] })}
                        />
                    )}
                </ModalBody>

                <ModalFooter className="flex justify-between">
                    <div>
                        {onDelete && (
                            <Dropdown>
                                <DropdownTrigger asChild>
                                    <Button variant="outline-danger"><Trash size={16} className="mr-2" />{t("common:action.remove")}</Button>
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownItem
                                        className="text-red-500 font-bold"
                                        onSelect={() => {
                                            void Promise.resolve(onDelete()).then(() => onHide(true)).catch((err) => ctx.Error(errorMessage(err)));
                                        }}
                                    >
                                        {t("common:action.confirmDelete")}
                                    </DropdownItem>
                                    <DropdownItem>{t("common:action.cancel")}</DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {draft && (
                            <Button onClick={handleCopy}>
                                {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                            </Button>
                        )}
                        <Button onClick={() => onHide()}>{t("common:action.close")}</Button>
                        {canEdit && (
                            <Button disabled={saving || loading || !!error} onClick={handleSave}>
                                {saving ? <Spinner size="sm" /> : t("common:action.save")}
                            </Button>
                        )}
                    </div>
                </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

const NodeEditor: FC<{
    value: Node;
    editable: boolean;
    groups: string[];
    onChange: (patch: Partial<Node>) => void;
    onProtocolChange: (index: number, protocol: NodeProtocol) => void;
    onMoveProtocol: (index: number, direction: -1 | 1) => void;
    onRemoveProtocol: (index: number) => void;
    onAddProtocol: (type: NodeProtocolType) => void;
}> = ({ value, editable, groups, onChange, onProtocolChange, onMoveProtocol, onRemoveProtocol, onAddProtocol }) => (
    <div className="p-1">
        {editable && (
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <SettingInputVertical label="Name" value={value.name} onChange={(name) => onChange({ name })} disabled={!editable} />
                <SettingSelectVertical label="Group" value={value.group} values={groups} onChange={(group) => onChange({ group })} disabled={!editable} />
                <SettingInputVertical label="ID" value={value.id} onChange={(id) => onChange({ id })} disabled={!editable} />
                <SettingSelectVertical label="Origin" value={value.origin} values={originValues()} onChange={(origin) => onChange({ origin: origin as NodeOrigin })} disabled={!editable} />
                <div className="md:col-span-2">
                    <SwitchCard label="Enabled" checked={value.enabled} onCheckedChange={(enabled) => onChange({ enabled })} disabled={!editable} />
                </div>
            </div>
        )}

        <NodeProtocolChain
            chain={value.chain}
            editable={editable}
            onProtocolChange={onProtocolChange}
            onMoveProtocol={onMoveProtocol}
            onRemoveProtocol={onRemoveProtocol}
            onAddProtocol={onAddProtocol}
        />
    </div>
);

const NodeProtocolChain: FC<{
    chain: NodeProtocol[];
    editable: boolean;
    onProtocolChange: (index: number, protocol: NodeProtocol) => void;
    onMoveProtocol: (index: number, direction: -1 | 1) => void;
    onRemoveProtocol: (index: number) => void;
    onAddProtocol: (type: NodeProtocolType) => void;
}> = ({ chain, editable, onProtocolChange, onMoveProtocol, onRemoveProtocol, onAddProtocol }) => {
    const [newProtocol, setNewProtocol] = useState<NodeProtocolType>("direct");
    const normalizedChain = chain.length > 0 ? chain.map(normalizeProtocol) : [createDefaultProtocol("direct")];

    return (
        <div className="mb-3">
            <div className="mb-2 flex items-center justify-between px-1">
                <h6 className="mb-0 font-bold opacity-75">Protocol Chain</h6>
                <small className="text-gray-500 dark:text-gray-400">{normalizedChain.length} steps</small>
            </div>

            <Accordion type="multiple" defaultValue={normalizedChain.length > 0 ? ["item-0"] : []} className="mb-3">
                {normalizedChain.map((protocol, index) => (
                    <AccordionItem value={`item-${index}`} key={`${index}-${protocol.type}`}>
                        <AccordionTrigger>
                            <div className="flex min-w-0 items-center gap-2">
                                <Badge variant="primary" pill className="px-2 text-[0.7rem]">
                                    {index + 1}
                                </Badge>
                                <span className="truncate">{protocol.type}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-1">
                                <ProtocolEditor
                                    value={protocol}
                                    index={index}
                                    editable={editable}
                                    onChange={(next) => onProtocolChange(index, next)}
                                />

                                {editable && (
                                    <div className="mt-3 flex justify-end gap-2 pt-3">
                                        <Button size="sm" onClick={() => onMoveProtocol(index, -1)} disabled={index === 0}>
                                            <ArrowUp size={16} />
                                        </Button>
                                        <Button size="sm" onClick={() => onMoveProtocol(index, 1)} disabled={index === normalizedChain.length - 1}>
                                            <ArrowDown size={16} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => onRemoveProtocol(index)}>
                                            <Trash size={16} className="mr-2" /> Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {editable && (
                <div className="flex flex-wrap items-end gap-3 rounded-ui-lg bg-gray-100 p-3 dark:bg-[#2b2b40] sm:flex-nowrap">
                    <div className="w-full flex-1">
                        <label className="mb-2 block text-sm font-bold opacity-75">New Protocol Step</label>
                        <Select
                            value={newProtocol}
                            onValueChange={(value) => setNewProtocol(value as NodeProtocolType)}
                            items={protocolTypes.map(value => ({ value, label: value }))}
                        />
                    </div>
                    <Button
                        className="mb-1"
                        style={{ height: "35px" }}
                        onClick={() => onAddProtocol(newProtocol)}
                    >
                        <Plus className="mr-1" size={16} /> Add Step
                    </Button>
                </div>
            )}
        </div>
    );
};

const ProtocolEditor: FC<{
    value: NodeProtocol;
    index: number;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ value, index, editable, onChange }) => {
    const normalized = normalizeProtocol(value);

    const updateType = (type: string) => {
        onChange(createDefaultProtocol(type as NodeProtocolType));
    };

    return (
        <div className="grid gap-3">
            {editable && (
                <div className="grow">
                    <SettingLabel className="mb-2 block">#{index + 1} Type</SettingLabel>
                    <SettingSelectVertical
                        label=""
                        className="!mb-0"
                        value={normalized.type}
                        values={protocolTypes}
                        onChange={updateType}
                        disabled={!editable}
                    />
                </div>
            )}
            <ProtocolConfigEditor
                value={normalized}
                editable={editable}
                onChange={onChange}
            />
        </div>
    );
};

const ProtocolConfigEditor: FC<{
    value: NodeProtocol;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ value, editable, onChange }) => {
    const normalized = normalizeProtocol(value);

    const form = protocolForm(normalized, onChange, editable);
    return (
        <div className="grid gap-3">
            {form ?? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">
                    No structured editor for this protocol yet.
                </div>
            )}
        </div>
    );
};

function protocolForm(protocol: NodeProtocol, onChange: (value: NodeProtocol) => void, editable: boolean): React.ReactNode {
    const patch = <T extends NodeProtocolType>(value: NodeProtocol<T>, patchValue: Partial<NodeProtocolConfig<T>>) => {
        onChange(patchProtocolConfig(value, patchValue) as unknown as NodeProtocol);
    };

    switch (protocol.type) {
        case "direct":
            return (
                <StringField
                    label="Network Interface"
                    value={protocol.direct.network_interface}
                    disabled={!editable}
                    onChange={(network_interface) => patch(protocol, { network_interface })}
                />
            );
        case "reject":
        case "drop":
        case "none":
        case "bootstrap_dns_warp":
        case "proxy":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">No extra protocol configuration.</div>;
        case "socks5":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Hostname" value={protocol.socks5.hostname} disabled={!editable} onChange={(hostname) => patch(protocol, { hostname })} />
                    <StringField label="User" value={protocol.socks5.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />
                    <StringField label="Password" value={protocol.socks5.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <NumberField label="Override Port" value={protocol.socks5.override_port} disabled={!editable} onChange={(override_port) => patch(protocol, { override_port })} />
                </div>
            );
        case "http":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="User" value={protocol.http.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />
                    <StringField label="Password" value={protocol.http.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                </div>
            );
        case "shadowsocks":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Method" value={protocol.shadowsocks.method} disabled={!editable} onChange={(method) => patch(protocol, { method })} />
                    <StringField label="Password" value={protocol.shadowsocks.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                </div>
            );
        case "shadowsocksr":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Server" value={protocol.shadowsocksr.server} disabled={!editable} onChange={(server) => patch(protocol, { server })} />
                    <StringField label="Port" value={protocol.shadowsocksr.port} disabled={!editable} onChange={(port) => patch(protocol, { port })} />
                    <StringField label="Method" value={protocol.shadowsocksr.method} disabled={!editable} onChange={(method) => patch(protocol, { method })} />
                    <StringField label="Password" value={protocol.shadowsocksr.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <StringField label="Obfs" value={protocol.shadowsocksr.obfs} disabled={!editable} onChange={(obfs) => patch(protocol, { obfs })} />
                    <StringField label="Obfs Param" value={protocol.shadowsocksr.obfsparam} disabled={!editable} onChange={(obfsparam) => patch(protocol, { obfsparam })} />
                    <StringField label="Protocol" value={protocol.shadowsocksr.protocol} disabled={!editable} onChange={(nextProtocol) => patch(protocol, { protocol: nextProtocol })} />
                    <StringField label="Protocol Param" value={protocol.shadowsocksr.protoparam} disabled={!editable} onChange={(protoparam) => patch(protocol, { protoparam })} />
                </div>
            );
        case "vmess":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StringField label="UUID" value={protocol.vmess.id} disabled={!editable} onChange={(id) => patch(protocol, { id })} />
                    <StringField label="Alter ID" value={protocol.vmess.aid} disabled={!editable} onChange={(aid) => patch(protocol, { aid })} />
                    <StringField label="Security" value={protocol.vmess.security} disabled={!editable} onChange={(security) => patch(protocol, { security })} />
                </div>
            );
        case "vless":
            return <StringField label="UUID" value={protocol.vless.uuid} disabled={!editable} onChange={(uuid) => patch(protocol, { uuid })} />;
        case "trojan":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Password" value={protocol.trojan.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <StringField label="Peer" value={protocol.trojan.peer} disabled={!editable} onChange={(peer) => patch(protocol, { peer })} />
                </div>
            );
        case "yuubinsya":
            return (
                <div className="grid gap-4">
                    <StringField label="Password" value={protocol.yuubinsya.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <BoolField label="UDP Over Stream" value={protocol.yuubinsya.udp_over_stream} disabled={!editable} onChange={(udp_over_stream) => patch(protocol, { udp_over_stream })} />
                    <BoolField label="UDP Coalesce" value={protocol.yuubinsya.udp_coalesce} disabled={!editable} onChange={(udp_coalesce) => patch(protocol, { udp_coalesce })} />
                </div>
            );
        case "websocket":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Host" value={protocol.websocket.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <StringField label="Path" value={protocol.websocket.path} disabled={!editable} onChange={(path) => patch(protocol, { path })} />
                </div>
            );
        case "quic":
            return (
                <div className="grid gap-4">
                    <StringField label="Host" value={protocol.quic.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <TLSConfigForm
                        config={protocol.quic.tls ?? {}}
                        editable={editable}
                        showEnabled={false}
                        onChange={(tls) => patch(protocol, { tls })}
                    />
                </div>
            );
        case "obfs_http":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Host" value={protocol.obfs_http.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <StringField label="Port" value={protocol.obfs_http.port} disabled={!editable} onChange={(port) => patch(protocol, { port })} />
                </div>
            );
        case "reality":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <StringField label="Server Name" value={protocol.reality.server_name} disabled={!editable} onChange={(server_name) => patch(protocol, { server_name })} />
                        <StringField label="Public Key" value={protocol.reality.public_key} disabled={!editable} onChange={(public_key) => patch(protocol, { public_key })} />
                        <StringField label="MLDSA65 Verify" value={protocol.reality.mldsa65_verify} disabled={!editable} onChange={(mldsa65_verify) => patch(protocol, { mldsa65_verify })} />
                        <StringField label="Short ID" value={protocol.reality.short_id} disabled={!editable} onChange={(short_id) => patch(protocol, { short_id })} />
                    </div>
                    <BoolField label="Debug" value={protocol.reality.debug} disabled={!editable} onChange={(debug) => patch(protocol, { debug })} />
                </div>
            );
        case "simple":
            return <FixedForm config={protocol.simple} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "fixed":
            return <FixedForm config={protocol.fixed} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "tls":
            return <TLSConfigForm config={protocol.tls} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "wireguard":
            return <WireguardForm config={protocol.wireguard} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "tailscale":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Hostname" value={protocol.tailscale.hostname} disabled={!editable} onChange={(hostname) => patch(protocol, { hostname })} />
                    <StringField label="Auth Key" value={protocol.tailscale.auth_key} disabled={!editable} onChange={(auth_key) => patch(protocol, { auth_key })} />
                    <StringField label="Control URL" value={protocol.tailscale.control_url} disabled={!editable} onChange={(control_url) => patch(protocol, { control_url })} />
                    <BoolField label="Debug" value={protocol.tailscale.debug} disabled={!editable} onChange={(debug) => patch(protocol, { debug })} />
                </div>
            );
        case "http_mock":
            return (
                <SettingInputBytes
                    label="Data"
                    value={base64ToBytes(protocol.http_mock.data)}
                    disabled={!editable}
                    onChange={(data) => patch(protocol, { data: bytesToBase64(data) })}
                />
            );
        case "aead":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label="Password" value={protocol.aead.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <StringField label="Crypto Method" value={protocol.aead.crypto_method} disabled={!editable} onChange={(crypto_method) => patch(protocol, { crypto_method })} />
                </div>
            );
        case "http2":
            return <NumberField label="Concurrency" value={protocol.http2.concurrency} disabled={!editable} onChange={(concurrency) => patch(protocol, { concurrency })} />;
        case "mux":
            return <NumberField label="Concurrency" value={protocol.mux.concurrency} disabled={!editable} onChange={(concurrency) => patch(protocol, { concurrency })} />;
        case "set":
            return (
                <div className="grid gap-4">
                    <InputList title="Nodes" data={protocol.set.nodes ?? []} disabled={!editable} onChange={(nodes) => patch(protocol, { nodes })} />
                    <StringField label="Strategy" value={protocol.set.strategy} disabled={!editable} onChange={(strategy) => patch(protocol, { strategy })} />
                </div>
            );
        case "point_as_endpoint":
            return <StringField label="Hash" value={protocol.point_as_endpoint.hash} disabled={!editable} onChange={(hash) => patch(protocol, { hash })} />;
        case "network_split":
            return <NetworkSplitForm config={protocol.network_split} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "cloudflare_warp_masque":
            return (
                <div className="grid gap-4">
                    <StringField label="Private Key" value={protocol.cloudflare_warp_masque.private_key} disabled={!editable} onChange={(private_key) => patch(protocol, { private_key })} />
                    <StringField label="Endpoint Public Key" value={protocol.cloudflare_warp_masque.endpoint_public_key} disabled={!editable} onChange={(endpoint_public_key) => patch(protocol, { endpoint_public_key })} />
                    <InputList title="Endpoints" data={protocol.cloudflare_warp_masque.endpoint ?? []} disabled={!editable} onChange={(endpoint) => patch(protocol, { endpoint })} />
                    <InputList title="Local Addresses" data={protocol.cloudflare_warp_masque.local_addresses ?? []} disabled={!editable} onChange={(local_addresses) => patch(protocol, { local_addresses })} />
                    <NumberField label="MTU" value={protocol.cloudflare_warp_masque.mtu} disabled={!editable} onChange={(mtu) => patch(protocol, { mtu })} />
                </div>
            );
        case "tls_termination":
            return <TLSTerminationForm config={protocol.tls_termination} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "http_termination":
            return <HTTPTerminationForm config={protocol.http_termination} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "fixedv2":
            return <FixedV2Form config={protocol.fixedv2} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        default:
            return undefined;
    }
}

const StringField: FC<{ label: string; value: unknown; disabled?: boolean; onChange: (value: string) => void }> = ({ label, value, disabled, onChange }) => (
    <SettingInputVertical label={label} value={stringValue(value)} onChange={onChange} disabled={disabled} />
);

const NumberField: FC<{ label: string; value: unknown; disabled?: boolean; onChange: (value: number) => void }> = ({ label, value, disabled, onChange }) => (
    <SettingInputVertical label={label} type="number" value={String(numberValue(value))} onChange={(next) => onChange(numberValue(next))} disabled={disabled} />
);

const BoolField: FC<{ label: string; value: unknown; disabled?: boolean; onChange: (value: boolean) => void }> = ({ label, value, disabled, onChange }) => (
    <SwitchCard label={label} checked={boolValue(value)} onCheckedChange={onChange} disabled={disabled} />
);

type FixedAddress = {
    host?: string;
    port?: number;
    network_interface?: string;
};

const AddressList: FC<{
    title: string;
    data?: FixedAddress[];
    editable: boolean;
    onChange: (value: FixedAddress[]) => void;
}> = ({ title, data, editable, onChange }) => {
    const items = Array.isArray(data) ? data : [];

    const update = (index: number, patch: Partial<FixedAddress>) => {
        const next = [...items];
        next[index] = { ...(next[index] ?? {}), ...patch };
        onChange(next);
    };

    const move = (index: number, direction: -1 | 1) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= items.length) return;
        const next = [...items];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        onChange(next);
    };

    const label = (index: number) => {
        const item = items[index];
        const host = stringValue(item?.host);
        const port = numberValue(item?.port);
        if (!host) return `Entry ${index + 1}`;
        return port > 0 ? `${host}:${port}` : host;
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between px-1">
                <h6 className="mb-0 font-bold opacity-75">{title}</h6>
                <small className="text-gray-500 dark:text-gray-400">{items.length} entries</small>
            </div>

            <Accordion type="multiple" defaultValue={items.length > 0 ? [`${title}-0`] : []} className="mb-3">
                {items.map((item, index) => (
                    <AccordionItem value={`${title}-${index}`} key={index}>
                        <AccordionTrigger>
                            <span className="truncate">{label(index)}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-1">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <StringField label="Host" value={item.host} disabled={!editable} onChange={(host) => update(index, { host })} />
                                    <NumberField label="Port" value={item.port} disabled={!editable} onChange={(port) => update(index, { port })} />
                                    <StringField label="Network Interface" value={item.network_interface} disabled={!editable} onChange={(network_interface) => update(index, { network_interface })} />
                                </div>

                                {editable && (
                                    <div className="mt-3 flex justify-end gap-2 pt-3">
                                        <Button size="sm" onClick={() => move(index, -1)} disabled={index === 0}>
                                            <ArrowUp size={16} />
                                        </Button>
                                        <Button size="sm" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                                            <ArrowDown size={16} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => onChange(items.filter((_, current) => current !== index))}>
                                            <Trash size={16} className="mr-2" /> Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {editable && (
                <div className="flex justify-end px-1">
                    <Button onClick={() => onChange([...items, { host: "", port: 0, network_interface: "" }])}>
                        <Plus className="mr-1" size={16} /> Add {title}
                    </Button>
                </div>
            )}
        </div>
    );
};

const TLSConfigForm: FC<{
    config: Partial<NodeProtocolConfig<"tls">>;
    editable: boolean;
    showEnabled?: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"tls">>) => void;
}> = ({ config, editable, showEnabled = true, onChange }) => (
    <div className="grid gap-4">
        {showEnabled && (
            <BoolField label="TLS Enabled" value={config.enable} disabled={!editable} onChange={(enable) => onChange({ ...config, enable })} />
        )}
        <BoolField label="Insecure Skip Verify" value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ ...config, insecure_skip_verify })} />
        <InputList title="Server Names" data={config.servernames ?? []} disabled={!editable} onChange={(servernames) => onChange({ ...config, servernames })} />
        <InputList title="Next Protos" data={config.next_protos ?? []} disabled={!editable} onChange={(next_protos) => onChange({ ...config, next_protos })} />
        <InputBytesList
            title="CA Certificate"
            data={(config.ca_cert ?? []).map(base64ToBytes)}
            disabled={!editable}
            onChange={(caCert) => onChange({ ...config, ca_cert: caCert.map(bytesToBase64) })}
        />
        <SettingInputBytes
            label="ECH Config List"
            value={base64ToBytes(config.ech_config)}
            disabled={!editable}
            onChange={(echConfig) => onChange({ ...config, ech_config: bytesToBase64(echConfig) })}
        />
    </div>
);

const FixedForm: FC<{
    config: NodeProtocolConfig<"fixed">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"fixed">>) => void;
}> = ({ config, editable, onChange }) => (
    <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StringField label="Host" value={config.host} disabled={!editable} onChange={(host) => onChange({ host })} />
            <NumberField label="Port" value={config.port} disabled={!editable} onChange={(port) => onChange({ port })} />
            <StringField label="Network Interface" value={config.network_interface} disabled={!editable} onChange={(network_interface) => onChange({ network_interface })} />
        </div>
        <AddressList
            title="Alternate Host"
            data={config.alternate_host ?? []}
            editable={editable}
            onChange={(alternate_host) => onChange({ alternate_host })}
        />
    </div>
);

const FixedV2Form: FC<{
    config: NodeProtocolConfig<"fixedv2">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"fixedv2">>) => void;
}> = ({ config, editable, onChange }) => {
    const addresses = Array.isArray(config.addresses) ? config.addresses : [];

    return (
        <div className="grid gap-4">
            <AddressList title="Hosts" data={addresses} editable={editable} onChange={(next) => onChange({ addresses: next })} />
            <BoolField label="UDP HappyEyeballs" value={config.udp_happy_eyeballs} disabled={!editable} onChange={(udp_happy_eyeballs) => onChange({ udp_happy_eyeballs })} />
        </div>
    );
};

const WireguardForm: FC<{
    config: NodeProtocolConfig<"wireguard">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"wireguard">>) => void;
}> = ({ config, editable, onChange }) => {
    const peers = Array.isArray(config.peers) ? config.peers : [];

    const updatePeer = (index: number, patch: Partial<NonNullable<NodeProtocolConfig<"wireguard">["peers"]>[number]>) => {
        const next = [...peers];
        next[index] = { ...(next[index] ?? {}), ...patch };
        onChange({ peers: next });
    };

    return (
        <div className="grid gap-4">
            <StringField label="Secret Key" value={config.secretKey} disabled={!editable} onChange={(secretKey) => onChange({ secretKey })} />
            <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
            <SettingInputBytes
                label="Reserved"
                value={base64ToBytes(config.reserved)}
                disabled={!editable}
                onChange={(reserved) => onChange({ reserved: bytesToBase64(reserved) })}
            />
            <InputList title="Local Address" data={config.endpoint ?? []} disabled={!editable} onChange={(endpoint) => onChange({ endpoint })} />

            <div>
                <div className="mb-2 flex items-center justify-between px-1">
                    <h6 className="mb-0 font-bold opacity-75">Peers</h6>
                    <small className="text-gray-500 dark:text-gray-400">{peers.length} peers</small>
                </div>

                <Accordion type="multiple" defaultValue={peers.length > 0 ? ["peer-0"] : []} className="mb-3">
                    {peers.map((peer, index) => (
                        <AccordionItem value={`peer-${index}`} key={index}>
                            <AccordionTrigger>
                                <span className="truncate">{peer.endpoint || `Peer ${index + 1}`}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4 p-1">
                                    <StringField label="Endpoint" value={peer.endpoint} disabled={!editable} onChange={(endpoint) => updatePeer(index, { endpoint })} />
                                    <StringField label="Public Key" value={peer.publicKey} disabled={!editable} onChange={(publicKey) => updatePeer(index, { publicKey })} />
                                    <StringField label="Pre Shared Key" value={peer.preSharedKey} disabled={!editable} onChange={(preSharedKey) => updatePeer(index, { preSharedKey })} />
                                    <NumberField label="Keep Alive" value={peer.keepAlive} disabled={!editable} onChange={(keepAlive) => updatePeer(index, { keepAlive })} />
                                    <InputList title="Allowed IPs" data={peer.allowedIps ?? []} disabled={!editable} onChange={(allowedIps) => updatePeer(index, { allowedIps })} />

                                    {editable && (
                                        <div className="flex justify-end pt-3">
                                            <Button variant="outline-danger" size="sm" onClick={() => onChange({ peers: peers.filter((_, current) => current !== index) })}>
                                                <Trash size={16} className="mr-2" /> Delete Peer
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {editable && (
                    <div className="flex justify-end px-1">
                        <Button onClick={() => onChange({ peers: [...peers, { allowedIps: ["0.0.0.0/0"], endpoint: "127.0.0.1:51820", publicKey: "" }] })}>
                            <Plus className="mr-1" size={16} /> Add Peer
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const NestedProtocolEditor: FC<{
    label: string;
    value?: NodeProtocol;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ label, value, editable, onChange }) => {
    const current = normalizeProtocol(value ?? createDefaultProtocol("direct"));
    const nestedProtocolTypes = protocolTypes.filter((type) => type !== "network_split");

    return (
        <div className="grid gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
            <SettingLabel className="block">{label}</SettingLabel>
            <SettingSelectVertical
                label="Type"
                value={current.type}
                values={nestedProtocolTypes}
                onChange={(type) => onChange(createDefaultProtocol(type as NodeProtocolType))}
                disabled={!editable}
            />
            <ProtocolConfigEditor value={current} editable={editable} onChange={onChange} />
        </div>
    );
};

const NetworkSplitForm: FC<{
    config: NodeProtocolConfig<"network_split">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"network_split">>) => void;
}> = ({ config, editable, onChange }) => (
    <div className="grid gap-4">
        <NestedProtocolEditor label="TCP Protocol" value={config.tcp} editable={editable} onChange={(tcp) => onChange({ tcp })} />
        <NestedProtocolEditor label="UDP Protocol" value={config.udp} editable={editable} onChange={(udp) => onChange({ udp })} />
    </div>
);

const CertificateForm: FC<{
    cert: NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>["certificates"] extends Array<infer T> ? T : never;
    editable: boolean;
    onChange: (value: NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>["certificates"] extends Array<infer T> ? T : never) => void;
}> = ({ cert, editable, onChange }) => (
    <div className="grid gap-4">
        <SettingInputBytes label="Certificate (PEM)" value={base64ToBytes(cert.cert)} disabled={!editable} onChange={(value) => onChange({ ...cert, cert: bytesToBase64(value) })} />
        <SettingInputBytes label="Private Key (PEM)" value={base64ToBytes(cert.key)} disabled={!editable} onChange={(value) => onChange({ ...cert, key: bytesToBase64(value) })} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StringField label="Cert File Path" value={cert.cert_file_path} disabled={!editable} onChange={(cert_file_path) => onChange({ ...cert, cert_file_path })} />
            <StringField label="Key File Path" value={cert.key_file_path} disabled={!editable} onChange={(key_file_path) => onChange({ ...cert, key_file_path })} />
        </div>
    </div>
);

const ServerTLSForm: FC<{
    config: NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>;
    editable: boolean;
    onChange: (value: NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>) => void;
}> = ({ config, editable, onChange }) => {
    const certificates = Array.isArray(config.certificates) ? config.certificates : [];
    const sni = config.serverNameCertificate ?? {};
    const [newSNI, setNewSNI] = useState("www.example.com");

    return (
        <div className="grid gap-4">
            <InputList title="Next Protos" data={config.next_protos ?? []} disabled={!editable} onChange={(next_protos) => onChange({ ...config, next_protos })} />

            <div>
                <div className="mb-2 flex items-center justify-between px-1">
                    <h6 className="mb-0 font-bold opacity-75">Certificates</h6>
                    <small className="text-gray-500 dark:text-gray-400">{certificates.length} entries</small>
                </div>
                <Accordion type="multiple" defaultValue={certificates.length > 0 ? ["cert-0"] : []} className="mb-3">
                    {certificates.map((cert, index) => (
                        <AccordionItem value={`cert-${index}`} key={index}>
                            <AccordionTrigger>Certificate {index + 1}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4 p-1">
                                    <CertificateForm
                                        cert={cert}
                                        editable={editable}
                                        onChange={(nextCert) => onChange({ ...config, certificates: certificates.map((item, current) => current === index ? nextCert : item) })}
                                    />
                                    {editable && (
                                        <div className="flex justify-end pt-3">
                                            <Button variant="outline-danger" size="sm" onClick={() => onChange({ ...config, certificates: certificates.filter((_, current) => current !== index) })}>
                                                <Trash size={16} className="mr-2" /> Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {editable && (
                    <div className="flex justify-end px-1">
                        <Button onClick={() => onChange({ ...config, certificates: [...certificates, { cert: "", key: "", cert_file_path: "", key_file_path: "" }] })}>
                            <Plus className="mr-1" size={16} /> New Certificate
                        </Button>
                    </div>
                )}
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between px-1">
                    <h6 className="mb-0 font-bold opacity-75">SNI Certificates</h6>
                    <small className="text-gray-500 dark:text-gray-400">{Object.keys(sni).length} entries</small>
                </div>
                <Accordion type="multiple" className="mb-3">
                    {Object.entries(sni).map(([serverName, cert]) => (
                        <AccordionItem value={`sni-${serverName}`} key={serverName}>
                            <AccordionTrigger>{serverName}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4 p-1">
                                    <CertificateForm
                                        cert={cert}
                                        editable={editable}
                                        onChange={(nextCert) => onChange({ ...config, serverNameCertificate: { ...sni, [serverName]: nextCert } })}
                                    />
                                    {editable && (
                                        <div className="flex justify-end pt-3">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    const next = { ...sni };
                                                    delete next[serverName];
                                                    onChange({ ...config, serverNameCertificate: next });
                                                }}
                                            >
                                                <Trash size={16} className="mr-2" /> Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {editable && (
                    <div className="flex flex-wrap items-end gap-3 rounded-ui-lg bg-gray-100 p-3 dark:bg-[#2b2b40] sm:flex-nowrap">
                        <div className="w-full flex-1">
                            <SettingInputVertical label="New SNI Hostname" value={newSNI} onChange={setNewSNI} />
                        </div>
                        <Button className="mb-4" onClick={() => newSNI && onChange({ ...config, serverNameCertificate: { ...sni, [newSNI]: { cert: "", key: "", cert_file_path: "", key_file_path: "" } } })}>
                            <Plus className="mr-1" size={16} /> Add SNI
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const TLSTerminationForm: FC<{
    config: NodeProtocolConfig<"tls_termination">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"tls_termination">>) => void;
}> = ({ config, editable, onChange }) => (
    <ServerTLSForm config={config.tls ?? {}} editable={editable} onChange={(tls) => onChange({ tls })} />
);

const HTTPTerminationForm: FC<{
    config: NodeProtocolConfig<"http_termination">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"http_termination">>) => void;
}> = ({ config, editable, onChange }) => {
    const headers = config.headers ?? {};
    const [newPath, setNewPath] = useState("/");

    const updatePath = (path: string, value: NonNullable<NodeProtocolConfig<"http_termination">["headers"]>[string]) => {
        onChange({ headers: { ...headers, [path]: value } });
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between px-1">
                <h6 className="mb-0 font-bold opacity-75">HTTP Headers</h6>
                <small className="text-gray-500 dark:text-gray-400">{Object.keys(headers).length} paths</small>
            </div>
            <Accordion type="multiple" className="mb-3">
                {Object.entries(headers).map(([path, value]) => {
                    const items = Array.isArray(value.headers) ? value.headers : [];
                    return (
                        <AccordionItem value={`path-${path}`} key={path}>
                            <AccordionTrigger>{path}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-3 p-1">
                                    {items.map((header, index) => (
                                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={index}>
                                            <StringField label="Key" value={header.key} disabled={!editable} onChange={(key) => updatePath(path, { headers: items.map((item, current) => current === index ? { ...item, key } : item) })} />
                                            <StringField label="Value" value={header.value} disabled={!editable} onChange={(nextValue) => updatePath(path, { headers: items.map((item, current) => current === index ? { ...item, value: nextValue } : item) })} />
                                            {editable && (
                                                <Button className="mt-7" variant="outline-danger" size="icon" onClick={() => updatePath(path, { headers: items.filter((_, current) => current !== index) })}>
                                                    <Trash size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {editable && (
                                        <div className="flex justify-between gap-2">
                                            <Button onClick={() => updatePath(path, { headers: [...items, { key: "", value: "" }] })}>
                                                <Plus className="mr-1" size={16} /> Add Header
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => {
                                                    const next = { ...headers };
                                                    delete next[path];
                                                    onChange({ headers: next });
                                                }}
                                            >
                                                <Trash size={16} className="mr-2" /> Remove Path
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
            {editable && (
                <div className="flex flex-wrap items-end gap-3 rounded-ui-lg bg-gray-100 p-3 dark:bg-[#2b2b40] sm:flex-nowrap">
                    <div className="w-full flex-1">
                        <SettingInputVertical label="New Path" value={newPath} onChange={setNewPath} />
                    </div>
                    <Button className="mb-4" onClick={() => newPath && onChange({ headers: { ...headers, [newPath]: { headers: [] } } })}>
                        <Plus className="mr-1" size={16} /> Add Path
                    </Button>
                </div>
            )}
        </div>
    );
};

export const NodeModal = React.memo(NodeModalComponent);
