import { FC } from "react";
import { SettingInputText } from "../config/components";
import { obfs_http, shadowsocks } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Shadowsocksv2: FC<Props<shadowsocks>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Method"
            value={value.method}
            onChange={(e) => { onChange({ ...value, method: e }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e) => { onChange({ ...value, password: e }) }}
        />
    </>
}

export const ObfsHttpv2: FC<Props<obfs_http>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Host"
            value={value.host}
            onChange={(e) => { onChange({ ...value, host: e }) }}
        />

        <SettingInputText
            label="Port"
            value={value.port}
            onChange={(e) => { onChange({ ...value, port: e }) }}
        />
    </>
}