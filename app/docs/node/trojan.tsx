import { FC } from "react";
import { SettingInputText } from "../config/components";
import { trojan } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Trojanv2: FC<Props<trojan>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />

        <SettingInputText
            label="Peer"
            value={value.peer}
            onChange={(e: string) => { onChange({ ...value, peer: e }) }}
        />
    </>
}
