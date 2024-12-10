import { FC, useContext } from "react";
import { InterfacesContext } from "../common/interfaces";
import { Remind, SettingInputText } from "../config/components";
import { simple } from "../pbes/node/protocol/protocol_pb";
import { NewAlternateHostList, Props } from "./tools";

export const Simplev2: FC<Props<simple>> = ({ value, onChange }) => {
    const interfaces = useContext(InterfacesContext);

    return <>
        <SettingInputText
            label="Host"
            value={value.host}
            onChange={(e) => { onChange({ ...value, host: e }) }
            }
        />

        <SettingInputText
            label='Network Interface'
            value={value.networkInterface}
            onChange={(e) => { onChange({ ...value, networkInterface: e }) }}
            reminds={interfaces.map((v) => {
                if (!v.name) return undefined
                var r: Remind = {
                    label: v.name,
                    value: v.name,
                    label_children: v.addresses?.map((vv) => !vv ? "" : vv)
                }
                return r
            })
                .filter((e): e is Exclude<Remind, null | undefined> => !!e)
            }
        />

        <SettingInputText label="Port" value={value.port} onChange={(e) => {
            let port = Number(e)
            if (isNaN(port) || port > 65535 || port < 0) return
            onChange({ ...value, port: port })
        }} />

        <NewAlternateHostList
            title="AlternateHost"
            data={value.alternateHost}
            onChange={(e) => { onChange({ ...value, alternateHost: e }) }}
        />
    </>
}