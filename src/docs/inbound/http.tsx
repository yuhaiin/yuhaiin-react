import { SettingInputVertical } from "@/component/v2/forms"
import { create } from "@/common/plain"
import { FC } from "react"
import { TlsConfigv2 } from "../node/tls"
import { http, reverse_http } from "../schema/config/inbound"
import { tls_configSchema } from "../schema/node/protocol"

export const HTTP: FC<{ http: http, onChange: (x: http) => void }> = ({ http, onChange }) => {
    return (
        <>
            <SettingInputVertical label='Username' value={http.username} onChange={(e: string) => onChange({ ...http, username: e })} />
            <SettingInputVertical label='Password' value={http.password} onChange={(e: string) => onChange({ ...http, password: e })} />
        </>
    )
}

export const ReverseHTTP: FC<{ reverse_http: reverse_http, onChange: (x: reverse_http) => void }> = ({ reverse_http, onChange }) => {
    return (
        <>
            <SettingInputVertical label='Url' value={reverse_http.url} onChange={(e: string) => onChange({ ...reverse_http, url: e })} />
            <TlsConfigv2 value={reverse_http.tls ?? create(tls_configSchema, {})} onChange={(x) => { onChange({ ...reverse_http, tls: x }) }} />
        </>
    )
}