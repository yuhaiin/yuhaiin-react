import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { vmess } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Vmessv2: FC<Props<vmess>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="AlterId"
            value={value.alterId}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, alterId: e }) }}
        />

        <SettingInputVertical
            label="Security"
            value={value.security}
            disabled={!editable}
            placeholder="chacha20-poly1305"
            onChange={(e: string) => { onChange({ ...value, security: e }) }}
        />

        <SettingInputVertical
            label="UUID"
            value={value.uuid}
            disabled={!editable}
            placeholder="9d5031b6-4ef5-11ee-be56-0242ac120002"
            onChange={(e: string) => { onChange({ ...value, uuid: e }) }}
        />
    </>
}