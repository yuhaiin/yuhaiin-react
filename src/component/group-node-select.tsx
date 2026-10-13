import { listNodes, type NodeGroup } from '@/api/nodes';
import type { Node } from '@/contract/node';
import { Button } from '@/component/v2/button';
import { SettingSelectVertical } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const PAGE_SIZE = 40;

/**
 * Fetch nodes only for the selected group and page. A selected node supplied
 * by the parent stays visible even when its group/page is not currently loaded.
 */
export function GroupNodeSelect({ label, value, selected, groups, onChange, disabled = false, enabled = true }: {
    label: string;
    value: string;
    selected?: Node;
    groups: NodeGroup[];
    onChange: (node: Node) => void;
    disabled?: boolean;
    enabled?: boolean;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const [chosenGroup, setChosenGroup] = useState('');
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [query, setQuery] = useState('');
    const selectedGroup = selected?.group || 'manual';
    const group = chosenGroup || (groups.some(item => item.name === selectedGroup) ? selectedGroup : groups[0]?.name || '');
    const { data, error, isLoading, mutate } = useSWR(
        enabled && group ? ['/api/v2/nodes/group-page', group, page, query] : null,
        () => listNodes({ page, pageSize: PAGE_SIZE, group, query, enabledOnly: true }),
        { revalidateOnFocus: false, keepPreviousData: false },
    );
    const items = (data?.items ?? []).map(node => ({ value: node.id, label: node.name }));
    if (value && !items.some(item => item.value === value)) {
        items.push({ value, label: selected?.name || t('unavailableDestination') });
    }
    const changeGroup = (next: string) => {
        setChosenGroup(next);
        setPage(1);
        setSearchInput('');
        setQuery('');
    };
    const total = data?.page.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return <div className="min-w-0 space-y-3">
        <div className="text-sm font-medium text-ui-heading">{label}</div>
        <SettingSelectVertical className="mb-0" label={t('nodeGroup')} value={group}
            values={groups.map(item => [`${item.name} (${item.enabled}/${item.count})`, item.name])}
            disabled={disabled || !groups.length} onChange={changeGroup} />
        <div className="flex min-w-0 gap-2">
            <Input type="search" aria-label={t('nodeSearch')} placeholder={t('nodeSearch')}
                value={searchInput} disabled={disabled || !group}
                onChange={event => setSearchInput(event.target.value)}
                onKeyDown={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        setPage(1);
                        setQuery(searchInput.trim());
                    }
                }} />
            <Button type="button" size="sm" variant="outline-secondary" disabled={disabled || !group}
                onClick={() => { setPage(1); setQuery(searchInput.trim()); }}>{uiT('search')}</Button>
        </div>
        <Select ariaLabel={label} value={value} placeholder={isLoading ? t('loading') : t('chooseNode')}
            disabled={disabled || !data || Boolean(error) || (items.length === 0)}
            items={items} onValueChange={id => {
                const node = data?.items.find(item => item.id === id);
                if (node) onChange(node);
            }} />
        {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-ui-danger">
            {t('nodePickerFailed')}
            <Button size="sm" variant="outline-secondary" onClick={() => void mutate()}>{t('retry')}</Button>
        </div>}
        {!error && data && total === 0 && <p role="status" className="text-xs text-ui-muted">{uiT('noRecordsFound')}</p>}
        {data && pages > 1 && <div className="flex items-center justify-end gap-2 text-xs text-ui-muted">
            <Button type="button" size="sm" variant="outline-secondary" disabled={disabled || page <= 1}
                onClick={() => setPage(value => value - 1)}>{t('previousPage')}</Button>
            <span className="tabular-nums">{page} / {pages}</span>
            <Button type="button" size="sm" variant="outline-secondary" disabled={disabled || page >= pages}
                onClick={() => setPage(value => value + 1)}>{t('nextPage')}</Button>
        </div>}
    </div>;
}
