import { FC } from "react"
import { SettingTypeSelect } from "../common/switch"
import { SettingInputText } from "../config/components"
import { reverse_tcp, tcp_udp_controlSchema, tcpudp } from "../pbes/config/listener/listener_pb"

export const ReverseTCP: FC<{ reverse_tcp: reverse_tcp, onChange: (x: reverse_tcp) => void }> = ({ reverse_tcp, onChange }) => {
    return (
        <>
            <SettingInputText label='Host' value={reverse_tcp.host} onChange={(e: string) => onChange({ ...reverse_tcp, host: e })} />
        </>
    )
}

export const TcpUdp: FC<{ protocol: tcpudp, onChange: (x: tcpudp) => void }> = ({ protocol, onChange }) => {
    return <>
        <SettingInputText
            label="Host"
            value={protocol.host}
            onChange={(e: string) => { onChange({ ...protocol, host: e }) }}
        />

        <SettingTypeSelect
            label="Control"
            type={tcp_udp_controlSchema}
            value={protocol.control}
            onChange={(e) => { onChange({ ...protocol, control: e }) }}
        />
    </>
}
