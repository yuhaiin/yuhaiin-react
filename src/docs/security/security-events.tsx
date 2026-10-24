import { StageChangeButton } from "@/component/configuration-change";
import { authAPI } from '@/auth/api';
import { useSession } from '@/auth/context';
import { authScope } from '@/auth/session';
import { authorizedFetch } from '@/auth/transport';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export interface AuditRecord { id: string; occurredAt: number; event: string; actorId: string; subjectId: string; source: string; method: string; path: string; credentialId: string; result: string; changes: string; authMethod: string; policyRevision: string; reason: string }
interface AuditPage { instanceId: string; items: AuditRecord[]; nextCursor: string }
export interface AuditSettings { instanceId: string; revision: number; maxEvents: number; maxAgeDays: number; forwardEnabled: boolean; transport: string; endpoint: string; endpointConfigured: boolean; destination: string; tokenConfigured: boolean; outboxLimit: number }
interface AuditStatus { running: boolean; backlog: number; oldestQueuedAt: number; dropped: string; deliveryFailures: string; delivered: string; lastSuccess: number; lastFailure: number; lastError: string; localWriteFailures: string }
const emptyFilters = { search: '', event: '', actorId: '', subjectId: '', result: '', authMethod: '', reason: '', from: '', to: '' };
type Filters = typeof emptyFilters;
function filterQuery(filters: Filters, cursor: string) {
    const query = new URLSearchParams({ limit: '100' });
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, key === 'from' || key === 'to' ? String(Math.floor(new Date(value).getTime() / 1000)) : value);
    if (cursor) query.set('cursor', cursor);
    return query.toString();
}
function formatMetadata(value: string) { try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; } }
export function SecurityEvents() {
    const session = useSession(); const scope = authScope();
    if (!session?.principal.permissions.includes('security:read')) return null;
    return <AuditWorkspace key={scope} scope={scope} permissions={session.principal.permissions} />;
}
function AuditWorkspace({ scope, permissions }: { scope: string; permissions: string[] }) {
    const { t } = useTranslation('auth');
    const [draft, setDraft] = useState(emptyFilters); const [filters, setFilters] = useState(emptyFilters);
    const [cursor, setCursor] = useState(''); const [previous, setPrevious] = useState<string[]>([]);
    const [busy, setBusy] = useState(false); const [failure, setFailure] = useState('');
    const [settingsEpoch, setSettingsEpoch] = useState(0);
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), []);
    const query = filterQuery(filters, cursor);
    const { data, error, mutate } = useSWR([scope, 'security-audit-page', query], () => authAPI<AuditPage>('GET', `/events/page?${query}`), { keepPreviousData: false });
    const { data: settings, error: settingsError, mutate: reloadSettings } = useSWR([scope, 'security-audit-settings'], () => authAPI<AuditSettings>('GET', '/events/settings'), { revalidateOnFocus: false, revalidateOnReconnect: false });
    const { data: status, error: statusError, mutate: reloadStatus } = useSWR([scope, 'security-audit-status'], () => authAPI<AuditStatus>('GET', '/events/status'), { refreshInterval: 10000 });
    const apply = (event: FormEvent) => { event.preventDefault(); setCursor(''); setPrevious([]); setFilters({ ...draft }); };
    const download = async () => {
        if (busy || scope !== authScope() || !permissions.includes('security:export')) return;
        const controller = new AbortController(); request.current = controller; setBusy(true); setFailure('');
        try {
            const response = await authorizedFetch(`/api/v2/auth/events/export?${query}`, { signal: controller.signal });
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            if (controller.signal.aborted || scope !== authScope()) return;
            const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'management-security-audit.json'; link.click(); URL.revokeObjectURL(url);
        } catch { if (!controller.signal.aborted && scope === authScope()) setFailure(t('requestFailed')); }
        finally { if (scope === authScope()) setBusy(false); if (request.current === controller) request.current = null; }
    };
    return <Card><CardHeader><h2 className="font-medium">{t('securityEvents')}</h2><div className="flex flex-wrap gap-2"><Button onClick={() => { void mutate(); void reloadStatus(); }}>{t('refresh')}</Button>{permissions.includes('security:export') && <Button disabled={busy || !data} onClick={() => void download()}>{t('audit.exportPage')}</Button>}</div></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('audit.help')}</p>
        {(error || failure || settingsError || statusError) && <p role="alert" className="text-sm text-ui-danger">{failure || t('requestFailed')}</p>}
        <form aria-label={t('audit.filters')} onSubmit={apply} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(['search', 'event', 'actorId', 'subjectId', 'authMethod', 'reason'] as const).map(key => <label key={key} className="space-y-2"><span className="text-sm">{t(`audit.${key}`)}</span><Input maxLength={256} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
            <label className="space-y-2"><span className="text-sm">{t('usage.result')}</span><Select ariaLabel={t('usage.result')} value={draft.result || 'all'} onValueChange={value => setDraft({ ...draft, result: value === 'all' ? '' : value })} items={[{ value: 'all', label: t('audit.allResults') }, { value: 'succeeded', label: t('audit.succeeded') }, { value: 'failed', label: t('audit.failed') }]} /></label>
            {(['from', 'to'] as const).map(key => <label key={key} className="space-y-2"><span className="text-sm">{t(`audit.${key}`)}</span><Input type="datetime-local" value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
            <div className="flex items-end gap-2"><Button type="submit">{t('audit.apply')}</Button><Button type="button" onClick={() => { setDraft(emptyFilters); setFilters(emptyFilters); setCursor(''); setPrevious([]); }}>{t('audit.clear')}</Button></div>
        </form>
        {data && <p className="break-all text-xs text-ui-muted">{t('audit.instance')}: {data.instanceId}</p>}
        {data?.items.length === 0 && <p className="text-sm text-ui-muted">{t('audit.empty')}</p>}
        <ul className="space-y-3">{data?.items.map(event => <li key={event.id} className="break-all text-sm"><details><summary className="cursor-pointer"><span>{event.event}</span><span className="ml-3 text-xs text-ui-muted">{new Date(event.occurredAt * 1000).toLocaleString()}</span><p className="text-xs text-ui-muted">{event.actorId} → {event.subjectId}</p></summary><div className="mt-2 space-y-2 text-xs text-ui-muted"><p>{t('audit.eventId')}: {event.id}</p><p>{t('usage.result')}: {event.result}</p><p>{t('audit.authMethod')}: {event.authMethod}</p>{event.source && <p>{t('usage.source')}: {event.source}</p>}{event.method && <p>{event.method} {event.path}</p>}{event.credentialId && <p>{t('usage.credential')}: {event.credentialId}</p>}{event.policyRevision && <p>{t('audit.revision')}: {event.policyRevision}</p>}{event.reason && <p>{t('audit.reason')}: {event.reason}</p>}{event.changes && <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all">{formatMetadata(event.changes)}</pre>}</div></details></li>)}</ul>
        <div className="flex flex-wrap gap-2"><Button disabled={!previous.length} onClick={() => { setCursor(previous[previous.length - 1]); setPrevious(previous.slice(0, -1)); }}>{t('audit.previous')}</Button><Button disabled={!data?.nextCursor} onClick={() => { if (data?.nextCursor) { setPrevious([...previous, cursor]); setCursor(data.nextCursor); } }}>{t('audit.next')}</Button></div>
        {status && <section className="space-y-2 border-t border-ui-border pt-4"><h3 className="font-medium">{t('audit.delivery')}</h3><p className="text-sm">{t('audit.worker')}: {t(status.running ? 'audit.running' : 'audit.stopped')}</p><dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">{(['backlog', 'delivered', 'dropped', 'deliveryFailures', 'localWriteFailures'] as const).map(key => <div key={key}><dt className="text-ui-muted">{t(`audit.${key}`)}</dt><dd>{status[key]}</dd></div>)}</dl>{status.oldestQueuedAt > 0 && <p className="text-xs">{t('audit.oldest')}: {new Date(status.oldestQueuedAt * 1000).toLocaleString()}</p>}{status.lastSuccess > 0 && <p className="text-xs">{t('audit.lastSuccess')}: {new Date(status.lastSuccess * 1000).toLocaleString()}</p>}{status.lastFailure > 0 && <p className="text-xs">{t('audit.lastFailure')}: {new Date(status.lastFailure * 1000).toLocaleString()} · {status.lastError}</p>}<p className="text-xs text-ui-muted">{t('audit.deliveryHelp')}</p></section>}
        {settings && <AuditSettingsEditor key={`${scope}:${settings.revision}:${settingsEpoch}`} scope={scope} settings={settings} permissions={permissions} onReload={async () => { await reloadSettings(); if (scope === authScope()) setSettingsEpoch(value => value + 1); }} onSaved={async () => { await reloadSettings(); await reloadStatus(); }} />}
    </CardBody></Card>;
}
function AuditSettingsEditor({ scope, settings, permissions, onSaved, onReload }: { scope: string; settings: AuditSettings; permissions: string[]; onSaved: () => Promise<void>; onReload: () => Promise<void> }) {
    const { t } = useTranslation('auth');
    const [draft, setDraft] = useState({ ...settings, endpoint: '' }); const [token, setToken] = useState('');
    const [clearToken, setClearToken] = useState(false); const [clearEndpoint, setClearEndpoint] = useState(false);
    const [busy, setBusy] = useState(false); const [failure, setFailure] = useState('');
    const writable = permissions.includes('security:write'); const manage = permissions.includes('secrets:manage');
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), []);
    const save = async (event: FormEvent) => {
        event.preventDefault(); if (!writable || busy || scope !== authScope()) return;
        if (!await confirmAction(t('audit.saveConfirm')) || scope !== authScope()) return;
        const controller = new AbortController(); request.current = controller; setBusy(true); setFailure('');
        try {
            await authAPI('PUT', '/events/settings', { ...draft, token, clearToken, clearEndpoint }, controller.signal);
            if (controller.signal.aborted || scope !== authScope()) return;
            setToken(''); setClearToken(false); setClearEndpoint(false); request.current = null; await onSaved();
        } catch (cause) { if (!controller.signal.aborted && scope === authScope()) setFailure(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'audit.conflict' : 'requestFailed')); }
        finally { if (!controller.signal.aborted && scope === authScope()) setBusy(false); }
    };
    return <details className="border-t border-ui-border pt-4"><summary className="cursor-pointer font-medium">{t('audit.settings')}</summary><form aria-label={t('audit.settings')} onSubmit={event => void save(event)} className="mt-4 space-y-3">
        <Button type="button" disabled={busy} onClick={async () => { if (await confirmAction(t('audit.reloadConfirm')) && scope === authScope()) await onReload(); }}>{t('refresh')}</Button><p className="text-sm text-ui-muted">{t('audit.retentionHelp')}</p>{failure && <p role="alert" className="text-sm text-ui-danger">{failure}</p>}
        <fieldset disabled={!writable || busy} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">{(['maxEvents', 'maxAgeDays', 'outboxLimit'] as const).map(key => <label key={key} className="space-y-2"><span className="text-sm">{t(`audit.${key}`)}</span><Input type="number" min={key === 'maxEvents' ? 1000 : key === 'outboxLimit' ? 64 : 0} max={key === 'maxEvents' ? 100000 : key === 'outboxLimit' ? 16384 : 3650} required step={1} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: Number(event.target.value) })} /></label>)}</div>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={draft.forwardEnabled} onChange={event => setDraft({ ...draft, forwardEnabled: event.target.checked })} />{t('audit.forwardEnabled')}</label>
            <Select ariaLabel={t('audit.transport')} value={draft.transport} onValueChange={value => setDraft({ ...draft, transport: value })} items={[{ value: 'https', label: t('audit.https') }, { value: 'syslog-tls', label: t('audit.syslog') }]} />
            <p className="break-all text-sm">{t('audit.destination')}: {settings.destination || t('audit.unconfigured')}</p>
            <label className="block space-y-2"><span className="text-sm">{t('audit.endpoint')}</span><Input type="password" autoComplete="new-password" disabled={!manage || clearEndpoint} maxLength={2048} value={draft.endpoint} placeholder={t(settings.endpointConfigured ? 'audit.preserve' : 'audit.endpointHint')} onChange={event => setDraft({ ...draft, endpoint: event.target.value })} /></label>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" disabled={!manage || !settings.endpointConfigured} checked={clearEndpoint} onChange={event => setClearEndpoint(event.target.checked)} />{t('audit.clearEndpoint')}</label>
            <label className="block space-y-2"><span className="text-sm">{t('audit.token')}</span><Input type="password" autoComplete="new-password" disabled={!manage || clearToken || draft.transport !== 'https'} maxLength={4096} value={token} placeholder={t(settings.tokenConfigured ? 'audit.preserve' : 'audit.optional')} onChange={event => setToken(event.target.value)} /></label>
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" disabled={!manage || !settings.tokenConfigured} checked={clearToken} onChange={event => setClearToken(event.target.checked)} />{t('audit.clearToken')}</label>
            <p className="text-xs text-ui-muted">{t('audit.secretHelp')}</p>{writable && <><Button type="submit">{t('save')}</Button><StageChangeButton disabled={busy} request={{ store: "identity", kind: "audit-settings", payload: { revision: draft.revision, maxEvents: draft.maxEvents, maxAgeDays: draft.maxAgeDays, outboxLimit: draft.outboxLimit, forwardEnabled: draft.forwardEnabled, transport: draft.transport, endpoint: draft.endpoint, token, clearToken, clearEndpoint } }} onCommitted={onSaved} /></>}
        </fieldset>
    </form></details>;
}
