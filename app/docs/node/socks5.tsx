import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { socks5 } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Socks5v2: FC<Props<socks5>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Hostname"
            value={value.hostname}
            disabled={!editable}
            placeholder="127.0.0.1"
            onChange={(e: string) => { onChange({ ...value, hostname: e }) }}
        />

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

        <SettingInputVertical label="Override Port" value={value.overridePort.toString()} disabled={!editable} onChange={(e: string) => {
            const port = Number(e)
            if (isNaN(port) || port > 65535 || port < 0) return
            onChange({ ...value, overridePort: port })
        }} />
    </>
}