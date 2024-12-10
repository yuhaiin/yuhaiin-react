import { FC } from "react";
import { SettingCheck } from "../common/switch";
import { SettingInputText } from "../config/components";
import { yuubinsya } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Yuubinsyav2: FC<Props<yuubinsya>> = ({ value, onChange }) => {
    return <>
        <SettingCheck
            label="TCP Encrypt"
            checked={value.tcpEncrypt}
            onChange={() => { onChange({ ...value, tcpEncrypt: !value.tcpEncrypt }) }}
        />
        <SettingCheck
            label="UDP Encrypt"
            checked={value.udpEncrypt}
            onChange={() => { onChange({ ...value, udpEncrypt: !value.udpEncrypt }) }}
        />

        <SettingCheck
            label="UdpOverStream"
            checked={value.udpOverStream}
            onChange={() => { onChange({ ...value, udpOverStream: !value.udpOverStream }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e) => { onChange({ ...value, password: e }) }}
        />
    </>
}