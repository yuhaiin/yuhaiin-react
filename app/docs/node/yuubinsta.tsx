import { SettingCheck, SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { yuubinsya } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Yuubinsyav2: FC<Props<yuubinsya>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingCheck
            label="UdpOverStream"
            checked={value.udpOverStream}
            disabled={!editable}
            onChange={() => { onChange({ ...value, udpOverStream: !value.udpOverStream }) }}
        />

        <SettingCheck
            label="UdpCoalesce"
            checked={value.udpCoalesce}
            disabled={!editable}
            onChange={() => { onChange({ ...value, udpCoalesce: !value.udpCoalesce }) }}
        />

        <SettingInputVertical
            label="Password"
            value={value.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}