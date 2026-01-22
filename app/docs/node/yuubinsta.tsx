import { FC } from "react";
import { SettingInputText } from "../../component/components";
import { SettingCheck } from "../../component/switch";
import { yuubinsya } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Yuubinsyav2: FC<Props<yuubinsya>> = ({ value, onChange }) => {
    return <>
        <SettingCheck
            label="UdpOverStream"
            checked={value.udpOverStream}
            onChange={() => { onChange({ ...value, udpOverStream: !value.udpOverStream }) }}
        />

        <SettingCheck
            label="UdpCoalesce"
            checked={value.udpCoalesce}
            onChange={() => { onChange({ ...value, udpCoalesce: !value.udpCoalesce }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}