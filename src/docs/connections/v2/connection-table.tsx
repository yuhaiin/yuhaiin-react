import type { Connection, Counter } from '@/contract/connection';
import { Button } from '@/component/v2/button';
import { Select } from '@/component/v2/select';
import { cn, ui } from '@/component/v2/styles';
import { ArrowDown, ArrowUp, ArrowUpDown, Tag } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBytes, numberValue } from '../components';
import styles from './connection-table.module.css';

export type SortBy = 'id' | 'name' | 'download' | 'upload';
export type SortOrder = 'asc' | 'desc';
export const connectionRowHeight = { desktop: 52, mobile: 92 };

type Sorting = { sortBy: SortBy; sortOrder: SortOrder; onSort: (field: SortBy) => void };

/** The same ordering is used by the table headers and the mobile controls. */
export function sortConnections(items: Connection[], field: SortBy, order: SortOrder, counters?: Record<string, Counter>) {
    const direction = order === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
        if (field === 'name') return a.addr.localeCompare(b.addr) * direction;
        if (field === 'download' || field === 'upload') return (numberValue(counters?.[a.id]?.[field]) - numberValue(counters?.[b.id]?.[field])) * direction;
        return (numberValue(a.id) - numberValue(b.id)) * direction;
    });
}

export function MobileConnectionSort({ sortBy, sortOrder, onFieldChange, onOrderChange }: {
    sortBy: SortBy; sortOrder: SortOrder; onFieldChange: (field: SortBy) => void; onOrderChange: () => void;
}) {
    const { t } = useTranslation('ui');
    const Direction = sortOrder === 'asc' ? ArrowUp : ArrowDown;
    return <div className="mb-3 flex min-w-0 items-center gap-2 md:hidden">
        <span className="shrink-0 text-xs text-ui-muted">{t('sort')}</span>
        <div className="min-w-0 flex-1"><Select size="sm" triggerClassName="min-h-11" value={sortBy} ariaLabel={t('sort')} onValueChange={value => onFieldChange(value as SortBy)}
            items={(['id', 'name', 'download', 'upload'] as const).map(value => ({ value, label: t(value === 'id' ? 'idLabel' : value) }))} /></div>
        <Button size="icon" className="min-h-11 min-w-11" variant="outline-secondary" onClick={onOrderChange} aria-label={t(sortOrder === 'asc' ? 'descLabel' : 'ascLabel')} title={t(sortOrder === 'asc' ? 'descLabel' : 'ascLabel')}><Direction size={16} /></Button>
    </div>;
}

export function ConnectionTableHeader({ sortBy, sortOrder, onSort }: Sorting) {
    const { t } = useTranslation('ui');
    const sortable = (field: SortBy, label: string) => <div role="columnheader" aria-sort={sortBy === field ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none'} className="min-w-0 text-center">
        <button type="button" onClick={() => onSort(field)} className={cn('relative inline-flex min-h-9 w-full min-w-0 items-center justify-center rounded-ui-sm text-xs font-medium hover:text-ui-heading', ui.focusRing, sortBy === field ? 'text-ui-heading' : 'text-ui-muted')}>
            <span className="relative min-w-0 max-w-full px-4"><span className="block truncate">{label}</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden="true">{sortBy === field ? sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} className="text-ui-tertiary" />}</span></span>
        </button>
    </div>;
    return <div role="rowgroup" className="hidden shrink-0 overflow-y-auto [scrollbar-gutter:stable] border-b border-ui-border bg-ui-surface-muted/40 md:block">
        <div role="row" className={cn(styles.columns, 'items-center gap-x-3 px-3 py-1')}>
            {sortable('id', 'ID')}{sortable('name', t('destination'))}
            <div role="columnheader" className="text-center text-xs text-ui-muted">{t('mode')}</div>
            <div role="columnheader" className="text-center text-xs text-ui-muted">{t('protocol')}</div>
            <div role="columnheader" className="hidden min-w-0 text-center text-xs text-ui-muted xl:block">{t('connectionExit')}</div>
            {sortable('download', t('download'))}{sortable('upload', t('upload'))}
        </div>
    </div>;
}

export const ConnectionRow = memo(function ConnectionRow({ conn, counter, onSelect, animated = true }: {
    conn: Connection; counter?: Counter; onSelect: (conn: Connection) => void; animated?: boolean;
}) {
    const reduced = useReducedMotion();
    const { t } = useTranslation('ui');
    const handleClick = useCallback(() => onSelect(conn), [conn, onSelect]);
    const Row = animated ? motion.div : 'div';
    const exit = conn.selectorName || conn.nodeName || conn.nodeId || '—';
    return <Row role="row" data-connection-id={conn.id} onClick={handleClick}
        className={cn(styles.row, styles.columns, 'group min-w-0 cursor-pointer items-center gap-x-3 border-b border-ui-border/60 px-3 py-2 md:py-1 xl:py-2 text-sm transition-colors hover:bg-ui-hover focus-within:bg-ui-hover')}
        {...(animated ? { initial: reduced ? false : { opacity: 0, y: 3 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: reduced ? 0 : 0.12, ease: 'easeOut' as const } } : {})}>
        <div role="cell" className={cn(styles.id, 'truncate font-mono text-xs tabular-nums text-ui-muted')} title={conn.id}>{conn.id}</div>
        <div role="cell" className={cn(styles.target, 'min-w-0')}><button type="button" className={cn('block min-h-6 w-full truncate rounded-ui-sm text-left text-sm font-medium text-ui-heading', ui.focusRing)} title={conn.addr} aria-label={`${t('connectionDetails')}: ${conn.addr}`}>{conn.addr}</button>
            {conn.selectorName && <span className="flex min-w-0 items-center gap-1 text-xs leading-[18px] text-ui-muted xl:hidden" title={conn.selectorName} aria-label={`${t('connectionExit')}: ${conn.selectorName}`}><Tag size={12} className="shrink-0" aria-hidden="true" /><span className="truncate">{conn.selectorName}</span></span>}
        </div>
        <div role="cell" className={cn(styles.mode, 'truncate text-xs text-ui-muted')} title={conn.mode}>{conn.mode || '—'}</div>
        <div role="cell" className={cn(styles.protocol, 'truncate font-mono text-xs uppercase text-ui-muted')}>{conn.network.connType || '—'}</div>
        <div role="cell" className="hidden min-w-0 truncate text-xs text-ui-muted xl:block" title={exit}>{exit}</div>
        <TrafficCell value={counter?.download} direction="download" />
        <TrafficCell value={counter?.upload} direction="upload" />
    </Row>;
}, (prev, next) => prev.conn === next.conn && prev.animated === next.animated && prev.onSelect === next.onSelect
    && numberValue(prev.counter?.download) === numberValue(next.counter?.download) && numberValue(prev.counter?.upload) === numberValue(next.counter?.upload));

function TrafficCell({ value, direction }: { value?: string; direction: 'download' | 'upload' }) {
    const { t } = useTranslation('ui');
    const Icon = direction === 'download' ? ArrowDown : ArrowUp;
    const full = formatBytes(numberValue(value), 2, ' ');
    return <div role="cell" aria-label={`${t(direction)}: ${full}`} title={full}
        className={cn(styles[direction], 'flex min-w-0 items-center justify-end gap-1 truncate font-mono text-xs tabular-nums', direction === 'download' ? 'text-ui-info' : 'text-ui-success')}>
        <Icon size={12} aria-hidden="true" className="shrink-0 md:hidden" /><span className="truncate md:hidden">{formatBytes(numberValue(value), 1, ' ')}</span><span className="hidden truncate md:block">{full}</span>
    </div>;
}
