import { SettingCheck, SettingInputBytes } from "@/component/v2/forms"
import { InputBytesList, InputList } from "@/component/v2/listeditor"
import { FC } from "react"
import { tls_config } from "../pbes/node/protocol_pb"
import { Props } from "./tools"


export const Tlsv2 = (props: Props<tls_config>) => {
    return <TlsConfigv2 value={props.value} editable={props.editable} onChange={props.onChange} />
}

export const TlsConfigv2: FC<{ value: tls_config, onChange: (x: tls_config) => void, showEnabled?: boolean, editable?: boolean }> =
    ({ value, onChange, showEnabled, editable = true }) => {
        return <>
            {(showEnabled === undefined || showEnabled) &&
                <SettingCheck label="TLS Enabled" checked={value.enable} disabled={!editable} onChange={() => { onChange({ ...value, enable: !value.enable }) }} />}
            <SettingCheck label="InsecureSkipVerify" checked={value.insecureSkipVerify} disabled={!editable} onChange={() => { onChange({ ...value, insecureSkipVerify: !value.insecureSkipVerify }) }} />
            <InputList className="mb-2" title="ServerNames" data={value.serverNames} disabled={!editable} onChange={(x) => { onChange({ ...value, serverNames: x }) }} />
            <InputList className="mb-2" title="NextProtos" data={value.nextProtos} disabled={!editable} onChange={(x) => { onChange({ ...value, nextProtos: x }) }} />
            <InputBytesList title="CaCert" data={value.caCert} disabled={!editable} onChange={(x) => { onChange({ ...value, caCert: x }) }} />
            <SettingInputBytes label="ECH Config List"
                value={value.echConfig}
                disabled={!editable}
                onChange={(x) => onChange({ ...value, echConfig: x })}
            />
        </>
    }