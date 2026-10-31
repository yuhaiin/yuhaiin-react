import type { Go } from '@/api/generated-contracts';
import { authAPI } from '@/auth/api';
import { authScope } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { usageBytes } from './usage-api';

function rate(bytes: number, unlimited: string) { return bytes > 0 ? `${usageBytes(String(bytes))}/s` : unlimited; }
function percentage(used: string, limit: string) {
    const cap = BigInt(limit);
    const value = cap > 0n ? BigInt(used) * 10000n / cap : 0n;
    return Number(value > 10000n ? 10000n : value) / 100;
}

export function ResourceUsage({ owner }: { owner: string }) {
    const { t } = useTranslation('trafficControl');
    const { data, error } = useSWR(owner === 'unattributed' ? null : [authScope(), 'resource-usage', owner], () => authAPI<Go.resource.Report>('GET', `/usage/resources?owner=${encodeURIComponent(owner)}`), { refreshInterval: 5000 });
    if (error && typeof error === 'object' && 'code' in error && error.code === 404) return null;
    return <section className="min-w-0 space-y-4 border-t border-ui-border pt-4" aria-label={t('resources.liveUsage')}>
        <h3 className="font-medium">{t('resources.liveUsage')}</h3>
        <p className="text-xs text-ui-muted">{t('resources.usageHelp')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('resources.requestFailed')}</p>}
        {data && <>
            {!data.enabled && <p className="text-sm text-ui-muted">{t('resources.disabled')}</p>}
            {data.persistenceDegraded && <p role="alert" className="text-sm text-ui-warning">{t('resources.persistenceWarning')}</p>}
            <div className="grid min-w-0 gap-3 lg:grid-cols-2">{(data.scopes ?? []).map(scope => <section key={`${scope.scope}:${scope.scopeId}`} className="min-w-0 space-y-2 rounded-ui-sm border border-ui-border p-3">
                <h4 className="break-words text-sm font-medium">{t(`resources.scope_${scope.scope}`)} · {scope.name || scope.scopeId}</h4>
                <p className="text-xs tabular-nums">↑ {rate(scope.enforcedProfile.upload.bytesPerSecond, t('resources.unlimited'))} · ↓ {rate(scope.enforcedProfile.download.bytesPerSecond, t('resources.unlimited'))}</p>
                {(scope.scope === 'user' || scope.scope === 'credential') && <>
                    <p className="text-xs tabular-nums">TCP {scope.sessions.tcp} / {scope.enforcedLimits.maxTcpSessions || t('resources.unlimited')} · UDP {scope.sessions.udp} / {scope.enforcedLimits.maxUdpSessions || t('resources.unlimited')} · {t('resources.totalSessions')} {scope.sessions.total} / {scope.enforcedLimits.maxSessions || t('resources.unlimited')}</p>
                    <p className="text-xs tabular-nums">{t('resources.admissionRates', { cps: scope.enforcedLimits.connectionsPerSecond || t('resources.unlimited'), pps: scope.enforcedLimits.packetsPerSecond || t('resources.unlimited') })}</p>
                    <p className="text-xs text-ui-muted">{t('resources.rejections', { sessions: scope.rejectedSessions, packets: scope.rejectedPackets })}</p>
                    {scope.lastRejection && <p className="text-xs text-ui-muted">{t('resources.lastRejection')}: {t(`resources.reasons.${scope.lastRejection}`)} · {new Date(scope.lastRejectedAt * 1000).toLocaleString()}</p>}
                </>}
            </section>)}</div>
            <div className="space-y-3">{(data.quotas ?? []).map(quota => <QuotaUsage key={`${quota.scope}:${quota.scopeId}:${quota.quotaId}`} quota={quota} />)}</div>
            {data.quotas?.length === 0 && <p className="text-sm text-ui-muted">{t('resources.noQuotas')}</p>}
        </>}
        {owner !== 'unattributed' && <ResourceAlerts key={`${authScope()}:${owner}`} owner={owner} />}
    </section>;
}

function QuotaUsage({ quota }: { quota: Go.resource.QuotaUsage }) {
    const { t } = useTranslation('trafficControl');
    return <section className="min-w-0 space-y-2 rounded-ui-sm border border-ui-border p-3">
        <h4 className="break-words text-sm font-medium">{t(`resources.scope_${quota.scope}`)} · {t(`resources.${quota.period}`)}</h4>
        <p className="break-all text-xs text-ui-muted">{quota.scopeId} · {quota.quotaId}</p>
        <p className="text-xs">{t(`resources.${quota.action}`)} · {quota.resetsAt ? t('resources.resetsAt', { time: new Date(quota.resetsAt * 1000).toISOString() }) : t('resources.noReset')} · {t('resources.denialChecks', { checks: quota.violations })}</p>
        {(['upload', 'download', 'combined'] as const).filter(dimension => BigInt(quota.limit[dimension]) > 0n).map(dimension => <div key={dimension} className="space-y-1">
            <div className="flex flex-wrap justify-between gap-2 text-xs tabular-nums"><span>{t(`resources.quota${dimension[0].toUpperCase()}${dimension.slice(1)}`)}</span><span title={`${quota.used[dimension]} / ${quota.limit[dimension]}`}>{usageBytes(quota.used[dimension])} / {usageBytes(quota.limit[dimension])} · {t('resources.remaining', { value: usageBytes(quota.remaining[dimension]) })}</span></div>
            <meter className="block h-3 w-full" aria-label={t(`resources.quota${dimension[0].toUpperCase()}${dimension.slice(1)}`)} min={0} max={100} value={percentage(quota.used[dimension], quota.limit[dimension])} />
            <p className="text-xs text-ui-muted">{t('resources.measuredRecovery', { measured: usageBytes(quota.measured[dimension]), recovery: usageBytes(quota.recoveryCharge[dimension]) })}</p>
        </div>)}
    </section>;
}

function ResourceAlerts({ owner }: { owner: string }) {
    const { t } = useTranslation('trafficControl');
    const [cursors, setCursors] = useState<string[]>(['']);
    const before = cursors[cursors.length - 1];
    const { data, error, mutate } = useSWR([authScope(), 'resource-alerts', owner, before], () => authAPI<Go.resource.AlertPage>('GET', `/usage/resource-alerts?owner=${encodeURIComponent(owner)}&before=${encodeURIComponent(before)}&limit=30`), { refreshInterval: before ? 0 : 5000 });
    if (error && typeof error === 'object' && 'code' in error && error.code === 404) return null;
    return <section className="min-w-0 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-medium">{t('resources.alertHistory')}</h4><Button size="sm" onClick={() => void mutate()}>{t('resources.reload')}</Button></div>
        <p className="text-xs text-ui-muted">{t('resources.alertHelp')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('resources.requestFailed')}</p>}
        <ul className="space-y-2">{(data?.items ?? []).map(event => <li key={event.id} className="min-w-0 break-words text-xs"><span className="tabular-nums">{new Date(event.occurredAt * 1000).toLocaleString()} · {event.threshold}%</span> · {t(`resources.scope_${event.scope}`)}<p className="break-all text-ui-muted">{event.scopeId} · {event.quotaId} · {t(`resources.${event.period}`)}</p></li>)}</ul>
        <div className="flex flex-wrap gap-2"><Button size="sm" disabled={cursors.length === 1} onClick={() => setCursors(current => current.slice(0, -1))}>{t('resources.previousAlerts')}</Button><Button size="sm" disabled={!data?.next} onClick={() => { if (data?.next) setCursors(current => [...current, data.next]); }}>{t('resources.nextAlerts')}</Button></div>
    </section>;
}
