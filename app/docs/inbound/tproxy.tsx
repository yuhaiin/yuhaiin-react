import { SettingCheck, SettingInputVertical } from '@/app/component/v2/forms';
import { FC } from "react";
import { tproxy } from '../pbes/config/inbound_pb';


export const TProxy: FC<{ tproxy: tproxy, onChange: (x: tproxy) => void }> = ({ tproxy, onChange }) => {
    return (
        <>
            <SettingCheck label='DNS Hijacking'
                checked={tproxy.dnsHijacking}
                onChange={() => onChange({ ...tproxy, dnsHijacking: !tproxy.dnsHijacking })} />
            <SettingCheck label='Force Fake IP'
                checked={tproxy.forceFakeip}
                onChange={() => onChange({ ...tproxy, forceFakeip: !tproxy.forceFakeip })} />
            <SettingInputVertical label='Host' value={tproxy.host} onChange={(e: string) => onChange({ ...tproxy, host: e })} />
        </>
    )
}