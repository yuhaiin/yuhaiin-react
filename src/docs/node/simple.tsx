import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { fixed } from "../schema/node/protocol";
import { NewAlternateHostList, Props } from "./tools";

export const Fixed: FC<Props<fixed>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        host: value?.host ?? "",
        networkInterface: value?.networkInterface ?? "",
        port: typeof value?.port === "number" ? value.port : 0,
        alternateHost: Array.isArray(value?.alternateHost) ? value.alternateHost : [],
    };
    const changeInterface = (e: string) => {
        onChange({ ...current, networkInterface: e })
    }

    return <>
        <SettingInputVertical
            label="Host"
            value={current.host}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, host: e }) }
            }
        />

        <SettingInputVertical
            label='Network Interface'
            value={current.networkInterface}
            disabled={!editable}
            onChange={changeInterface}
        />

        <SettingInputVertical label="Port" value={current.port.toString()} disabled={!editable} onChange={(e) => {
            const port = Number(e)
            if (isNaN(port) || port > 65535 || port < 0) return
            onChange({ ...current, port: port })
        }} />

        <NewAlternateHostList
            title="AlternateHost"
            data={current.alternateHost}
            editable={editable}
            onChange={(e) => { onChange({ ...current, alternateHost: e }) }}
        />
    </>
}
