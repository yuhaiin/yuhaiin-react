import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { vless } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Vlessv2: FC<Props<vless>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="UUID"
            value={value.uuid}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, uuid: e }) }}
        />
    </>
}