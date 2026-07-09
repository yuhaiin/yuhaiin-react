import { SettingCheck, SettingInputBytes } from "@/component/v2/forms"
import { InputBytesList, InputList } from "@/component/v2/listeditor"
import { FC } from "react"
import { tls_config } from "../schema/node/protocol"
import { Props } from "./tools"


export const Tlsv2 = (props: Props<tls_config>) => {
    return <TlsConfigv2 value={props.value} editable={props.editable} onChange={props.onChange} />
}

export const TlsConfigv2: FC<{ value: tls_config, onChange: (x: tls_config) => void, showEnabled?: boolean, editable?: boolean }> =
    ({ value, onChange, showEnabled, editable = true }) => {
        const current = {
            ...value,
            enable: Boolean(value?.enable),
            insecureSkipVerify: Boolean(value?.insecureSkipVerify),
            serverNames: Array.isArray(value?.serverNames) ? value.serverNames : [],
            nextProtos: Array.isArray(value?.nextProtos) ? value.nextProtos : [],
            caCert: Array.isArray(value?.caCert) ? value.caCert : [],
            echConfig: value?.echConfig ?? new Uint8Array(0),
        };
        return <>
            {(showEnabled === undefined || showEnabled) &&
                <SettingCheck label="TLS Enabled" checked={current.enable} disabled={!editable} onChange={() => { onChange({ ...current, enable: !current.enable }) }} />}
            <SettingCheck label="InsecureSkipVerify" checked={current.insecureSkipVerify} disabled={!editable} onChange={() => { onChange({ ...current, insecureSkipVerify: !current.insecureSkipVerify }) }} />
            <InputList className="mb-2" title="ServerNames" data={current.serverNames} disabled={!editable} onChange={(x) => { onChange({ ...current, serverNames: x }) }} />
            <InputList className="mb-2" title="NextProtos" data={current.nextProtos} disabled={!editable} onChange={(x) => { onChange({ ...current, nextProtos: x }) }} />
            <InputBytesList title="CaCert" data={current.caCert} disabled={!editable} onChange={(x) => { onChange({ ...current, caCert: x }) }} />
            <SettingInputBytes label="ECH Config List"
                value={current.echConfig}
                disabled={!editable}
                onChange={(x) => onChange({ ...current, echConfig: x })}
            />
        </>
    }
