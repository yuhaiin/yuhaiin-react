import { FC } from "react";
import { SettingInputText } from "../config/components";
import { websocket } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Websocketv2: FC<Props<websocket>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Host"
            value={value.host}
            onChange={(e) => { onChange({ ...value, host: e }) }}
        />

        <SettingInputText
            label="Path"
            value={value.path}
            onChange={(e) => { onChange({ ...value, path: e }) }}
        />
    </>
}