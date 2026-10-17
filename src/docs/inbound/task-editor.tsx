import { Button } from '@/component/v2/button';
import { SettingInputVertical, SwitchCard } from '@/component/v2/forms';
import type { Inbound } from '@/contract/inbound';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InboundEditor, ProtocolConfigEditor } from './editor';
import { supportsSimpleInbound, proxyInstructions } from './presets';

export function InboundTaskEditor({ value, onChange, protocols, platform, defaultAdvanced = false }: { value: Inbound; onChange: (value: Inbound) => void; protocols?: string[]; platform?: string; defaultAdvanced?: boolean }) {
    const { t } = useTranslation('routing');
    const simple = supportsSimpleInbound(value);
    const [advanced, setAdvanced] = useState(!simple || defaultAdvanced);
    const patch = (fields: Partial<Inbound>) => onChange({ ...value, ...fields });
    const unsupported = protocols && !protocols.includes(value.protocol.type);
    return <div className="grid min-w-0 gap-4 [--field-margin:0px]">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-ui-muted">{t('entryTaskHelp')}</p>
            <Button size="sm" variant="outline-secondary" disabled={!simple} onClick={() => setAdvanced(previous => !previous)}>{t(advanced ? 'simpleEditor' : 'advancedEditor')}</Button></div>
        {unsupported && <p role="alert" className="text-sm text-ui-danger">{t('entryUnsupported')}</p>}
        {advanced || !simple ? <InboundEditor inbound={value} onChange={onChange} protocols={protocols} platform={platform} /> : <>
            <SettingInputVertical label={t('name')} value={value.name} onChange={name => patch({ name })} />
            <SwitchCard label={t('enableTrafficEntry')} checked={value.enabled} onCheckedChange={enabled => patch({ enabled })} />
            {value.network.type === 'tcp_udp' && <SettingInputVertical label={t('entryListenAddress')} value={value.network.tcp_udp.host}
                onChange={host => value.network.type === 'tcp_udp' && patch({ network: { ...value.network, tcp_udp: { ...value.network.tcp_udp, host } } })} />}
            {value.protocol.type === 'tun' ? <>
                <SettingInputVertical label={t('tunInterface')} value={value.protocol.tun.name}
                    onChange={name => value.protocol.type === 'tun' && patch({ protocol: { ...value.protocol, tun: { ...value.protocol.tun, name } } })} />
                <p className="text-sm text-ui-muted">{t('tunAdvancedHelp')}</p>
            </> : <ProtocolConfigEditor value={value.protocol} onChange={protocol => patch({ protocol })} />}
        </>}
        <InboundInstructions value={value} />
    </div>;
}

export function InboundInstructions({ value }: { value: Inbound }) {
    const { t } = useTranslation('routing');
    if (value.protocol.type === 'tun') return <div className="rounded-ui-lg bg-ui-surface-muted p-4 text-sm">
        <p className="font-semibold">{t('entryInstructions')}</p><p className="mt-2">{t('tunInstructions')}</p>
    </div>;
    const instructions = proxyInstructions(value);
    if (!instructions) return null;
    const endpoint = `${instructions.host}:${instructions.port}`;
    return <div className="space-y-2 rounded-ui-lg bg-ui-surface-muted p-4 text-sm">
        <p className="font-semibold">{t('entryInstructions')}</p>
        <p>{t(instructions.local ? 'localEntryInstructions' : 'lanEntryInstructions')}</p>
        {instructions.http && <p className="break-all">HTTP: <code>http://{endpoint}</code></p>}
        {instructions.socks && <p className="break-all">SOCKS5: <code>{endpoint}</code></p>}
        {instructions.auth && <p>{t('entryAuthInstructions')}</p>}
        <p className="text-ui-muted">{t('entryVerifyListener')}</p>
    </div>;
}
