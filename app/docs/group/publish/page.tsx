"use client"

import { CardList, IconBox, MainContainer, SettingLabel, SettingsBox } from '@/app/component/cardlist';
import { create, toBinary } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import React, { FC, useContext, useEffect, useState } from "react";
import { Button, Dropdown, Form, InputGroup, Modal, Spinner } from "react-bootstrap";
import { useClipboard } from '../../../component/clipboard';
import { ConfirmModal } from "../../../component/confirm";
import Loading from "../../../component/loading";
import { SettingInputVertical } from "../../../component/switch";
import { GlobalToastContext } from "../../../component/toast";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
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
        <Modal show={show} onHide={onHide} centered scrollable size="lg">
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fw-bold">{isEdit ? 'Edit' : 'Add'} Publish Config</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="d-flex flex-column gap-3">
                    {/* Basic Info Group */}
                    <SettingsBox>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <SettingInputVertical
                                    label="Config Identifier"
                                    value={configName}
                                    onChange={setConfigName}
                                    placeholder="e.g., internal-sub"
                                    className={isEdit ? "opacity-75" : ""} // Dim if disabled
                                />
                            </div>
                            <div className="col-md-6">
                                <SettingInputVertical
                                    label="Display Name"
                                    value={newItem.name}
                                    onChange={v => setNewItem({ ...newItem, name: v })}
                                    placeholder="e.g., My Subscription"
                                />
                            </div>
                        </div>
                    </SettingsBox>

                    {/* Server Connection Group */}
                    <SettingsBox>
                        <div className="row g-3">
                            <div className="col-md-8">
                                <SettingInputVertical
                                    label="Public Address"
                                    value={newItem.address}
                                    onChange={v => setNewItem({ ...newItem, address: v })}
                                    placeholder="example.com:443"
                                />
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <Form.Check
                                    type="switch"
                                    label="Allow Insecure"
                                    checked={newItem.insecure}
                                    onChange={(e) => setNewItem({ ...newItem, insecure: e.target.checked })}
                                    className="mb-2"
                                />
                            </div>
                            <div className="col-md-6">
                                <SettingInputVertical
                                    label="Path"
                                    value={newItem.path}
                                    onChange={v => setNewItem({ ...newItem, path: v })}
                                    placeholder="custom/path"
                                />
                            </div>
                            <div className="col-md-6">
                                <SettingInputVertical
                                    label="Password"
                                    value={newItem.password}
                                    onChange={v => setNewItem({ ...newItem, password: v })}
                                    placeholder="Optional password"
                                />
                            </div>
                        </div>
                    </SettingsBox>

                    {/* Node Selection */}
                    <SettingsBox>
                        <SettingLabel>Select Nodes to Publish</SettingLabel>
                        <Dropdown className="w-100 mt-1">
                            <Dropdown.Toggle variant="outline-secondary" className="w-100 d-flex justify-content-between align-items-center">
                                <span>{selectedNodes.length} Nodes Selected</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100 shadow-lg border-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {nodes.groups.map((g: any) => (
                                    <React.Fragment key={g.name}>
                                        <Dropdown.Header className="bg-light bg-opacity-10 py-2">{g.name}</Dropdown.Header>
                                        {g.nodes.map((n: any) => (
                                            <div key={n.hash} className="px-3 py-1 dropdown-item" onClick={(e) => { e.stopPropagation(); handleNodeSelect(n.hash); }}>
                                                <Form.Check
                                                    type="checkbox"
                                                    label={n.name}
                                                    checked={selectedNodes.includes(n.hash)}
                                                    onChange={() => { }} // Handled by parent div
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </SettingsBox>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border" /> : <><i className="bi bi-check-lg me-1"></i> Save Config</>}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

// --- Component: Individual Publish Item ---
const PublishItem: FC<{
    configKey: string,
    pub: Publish,
    copyAction: (url: string) => void,
    onDelete: () => void
}> = ({ configKey, pub, copyAction, onDelete }) => {
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
            <InputGroup size="sm" className="mx-md-2" style={{ maxWidth: '400px' }}>
                <Form.Control
                    readOnly
                    value={encodedUrl}
                    className="bg-dark bg-opacity-10 border-secondary border-opacity-25 font-monospace"
                    style={{ fontSize: '0.75rem' }}
                />
                <Button variant="outline-secondary" onClick={() => copyAction(encodedUrl)}>
                    <i className="bi bi-clipboard"></i>
                </Button>
            </InputGroup>

            {/* Actions */}

            <div className="d-flex gap-2 align-items-center ms-auto ms-md-0 flex-shrink-0">
                <Button variant="outline-danger" size="sm" onClick={onDelete}>
                    <i className="bi bi-trash"></i>
                    <span className="d-none d-sm-inline ms-2">Delete</span>
                </Button>
            </div>
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
                content={<p>Delete publish configuration <strong>{confirmDelete.name}</strong>?</p>}
                onHide={() => setConfirmDelete({ show: false, name: '' })}
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
                            onDelete={() => setConfirmDelete({ show: true, name: name })}
                        />
                    }
                    onClickItem={([name, pub]) => setModalState({ show: true, isEdit: true, configName: name, item: pub })}
                    header={
                        <>
                            <div className="d-flex align-items-center">
                                <IconBox icon="share" color="#8b5cf6" />
                                <div>
                                    <h5 className="mb-0 fw-bold">Publishing</h5>
                                    <small className="text-muted">Generate subscription URLs for remote clients</small>
                                </div>
                            </div>
                            <Button variant="primary" size="sm" onClick={() => setModalState({ show: true, isEdit: false, configName: '', item: undefined })}>
                                <i className="bi bi-plus-lg me-1"></i> Add
                            </Button>
                        </>
                    }
                />
            </MainContainer>
        </>
    )
}

export default PublishPage;