import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { obfs_http, shadowsocks } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Shadowsocksv2: FC<Props<shadowsocks>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Method"
            value={value.method}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, method: e }) }}
        />

        <SettingInputVertical
            label="Password"
            value={value.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}

export const ObfsHttpv2: FC<Props<obfs_http>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Host"
            value={value.host}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, host: e }) }}
        />

        <SettingInputVertical
            label="Port"
            value={value.port}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, port: e }) }}
        />
    </>
}