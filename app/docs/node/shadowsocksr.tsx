import { FC } from "react";
import { SettingInputText } from "../../component/components";
import { shadowsocksr } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Shadowsocksrv2: FC<Props<shadowsocksr>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Server"
            value={value.server}
            onChange={(e: string) => { onChange({ ...value, server: e }) }}
        />

        <SettingInputText
            label="Port"
            value={value.port}
            onChange={(e: string) => { onChange({ ...value, port: e }) }}
        />

        <SettingInputText
            label="Method"
            value={value.method}
            placeholder="chacha20-ietf"
            onChange={(e: string) => { onChange({ ...value, method: e }) }}
        />

        <SettingInputText
            label="Protocol"
            value={value.protocol}
            placeholder="auth_aes128_sha1"
            onChange={(e: string) => { onChange({ ...value, protocol: e }) }}
        />

        <SettingInputText
            label="ProtocolParam"
            value={value.protoparam}
            onChange={(e: string) => { onChange({ ...value, protoparam: e }) }}
        />

        <SettingInputText
            label="Obfs"
            value={value.obfs}
            placeholder="http_post"
            onChange={(e: string) => { onChange({ ...value, obfs: e }) }}
        />

        <SettingInputText
            label="ObfsParam"
            value={value.obfsparam}
            placeholder="#name=v"
            onChange={(e: string) => { onChange({ ...value, obfsparam: e }) }}
        />
    </>
}