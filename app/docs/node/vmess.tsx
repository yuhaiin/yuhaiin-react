import { FC } from "react";
import { SettingInputText } from "../config/components";
import { vmess } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Vmessv2: FC<Props<vmess>> = ({ value, onChange }) => {


    return <>
        <SettingInputText
            label="AlterId"
            value={value.alterId}
            onChange={(e) => { onChange({ ...value, alterId: e }) }}
        />

        <SettingInputText
            label="Security"
            value={value.security}
            placeholder="chacha20-poly1305"
            onChange={(e) => { onChange({ ...value, security: e }) }}
        />

        <SettingInputText
            label="UUID"
            value={value.uuid}
            placeholder="9d5031b6-4ef5-11ee-be56-0242ac120002"
            onChange={(e) => { onChange({ ...value, uuid: e }) }}
        />
    </>
}