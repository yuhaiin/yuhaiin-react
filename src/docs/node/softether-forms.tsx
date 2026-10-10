import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical } from "@/component/v2/forms";
import { Textarea } from "@/component/v2/input";
import type { NodeProtocolConfig } from "@/contract/node";
import { FC, useId } from "react";
import { useTranslation } from "react-i18next";
import { BoolField, NumberField } from "./fields";

/** Native SoftEther SSL-VPN is an Ethernet protocol, not SSTP. */
export const SoftEtherForm: FC<{
    config: NodeProtocolConfig<"softether">;
    editable: boolean;
    onChange: (patch: Partial<NodeProtocolConfig<"softether">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t } = useTranslation("ui");
    const certificateAuth = config.auth_type === "certificate";
    const authTypeId = useId();

    return (
        <div className="grid gap-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingInputVertical label={t("softEtherGateway")} value={config.gateway ?? ""}
                    disabled={!editable} placeholder="vpn.example.com:443"
                    onChange={(gateway) => onChange({ gateway })} />
                <SettingInputVertical label={t("softEtherHub")} value={config.hub ?? ""}
                    disabled={!editable} placeholder="DEFAULT"
                    onChange={(hub) => onChange({ hub })} />
                <SettingInputVertical label={t("username")} value={config.username ?? ""}
                    disabled={!editable} onChange={(username) => onChange({ username })} />
                <div>
                    <SettingLabel htmlFor={authTypeId} className="mb-2 block">{t("softEtherAuthType")}</SettingLabel>
                    <select className="w-full rounded-ui-md border border-ui-border bg-ui-surface px-3 py-2"
                        id={authTypeId} disabled={!editable} value={config.auth_type ?? "password"}
                        onChange={(e) => onChange({ auth_type: e.target.value as "password" | "certificate" })}>
                        <option value="password">{t("softEtherPasswordAuth")}</option>
                        <option value="certificate">{t("softEtherCertificateAuth")}</option>
                    </select>
                </div>
                {!certificateAuth && <SettingInputVertical label={t("password")}
                    type="password" value={config.password ?? ""} disabled={!editable}
                    onChange={(password) => onChange({ password })} />}
                <NumberField label={t("mtuOverride")} value={config.mtu}
                    disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
            </div>

            {certificateAuth && <div className="grid gap-3">
                <div>
                    <SettingLabel className="mb-2 block">{t("softEtherClientCert")}</SettingLabel>
                    <Textarea aria-label={t("softEtherClientCert")} rows={5} spellCheck={false}
                        disabled={!editable} placeholder="-----BEGIN CERTIFICATE-----"
                        value={config.client_cert_pem ?? ""} onChange={(e) => onChange({ client_cert_pem: e.target.value })} />
                </div>
                <div>
                    <SettingLabel className="mb-2 block">{t("softEtherClientKey")}</SettingLabel>
                    <Textarea aria-label={t("softEtherClientKey")} rows={5} spellCheck={false}
                        disabled={!editable} placeholder="-----BEGIN PRIVATE KEY-----"
                        value={config.client_key_pem ?? ""} onChange={(e) => onChange({ client_key_pem: e.target.value })} />
                </div>
                <p className="text-sm text-ui-muted">{t("softEtherSecretHelp")}</p>
            </div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingInputVertical label={t("softEtherStaticIPv4")} value={config.address ?? ""}
                    disabled={!editable} placeholder="192.168.30.25/24"
                    onChange={(address) => onChange({ address })} />
                <SettingInputVertical label={t("softEtherIPv4Router")} value={config.router ?? ""}
                    disabled={!editable} placeholder="192.168.30.1"
                    onChange={(router) => onChange({ router })} />
                <SettingInputVertical label={t("softEtherStaticIPv6")} value={config.ipv6_address ?? ""}
                    disabled={!editable} placeholder="2001:db8:30::25/64"
                    onChange={(ipv6_address) => onChange({ ipv6_address })} />
                <SettingInputVertical label={t("softEtherIPv6Router")} value={config.ipv6_router ?? ""}
                    disabled={!editable} placeholder="fe80::1"
                    onChange={(ipv6_router) => onChange({ ipv6_router })} />
            </div>
            <p className="text-sm text-ui-muted">{t("softEtherAddressHelp")}</p>
            <BoolField label={t("softEtherUDPAcceleration")} value={config.udp_acceleration}
                description={t("softEtherUDPAccelerationHelp")} disabled={!editable}
                onChange={(udp_acceleration) => onChange({ udp_acceleration })} />
            <BoolField label={t("softEtherAutoReconnect")} value={config.auto_reconnect}
                disabled={!editable} onChange={(auto_reconnect) => onChange({ auto_reconnect })} />
            <div>
                <SettingLabel className="mb-2 block">{t("caCert")}</SettingLabel>
                <Textarea aria-label={t("caCert")} rows={5} spellCheck={false}
                    disabled={!editable} placeholder="-----BEGIN CERTIFICATE-----"
                    value={config.ca_cert_pem ?? ""} onChange={(e) => onChange({ ca_cert_pem: e.target.value })} />
            </div>
            <BoolField label={t("insecureSkipVerify")} value={config.insecure_skip_verify}
                disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
            <p className="text-sm text-ui-muted">{t("softEtherSecurityHelp")}</p>
        </div>
    );
};
