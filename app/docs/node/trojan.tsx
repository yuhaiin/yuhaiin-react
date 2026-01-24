import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { trojan } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Trojanv2: FC<Props<trojan>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Password"
            value={value.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />

        <SettingInputVertical
            label="Peer"
            value={value.peer}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, peer: e }) }}
        />
    </>
}
