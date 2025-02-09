"use client"

import { FC } from "react";
import { SettingInputText } from "../config/components";
import { tailscale } from "../pbes/node/protocol/protocol_pb";
import { Props } from "./tools";

export const Tailscale: FC<Props<tailscale>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Auth Key"
            value={value.authKey}
            onChange={(e) => { onChange({ ...value, authKey: e }) }}
        />

        <SettingInputText
            label="Hostname"
            value={value.hostname}
            onChange={(e) => { onChange({ ...value, hostname: e }) }}
        />

        <SettingInputText
            label="Control URL"
            value={value.controlUrl}
            onChange={(e) => { onChange({ ...value, controlUrl: e }) }}
        />
    </>
}