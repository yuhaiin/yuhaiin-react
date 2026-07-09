"use client"

import { Button } from '@/component/v2/button';
import { CardList, IconBox, MainContainer, SettingLabel } from '@/component/v2/card';
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownGroup, DropdownLabel, DropdownTrigger } from '@/component/v2/dropdown';
import { SettingInputVertical } from "@/component/v2/forms";
import { Input } from '@/component/v2/input';
import { InputGroup } from '@/component/v2/inputgroup';
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { Switch } from '@/component/v2/switch';
import { create, toBinary } from "@/common/plain";
import { StringValueSchema } from "@/common/plain";
import { Check, ChevronDown, Clipboard, ClipboardCheck, Plus, Share2, Trash } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import { FetchHTTP, useHttpSWR } from '../../../common/http';
import Error from '../../../component/Error';
import { useClipboard } from '../../../component/v2/clipboard';
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading from "../../../component/v2/loading";
import { GlobalToastContext } from "../../../component/v2/toast";
import { node, subscribe } from "@/common/api";
import { Publish, PublishSchema, YuhaiinUrl_RemoteSchema, YuhaiinUrlSchema } from "../../schema/node/subscribe";

const emptyPublish = (): Publish => create(PublishSchema, {
    name: "",
    address: "",
    insecure: false,
    path: "",
    password: "",
    points: [],
});

const normalizePublish = (value?: Publish): Publish => ({
    ...emptyPublish(),
    ...(value ?? {}),
    points: Array.isArray(value?.points) ? value.points : [],
});

const EditModal: FC<{
    show: boolean,
    isEdit: boolean,
    onHide: () => void,
    item: Publish,
    configName: string,
    nodes: any,
    mutatePub: () => void,
}> = ({ show, isEdit, onHide, item, nodes, configName: cn, mutatePub }) => {
    const ctx = useContext(GlobalToastContext);

    const [newItem, setNewItem] = useState(() => normalizePublish(item));
    const [configName, setConfigName] = useState(cn);

    useEffect(() => {
        setNewItem(normalizePublish(item))
    }, [item])

    useEffect(() => {
        setConfigName(cn)
    }, [cn])

    const [saving, setSaving] = useState(false);

    const handleNodeSelect = (hash: string) => {
        setNewItem(prev => {
            const points = Array.isArray(prev.points) ? prev.points : [];
            return { ...prev, points: points.includes(hash) ? points.filter(h => h !== hash) : [...points, hash] }
        });
    };

    const handleSave = () => {
        setSaving(true);
        const req = { name: newItem.name, publish: newItem };

        FetchHTTP(subscribe.method.save_publish, req)
            .then(({ error }) => {
                if (error) {
                    ctx.Error(`Failed to save: ${error.msg}`);
                } else {
                    ctx.Info("Saved successfully.");
                    mutatePub();
                    onHide();
                }
            })
            .finally(() => setSaving(false));
    };

    return (
        <Modal open={show} onOpenChange={(o) => { if (!o) onHide() }}>
            <ModalContent style={{ maxWidth: '600px' }}>
                <ModalHeader closeButton className="border-b pb-3">
                    <ModalTitle className="font-bold text-xl">{isEdit ? 'Edit' : 'Add'} Publish Config</ModalTitle>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="flex flex-col gap-4">
                        {/* 1. Identity Config */}
                        <div className="flex flex-col gap-3">
                            <SettingInputVertical
                                label="Config Identifier"
                                value={configName}
                                onChange={setConfigName}
                                placeholder="e.g., internal-sub"
                                className={isEdit ? "opacity-75" : ""}
                            />
                            <SettingInputVertical
                                label="Display Name"
                                value={newItem.name}
                                onChange={v => setNewItem({ ...newItem, name: v })}
                                placeholder="e.g., My Subscription"
                            />
                        </div>

                        {/* 2. Connection Settings */}
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-opacity-50 border-gray-200 dark:border-gray-700">
                            <h6 className="mb-3 uppercase text-gray-500" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>Connection Details</h6>
                            <div className="flex flex-col gap-3">
                                <SettingInputVertical
                                    label="Public Address"
                                    value={newItem.address}
                                    onChange={v => setNewItem({ ...newItem, address: v })}
                                    placeholder="example.com:443"
                                />

                                <Switch
                                    label="Allow Insecure (HTTP)"
                                    checked={newItem.insecure}
                                    onCheckedChange={(e) => setNewItem({ ...newItem, insecure: e })}
                                />

                                <SettingInputVertical
                                    label="Path"
                                    value={newItem.path}
                                    onChange={v => setNewItem({ ...newItem, path: v })}
                                    placeholder="custom/path"
                                />

                                <SettingInputVertical
                                    label="Password"
                                    value={newItem.password}
                                    onChange={v => setNewItem({ ...newItem, password: v })}
                                    placeholder="Optional password"
                                />
                            </div>
                        </div>

                        {/* 3. Node Selection */}
                        <div>
                            <SettingLabel>Select Nodes to Publish</SettingLabel>
                            <Dropdown modal={false}>
                                <DropdownTrigger asChild>
                                    <Button className="w-full flex justify-between items-center py-2" variant="outline-secondary">
                                        <span className="font-medium">{newItem.points.length > 0 ? `${newItem.points.length} nodes selected` : 'Select nodes...'}</span>
                                        <ChevronDown size={16} />
                                    </Button>
                                </DropdownTrigger>

                                <DropdownContent className="w-full shadow-lg border-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {(nodes.groups ?? []).map((g: any) => (
                                        <DropdownGroup key={g.name}>
                                            <DropdownLabel className="text-blue-500 sticky top-0 bg-sidebar-bg">{g.name}</DropdownLabel>
                                            {(g.nodes ?? []).map((n: any) => (
                                                <DropdownCheckboxItem
                                                    key={n.hash}
                                                    checked={newItem.points.includes(n.hash)}
                                                    onCheckedChange={() => handleNodeSelect(n.hash)}
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    {n.name}
                                                </DropdownCheckboxItem>
                                            ))}
                                        </DropdownGroup>
                                    ))}
                                </DropdownContent>
                            </Dropdown>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="border-t pt-3">
                    <ModalClose asChild>
                        <Button variant="outline-secondary">Cancel</Button>
                    </ModalClose>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : <><Check className="mr-1" size={16} /> Save Config</>}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// --- Component: Individual Publish Item ---
const PublishItem: FC<{
    configKey: string,
    pub: Publish,
    copyAction: (url: string) => void,
    onDelete: () => void
    copied: boolean
}> = ({ configKey, pub, copyAction, onDelete, copied }) => {
    // Generate URL
    const yuhaiinUrlRemote = create(YuhaiinUrl_RemoteSchema, {
        publish: create(PublishSchema, { ...pub, points: [] }),
    });
    const yuhaiinUrl = create(YuhaiinUrlSchema, {
        name: pub.name,
        url: { value: yuhaiinUrlRemote, case: 'remote' },
    });
    const encodedUrl = `yuhaiin://${btoa(String.fromCharCode(...toBinary(YuhaiinUrlSchema, yuhaiinUrl))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;

    return (
        <>
            <div className="flex items-center grow overflow-hidden gap-3 w-full md:w-auto">
                <div className="flex flex-col overflow-hidden">
                    <span className="font-bold">{configKey}</span>
                    <small className="text-gray-500 truncate opacity-75">{pub.address}/{pub.path}</small>
                </div>
            </div>

            {/* URL Copy Group */}
            <InputGroup
                className="md:mx-2 w-full"
                style={{ maxWidth: '400px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <Input
                    readOnly
                    value={encodedUrl}
                    size='sm'
                    className="bg-gray-900/10 dark:bg-white/10 border-gray-500/25 font-mono flex-1 w-full min-w-0"
                    style={{ fontSize: '0.6rem' }}
                />
                <Button
                    size='icon'
                    onClick={() => copyAction(encodedUrl)}
                >
                    {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                </Button>
            </InputGroup>


            <div className="flex gap-2 items-center ml-2 shrink-0">
                <Button size='sm' variant="outline-danger" onClick={(e) => { e.stopPropagation(); onDelete() }} >
                    <Trash size={16} />
                    <span className="hidden sm:inline ml-2">Delete</span>
                </Button>
            </div >
        </>
    );
};

function PublishPage() {
    const ctx = useContext(GlobalToastContext);
    const { data: publishes, error: errPub, isLoading: loadingPub, mutate: mutatePub } = useHttpSWR(subscribe.method.list_publish);
    const { data: nodes, error: errNodes, isLoading: loadingNodes } = useHttpSWR(node.method.list);

    const [modalState, setModalState] = useState({ show: false, isEdit: false, configName: '', item: emptyPublish() });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, name: '' });

    const { copy, copied, manualCopyModal } = useClipboard({
        onCopyError: (e) => ctx.Error(e.message),
        usePromptAsFallback: true,
    });

    useEffect(() => { if (copied) ctx.Info("URL copied to clipboard!"); }, [copied, ctx]);

    if (errPub) return <Error statusCode={errPub.code} title={errPub.msg} />
    if (errNodes) return <Error statusCode={errNodes.code} title={errNodes.msg} />
    if (loadingPub || loadingNodes || !publishes || !nodes) return <Loading />

    const publishEntries = Object.entries(publishes.publishes ?? {}).map(([name, pub]) => [name, normalizePublish(pub as Publish)] as const);

    const handleRemove = (name: string) => {
        FetchHTTP(subscribe.method.remove_publish, create(StringValueSchema, { value: name })).then(({ error }) => {
            if (error) ctx.Error(`Failed to remove: ${error.msg}`);
            else { ctx.Info("Removed successfully."); mutatePub(); }
        });
    };

    return (
        <>
            {manualCopyModal}

            <EditModal
                show={modalState.show}
                isEdit={modalState.isEdit}
                onHide={() => setModalState({ ...modalState, show: false })}
                item={modalState.item}
                configName={modalState.configName}
                nodes={nodes}
                mutatePub={mutatePub}
            />

            <ConfirmModal
                show={confirmDelete.show}
                title={<p>Delete publish configuration <strong>{confirmDelete.name}</strong>?</p>}
                onHide={() => setConfirmDelete(prev => { return { ...prev, show: false } })}
                onOk={() => { handleRemove(confirmDelete.name); setConfirmDelete({ show: false, name: '' }); }}
            />

            <MainContainer>
                <CardList
                    items={publishEntries}
                    renderListItem={([name, pub]) =>
                        <PublishItem
                            key={name}
                            configKey={name}
                            pub={pub}
                            copyAction={copy}
                            copied={copied}
                            onDelete={() => setConfirmDelete({ show: true, name: name })}
                        />
                    }
                    onClickItem={([name, pub]) => setModalState({ show: true, isEdit: true, configName: name, item: normalizePublish(pub) })}
                    header={
                        <>
                            <div className="flex items-center">
                                <IconBox icon={Share2} color="#8b5cf6" />
                                <div>
                                    <h5 className="mb-0 font-bold">Publishing</h5>
                                    <small className="text-gray-500">Generate subscription URLs for remote clients</small>
                                </div>
                            </div>
                            <Button onClick={() => setModalState({ show: true, isEdit: false, configName: '', item: emptyPublish() })}>
                                <Plus className="mr-1" size={16} /> Add
                            </Button>
                        </>
                    }
                />
            </MainContainer>
        </>
    )
}

export default PublishPage;
