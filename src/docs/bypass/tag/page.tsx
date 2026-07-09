"use client"

import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardRowList, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { SettingInputVertical, SettingSelectVertical } from "@/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { create } from "@/common/plain";
import { StringValueSchema } from "@/common/plain";
import { ChevronRight, FileStack, Globe, Network, Plus, Save, Tags as TagsIcon, Trash } from 'lucide-react';
import { FC, useContext, useState } from "react";
import { Node, Nodes } from "../../../common/nodes";
import { FetchHTTP, useHttpSWR, useHttpSWRRequest } from '../../../common/http';
import HeaderError from '../../../component/Error';
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading from "../../../component/v2/loading";
import { NodeModal } from "../../node/modal";
import { node, save_tag_req, tag, tag_item, tags_response } from "@/common/api";
import { tag_type, type tags } from "../../schema/node/tag";

const normalizeTag = (value?: tags): tags => ({
    ...(value ?? {}),
    type: value?.type ?? tag_type.node,
    hash: Array.isArray(value?.hash) ? value.hash : value?.hash ? [value.hash] : [],
});

const TagItem: FC<{
    tagName: string,
    tagData: tags,
    onDelete: () => void,
    onHashClick: (h: string) => void
}> = ({ tagName, tagData, onDelete, onHashClick }) => {
    const current = normalizeTag(tagData);
    const isGlobal = current.hash.length === 0 || current.hash[0] === "";
    const isMirror = current.type === tag_type.mirror;
    const target = current.hash[0] ?? "";


    return (
        <>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(190px,0.34fr)_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-center">
                    {isGlobal ? <Globe className="mr-4 text-gray-500 dark:text-gray-400" size={20} /> : isMirror ? <FileStack className="mr-4 text-gray-500 dark:text-gray-400" size={20} /> : <Network className="mr-4 text-gray-500 dark:text-gray-400" size={20} />}
                    <span className="font-medium truncate">{tagName}</span>
                </div>
                <div className="grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-3">
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Type</span>
                        <Badge variant={isGlobal ? "primary" : isMirror ? "info" : "secondary"} className="shrink-0">
                            {isGlobal ? "Global" : isMirror ? "Mirror" : "Node"}
                        </Badge>
                    </div>
                    {!isGlobal && (
                        <button
                            className="min-w-0 truncate border-0 bg-transparent p-0 text-left font-mono font-medium text-ui-fg underline"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                                if (!isMirror) {
                                    e.stopPropagation();
                                    onHashClick(current.hash[0]);
                                }
                            }}
                        >
                            <span className="mr-1 font-sans font-normal text-ui-muted/70">{isMirror ? "Mirror" : "Target"}</span>
                            {target}
                        </button>
                    )}
                    {isGlobal && (
                        <div className="min-w-0 truncate text-ui-muted sm:col-span-2">Applies without a fixed node target</div>
                    )}
                </div>
            </div>
            <div className="flex gap-2 ml-4 items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete()}
                >
                    <Trash size={16} />
                </Button>
                <ChevronRight className="text-gray-500 dark:text-gray-400 opacity-25 hidden md:block" size={16} />
            </div>
        </>
    );
};

const PAGE_SIZE = 8;

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
                    <div className="flex flex-col gap-6">
                        {/* Mode Toggle */}
                        <SettingsBox>
                            <SettingLabel className="mb-2">Tag Type</SettingLabel>
                            <ToggleGroup
                                type="single"
                                value={String(props.tagItem.type)}
                                onValueChange={(v) => v && props.onChangeTag({ ...props.tagItem, type: Number(v) })}
                                className="w-full flex-nowrap"
                            >
                                <ToggleItem value={String(tag_type.node)} className="flex-grow whitespace-nowrap">
                                    <Network className="mr-2" />Node
                                </ToggleItem>
                                <ToggleItem value={String(tag_type.mirror)} className="flex-grow whitespace-nowrap">
                                    <FileStack className="mr-2" />Mirror
                                </ToggleItem>
                            </ToggleGroup>
                        </SettingsBox>

                        {/* Inputs */}
                        <div className="flex flex-col gap-4">
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
                                    <div className="p-4 bg-secondary/10 rounded-md border border-gray-500/10">
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
                        <Save className="mr-2" size={16} />Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function Tags() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const { data, error, isLoading, mutate } = useHttpSWRRequest(
        tag.method.list_page,
        { page, pageSize: PAGE_SIZE },
    );
    const { data: allTags, mutate: mutateAllTags } = useHttpSWR(tag.method.list, { revalidateOnFocus: false });
    const { data: nodes } = useHttpSWR(node.method.list);

    const [modalHash, setModalHash] = useState({ hash: "", show: false });
    const [tagModalData, setTagModalData] = useState({
        show: false,
        tag: { tag: "", hash: "", type: tag_type.node } as save_tag_req,
        isNew: true
    });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, name: "" });

    if (error !== undefined) return <HeaderError statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        if (tagModalData.tag.tag === "" || tagModalData.tag.hash === "") return;
        FetchHTTP(tag.method.save, tagModalData.tag)
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`Save failed: ${error.msg}`);
                else {
                    ctx.Info("Tag saved successfully");
                    mutate();
                    mutateAllTags();
                    setTagModalData(prev => ({ ...prev, show: false }));
                }
            });
    };

    const handleDelete = (name: string) => {
        FetchHTTP(tag.method.remove, create(StringValueSchema, { value: name }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`Delete failed: ${error.msg}`);
                else {
                    ctx.Info("Tag removed");
                    mutate();
                    mutateAllTags();
                }
                setConfirmDelete({ show: false, name: "" });
            });
    };

    const visibleTags: tag_item[] = data.items.length > 0
        ? data.items
        : Object.entries(data.tags).map(([name, value]) => ({ name, tag: value }));
    const modalTags = allTags ?? data;
    const totalTags = data.page?.total ?? visibleTags.length;

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
                data={modalTags}
                tagItem={tagModalData.tag}
                isNew={tagModalData.isNew}
                onHide={() => setTagModalData(prev => ({ ...prev, show: false }))}
                onChangeTag={(x) => setTagModalData(prev => ({ ...prev, tag: x }))}
                onSave={handleSave}
            />

            <CardRowList
                header={
                    <div className="flex justify-between items-center w-full">
                        <IconBox icon={TagsIcon} color="#10b981" title="Tags Management" description={`${totalTags} alias and mirror nodes defined`} />
                        <Button
                            onClick={() => setTagModalData({
                                show: true,
                                tag: { tag: "", hash: "", type: tag_type.node },
                                isNew: true
                            })}
                        >
                            <Plus className="mr-2" />Add New Tag
                        </Button>
                    </div>
                }
                layout="list"
                paginated
                pageSize={PAGE_SIZE}
                currentPage={data.page?.page || page}
                totalItems={totalTags}
                onPageChange={setPage}
                items={visibleTags}
                getKey={(item) => item.name}
                onClickItem={(item) => {
                    const value = normalizeTag(item.tag);
                    if (!value) return;
                    setTagModalData({
                        show: true,
                        tag: { tag: item.name, hash: value.hash[0] ?? "", type: value.type },
                        isNew: false
                    })
                }}
                renderListItem={(item) => {
                    const value = normalizeTag(item.tag);
                    if (!value) return null;
                    return (
                        <TagItem
                            key={item.name}
                            tagName={item.name}
                            tagData={value}
                            onDelete={() => setConfirmDelete({ show: true, name: item.name })}
                            onHashClick={(h) => setModalHash({ hash: h, show: true })}
                        />
                    )
                }}
                onAddNew={(name) => {
                    if (!modalTags.tags[name] && !data.tags[name]) {
                        setTagModalData({
                            show: true,
                            tag: { tag: name, hash: "", type: tag_type.node },
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
