import { confirmAction } from '@/component/v2/confirmation';
import { FormSection } from '@/component/v2/form-section';
import { ResourceEditorFrame, ResourceWorkspace, useResourceSelection, EditorDeleteButton, editorActionsClass } from '@/component/resource-workspace';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useTranslation } from 'react-i18next';

import NodePicker from "@/component/node-picker";
import { deletePublish, listPublishes, savePublish } from "@/api/subscriptions";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import { SettingInputVertical } from "@/component/v2/forms";
import { SwitchCard } from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Publish } from "@/contract/subscription";
import { defaultPublish } from "@/contract/subscription";
import { Check, Share2 } from "lucide-react";
import { FC, useContext, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

const EditModal: FC<{
    show: boolean;
    isEdit: boolean;
    onHide: () => void;
    item: Publish;
    mutatePub: () => void;
    presentation?: "modal" | "inline";
    onSaved?: (item: Publish) => void;
    onDelete?: () => void;
}> = ({ show, isEdit, onHide, item, mutatePub, presentation = "modal", onSaved, onDelete }) => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { value: newItem, setValue: setNewItem, dirty, commit } = useEditorDraft(show ? item.name || "new" : null, item, defaultPublish);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(dirty, saving, onHide);

    const handleSave = () => {
        if (!newItem.name || saving) return;
        void run(async () => { await savePublish(newItem); commit(newItem); mutatePub(); onSaved?.(newItem); if (presentation === "modal") onHide(); });
    };

    return <ResourceEditorFrame title={isEdit ? item.name : uiT("publishConfig")} label={uiT("publishConfig")} presentation={presentation} open={show} onClose={close}
        footer={<>
            <div>{isEdit && onDelete && <EditorDeleteButton label={uiT("delete")} onClick={onDelete} disabled={saving} />}</div>
            <div className={editorActionsClass}>
                <Button variant="outline-secondary" onClick={close} disabled={saving}>{uiT("cancel")}</Button>
                <Button permission="nodes:write" loading={saving} variant="primary" onClick={handleSave} disabled={saving || !newItem.name}>
                    <Check size={16} />{uiT("saveConfig")}
                </Button>
            </div>
        </>}>
                    <fieldset disabled={saving} className="min-w-0 flex flex-col gap-4">
                        <FormSection title={uiT("identity")}>
                            <div className="flex min-w-0 max-w-2xl flex-col gap-4">
                                <SettingInputVertical label={uiT("configIdentifier")} value={newItem.name} disabled={isEdit} onChange={(name) => setNewItem(prev => ({ ...prev, name }))} placeholder="internal-sub" />
                            </div>
                        </FormSection>
                        <FormSection title={uiT("connection")}>
                            <div className="flex min-w-0 max-w-2xl flex-col gap-4">
                                <SettingInputVertical label={uiT("displayAddress")} value={newItem.address} onChange={(address) => setNewItem(prev => ({ ...prev, address }))} placeholder="example.com:443" />
                                <SettingInputVertical label={uiT("path")} value={newItem.path} onChange={(path) => setNewItem(prev => ({ ...prev, path }))} placeholder="custom/path" />
                                <SettingInputVertical label={uiT("password")} value={newItem.password} onChange={(password) => setNewItem(prev => ({ ...prev, password }))} placeholder={uiT("optionalPassword")} />
                                <SwitchCard
                                    label={uiT("allowInsecureHttp")}
                                    checked={newItem.insecure}
                                    onCheckedChange={(insecure) => setNewItem(prev => ({ ...prev, insecure }))}
                                />
                            </div>
                        </FormSection>
                        <FormSection title={uiT("nodes")}>
                            {show && <NodePicker value={newItem.points} disabled={saving} enabledOnly={false} onChange={points => setNewItem(prev => ({ ...prev, points }))} />}
                        </FormSection>
                    </fieldset>
                </ResourceEditorFrame>;
};

function PublishPage() {
    const { t: uiT } = useTranslation('ui');
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR('/api/v2/publishes', listPublishes);
    const [query, setQuery] = useState('');
    const items = data?.items ?? [];
    const selection = useResourceSelection(items.map(item => item.name));
    const editing = items.find(item => item.name === selection.id);
    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(false, pending, () => undefined);
    if (error && !data) return <Loading onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    const remove = async () => {
        if (!editing || !await confirmAction(uiT('deletePublishConfig'))) return;
        void run(async () => { await deletePublish(editing.name); selection.close(); await mutate(); });
    };
    return <MainContainer className="max-w-[1440px]">
        <ResourceWorkspace createDisabled={selection.creating} title={uiT('publish')} description={uiT('shareSelectedNodesAsPublishConfigs')} selectedId={selection.id} editing={selection.creating || Boolean(editing)}
            onSelect={selection.select} onCreate={() => selection.create()} search={{ value: query, onChange: setQuery }}
            items={items.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())).map(item => ({ id: item.name, name: item.name, icon: <Share2 />, description: `${item.points.length} ${uiT('nodesLabel')} · ${item.address}/${item.path}` }))}>
            <fieldset disabled={pending} className="min-w-0" aria-busy={pending}>
                <EditModal presentation="inline" show isEdit={!selection.creating} item={editing ?? defaultPublish()} onHide={selection.close} onDelete={remove}
                    mutatePub={() => void mutate()} onSaved={item => { void mutate(previous => ({ items: [...(previous?.items ?? []).filter(value => value.name !== item.name), item] }), { revalidate: true }); selection.saved(item.name); }} />
            </fieldset>
        </ResourceWorkspace>
    </MainContainer>;
}

export default PublishPage;
