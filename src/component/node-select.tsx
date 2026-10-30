import { getNode, listNodeGroups } from '@/api/nodes';
import type { Node } from '@/contract/node';
import { GroupNodeSelect } from './group-node-select';
import { Button } from './v2/button';
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from './v2/modal';
import { ChevronDown, Network } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function NodeSelectionDialog({ open, value, selected, preferredGroup, label, disabled = false, onClose, onChange, multiple, excludeId, enabledOnly = true }: {
    open: boolean; value: string; selected?: Node; preferredGroup?: string; label: string; disabled?: boolean;
    onClose: () => void; onChange: (node: Node) => void;
    multiple?: string[]; enabledOnly?: boolean;
    excludeId?: string;
}) {
    const { t } = useTranslation('routing');
    const { data, error, mutate } = useSWR(open ? '/api/v2/nodes/groups' : null, listNodeGroups, { revalidateOnFocus: false });
    return <Modal open={open} onOpenChange={next => !next && onClose()}><ModalContent width={600}>
        <ModalHeader closeButton><ModalTitle>{label}</ModalTitle></ModalHeader>
        <ModalBody>
            {error ? <div role="alert" className="text-sm text-ui-danger">{t('nodePickerFailed')} <Button size="sm" onClick={() => void mutate()}>{t('retry')}</Button></div>
                : !data ? <p role="status" className="text-sm text-ui-muted">{t('loading')}</p>
                    : open && <GroupNodeSelect label={label} value={value} selected={selected} preferredGroup={preferredGroup} groups={data.items} disabled={disabled} multiple={multiple} excludeId={excludeId} enabledOnly={enabledOnly}
                        onChange={node => { onChange(node); if (!multiple) onClose(); }} />}
        </ModalBody>
    </ModalContent></Modal>;
}

/** Only the current node is read until the user opens the grouped browser. */
export function NodeSelect({ value, onChange, label, disabled = false }: {
    value: string; onChange: (node: Node) => void; label: string; disabled?: boolean;
}) {
    const { t } = useTranslation('routing');
    const [open, setOpen] = useState(false);
    const { data: selected } = useSWR(value ? ['/api/v2/nodes/detail', value] : null, () => getNode(value), { revalidateOnFocus: false });
    return <>
        <Button type="button" variant="outline-secondary" disabled={disabled} aria-label={label} aria-haspopup="dialog"
            className="w-full min-w-0 justify-between gap-3 text-left font-normal" onClick={() => setOpen(true)}>
            <span className="flex min-w-0 items-center gap-2"><Network size={15} className="shrink-0 text-ui-muted" aria-hidden="true" /><span className="min-w-0 truncate">{selected?.name || value || t('chooseNode')}</span></span><ChevronDown size={16} className="shrink-0 text-ui-muted" />
        </Button>
        <NodeSelectionDialog open={open} value={value} selected={selected} label={label} disabled={disabled} onClose={() => setOpen(false)} onChange={onChange} />
    </>;
}
