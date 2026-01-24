import { SettingCheck, SettingEnumSelectVertical, SettingInputVertical } from "@/component/v2/forms"
import { FC } from "react"
import { reverse_tcp, tcp_udp_controlSchema, tcpudp } from "../pbes/config/inbound_pb"

export const ReverseTCP: FC<{ reverse_tcp: reverse_tcp, onChange: (x: reverse_tcp) => void }> = ({ reverse_tcp, onChange }) => {
    return (
        <SettingInputVertical
            label='Host'
            value={reverse_tcp.host}
            onChange={(e: string) => onChange({ ...reverse_tcp, host: e })}
        />
    )
}

export const TcpUdp: FC<{ protocol: tcpudp, onChange: (x: tcpudp) => void }> = ({ protocol, onChange }) => {
    return <>
        <SettingInputVertical
            className="mb-2"
            label="Host"
            value={protocol.host}
            onChange={(e) => { onChange({ ...protocol, host: e }) }}
        />

        <SettingEnumSelectVertical
            className="mb-3"
            label="Control"
            type={tcp_udp_controlSchema}
            value={protocol.control}
            onChange={(e) => { onChange({ ...protocol, control: e }) }}
        />
        <SettingCheck label="UDP HappyEyeballs" checked={protocol.udpHappyEyeballs} onChange={() => { onChange({ ...protocol, udpHappyEyeballs: !protocol.udpHappyEyeballs }) }} />
    </>
}
