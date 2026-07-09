import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { mux } from "../schema/node/protocol";
import { Props } from "./tools";

export const Muxv2: FC<Props<mux>> = ({ value, onChange, editable = true }) => {
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
