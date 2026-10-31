import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import { authScope } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { UsageAuditList } from './usage-audit';
import { UsageRetention } from './usage-retention';
import { ResourceUsage } from './resource-usage';
import { fetchUsage, usageBytes, usageDate, usageDuration, usageRange, type UsageBreakdown, type UsageReport } from './usage-api';

export function UserUsage() {
    const session = useSession();
    if (!session?.principal.permissions.includes('usage:own')) return null;
    return <UsagePanel key={session.principal.userId} self={session.principal.userId} canReadAll={session.principal.permissions.includes('usage:read')} canManage={session.principal.permissions.includes('users:manage')} />;
}

function UsagePanel({ self, canReadAll, canManage }: { self: string; canReadAll: boolean; canManage: boolean }) {
    const { t } = useTranslation('auth');
    const [owner, setOwner] = useState(self);
    const [preset, setPreset] = useState('today');
    const [dates, setDates] = useState({ from: '', to: '' });
    const [applied, setApplied] = useState(dates);
    const [group, setGroup] = useState<'nodes' | 'inbounds' | 'credentials' | 'protocols'>('nodes');
    const [rangeError, setRangeError] = useState(false);
    const scope = authScope();
    const { data: users } = useSWR(canManage ? [scope, 'usage-users'] : null, () => authAPI<User[]>('GET', '/users'));
    const { data: historical } = useSWR(canReadAll ? [scope, 'usage-owners'] : null, () => fetchUsage<string[]>('/owners', {}));
    const owners = [...new Set([self, ...(users?.map(user => user.id) ?? []), ...(historical ?? []).filter(Boolean), 'unattributed'])];
    const validRange = preset !== 'custom' || Boolean(applied.from && applied.to);
    const { data, error, isLoading, mutate } = useSWR(validRange ? [scope, 'user-usage', owner, preset, applied.from, applied.to] : null,
        () => fetchUsage<UsageReport>('', { owner, ...usageRange(preset, applied.from, applied.to) }), { refreshInterval: 5000, keepPreviousData: false });
    const summary = data?.summary;
    return <Card>
        <CardHeader><h2 className="m-0 font-medium">{t('usage.title')}</h2><Button disabled={isLoading} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader>
        <CardBody className="space-y-5">
            <p className="text-sm text-ui-muted">{t('usage.hint')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
                {canReadAll && <label className="min-w-0 space-y-2"><span>{t('owner')}</span><Select ariaLabel={t('owner')} value={owner} onValueChange={setOwner} items={owners.map(id => ({ value: id, label: id === 'unattributed' ? t('usage.unattributed') : users?.find(user => user.id === id)?.login ?? id }))} /></label>}
                <label className="min-w-0 space-y-2"><span>{t('usage.period')}</span><Select ariaLabel={t('usage.period')} value={preset} onValueChange={value => { setPreset(value); setRangeError(false); }} items={['today', 'month', '30days', 'custom'].map(value => ({ value, label: t(`usage.range.${value}`) }))} /></label>
            </div>
            {preset === 'custom' && <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); try { usageRange('custom', dates.from, dates.to); setApplied(dates); setRangeError(false); } catch { setRangeError(true); } }}>
                <label className="min-w-0 flex-1 space-y-2"><span>{t('usage.from')}</span><Input type="date" value={dates.from} onChange={event => setDates({ ...dates, from: event.target.value })} required /></label>
                <label className="min-w-0 flex-1 space-y-2"><span>{t('usage.to')}</span><Input type="date" value={dates.to} onChange={event => setDates({ ...dates, to: event.target.value })} required /></label>
                <Button type="submit">{t('usage.apply')}</Button>
            </form>}
            {(error || rangeError) && <p role="alert" className="text-sm text-ui-danger">{rangeError ? t('usage.invalidRange') : t('usage.loadFailed')}</p>}
            {isLoading && <p role="status" className="text-sm text-ui-muted">{t('usage.loading')}</p>}
            {summary && <>
                <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Metric label={t('usage.periodUpload')} value={usageBytes(summary.period.upload)} exact={summary.period.upload} />
                    <Metric label={t('usage.periodDownload')} value={usageBytes(summary.period.download)} exact={summary.period.download} />
                    <Metric label={t('usage.lifetimeUpload')} value={usageBytes(summary.lifetime.upload)} exact={summary.lifetime.upload} />
                    <Metric label={t('usage.lifetimeDownload')} value={usageBytes(summary.lifetime.download)} exact={summary.lifetime.download} />
                    <Metric label={t('usage.currentRate')} value={`↑ ${usageBytes(summary.uploadRate)}/s · ↓ ${usageBytes(summary.downloadRate)}/s`} />
                    <Metric label={t('usage.connections')} value={`TCP ${summary.activeTcp} · UDP ${summary.activeUdp}`} />
                    <Metric label={t('usage.peak')} value={`TCP ${summary.peakTcp} · UDP ${summary.peakUdp}`} />
                    <Metric label={t('usage.activeMinutes')} value={summary.periodActiveMinutes} />
                    <Metric label={t('usage.opened')} value={summary.period.opened} />
                    <Metric label={t('usage.failed')} value={summary.period.failed} />
                    <Metric label={t('usage.firstSeen')} value={usageDate(summary.lifetime.firstSeen)} />
                    <Metric label={t('usage.lastSeen')} value={usageDate(summary.lifetime.lastSeen)} />
                    <Metric label={t('usage.sessionDuration')} value={usageDuration(summary.period.sessionMillis)} />
                </dl>
                <p className="text-xs text-ui-muted">{t('usage.timeHint')}</p>
                {(data.health.persistenceError || data.health.droppedAudit !== '0') && <p role="alert" className="text-sm text-ui-danger">{t('usage.incomplete', { dropped: data.health.droppedAudit })}</p>}
                <p className="text-xs text-ui-muted">{t('usage.updated')}: {usageDate(data.updatedAt)}</p>
                <UsageTrend report={data} />
                <div role="group" aria-label={t('usage.breakdown')} className="flex flex-wrap gap-2">{(['nodes', 'inbounds', 'credentials', 'protocols'] as const).map(value => <Button key={value} aria-pressed={group === value} variant={group === value ? 'primary' : 'default'} onClick={() => setGroup(value)}>{t(`usage.${value}`)}</Button>)}</div>
                <BreakdownTable rows={data[group]} label={t(`usage.${group}`)} />
            </>}
            <ResourceUsage key={`${scope}:${owner}`} owner={owner} />
            <UsageAuditList key={`${scope}:${owner}:${preset}:${applied.from}:${applied.to}`} owner={owner} preset={preset} from={applied.from} to={applied.to} />
            {canManage && <UsageRetention />}
        </CardBody>
    </Card>;
}

function Metric({ label, value, exact }: { label: string; value: string; exact?: string }) {
    return <div className="min-w-0 space-y-1"><dt className="text-xs text-ui-muted">{label}</dt><dd className="break-words text-sm font-medium tabular-nums" title={exact}>{value}</dd></div>;
}

function BreakdownTable({ rows, label }: { rows: UsageBreakdown[]; label: string }) {
    const { t } = useTranslation('auth');
    return <div className="space-y-2"><p className="text-xs text-ui-muted">{t('usage.topLimit')}</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">{label}</caption>
        <thead><tr>{[label, t('usage.upload'), t('usage.download'), t('usage.opened'), t('usage.failed')].map((title, index) => <th key={index} scope="col" className="whitespace-nowrap p-2 font-medium">{title}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-ui-border"><th scope="row" className="max-w-56 break-words p-2 font-normal" title={row.id}>{row.name || row.id || t('usage.unassigned')}</th><td className="whitespace-nowrap p-2 tabular-nums" title={row.upload}>{usageBytes(row.upload)}</td><td className="whitespace-nowrap p-2 tabular-nums" title={row.download}>{usageBytes(row.download)}</td><td className="p-2 tabular-nums">{row.opened}</td><td className="p-2 tabular-nums">{row.failed}</td></tr>)}</tbody>
    </table></div>{rows.length === 0 && <p className="text-sm text-ui-muted">{t('usage.empty')}</p>}</div>;
}

function UsageTrend({ report }: { report: UsageReport }) {
    const { t } = useTranslation('auth');
    const values = report.series.map(point => BigInt(point.upload) + BigInt(point.download));
    const peak = values.reduce((a, b) => a > b ? a : b, 1n);
    const span = Math.max(report.to - report.from, 1);
    const bucketSeconds = report.interval === 'hour' ? 3600 : 86400;
    const width = Math.max(1, Math.min(600, bucketSeconds / span * 600) - 1);
    return <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('usage.trend')}</summary>
        <svg role="img" aria-label={t('usage.trend')} viewBox="0 0 600 110" className="h-36 w-full text-ui-primary" preserveAspectRatio="none">{report.series.map((point, index) => { const height = Number(values[index] * 100n / peak); return <rect key={point.start} x={(point.start - report.from) / span * 600} y={100 - height} width={width} height={height} fill="currentColor" />; })}</svg>
        <div className="max-h-64 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col" className="p-2">UTC</th><th scope="col" className="p-2">{t('usage.upload')}</th><th scope="col" className="p-2">{t('usage.download')}</th></tr></thead><tbody>{report.series.map(point => <tr key={point.start}><th scope="row" className="p-2 font-normal">{new Date(point.start * 1000).toISOString().replace('T', ' ').slice(0, 16)}</th><td className="p-2" title={point.upload}>{usageBytes(point.upload)}</td><td className="p-2" title={point.download}>{usageBytes(point.download)}</td></tr>)}</tbody></table></div>
    </details>;
}
