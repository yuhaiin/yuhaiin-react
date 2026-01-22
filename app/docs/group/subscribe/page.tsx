"use client"

import { CardList, IconBox, IconBoxRounded, MainContainer, SettingsBox } from '@/app/component/cardlist';
import { create } from "@bufbuild/protobuf";
import { FC, useContext, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useClipboard } from '../../../component/clipboard';
import { ConfirmModal } from "../../../component/confirm";
import Loading, { Error } from "../../../component/loading";
import { SettingInputVertical } from "../../../component/switch";
import { GlobalToastContext } from "../../../component/toast";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { link_reqSchema, save_link_reqSchema, subscribe } from "../../pbes/api/node_pb";
import { link, linkSchema, type } from "../../pbes/node/subscribe_pb";

const LinkItem: FC<{
    linkData: link;
    isUpdating: boolean;
    onUpdate: () => void;
    onDelete: () => void;
}> = ({ linkData, isUpdating, onUpdate, onDelete }) => {
    return (
        <>
            <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3">
                <IconBoxRounded
                    icon="rss-fill"
                    color="#0d6efd"
                    style={{ width: '40px', height: '40px', border: 'none', marginRight: '0px' }}
                />

                {/* Text Info: min-width: 0 is crucial for text-truncate inside flex items */}
                <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                    <span className="fw-bold text-truncate">{linkData.name}</span>
                    <small className="text-muted text-truncate font-monospace opacity-75">
                        {linkData.url}
                    </small>
                </div>
            </div>

            {/* Actions: Added flex-shrink-0 and white-space-nowrap */}
            <div className="d-flex gap-2 ms-3 align-items-center flex-shrink-0 text-nowrap">
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onUpdate}
                    disabled={isUpdating}
                    title="Update Subscription"
                    style={{ minWidth: '38px' }} // Ensures square shape on mobile
                >
                    {isUpdating ? <Spinner size="sm" animation="border" /> : <i className="bi bi-arrow-repeat"></i>}
                    <span className="d-none d-sm-inline ms-2">Update</span>
                </Button>

                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={onDelete}
                    title="Delete Subscription"
                    style={{ minWidth: '38px' }} // Ensures square shape on mobile
                >
                    <i className="bi bi-trash"></i>
                    <span className="d-none d-sm-inline ms-2">Delete</span>
                </Button>
            </div>
        </>
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
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fw-bold">Add Subscription</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={!newItem.name || !newItem.url}>
                    <i className="bi bi-plus-lg me-1"></i> Add
                </Button>
            </Modal.Footer>
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
                            <IconBox icon="cloud-download" color="#0ea5e9" />
                            <div>
                                <h5 className="mb-0 fw-bold">Subscriptions</h5>
                                <small className="text-muted">Manage remote configuration links</small>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Add
                        </Button>
                    </>
                }
            />
        </MainContainer>
    )
}

export default Subscribe;