import { StageChangeButton } from "@/component/configuration-change";
import { WorkspaceSelectionMarker } from '@/component/workspace-layout';
import type { RuleItem } from '@/contract/route';
import clsx from 'clsx';
import { ArrowRight, ArrowUpRight, Ban, GripVertical, Network, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useId } from 'react';
import { useRuleDrag, type RuleDrop } from './rule-drag';
import { getNode } from '@/api/nodes';
import useSWR from 'swr';

const MODE_STYLES: Record<string, { icon: LucideIcon; color: string }> = {
    proxy: { icon: ArrowUpRight, color: 'text-ui-primary' },
    gateway: { icon: Network, color: 'text-ui-info' },
    direct: { icon: ArrowRight, color: 'text-ui-success' },
    block: { icon: Ban, color: 'text-ui-danger' },
};

export function RuleList({ items, selectedId, onOpen, onMove, onDrop, destinations, resolverNames, busy, page, pageSize, total, filtered, onReordered }: {
    items: RuleItem[];
    selectedId?: string;
    destinations: Record<string, string>;
    resolverNames: Record<string, string>;
    busy: boolean;
    page: number;
    pageSize: number;
    total: number;
    filtered: boolean;
    onReordered?: () => void;
    onOpen: (item: RuleItem) => void;
    onMove: (item: RuleItem, direction: -1 | 1) => void;
    onDrop: (item: RuleItem, drop: RuleDrop) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const hasPreviousPage = page > 1;
    const hasNextPage = total > (page - 1) * pageSize + items.length;
    const helpId = useId();
    const sortable = !busy && !filtered && total >= 2;
    const { listRef, drag, start } = useRuleDrag(items, !sortable, onDrop);
    return <>
        <p id={helpId} className="sr-only">{t('dragRuleHelp')}</p>
        <ul ref={listRef} className="m-0 list-none divide-y divide-ui-border/40 p-0" aria-label={uiT('routeRules')}>
        {items.map((item, index) => {
            const proxy = item.mode === 'proxy' || item.mode === 'gateway';
            const destination = !item.target.type || item.target.type === 'default'
                ? t('defaultProxy') : destinations[`${item.target.type}:${item.target.id}`] ?? t('unavailableDestination');
            const selected = item.id === selectedId;
            const canMoveUp = !filtered && !busy && (index > 0 || hasPreviousPage);
            const canMoveDown = !filtered && !busy && (index + 1 < items.length || hasNextPage);
            const modeStyle = MODE_STYLES[item.mode] ?? MODE_STYLES.proxy;
            const ModeIcon = modeStyle.icon;
            const modeLabel = t(item.mode, { defaultValue: item.mode });
            return <li key={item.id} data-rule-id={item.id} className={clsx(
                'group relative flex min-w-0 items-center rounded-ui-md transition-colors',
                !selected && 'hover:bg-ui-surface-muted/75', drag?.source.id === item.id && 'opacity-35'
            )}>
                {selected && <WorkspaceSelectionMarker />}
                {drag?.target?.target.id === item.id && <span aria-hidden="true" className={clsx('pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-ui-primary', drag.target.placement === 'insert_before' ? 'top-0' : 'bottom-0')} />}
                <button type="button" disabled={!sortable} aria-label={t('dragRule', { name: item.name })} aria-describedby={helpId}
                    title={t('dragRuleHelp')} onPointerDown={event => start(event, item)} onContextMenu={event => event.preventDefault()}
                    onKeyDown={event => {
                        if (event.key === 'ArrowUp' && canMoveUp || event.key === 'ArrowDown' && canMoveDown) {
                            event.preventDefault(); onMove(item, event.key === 'ArrowUp' ? -1 : 1);
                        }
                    }}
                    className="group/handle flex w-8 shrink-0 touch-pan-y cursor-grab flex-col items-center gap-1 self-stretch rounded-ui-md pt-3 text-ui-muted hover:text-ui-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus active:cursor-grabbing disabled:cursor-default max-sm:w-11">
                    <span className="flex h-5 items-center font-mono text-xs tabular-nums">{item.index}</span>
                    {sortable && <GripVertical size={14} aria-hidden="true" className="h-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible/handle:opacity-100 pointer-coarse:opacity-60" />}
                </button>
                <button type="button" aria-current={selected ? 'true' : undefined} aria-label={item.name} title={`${item.name}\n${modeLabel}\n${t('matchingConditions', { count: item.ruleCount })}`} onClick={() => onOpen(item)}
                    className="min-w-0 flex-1 rounded-ui-md py-3 pl-0 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus">
                    <div className={clsx('min-w-0', item.disabled && 'opacity-55')}>
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ui-heading">{item.name}</span>
                            {item.disabled && <span className="shrink-0 text-xs text-ui-muted">{uiT('off')}</span>}
                        </div>
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs">
                            <ModeIcon size={13} aria-hidden="true" className={clsx('shrink-0', modeStyle.color)} />
                            {item.mode !== 'proxy' && <span className={clsx('shrink-0 font-medium', modeStyle.color)}>{modeLabel}</span>}
                            {proxy && <span className="min-w-0 truncate text-ui-muted">{item.target.type === 'node' && item.target.id ? <NodeName id={item.target.id} /> : destination}</span>}
                        </div>
                        {item.resolver && <div className="mt-1 truncate text-xs text-ui-muted">{uiT('resolver')}: {resolverNames[item.resolver] ?? item.resolver}</div>}
                    </div>
                </button>
                {index > 0 && <StageChangeButton disabled={busy || filtered} label={t("moveEarlier")} request={{ store: "configuration", kind: "route-order", payload: { source: { id: item.id }, target: { id: items[index - 1].id }, operate: "exchange" } }} onCommitted={() => onReordered?.()} />}
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
