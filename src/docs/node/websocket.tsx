import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { websocket } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Websocketv2: FC<Props<websocket>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Host"
            value={value.host}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, host: e }) }}
        />

        <SettingInputVertical
            label="Path"
            value={value.path}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, path: e }) }}
        />
    </>
}