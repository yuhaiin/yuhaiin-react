import { Button } from '@/component/v2/button';
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownItem, DropdownTrigger } from '@/component/v2/dropdown';
import type { RuleItem } from '@/contract/route';
import clsx from 'clsx';
import { ArrowUpDown, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RuleList({ items, selectedId, onOpen, onPriority, onToggle, onMove, destinations, resolverNames, busy, page, pageSize, total, filtered }: {
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
    onPriority: (item: RuleItem) => void;
    onToggle: (item: RuleItem) => void;
    onMove: (item: RuleItem, direction: -1 | 1) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const hasPreviousPage = page > 1;
    const hasNextPage = total > (page - 1) * pageSize + items.length;
    return <ul className="m-0 list-none space-y-1 p-0" aria-label={uiT('routeRules')}>
        {items.map((item, index) => {
            const proxy = item.mode === 'proxy';
            const destination = !item.target.type || item.target.type === 'default'
                ? t('defaultProxy') : destinations[`${item.target.type}:${item.target.id}`] ?? t('unavailableDestination');
            const selected = item.id === selectedId;
            const canMoveUp = !filtered && !busy && (index > 0 || hasPreviousPage);
            const canMoveDown = !filtered && !busy && (index + 1 < items.length || hasNextPage);
            return <li key={item.id} className={clsx(
                'group relative flex min-w-0 items-center rounded-ui-md transition-colors',
                selected ? 'bg-ui-primary-soft/70' : 'hover:bg-ui-surface-muted/75'
            )}>
                {selected && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-ui-primary" />}
                <button type="button" aria-current={selected ? 'true' : undefined} aria-label={item.name} title={item.name} onClick={() => onOpen(item)}
                    className="min-w-0 flex-1 rounded-ui-md py-2.5 pl-3 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus">
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
                            {proxy && <span className="min-w-0 truncate text-ui-muted" title={destination}>· {destination}</span>}
                        </div>
                        <div className="mt-1 truncate pl-8 text-[11px] text-ui-muted">
                            {item.disabled && `${uiT('off')} · `}{t('matchingConditions', { count: item.ruleCount })}
                            {item.resolver && ` · ${resolverNames[item.resolver] ?? item.resolver}`}
                        </div>
                    </div>
                </button>
                <div className="flex shrink-0 items-center gap-0.5 pr-1">
                    <div className="flex flex-col">
                        <button type="button" disabled={!canMoveUp} aria-label={`${t('moveEarlier')}: ${item.name}`}
                            title={t('moveEarlier')} onClick={() => onMove(item, -1)}
                            className="rounded-ui-xs p-0.5 text-ui-muted hover:bg-ui-surface hover:text-ui-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus disabled:opacity-25">
                            <ChevronUp size={15} />
                        </button>
                        <button type="button" disabled={!canMoveDown} aria-label={`${t('moveLater')}: ${item.name}`}
                            title={t('moveLater')} onClick={() => onMove(item, 1)}
                            className="rounded-ui-xs p-0.5 text-ui-muted hover:bg-ui-surface hover:text-ui-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus disabled:opacity-25">
                            <ChevronDown size={15} />
                        </button>
                    </div>
                    <Dropdown><DropdownTrigger asChild>
                        <Button type="button" size="icon" variant="outline-secondary" className="h-8 w-8 border-transparent bg-transparent text-ui-muted/80" aria-label={t('ruleActions', { name: item.name })}><MoreHorizontal size={16} /></Button>
                    </DropdownTrigger><DropdownContent align="end">
                        <DropdownItem disabled={busy} onSelect={() => onPriority(item)}><ArrowUpDown size={15} className="mr-2" />{uiT('changePriority')}</DropdownItem>
                        <DropdownCheckboxItem checked={!item.disabled} disabled={busy} onCheckedChange={() => onToggle(item)}>{uiT('enabled')}</DropdownCheckboxItem>
                    </DropdownContent></Dropdown>
                </div>
            </li>;
        })}
        {!items.length && <li className="py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
    </ul>;
}
