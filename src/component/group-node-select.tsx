import { listNodes, type NodeGroup } from '@/api/nodes';
import { nodeGroupName, type Node } from '@/contract/node';
import { Button } from '@/component/v2/button';
import { SettingSelectVertical } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import { Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import clsx from 'clsx';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const PAGE_SIZE = 40;

/**
 * Fetch nodes only for the selected group and page. A selected node supplied
 * by the parent stays visible even when its group/page is not currently loaded.
 * The list opens on the selected node's group, then `preferredGroup`, for parents
 * whose choice has no single selected node.
 */
export function GroupNodeSelect({ label, value, selected, preferredGroup, groups, onChange, multiple, excludeId, disabled = false, enabled = true, enabledOnly = true }: {
    label: string;
    value: string;
    selected?: Node;
    preferredGroup?: string;
    groups: NodeGroup[];
    onChange: (node: Node) => void;
    multiple?: string[];
    excludeId?: string;
    disabled?: boolean;
    enabled?: boolean;
    enabledOnly?: boolean;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const [chosenGroup, setChosenGroup] = useState('');
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [query, setQuery] = useState('');
    const initialGroup = [selected && nodeGroupName(selected), preferredGroup, 'manual'].find(name => groups.some(item => item.name === name));
    const group = chosenGroup || initialGroup || groups[0]?.name || '';
    const { data, error, isLoading, mutate } = useSWR(
        enabled && group ? ['/api/v2/nodes/group-page', group, page, query, enabledOnly] : null,
        () => listNodes({ page, pageSize: PAGE_SIZE, group, query, enabledOnly }),
        { revalidateOnFocus: false, keepPreviousData: false },
    );
    useServerPageClamp(data?.page, page, setPage);
    const changeGroup = (next: string) => {
        setChosenGroup(next);
        setPage(1);
        setSearchInput('');
        setQuery('');
    };
    const total = data?.page.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return <div className="grid min-w-0 grid-cols-1 gap-3" role="group" aria-label={label}>
        {value && <p className="truncate text-sm font-medium text-ui-heading">{selected?.name || data?.items.find(node => node.id === value)?.name || value}</p>}
        <SettingSelectVertical className="mb-0" label={t('nodeGroup')} value={group}
            values={groups.map(item => [`${item.name} (${item.enabled}/${item.count})`, item.name] as [string, string])}
            disabled={disabled || !groups.length} onChange={changeGroup} />
        <div className="flex min-w-0 gap-2">
            <Input className="min-w-0 flex-1" type="search" aria-label={t('nodeSearch')} placeholder={t('nodeSearch')}
                value={searchInput} disabled={disabled || !group}
                onChange={event => setSearchInput(event.target.value)}
                onKeyDown={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        setPage(1);
                        setQuery(searchInput.trim());
                    }
                }} />
            <Button type="button" variant="outline-secondary" className="shrink-0 gap-2 whitespace-nowrap" disabled={disabled || !group}
                onClick={() => { setPage(1); setQuery(searchInput.trim()); }}><Search size={15} aria-hidden="true" />{t('searchNodes')}</Button>
        </div>
        {isLoading && <p role="status" className="text-sm text-ui-muted">{t('loading')}</p>}
        {!error && data && <div className="max-h-[min(40vh,320px)] overflow-y-auto overscroll-contain">
            {data.items.filter(node => node.id !== excludeId).map(node => <button key={node.id} type="button" aria-pressed={multiple ? multiple.includes(node.id) : node.id === value} disabled={disabled}
                className={clsx('flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-ui-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus disabled:opacity-60',
                    (multiple ? multiple.includes(node.id) : node.id === value) ? 'bg-ui-primary-soft text-ui-primary' : 'text-ui-heading hover:bg-ui-surface-muted')}
                onClick={() => onChange(node)}>
                <span className="min-w-0 truncate" title={node.name}>{node.name}</span>
                {(multiple ? multiple.includes(node.id) : node.id === value) && <Check size={16} className="shrink-0" aria-hidden="true" />}
            </button>)}
        </div>}
        {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-ui-danger">
            {t('nodePickerFailed')}
            <Button size="sm" variant="outline-secondary" onClick={() => void mutate()}>{t('retry')}</Button>
        </div>}
        {!error && data && total === 0 && <p role="status" className="text-xs text-ui-muted">{uiT('noRecordsFound')}</p>}
        {data && pages > 1 && <div className="flex items-center justify-end gap-2 text-xs text-ui-muted">
            <Button type="button" size="sm" variant="outline-secondary" className="shrink-0 gap-1 whitespace-nowrap" disabled={disabled || page <= 1}
                onClick={() => setPage(value => value - 1)}><ChevronLeft size={14} aria-hidden="true" />{t('previousPage')}</Button>
            <span className="tabular-nums">{page} / {pages}</span>
            <Button type="button" size="sm" variant="outline-secondary" className="shrink-0 gap-1 whitespace-nowrap" disabled={disabled || page >= pages}
                onClick={() => setPage(value => value + 1)}>{t('nextPage')}<ChevronRight size={14} aria-hidden="true" /></Button>
        </div>}
    </div>;
}
