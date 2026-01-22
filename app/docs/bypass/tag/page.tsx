"use client"

import { CardList, IconBox, IconBoxRounded, MainContainer, SettingLabel, SettingsBox } from "@/app/component/cardlist";
import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Button, ButtonGroup, Modal, ToggleButton } from "react-bootstrap";
import { ConfirmModal } from "../../../component/confirm";
import Loading from "../../../component/loading";
import { SettingInputVertical, SettingSelectVertical } from "../../../component/switch";
import { GlobalToastContext } from "../../../component/toast";
import { Node, Nodes } from "../../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { NodeModal } from "../../node/modal";
import { node, save_tag_req, save_tag_reqSchema, tag, tags_response } from "../../pbes/api/node_pb";
import { tag_type } from "../../pbes/node/tag_pb";

const TagItem: FC<{
    tagName: string,
    tagData: any,
    onDelete: () => void,
    onHashClick: (h: string) => void
}> = ({ tagName, tagData, onDelete, onHashClick }) => {
    const isGlobal = tagData.hash.length === 0 || tagData.hash[0] === "";
    const isMirror = tagData.type === tag_type.mirror;

    return (
        <>
            <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3">
                {/* Icon based on type */}
                <IconBoxRounded
                    icon={isGlobal ? 'globe' : isMirror ? 'files' : 'hdd-network'}
                    color={isGlobal ? '#6c757d' : isMirror ? '#0dcaf0' : '#0d6efd'}
                    style={{ width: '40px', height: '40px', border: 'none', marginRight: '0px' }}
                />

                {/* Tag Info */}
                <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                    <span className="fw-bold text-truncate">{tagName}</span>
                    <div className="d-flex align-items-center gap-2">
                        {isGlobal ? (
                            <small className="text-muted opacity-75">Global Fallback</small>
                        ) : (
                            <small
                                className="text-muted text-truncate font-monospace opacity-75 text-decoration-underline"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    if (!isMirror) {
                                        e.stopPropagation();
                                        onHashClick(tagData.hash[0]);
                                    }
                                }}
                            >
                                {isMirror ? `Mirror: ${tagData.hash[0]}` : tagData.hash[0]}
                            </small>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 ms-3 align-items-center flex-shrink-0">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <i className="bi bi-trash"></i>
                    <span className="d-none d-sm-inline ms-2">Delete</span>
                </Button>
            </div>
        </>
    );
};

// --- Component: Tag Edit/Add Modal ---
const TagModal: FC<{
    show: boolean,
    nodes: Nodes,
    data: tags_response,
    tagItem: save_tag_req,
    isNew?: boolean,
    onHide: () => void,
    onSave: () => void,
    onChangeTag: (x: save_tag_req) => void
}> = (props) => {
    return (
        <Modal show={props.show} onHide={props.onHide} centered scrollable>
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fw-bold">{props.isNew ? "Create Tag" : `Edit Tag: ${props.tagItem.tag}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="d-flex flex-column gap-3">
                    {/* Mode Toggle */}
                    <SettingsBox>
                        <SettingLabel>Tag Type</SettingLabel>
                        <ButtonGroup className="w-100">
                            <ToggleButton
                                id="toggle-node"
                                type="radio"
                                variant="outline-primary"
                                value={tag_type.node}
                                checked={props.tagItem.type === tag_type.node}
                                onChange={() => props.onChangeTag({ ...props.tagItem, type: tag_type.node })}
                            >
                                <i className="bi bi-hdd-network me-2"></i>Node
                            </ToggleButton>
                            <ToggleButton
                                id="toggle-mirror"
                                type="radio"
                                variant="outline-primary"
                                value={tag_type.mirror}
                                checked={props.tagItem.type === tag_type.mirror}
                                onChange={() => props.onChangeTag({ ...props.tagItem, type: tag_type.mirror })}
                            >
                                <i className="bi bi-files me-2"></i>Mirror
                            </ToggleButton>
                        </ButtonGroup>
                    </SettingsBox>

                    {/* Inputs */}
                    <SettingsBox>
                        <div className="d-flex flex-column gap-3">
                            {props.isNew && (
                                <SettingInputVertical
                                    label="Tag Name"
                                    value={props.tagItem.tag}
                                    placeholder="e.g., fast-proxy"
                                    onChange={(v) => props.onChangeTag({ ...props.tagItem, tag: v })}
                                />
                            )}

                            {props.tagItem.type === tag_type.mirror ? (
                                <SettingSelectVertical
                                    label="Target Mirror Tag"
                                    value={props.tagItem.hash}
                                    values={Object.keys(props.data.tags).sort()}
                                    emptyChoose
                                    onChange={(v) => props.onChangeTag({ ...props.tagItem, hash: v })}
                                />
                            ) : (
                                <div>
                                    <SettingLabel>Target Node</SettingLabel>
                                    <Node
                                        data={props.nodes}
                                        hash={props.tagItem.hash}
                                        onChangeNode={(x) => props.onChangeTag({ ...props.tagItem, hash: x })}
                                    />
                                </div>
                            )}
                        </div>
                    </SettingsBox>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={props.onHide}>Cancel</Button>
                <Button variant="primary" onClick={props.onSave} disabled={!props.tagItem.tag || !props.tagItem.hash}>
                    <i className="bi bi-save me-1"></i> Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

function Tags() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(tag.method.list);
    const { data: nodes } = useProtoSWR(node.method.list);

    const [modalHash, setModalHash] = useState({ hash: "", show: false });
    const [tagModalData, setTagModalData] = useState({
        show: false,
        tag: create(save_tag_reqSchema, { tag: "", hash: "", type: tag_type.node }),
        isNew: true
    });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, name: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        if (tagModalData.tag.tag === "" || tagModalData.tag.hash === "") return;
        FetchProtobuf(tag.method.save, tagModalData.tag)
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`Save failed: ${error.msg}`);
                else {
                    ctx.Info("Tag saved successfully");
                    mutate();
                    setTagModalData(prev => ({ ...prev, show: false }));
                }
            });
    };

    const handleDelete = (name: string) => {
        FetchProtobuf(tag.method.remove, create(StringValueSchema, { value: name }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`Delete failed: ${error.msg}`);
                else {
                    ctx.Info("Tag removed");
                    mutate();
                }
                setConfirmDelete({ show: false, name: "" });
            });
    };

    return (
        <MainContainer>
            {/* Delete Confirmation */}
            <ConfirmModal
                show={confirmDelete.show}
                content={<p>Delete tag <strong>{confirmDelete.name}</strong>?</p>}
                onHide={() => setConfirmDelete({ show: false, name: "" })}
                onOk={() => handleDelete(confirmDelete.name)}
            />

            {/* Node Info Modal */}
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />

            {/* Tag Edit/Create Modal */}
            <TagModal
                show={tagModalData.show}
                nodes={new Nodes(nodes)}
                data={data}
                tagItem={tagModalData.tag}
                isNew={tagModalData.isNew}
                onHide={() => setTagModalData(prev => ({ ...prev, show: false }))}
                onChangeTag={(x) => setTagModalData(prev => ({ ...prev, tag: x }))}
                onSave={handleSave}
            />

            <CardList
                items={Object.entries(data.tags).sort((a, b) => a[0].localeCompare(b[0]))}
                onClickItem={([key, value]) => setTagModalData({
                    show: true,
                    tag: create(save_tag_reqSchema, { tag: key, hash: value.hash[0], type: value.type }),
                    isNew: false
                })}
                renderListItem={
                    ([key, value]) =>
                        <TagItem
                            key={key}
                            tagName={key}
                            tagData={value}
                            onDelete={() => setConfirmDelete({ show: true, name: key })}
                            onHashClick={(h) => setModalHash({ hash: h, show: true })}
                        />
                }

                header={
                    <>
                        <div className="d-flex align-items-center">
                            <IconBox icon="tags" color="#10b981" />
                            <div>
                                <h5 className="mb-0 fw-bold">Tags</h5>
                                <small className="text-muted">Alias and mirror nodes</small>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setTagModalData({
                                show: true,
                                tag: create(save_tag_reqSchema, { tag: "", hash: "", type: tag_type.node }),
                                isNew: true
                            })}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Add
                        </Button>
                    </>
                }
            />
        </MainContainer>
    );
}

export default Tags;