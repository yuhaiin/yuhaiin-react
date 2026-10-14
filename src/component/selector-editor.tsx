import { deleteSelector, saveSelector, selectorReferences } from '@/api/selectors';
import { Button } from '@/component/v2/button';
import { SettingInputVertical } from '@/component/v2/forms';
import { NodeSelect } from './node-select';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { GlobalToastContext } from '@/component/v2/toast';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import type { Selector } from '@/contract/node';
import { ArrowLeft, Plus, Save, Trash } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

import { NodeModal } from '@/docs/node/modal';

const emptySelector = (): Selector => ({ id: "", name: "", nodeId: "", revision: 0 });

export function SelectorEditor({ item, onClose, onSaved, onDeleted, presentation = 'modal', onStateChange }: {
    item: Selector | null | undefined; onClose: () => void; onSaved: (selector: Selector) => void;
    onDeleted?: (selector: Selector) => void; presentation?: 'modal' | 'inline';
    onStateChange?: (state: { dirty: boolean; pending: boolean }) => void;
}) {
    const { t } = useTranslation('routing');
    const ctx = useContext(GlobalToastContext);
    const { mutate: refreshCache } = useSWRConfig();
    const open = item !== undefined;
    const [creatingNode, setCreatingNode] = useState(false);
    const { value, setValue, dirty, commit } = useEditorDraft(open ? item?.id || 'new-selector' : null, item ?? undefined, emptySelector);
    const { data: refs, error: refsError } = useSWR(item?.id ? ['/api/v2/outbound/selector/references', item.id] : null, () => selectorReferences(item!.id));
    const [actionError, setActionError] = useState('');
    // A different selector (or opening session) starts with clean local UI state.
    const [session, setSession] = useState({ open, id: item?.id });
    if (session.open !== open || session.id !== item?.id) {
        setSession({ open, id: item?.id });
        setActionError('');
        setCreatingNode(false);
    }
    const { pending, run } = useAsyncAction(error => {
        const message = error instanceof Error ? error.message : String((error as { msg?: string }).msg ?? error);
        setActionError(message);
        ctx.Error(message);
    });
    useEffect(() => { onStateChange?.({ dirty, pending }); }, [dirty, pending, onStateChange]);
    const close = useCloseGuard(dirty, pending, onClose);
    const save = () => { setActionError(''); void run(async () => { const saved = await saveSelector(value); commit(saved); onSaved(saved); }); };
    const remove = () => {
        if (!item || !window.confirm(t('deleteSelectorConfirm'))) return;
        setActionError(''); void run(async () => { await deleteSelector(item.id); (onDeleted ?? onSaved)(item); });
    };
    const body = <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 [--field-margin:0px]">
        <SettingInputVertical label={t('name')} value={value.name} onChange={name => setValue(prev => ({ ...prev, name }))} />
        <div className="space-y-2"><span className="text-[13px] font-medium text-ui-muted">{t('selectedNode')}</span>
            <NodeSelect label={t('selectedNode')} value={value.nodeId} disabled={pending} onChange={node => { void refreshCache(['/api/v2/nodes/detail', node.id], node, { revalidate: false }); setValue(prev => ({ ...prev, nodeId: node.id })); }} />
        </div>
        <Button size="sm" variant="outline-secondary" onClick={() => setCreatingNode(true)}><Plus size={16} />{t("addNode")}</Button>
        {refs && <div className="space-y-2 text-sm"><details><summary className="cursor-pointer text-ui-muted">{t('impact', { count: refs.items.length })}</summary><ul className="mt-2 max-h-48 overflow-auto list-disc pl-5">{refs.items.map(ref => <li key={`${ref.kind}:${ref.id}`}>{ref.name}</li>)}</ul></details></div>}
        {refsError && <p role="alert" className="text-sm text-ui-danger">{t('loadFailed')}</p>}
        {actionError && <p role="alert" className="text-sm text-ui-danger">{actionError}</p>}
        </fieldset>;
    const footer = <>
        <div>{item && <Button variant="outline-danger" disabled={pending || !refs || refs.items.length > 0} onClick={remove}><Trash size={16} className="mr-1.5" aria-hidden="true" />{t('delete')}</Button>}</div>
        <div className="flex gap-2"><Button disabled={pending} onClick={close}>{t('cancel')}</Button><Button loading={pending} variant="primary" className="gap-2" disabled={pending || !value.name.trim() || !value.nodeId} onClick={save}><Save size={15} aria-hidden="true" />{t('save')}</Button></div>
    </>;
    return <>
        <NodeModal show={creatingNode} isNew editable groups={["manual"]} onHide={() => setCreatingNode(false)} onSave={node => { setValue(previous => ({ ...previous, nodeId: node.id })); }} />
        {presentation === 'inline' ? open && <section aria-label={t('selectorDetails')} className="min-w-0">
            <header className="mb-5 border-b border-ui-border/60 pb-5">
                <Button size="sm" variant="outline-secondary" className="mb-3 gap-2 border-transparent md:hidden" onClick={close}><ArrowLeft size={16} aria-hidden="true" />{t('backToSelectors')}</Button>
                <p className="mb-1 text-xs font-medium text-ui-muted">{t('selectorDetails')}</p>
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="break-words text-xl font-semibold tracking-tight text-ui-heading">{value.name || t('newSelector')}</h2>
                    {dirty && <span role="status" className="text-xs text-ui-warning">{t('unsavedChanges')}</span>}</div>
            </header>
            {body}
            <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ui-border/60 pt-4">{footer}</footer>
        </section> : <Modal open={open} onOpenChange={next => !next && close()}><ModalContent width={600}>
            <ModalHeader closeButton><ModalTitle>{item?.name ?? t('newSelector')}</ModalTitle></ModalHeader>
            <ModalBody>{body}</ModalBody>
            <ModalFooter className="flex flex-wrap justify-between gap-2">{footer}</ModalFooter>
        </ModalContent></Modal>}
    </>;
}
