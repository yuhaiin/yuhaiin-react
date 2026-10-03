import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { collectPages } from "@/api/paging";
import { useTranslation } from 'react-i18next';

import { listNodes } from "@/api/nodes";
import { deletePublish, listPublishes, savePublish } from "@/api/subscriptions";
import { Button } from "@/component/v2/button";
import { CardRowList, IconBox, MainContainer, SettingsBox } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownLabel, DropdownTrigger } from "@/component/v2/dropdown";
import { SettingInputVertical } from "@/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { SwitchCard } from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Publish } from "@/contract/subscription";
import { defaultPublish } from "@/contract/subscription";
import { Check, Plus, Share2, Trash } from "lucide-react";
import { FC, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

const EditModal: FC<{
    show: boolean;
    isEdit: boolean;
    onHide: () => void;
    item: Publish;
    mutatePub: () => void;
}> = ({ show, isEdit, onHide, item, mutatePub }) => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data: nodes } = useSWR(show ? "/api/v2/nodes/all" : null, () => collectPages(listNodes));
    const { value: newItem, setValue: setNewItem, dirty, commit } = useEditorDraft(show ? item.name || "new" : null, item, defaultPublish);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(dirty, saving, onHide);

    const knownNodeIds = useMemo(() => new Set((nodes?.items ?? []).map(node => node.id)), [nodes]);
    const groupedNodes = useMemo(() => {
        const groups = new Map<string, NonNullable<typeof nodes>["items"]>();
        for (const node of nodes?.items ?? []) {
            const group = node.group || "manual";
            const items = groups.get(group);
            if (items) items.push(node);
            else groups.set(group, [node]);
        }
        return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [nodes]);
    const selected = new Set(newItem.points);

    const toggleNode = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setNewItem(prev => ({ ...prev, points: [...next] }));
    };

    const handleSave = () => {
        if (!newItem.name || saving) return;
        void run(async () => { await savePublish(newItem); commit(newItem); mutatePub(); onHide(); });
    };

    return (
        <Modal open={show} onOpenChange={(o) => { if (!o) close() }}>
            <ModalContent width={600}>
                <ModalHeader closeButton className="border-b pb-3">
                    <ModalTitle className="font-bold text-xl">{isEdit ? "Edit" : "Add"} {uiT("publishConfig")}</ModalTitle>
                </ModalHeader>
                <ModalBody className="py-4">
                    <fieldset disabled={saving} className="flex flex-col gap-4">
                        <SettingsBox>
                            <div className="mb-3 font-bold">{uiT("identity")}</div>
                            <div className="flex flex-col gap-3">
                                <SettingInputVertical label={uiT("configIdentifier")} value={newItem.name} onChange={(name) => setNewItem(prev => ({ ...prev, name }))} placeholder="internal-sub" />
                            </div>
                        </SettingsBox>
                        <SettingsBox>
                            <div className="mb-3 font-bold">{uiT("connection")}</div>
                            <div className="flex flex-col gap-3">
                                <SettingInputVertical label={uiT("displayAddress")} value={newItem.address} onChange={(address) => setNewItem(prev => ({ ...prev, address }))} placeholder="example.com:443" />
                                <SettingInputVertical label={uiT("path")} value={newItem.path} onChange={(path) => setNewItem(prev => ({ ...prev, path }))} placeholder="custom/path" />
                                <SettingInputVertical label={uiT("password")} value={newItem.password} onChange={(password) => setNewItem(prev => ({ ...prev, password }))} placeholder={uiT("optionalPassword")} />
                                <SwitchCard
                                    label={uiT("allowInsecureHttp")}
                                    checked={newItem.insecure}
                                    onCheckedChange={(insecure) => setNewItem(prev => ({ ...prev, insecure }))}
                                />
                            </div>
                        </SettingsBox>
                        <SettingsBox>
                            <div className="mb-3 font-bold">{uiT("nodes")}</div>
                            <div className="flex flex-col gap-3">
                                <Dropdown>
                                    <DropdownTrigger asChild>
                                        <Button variant="outline-secondary" className="w-full justify-between">
                                            {newItem.points.length} {uiT("selected")}</Button>
                                    </DropdownTrigger>
                                    <DropdownContent
                                        align="start"
                                        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[min(320px,calc(100vw-2rem))] max-w-[min(520px,calc(100vw-2rem))]"
                                    >
                                        {groupedNodes.map(([group, groupNodes]) => (
                                            <div key={group}>
                                                <DropdownLabel>{group}</DropdownLabel>
                                                {groupNodes.map(node => (
                                                    <DropdownCheckboxItem
                                                        key={node.id}
                                                        checked={selected.has(node.id)}
                                                        onCheckedChange={() => toggleNode(node.id)}
                                                    >
                                                        <span className="min-w-0 truncate">{node.name || node.id}</span>
                                                    </DropdownCheckboxItem>
                                                ))}
                                            </div>
                                        ))}
                                        {newItem.points.filter(id => !knownNodeIds.has(id)).length > 0 && (
                                            <div>
                                                <DropdownLabel>{uiT("unknown")}</DropdownLabel>
                                                {newItem.points.filter(id => !knownNodeIds.has(id)).map(id => (
                                                    <DropdownCheckboxItem key={id} checked onCheckedChange={() => toggleNode(id)}>
                                                        <span className="min-w-0 truncate font-mono">{id}</span>
                                                    </DropdownCheckboxItem>
                                                ))}
                                            </div>
                                        )}
                                    </DropdownContent>
                                </Dropdown>
                                <div className="flex flex-wrap gap-2">
                                    {newItem.points.length === 0 ? (
                                        <span className="text-sm text-ui-muted">{uiT("noNodesSelected")}</span>
                                    ) : newItem.points.map(id => {
                                        const node = (nodes?.items ?? []).find(item => item.id === id);
                                        return <span key={id} className="max-w-full break-all rounded-full border border-ui-border bg-ui-surface-muted px-3 py-1 text-sm">{node ? `${node.group || "manual"}/${node.name || node.id}` : id}</span>;
                                    })}
                                </div>
                            </div>
                        </SettingsBox>
                    </fieldset>
                </ModalBody>
                <ModalFooter className="border-t pt-3">
                    <Button variant="outline-secondary" onClick={close} disabled={saving}>{uiT("cancel")}</Button>
                    <Button onClick={handleSave} disabled={saving || !newItem.name}>
                        {saving ? <Spinner size="sm" /> : <><Check className="mr-1" size={16} /> {uiT("saveConfig")}</>}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function PublishPage() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/publishes", listPublishes);
    const [editing, setEditing] = useState<{ show: boolean; value: Publish; isEdit: boolean }>({ show: false, value: defaultPublish(), isEdit: false });
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; name: string }>({ show: false, name: "" });

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    const remove = (name: string) => {
        deletePublish(name)
            .then(() => mutate())
            .catch((err) => ctx.Error(`delete ${name} failed: ${err.msg ?? err}`));
    };

    return (
        <MainContainer>
            <ConfirmModal
                show={confirmDelete.show}
                title={uiT("deletePublish")}
                content={<p>{uiT("removePublishConfig")}<strong>{confirmDelete.name}</strong>?</p>}
                onOk={() => { remove(confirmDelete.name); setConfirmDelete({ show: false, name: "" }); }}
                onHide={() => setConfirmDelete({ show: false, name: "" })}
            />
            <EditModal
                show={editing.show}
                isEdit={editing.isEdit}
                item={editing.value}
                mutatePub={mutate}
                onHide={() => setEditing(prev => ({ ...prev, show: false }))}
            />
            <CardRowList
                layout="list"
                items={[...data.items].sort((a, b) => a.name.localeCompare(b.name))}
                getKey={(pub) => pub.name}
                onClickItem={(pub) => setEditing({ show: true, isEdit: true, value: pub })}
                renderListItem={(pub) => (
                    <div className="grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div className="min-w-0">
                            <div className="break-words font-semibold text-ui-heading sm:truncate">{pub.name}</div>
                            <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-ui-muted">
                                <span className="break-all sm:truncate" title={`${pub.address}/${pub.path}`}>{pub.address}/{pub.path}</span>
                                <span className="shrink-0">• {pub.points.length} {uiT("nodesLabel")}</span>
                            </div>
                        </div>
                        <Button className="self-end justify-self-end" variant="outline-danger" size="sm" title={uiT("deletePublishConfig")} aria-label={`Delete ${pub.name}`} onClick={(e) => { e.stopPropagation(); setConfirmDelete({ show: true, name: pub.name }); }}>
                            <Trash size={16} />
                        </Button>
                    </div>
                )}
                header={
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <IconBox icon={Share2} tone="violet" title={uiT("publish")} description={uiT("shareSelectedNodesAsPublishConfigs")} />
                        <Button size="sm" className="shrink-0 self-start sm:self-auto" onClick={() => setEditing({ show: true, isEdit: false, value: defaultPublish() })}>
                            <Plus className="mr-1" size={16} /> {uiT("add")}</Button>
                    </div>
                }
            />
        </MainContainer>
    );
}

export default PublishPage;
