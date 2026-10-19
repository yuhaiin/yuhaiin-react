import { getGatewayConfig } from '@/api/gateway';
import { Select } from '@/component/v2/select';
import type { RouteTarget } from '@/contract/route';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function GatewayPicker({ value, onChange }: { value: RouteTarget; onChange: (target: RouteTarget) => void }) {
    const { t } = useTranslation('routing');
    const { data, error } = useSWR('/api/v2/gateway/config', getGatewayConfig, { revalidateOnFocus: false });
    const items = (data?.gateways ?? []).map(g => ({ value: g.id, label: `${g.name}${g.enabled ? '' : ` (${t('gatewayDisabled')})`}` }));
    if (value.id && !items.some(item => item.value === value.id)) items.push({ value: value.id, label: `${t('unavailableDestination')}: ${value.id}` });
    return <div className="space-y-2">
        <Select ariaLabel={t('gateway')} value={value.id ?? ''} placeholder={t('chooseGateway')} items={items}
            onValueChange={id => onChange({ type: 'gateway', id })} />
        <p className="text-xs text-ui-muted">{t('gatewayRouteHelp')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('gatewayLoadFailed')}</p>}
    </div>;
}
