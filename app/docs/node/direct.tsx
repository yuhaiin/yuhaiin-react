import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { direct } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Directv2: FC<Props<direct>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label='Network Interface'
            value={value.networkInterface}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, networkInterface: e }) }}
        />
    </>
}