import { FC, useContext } from "react";
import { InterfacesContext } from "../common/interfaces";
import { Remind, SettingInputText } from "../config/components";
import { direct } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Directv2: FC<Props<direct>> = ({ value, onChange }) => {
    const interfaces = useContext(InterfacesContext);

    return <>
        <SettingInputText
            label='Network Interface'
            value={value.networkInterface}
            onChange={(e) => { onChange({ ...value, networkInterface: e }) }}
            reminds={interfaces.map((v) => {
                if (!v.name) return undefined
                const r: Remind = {
                    label: v.name,
                    value: v.name,
                    label_children: v.addresses?.map((vv) => !vv ? "" : vv)
                }
                return r
            })
                .filter((e): e is Exclude<Remind, null | undefined> => !!e)
            }
        />
    </>
}