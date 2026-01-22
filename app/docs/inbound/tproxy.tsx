
import { FC } from "react";
import { SettingInputText } from '../../component/components';
import { SettingCheck } from "../../component/switch";
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
            <SettingInputText label='Host' value={tproxy.host} onChange={(e: string) => onChange({ ...tproxy, host: e })} />
        </>
    )
}