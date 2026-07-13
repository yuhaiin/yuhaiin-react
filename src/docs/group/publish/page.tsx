"use client"

import { listNodes } from "@/api/nodes";
import { deletePublish, listPublishes, savePublish } from "@/api/subscriptions";
import { Button } from "@/component/v2/button";
import { CardList, IconBox, MainContainer, SettingsBox } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownLabel, DropdownTrigger } from "@/component/v2/dropdown";
import { SettingInputVertical } from "@/component/v2/forms";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { SwitchCard } from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Publish } from "@/contract/subscription";
import { defaultPublish } from "@/contract/subscription";
import { Check, Plus, Share2, Trash } from "lucide-react";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Error from "../../../component/Error";
import Loading from "../../../component/v2/loading";

const EditModal: FC<{
    show: boolean;
    isEdit: boolean;
    onHide: () => void;
    item: Publish;
    mutatePub: () => void;
}> = ({ show, isEdit, onHide, item, mutatePub }) => {
    const ctx = useContext(GlobalToastContext);
    const { data: nodes } = useSWR("/api/v2/nodes/publish-options", () => listNodes({ page: 1, pageSize: 10000 }));
    const [newItem, setNewItem] = useState(() => ({ ...defaultPublish(item.name), ...item }));
    const [saving, setSaving] = useState(false);

    useEffect(() => setNewItem({ ...defaultPublish(item.name), ...item }), [item]);

    const knownNodeIds = useMemo(() => new Set((nodes?.items ?? []).map(node => node.id)), [nodes]);
    const groupedNodes = useMemo(() => {
        const groups = new Map<string, NonNullable<typeof nodes>["items"]>();
        for (const node of nodes?.items ?? []) {
            const group = node.group || "manual";
            groups.set(group, [...(groups.get(group) ?? []), node]);
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
        if (!newItem.name) return;
        setSaving(true);
        savePublish(newItem)
            .then(() => {
                ctx.Info("Saved successfully.");
                mutatePub();
                onHide();
            })
            .catch((err) => ctx.Error(`Failed to save: ${err.msg ?? err}`))
            .finally(() => setSaving(false));
    };

    return (
        <Modal open={show} onOpenChange={(o) => { if (!o) onHide() }}>
            <ModalContent style={{ maxWidth: "600px" }}>
                <ModalHeader closeButton className="border-b pb-3">
                    <ModalTitle className="font-bold text-xl">{isEdit ? "Edit" : "Add"} Publish Config</ModalTitle>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="flex flex-col gap-4">
                        <SettingsBox>
                            <div className="mb-3 font-bold">Identity</div>
                            <div className="flex flex-col gap-3">
                                <SettingInputVertical label="Config Identifier" value={newItem.name} onChange={(name) => setNewItem(prev => ({ ...prev, name }))} placeholder="internal-sub" />
                            </div>
                        </SettingsBox>
                        <SettingsBox>
                            <div className="mb-3 font-bold">Connection</div>
                            <div className="flex flex-col gap-3">
                                <SettingInputVertical label="Display Address" value={newItem.address} onChange={(address) => setNewItem(prev => ({ ...prev, address }))} placeholder="example.com:443" />
                                <SettingInputVertical label="Path" value={newItem.path} onChange={(path) => setNewItem(prev => ({ ...prev, path }))} placeholder="custom/path" />
                                <SettingInputVertical label="Password" value={newItem.password} onChange={(password) => setNewItem(prev => ({ ...prev, password }))} placeholder="Optional password" />
                                <SwitchCard
                                    label="Allow Insecure (HTTP)"
                                    checked={newItem.insecure}
                                    onCheckedChange={(insecure) => setNewItem(prev => ({ ...prev, insecure }))}
                                />
                            </div>
                        </SettingsBox>
                        <SettingsBox>
                            <div className="mb-3 font-bold">Nodes</div>
                            <div className="flex flex-col gap-3">
                                <Dropdown>
                                    <DropdownTrigger asChild>
                                        <Button variant="outline-secondary" className="w-full justify-between">
                                            {newItem.points.length} selected
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownContent align="start" className="min-w-[320px] max-w-[520px]">
                                        {groupedNodes.map(([group, groupNodes]) => (
                                            <div key={group}>
                                                <DropdownLabel>{group}</DropdownLabel>
                                                {groupNodes.map(node => (
                                                    <DropdownCheckboxItem
                                                        key={node.id}
                                                        checked={selected.has(node.id)}
                                                        onCheckedChange={() => toggleNode(node.id)}
                                                    >
                                                        <span className="truncate">{node.name || node.id}</span>
                                                    </DropdownCheckboxItem>
                                                ))}
                                            </div>
                                        ))}
                                        {newItem.points.filter(id => !knownNodeIds.has(id)).length > 0 && (
                                            <div>
                                                <DropdownLabel>Unknown</DropdownLabel>
                                                {newItem.points.filter(id => !knownNodeIds.has(id)).map(id => (
                                                    <DropdownCheckboxItem key={id} checked onCheckedChange={() => toggleNode(id)}>
                                                        <span className="truncate font-mono">{id}</span>
                                                    </DropdownCheckboxItem>
                                                ))}
                                            </div>
                                        )}
                                    </DropdownContent>
                                </Dropdown>
                                <div className="flex flex-wrap gap-2">
                                    {newItem.points.length === 0 ? (
                                        <span className="text-sm text-ui-muted">No nodes selected.</span>
                                    ) : newItem.points.map(id => {
                                        const node = (nodes?.items ?? []).find(item => item.id === id);
                                        return <span key={id} className="rounded-full border border-ui-border bg-ui-surface-muted px-3 py-1 text-sm">{node ? `${node.group || "manual"}/${node.name || node.id}` : id}</span>;
                                    })}
                                </div>
                            </div>
                        </SettingsBox>
                    </div>
                </ModalBody>
                <ModalFooter className="border-t pt-3">
                    <ModalClose asChild><Button variant="outline-secondary">Cancel</Button></ModalClose>
                    <Button onClick={handleSave} disabled={saving || !newItem.name}>
                        {saving ? <Spinner size="sm" /> : <><Check className="mr-1" size={16} /> Save Config</>}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function PublishPage() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/publishes", listPublishes);
    const [editing, setEditing] = useState<{ show: boolean; value: Publish; isEdit: boolean }>({ show: false, value: defaultPublish(), isEdit: false });
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; name: string }>({ show: false, name: "" });

    if (error) return <Error statusCode={error.code} title={error.msg} />
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
                title="Delete Publish"
                content={<p>Remove publish config <strong>{confirmDelete.name}</strong>?</p>}
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
            <CardList
                items={[...data.items].sort((a, b) => a.name.localeCompare(b.name))}
                onClickItem={(pub) => setEditing({ show: true, isEdit: true, value: pub })}
                renderListItem={(pub) => (
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-col overflow-hidden">
                            <span className="font-bold">{pub.name}</span>
                            <small className="text-ui-muted truncate">{pub.address}/{pub.path} • {pub.points.length} nodes</small>
                        </div>
                        <Button className="self-end sm:self-auto" variant="outline-danger" size="sm" onClick={(e) => { e.stopPropagation(); setConfirmDelete({ show: true, name: pub.name }); }}>
                            <Trash size={16} />
                        </Button>
                    </div>
                )}
                header={
                    <>
                        <div className="flex items-center">
                            <IconBox icon={Share2} tone="violet" />
                            <div>
                                <h5 className="mb-0 font-bold">Publish</h5>
                                <small className="text-ui-muted">Share selected nodes as publish configs</small>
                            </div>
                        </div>
                        <Button onClick={() => setEditing({ show: true, isEdit: false, value: defaultPublish() })}>
                            <Plus className="mr-1" size={16} /> Add
                        </Button>
                    </>
                }
            />
        </MainContainer>
    );
}

export default PublishPage;
