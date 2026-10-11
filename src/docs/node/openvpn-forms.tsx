import { getNodeExtraInfo } from "@/api/nodes";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical } from "@/component/v2/forms";
import { Textarea } from "@/component/v2/input";
import type { NodeProtocolConfig, OpenVPNInfo } from "@/contract/node";
import { FC, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { BoolField } from "./fields";
import { RuntimeInfoList } from "./globalprotect-forms";

const defaultCiphers = ["AES-256-GCM", "AES-128-GCM", "CHACHA20-POLY1305"];

const VPNSelect: FC<{
    label: string; value: string; options: [string, string][];
    disabled: boolean; onChange: (value: string) => void;
}> = ({ label, value, options, disabled, onChange }) => {
    const id = useId();
    return <div className="min-w-0">
        <SettingLabel htmlFor={id} className="mb-2 block">{label}</SettingLabel>
        <select id={id} className="min-h-field w-full rounded-ui-md border border-ui-border bg-ui-surface px-3 py-2"
            value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
            {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
    </div>;
};

const PEMField: FC<{
    label: string; value?: string; placeholder: string;
    disabled: boolean; onChange: (value: string) => void;
}> = ({ label, value, placeholder, disabled, onChange }) => {
    const id = useId();
    return <div className="min-w-0">
        <SettingLabel htmlFor={id} className="mb-2 block">{label}</SettingLabel>
        <Textarea id={id} rows={4} spellCheck={false} autoComplete="off"
            value={value ?? ""} disabled={disabled} placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)} />
    </div>;
};

export const OpenVPNForm: FC<{
    config: NodeProtocolConfig<"openvpn">;
    editable: boolean;
    onChange: (patch: Partial<NodeProtocolConfig<"openvpn">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation("ui");
    const protection = config.tls_crypt_key !== undefined ? "tls-crypt"
        : config.tls_auth_key !== undefined ? "tls-auth" : "none";
    const ciphers = config.data_ciphers?.length ? config.data_ciphers : defaultCiphers;

    return <div className="grid min-w-0 gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={uiT("openVPNGateway")} value={config.gateway ?? ""}
                placeholder="vpn.example.com:1194" disabled={!editable}
                onChange={(gateway) => onChange({ gateway })} />
            <VPNSelect label={uiT("openVPNNetwork")} value={config.network ?? "udp"}
                options={[["udp", "UDP"], ["tcp", "TCP"]]} disabled={!editable}
                onChange={(network) => onChange({ network })} />
            <SettingInputVertical label={uiT("username")} value={config.username ?? ""}
                disabled={!editable} onChange={(username) => onChange({ username })} />
            <SettingInputVertical label={uiT("password")} type="password" value={config.password ?? ""}
                disabled={!editable} onChange={(password) => onChange({ password })} />
            <SettingInputVertical label={uiT("serverName")} value={config.server_name ?? ""}
                disabled={!editable} onChange={(server_name) => onChange({ server_name })} />
        </div>
        <p className="mb-0 text-sm text-ui-muted">{uiT("openVPNAuthHelp")}</p>
        <PEMField label={uiT("caCert")} value={config.ca_cert_pem}
            placeholder="-----BEGIN CERTIFICATE-----" disabled={!editable}
            onChange={(ca_cert_pem) => onChange({ ca_cert_pem })} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PEMField label={uiT("openVPNClientCert")} value={config.client_cert_pem}
                placeholder="-----BEGIN CERTIFICATE-----" disabled={!editable}
                onChange={(client_cert_pem) => onChange({ client_cert_pem })} />
            <PEMField label={uiT("openVPNClientKey")} value={config.client_key_pem}
                placeholder="-----BEGIN PRIVATE KEY-----" disabled={!editable}
                onChange={(client_key_pem) => onChange({ client_key_pem })} />
        </div>
        <p className="mb-0 text-sm text-ui-muted">{uiT("openVPNSecretHelp")}</p>
        <VPNSelect label={uiT("openVPNProtection")} value={protection}
            options={[["none", uiT("openVPNNoStaticKey")], ["tls-auth", "tls-auth"], ["tls-crypt", "tls-crypt"]]}
            disabled={!editable} onChange={(next) => onChange({
                tls_auth_key: next === "tls-auth" ? config.tls_auth_key ?? "" : undefined,
                tls_crypt_key: next === "tls-crypt" ? config.tls_crypt_key ?? "" : undefined,
            })} />
        {protection !== "none" && <PEMField label={uiT("openVPNStaticKey")}
            value={protection === "tls-auth" ? config.tls_auth_key : config.tls_crypt_key}
            placeholder="-----BEGIN OpenVPN Static key V1-----" disabled={!editable}
            onChange={(value) => onChange(protection === "tls-auth" ? { tls_auth_key: value } : { tls_crypt_key: value })} />}
        {protection === "tls-auth" && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <VPNSelect label={uiT("openVPNKeyDirection")} value={String(config.key_direction ?? -1)}
                options={[["-1", uiT("openVPNBidirectional")], ["0", "0"], ["1", "1"]]}
                disabled={!editable} onChange={(value) => onChange({ key_direction: value === "-1" ? undefined : Number(value) })} />
            <VPNSelect label={uiT("openVPNAuthDigest")} value={config.auth ?? "SHA1"}
                options={[["SHA1", "SHA1"], ["SHA256", "SHA256"], ["SHA512", "SHA512"]]}
                disabled={!editable} onChange={(auth) => onChange({ auth })} />
        </div>}
        <p className="mb-0 text-sm text-ui-muted">{uiT("openVPNProtectionHelp")}</p>
        <fieldset className="grid gap-2 rounded-ui-md border border-ui-border p-3" disabled={!editable}>
            <legend className="px-1 text-sm font-semibold">{uiT("openVPNDataCiphers")}</legend>
            {defaultCiphers.map((cipher) => <label key={cipher} className="flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" checked={ciphers.includes(cipher)}
                    disabled={!editable || ciphers.length === 1 && ciphers.includes(cipher)}
                    onChange={(event) => onChange({ data_ciphers: event.target.checked
                        ? [...ciphers, cipher] : ciphers.filter((item) => item !== cipher) })} />
                {cipher}
            </label>)}
            <p className="mb-0 text-sm text-ui-muted">{uiT("openVPNCipherHelp")}</p>
        </fieldset>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={uiT("mtuOverride")} type="number" min={0} max={1500} step={1}
                value={config.mtu ?? 0} disabled={!editable}
                onChange={(value) => onChange({ mtu: Number(value) || 0 })} />
            <SettingInputVertical label={uiT("openVPNRenegotiate")} type="number" min={0} max={2147483647} step={1}
                value={config.renegotiate_seconds ?? 3600} disabled={!editable}
                onChange={(value) => onChange({ renegotiate_seconds: Number(value) || 0 })} />
        </div>
        <p className="mb-0 text-sm text-ui-muted">{uiT("openVPNMTUHelp")}</p>
        <BoolField label={uiT("openVPNAutoReconnect")} description={uiT("openVPNReconnectHelp")}
            value={config.auto_reconnect} disabled={!editable}
            onChange={(auto_reconnect) => onChange({ auto_reconnect })} />
        <BoolField label={uiT("insecureSkipVerify")} description={uiT("openVPNTLSHelp")}
            value={config.insecure_skip_verify} disabled={!editable}
            onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
    </div>;
};

export const OpenVPNRuntimeInfo: FC<{ nodeId: string }> = ({ nodeId }) => {
    const { t: uiT } = useTranslation("ui");
    const [info, setInfo] = useState<OpenVPNInfo>();
    const [loading, setLoading] = useState(false);
    const [unavailable, setUnavailable] = useState(false);
    const load = async () => {
        setLoading(true);
        setUnavailable(false);
        try {
            const extra = await getNodeExtraInfo(nodeId);
            setInfo(extra.openvpn);
            setUnavailable(!extra.openvpn);
        } catch {
            setInfo(undefined);
            setUnavailable(true);
        } finally {
            setLoading(false);
        }
    };
    return <section className="mt-4 rounded-ui-lg border border-ui-border bg-ui-surface p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="mb-0 text-base font-semibold">{uiT("openVPNConnectionInfo")}</h3>
            <Button variant="outline-primary" size="sm" disabled={!nodeId || loading}
                aria-label={uiT("openVPNFetchInfo")} onClick={() => void load()}>
                {loading ? uiT("globalProtectLoadingInfo") : uiT("openVPNFetchInfo")}
            </Button>
        </div>
        <p className="mb-0 mt-2 text-sm text-ui-muted">{uiT("openVPNInfoHelp")}</p>
        {unavailable && <p role="status" className="mb-0 mt-3 text-sm text-ui-danger">{uiT("openVPNInfoUnavailable")}</p>}
        {info && <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <RuntimeInfoList label={uiT("openVPNTunnelPrefixes")} values={info.tunnel_prefixes} />
            <RuntimeInfoList label={uiT("openVPNDataCiphers")} value={info.cipher} />
            <RuntimeInfoList label={uiT("globalProtectDNSServers")} values={info.dns} />
            <RuntimeInfoList label={uiT("openVPNRoutes")} values={info.routes} />
            <RuntimeInfoList label={uiT("openVPNRouteGateway")} value={info.gateway} />
            <RuntimeInfoList label="MTU" value={info.mtu === undefined ? undefined : String(info.mtu)} />
        </div>}
    </section>;
};
