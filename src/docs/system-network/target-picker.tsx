import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import type { RouteTarget, SystemNetworkInterfaces } from '@/contract/system-network';
import { useTranslation } from 'react-i18next';

/**
 * Chooses where traffic goes. Only target types the platform supports are
 * offered; interfaces are picked from the discovered list, never typed.
 */
export function TargetPicker({ value, onChange, types, interfaces, tproxy = false }: {
    value: RouteTarget;
    onChange: (value: RouteTarget) => void;
    types: string[];
    interfaces?: SystemNetworkInterfaces;
    tproxy?: boolean;
}) {
    const { t } = useTranslation('systemNetwork');
    const labels: Record<string, [string, string]> = {
        tun_inbound: [t('editor.targetTun'), t('editor.targetTunHelp')],
        interface: [t('editor.targetInterface'), t('editor.targetInterfaceHelp')],
        tproxy: [t('forwarding.egressTProxy'), t('forwarding.egressTProxyHelp')],
        routes: [t('forwarding.egressRoutes'), t('forwarding.egressRoutesHelp')],
    };
    const choose = (type: string) => onChange({ type });
    const tuns = interfaces?.tunInbounds ?? [];
    const routable = (interfaces?.items ?? []).filter(i => i.routable);
    const selected = interfaces?.items.find(i => i.name === value.interfaceName);
    const missing = value.type === 'interface' && value.interfaceName && !selected;
    return <div className="grid min-w-0 gap-3">
        {types.length > 1 && <ToggleGroup type="single" className="w-full" value={value.type} onValueChange={next => next && choose(next)} aria-label={t('editor.stepTarget')}>
            {types.map(type => <ToggleItem key={type} value={type} className="min-h-11 min-w-0 flex-1 basis-0 px-2">{labels[type]?.[0] ?? type}</ToggleItem>)}
        </ToggleGroup>}
        <p className="text-xs leading-relaxed text-ui-muted">{labels[value.type]?.[1]}</p>
        {value.type === 'tun_inbound' && (tuns.length
            ? <SettingSelectVertical label={t('editor.chooseTun')} value={value.inboundId ?? ''} emptyChoose emptyChooseName={t('editor.chooseTun')}
                values={tuns.filter(tun => !tproxy || !tun.platform).map(tun => [`${tun.name || tun.id} · ${tun.running ? t('editor.running') : t('editor.stopped')}`, tun.id] as [string, string])}
                onChange={inboundId => onChange({ type: 'tun_inbound', inboundId })} />
            : <p role="status" className="text-sm text-ui-warning">{t('editor.noTuns')}</p>)}
        {value.type === 'tproxy' && ((interfaces?.tproxyInbounds ?? []).length
            ? <SettingSelectVertical label={t('forwarding.chooseTProxy')} value={value.inboundId ?? ''} emptyChoose emptyChooseName={t('forwarding.chooseTProxy')}
                values={(interfaces?.tproxyInbounds ?? []).map(i => [`${i.name || i.id} · ${i.listen}`, i.id] as [string, string])}
                onChange={inboundId => onChange({ type: 'tproxy', inboundId })} />
            : <p role="status" className="text-sm text-ui-warning">{t('forwarding.noTProxy')}</p>)}
        {value.type === 'interface' && <>
            {routable.length || missing
                ? <SettingSelectVertical label={t('editor.chooseInterface')} value={value.interfaceName ?? ''} emptyChoose emptyChooseName={t('editor.chooseInterface')}
                    values={[...routable.map(i => [`${i.name} · ${t(`interfaces.types.${i.type}`)}${i.addresses[0] ? ' · ' + i.addresses[0] : ''}`, i.name] as [string, string]),
                        ...(missing ? [[t('routing.target.missing', { name: value.interfaceName }), value.interfaceName ?? ''] as [string, string]] : [])]}
                    onChange={name => {
                        const info = interfaces?.items.find(i => i.name === name);
                        onChange({ type: 'interface', interfaceName: name, hardwareAddr: info?.hardwareAddr || undefined, gateway: value.gateway, gatewayV6: value.gatewayV6 });
                    }} />
                : <p role="status" className="text-sm text-ui-warning">{t('editor.noInterfaces')}</p>}
            {missing && <p role="status" className="text-xs text-ui-warning">{t('editor.interfaceNotFound', { name: value.interfaceName })}</p>}
            {value.interfaceName && <details>
                <summary className="cursor-pointer text-sm text-ui-muted">{t('editor.advanced')}</summary>
                <div className="mt-3 grid gap-3">
                    {selected?.pointToPoint || selected?.type === 'tunnel'
                        ? <p className="text-xs text-ui-muted">{t('editor.gatewayNotNeeded')}</p>
                        : <>
                            <p className="text-xs leading-relaxed text-ui-muted">{t('editor.gatewayHelp')}</p>
                            <div className="grid gap-3 @xl:grid-cols-2">
                                <div>
                                    <SettingInputVertical label={t('editor.gateway')} value={value.gateway ?? ''} placeholder={selected?.gateway ?? '192.168.1.1'}
                                        onChange={gateway => onChange({ ...value, gateway: gateway.trim() || undefined })} />
                                    <p className="mt-1 text-xs text-ui-muted">{selected?.gateway ? t('editor.gatewayDetected', { gateway: selected.gateway }) : t('editor.gatewayNone')}</p>
                                </div>
                                <div>
                                    <SettingInputVertical label={t('editor.gatewayV6')} value={value.gatewayV6 ?? ''} placeholder={selected?.gatewayV6 ?? 'fe80::1'}
                                        onChange={gatewayV6 => onChange({ ...value, gatewayV6: gatewayV6.trim() || undefined })} />
                                    {selected?.gatewayV6 && <p className="mt-1 text-xs text-ui-muted">{t('editor.gatewayDetected', { gateway: selected.gatewayV6 })}</p>}
                                </div>
                            </div>
                        </>}
                </div>
            </details>}
        </>}
    </div>;
}
