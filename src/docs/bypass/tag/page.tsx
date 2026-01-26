"use client"

import { Button } from "@/component/v2/button";
import { CardRowList, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { SettingInputVertical, SettingSelectVertical } from "@/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { ChevronRight, FileStack, Globe, Network, Plus, Save, Tags as TagsIcon, Trash } from 'lucide-react';
import { FC, useContext, useState } from "react";
import { Node, Nodes } from "../../../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../../../common/proto';
import HeaderError from '../../../component/Error';
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading from "../../../component/v2/loading";
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
            {isGlobal ? <Globe className="me-3 fs-5 text-secondary" /> : isMirror ? <FileStack className="me-3 fs-5 text-secondary" /> : <Network className="me-3 fs-5 text-secondary" />}
            <div className="d-flex flex-column overflow-hidden flex-grow-1" style={{ minWidth: 0 }}>
                <span className="fw-medium text-truncate">{tagName}</span>
                {!isGlobal && (
                    <small
                        className="text-muted text-truncate font-monospace opacity-75 text-decoration-underline"
                        style={{ cursor: 'pointer', fontSize: '0.75rem' }}
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
            <div className="d-flex gap-2 ms-3 align-items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                    variant="outline-danger"
                    size="sm"
                    className="border-0"
                    onClick={() => onDelete()}
                >
                    <Trash size={16} />
                </Button>
                <ChevronRight className="text-muted opacity-25 d-none d-md-block" />
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
        <Modal open={props.show} onOpenChange={(open) => !open && props.onHide()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle>{props.tagItem.tag}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div className="d-flex flex-column gap-4">
                        {/* Mode Toggle */}
                        <SettingsBox>
                            <SettingLabel className="mb-2">Tag Type</SettingLabel>
                            <ToggleGroup
                                type="single"
                                value={String(props.tagItem.type)}
                                onValueChange={(v) => v && props.onChangeTag({ ...props.tagItem, type: Number(v) })}
                                className="w-100"
                            >
                                <ToggleItem value={String(tag_type.node)} className="flex-grow-1">
                                    <Network className="me-2" />Node
                                </ToggleItem>
                                <ToggleItem value={String(tag_type.mirror)} className="flex-grow-1">
                                    <FileStack className="me-2" />Mirror
                                </ToggleItem>
                            </ToggleGroup>
                        </SettingsBox>

                        {/* Inputs */}
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
                                    <SettingLabel className="mb-2">Target Node</SettingLabel>
                                    <div className="p-3 bg-body-tertiary rounded-3 border border-secondary border-opacity-10">
                                        <Node
                                            data={props.nodes}
                                            hash={props.tagItem.hash}
                                            onChangeNode={(x) => props.onChangeTag({ ...props.tagItem, hash: x })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="border-0">
                    <Button onClick={props.onHide}>Cancel</Button>
                    <Button onClick={props.onSave} disabled={!props.tagItem.tag || !props.tagItem.hash}>
                        <Save className="me-2" size={16} />Save
                    </Button>
                </ModalFooter>
            </ModalContent>
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

    if (error !== undefined) return <HeaderError statusCode={error.code} title={error.msg} />
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
                title="Delete Tag"
                content={<p className="mb-0">Are you sure you want to delete tag <strong>{confirmDelete.name}</strong>?</p>}
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

            <CardRowList
                header={
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <IconBox icon={TagsIcon} color="#10b981" title="Tags Management" description={`${Object.keys(data.tags).length} alias and mirror nodes defined`} />
                        <Button
                            onClick={() => setTagModalData({
                                show: true,
                                tag: create(save_tag_reqSchema, { tag: "", hash: "", type: tag_type.node }),
                                isNew: true
                            })}
                        >
                            <Plus className="me-2" />Add New Tag
                        </Button>
                    </div>
                }
                items={Object.keys(data.tags).sort((a, b) => a.localeCompare(b))}
                onClickItem={(key) => {
                    const value = data.tags[key];
                    setTagModalData({
                        show: true,
                        tag: create(save_tag_reqSchema, { tag: key, hash: value.hash[0], type: value.type }),
                        isNew: false
                    })
                }}
                renderListItem={(key) => {
                    const value = data.tags[key];
                    const isGlobal = value.hash.length === 0 || value.hash[0] === "";
                    const isMirror = value.type === tag_type.mirror;
                    return (
                        <TagItem
                            key={key}
                            tagName={key}
                            tagData={value}
                            onDelete={() => setConfirmDelete({ show: true, name: key })}
                            onHashClick={(h) => setModalHash({ hash: h, show: true })}
                        />
                    )
                }}
                onAddNew={(name) => {
                    if (!data.tags[name]) {
                        setTagModalData({
                            show: true,
                            tag: create(save_tag_reqSchema, { tag: name, hash: "", type: tag_type.node }),
                            isNew: true
                        });
                    }
                }}
                adding={isLoading}
            />
        </MainContainer>
    );
}

export default Tags;