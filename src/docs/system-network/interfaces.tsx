import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { cn, ui } from '@/component/v2/styles';
import type { SystemNetworkInterfaces } from '@/contract/system-network';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { describeTarget } from './shared';

const ownerVariant = { yuhaiin: 'primary', external: 'info', system: 'muted' } as const;

export function InterfacesTab({ interfaces, rules, onRefresh, error }: {
    interfaces?: SystemNetworkInterfaces;
    rules: { id: string; name: string }[];
    onRefresh: () => void;
    error?: string;
}) {
    const { t } = useTranslation('systemNetwork');
    const ruleName = (id: string) => rules.find(r => r.id === id)?.name || id;
    return <div className="grid min-w-0 gap-5">
        {interfaces?.missing && interfaces.missing.length > 0 && <section role="alert" className="grid gap-2 rounded-ui-md border border-ui-warning/50 bg-ui-warning-soft p-3 text-sm">
            <h2 className="font-medium text-ui-heading">{t('interfaces.missingTitle')}</h2>
            <p className="text-xs text-ui-fg">{t('interfaces.missingHelp')}</p>
            <ul className="grid gap-1">{interfaces.missing.map(m => <li key={`${m.target.type}:${m.target.inboundId}:${m.target.interfaceName}`}>
                <span className="font-medium">{describeTarget(t, m.target, interfaces)}</span>
                <span className="block text-xs text-ui-muted">{t('interfaces.usedBy', { rules: m.ruleIds.map(ruleName).join(', ') })}</span>
            </li>)}</ul>
        </section>}
        <Card noMargin>
            <CardHeader>
                <div className="min-w-0"><h2 className={ui.sectionTitle}>{t('interfaces.title')}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t('interfaces.help')}</p></div>
                <Button size="sm" variant="outline-secondary" onClick={onRefresh}><RefreshCw size={15} />{t('interfaces.refresh')}</Button>
            </CardHeader>
            <CardBody>
                {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
                <ul className="grid gap-3 @3xl:grid-cols-2">
                    {(interfaces?.items ?? []).map(i => <li key={i.index} className={cn('grid min-w-0 gap-2 rounded-ui-lg border border-ui-border p-3', !i.up && 'opacity-70')}>
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="font-mono font-medium text-ui-heading">{i.name}</span>
                            <Badge variant={ownerVariant[i.ownership as keyof typeof ownerVariant] ?? 'muted'}
                                title={t(`interfaces.ownershipHelp.${i.ownership}`, { name: i.inboundName ?? '' })}>{t(`interfaces.ownership.${i.ownership}`)}</Badge>
                            <span className={ui.chip}>{t(`interfaces.types.${i.type}`)}</span>
                            <Badge variant={i.up ? 'success' : 'muted'}>{t(i.up ? 'interfaces.up' : 'interfaces.down')}</Badge>
                        </div>
                        {i.ownership === 'yuhaiin' && <p className="text-xs text-ui-muted">{t('interfaces.ownershipHelp.yuhaiin', { name: i.inboundName })}</p>}
                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                            <dt className="text-ui-muted">{t('interfaces.addresses')}</dt>
                            <dd className="min-w-0 break-words font-mono">{i.addresses.length ? i.addresses.join(', ') : t('interfaces.noAddress')}</dd>
                            {(i.gateway || i.gatewayV6) && <><dt className="text-ui-muted">{t('interfaces.gateway')}</dt>
                                <dd className="min-w-0 break-words font-mono">{[i.gateway, i.gatewayV6].filter(Boolean).join(', ')}</dd></>}
                            <dt className="text-ui-muted">{t('interfaces.mtu')}</dt><dd>{i.mtu}</dd>
                        </dl>
                        <p className="text-xs text-ui-muted">{t(i.ownership === 'yuhaiin' ? 'interfaces.viaTun' : i.routable ? 'interfaces.routable' : 'interfaces.notRoutable')}</p>
                    </li>)}
                </ul>
            </CardBody>
        </Card>
        {interfaces && interfaces.tunInbounds.length > 0 && <Card noMargin>
            <CardHeader><h2 className={ui.sectionTitle}>{t('interfaces.tunTitle')}</h2></CardHeader>
            <CardBody><ul className="grid gap-2 text-sm">{interfaces.tunInbounds.map(tun => <li key={tun.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{tun.name || tun.id}</span>
                <span className="text-ui-muted">{tun.running ? t('interfaces.tunRunning', { name: tun.interface }) : t('interfaces.tunStopped')}</span>
            </li>)}</ul></CardBody>
        </Card>}
    </div>;
}

