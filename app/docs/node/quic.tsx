import { create } from "@bufbuild/protobuf"
import { FC } from "react"
import { SettingInputText } from "../config/components"
import { quic, tls_configSchema } from "../pbes/node/protocol/protocol_pb"
import { TlsConfigv2 } from "./tls"
import { Props } from "./tools"

export const Quicv2: FC<Props<quic>> = ({ value, onChange }) => {
    return <>
        <SettingInputText className="" label="Host" value={value.host} onChange={(e: string) => { onChange({ ...value, host: e }) }} />
        <TlsConfigv2 showEnabled={false} value={value.tls ?? create(tls_configSchema, {})} onChange={(x) => { onChange({ ...value, tls: x }) }} />
    </>
}