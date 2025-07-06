import { FC } from "react";
import { SettingCheck } from "../common/switch";
import { SettingInputText } from "../config/components";
import { reality } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Realityv2: FC<Props<reality>> = ({ value, onChange }) => {
    return <>
        <SettingCheck
            label="Debug"
            checked={value.debug}
            onChange={() => { onChange({ ...value, debug: !value.debug }) }}
        />

        <SettingInputText
            label="PublicKey"
            value={value.publicKey}
            onChange={(e: string) => { onChange({ ...value, publicKey: e }) }}
        />

        <SettingInputText
            label="ServerName"
            value={value.serverName}
            onChange={(e: string) => { onChange({ ...value, serverName: e }) }}
        />

        <SettingInputText
            label="ShortId"
            value={value.shortId}
            onChange={(e: string) => { onChange({ ...value, shortId: e }) }}
        />
    </>
}