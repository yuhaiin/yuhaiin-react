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
import { create, toBinary } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Check, ChevronDown, Clipboard, ClipboardCheck, Plus, Share2, Trash } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import { FetchProtobuf, useProtoSWR } from '../../../common/proto';
import Error from '../../../component/Error';
import { useClipboard } from '../../../component/v2/clipboard';
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading from "../../../component/v2/loading";
import { GlobalToastContext } from "../../../component/v2/toast";
import { node, SavePublishRequestSchema, subscribe } from "../../pbes/api/node_pb";
import { Publish, PublishSchema, YuhaiinUrl_RemoteSchema, YuhaiinUrlSchema } from "../../pbes/node/subscribe_pb";

const EditModal: FC<{
    show: boolean,
    isEdit: boolean,
    onHide: () => void,
    item?: Publish,
    configName?: string,
    nodes: any,
    mutatePub: () => void,
}> = ({ show, isEdit, onHide, item, configName: initialConfigName, nodes, mutatePub }) => {
    const ctx = useContext(GlobalToastContext);

    const [newItem, setNewItem] = useState(item ? create(PublishSchema, item) : create(PublishSchema, {
        name: "",
        path: "",
        password: "",
        points: [],
        address: typeof window !== 'undefined' ? window.location.host : '',
        insecure: typeof window !== 'undefined' ? window.location.protocol !== 'https:' : true,
    }));

    const [configName, setConfigName] = useState(initialConfigName || "");
    const [selectedNodes, setSelectedNodes] = useState<string[]>(item?.points || []);
    const [saving, setSaving] = useState(false);

    const handleNodeSelect = (hash: string) => {
        setSelectedNodes(prev =>
            prev.includes(hash) ? prev.filter(h => h !== hash) : [...prev, hash]
        );
    };

    const handleSave = () => {
        if (!configName || !newItem.name) {
            ctx.Error("Configuration Name and Subscription Name are required.");
            return;
        }

        setSaving(true);
        const req = create(SavePublishRequestSchema, {
            name: configName,
            publish: create(PublishSchema, { ...newItem, points: selectedNodes }),
        });

        FetchProtobuf(subscribe.method.save_publish, req)
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
                <ModalHeader closeButton className="border-bottom pb-3">
                    <ModalTitle className="fw-bold fs-5">{isEdit ? 'Edit' : 'Add'} Publish Config</ModalTitle>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="d-flex flex-column gap-4">
                        {/* 1. Identity Config */}
                        <div className="d-flex flex-column gap-3">
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
                        <div className="p-3 bg-light rounded-3 border border-opacity-50">
                            <h6 className="mb-3 text-uppercase text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>Connection Details</h6>
                            <div className="d-flex flex-column gap-3">
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
                                    <Button className="w-100 d-flex justify-content-between align-items-center py-2" variant="outline-secondary">
                                        <span className="fw-medium">{selectedNodes.length > 0 ? `${selectedNodes.length} nodes selected` : 'Select nodes...'}</span>
                                        <ChevronDown />
                                    </Button>
                                </DropdownTrigger>

                                <DropdownContent className="w-100 shadow-lg border-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {nodes.groups.map((g: any) => (
                                        <DropdownGroup key={g.name}>
                                            <DropdownLabel className="text-primary sticky-top bg-white">{g.name}</DropdownLabel>
                                            {g.nodes.map((n: any) => (
                                                <DropdownCheckboxItem
                                                    key={n.hash}
                                                    checked={selectedNodes.includes(n.hash)}
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
                <ModalFooter className="border-top pt-3">
                    <ModalClose asChild>
                        <Button variant="outline-secondary">Cancel</Button>
                    </ModalClose>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : <><Check className="me-1" /> Save Config</>}
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
            <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3 w-100 w-md-auto">
                <div className="d-flex flex-column overflow-hidden">
                    <span className="fw-bold">{configKey}</span>
                    <small className="text-muted text-truncate opacity-75">{pub.address}/{pub.path}</small>
                </div>
            </div>

            {/* URL Copy Group */}
            <InputGroup
                className="mx-md-2"
                style={{ maxWidth: '400px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <Input
                    readOnly
                    value={encodedUrl}
                    size='sm'
                    className="bg-dark bg-opacity-10 border-secondary border-opacity-25 font-monospace"
                    style={{ fontSize: '0.6rem' }}
                />
                <Button
                    size='icon'
                    onClick={() => copyAction(encodedUrl)}
                >
                    {copied ? <ClipboardCheck /> : <Clipboard />}
                </Button>
            </InputGroup>


            <div className="d-flex gap-2 align-items-center ms-2 flex-shrink-0">
                <Button size='sm' variant="outline-danger" onClick={(e) => { e.stopPropagation(); onDelete() }} >
                    <Trash />
                    <span className="d-none d-sm-inline ms-2">Delete</span>
                </Button>
            </div >
        </>
    );
};

function PublishPage() {
    const ctx = useContext(GlobalToastContext);
    const { data: publishes, error: errPub, isLoading: loadingPub, mutate: mutatePub } = useProtoSWR(subscribe.method.list_publish);
    const { data: nodes, error: errNodes, isLoading: loadingNodes } = useProtoSWR(node.method.list);

    const [modalState, setModalState] = useState({ show: false, isEdit: false, configName: '', item: undefined as Publish | undefined });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, name: '' });

    const { copy, copied } = useClipboard({
        onCopyError: (e) => ctx.Error(e.message),
        usePromptAsFallback: true,
    });

    useEffect(() => { if (copied) ctx.Info("URL copied to clipboard!"); }, [copied, ctx]);

    if (errPub) return <Error statusCode={errPub.code} title={errPub.msg} />
    if (errNodes) return <Error statusCode={errNodes.code} title={errNodes.msg} />
    if (loadingPub || loadingNodes || !publishes || !nodes) return <Loading />

    const handleRemove = (name: string) => {
        FetchProtobuf(subscribe.method.remove_publish, create(StringValueSchema, { value: name })).then(({ error }) => {
            if (error) ctx.Error(`Failed to remove: ${error.msg}`);
            else { ctx.Info("Removed successfully."); mutatePub(); }
        });
    };

    return (
        <>
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
                    items={Object.entries(publishes.publishes)}
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
                    onClickItem={([name, pub]) => setModalState({ show: true, isEdit: true, configName: name, item: pub })}
                    header={
                        <>
                            <div className="d-flex align-items-center">
                                <IconBox icon={Share2} color="#8b5cf6" />
                                <div>
                                    <h5 className="mb-0 fw-bold">Publishing</h5>
                                    <small className="text-muted">Generate subscription URLs for remote clients</small>
                                </div>
                            </div>
                            <Button onClick={() => setModalState({ show: true, isEdit: false, configName: '', item: undefined })}>
                                <Plus className="me-1" /> Add
                            </Button>
                        </>
                    }
                />
            </MainContainer>
        </>
    )
}

export default PublishPage;