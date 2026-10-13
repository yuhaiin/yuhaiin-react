import { WorkspaceSelectionMarker } from '@/component/workspace-layout';
import type { RuleItem } from '@/contract/route';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useId } from 'react';
import { useRuleDrag, type RuleDrop } from './rule-drag';
import { getNode } from '@/api/nodes';
import useSWR from 'swr';

export function RuleList({ items, selectedId, onOpen, onMove, onDrop, destinations, resolverNames, busy, page, pageSize, total, filtered }: {
    items: RuleItem[];
    selectedId?: string;
    destinations: Record<string, string>;
    resolverNames: Record<string, string>;
    busy: boolean;
    page: number;
    pageSize: number;
    total: number;
    filtered: boolean;
    onOpen: (item: RuleItem) => void;
    onMove: (item: RuleItem, direction: -1 | 1) => void;
    onDrop: (item: RuleItem, drop: RuleDrop) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const hasPreviousPage = page > 1;
    const hasNextPage = total > (page - 1) * pageSize + items.length;
    const helpId = useId();
    const { listRef, drag, start } = useRuleDrag(items, busy || filtered || total < 2, onDrop);
    return <>
        <p id={helpId} className="sr-only">{t('dragRuleHelp')}</p>
        <ul ref={listRef} className="m-0 list-none space-y-1 p-0" aria-label={uiT('routeRules')}>
        {items.map((item, index) => {
            const proxy = item.mode === 'proxy';
            const destination = !item.target.type || item.target.type === 'default'
                ? t('defaultProxy') : destinations[`${item.target.type}:${item.target.id}`] ?? t('unavailableDestination');
            const selected = item.id === selectedId;
            const canMoveUp = !filtered && !busy && (index > 0 || hasPreviousPage);
            const canMoveDown = !filtered && !busy && (index + 1 < items.length || hasNextPage);
            return <li key={item.id} data-rule-id={item.id} className={clsx(
                'group relative flex min-w-0 items-center rounded-ui-md transition-colors',
                selected ? 'bg-ui-primary-soft/70' : 'hover:bg-ui-surface-muted/75', drag?.source.id === item.id && 'opacity-35'
            )}>
                {selected && <WorkspaceSelectionMarker />}
                {drag?.target?.target.id === item.id && <span aria-hidden="true" className={clsx('pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-ui-primary', drag.target.placement === 'insert_before' ? 'top-0' : 'bottom-0')} />}
                <button type="button" disabled={busy || filtered || total < 2} aria-label={t('dragRule', { name: item.name })} aria-describedby={helpId}
                    title={t('dragRuleHelp')} onPointerDown={event => start(event, item)} onContextMenu={event => event.preventDefault()}
                    onKeyDown={event => {
                        if (event.key === 'ArrowUp' && canMoveUp || event.key === 'ArrowDown' && canMoveDown) {
                            event.preventDefault(); onMove(item, event.key === 'ArrowUp' ? -1 : 1);
                        }
                    }}
                    className="flex h-11 w-7 shrink-0 touch-pan-y cursor-grab items-center justify-center rounded-ui-md text-ui-muted/70 hover:text-ui-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus active:cursor-grabbing disabled:cursor-default disabled:opacity-25 max-sm:w-11">
                    <GripVertical size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-current={selected ? 'true' : undefined} aria-label={item.name} title={item.name} onClick={() => onOpen(item)}
                    className="min-w-0 flex-1 rounded-ui-md py-2.5 pl-0 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus">
                    <div className={clsx('min-w-0', item.disabled && 'opacity-60')}>
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-ui-muted">#{item.index}</span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ui-heading">{item.name}</span>
                            {!item.disabled && <span aria-label={uiT('enabled')} className="h-1.5 w-1.5 shrink-0 rounded-full bg-ui-success" />}
                        </div>
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 pl-8 text-xs">
                            <span className={clsx('shrink-0 font-medium', item.mode === 'block' ? 'text-ui-danger' : item.mode === 'direct' ? 'text-ui-success' : 'text-ui-primary')}>
                                {t(item.mode, { defaultValue: item.mode })}
                            </span>
                            {proxy && <span className="min-w-0 truncate text-ui-muted">· {item.target.type === 'node' && item.target.id ? <NodeName id={item.target.id} /> : destination}</span>}
                        </div>
                        <div className="mt-1 truncate pl-8 text-[11px] text-ui-muted">
                            {item.disabled && `${uiT('off')} · `}{t('matchingConditions', { count: item.ruleCount })}
                            {item.resolver && ` · ${resolverNames[item.resolver] ?? item.resolver}`}
                        </div>
                    </div>
                </button>
            </li>;
        })}
        {!items.length && <li className="py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
        </ul>
        {drag && <>
            <div aria-hidden="true" className="pointer-events-none fixed z-[1060] flex min-w-0 items-center gap-2 rounded-ui-md border border-ui-primary/40 bg-ui-surface px-3 py-3 text-sm shadow-ui-elevated"
                style={{ left: drag.left, top: drag.y - drag.offset, width: drag.width }}>
                <GripVertical size={16} className="shrink-0 text-ui-primary" /><span className="min-w-0 truncate font-medium text-ui-heading">{drag.source.name}</span>
            </div>
            <span role="status" className="sr-only">{t('draggingRule', { name: drag.source.name })}</span>
        </>}
    </>;
}

function NodeName({ id }: { id: string }) {
    const { data } = useSWR(['/api/v2/nodes/detail', id], () => getNode(id), { revalidateOnFocus: false });
    return <span title={data?.name ?? id}>{data?.name ?? id}</span>;
}
