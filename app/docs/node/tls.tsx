import { FC } from "react"
import { SettingCheck } from "../common/switch"
import { NewBytesItemList, NewItemList, SettingInputText } from "../config/components"
import { tls_config } from "../pbes/node/protocol_pb"
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
            <NewItemList className="mb-2" title="ServerNames" data={value.serverNames} onChange={(x) => { onChange({ ...value, serverNames: x }) }} />
            <NewItemList className="mb-2" title="NextProtos" data={value.nextProtos} onChange={(x) => { onChange({ ...value, nextProtos: x }) }} />
            <NewBytesItemList title="CaCert" textarea data={value.caCert} onChange={(x) => { onChange({ ...value, caCert: x }) }} />
            <SettingInputText label="ECH Config List"
                value={value.echConfig ? btoa(String.fromCharCode(...value.echConfig)) : ""}
                onChange={(x: string) => {
                    try {
                        onChange({ ...value, echConfig: Uint8Array.from(Array.prototype.map.call(atob(x), (c: string) => c.charCodeAt(0))) })
                    } catch (e) {
                        ignore(e)
                    }
                }
                }
            />
        </>
    }


const ignore = (e: any) => { }// eslint-disable-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any