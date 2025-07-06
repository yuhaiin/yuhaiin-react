import { FC } from "react";
import { SettingInputText } from "../config/components";
import { socks5 } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Socks5v2: FC<Props<socks5>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Hostname"
            value={value.hostname}
            placeholder="127.0.0.1"
            onChange={(e: string) => { onChange({ ...value, hostname: e }) }}
        />

        <SettingInputText
            label="User"
            value={value.user}
            onChange={(e: string) => { onChange({ ...value, user: e }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />

        <SettingInputText label="Override Port" value={value.overridePort} onChange={(e: string) => {
            const port = Number(e)
            if (isNaN(port) || port > 65535 || port < 0) return
            onChange({ ...value, overridePort: port })
        }} />
    </>
}