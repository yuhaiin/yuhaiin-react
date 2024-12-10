import { FC } from "react"
import { SettingCheck } from "../common/switch"
import { NewBytesItemList, NewItemList } from "../config/components"
import { tls_config } from "../pbes/node/protocol/protocol_pb"
import { Props } from "./tools"

export const Tlsv2 = (props: Props<tls_config>) => {
    return <TlsConfigv2 value={props.value} onChange={props.onChange} />
}

export const TlsConfigv2: FC<{ value: tls_config, onChange: (x: tls_config) => void, showEnabled?: boolean }> =
    ({ value, onChange, showEnabled }) => {
        return <>
            {(showEnabled === undefined || showEnabled) &&
                <SettingCheck label="TLS Enabled" checked={value.enable} onChange={() => { onChange({ ...value, enable: !value.enable }) }} />}
            <SettingCheck label="InsecureSkipVerify" checked={value.insecureSkipVerify} onChange={() => { onChange({ ...value, insecureSkipVerify: !value.insecureSkipVerify }) }} />
            <NewItemList title="ServerNames" data={value.serverNames} onChange={(x) => { onChange({ ...value, serverNames: x }) }} />
            <NewItemList title="NextProtos" data={value.nextProtos} onChange={(x) => { onChange({ ...value, nextProtos: x }) }} />
            <NewBytesItemList title="CaCert" textarea data={value.caCert} onChange={(x) => { onChange({ ...value, caCert: x }) }} />
        </>
    }