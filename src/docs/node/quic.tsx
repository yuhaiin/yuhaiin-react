import { SettingInputVertical } from "@/component/v2/forms"
import { create } from "@bufbuild/protobuf"
import { FC } from "react"
import { quic, tls_configSchema } from "../pbes/node/protocol_pb"
import { TlsConfigv2 } from "./tls"
import { Props } from "./tools"

export const Quicv2: FC<Props<quic>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical label="Host" value={value.host} disabled={!editable} onChange={(e: string) => { onChange({ ...value, host: e }) }} />
        <TlsConfigv2 showEnabled={false} value={value.tls ?? create(tls_configSchema, {})} editable={editable} onChange={(x) => { onChange({ ...value, tls: x }) }} />
    </>
}