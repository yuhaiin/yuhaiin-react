import { SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { tailscale } from "../schema/node/protocol";
import { Props } from "./tools";

export const Tailscale: FC<Props<tailscale>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        authKey: value?.authKey ?? "",
        hostname: value?.hostname ?? "",
        controlUrl: value?.controlUrl ?? "",
    };
    return <>
        <SettingInputVertical
            label="Auth Key"
            value={current.authKey}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, authKey: e }) }}
        />

        <SettingInputVertical
            label="Hostname"
            value={current.hostname}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, hostname: e }) }}
        />

        <SettingInputVertical
            label="Control URL"
            value={current.controlUrl}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, controlUrl: e }) }}
        />
    </>
}
