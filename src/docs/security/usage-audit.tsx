import { authScope } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetchUsage, usageBytes, usageDate, usageDuration, usageRange, type UsageAudit, type UsageAuditPage } from './usage-api';

export function UsageAuditList({ owner, preset, from, to }: { owner: string; preset: string; from: string; to: string }) {
    const { t } = useTranslation('auth');
    const [result, setResult] = useState('');
    const [draft, setDraft] = useState({ source: '', target: '' });
    const [filter, setFilter] = useState(draft);
    const [cursors, setCursors] = useState(['']);
    const before = cursors[cursors.length - 1];
    const scope = authScope();
    const validRange = preset !== 'custom' || Boolean(from && to);
    const { data, error, isLoading, mutate } = useSWR(validRange ? [scope, 'usage-audit', owner, preset, from, to, result, filter.source, filter.target, before] : null,
        () => fetchUsage<UsageAuditPage>('/audit', { owner, result, ...filter, before, limit: '50', ...usageRange(preset, from, to) }), { refreshInterval: before ? 0 : 10000, keepPreviousData: false });
    return <section className="space-y-3" aria-label={t('usage.audit')}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">{t('usage.audit')}</h3><Button disabled={isLoading} onClick={() => void mutate()}>{t('refresh')}</Button></div>
        <form className="grid items-end gap-3 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); setFilter(draft); setCursors(['']); }}>
            <label className="space-y-2"><span className="text-sm">{t('usage.source')}</span><Input value={draft.source} maxLength={256} onChange={event => setDraft({ ...draft, source: event.target.value })} /></label>
            <label className="space-y-2"><span className="text-sm">{t('usage.target')}</span><Input value={draft.target} maxLength={256} onChange={event => setDraft({ ...draft, target: event.target.value })} /></label>
            <Select ariaLabel={t('usage.result')} value={result} onValueChange={value => { setResult(value); setCursors(['']); }} items={['', 'active', 'closed', 'failed', 'rejected', 'interrupted'].map(value => ({ value, label: value ? t(`usage.results.${value}`) : t('usage.allResults') }))} />
            <Button type="submit">{t('usage.filter')}</Button>
        </form>
        <p className="text-xs text-ui-muted">{t('usage.auditHint')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('usage.loadFailed')}</p>}
        {isLoading && <p role="status" className="text-sm text-ui-muted">{t('usage.loading')}</p>}
        {data?.items.map(item => <AuditRow key={item.id} item={item} />)}
        {data?.items.length === 0 && <p className="text-sm text-ui-muted">{t('usage.noAudit')}</p>}
        {data && (data.health.persistenceError || data.health.droppedAudit !== '0') && <p role="alert" className="text-sm text-ui-danger">{t('usage.incomplete', { dropped: data.health.droppedAudit })}</p>}
        <div className="flex flex-wrap items-center gap-3"><Button disabled={isLoading || cursors.length === 1} onClick={() => setCursors(cursors.slice(0, -1))}>{t('usage.previous')}</Button><span className="text-sm text-ui-muted">{t('usage.page', { count: cursors.length })}</span><Button disabled={isLoading || !data?.next} onClick={() => { if (data?.next) setCursors([...cursors, data.next]); }}>{t('usage.next')}</Button></div>
    </section>;
}

function AuditRow({ item }: { item: UsageAudit }) {
    const { t } = useTranslation('auth');
    const fields = [
		[t('groups.title'), item.groupIds?.join(', ') ?? ''],
        [t('access.title'), item.accessDecision ? `${t('access.revision', { revision: item.accessDecision.revision })} · ${t(item.accessDecision.allowed ? 'access.allow' : 'access.deny')} · ${item.accessDecision.ruleId || t(`access.reason.${item.accessDecision.reason}`, { defaultValue: item.accessDecision.reason })}` : ''],
        [t('usage.started'), usageDate(item.startedAt)], [t('usage.ended'), usageDate(item.endedAt)],
        [t('usage.sessionDuration'), usageDuration(item.durationMillis)], [t('usage.source'), item.source], [t('usage.target'), item.target],
        [t('usage.ip'), item.ip], [t('usage.credential'), item.credentialId], [t('usage.inbound'), item.inboundName || item.inboundId],
        [t('usage.node'), item.nodeName || item.nodeId], [t('usage.selector'), item.selectorName || item.selectorId],
        [t('usage.rule'), item.ruleName || item.ruleId], [t('usage.mode'), item.mode],
        [t('usage.reason'), item.reason ? t(`usage.reasons.${item.reason}`, { defaultValue: item.reason }) : '—'],
    ];
    return <details className="rounded-ui-md border border-ui-border p-3">
        <summary className="cursor-pointer space-y-1 text-sm"><span className="break-all font-medium">{item.protocol.toUpperCase()} · {item.target || t('usage.unassigned')}</span><span className="ml-2 text-xs text-ui-muted">{t(`usage.results.${item.result}`, { defaultValue: item.result })} · {usageDate(item.startedAt)}</span><span className="block pl-4 text-xs text-ui-muted">↑ {usageBytes(item.upload)} · ↓ {usageBytes(item.download)}</span></summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0 space-y-1"><dt className="text-xs text-ui-muted">{label}</dt><dd className="break-all text-sm">{value || '—'}</dd></div>)}</dl>
    </details>;
}
