import { FC } from "react";
import { SettingInputText } from "../config/components";
import { aead } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Aead: FC<Props<aead>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}