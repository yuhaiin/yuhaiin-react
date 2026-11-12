import type { NodeProtocolConfig } from "@/contract/node";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical } from "@/component/v2/forms";
import { Textarea } from "@/component/v2/input";
import { BoolField, StringField, NumberField } from "./fields";

type Props<T extends "ikev2" | "anyconnect" | "sstp" | "fortinet"> = {
  config: NodeProtocolConfig<T>;
  editable: boolean;
  onChange: (patch: Partial<NodeProtocolConfig<T>>) => void;
};

export const IKEv2Form: FC<Props<"ikev2">> = ({ config, editable, onChange }) => {
  const { t } = useTranslation("ui");
  return <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
    <StringField label={t("nodeForm.ikev2Gateway")} value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label={t("nodeForm.localId")} value={config.local_id} disabled={!editable} onChange={(local_id) => onChange({ local_id })} />
    <StringField label={t("nodeForm.serverIdOptional")} value={config.server_id} disabled={!editable} onChange={(server_id) => onChange({ server_id })} />
    <SettingInputVertical label={t("nodeForm.ipsecPsk")} type="password" value={config.psk ?? ""} disabled={!editable} onChange={(psk) => onChange({ psk })} />
    <StringField label={t("nodeForm.eapUsername")} value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical secret label={t("nodeForm.eapPassword")} type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <BoolField label={t("nodeForm.tcpEncapsulation")} value={config.tcp} disabled={!editable} onChange={(tcp) => onChange({ tcp })} />
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <p className="@xl:col-span-2 text-sm text-ui-muted">{t("nodeForm.ikev2Help")}</p>
  </div>;
};

export const AnyConnectForm: FC<Props<"anyconnect">> = ({ config, editable, onChange }) => {
  const { t } = useTranslation("ui");
  return <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
    <StringField label={t("nodeForm.anyconnectGateway")} value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label={t("username")} value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical secret label={t("password")} type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <BoolField label={t("nodeForm.skipTlsVerify")} value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
    <BoolField label={t("nodeForm.disableDtlsDataChannel")} value={config.disable_dtls} disabled={!editable} onChange={(disable_dtls) => onChange({ disable_dtls })} />
    <p className="@xl:col-span-2 text-sm text-ui-muted">{t("nodeForm.anyconnectHelp")}</p>
  </div>;
};

export const SSTPForm: FC<Props<"sstp">> = ({ config, editable, onChange }) => {
  const { t } = useTranslation("ui");
  return <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
    <StringField label={t("nodeForm.sstpGateway")} value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label={t("username")} value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical secret label={t("password")} type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <BoolField label={t("nodeForm.skipTlsVerify")} value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
  </div>;
};

export const FortinetForm: FC<Props<"fortinet">> = ({ config, editable, onChange }) => {
  const { t } = useTranslation("ui");
  return <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
    <StringField label={t("nodeForm.fortinetGateway")} value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label={t("username")} value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical secret label={t("password")} type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <StringField label={t("nodeForm.realmOptional")} value={config.realm} disabled={!editable} onChange={(realm) => onChange({ realm })} />
    <SettingInputVertical label={t("nodeForm.oneTimeToken")} type="password" value={config.token ?? ""} disabled={!editable} onChange={(token) => onChange({ token })} />
    <SettingInputVertical label={t("nodeForm.totpSecret")} type="password" value={config.totp_secret ?? ""} disabled={!editable} onChange={(totp_secret) => onChange({ totp_secret })} />
    <div className="@xl:col-span-2">
      <SettingLabel className="mb-2 block">{t("nodeForm.trustedCaPem")}</SettingLabel>
      <Textarea code aria-label={t("nodeForm.trustedCaPem")} rows={5} spellCheck={false}
        disabled={!editable} placeholder="-----BEGIN CERTIFICATE-----"
        value={config.ca_cert_pem ?? ""} onChange={(event) => onChange({ ca_cert_pem: event.target.value })} />
    </div>
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <BoolField label={t("nodeForm.skipTlsVerify")} value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
    <BoolField label={t("nodeForm.disableDtls")} value={config.disable_dtls} disabled={!editable} onChange={(disable_dtls) => onChange({ disable_dtls })} />
    <p className="@xl:col-span-2 text-sm text-ui-muted">{t("nodeForm.fortinetHelp")}</p>
  </div>;
};
