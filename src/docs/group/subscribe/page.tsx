"use client"

import { Button } from '@/component/v2/button';
import { CardList, IconBox, IconBoxRounded, MainContainer, SettingsBox } from '@/component/v2/card';
import { ConfirmModal } from "@/component/v2/confirm";
import { SettingInputVertical } from "@/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { create } from "@bufbuild/protobuf";
import { CloudDownload, Plus, RefreshCw, Rss, Trash } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import { FetchProtobuf, useProtoSWR } from '../../../common/proto';
import { useClipboard } from '../../../component/v2/clipboard';
import Loading, { Error } from "../../../component/v2/loading";
import { GlobalToastContext } from "../../../component/v2/toast";
import { link_reqSchema, save_link_reqSchema, subscribe } from "../../pbes/api/node_pb";
import { link, linkSchema, type } from "../../pbes/node/subscribe_pb";

const LinkItem: FC<{
    linkData: link;
    isUpdating: boolean;
    onUpdate: () => void;
    onDelete: () => void;
}> = ({ linkData, isUpdating, onUpdate, onDelete }) => {
    return (
        <div
            className="link-item"
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '12px',
                alignItems: 'center',
                overflow: 'hidden',
                flex: 1,
            }}
        >
            {/* LEFT */}
            <div className="d-flex align-items-center gap-3 min-w-0 overflow-hidden">
                <IconBoxRounded
                    icon={Rss}
                    color="#0d6efd"
                    style={{ width: 40, height: 40, flexShrink: 0 }}
                />

                <div className="min-w-0 overflow-hidden">
                    <div className="fw-bold text-truncate">
                        {linkData.name}
                    </div>
                    <small className="text-muted text-truncate d-block">
                        {linkData.url}
                    </small>
                </div>
            </div>

            {/* RIGHT */}
            <div className="d-flex gap-2 justify-content-end link-actions">
                <Button
                    size="sm"
                    onClick={onUpdate}
                    disabled={isUpdating}
                >
                    {isUpdating
                        ? <Spinner size="sm" />
                        : <RefreshCw size={16} />
                    }
                    <span className="d-none d-sm-inline ms-2">Update</span>
                </Button>

                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={onDelete}
                >
                    <Trash size={16} />
                    <span className="d-none d-sm-inline ms-2">Delete</span>
                </Button>
            </div>
        </div>
    );
};

// --- Component: Add New Link Modal ---
const AddLinkModal: FC<{
    show: boolean;
    onHide: () => void;
    onSave: (link: link) => void;
}> = ({ show, onHide, onSave }) => {
    const [newItem, setNewItem] = useState<link>(create(linkSchema, { name: "", url: "", type: type.reserve }));

    const handleSave = () => {
        if (!newItem.name || !newItem.url) return;
        onSave(newItem);
        setNewItem(create(linkSchema, { name: "", url: "", type: type.reserve })); // Reset
        onHide();
    };

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent>
                <ModalHeader closeButton className="border-bottom-0 pb-0">
                    <ModalTitle className="fw-bold">Add Subscription</ModalTitle>
                </ModalHeader>
                <ModalBody className="pt-2">
                    <SettingsBox>
                        <div className="d-flex flex-column gap-3">
                            <SettingInputVertical
                                label="Name"
                                value={newItem.name}
                                placeholder="e.g., My Server"
                                onChange={(v) => setNewItem({ ...newItem, name: v })}
                            />
                            <SettingInputVertical
                                label="Subscription URL"
                                value={newItem.url}
                                placeholder="https://example.com/sub/..."
                                onChange={(v) => setNewItem({ ...newItem, url: v })}
                            />
                        </div>
                    </SettingsBox>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onHide}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!newItem.name || !newItem.url}>
                        <Plus className="me-1" size={16} /> Add
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};


function Subscribe() {
    const ctx = useContext(GlobalToastContext);
    const { data: links, error, isLoading, mutate } = useProtoSWR(subscribe.method.get);

    const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const { copy, copied } = useClipboard({
        usePromptAsFallback: true
    });

    useEffect(() => {
        if (copied) {
            ctx.Info("Copied to clipboard")
        }
    }, [copied, ctx])

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || links === undefined) return <Loading />

    // Update Logic
    const handleUpdate = (name: string) => {
        setUpdating(prev => ({ ...prev, [name]: true }));
        FetchProtobuf(subscribe.method.update, create(link_reqSchema, { names: [name] }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`Update failed ${error.code}| ${error.msg}`)
                else ctx.Info(`Update successfully`);
                setUpdating(prev => ({ ...prev, [name]: false }));
            })
    }

    // Delete Logic
    const handleDelete = (name: string) => {
        FetchProtobuf(subscribe.method.remove, create(link_reqSchema, { names: [name] }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`delete ${name} failed, ${error.code}| ${error.msg}`)
                else mutate()
            })
    }

    // Add Logic
    const handleAdd = (item: link) => {
        FetchProtobuf(
            subscribe.method.save,
            create(save_link_reqSchema, { links: [item] }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`save link ${item.url} failed, ${error.code}| ${error.msg}`)
                else mutate()
            })
    }

    return (
        <MainContainer>
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={confirmDelete.show}
                title="Delete Subscription"
                content={<p>Are you sure you want to remove subscription <strong>{confirmDelete.name}</strong>?</p>}
                onOk={() => {
                    handleDelete(confirmDelete.name);
                    setConfirmDelete({ show: false, name: "" });
                }}
                onHide={() => setConfirmDelete({ show: false, name: "" })}
            />

            {/* Add New Link Modal */}
            <AddLinkModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSave={handleAdd}
            />

            <CardList
                items={Object.entries(links.links).sort((a, b) => a[0].localeCompare(b[0]))}
                onClickItem={([, v]) => copy(v.url)}
                renderListItem={([key, value]) =>
                    <LinkItem
                        key={key}
                        linkData={value}
                        isUpdating={!!updating[value.name]}
                        onUpdate={() => handleUpdate(value.name)}
                        onDelete={() => setConfirmDelete({ show: true, name: value.name })}
                    />
                }
                header={
                    <>
                        <div className="d-flex align-items-center">
                            <IconBox icon={CloudDownload} color="#0ea5e9" />
                            <div>
                                <h5 className="mb-0 fw-bold">Subscriptions</h5>
                                <small className="text-muted">Manage remote configuration links</small>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16} /> Add
                        </Button>
                    </>
                }
            />
        </MainContainer>
    )
}

export default Subscribe;