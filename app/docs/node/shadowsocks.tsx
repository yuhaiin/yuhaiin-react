import { FC } from "react";
import { SettingInputText } from "../config/components";
import { obfs_http, shadowsocks } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Shadowsocksv2: FC<Props<shadowsocks>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Method"
            value={value.method}
            onChange={(e: string) => { onChange({ ...value, method: e }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}

export const ObfsHttpv2: FC<Props<obfs_http>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Host"
            value={value.host}
            onChange={(e: string) => { onChange({ ...value, host: e }) }}
        />

        <SettingInputText
            label="Port"
            value={value.port}
            onChange={(e: string) => { onChange({ ...value, port: e }) }}
        />
    </>
}