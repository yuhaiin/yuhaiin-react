import { getNetworkProtection, putNetworkProtection, systemNetworkKeys } from '@/api/system-network';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/component/v2/accordion';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { SwitchCard } from '@/component/v2/forms';
import { cn, ui } from '@/component/v2/styles';
import { useActionAllowed } from '@/auth/policy';
import type { ProtectionSettings, ProtectionStatus } from '@/contract/system-network';
import { useLocaleFormat } from '@/i18n/useLocaleFormat';
import { ArrowDown, Ban, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/** Visual tone of each protection state; "protected" is only shown when the OS verified the rules. */
const stateVariant: Record<string, 'success' | 'warning' | 'danger' | 'muted' | 'info'> = {
    protected: 'success', disabled: 'muted', initializing: 'info', updating: 'info', degraded: 'warning', error: 'danger', unsupported: 'muted',
};

export const recoveryCommand = 'sudo yuhaiin protection disable --recovery';

function ProtectionBadge({ state }: { state: string }) {
    const { t } = useTranslation('systemNetwork');
    return <Badge variant={stateVariant[state] ?? 'muted'} title={t(`protection.stateHelp.${state}`, { defaultValue: '' })} className="shrink-0">
        {t(`protection.state.${state}`, { defaultValue: state })}</Badge>;
}

/**
 * Network Protection (kill switch): blocks Internet traffic that does not go
 * through Yuhaiin, at the operating system level, also while Yuhaiin is not
 * running. Everything shown comes from the operating system's real state.
 */
export function ProtectionTab() {
    const { t } = useTranslation('systemNetwork');
    const status = useSWR(systemNetworkKeys.protection, getNetworkProtection, { refreshInterval: 5000, revalidateOnFocus: true });
    const [saving, setSaving] = useState(false);
    const [failure, setFailure] = useState<string>();
    const canWrite = useActionAllowed('settings:write', true);
    const data = status.data;
    const loadError = status.error ? String((status.error as { msg?: string })?.msg ?? status.error) : undefined;

    const save = async (settings: ProtectionSettings) => {
        if (settings.enabled && !data?.desired.enabled && !await confirmAction(t('protection.confirmEnable', { command: recoveryCommand }))) return;
        setSaving(true);
        setFailure(undefined);
        try {
            await status.mutate(await putNetworkProtection(settings), { revalidate: false });
        } catch (e) {
            setFailure(String((e as { msg?: string })?.msg ?? e));
            void status.mutate();
        } finally {
            setSaving(false);
        }
    };

    return <div className="grid min-w-0 gap-5">
        <Card noMargin>
            <CardHeader>
                <div className="min-w-0">
                    <h2 className={ui.sectionTitle}>{t('protection.title')}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t('protection.help')}</p>
                </div>
                <Button size="sm" variant="outline-secondary" loading={status.isValidating} onClick={() => void status.mutate()}><RefreshCw size={15} />{t('protection.refresh')}</Button>
            </CardHeader>
            <CardBody className="grid gap-4">
                {loadError && <p role="alert" className="text-sm text-ui-danger">{loadError}</p>}
                {!data && !loadError && <p className="text-sm text-ui-muted">{t('protection.loading')}</p>}
                {data && !data.supported && <p role="note" className={cn(ui.softPanel, 'p-4 text-sm leading-relaxed text-ui-fg')}>{t('protection.unsupported')}</p>}
                {data && data.supported && <>
                    <Summary data={data} />
                    <div className="grid gap-1">
                        <SwitchCard label={t('protection.enable')} description={t('protection.enableHelp')} checked={data.desired.enabled}
                            disabled={saving || !canWrite} onCheckedChange={enabled => void save({ ...data.desired, enabled, startAtBoot: enabled && !data.desired.enabled ? true : data.desired.startAtBoot })} />
                        <SwitchCard label={t('protection.startAtBoot')} description={t('protection.startAtBootHelp')} checked={data.desired.startAtBoot}
                            disabled={saving || !canWrite || !data.desired.enabled} onCheckedChange={startAtBoot => void save({ ...data.desired, startAtBoot })} />
                        <p className="m-0 flex gap-2 px-0 text-xs leading-relaxed text-ui-muted">
                            <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{t('protection.preserved')}</p>
                    </div>
                    {failure && <p role="alert" className="rounded-ui-sm border border-ui-danger/40 p-3 text-sm text-ui-danger">{failure}</p>}
                    <Problems data={data} />
                    <p className="m-0 text-xs leading-relaxed text-ui-muted">{t('protection.recovery')} <code className="font-mono text-ui-fg">{recoveryCommand}</code></p>
                </>}
            </CardBody>
        </Card>
        {data?.supported && <Flow data={data} />}
        {data?.supported && <Policy data={data} />}
        {data?.supported && <Details data={data} />}
    </div>;
}

function Summary({ data }: { data: ProtectionStatus }) {
    const { t } = useTranslation('systemNetwork');
    return <div className="grid gap-2">
        <p className="m-0 flex min-w-0 flex-wrap items-center gap-2 text-sm text-ui-fg" aria-live="polite">
            <ProtectionBadge state={data.state} />
            <span className="font-medium text-ui-heading">{t(`protection.headline.${data.state}`, { defaultValue: '' })}</span>
            {data.backendName && <span className={ui.chip}>{data.backendName}</span>}
        </p>
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
            <dt className="text-ui-muted">{t('protection.desired')}</dt>
            <dd className="m-0">{t(data.desired.enabled ? 'protection.on' : 'protection.off')}</dd>
            <dt className="text-ui-muted">{t('protection.effective')}</dt>
            <dd className={cn('m-0', data.effective ? 'text-ui-success' : data.desired.enabled ? 'text-ui-danger' : '')}>
                {t(data.effective ? 'protection.enforced' : 'protection.notEnforced')}</dd>
        </dl>
    </div>;
}

function Problems({ data }: { data: ProtectionStatus }) {
    const { t } = useTranslation('systemNetwork');
    const problems = data.problems ?? [];
    if (problems.length === 0) return null;
    const severe = data.state === 'error';
    return <section role="alert" className={cn('grid gap-2 rounded-ui-md border p-3 text-sm',
        severe ? 'border-ui-danger/50 text-ui-danger' : 'border-ui-warning/50 bg-ui-warning-soft text-ui-fg')}>
        <h3 className="m-0 text-sm font-medium">{t('protection.problems')}</h3>
        <ul className="m-0 grid gap-2 pl-4">{problems.map((p, i) => <li key={`${p.code}:${i}`} className="break-words">
            <span>{t(`protection.problem.${p.code}`, { defaultValue: '' }) || p.message}</span>
            {t(`protection.problem.${p.code}`, { defaultValue: '' }) && <span className="block text-xs text-ui-muted">{p.message}</span>}
            {p.hint && <span className="block text-xs">{p.hint}</span>}
        </li>)}</ul>
    </section>;
}

/** What happens to traffic: the allowed paths and the blocked one. */
function Flow({ data }: { data: ProtectionStatus }) {
    const { t } = useTranslation('systemNetwork');
    const active = data.effective;
    const path = (label: string, detail: string, allowed: boolean, on = true) => <li className={cn('grid gap-0.5 rounded-ui-md border px-3 py-2 text-sm',
        !on ? 'border-ui-border text-ui-muted opacity-75' : allowed ? 'border-ui-success/50 text-ui-fg' : 'border-ui-danger/50 bg-ui-danger-soft/40 text-ui-fg')}>
        <span className="flex items-center gap-2 font-medium text-ui-heading">
            {allowed ? <Check size={14} className="text-ui-success" aria-hidden="true" /> : <Ban size={14} className="text-ui-danger" aria-hidden="true" />}{label}</span>
        <span className="text-xs text-ui-muted">{detail}</span>
    </li>;
    const tunnels = data.tunnelInterfaces.length ? data.tunnelInterfaces.join(', ') : t('protection.flow.noTunnel');
    return <Card noMargin>
        <CardHeader><div className="min-w-0">
            <h2 className={ui.sectionTitle}>{t('protection.flow.title')}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t(active ? 'protection.flow.help' : 'protection.flow.inactive')}</p>
        </div></CardHeader>
        <CardBody>
            <ol className="m-0 grid list-none gap-1 p-0">
                <li className="rounded-ui-md border border-ui-border px-3 py-2 text-sm text-ui-fg">{t('protection.flow.internet')}</li>
                <li aria-hidden className="flex justify-center text-ui-muted"><ArrowDown size={14} /></li>
                <li className="rounded-ui-md border border-ui-primary/50 bg-ui-selected/40 px-3 py-2 text-sm text-ui-heading">{t('protection.flow.protection')}</li>
                <li aria-hidden className="flex justify-center text-ui-muted"><ArrowDown size={14} /></li>
            </ol>
            <ul className="m-0 grid gap-2 p-0 @2xl:grid-cols-2" aria-label={t('protection.flow.title')}>
                {path(t('protection.flow.tunnel'), t('protection.flow.tunnelDetail', { names: tunnels }), true, active && data.tunnelInterfaces.length > 0)}
                {path(t('protection.flow.own'), data.ownTraffic.allowed ? t('protection.flow.ownDetail') : (data.ownTraffic.reason || t('protection.flow.ownBlocked')), data.ownTraffic.allowed || !active, active)}
                {path(t('protection.flow.private'), t('protection.flow.privateDetail', { count: data.privateNetworks.length }), true, active)}
                {path(t('protection.flow.bypass'), t('protection.flow.bypassDetail', { count: data.bypassCount }), true, active && data.bypassCount > 0)}
                {path(t('protection.flow.blocked'), t('protection.flow.blockedDetail', { names: data.physicalInterfaces.join(', ') || '—' }), false, active)}
            </ul>
            {active && (!data.tunnelIpv4 || !data.tunnelIpv6) && data.tunnelInterfaces.length > 0 && <p className="mt-3 text-xs text-ui-muted">
                {t(!data.tunnelIpv6 ? 'protection.flow.noIPv6' : 'protection.flow.noIPv4')}</p>}
        </CardBody>
    </Card>;
}

function NetworkList({ items, total }: { items: string[]; total: number }) {
    const { t } = useTranslation('systemNetwork');
    if (total === 0) return <span className="text-ui-muted">—</span>;
    return <span className="flex min-w-0 flex-wrap gap-1">
        {items.slice(0, 12).map(n => <span key={n} className={cn(ui.chip, 'font-mono')}>{n}</span>)}
        {total > Math.min(items.length, 12) && <span className="text-xs text-ui-muted">{t('protection.more', { count: total - Math.min(items.length, 12) })}</span>}
    </span>;
}

/** The enforced policy, one row per kind of traffic. */
function Policy({ data }: { data: ProtectionStatus }) {
    const { t } = useTranslation('systemNetwork');
    const format = useLocaleFormat();
    const blocked = data.blocked;
    const row = (label: string, help: string, value: ReactNode) => <>
        <dt className="grid gap-0.5"><span className="text-sm text-ui-heading">{label}</span><span className="text-xs text-ui-muted">{help}</span></dt>
        <dd className="m-0 min-w-0 text-sm">{value}</dd>
    </>;
    const names = (list: string[]) => list.length ? <span className="flex flex-wrap gap-1">{list.map(n => <span key={n} className={cn(ui.chip, 'font-mono')}>{n}</span>)}</span>
        : <span className="text-ui-muted">—</span>;
    return <Card noMargin>
        <CardHeader><h2 className={ui.sectionTitle}>{t('protection.policy.title')}</h2></CardHeader>
        <CardBody>
            <dl className="m-0 grid gap-x-6 gap-y-3 @2xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
                {row(t('protection.policy.physical'), t('protection.policy.physicalHelp'), names(data.physicalInterfaces))}
                {row(t('protection.policy.tunnels'), t('protection.policy.tunnelsHelp'), names(data.tunnelInterfaces))}
                {row(t('protection.policy.private'), t('protection.policy.privateHelp'), <NetworkList items={data.privateNetworks} total={data.privateNetworks.length} />)}
                {row(t('protection.policy.bypass'), t('protection.policy.bypassHelp'), <NetworkList items={data.bypassNetworks} total={data.bypassCount} />)}
                {row(t('protection.policy.endpoints'), t('protection.policy.endpointsHelp'),
                    data.ownTraffic.allowed ? <span>{t('protection.policy.endpointsValue', { group: data.ownTraffic.group ?? '' })}
                        {data.ownTraffic.connections != null && <span className="text-ui-muted"> · {t('protection.policy.connections', { count: data.ownTraffic.connections })}</span>}</span>
                        : <span className="text-ui-warning">{data.ownTraffic.reason || t('protection.flow.ownBlocked')}</span>)}
                {row(t('protection.policy.blocked'), t('protection.policy.blockedHelp'), blocked == null
                    ? <span className="text-ui-muted">{t('protection.policy.blockedUnknown')}</span>
                    : <span>{t('protection.policy.blockedValue', { packets: blocked.packets, bytes: blocked.bytes })}
                        {blocked.lastAt != null && <span className="text-ui-muted"> · {t('protection.policy.lastBlocked', { time: format.time(new Date(blocked.lastAt * 1000)) })}</span>}</span>)}
            </dl>
        </CardBody>
    </Card>;
}

function Details({ data }: { data: ProtectionStatus }) {
    const { t } = useTranslation('systemNetwork');
    const format = useLocaleFormat();
    const yesNo = (v?: boolean | null) => v == null ? t('protection.unknown') : t(v ? 'outbound.yes' : 'outbound.no');
    return <Accordion type="single" collapsible>
        <AccordionItem value="details">
            <AccordionTrigger>{t('protection.details.title')}</AccordionTrigger>
            <AccordionContent>
                <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-ui-muted">{t('protection.details.backend')}</dt><dd className="m-0">{data.backendName ?? '—'} <span className="font-mono text-ui-muted">{data.backend}</span></dd>
                    <dt className="text-ui-muted">{t('protection.details.service')}</dt><dd className="m-0">{t(`protection.service.${data.service || 'unknown'}`, { defaultValue: data.service ?? '—' })}
                        {data.serviceVersion && <span className="font-mono text-ui-muted"> {data.serviceVersion}</span>}</dd>
                    <dt className="text-ui-muted">{t('protection.details.filter')}</dt><dd className="m-0">{yesNo(data.filter.enabled)}</dd>
                    <dt className="text-ui-muted">{t('protection.details.registered')}</dt><dd className="m-0">{yesNo(data.filter.registered)}</dd>
                    <dt className="text-ui-muted">{t('protection.details.persistent')}</dt><dd className="m-0">{yesNo(data.filter.persistent)}</dd>
                    <dt className="text-ui-muted">{t('protection.details.loaded')}</dt><dd className="m-0">{yesNo(data.filter.loaded)}</dd>
                    <dt className="text-ui-muted">{t('protection.details.reference')}</dt><dd className="m-0">{yesNo(data.filter.reference)}</dd>
                    {data.filter.name && <><dt className="text-ui-muted">{t('protection.details.anchor')}</dt><dd className="m-0 font-mono">{data.filter.name}</dd></>}
                    <dt className="text-ui-muted">{t('protection.details.updated')}</dt><dd className="m-0">{data.updatedAt ? format.time(new Date(data.updatedAt * 1000)) : '—'}</dd>
                    <dt className="text-ui-muted">{t('protection.details.checked')}</dt><dd className="m-0">{data.checkedAt ? format.time(new Date(data.checkedAt * 1000)) : '—'}</dd>
                    {data.error && <><dt className="text-ui-muted">{t('protection.details.lastError')}</dt><dd className="m-0 break-words text-ui-danger">{data.error}</dd></>}
                </dl>
            </AccordionContent>
        </AccordionItem>
    </Accordion>;
}
