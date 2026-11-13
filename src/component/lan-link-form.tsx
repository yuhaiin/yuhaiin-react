import { listLANLinkNetworks } from "@/api/inbounds";
import { getNodeExtraInfo } from "@/api/nodes";
import type { Go } from "@/api/generated-contracts";
import { Badge } from "@/component/v2/badge";
import { FormSection } from "@/component/v2/form-section";
import { SettingInputVertical, SettingValue } from "@/component/v2/forms";
import { InputList } from "@/component/v2/listeditor";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export function LANLinkInboundForm({ value, onChange }: {
    value: Go.inbound.LANLinkGateway;
    onChange: (patch: Partial<Go.inbound.LANLinkGateway>) => void;
}) {
    const { t } = useTranslation("ui");
    const { data: detected, error } = useSWR("lan-link-networks", listLANLinkNetworks, { revalidateOnFocus: false, shouldRetryOnError: false });
    const networks = value.networks ?? [];
    const toggle = (cidr: string) => onChange({
        networks: networks.includes(cidr) ? networks.filter(item => item !== cidr) : [...networks, cidr],
    });
    return <div className="grid min-w-0 gap-4">
        <FormSection title={t("lanLink.networks")} description={t("lanLink.networksHelp")}>
            <div className="grid min-w-0 gap-3">
                {detected?.supported && detected.items.length > 0 && <ul className="grid gap-2" aria-label={t("lanLink.detectedNetworks")}>
                    {detected.items.map(item => <li key={item.cidr}>
                        <label className="flex min-w-0 cursor-pointer flex-wrap items-center gap-2 rounded-ui-md border border-ui-border px-3 py-2">
                            <input type="checkbox" checked={networks.includes(item.cidr)} onChange={() => toggle(item.cidr)} />
                            <code className="break-all text-sm">{item.cidr}</code>
                            <span className="text-xs text-ui-muted">{item.interface}</span>
                            <Badge variant="muted">{item.family === "ipv6" ? "IPv6" : "IPv4"}</Badge>
                        </label>
                    </li>)}
                </ul>}
                {detected && !detected.supported && <p role="status" className="text-sm text-ui-muted">{t("lanLink.detectionUnsupported", { reason: detected.reason })}</p>}
                {detected?.supported && detected.items.length === 0 && <p role="status" className="text-sm text-ui-muted">{t("lanLink.noDetectedNetworks")}</p>}
                {error && <p role="status" className="text-sm text-ui-muted">{t("lanLink.detectionFailed")}</p>}
                <InputList title={t("lanLink.manualNetworks")} data={networks} onChange={next => onChange({ networks: next })} placeholder="192.168.50.0/24" />
            </div>
        </FormSection>
        <SettingValue label={t("lanLink.subnet")} value={value.subnet || t("lanLink.autoSubnet")} />
        <details className="min-w-0 rounded-ui-md border border-ui-border px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-ui-heading">{t("lanLink.advanced")}</summary>
            <div className="mt-3 grid gap-4">
                <SettingInputVertical label={t("lanLink.listen")} value={value.listen ?? ""} onChange={listen => onChange({ listen })} placeholder=":51821" />
                <SettingInputVertical label={t("lanLink.publicEndpoint")} value={value.publicEndpoint ?? ""} onChange={publicEndpoint => onChange({ publicEndpoint })} placeholder="link.example.net:51821" />
                <SettingInputVertical label={t("lanLink.stunServer")} value={value.stunServer ?? ""} onChange={stunServer => onChange({ stunServer })} placeholder="stun.l.google.com:19302" />
                <p className="text-sm text-ui-muted">{t("lanLink.publicEndpointHelp")}</p>
            </div>
        </details>
    </div>;
}

export function LANLinkOutboundForm({ value, onChange, disabled }: {
    value: Partial<Go.transport.LANLink>;
    onChange: (invitation: string) => void;
    disabled?: boolean;
}) {
    const { t } = useTranslation("ui");
    return <SettingInputVertical secret type="password" label={t("lanLink.invitation")} value={value.invitation ?? ""} onChange={onChange} disabled={disabled} />;
}

/** Shows a peer UDP address with whether it is a LAN or a public address. */
export function LANLinkPath({ endpoint, path }: { endpoint?: string; path?: string }) {
    const { t } = useTranslation("ui");
    if (!endpoint) return null;
    return <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
        <span className="break-all font-mono">{endpoint}</span>
        {path && <Badge variant={path === "lan" ? "success" : "muted"}>{t(`lanLink.path.${path}`, { defaultValue: path })}</Badge>}
    </span>;
}

/** Live state of a LAN Link outbound, shown in its node editor. */
export function LANLinkRuntimeInfo({ nodeId }: { nodeId: string }) {
    const { t } = useTranslation("ui");
    const { data, error } = useSWR(["lan-link-status", nodeId], () => getNodeExtraInfo(nodeId),
        { refreshInterval: 5_000, revalidateOnFocus: false, shouldRetryOnError: false });
    const link = data?.lan_link;
    const variant = link?.state === "connected" ? "success" : link?.state === "connecting" ? "warning" : "muted";
    return <section className="mt-4 grid min-w-0 gap-3 rounded-ui-lg border border-ui-border bg-ui-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
            <h3 className="mb-0 text-base font-semibold">{t("lanLink.status")}</h3>
            {link && <Badge variant={variant} dot>{t(`lanLink.linkState.${link.state}`, { defaultValue: link.state })}</Badge>}
        </div>
        {!link && (error || data) && <p role="status" className="text-sm text-ui-muted">{t("lanLink.statusUnavailable")}</p>}
        {link && <dl className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
            {link.localIp && <><dt className="text-ui-muted">{t("peerTunnel.localIp")}</dt><dd className="break-all font-mono">{link.localIp}</dd></>}
            {link.peerIp && <><dt className="text-ui-muted">{t("peerTunnel.peerIp")}</dt><dd className="break-all font-mono">{link.peerIp}</dd></>}
            {link.listen && <><dt className="text-ui-muted">{t("lanLink.localListen")}</dt><dd className="break-all font-mono">{link.listen}</dd></>}
            {link.pairingId && <><dt className="text-ui-muted">{t("lanLink.pairingId")}</dt><dd className="break-all font-mono" title={link.pairingId}>{link.pairingId.slice(0, 12)}</dd></>}
            {link.coordinator && <><dt className="text-ui-muted">{t("lanLink.gatewayAddress")}</dt><dd className="break-all font-mono">{link.coordinator}</dd></>}
            {link.peerEndpoint && <><dt className="text-ui-muted">{t("lanLink.peerEndpoint")}</dt><dd className="min-w-0"><LANLinkPath endpoint={link.peerEndpoint} path={link.path} /></dd></>}
        </dl>}
        {link?.state === "idle" && <p className="text-xs text-ui-muted">{t("lanLink.idleHelp")}</p>}
        {link && link.state !== "connected" && link.error && <p role="alert" className="break-words text-xs text-ui-danger">{link.error}</p>}
    </section>;
}
