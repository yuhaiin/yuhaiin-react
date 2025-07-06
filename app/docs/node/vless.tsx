import { FC } from "react";
import { SettingInputText } from "../config/components";
import { vless } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";


export const Vlessv2: FC<Props<vless>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="UUID"
            value={value.uuid}
            onChange={(e: string) => { onChange({ ...value, uuid: e }) }}
        />
    </>
}