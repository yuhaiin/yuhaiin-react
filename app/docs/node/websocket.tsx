import { FC } from "react";
import { SettingInputText } from "../../component/components";
import { websocket } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Websocketv2: FC<Props<websocket>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Host"
            value={value.host}
            onChange={(e: string) => { onChange({ ...value, host: e }) }}
        />

        <SettingInputText
            label="Path"
            value={value.path}
            onChange={(e: string) => { onChange({ ...value, path: e }) }}
        />
    </>
}