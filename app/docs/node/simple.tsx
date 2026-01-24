import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { fixed } from "../pbes/node/protocol_pb";
import { NewAlternateHostList, Props } from "./tools";

export const Fixed: FC<Props<fixed>> = ({ value, onChange, editable = true }) => {
    const changeInterface = (e: string) => {
        onChange({ ...value, networkInterface: e })
    }

    return <>
        <SettingInputVertical
            label="Host"
            value={value.host}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, host: e }) }
            }
        />

        <SettingInputVertical
            label='Network Interface'
            value={value.networkInterface}
            disabled={!editable}
            onChange={changeInterface}
        />

        <SettingInputVertical label="Port" value={value.port.toString()} disabled={!editable} onChange={(e) => {
            const port = Number(e)
            if (isNaN(port) || port > 65535 || port < 0) return
            onChange({ ...value, port: port })
        }} />

        <NewAlternateHostList
            title="AlternateHost"
            data={value.alternateHost}
            editable={editable}
            onChange={(e) => { onChange({ ...value, alternateHost: e }) }}
        />
    </>
}