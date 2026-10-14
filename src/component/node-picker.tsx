import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { getNode } from '@/api/nodes';
import { NodeSelectionDialog } from './node-select';
import { Button } from '@/component/v2/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

export default function NodePicker({ value, onChange, disabled = false, excludeId, enabledOnly = true }: {
    value: string[]; onChange: (ids: string[]) => void; disabled?: boolean; excludeId?: string; enabledOnly?: boolean;
}) {
    const { t } = useTranslation('routing');
    const [open, setOpen] = useState(false);
    const { mutate } = useSWRConfig();
    const move = (index: number, direction: -1 | 1) => {
        const next = [...value];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        onChange(next);
    };
    return <div className="grid gap-3">
        <ol className="m-0 list-none divide-y divide-ui-border p-0">{value.map((id, index) => <SelectedNode key={id} id={id} index={index} disabled={disabled} last={index === value.length - 1}
            onMove={direction => move(index, direction)} onRemove={() => onChange(value.filter(item => item !== id))} />)}</ol>
        {!disabled && <Button type="button" variant="outline-secondary" className="justify-start gap-2" onClick={() => setOpen(true)}><Plus size={16} aria-hidden="true" />{t('chooseNode')}</Button>}
        <NodeSelectionDialog open={open} label={t('chooseNode')} value="" multiple={value} excludeId={excludeId} enabledOnly={enabledOnly} disabled={disabled} onClose={() => setOpen(false)}
            onChange={node => {
                if (node.id === excludeId) return;
                void mutate(['/api/v2/nodes/detail', node.id], node, { revalidate: false });
                onChange(value.includes(node.id) ? value.filter(id => id !== node.id) : [...value, node.id]);
            }} />
    </div>;
}

function SelectedNode({ id, index, disabled, last, onMove, onRemove }: {
    id: string; index: number; disabled: boolean; last: boolean; onMove: (direction: -1 | 1) => void; onRemove: () => void;
}) {
    const { t } = useTranslation('routing');
    const { data } = useSWR(['/api/v2/nodes/detail', id], () => getNode(id), { revalidateOnFocus: false });
    const name = data?.name || id;
    return <li className="flex min-h-11 max-w-full items-center gap-2 py-2 text-sm">
        <span className="w-5 shrink-0 text-xs tabular-nums text-ui-muted">{index + 1}</span><span className="min-w-0 flex-1 truncate" title={name}>{name}</span>
        {!disabled && <div className="flex shrink-0 gap-1">
            <Button size="icon" variant="ghost" disabled={index === 0} aria-label={`${t('moveEarlier')} ${name}`} onClick={() => onMove(-1)}><ArrowUp size={14} /></Button>
            <Button size="icon" variant="ghost" disabled={last} aria-label={`${t('moveLater')} ${name}`} onClick={() => onMove(1)}><ArrowDown size={14} /></Button>
            <Button size="icon" variant="ghost" aria-label={`${t('delete')} ${name}`} onClick={onRemove}><X size={14} /></Button>
        </div>}
    </li>;
}
