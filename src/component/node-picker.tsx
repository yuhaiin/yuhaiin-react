import { collectPages } from '@/api/paging';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { listNodes } from '@/api/nodes';
import { Button } from '@/component/v2/button';
import { Input } from '@/component/v2/input';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function NodePicker({ value, onChange, disabled = false, excludeId }: {
    value: string[]; onChange: (ids: string[]) => void; disabled?: boolean; excludeId?: string;
}) {
    const { t } = useTranslation('routing');
    const { data, error, mutate } = useSWR('/api/v2/nodes/all', () => collectPages(listNodes));
    const [query, setQuery] = useState('');
    const names = new Map(data?.items.map(node => [node.id, node.name]));
    const move = (index: number, direction: -1 | 1) => {
        const next = [...value];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        onChange(next);
    };
    return <div className="grid gap-2">
        <div className="flex flex-wrap gap-2">{value.map((id, index) => <div key={id} className="flex items-center gap-2 rounded-ui-md border border-ui-border px-2 py-1 text-sm">
            <span>{index + 1}. {names.get(id) ?? t('unknownNode')}</span>
            {!disabled && <>
                <Button size="icon" variant="outline-secondary" disabled={index === 0} aria-label={`${t('moveEarlier')} ${names.get(id) ?? id}`} onClick={() => move(index, -1)}><ArrowUp size={14} /></Button>
                <Button size="icon" variant="outline-secondary" disabled={index === value.length - 1} aria-label={`${t('moveLater')} ${names.get(id) ?? id}`} onClick={() => move(index, 1)}><ArrowDown size={14} /></Button>
                <Button size="sm" variant="outline-secondary" aria-label={`${t('delete')} ${names.get(id) ?? id}`}
                onClick={() => onChange(value.filter(item => item !== id))}><X size={14} /></Button></>}
        </div>)}</div>
        {error ? <div role="alert" className="text-sm text-ui-danger">{t('nodePickerFailed')} <Button size="sm" onClick={() => void mutate()}>{t('retry')}</Button></div>
            : !data ? <p role="status" className="text-sm text-ui-muted">…</p>
                : !disabled && <>
                    <Input aria-label={t('nodeSearch')} placeholder={t('nodeSearch')} value={query} onChange={event => setQuery(event.target.value)} />
                    <div className="max-h-48 overflow-auto rounded-ui-md border border-ui-border p-2">
                        {data.items.filter(node => node.enabled && node.id !== excludeId && `${node.name} ${node.group}`.toLowerCase().includes(query.toLowerCase())).map(node => <label key={node.id} className="flex cursor-pointer items-center gap-3 p-2 text-sm">
                            <input type="checkbox" checked={value.includes(node.id)} onChange={event => onChange(event.target.checked ? [...value, node.id] : value.filter(id => id !== node.id))} />
                            <span className="break-words">{node.name} <span className="text-ui-muted">{node.group}</span></span>
                        </label>)}
                    </div>
                </>}
    </div>;
}
