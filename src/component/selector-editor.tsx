import { collectPages } from '@/api/paging';
import { listNodes } from '@/api/nodes';
import { deleteSelector, saveSelector, selectorReferences } from '@/api/selectors';
import { Button } from '@/component/v2/button';
import { SettingInputVertical } from '@/component/v2/forms';
import { Select } from '@/component/v2/select';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { GlobalToastContext } from '@/component/v2/toast';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import type { Selector } from '@/contract/node';
import { Plus, Trash } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { NodeModal } from '@/docs/node/modal';

const emptySelector = (): Selector => ({ id: "", name: "", nodeId: "", revision: 0 });

export function SelectorEditor({ item, onClose, onSaved }: { item: Selector | null | undefined; onClose: () => void; onSaved: (selector: Selector) => void }) {
    const { t } = useTranslation('routing');
    const ctx = useContext(GlobalToastContext);
    const open = item !== undefined;
    const [creatingNode, setCreatingNode] = useState(false);
    const { value, setValue, dirty, commit } = useEditorDraft(open ? item?.id || 'new-selector' : null, item ?? undefined, emptySelector);
    const { data: nodes, error: nodeError, mutate: refreshNodes } = useSWR(open ? '/api/v2/nodes/all' : null, () => collectPages(listNodes));
    const { data: refs, error: refsError } = useSWR(item?.id ? ['/api/v2/outbound/selector/references', item.id] : null, () => selectorReferences(item!.id));
    const [actionError, setActionError] = useState('');
    useEffect(() => { setActionError(''); setCreatingNode(false); }, [open, item?.id]);
    const { pending, run } = useAsyncAction(error => {
        const message = error instanceof Error ? error.message : String((error as { msg?: string }).msg ?? error);
        setActionError(message);
        ctx.Error(message);
    });
    const close = useCloseGuard(dirty, pending, onClose);
    const save = () => { setActionError(''); void run(async () => { const saved = await saveSelector(value); commit(saved); onSaved(saved); }); };
    const remove = () => {
        if (!item || !window.confirm(t('deleteSelectorConfirm'))) return;
        setActionError(''); void run(async () => { await deleteSelector(item.id); onSaved(item); });
    };
    return <>
        <NodeModal show={creatingNode} isNew editable groups={["manual"]} onHide={() => setCreatingNode(false)} onSave={node => { setValue(previous => ({ ...previous, nodeId: node.id })); void refreshNodes(); }} />
        <Modal open={open} onOpenChange={next => !next && close()}><ModalContent width={600}>
        <ModalHeader closeButton><ModalTitle>{item?.name ?? t('newSelector')}</ModalTitle></ModalHeader>
        <ModalBody><fieldset disabled={pending} className="space-y-4">
            <SettingInputVertical label={t('name')} value={value.name} onChange={name => setValue(prev => ({ ...prev, name }))} />
            <label className="block space-y-2"><span className="text-sm font-semibold">{t('selectedNode')}</span>
                <Select ariaLabel={t("selectedNode")} value={value.nodeId} onValueChange={nodeId => setValue(prev => ({ ...prev, nodeId }))} items={(nodes?.items ?? []).filter(node => node.enabled).map(node => ({ value: node.id, label: node.group ? `${node.name} · ${node.group}` : node.name }))} />
            </label>
            <Button size="sm" variant="outline-secondary" onClick={() => setCreatingNode(true)}><Plus size={16} />{t("addNode")}</Button>
            {refs && <div className="space-y-2 text-sm"><details><summary className="cursor-pointer text-ui-muted">{t('impact', { count: refs.items.length })}</summary><ul className="mt-2 max-h-48 overflow-auto list-disc pl-5">{refs.items.map(ref => <li key={`${ref.kind}:${ref.id}`}>{ref.name}</li>)}</ul></details></div>}
            {(nodeError || refsError) && <p role="alert" className="text-sm text-ui-danger">{t('loadFailed')}</p>}
            {actionError && <p role="alert" className="text-sm text-ui-danger">{actionError}</p>}
        </fieldset></ModalBody>
        <ModalFooter className="flex flex-wrap justify-between gap-2">
            <div>{item && <Button variant="outline-danger" disabled={pending || !refs || refs.items.length > 0} onClick={remove}><Trash size={16} />{t('delete')}</Button>}</div>
            <div className="flex gap-2"><Button disabled={pending} onClick={close}>{t('cancel')}</Button><Button disabled={pending || !value.name.trim() || !value.nodeId || Boolean(nodeError)} onClick={save}>{t('save')}</Button></div>
        </ModalFooter>
    </ModalContent></Modal></>;
}
