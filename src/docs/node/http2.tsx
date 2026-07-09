import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { http2 } from "../schema/node/protocol";
import { Props } from "./tools";

export const HTTP2v2: FC<Props<http2>> = ({ value, onChange, editable = true }) => {
    const current = { ...value, concurrency: typeof value?.concurrency === "number" ? value.concurrency : 0 };
    return <>
        <SettingInputVertical
            label="Concurrency"
            value={current.concurrency.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...current, concurrency: Number(e) }) }}
        />
    </>
}
