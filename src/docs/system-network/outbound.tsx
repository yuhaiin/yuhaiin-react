import { getSystemNetworkOutbound, systemNetworkKeys } from '@/api/system-network';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/component/v2/accordion';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { cn, ui } from '@/component/v2/styles';
import type { OutboundInterface, OutboundRouting, OutboundScopedRoute } from '@/contract/system-network';
import { ArrowDown, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { StateBadge } from './shared';

const ownerVariant = { yuhaiin: 'primary', external: 'info', system: 'muted' } as const;
const scopedVariant: Record<string, 'success' | 'info' | 'muted' | 'warning' | 'danger'> = {
    primary: 'success', borrowed: 'info', owned: 'success', unavailable: 'warning', failed: 'danger',
};

/** Platforms with their own explanation; others use the generic text. */
const knownPlatform = (p: string) => ['linux', 'darwin', 'windows', 'android'].includes(p) ? p : 'other';

/**
 * Read-only view of how Yuhaiin keeps the connections it makes itself out of
 * its own TUN (Socket Protection) and which interfaces they use (Egress
 * Selection). Other applications' traffic follows the route rules instead.
 */
export function OutboundTab() {
    const { t } = useTranslation('systemNetwork');
    const outbound = useSWR(systemNetworkKeys.outbound, getSystemNetworkOutbound, { refreshInterval: 10000, revalidateOnFocus: false });
    const data = outbound.data;
    const error = outbound.error ? String((outbound.error as { msg?: string })?.msg ?? outbound.error) : undefined;
    return <div className="grid min-w-0 gap-5">
        <Card noMargin>
            <CardHeader>
                <div className="min-w-0">
                    <h2 className={ui.sectionTitle}>{t('outbound.title')}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t('outbound.help')}</p>
                </div>
                <Button size="sm" variant="outline-secondary" loading={outbound.isValidating} onClick={() => void outbound.mutate()}><RefreshCw size={15} />{t('outbound.refresh')}</Button>
            </CardHeader>
            <CardBody>
                {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
                {!data && !error && <p className="text-sm text-ui-muted">{t('outbound.loading')}</p>}
                {data && <Summary data={data} />}
            </CardBody>
        </Card>
        {data && <Flows data={data} />}
        {data && <Interfaces data={data} />}
        {data && <Details data={data} />}
    </div>;
}

function Summary({ data }: { data: OutboundRouting }) {
    const { t } = useTranslation('systemNetwork');
    const platform = knownPlatform(data.platform);
    return <div className="grid gap-3">
        <p className="m-0 flex min-w-0 flex-wrap items-center gap-2 text-sm text-ui-fg" aria-live="polite">
            <StateBadge state={data.state} />
            <span className="font-medium text-ui-heading">{t(`outbound.headline.${data.state}`, { defaultValue: t('outbound.headline.other') })}</span>
            {data.method && <span className={ui.chip}>{data.method}</span>}
        </p>
        {data.problems && data.problems.length > 0 && <section role="alert"
            className={cn('grid gap-1 rounded-ui-md border p-3 text-sm', data.state === 'failed' ? 'border-ui-danger/50 text-ui-danger' : 'border-ui-warning/50 bg-ui-warning-soft text-ui-fg')}>
            <h3 className="m-0 text-sm font-medium">{t('outbound.problems')}</h3>
            <ul className="m-0 grid gap-1 pl-4">{data.problems.map(p => <li key={p} className="break-words">{p}</li>)}</ul>
        </section>}
        <dl className="grid gap-x-4 gap-y-2 text-sm @2xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <dt className="text-ui-muted">{t('outbound.whyNoLoop')}</dt>
            <dd className="m-0 min-w-0">{t(`outbound.protection.${platform}`, { mark: data.mark ? `0x${data.mark.toString(16)}` : '' })}</dd>
            <dt className="text-ui-muted">{t('outbound.whichInterface')}</dt>
            <dd className="m-0 min-w-0">{t(`outbound.egressMode.${data.egressMode}`, { name: data.explicitInterface ?? '' })}</dd>
            <dt className="text-ui-muted">{t('outbound.otherApps')}</dt>
            <dd className="m-0 min-w-0">{t('outbound.otherAppsHelp')}</dd>
        </dl>
        <ul className="m-0 grid gap-2 p-0 @2xl:grid-cols-2" aria-label={t('outbound.egressTitle')}>
            {data.egress.map(e => <li key={e.ipv6 ? 6 : 4} className="grid min-w-0 gap-1 rounded-ui-md border border-ui-border px-3 py-2 text-sm">
                <span className="text-xs text-ui-muted">{t(e.ipv6 ? 'outbound.internetV6' : 'outbound.internetV4')}</span>
                {e.error ? <span className="text-ui-warning">{e.error}</span>
                    : <span className="min-w-0 break-words"><span className="font-mono font-medium text-ui-heading">{e.interface}</span>
                        {e.gateway ? <span className="text-ui-muted"> · {t('outbound.via', { gateway: e.gateway })}</span> : null}
                        {e.metric ? <span className="text-ui-muted"> · {t('outbound.metric', { metric: e.metric })}</span> : null}</span>}
            </li>)}
        </ul>
    </div>;
}

/** The two paths side by side: what route rules govern, and what they never touch. */
function Flows({ data }: { data: OutboundRouting }) {
    const { t } = useTranslation('systemNetwork');
    const step = (label: string, tone?: 'primary') => <li className={cn('rounded-ui-md border px-3 py-2 text-sm',
        tone === 'primary' ? 'border-ui-primary/50 bg-ui-selected/40 text-ui-heading' : 'border-ui-border text-ui-fg')}>{label}</li>;
    const arrow = <li aria-hidden className="flex justify-center text-ui-muted"><ArrowDown size={14} /></li>;
    return <Card noMargin>
        <CardHeader><h2 className={ui.sectionTitle}>{t('outbound.flowsTitle')}</h2></CardHeader>
        <CardBody>
            <div className="grid gap-4 @2xl:grid-cols-2">
                <section className="grid content-start gap-2">
                    <h3 className="m-0 text-sm font-medium text-ui-heading">{t('outbound.flowApps')}</h3>
                    <ol className="m-0 grid list-none gap-1 p-0">
                        {step(t('outbound.flow.apps'))}{arrow}{step(t('outbound.flow.osRouting'))}{arrow}
                        {step(t('outbound.flow.targets'))}
                    </ol>
                </section>
                <section className="grid content-start gap-2">
                    <h3 className="m-0 text-sm font-medium text-ui-heading">{t('outbound.flowYuhaiin')}</h3>
                    <ol className="m-0 grid list-none gap-1 p-0">
                        {step(t('outbound.flow.yuhaiin'))}{arrow}{step(t('outbound.flow.protection', { method: data.method || '—' }), 'primary')}{arrow}
                        {step(t('outbound.flow.egress'), 'primary')}{arrow}{step(t('outbound.flow.nic'))}
                    </ol>
                </section>
            </div>
            {data.ownTuns.length > 0 && <p className="mt-3 text-xs text-ui-muted">{t('outbound.ownTuns', { names: data.ownTuns.join(', ') })}</p>}
        </CardBody>
    </Card>;
}

function Interfaces({ data }: { data: OutboundRouting }) {
    const { t } = useTranslation('systemNetwork');
    const darwin = data.platform === 'darwin';
    return <Card noMargin>
        <CardHeader><div className="min-w-0">
            <h2 className={ui.sectionTitle}>{t('outbound.interfacesTitle')}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t(darwin ? 'outbound.interfacesHelpDarwin' : 'outbound.interfacesHelp')}</p>
        </div></CardHeader>
        <CardBody>
            {data.interfaces.length === 0 && <p className="text-sm text-ui-muted">{t('outbound.noInterfaces')}</p>}
            <ul className="m-0 grid gap-3 p-0 @3xl:grid-cols-2">
                {data.interfaces.map(i => <InterfaceCard key={i.index} item={i} darwin={darwin} />)}
            </ul>
        </CardBody>
    </Card>;
}

function InterfaceCard({ item: i, darwin }: { item: OutboundInterface; darwin: boolean }) {
    const { t } = useTranslation('systemNetwork');
    const v4 = i.addresses.filter(a => !a.includes(':'));
    const v6 = i.addresses.filter(a => a.includes(':'));
    return <li className={cn('grid min-w-0 gap-2 rounded-ui-lg border border-ui-border p-3', (!i.up || i.excluded) && 'opacity-75')}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="font-mono font-medium text-ui-heading">{i.name}</span>
            <span className="text-xs text-ui-muted">#{i.index}</span>
            <Badge variant={ownerVariant[i.ownership as keyof typeof ownerVariant] ?? 'muted'}>{t(`interfaces.ownership.${i.ownership}`)}</Badge>
            <span className={ui.chip}>{t(`interfaces.types.${i.type}`, { defaultValue: i.type })}</span>
            {!i.up && <Badge variant="muted">{t('interfaces.down')}</Badge>}
        </div>
        {i.excluded && <p className="m-0 text-xs text-ui-primary">{t('outbound.excluded')}</p>}
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
            <dt className="text-ui-muted">IPv4</dt>
            <dd className="m-0 min-w-0 break-words font-mono">{v4.length ? v4.join(', ') : '—'}
                {i.gateway && <span className="text-ui-muted"> · {t('outbound.via', { gateway: i.gateway })}</span>}
                {i.defaultMetric ? <span className="text-ui-muted"> · {t('outbound.metric', { metric: i.defaultMetric })}</span> : null}</dd>
            <dt className="text-ui-muted">IPv6</dt>
            <dd className="m-0 min-w-0 break-words font-mono">{v6.length ? v6.join(', ') : '—'}
                {i.gatewayV6 && <span className="text-ui-muted"> · {t('outbound.via', { gateway: i.gatewayV6 })}</span>}
                {i.defaultMetricV6 ? <span className="text-ui-muted"> · {t('outbound.metric', { metric: i.defaultMetricV6 })}</span> : null}</dd>
            {darwin && !i.excluded && <>
                <dt className="text-ui-muted">{t('outbound.scopedV4')}</dt><dd className="m-0 min-w-0"><Scoped route={i.scoped} /></dd>
                <dt className="text-ui-muted">{t('outbound.scopedV6')}</dt><dd className="m-0 min-w-0"><Scoped route={i.scopedV6} /></dd>
            </>}
        </dl>
    </li>;
}

function Scoped({ route }: { route?: OutboundScopedRoute }) {
    const { t } = useTranslation('systemNetwork');
    if (!route?.state) return <span className="text-ui-muted">—</span>;
    return <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <Badge variant={scopedVariant[route.state] ?? 'muted'} title={t(`outbound.scopedHelp.${route.state}`)}>{t(`outbound.scoped.${route.state}`)}</Badge>
        {route.gateway && <span className="font-mono">{t('outbound.via', { gateway: route.gateway })}</span>}
        {route.link && <span className="text-ui-muted">{t('outbound.scopedLink')}</span>}
        {route.reason && <span className="text-ui-muted">{route.reason}</span>}
    </span>;
}

function Details({ data }: { data: OutboundRouting }) {
    const { t } = useTranslation('systemNetwork');
    return <Accordion type="single" collapsible>
        <AccordionItem value="details">
            <AccordionTrigger>{t('outbound.details')}</AccordionTrigger>
            <AccordionContent>
                <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-ui-muted">{t('outbound.platform')}</dt><dd className="m-0 font-mono">{data.platform}</dd>
                    <dt className="text-ui-muted">{t('outbound.method')}</dt><dd className="m-0 font-mono">{data.method || '—'}</dd>
                    {data.mark ? <><dt className="text-ui-muted">{t('outbound.mark')}</dt><dd className="m-0 font-mono">0x{data.mark.toString(16)}</dd></> : null}
                    <dt className="text-ui-muted">{t('outbound.protectionActive')}</dt><dd className="m-0">{t(data.protectionActive ? 'outbound.yes' : 'outbound.no')}</dd>
                    <dt className="text-ui-muted">{t('outbound.egressModeLabel')}</dt><dd className="m-0 font-mono">{data.egressMode}</dd>
                    <dt className="text-ui-muted">{t('outbound.sockets')}</dt><dd className="m-0">{t('outbound.socketsValue', { ok: data.successes, failed: data.failures })}</dd>
                    {data.lastError && <><dt className="text-ui-muted">{t('outbound.lastError')}</dt><dd className="m-0 break-words text-ui-danger">{data.lastError}</dd></>}
                </dl>
                {data.rules && data.rules.length > 0 && <div className="mt-4 grid gap-2">
                    <h3 className="m-0 text-sm font-medium text-ui-heading">{t('outbound.rulesTitle')}</h3>
                    <p className="m-0 text-xs text-ui-muted">{t('outbound.rulesHelp')}</p>
                    <ul className="m-0 grid gap-1 p-0 text-sm" aria-label={t('outbound.rulesTitle')}>
                        {data.rules.map(r => <li key={`${r.ipv6}:${r.priority}`} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-ui-sm border border-ui-border px-2 py-1">
                            <span className={ui.chip}>{r.ipv6 ? 'IPv6' : 'IPv4'}</span>
                            <span className="w-14 shrink-0 font-mono text-ui-muted">{r.priority}</span>
                            <span className="min-w-0 break-all font-mono">{r.selector}</span>
                            <StateBadge state={r.state} />
                            {r.error && <span className="basis-full text-xs text-ui-danger">{r.error}</span>}
                        </li>)}
                    </ul>
                </div>}
            </AccordionContent>
        </AccordionItem>
    </Accordion>;
}
