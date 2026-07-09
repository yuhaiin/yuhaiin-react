import { SettingCheck, SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { reality } from "../schema/node/protocol";
import { Props } from "./tools";

export const Realityv2: FC<Props<reality>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        debug: Boolean(value?.debug),
        publicKey: value?.publicKey ?? "",
        serverName: value?.serverName ?? "",
        shortId: value?.shortId ?? "",
    };
    return <>
        <SettingCheck
            label="Debug"
            checked={current.debug}
            disabled={!editable}
            onChange={() => { onChange({ ...current, debug: !current.debug }) }}
        />

        <SettingInputVertical
            label="PublicKey"
            value={current.publicKey}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, publicKey: e }) }}
        />

        <SettingInputVertical
            label="ServerName"
            value={current.serverName}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, serverName: e }) }}
        />

        <SettingInputVertical
            label="ShortId"
            value={current.shortId}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, shortId: e }) }}
        />
    </>
}
