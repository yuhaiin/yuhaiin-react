import { SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { shadowsocksr } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Shadowsocksrv2: FC<Props<shadowsocksr>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Server"
            value={value.server}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, server: e }) }}
        />

        <SettingInputVertical
            label="Port"
            value={value.port}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, port: e }) }}
        />

        <SettingInputVertical
            label="Method"
            value={value.method}
            disabled={!editable}
            placeholder="chacha20-ietf"
            onChange={(e: string) => { onChange({ ...value, method: e }) }}
        />

        <SettingInputVertical
            label="Protocol"
            value={value.protocol}
            disabled={!editable}
            placeholder="auth_aes128_sha1"
            onChange={(e: string) => { onChange({ ...value, protocol: e }) }}
        />

        <SettingInputVertical
            label="ProtocolParam"
            value={value.protoparam}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, protoparam: e }) }}
        />

        <SettingInputVertical
            label="Obfs"
            value={value.obfs}
            disabled={!editable}
            placeholder="http_post"
            onChange={(e: string) => { onChange({ ...value, obfs: e }) }}
        />

        <SettingInputVertical
            label="ObfsParam"
            value={value.obfsparam}
            disabled={!editable}
            placeholder="#name=v"
            onChange={(e: string) => { onChange({ ...value, obfsparam: e }) }}
        />
    </>
}