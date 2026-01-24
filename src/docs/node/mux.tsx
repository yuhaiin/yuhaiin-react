import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { mux } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Muxv2: FC<Props<mux>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Concurrency"
            value={value.concurrency.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, concurrency: Number(e) }) }}
        />
    </>
}