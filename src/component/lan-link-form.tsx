import type { Go } from "@/api/generated-contracts";
import { SettingInputVertical } from "@/component/v2/forms";
import { InputList } from "@/component/v2/listeditor";
import { useTranslation } from "react-i18next";

export function LANLinkInboundForm({ value, onChange }: {
    value: Go.inbound.LANLinkPublisher;
    onChange: (patch: Partial<Go.inbound.LANLinkPublisher>) => void;
}) {
    const { t } = useTranslation("ui");
    return <div className="grid min-w-0 gap-4">
        <InputList title={t("peerTunnel.routes")} data={value.routes} onChange={routes => onChange({ routes })} placeholder="192.168.50.0/24" />
        <SettingInputVertical label={t("lanLink.subnet")} value={value.subnet ?? ""} onChange={subnet => onChange({ subnet })} placeholder={t("lanLink.autoSubnet")} />
        <details open={!value.coordinator || !value.registration ? true : undefined}>
            <summary>{t("lanLink.discoverySetup")}</summary>
            <div className="mt-3 grid gap-4">
                <SettingInputVertical label={t("peerTunnel.coordinator")} value={value.coordinator} onChange={coordinator => onChange({ coordinator })} placeholder="link.example.net:51821" />
                <SettingInputVertical secret type="password" label={t("lanLink.registrationKey")} value={value.registration} onChange={registration => onChange({ registration })} />
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
