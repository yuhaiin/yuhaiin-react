import { FC } from "react";
import { SettingInputText } from "../config/components";
import { http } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const HTTPv2: FC<Props<http>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="User"
            value={value.user}
            onChange={(e) => { onChange({ ...value, user: e }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e) => { onChange({ ...value, password: e }) }}
        />
    </>
}