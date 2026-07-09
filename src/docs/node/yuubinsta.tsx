import { SettingCheck, SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { yuubinsya } from "../schema/node/protocol";
import { Props } from "./tools";

export const Yuubinsyav2: FC<Props<yuubinsya>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        udpOverStream: Boolean(value?.udpOverStream),
        udpCoalesce: Boolean(value?.udpCoalesce),
        password: value?.password ?? "",
    };
    return <>
        <SettingCheck
            label="UdpOverStream"
            checked={current.udpOverStream}
            disabled={!editable}
            onChange={() => { onChange({ ...current, udpOverStream: !current.udpOverStream }) }}
        />

        <SettingCheck
            label="UdpCoalesce"
            checked={current.udpCoalesce}
            disabled={!editable}
            onChange={() => { onChange({ ...current, udpCoalesce: !current.udpCoalesce }) }}
        />

        <SettingInputVertical
            label="Password"
            value={current.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, password: e }) }}
        />
    </>
}
