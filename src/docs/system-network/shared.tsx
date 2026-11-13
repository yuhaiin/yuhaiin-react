import { Badge } from '@/component/v2/badge';
import type { RouteMatch, RouteTarget, SystemNetworkInterfaces } from '@/contract/system-network';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

const stateVariant: Record<string, 'success' | 'warning' | 'danger' | 'muted' | 'info'> = {
    active: 'success', pending: 'info', degraded: 'warning', conflict: 'warning', unavailable: 'warning',
    unsupported: 'muted', disabled: 'muted', failed: 'danger',
};

/** Runtime state of a rule or of the manager. The title explains the state. */
export function StateBadge({ state }: { state?: string }) {
    const { t } = useTranslation('systemNetwork');
    const value = state || 'pending';
    return <Badge variant={stateVariant[value] ?? 'muted'} title={t(`stateHelp.${value}`)} className="shrink-0">{t(`state.${value}`)}</Badge>;
}

export function describeMatch(t: TFunction<'systemNetwork'>, match: RouteMatch): string {
    if (match.mode !== 'custom') return t(`routing.destination.${match.mode === 'global' ? 'global' : 'non_private'}`);
    const parts: string[] = [];
    const countries = (match.geoipCountries ?? []).join(', ');
    if (match.includeCidrs?.length) parts.push(t('routing.destination.cidrs', { count: match.includeCidrs.length }));
    if (match.geoipInvert) parts.push(t('routing.destination.except', { countries: countries || '—' }));
    else if (countries) parts.push(t('routing.destination.countries', { countries }));
    return parts.join(' · ') || t('routing.destination.custom');
}

/** Human name of a target: the TUN inbound's name or the interface name. */
export function describeTarget(t: TFunction<'systemNetwork'>, target: RouteTarget, interfaces?: SystemNetworkInterfaces): string {
    if (target.type === 'routes') return t('forwarding.egressRoutes');
    if (target.type === 'tproxy') return t('forwarding.egressTProxy') + ' ' + (interfaces?.tproxyInbounds?.find(i => i.id === target.inboundId)?.name ?? target.inboundId ?? '');
    if (target.type === 'tun_inbound') {
        const tun = interfaces?.tunInbounds.find(i => i.id === target.inboundId);
        return tun ? tun.name || tun.id : t('routing.target.missing', { name: target.inboundId ?? '' });
    }
    const present = !interfaces || interfaces.items.some(i => i.name === target.interfaceName);
    return present ? target.interfaceName ?? '' : t('routing.target.missing', { name: target.interfaceName ?? '' });
}
