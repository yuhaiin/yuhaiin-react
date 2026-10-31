import { getNodeExtraInfo } from "@/api/nodes";
import { Button } from "@/component/v2/button";
import { SettingInputVertical } from "@/component/v2/forms";
import type { L2TPInfo, NodeProtocolConfig } from "@/contract/node";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { BoolField, VPNSelect } from "./fields";
import { RuntimeInfoList } from "./globalprotect-forms";

type FormProps<T extends "l2tp" | "l2tpv3"> = {
    config: NodeProtocolConfig<T>;
    editable: boolean;
    onChange: (patch: Partial<NodeProtocolConfig<T>>) => void;
};

const TunnelOptions: FC<FormProps<"l2tp">> = ({ config, editable, onChange }) => {
    const { t } = useTranslation("ui");
    return <>
        <SettingInputVertical label="MTU" type="number" min={576} max={1500} step={1}
            value={config.mtu ?? 1400} disabled={!editable} onChange={(value) => onChange({ mtu: Number(value) || 1400 })} />
        <BoolField label={t("openVPNAutoReconnect")} description={t("openVPNReconnectHelp")}
            value={config.auto_reconnect} disabled={!editable} onChange={(auto_reconnect) => onChange({ auto_reconnect })} />
    </>;
};

export const L2TPForm: FC<FormProps<"l2tp">> = ({ config, editable, onChange }) => {
    const { t } = useTranslation("ui");
    return <div className="grid min-w-0 gap-4">
        <p className="mb-0 text-sm text-ui-muted">{t("l2tpHelp")}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={t("l2tpGateway")} value={config.gateway ?? ""} placeholder="vpn.example.com:1701"
                disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
            <VPNSelect label={t("l2tpAuthType")} value={config.auth_type ?? "auto"} disabled={!editable}
                options={[["auto", t("l2tpAutoAuth")], ["pap", "PAP"], ["chap-md5", "CHAP-MD5"], ["mschap-v2", "MS-CHAPv2"]]}
                onChange={(auth_type) => onChange({ auth_type })} />
            <SettingInputVertical label={t("username")} value={config.username ?? ""} disabled={!editable} onChange={(username) => onChange({ username })} />
            <SettingInputVertical secret label={t("password")} type="password" value={config.password ?? ""} disabled={!editable} onChange={(password) => onChange({ password })} />
            <SettingInputVertical label={t("l2tpSharedSecret")} type="password" value={config.shared_secret ?? ""} disabled={!editable} onChange={(shared_secret) => onChange({ shared_secret })} />
            <SettingInputVertical label={t("hostname")} value={config.hostname ?? ""} disabled={!editable} onChange={(hostname) => onChange({ hostname })} />
        </div>
        <BoolField label={t("l2tpIPv6")} description={t("l2tpIPv6Help")} value={config.ipv6 || !!config.ipv6_address}
            disabled={!editable} onChange={(ipv6) => onChange({ ipv6, ...(!ipv6 ? { ipv6_address: undefined } : {}) })} />
        {(config.ipv6 || config.ipv6_address) && <SettingInputVertical label={t("l2tpIPv6Address")} value={config.ipv6_address ?? ""}
            placeholder="fd88::2/64" disabled={!editable} onChange={(ipv6_address) => onChange({ ipv6_address })} />}
        <TunnelOptions config={config} editable={editable} onChange={onChange} />
    </div>;
};

export const L2TPv3Form: FC<FormProps<"l2tpv3">> = ({ config, editable, onChange }) => {
    const { t } = useTranslation("ui");
    return <div className="grid min-w-0 gap-4">
        <p className="mb-0 text-sm text-ui-muted">{t("l2tpv3Help")}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={t("l2tpGateway")} value={config.gateway ?? ""} placeholder="vpn.example.com:1701"
                disabled={!editable} onChange={(gateway) => onChange({ gateway })} />
            <SettingInputVertical label={t("l2tpLocalAddress")} value={config.local_address ?? ""} placeholder="0.0.0.0:1701"
                disabled={!editable} onChange={(local_address) => onChange({ local_address })} />
        </div>
        <BoolField label={t("l2tpStatic")} description={t("l2tpStaticHelp")} value={config.static}
            disabled={!editable} onChange={(value) => onChange({ static: value })} />
        {config.static ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={t("l2tpLocalSessionID")} type="number" min={1} max={4294967295} step={1} value={config.local_session_id ?? 0}
                disabled={!editable} onChange={(value) => onChange({ local_session_id: Number(value) || 0 })} />
            <SettingInputVertical label={t("l2tpPeerSessionID")} type="number" min={1} max={4294967295} step={1} value={config.peer_session_id ?? 0}
                disabled={!editable} onChange={(value) => onChange({ peer_session_id: Number(value) || 0 })} />
            <SettingInputVertical secret label={t("l2tpLocalCookie")} value={config.local_cookie ?? ""}
                disabled={!editable} onChange={(local_cookie) => onChange({ local_cookie })} />
            <SettingInputVertical secret label={t("l2tpPeerCookie")} value={config.peer_cookie ?? ""}
                disabled={!editable} onChange={(peer_cookie) => onChange({ peer_cookie })} />
            <p className="mb-0 text-sm text-ui-muted md:col-span-2">{t("l2tpCookieHelp")}</p>
        </div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={t("l2tpSharedSecret")} type="password" value={config.shared_secret ?? ""}
                disabled={!editable} onChange={(shared_secret) => onChange({ shared_secret })} />
            <SettingInputVertical label={t("hostname")} value={config.hostname ?? ""} disabled={!editable} onChange={(hostname) => onChange({ hostname })} />
            <SettingInputVertical label={t("l2tpRemoteEndID")} value={config.remote_end_id ?? ""}
                disabled={!editable} onChange={(remote_end_id) => onChange({ remote_end_id })} />
        </div>}
        <BoolField label={t("l2tpSublayer")} value={config.sublayer} disabled={!editable} onChange={(sublayer) => onChange({ sublayer })} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingInputVertical label={t("l2tpAddress")} value={config.address ?? ""} placeholder="10.89.0.2/24"
                disabled={!editable} onChange={(address) => onChange({ address })} />
            <SettingInputVertical label={t("softEtherIPv4Router")} value={config.router ?? ""} placeholder="10.89.0.1"
                disabled={!editable} onChange={(router) => onChange({ router })} />
            <SettingInputVertical label={t("l2tpIPv6Address")} value={config.ipv6_address ?? ""} placeholder="fd89::2/64"
                disabled={!editable} onChange={(ipv6_address) => onChange({ ipv6_address })} />
            <SettingInputVertical label={t("softEtherIPv6Router")} value={config.ipv6_router ?? ""} placeholder="fd89::1"
                disabled={!editable} onChange={(ipv6_router) => onChange({ ipv6_router })} />
        </div>
        <TunnelOptions config={config} editable={editable} onChange={onChange} />
    </div>;
};

export const L2TPRuntimeInfo: FC<{ nodeId: string; type: "l2tp" | "l2tpv3" }> = ({ nodeId, type }) => {
    const { t } = useTranslation("ui");
    const [info, setInfo] = useState<L2TPInfo>();
    const [loading, setLoading] = useState(false);
    const [unavailable, setUnavailable] = useState(false);
    const load = async () => {
        setLoading(true);
        setUnavailable(false);
        try {
            const extra = await getNodeExtraInfo(nodeId);
            setInfo(extra[type]);
            setUnavailable(!extra[type]);
        } catch {
            setInfo(undefined);
            setUnavailable(true);
        } finally { setLoading(false); }
    };
    return <section className="mt-4 rounded-ui-lg border border-ui-border bg-ui-surface p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="mb-0 text-base font-semibold">{type === "l2tp" ? "L2TP" : "L2TPv3"} · {t("l2tpConnectionInfo")}</h3>
            <Button variant="outline-primary" size="sm" disabled={!nodeId || loading} aria-label={t("l2tpFetchInfo")} onClick={() => void load()}>
                {loading ? t("globalProtectLoadingInfo") : t("l2tpFetchInfo")}
            </Button>
        </div>
        <p className="mb-0 mt-2 text-sm text-ui-muted">{t("openVPNInfoHelp")}</p>
        {unavailable && <p role="status" className="mb-0 mt-3 text-sm text-ui-danger">{t("l2tpInfoUnavailable")}</p>}
        {info && <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <RuntimeInfoList label={t("openVPNTunnelPrefixes")} values={info.tunnel_prefixes} />
            <RuntimeInfoList label={t("globalProtectDNSServers")} values={info.dns} />
            <RuntimeInfoList label={t("l2tpAuthType")} value={info.auth} />
            <RuntimeInfoList label={t("softEtherIPv4Router")} value={info.peer_address} />
            <RuntimeInfoList label="MTU" value={info.mtu?.toString()} />
            <RuntimeInfoList label={t("l2tpLocalSessionID")} value={info.local_session_id?.toString()} />
            <RuntimeInfoList label={t("l2tpPeerSessionID")} value={info.peer_session_id?.toString()} />
            <RuntimeInfoList label={t("l2tpLocalTunnelID")} value={info.local_tunnel_id?.toString()} />
            <RuntimeInfoList label={t("l2tpPeerTunnelID")} value={info.peer_tunnel_id?.toString()} />
        </div>}
    </section>;
};
