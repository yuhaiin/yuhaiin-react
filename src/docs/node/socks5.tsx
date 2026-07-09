import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { socks5 } from "../schema/node/protocol";
import { Props } from "./tools";

export const Socks5v2: FC<Props<socks5>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        hostname: value?.hostname ?? "",
        user: value?.user ?? "",
        password: value?.password ?? "",
        overridePort: typeof value?.overridePort === "number" ? value.overridePort : 0,
    };
    return <>
        <SettingInputVertical
            label="Hostname"
            value={current.hostname}
            disabled={!editable}
            placeholder="127.0.0.1"
            onChange={(e: string) => { onChange({ ...current, hostname: e }) }}
        />

        <SettingInputVertical
            label="User"
            value={current.user}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, user: e }) }}
        />

        <SettingInputVertical
            label="Password"
            value={current.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, password: e }) }}
        />

        <SettingInputVertical label="Override Port" value={current.overridePort.toString()} disabled={!editable} onChange={(e: string) => {
            const port = Number(e)
            if (isNaN(port) || port > 65535 || port < 0) return
            onChange({ ...current, overridePort: port })
        }} />
    </>
}
