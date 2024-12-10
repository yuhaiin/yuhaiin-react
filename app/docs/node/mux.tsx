import { FC } from "react";
import { SettingInputText } from "../config/components";
import { mux } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Muxv2: FC<Props<mux>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Concurrency"
            value={value.concurrency}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, concurrency: Number(e) }) }}
        />
    </>
}