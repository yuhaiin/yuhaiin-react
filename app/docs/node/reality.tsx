import { SettingCheck, SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { reality } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Realityv2: FC<Props<reality>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingCheck
            label="Debug"
            checked={value.debug}
            disabled={!editable}
            onChange={() => { onChange({ ...value, debug: !value.debug }) }}
        />

        <SettingInputVertical
            label="PublicKey"
            value={value.publicKey}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, publicKey: e }) }}
        />

        <SettingInputVertical
            label="ServerName"
            value={value.serverName}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, serverName: e }) }}
        />

        <SettingInputVertical
            label="ShortId"
            value={value.shortId}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, shortId: e }) }}
        />
    </>
}