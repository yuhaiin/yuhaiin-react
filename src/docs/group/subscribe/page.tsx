"use client"

import { deleteSubscriptions, listSubscriptions, saveSubscriptions, updateSubscriptions } from "@/api/subscriptions";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardList, IconBox, IconBoxRounded, MainContainer, SettingsBox } from "@/component/v2/card";
import { ConfirmModal } from "@/component/v2/confirm";
import { SettingInputVertical } from "@/component/v2/forms";
import { SettingSelectVertical } from "@/component/v2/select";
import Loading, { Error } from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Link } from "@/contract/subscription";
import { CloudDownload, Plus, RefreshCw, Rss, Trash } from "lucide-react";
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { useClipboard } from "../../../component/v2/clipboard";

const subscriptionTypes = ["reserve", "trojan", "vmess", "shadowsocks", "shadowsocksr"];

const LinkItem: FC<{ linkData: Link; isUpdating: boolean; onUpdate: () => void; onDelete: () => void }> = ({ linkData, isUpdating, onUpdate, onDelete }) => {
    return (
        <div className="grid flex-1 gap-3 overflow-hidden sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                <IconBoxRounded icon={Rss} color="#0d6efd" style={{ width: 40, height: 40, flexShrink: 0 }} />
                <div className="min-w-0 overflow-hidden">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="font-bold truncate">{linkData.name}</div>
                        <Badge variant="secondary" pill className="uppercase">{linkData.type || "reserve"}</Badge>
                    </div>
                    <small className="text-gray-500 truncate block">{linkData.url}</small>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onUpdate() }} disabled={isUpdating}>
                    {isUpdating ? <Spinner size="sm" /> : <RefreshCw size={16} />}
                    <span className="hidden sm:inline ml-2">Update</span>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                    <Trash size={16} />
                    <span className="hidden sm:inline ml-2">Delete</span>
                </Button>
            </div>
        </div>
    );
};

const AddLinkModal: FC<{ show: boolean; onHide: () => void; onSave: (link: Link) => void }> = ({ show, onHide, onSave }) => {
    const [newItem, setNewItem] = useState<Link>({ name: "", url: "", type: "reserve" });
    const handleSave = () => {
        if (!newItem.name || !newItem.url) return;
        onSave(newItem);
        setNewItem({ name: "", url: "", type: "reserve" });
        onHide();
    };
    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent>
                <ModalHeader closeButton className="border-b-0 pb-0"><ModalTitle className="font-bold">Add Subscription</ModalTitle></ModalHeader>
                <ModalBody className="pt-2">
                    <SettingsBox>
                        <div className="flex flex-col gap-3">
                            <SettingInputVertical label="Name" value={newItem.name} placeholder="e.g., My Server" onChange={(name) => setNewItem(prev => ({ ...prev, name }))} />
                            <SettingSelectVertical label="Type" value={newItem.type || "reserve"} values={subscriptionTypes} onChange={(type) => setNewItem(prev => ({ ...prev, type }))} />
                            <SettingInputVertical label="Subscription URL" value={newItem.url} placeholder="https://example.com/sub/..." onChange={(url) => setNewItem(prev => ({ ...prev, url }))} />
                        </div>
                    </SettingsBox>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onHide}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!newItem.name || !newItem.url}><Plus className="me-1" size={16} /> Add</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function Subscribe() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/subscriptions", listSubscriptions);
    const [updating, setUpdating] = useState<Record<string, boolean>>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });

    useEffect(() => { if (copied) ctx.Info("Copied to clipboard") }, [copied, ctx]);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />

    const handleUpdate = (name: string) => {
        setUpdating(prev => ({ ...prev, [name]: true }));
        updateSubscriptions([name])
            .then(() => {
                ctx.Info("Update successfully");
                void mutate();
            })
            .catch((err) => ctx.Error(`Update failed ${err.code ?? 500}| ${err.msg ?? err}`))
            .finally(() => setUpdating(prev => ({ ...prev, [name]: false })));
    };

    const handleDelete = (name: string) => {
        deleteSubscriptions([name])
            .then(() => mutate())
            .catch((err) => ctx.Error(`delete ${name} failed, ${err.code ?? 500}| ${err.msg ?? err}`));
    };

    const handleAdd = (item: Link) => {
        saveSubscriptions([item])
            .then(() => mutate())
            .catch((err) => ctx.Error(`save link ${item.url} failed, ${err.code ?? 500}| ${err.msg ?? err}`));
    };

    return (
        <MainContainer>
            {manualCopyModal}
            <ConfirmModal
                show={confirmDelete.show}
                title="Delete Subscription"
                content={<p>Are you sure you want to remove subscription <strong>{confirmDelete.name}</strong>?</p>}
                onOk={() => { handleDelete(confirmDelete.name); setConfirmDelete({ show: false, name: "" }); }}
                onHide={() => setConfirmDelete({ show: false, name: "" })}
            />
            <AddLinkModal show={showAddModal} onHide={() => setShowAddModal(false)} onSave={handleAdd} />
            <CardList
                items={[...data.items].sort((a, b) => a.name.localeCompare(b.name))}
                onClickItem={(v) => copy(v.url)}
                renderListItem={(value) => (
                    <LinkItem
                        key={value.name}
                        linkData={value}
                        isUpdating={!!updating[value.name]}
                        onUpdate={() => handleUpdate(value.name)}
                        onDelete={() => setConfirmDelete({ show: true, name: value.name })}
                    />
                )}
                header={
                    <>
                        <div className="flex items-center">
                            <IconBox icon={CloudDownload} color="#0ea5e9" />
                            <div>
                                <h5 className="mb-0 font-bold">Subscriptions</h5>
                                <small className="text-gray-500">Manage remote configuration links</small>
                            </div>
                        </div>
                        <Button onClick={() => setShowAddModal(true)}><Plus className="me-1" size={16} /> Add</Button>
                    </>
                }
            />
        </MainContainer>
    );
}

export default Subscribe;
