import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { http, http_termination } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const HTTPv2: FC<Props<http>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="User"
            value={value.user}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, user: e }) }}
        />

        <SettingInputVertical
            label="Password"
            value={value.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}

export const UnWrapHttp: FC<Props<http_termination>> = ({ /*value, onChange*/ }) => {
    return <>
    </>
}