import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { vmess } from "../schema/node/protocol";
import { Props } from "./tools";

export const Vmessv2: FC<Props<vmess>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        alterId: value?.alterId ?? "",
        security: value?.security ?? "",
        uuid: value?.uuid ?? "",
    };
    return <>
        <SettingInputVertical
            label="AlterId"
            value={current.alterId}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, alterId: e }) }}
        />

        <SettingInputVertical
            label="Security"
            value={current.security}
            disabled={!editable}
            placeholder="chacha20-poly1305"
            onChange={(e: string) => { onChange({ ...current, security: e }) }}
        />

        <SettingInputVertical
            label="UUID"
            value={current.uuid}
            disabled={!editable}
            placeholder="9d5031b6-4ef5-11ee-be56-0242ac120002"
            onChange={(e: string) => { onChange({ ...current, uuid: e }) }}
        />
    </>
}
