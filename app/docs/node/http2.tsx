import { FC } from "react";
import { SettingInputText } from "../config/components";
import { http2 } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const HTTP2v2: FC<Props<http2>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Concurrency"
            value={value.concurrency}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, concurrency: Number(e) }) }}
        />
    </>
}