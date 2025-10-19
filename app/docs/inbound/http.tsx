import { create } from "@bufbuild/protobuf"
import { FC } from "react"
import { SettingInputText } from "../config/components"
import { TlsConfigv2 } from "../node/tls"
import { http, reverse_http } from "../pbes/config/inbound_pb"
import { tls_configSchema } from "../pbes/node/protocol_pb"

export const HTTP: FC<{ http: http, onChange: (x: http) => void }> = ({ http, onChange }) => {
    return (
        <>
            <SettingInputText label='Username' value={http.username} onChange={(e: string) => onChange({ ...http, username: e })} />
            <SettingInputText label='Password' value={http.password} onChange={(e: string) => onChange({ ...http, password: e })} />
        </>
    )
}

export const ReverseHTTP: FC<{ reverse_http: reverse_http, onChange: (x: reverse_http) => void }> = ({ reverse_http, onChange }) => {
    return (
        <>
            <SettingInputText label='Url' value={reverse_http.url} onChange={(e: string) => onChange({ ...reverse_http, url: e })} />
            <TlsConfigv2 value={reverse_http.tls ?? create(tls_configSchema, {})} onChange={(x) => { onChange({ ...reverse_http, tls: x }) }} />
        </>
    )
}