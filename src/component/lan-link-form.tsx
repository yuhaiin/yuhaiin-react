import { listLANLinkNetworks } from "@/api/inbounds";
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
