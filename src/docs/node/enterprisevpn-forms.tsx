import type { NodeProtocolConfig } from "@/contract/node";
import { FC } from "react";
import { SettingInputVertical } from "@/component/v2/forms";
import { BoolField, StringField, NumberField } from "./fields";

type Props<T extends "ikev2" | "anyconnect" | "sstp" | "fortinet"> = {
  config: NodeProtocolConfig<T>;
  editable: boolean;
  onChange: (patch: Partial<NodeProtocolConfig<T>>) => void;
};

export const IKEv2Form: FC<Props<"ikev2">> = ({ config, editable, onChange }) =>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <StringField label="IKEv2 Gateway" value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label="Local ID" value={config.local_id} disabled={!editable} onChange={(local_id) => onChange({ local_id })} />
    <StringField label="Server ID (optional)" value={config.server_id} disabled={!editable} onChange={(server_id) => onChange({ server_id })} />
    <SettingInputVertical label="IPsec PSK" type="password" value={config.psk ?? ""} disabled={!editable} onChange={(psk) => onChange({ psk })} />
    <StringField label="EAP username" value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical label="EAP password" type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <BoolField label="TCP encapsulation (RFC 8229)" value={config.tcp} disabled={!editable} onChange={(tcp) => onChange({ tcp })} />
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <p className="md:col-span-2 text-sm text-ui-muted">IKEv2 NAT-T uses UDP 500/4500 directly. TCP encapsulation is required for chained upstream proxies. The server must support RFC 8229.</p>
  </div>;

export const AnyConnectForm: FC<Props<"anyconnect">> = ({ config, editable, onChange }) =>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <StringField label="AnyConnect / ocserv gateway" value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label="Username" value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical label="Password" type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <BoolField label="Skip TLS certificate verification" value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
    <BoolField label="Disable DTLS (TLS data channel only)" value={config.disable_dtls} disabled={!editable} onChange={(disable_dtls) => onChange({ disable_dtls })} />
    <p className="md:col-span-2 text-sm text-ui-muted">Chained connections automatically disable direct UDP DTLS to prevent traffic bypass.</p>
  </div>;

export const SSTPForm: FC<Props<"sstp">> = ({ config, editable, onChange }) =>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <StringField label="SSTP gateway (TLS/443)" value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label="Username" value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical label="Password" type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <BoolField label="Skip TLS certificate verification" value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
  </div>;

export const FortinetForm: FC<Props<"fortinet">> = ({ config, editable, onChange }) =>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <StringField label="Fortinet SSL VPN gateway" value={config.gateway} disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
    <StringField label="Username" value={config.username} disabled={!editable} onChange={(username) => onChange({ username })} />
    <SettingInputVertical label="Password" type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
    <StringField label="Realm (optional)" value={config.realm} disabled={!editable} onChange={(realm) => onChange({ realm })} />
    <SettingInputVertical label="One-time token" type="password" value={config.token ?? ""} disabled={!editable} onChange={(token) => onChange({ token })} />
    <SettingInputVertical label="TOTP secret" type="password" value={config.totp_secret ?? ""} disabled={!editable} onChange={(totp_secret) => onChange({ totp_secret })} />
    <div className="md:col-span-2">
      <SettingInputVertical label="Trusted CA certificate (PEM)" value={config.ca_cert_pem ?? ""} disabled={!editable} onChange={(ca_cert_pem) => onChange({ ca_cert_pem })} />
    </div>
    <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
    <BoolField label="Skip TLS certificate verification" value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })} />
    <BoolField label="Disable DTLS" value={config.disable_dtls} disabled={!editable} onChange={(disable_dtls) => onChange({ disable_dtls })} />
    <p className="md:col-span-2 text-sm text-ui-muted">The upstream SSL VPN implementation requires verification against genuine FortiGate equipment before production use.</p>
  </div>;
