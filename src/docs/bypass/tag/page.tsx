"use client"

import { listNodes } from "@/api/nodes";
import { deleteTag, listTags, saveTag } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardRowList, FilterSearch, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { Input } from "@/component/v2/input";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Select, type SelectItem } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { TagItem } from "@/contract/route";
import { Check, Copy, Network, Plus, Tags as TagsIcon, Trash } from "lucide-react";
import type { CSSProperties, FC } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { NodeModal } from "../../node/modal";

type TagDraft = {
    tag: string;
    type: string;
    hash: string;
};

const emptyDraft: TagDraft = { tag: "", type: "node", hash: "" };
const PAGE_SIZE = 8;

function includeOption(items: SelectItem[], value: string): SelectItem[] {
    if (!value || items.some(item => item.value === value)) return items;
    return [{ value, label: value }, ...items];
}

const TagModal: FC<{
    show: boolean;
    item?: TagItem;
    onHide: () => void;
    onSaved: () => void;
}> = ({ show, item, onHide, onSaved }) => {
    const ctx = useContext(GlobalToastContext);
    const [draft, setDraft] = useState<TagDraft>(emptyDraft);
    const [group, setGroup] = useState("");
    const [saving, setSaving] = useState(false);
    const { data: nodes } = useSWR(show ? "/api/v2/nodes/tag-options" : null, () => listNodes({ page: 1, pageSize: 10000 }), { revalidateOnFocus: false });
    const { data: tags } = useSWR(show ? "/api/v2/route/tags/options" : null, () => listTags({ page: 1, pageSize: 10000 }), { revalidateOnFocus: false });

    const nodeGroups = useMemo(
        () => Array.from(new Set((nodes?.items ?? []).map(node => node.group || "manual"))).sort((a, b) => a.localeCompare(b)),
        [nodes?.items],
    );
    const selectedGroup = group || nodeGroups[0] || "";
    const groupItems: SelectItem[] = includeOption(
        nodeGroups.map(value => ({ value, label: value })),
        selectedGroup,
    );
    const nodeItems: SelectItem[] = includeOption(
        (nodes?.items ?? []).filter(node => (node.group || "manual") === selectedGroup).map(node => ({
            value: node.id,
            label: node.name || node.id,
        })),
        draft.type === "node" ? draft.hash : "",
    );
    const mirrorItems: SelectItem[] = includeOption(
        (tags?.items ?? []).filter(tag => tag.name !== draft.tag).map(tag => ({
            value: tag.name,
            label: tag.name,
        })),
        draft.type === "mirror" ? draft.hash : "",
    );

    useEffect(() => {
        if (!show) return;
        const next = item ? { tag: item.name, type: item.type || "node", hash: item.hash[0] ?? "" } : emptyDraft;
        setDraft(next);
        setGroup("");
    }, [show, item]);

    useEffect(() => {
        if (!show || draft.type !== "node") return;
        const currentNode = (nodes?.items ?? []).find(node => node.id === draft.hash);
        if (currentNode) {
            setGroup(currentNode.group || "manual");
            return;
        }
        if (!group && nodeGroups.length > 0) setGroup(nodeGroups[0]);
    }, [draft.hash, draft.type, group, nodeGroups, nodes?.items, show]);

    const save = () => {
        if (!draft.tag || !draft.hash) return;
        setSaving(true);
        saveTag(draft.tag, draft.type, draft.hash)
            .then(() => {
                ctx.Info("tag saved");
                onSaved();
                onHide();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)))
            .finally(() => setSaving(false));
    };

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent style={{ "--bs-modal-width": "640px" } as CSSProperties}>
                <ModalHeader closeButton>
                    <ModalTitle>{item ? "Edit Tag" : "Add Tag"}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div className="grid gap-6">
                        <SettingsBox>
                            <div className="grid gap-6">
                                <div>
                                    <SettingLabel className="mb-2">Tag Type</SettingLabel>
                                    <ToggleGroup type="single" value={draft.type} onValueChange={(type) => type && setDraft(prev => ({ ...prev, type, hash: type === prev.type ? prev.hash : "" }))}>
                                        <ToggleItem value="node" className="flex-grow">
                                            <Network size={18} className="mr-2" />Node
                                        </ToggleItem>
                                        <ToggleItem value="mirror" className="flex-grow">
                                            <Copy size={18} className="mr-2" />Mirror
                                        </ToggleItem>
                                    </ToggleGroup>
                                </div>
                                <div>
                                    <SettingLabel className="mb-2">Tag Name</SettingLabel>
                                    <Input value={draft.tag} onChange={(e) => setDraft(prev => ({ ...prev, tag: e.target.value }))} placeholder="e.g., fast-proxy" disabled={!!item} />
                                </div>
                            </div>
                        </SettingsBox>
                        <SettingsBox>
                            <div className="grid gap-4">
                                <SettingLabel>Target Node</SettingLabel>
                                {draft.type === "mirror" ? (
                                    <Select
                                        value={draft.hash}
                                        onValueChange={(hash) => setDraft(prev => ({ ...prev, hash }))}
                                        items={mirrorItems}
                                        placeholder="Choose tag"
                                    />
                                ) : (
                                    <>
                                        <div>
                                            <div className="mb-2 text-sm font-semibold text-ui-muted">Group</div>
                                            <Select
                                                value={selectedGroup}
                                                onValueChange={(nextGroup) => {
                                                    setGroup(nextGroup);
                                                    const nextNode = (nodes?.items ?? []).find(node => (node.group || "manual") === nextGroup);
                                                    setDraft(prev => ({ ...prev, hash: nextNode?.id ?? "" }));
                                                }}
                                                items={groupItems}
                                                placeholder="Choose group"
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-2 text-sm font-semibold text-ui-muted">Node</div>
                                            <Select
                                                value={draft.hash}
                                                onValueChange={(hash) => setDraft(prev => ({ ...prev, hash }))}
                                                items={nodeItems}
                                                placeholder="Choose node"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </SettingsBox>
                    </div>
                </ModalBody>
                <ModalFooter className="border-0">
                    <Button onClick={onHide}>Cancel</Button>
                    <Button onClick={save} disabled={saving || !draft.tag || !draft.hash}>
                        {saving ? <Spinner size="sm" className="mr-2" /> : <Check size={16} className="mr-2" />}
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function Tags() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<TagItem | undefined>();
    const [adding, setAdding] = useState(false);
    const [nodeModal, setNodeModal] = useState<{ show: boolean; id?: string }>({ show: false });
    const { data, error, isLoading, mutate } = useSWR(
        ["/api/v2/route/tags", page, query],
        () => listTags({ page, pageSize: PAGE_SIZE, query }),
        { revalidateOnFocus: false },
    );

    const remove = (item: TagItem) => {
        deleteTag(item.name)
            .then(() => {
                ctx.Info("tag deleted");
                mutate();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <NodeModal show={nodeModal.show} id={nodeModal.id} readOnly onHide={() => setNodeModal({ show: false })} />
            <TagModal show={adding || editing !== undefined} item={editing} onHide={() => { setAdding(false); setEditing(undefined); }} onSaved={mutate} />
            <div className="flex justify-end mb-3">
                <FilterSearch onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
            </div>
            <CardRowList
                layout="list"
                paginated
                pageSize={PAGE_SIZE}
                currentPage={data.page.page || page}
                totalItems={data.page.total}
                onPageChange={setPage}
                items={data.items}
                getKey={(v) => v.name}
                onClickItem={(item) => setEditing(item)}
                renderListItem={(item) => (
                    <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold truncate">{item.name}</span>
                                <Badge variant="info">{item.type}</Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {item.hash.length === 0 ? (
                                    <small className="text-gray-500">-</small>
                                ) : item.hash.map(hash => item.type === "node" ? (
                                    <Button
                                        key={hash}
                                        size="xs"
                                        variant="outline-secondary"
                                        className="font-mono"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setNodeModal({ show: true, id: hash });
                                        }}
                                    >
                                        {hash}
                                    </Button>
                                ) : (
                                    <small key={hash} className="rounded-full border border-ui-border bg-ui-surface-muted px-2 py-1 font-mono text-gray-500">{hash}</small>
                                ))}
                            </div>
                        </div>
                        <Button size="sm" variant="outline-danger" onClick={(e) => { e.stopPropagation(); remove(item); }}>
                            <Trash size={16} />
                        </Button>
                    </div>
                )}
                header={
                    <div className="flex w-full items-center justify-between gap-3">
                        <IconBox icon={TagsIcon} color="#8b5cf6" title="Tags Management" description={`${data.page.total} aliases and mirrors`} />
                        <Button onClick={() => setAdding(true)}>
                            <Plus size={16} className="mr-1" /> Add
                        </Button>
                    </div>
                }
            />
        </MainContainer>
    );
}

export default Tags;
