import { FC, useContext } from "react";
import { Remind, SettingInputText } from "../../component/components";
import { InterfacesContext } from "../common/interfaces";
import { direct } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Directv2: FC<Props<direct>> = ({ value, onChange }) => {
    const interfaces = useContext(InterfacesContext);

    return <>
        <SettingInputText
            label='Network Interface'
            value={value.networkInterface}
            onChange={(e: string) => { onChange({ ...value, networkInterface: e }) }}
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