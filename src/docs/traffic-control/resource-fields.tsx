import type { Go } from '@/api/generated-contracts';
import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import type { ProxyCredential } from '@/auth/proxy';
import { authScope } from '@/auth/session';
import { createID } from '@/common/id';
import { Button } from '@/component/v2/button';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { blankProfile } from '@/contract/traffic-control';
import type { TrafficGroup } from '@/docs/security/groups';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { ProfileEditor } from './rates';
import { parseThresholds, validQuotaBytes, type ResourceLimits, type ResourcePolicy, type ResourceQuota } from './resource-policy';

export function ResourceID({ kind, value, onChange, disabled }: { kind: 'user' | 'group' | 'credential'; value: string; onChange: (id: string) => void; disabled: boolean }) {
    const { t } = useTranslation('trafficControl');
    const session = useSession();
    const permissions = session?.principal.permissions ?? [];
    const usersAllowed = permissions.includes('users:manage');
    const { data: users } = useSWR(usersAllowed && kind !== 'group' ? [authScope(), 'resource-users'] : null, () => authAPI<User[]>('GET', '/users'));
    const { data: groups } = useSWR(usersAllowed && kind === 'group' ? [authScope(), 'resource-groups'] : null, () => authAPI<TrafficGroup[]>('GET', '/groups'));
    const [owner, setOwner] = useState(session?.principal.userId ?? '');
    const canReadCredentials = permissions.includes('proxy-credentials:manage') || permissions.includes('proxy-credentials:own') && owner === session?.principal.userId;
    const { data: credentials } = useSWR(kind === 'credential' && canReadCredentials ? [authScope(), 'resource-credentials', owner] : null, () => authAPI<ProxyCredential[]>('GET', `/proxy-credentials?owner=${encodeURIComponent(owner)}`));
    const choices = kind === 'user' ? users?.map(user => ({ value: user.id, label: user.login })) : kind === 'group' ? groups?.map(group => ({ value: group.id, label: group.name })) : credentials?.map(credential => ({ value: credential.id, label: credential.name }));
    return <div className="min-w-0 space-y-2">
        {kind === 'credential' && users && <Select ariaLabel={t('resources.credentialOwner')} value={owner} disabled={disabled} items={users.map(user => ({ value: user.id, label: user.login }))} onValueChange={setOwner} />}
        {choices && <Select ariaLabel={t(`resources.${kind}Selector`)} value={value} disabled={disabled} items={[{ value: '', label: t('resources.chooseIdentity') }, ...(value && !choices.some(choice => choice.value === value) ? [{ value, label: value }] : []), ...choices]} onValueChange={onChange} />}
        <Input required maxLength={128} aria-label={t(`resources.${kind}Id`)} value={value} onChange={event => onChange(event.target.value)} disabled={disabled} />
    </div>;
}

export function ResourceLimitsEditor({ value, onChange, disabled }: { value: ResourceLimits; onChange: (value: ResourceLimits) => void; disabled: boolean }) {
    const { t } = useTranslation('trafficControl');
    const fields: Array<keyof ResourceLimits> = ['maxTcpSessions', 'maxUdpSessions', 'maxSessions', 'connectionsPerSecond', 'connectionBurst', 'packetsPerSecond', 'packetBurst'];
    return <div className="space-y-2"><p className="text-xs text-ui-muted">{t('resources.limitsHelp')}</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.map(field => <label key={field} className="min-w-0 space-y-1 text-sm"><span>{t(`resources.${field}`)}</span><Input type="number" min={0} max={field.startsWith('max') ? 65536 : 1000000} step={field.startsWith('max') ? 1 : 'any'} value={value[field]} disabled={disabled} onChange={event => onChange({ ...value, [field]: Number(event.target.value) })} /></label>)}</div></div>;
}

function ThresholdEditor({ values, onChange, disabled }: { values: number[]; onChange: (values: number[]) => void; disabled: boolean }) {
    const { t } = useTranslation('trafficControl');
    const source = values.join(',');
    const [edit, setEdit] = useState({ source, text: source });
    const text = source === edit.source ? edit.text : source;
    return <Input aria-label={t('resources.thresholds')} value={text} disabled={disabled} onChange={event => {
        const parsed = parseThresholds(event.target.value);
        event.target.setCustomValidity(parsed === null ? t('resources.invalidThresholds') : '');
        setEdit({ source: parsed?.join(',') ?? source, text: event.target.value });
        if (parsed !== null) onChange(parsed);
    }} />;
}

export function QuotaEditor({ values, onChange, disabled }: { values: ResourceQuota[]; onChange: (values: ResourceQuota[]) => void; disabled: boolean }) {
    const { t } = useTranslation('trafficControl');
    const patch = (index: number, quota: ResourceQuota) => onChange(values.map((current, i) => i === index ? quota : current));
    const periods = ['daily', 'monthly', 'lifetime'];
    return <section className="space-y-3"><h4 className="font-medium">{t('resources.quotas')}</h4><p className="text-xs text-ui-muted">{t('resources.quotaHelp')}</p>
        {values.map((quota, index) => <div key={quota.id} className="min-w-0 space-y-3 rounded-ui-sm border border-ui-border p-3">
            <div className="flex flex-wrap items-end gap-3"><label className="min-w-40 flex-1 space-y-1 text-sm"><span>{t('resources.period')}</span><Select ariaLabel={t('resources.period')} value={quota.period} disabled={disabled} items={periods.filter(period => period === quota.period || !values.some(item => item.period === period)).map(value => ({ value, label: t(`resources.${value}`) }))} onValueChange={period => { if (period === quota.period) return; void (async () => { if (await confirmAction(t('resources.periodResetConfirm'))) patch(index, { ...quota, id: createID(), period }); })(); }} /></label><Button type="button" variant="outline-danger" disabled={disabled} onClick={() => onChange(values.filter((_, i) => i !== index))}>{t('remove')}</Button></div>
            <div className="grid gap-3 sm:grid-cols-3">{(['upload', 'download', 'combined'] as const).map(dimension => <label key={dimension} className="min-w-0 space-y-1 text-sm"><span>{t(`resources.quota${dimension[0].toUpperCase()}${dimension.slice(1)}`)}</span><Input aria-label={t(`resources.quota${dimension[0].toUpperCase()}${dimension.slice(1)}`)} value={quota[dimension]} inputMode="numeric" maxLength={19} disabled={disabled} onChange={event => { event.target.setCustomValidity(validQuotaBytes(event.target.value) ? '' : t('resources.invalidBytes')); patch(index, { ...quota, [dimension]: event.target.value }); }} /></label>)}</div>
            <label className="block space-y-1 text-sm"><span>{t('resources.action')}</span><Select ariaLabel={t('resources.action')} value={quota.action} disabled={disabled} items={['block_new', 'terminate', 'throttle', 'warn'].map(value => ({ value, label: t(`resources.${value}`) }))} onValueChange={action => patch(index, { ...quota, action })} /></label>
            {quota.action === 'throttle' && <ProfileEditor profile={quota.reducedSpeed} disabled={disabled} onChange={reducedSpeed => patch(index, { ...quota, reducedSpeed })} />}
            <label className="block space-y-1 text-sm"><span>{t('resources.thresholds')}</span><ThresholdEditor values={quota.thresholds ?? []} disabled={disabled} onChange={thresholds => patch(index, { ...quota, thresholds })} /></label>
        </div>)}
        <Button type="button" disabled={disabled || values.length >= 3} onClick={() => {
            const period = periods.find(period => !values.some(quota => quota.period === period));
            if (period) onChange([...values, { id: createID(), period, upload: '0', download: '0', combined: '0', action: 'block_new', reducedSpeed: blankProfile(), thresholds: [80, 90, 100] }]);
        }}>{t('resources.addQuota')}</Button>
    </section>;
}

export function ResourcePolicyEditor({ policy, onChange, disabled }: { policy: ResourcePolicy; onChange: (policy: ResourcePolicy) => void; disabled: boolean }) {
    return <div className="space-y-4"><ProfileEditor profile={policy.profile} disabled={disabled} onChange={profile => onChange({ ...policy, profile })} /><ResourceLimitsEditor value={policy.limits} disabled={disabled} onChange={limits => onChange({ ...policy, limits })} /><QuotaEditor values={policy.quotas ?? []} disabled={disabled} onChange={quotas => onChange({ ...policy, quotas })} /></div>;
}

export type ResourceGroup = Go.resource.GroupPolicy;
