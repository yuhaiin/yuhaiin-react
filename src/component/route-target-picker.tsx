import { getNode } from '@/api/nodes';
import { NodeSelectionDialog } from './node-select';
import { listSelectors } from '@/api/selectors';
import { SelectorEditor } from '@/component/selector-editor';
import { NodeModal } from '@/docs/node/modal';
import { Button } from '@/component/v2/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Select, type SelectItem } from '@/component/v2/select';
import type { RouteTarget } from '@/contract/route';
import useSWR, { useSWRConfig } from 'swr';
import { useTranslation } from 'react-i18next';

export function RouteTargetPicker({ value, onChange, compact = false }: { value: RouteTarget; onChange: (value: RouteTarget) => void; compact?: boolean }) {
    const { t } = useTranslation('routing');
    const [creatingNode, setCreatingNode] = useState(false);
    const [creatingSelector, setCreatingSelector] = useState(false);
    const [choosingNode, setChoosingNode] = useState(false);
    const { mutate } = useSWRConfig();
    const { data: node, error: nodeError } = useSWR(value.type === 'node' && value.id ? ['/api/v2/nodes/detail', value.id] : null, () => getNode(value.id!), { revalidateOnFocus: false });
    const { data: selectors, error: selectorError, mutate: refreshSelectors } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const selected = value.type === 'node' || value.type === 'selector' ? `${value.type}:${value.id ?? ''}` : 'default';
    const items: SelectItem[] = [
        { value: 'default', label: t('defaultProxy') },
        ...(selectors?.items ?? []).map(item => ({ value: `selector:${item.id}`, label: `${t('selector')}: ${item.name}` })),
        { value: 'choose-node', label: t('chooseNode') },
    ];
    if (!items.some(item => item.value === selected)) items.push({ value: selected, label: node?.name || (value.type === 'node' && !nodeError ? value.id ?? '' : `${t('unavailableDestination')}: ${value.id}`) });
    const chooseNode = (node: Awaited<ReturnType<typeof getNode>>) => {
        void mutate(['/api/v2/nodes/detail', node.id], node, { revalidate: false });
        onChange({ type: 'node', id: node.id });
    };
    return <div className="space-y-2">
        <NodeModal show={creatingNode} isNew editable groups={["manual"]} onHide={() => setCreatingNode(false)}
            onSave={chooseNode} />
        <SelectorEditor item={creatingSelector ? null : undefined} onClose={() => setCreatingSelector(false)}
            onSaved={selector => { setCreatingSelector(false); void refreshSelectors(); onChange({ type: 'selector', id: selector.id }); }} />
        <Select ariaLabel={t("destination")} value={selected} items={items} onValueChange={next => {
            if (next === 'choose-node') { setChoosingNode(true); return; }
            const [type, ...parts] = next.split(':');
            onChange(type === 'default' ? { type } : { type, id: parts.join(':') });
        }} />
        <NodeSelectionDialog open={choosingNode} label={t('chooseNode')} value={value.type === 'node' ? value.id ?? '' : ''}
            selected={node} onClose={() => setChoosingNode(false)} onChange={chooseNode} />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Button size="sm" variant="outline-secondary" className={compact ? "h-auto border-transparent px-0 py-1 text-xs" : undefined} onClick={() => setCreatingNode(true)}><Plus size={12} aria-hidden="true" className="mr-1" />{t('addNode')}</Button>
            <Button size="sm" variant="outline-secondary" className={compact ? "h-auto border-transparent px-0 py-1 text-xs" : undefined} onClick={() => setCreatingSelector(true)}><Plus size={12} aria-hidden="true" className="mr-1" />{t('newSelector')}</Button>
        </div>
        {(nodeError || selectorError) && <p role="alert" className="text-sm text-ui-danger">{t('destinationsFailed')}</p>}
    </div>;
}
