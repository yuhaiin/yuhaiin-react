import { listNodeGroups, selectNodes, selectedNodes } from '@/api/nodes';
import { nodeGroupName, type Node } from '@/contract/node';
import { GroupNodeSelect } from '@/component/group-node-select';
import { Button } from '@/component/v2/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const empty = () => ({ tcpId: '', udpId: '' });

export function DefaultSelectionEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { t } = useTranslation('routing');
    const { data: selection, error: selectionError, mutate } = useSWR(open ? '/api/v2/nodes/selected' : null, selectedNodes);
    const { data: groups, error: groupsError, mutate: retryGroups } = useSWR(
        open ? '/api/v2/nodes/groups' : null, listNodeGroups, { revalidateOnFocus: false },
    );
    const server = useMemo(() => selection ? { tcpId: selection.tcp?.id ?? '', udpId: selection.udp?.id ?? '' } : undefined, [selection]);
    const { value, setValue, commit, dirty } = useEditorDraft(open ? 'default-selection' : null, server, empty);
    const [error, setError] = useState('');
    const [cachedNodes, setCachedNodes] = useState<Record<string, Node>>({});
    const [expanded, setExpanded] = useState(false);
    const [previousOpen, setPreviousOpen] = useState(open);
    if (previousOpen !== open) {
        setPreviousOpen(open);
        setError('');
        if (!open) {
            setCachedNodes({});
            setExpanded(false);
        }
    }
    const { pending, run } = useAsyncAction(error => setError(String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(dirty, pending, onClose);
    const mixed = value.tcpId !== value.udpId;
    const showSeparate = mixed || expanded;
    const selected = (id: string) => cachedNodes[id]
        ?? (selection?.tcp?.id === id ? selection.tcp : undefined)
        ?? (selection?.udp?.id === id ? selection.udp : undefined);
    const tcpNode = selected(value.tcpId);
    const setNode = (node: Node, protocol: 'both' | 'tcp' | 'udp') => {
        setCachedNodes(previous => ({ ...previous, [node.id]: node }));
        setValue(previous => protocol === 'both' ? { tcpId: node.id, udpId: node.id }
            : { ...previous, [protocol === 'tcp' ? 'tcpId' : 'udpId']: node.id });
    };
    const save = () => void run(async () => {
        setError('');
        await selectNodes(value);
        commit(value);
        await mutate();
        onClose();
    });
    return <Modal open={open} onOpenChange={next => !next && close()}><ModalContent width={650}>
        <ModalHeader closeButton><ModalTitle>{t('defaultDestination')}</ModalTitle></ModalHeader>
        <ModalBody>
            <fieldset disabled={pending || !selection || Boolean(selectionError)} className="space-y-4">
                <p className="text-sm text-ui-muted">{t('defaultDestinationHelp')}</p>
                {groups && <GroupNodeSelect key="both" label={t('combinedDestination')} value={mixed ? '' : value.tcpId}
                    selected={mixed ? undefined : tcpNode} preferredGroup={tcpNode && nodeGroupName(tcpNode)} groups={groups.items}
                    enabled={open && !pending} onChange={node => setNode(node, 'both')} />}
                <details open={showSeparate} onToggle={event => setExpanded(event.currentTarget.open)}>
                    <summary className="cursor-pointer text-sm font-medium">{t('separateDestinations')}</summary>
                    {showSeparate && groups && <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <GroupNodeSelect label="TCP" value={value.tcpId} selected={selected(value.tcpId)}
                            groups={groups.items} enabled={open && !pending} onChange={node => setNode(node, 'tcp')} />
                        <GroupNodeSelect label="UDP" value={value.udpId} selected={selected(value.udpId)}
                            groups={groups.items} enabled={open && !pending} onChange={node => setNode(node, 'udp')} />
                    </div>}
                </details>
            </fieldset>
            {groupsError && <div role="alert" className="mt-3 flex items-center gap-2 text-sm text-ui-danger">
                {t('destinationsFailed')} <Button size="sm" variant="outline-secondary" onClick={() => void retryGroups()}>{t('retry')}</Button>
            </div>}
            {selectionError && <p role="alert" className="mt-3 text-sm text-ui-danger">{t('destinationsFailed')}</p>}
            {error && <p role="alert" className="mt-3 text-sm text-ui-danger">{error}</p>}
        </ModalBody>
        <ModalFooter><Button disabled={pending} onClick={close}>{t('cancel')}</Button>
            <Button disabled={pending || !selection || !value.tcpId || !value.udpId || Boolean(selectionError)} onClick={save}>{t('save')}</Button></ModalFooter>
    </ModalContent></Modal>;
}
