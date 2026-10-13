import { useAsyncAction, useCloseGuard } from "@/hooks/use-editor-draft";
import { NodeEditor, NodeProtocolChain } from "./NodeEditor";

import { createNode, getNode, saveNode, useNode } from "@/api/nodes";

import { Button } from "@/component/v2/button";
import { SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { nodeTemplates, templateChain, chainTemplate, type NodeTemplate } from "./templates";

import { useClipboard } from "@/component/v2/clipboard";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";

import Loading, { Error as ErrorDisplay } from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node, NodeProtocol } from "@/contract/node";
import { createDefaultNode, createDefaultProtocol, normalizeNode, normalizeProtocol } from "@/contract/node";
import { Clipboard, ClipboardCheck, Trash } from "lucide-react";
import React, { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type NodeModalProps = {
    show: boolean;
    id?: string;
    hash?: string;
    node?: Node;
    editable?: boolean;
    onHide: (saved?: boolean) => void;
    onSave?: (node: Node) => void;
    onChanged?: (node: Node) => void;
    groups?: string[];
    onDelete?: () => void | Promise<void>;
    presentation?: "modal" | "inline";
    onStateChange?: (state: { dirty: boolean; pending: boolean }) => void;
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

const NodeModalComponent: FC<NodeModalProps> = ({
    show,
    id,
    hash,
    node,
    editable = false,
    onHide,
    onSave,
    onChanged,
    groups,
    onDelete,
    readOnly,
    isNew,
    presentation = "modal",
    onStateChange,
}) => {
    const { t } = useTranslation(["node", "common"]);
    const { t: routingT } = useTranslation("routing");
    const [makeDefault, setMakeDefault] = useState(false);
    const ctx = useContext(GlobalToastContext);
    const nodeId = id ?? hash ?? node?.id ?? "";
    const canEdit = editable && !readOnly;
    const [draft, setDraft] = useState<Node | undefined>();
    const [retryNonce, setRetryNonce] = useState(0);
    const [loading, setLoading] = useState(false);
    const baseline = useRef('');
    const loadedIdentity = useRef('');
    const draftRef = useRef(draft);
    draftRef.current = draft;
    const nodeSource = node ? JSON.stringify(node) : '';
    const [actionError, setActionError] = useState('');
    const { pending: saving, run } = useAsyncAction(error => { const message = errorMessage(error); setActionError(message); ctx.Error(message); });
    const dirty = show && canEdit && Boolean(draft) && (JSON.stringify(draft) !== baseline.current || makeDefault);
    const close = useCloseGuard(dirty, saving, () => onHide());
    const created = useRef(false);
    useEffect(() => { onStateChange?.({ dirty, pending: saving }); }, [dirty, saving, onStateChange]);
    const [error, setError] = useState<APIError | undefined>();
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });

    const title = draft?.name || node?.name || nodeId || "Node";
    const defaultGroup = groups?.[0] ?? "manual";
    const groupOptions = useMemo(() => {
        const values = new Set([...(groups ?? []), draft?.group, "manual"].filter(Boolean) as string[]);
        return Array.from(values);
    }, [groups, draft?.group]);

    useEffect(() => {
        if (!show) { loadedIdentity.current = ''; created.current = false; return; }
        const identity = `${nodeId}:${Boolean(isNew)}`;
        if (loadedIdentity.current === identity && canEdit && draftRef.current && (created.current || JSON.stringify(draftRef.current) !== baseline.current)) return;
        loadedIdentity.current = identity;
        setActionError('');

        const providedNode = nodeSource ? JSON.parse(nodeSource) as Node : undefined;
        if (providedNode) {
            baseline.current = JSON.stringify(cloneNode(providedNode));
            setDraft(cloneNode(providedNode));
            setLoading(false);
            setError(undefined);
            return;
        }

        if (isNew) {
            setMakeDefault(false);
            created.current = false;
            const initial = createDefaultNode(defaultGroup);
            baseline.current = JSON.stringify(initial);
            setDraft(initial);
            setLoading(false);
            setError(undefined);
            return;
        }

        if (!nodeId) {
            setDraft(undefined);
            setError({ code: 400, msg: "node id is empty" });
            return;
        }

        let cancelled = false;
        const controller = new AbortController();
        setDraft(undefined);
        setLoading(true);
        setError(undefined);
        getNode(nodeId, controller.signal)
            .then((value) => {
                if (!cancelled) { baseline.current = JSON.stringify(cloneNode(value)); setDraft(cloneNode(value)); }
            })
            .catch((err) => {
                if (!cancelled) setError({ code: err.code, msg: errorMessage(err), raw: err.raw });
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [show, nodeSource, nodeId, isNew, defaultGroup, canEdit, retryNonce]);

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

    const handleSave = () => {
        if (!draft || !canEdit || saving || loading || error) return;
        void run(async () => {
            setActionError('');
            const normalized = normalizeNode(draft);
            const saved = isNew && !created.current ? await createNode(normalized) : await saveNode(normalized);
            if (isNew) created.current = true;
            baseline.current = JSON.stringify(saved);
            setDraft(cloneNode(saved));
            onChanged?.(saved);
            if (makeDefault) await useNode(saved.id);
            setMakeDefault(false);
            ctx.Info(t("common:state.saved", { defaultValue: "Saved" }));
            onSave?.(saved);
            onHide(true);
        });
    };

    const discard = () => {
        if (saving || !dirty || !window.confirm(t('common:form.discardChanges'))) return;
        setDraft(cloneNode(JSON.parse(baseline.current) as Node));
        setMakeDefault(false);
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

    const body = <>
        {actionError && <p role="alert" className="mb-4 text-sm text-ui-danger">{actionError}</p>}
        {readOnly && draft && <p className="mb-4 break-words text-sm font-semibold text-ui-heading">{draft.name || draft.id}</p>}
        <fieldset disabled={saving} className="contents">
            {error ? (
                <div><ErrorDisplay statusCode={error.code ?? 500} title={error.msg ?? "request failed"} raw={errorRaw(error.raw)} /><Button className="mt-3" onClick={() => setRetryNonce(value => value + 1)}>{t("common:action.retry")}</Button></div>
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
                <>
                {isNew && <SettingSelectVertical label={routingT("nodeTemplate")} value={chainTemplate(draft.chain)}
                    values={[...nodeTemplates.map(template => [routingT(`template.${template}`), template] as [string, string]), [routingT("template.custom"), "custom"]]}
                    onChange={template => {
                        if (template === 'custom') return;
                        const chain = templateChain(template as NodeTemplate);
                        const pristine = JSON.stringify(draft.chain) === JSON.stringify(createDefaultNode().chain);
                        if (pristine || window.confirm(routingT("templateReplaceConfirm"))) updateDraft({ chain });
                    }} />}
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
                {canEdit && <SwitchCard className="mt-3" label={routingT("useAsDefault")} checked={makeDefault} onCheckedChange={setMakeDefault} />}
                </>
            )}
        </fieldset>
    </>;
    const footer = <>
        <div>
            {onDelete && (
                <Dropdown>
                    <DropdownTrigger asChild>
                        <Button variant="outline-danger" disabled={saving || loading || Boolean(error)}><Trash size={16} className="mr-2" />{t("common:action.remove")}</Button>
                    </DropdownTrigger>
                    <DropdownContent>
                        <DropdownItem
                            className="font-bold text-ui-danger"
                            disabled={saving}
                            onSelect={() => {
                                void run(async () => { setActionError(''); await onDelete(); onHide(true); });
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
                <Button onClick={handleCopy} aria-label={t("common:action.copy")}>
                    {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                </Button>
            )}
            {presentation === "inline" && !isNew
                ? dirty && <Button onClick={discard} disabled={saving}>{routingT('discardChanges')}</Button>
                : <Button onClick={close} disabled={saving}>{t(presentation === "inline" ? "common:action.cancel" : "common:action.close")}</Button>}
            {canEdit && (
                <Button variant="primary" disabled={saving || loading || !!error} onClick={handleSave}>
                    {saving ? <Spinner size="sm" /> : t("common:action.save")}
                </Button>
            )}
        </div>
    </>;
    return <>
        {manualCopyModal}
        {presentation === "inline" ? <section aria-label={routingT('nodeSettings')} className="min-w-0">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-ui-heading">{routingT('nodeSettings')}</h3>{dirty && <span role="status" className="text-xs text-ui-warning">{routingT('unsavedChanges')}</span>}</header>
            <div className="min-w-0">{body}</div>
            <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ui-border/60 pt-4">{footer}</footer>
        </section> : <Modal open={show} onOpenChange={open => !open && close()}>
            <ModalContent width={960}>
                <ModalHeader closeButton className="border-b-0 pb-0"><ModalTitle className="font-bold">{title}</ModalTitle></ModalHeader>
                <ModalBody className="pt-2">{body}</ModalBody>
                <ModalFooter className="flex justify-between">{footer}</ModalFooter>
            </ModalContent>
        </Modal>}
    </>;
};

export const NodeModal = React.memo(NodeModalComponent);
