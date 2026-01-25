import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { tailscale } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Tailscale: FC<Props<tailscale>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Auth Key"
            value={value.authKey}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, authKey: e }) }}
        />

        <SettingInputVertical
            label="Hostname"
            value={value.hostname}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, hostname: e }) }}
        />

        <SettingInputVertical
            label="Control URL"
            value={value.controlUrl}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, controlUrl: e }) }}
        />
    </>
}