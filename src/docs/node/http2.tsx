import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { http2 } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const HTTP2v2: FC<Props<http2>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Concurrency"
            value={value.concurrency.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, concurrency: Number(e) }) }}
        />
    </>
}