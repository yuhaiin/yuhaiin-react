import { collectPages } from '@/api/paging';
import { listNodes } from '@/api/nodes';
import { listSelectors } from '@/api/selectors';
import { SelectorEditor } from '@/component/selector-editor';
import { NodeModal } from '@/docs/node/modal';
import { Button } from '@/component/v2/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Select, type SelectItem } from '@/component/v2/select';
import type { RouteTarget } from '@/contract/route';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';

export function RouteTargetPicker({ value, onChange, compact = false }: { value: RouteTarget; onChange: (value: RouteTarget) => void; compact?: boolean }) {
    const { t } = useTranslation('routing');
    const [creatingNode, setCreatingNode] = useState(false);
    const [creatingSelector, setCreatingSelector] = useState(false);
    const { data: nodes, error: nodeError, mutate: refreshNodes } = useSWR('/api/v2/nodes/all', () => collectPages(listNodes));
    const { data: selectors, error: selectorError, mutate: refreshSelectors } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const selected = value.type === 'node' || value.type === 'selector' ? `${value.type}:${value.id ?? ''}` : 'default';
    const items: SelectItem[] = [
        { value: 'default', label: t('defaultProxy') },
        ...(selectors?.items ?? []).map(item => ({ value: `selector:${item.id}`, label: `${t('selector')}: ${item.name}` })),
        ...(nodes?.items ?? []).filter(item => item.enabled).map(item => ({ value: `node:${item.id}`, label: item.group ? `${item.name} · ${item.group}` : item.name })),
    ];
    if (!items.some(item => item.value === selected)) items.push({ value: selected, label: `${t('unavailableDestination')}: ${value.id}` });
    return <div className="space-y-2">
        <NodeModal show={creatingNode} isNew editable groups={["manual"]} onHide={() => setCreatingNode(false)}
            onSave={node => { void refreshNodes(); onChange({ type: 'node', id: node.id }); }} />
        <SelectorEditor item={creatingSelector ? null : undefined} onClose={() => setCreatingSelector(false)}
            onSaved={selector => { setCreatingSelector(false); void refreshSelectors(); onChange({ type: 'selector', id: selector.id }); }} />
        <Select ariaLabel={t("destination")} value={selected} items={items} onValueChange={next => {
            const [type, ...parts] = next.split(':');
            onChange(type === 'default' ? { type } : { type, id: parts.join(':') });
        }} />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Button size="sm" variant="outline-secondary" className={compact ? "h-auto border-transparent px-0 py-1 text-xs" : undefined} onClick={() => setCreatingNode(true)}><Plus size={12} aria-hidden="true" className="mr-1" />{t('addNode')}</Button>
            <Button size="sm" variant="outline-secondary" className={compact ? "h-auto border-transparent px-0 py-1 text-xs" : undefined} onClick={() => setCreatingSelector(true)}><Plus size={12} aria-hidden="true" className="mr-1" />{t('newSelector')}</Button>
        </div>
        {(nodeError || selectorError) && <p role="alert" className="text-sm text-ui-danger">{t('destinationsFailed')}</p>}
    </div>;
}
