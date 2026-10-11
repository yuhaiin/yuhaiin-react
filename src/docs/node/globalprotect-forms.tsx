import { getNodeExtraInfo } from "@/api/nodes";
import { Button } from "@/component/v2/button";
import { Textarea } from "@/component/v2/input";
import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical } from "@/component/v2/forms";
import type { GlobalProtectInfo, NodeProtocolConfig } from "@/contract/node";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { BoolField, NumberField } from "./fields";

const GlobalProtectForm: FC<{
    config: NodeProtocolConfig<"globalprotect">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"globalprotect">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation("ui");
    return (
        <div className="grid gap-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingInputVertical
                    label={uiT("globalProtectGateway")}
                    value={config.gateway ?? ""}
                    disabled={!editable}
                    onChange={(gateway) => onChange({ gateway })}
                />
                <SettingInputVertical
                    label={uiT("username")}
                    value={config.username ?? ""}
                    disabled={!editable}
                    onChange={(username) => onChange({ username })}
                />
                <SettingInputVertical
                    label={uiT("password")}
                    type="password"
                    value={config.password ?? ""}
                    disabled={!editable}
                    onChange={(password) => onChange({ password })}
                />
                <SettingInputVertical
                    label={uiT("computerName")}
                    value={config.computer ?? ""}
                    disabled={!editable}
                    onChange={(computer) => onChange({ computer })}
                />
                <NumberField
                    label={uiT("mtuOverride")}
                    value={config.mtu}
                    disabled={!editable}
                    onChange={(mtu) => onChange({ mtu })}
                />
            </div>
            <BoolField
                label={uiT("globalProtectESP")}
                description={uiT("globalProtectESPHelp")}
                value={config.use_esp}
                disabled={!editable}
                onChange={(use_esp) => onChange({ use_esp })}
            />
            <div>
                <SettingLabel className="mb-2 block">{uiT("caCert")}</SettingLabel>
                <Textarea
                    value={config.ca_cert_pem ?? ""}
                    disabled={!editable}
                    rows={5}
                    spellCheck={false}
                    aria-label={uiT("caCert")}
                    placeholder="-----BEGIN CERTIFICATE-----"
                    onChange={(event) => onChange({ ca_cert_pem: event.target.value })}
                />
            </div>
            <div className="grid gap-1">
                <BoolField
                    label={uiT("insecureSkipVerify")}
                    value={config.insecure_skip_verify}
                    disabled={!editable}
                    onChange={(insecure_skip_verify) => onChange({ insecure_skip_verify })}
                />
                <p className="text-sm text-ui-muted">{uiT("globalProtectTLSHelp")}</p>
            </div>
        </div>
    );
};

const RuntimeInfoList: FC<{ label: string; values?: string[]; value?: string }> = ({ label, values, value }) => {
    const { t: uiT } = useTranslation("ui");
    const items = values ?? (value ? [value] : []);
    return (
        <div className="min-w-0 rounded-ui-md border border-ui-border bg-ui-surface-muted p-3">
            <h4 className="mb-2 text-sm font-semibold">{label}</h4>
            {items.length === 0 ? (
                <p className="mb-0 text-sm text-ui-muted">{uiT("globalProtectNoValues")}</p>
            ) : (
                <ul className="mb-0 grid gap-1 pl-4 font-mono text-xs sm:text-sm">
                    {items.map((item, index) => <li key={`${item}-${index}`} className="break-all">{item}</li>)}
                </ul>
            )}
        </div>
    );
};

const GlobalProtectRuntimeInfo: FC<{ nodeId: string }> = ({ nodeId }) => {
    const { t: uiT } = useTranslation("ui");
    const [info, setInfo] = useState<GlobalProtectInfo>();
    const [loading, setLoading] = useState(false);
    const [unavailable, setUnavailable] = useState(false);

    const load = async () => {
        setLoading(true);
        setUnavailable(false);
        try {
            const extra = await getNodeExtraInfo(nodeId);
            if (!extra.globalprotect) {
                setUnavailable(true);
                setInfo(undefined);
            } else {
                setInfo(extra.globalprotect);
            }
        } catch {
            setUnavailable(true);
            setInfo(undefined);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mt-4 rounded-ui-lg border border-ui-border bg-ui-surface p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="mb-0 text-base font-semibold">{uiT("globalProtectGatewayInfo")}</h3>
                <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!nodeId || loading}
                    aria-label={uiT("globalProtectFetchGatewayInfo")}
                    onClick={() => void load()}
                >
                    {loading ? uiT("globalProtectLoadingInfo") : uiT(info ? "globalProtectRefreshGatewayInfo" : "globalProtectFetchGatewayInfo")}
                </Button>
            </div>
            <p className="mb-0 mt-2 text-sm text-ui-muted">{uiT("globalProtectGatewayInfoHelp")}</p>
            {unavailable && <p role="status" className="mb-0 mt-3 text-sm text-ui-danger">{uiT("globalProtectGatewayInfoUnavailable")}</p>}
            {info && (
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <RuntimeInfoList label={uiT("globalProtectTunnelPrefix")} value={info.tunnel_prefix} />
                    <RuntimeInfoList label={uiT("vpnDataTransport")} value={info.data_transport} />
                    <RuntimeInfoList label={uiT("globalProtectAccessRoutesIPv4")} values={info.access_routes_ipv4} />
                    <RuntimeInfoList label={uiT("globalProtectExcludeRoutesIPv4")} values={info.exclude_routes_ipv4} />
                    <RuntimeInfoList label={uiT("globalProtectAccessRoutesIPv6")} values={info.access_routes_ipv6} />
                    <RuntimeInfoList label={uiT("globalProtectExcludeRoutesIPv6")} values={info.exclude_routes_ipv6} />
                    <RuntimeInfoList label={uiT("globalProtectDNSServers")} values={info.dns} />
                    <RuntimeInfoList label={uiT("globalProtectDNSv6Servers")} values={info.dns_v6} />
                    <RuntimeInfoList label={uiT("globalProtectDNSSuffixes")} values={info.dns_suffix} />
                    <RuntimeInfoList label={uiT("globalProtectLocalNetworkPolicy")} value={info.no_direct_access_to_local_network} />
                </div>
            )}
        </section>
    );
};

export { GlobalProtectForm, GlobalProtectRuntimeInfo, RuntimeInfoList };
