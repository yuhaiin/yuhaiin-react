import { listNodes, selectNodes, selectedNodes } from '@/api/nodes';
import { collectPages } from '@/api/paging';
import { Button } from '@/component/v2/button';
import { SettingSelectVertical } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const empty = () => ({ tcpId: '', udpId: '' });

export function DefaultSelectionEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { t } = useTranslation('routing');
    const { data: selection, error: selectionError, mutate } = useSWR(open ? '/api/v2/nodes/selected' : null, selectedNodes);
    const { data: nodes, error: nodesError } = useSWR(open ? '/api/v2/nodes/all' : null, () => collectPages(listNodes));
    const server = useMemo(() => selection ? { tcpId: selection.tcp?.id ?? '', udpId: selection.udp?.id ?? '' } : undefined, [selection]);
    const { value, setValue, commit, dirty } = useEditorDraft(open ? 'default-selection' : null, server, empty);
    const [error, setError] = useState('');
    const [previousOpen, setPreviousOpen] = useState(open);
    if (previousOpen !== open) {
        setPreviousOpen(open);
        setError('');
    }
    const { pending, run } = useAsyncAction(error => setError(String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(dirty, pending, onClose);
    const options: [string, string][] = (nodes?.items ?? []).filter(node => node.enabled).map(node => [node.group ? `${node.name} · ${node.group}` : node.name, node.id]);
    for (const id of [value.tcpId, value.udpId]) {
        if (id && !options.some(option => option[1] === id)) options.push([t('unavailableDestination'), id]);
    }
    const mixed = value.tcpId !== value.udpId;
    const save = () => void run(async () => {
        setError(''); await selectNodes(value); commit(value); await mutate(); onClose();
    });
    return <Modal open={open} onOpenChange={next => !next && close()}><ModalContent width={650}>
        <ModalHeader closeButton><ModalTitle>{t('defaultDestination')}</ModalTitle></ModalHeader>
        <ModalBody><fieldset disabled={pending || !selection || !nodes || Boolean(selectionError || nodesError)} className="space-y-4">
            <p className="text-sm text-ui-muted">{t('defaultDestinationHelp')}</p>
            <SettingSelectVertical label={t('combinedDestination')} value={mixed ? '' : value.tcpId} values={options}
                emptyChoose emptyChooseName={t(mixed ? 'separateDestinations' : 'chooseNode')}
                onChange={id => id && setValue({ tcpId: id, udpId: id })} />
            <details open={mixed || undefined}>
                <summary className="cursor-pointer text-sm font-medium">{t('separateDestinations')}</summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SettingSelectVertical label="TCP" value={value.tcpId} values={options} emptyChoose emptyChooseName={t('chooseNode')}
                        onChange={tcpId => tcpId && setValue(previous => ({ ...previous, tcpId }))} />
                    <SettingSelectVertical label="UDP" value={value.udpId} values={options} emptyChoose emptyChooseName={t('chooseNode')}
                        onChange={udpId => udpId && setValue(previous => ({ ...previous, udpId }))} />
                </div>
            </details>
        </fieldset>
        {(selectionError || nodesError) && <p role="alert" className="text-sm text-ui-danger">{t('destinationsFailed')}</p>}
        {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
        </ModalBody>
        <ModalFooter><Button disabled={pending} onClick={close}>{t('cancel')}</Button>
            <Button disabled={pending || !nodes || !selection || !value.tcpId || !value.udpId || Boolean(selectionError || nodesError)} onClick={save}>{t('save')}</Button></ModalFooter>
    </ModalContent></Modal>;
}
