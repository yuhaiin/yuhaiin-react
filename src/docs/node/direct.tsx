import { InterfacesContext } from "@/common/interfaces";
import { Remind, SettingInputVertical } from "@/component/v2/forms";
import { FC, useContext } from "react";
import { direct } from "../schema/node/protocol";
import { Props } from "./tools";

export const Directv2: FC<Props<direct>> = ({ value, onChange, editable = true }) => {
    const interfaces = useContext(InterfacesContext);
    const current = { ...value, networkInterface: value?.networkInterface ?? "" };

    const reminds = interfaces.map((v) => {
        if (!v.name) return undefined
        const r: Remind = {
            label: v.name,
            value: v.name,
            label_children: v.addresses?.map((vv) => !vv ? "" : vv)
        }
        return r
    })
        .filter((e): e is Exclude<Remind, null | undefined> => !!e)

    return <>
        <SettingInputVertical
            label='Network Interface'
            value={current.networkInterface}
            reminds={reminds}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, networkInterface: e }) }}
        />
    </>
}
