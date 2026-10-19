import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { NodeProtocolConfig } from "@/contract/node";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { BoolField, StringField } from "./fields";

// Network and Moon IDs must stay strings: JS numbers cannot represent a
// complete 64-bit ZeroTier identifier without losing precision.
export const ZeroTierForm: FC<{
    config: NodeProtocolConfig<"zerotier">;
    editable: boolean;
    onChange: (patch: Partial<NodeProtocolConfig<"zerotier">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t } = useTranslation("node");
    const { t: uiT } = useTranslation("ui");
    const moons = config.moons ?? [];
    const changeMoon = (index: number, patch: Partial<(typeof moons)[number]>) => {
        onChange({ moons: moons.map((moon, i) => i === index ? { ...moon, ...patch } : moon) });
    };
    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StringField
                    label={t("zeroTierNetworkId")}
                    value={config.network_id ?? ""}
                    disabled={!editable}
                    onChange={(network_id) => onChange({ network_id: network_id.trim() })}
                />
                <StringField
                    label={t("zeroTierIdentityName")}
                    value={config.identity ?? ""}
                    disabled={!editable}
                    onChange={(identity) => onChange({ identity })}
                />
                <StringField
                    label={t("zeroTierListenAddress")}
                    value={config.listen ?? ""}
                    disabled={!editable}
                    onChange={(listen) => onChange({ listen })}
                />
                <StringField
                    label={t("zeroTierLibraryPath")}
                    value={config.library_path ?? ""}
                    disabled={!editable}
                    onChange={(library_path) => onChange({ library_path })}
                />
            </div>
            <BoolField
                label={t("zeroTierLowBandwidth")}
                value={config.low_bandwidth ?? false}
                disabled={!editable}
                onChange={(low_bandwidth) => onChange({ low_bandwidth })}
            />
            <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <SettingLabel>{t("zeroTierMoons")}</SettingLabel>
                    <Button
                        disabled={!editable}
                        onClick={() => onChange({ moons: [...moons, { id: "", seed: "" }] })}
                    >{t("zeroTierAddMoon")}</Button>
                </div>
                {moons.map((moon, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 rounded-ui-md border border-ui-border p-3 md:grid-cols-[1fr_1fr_auto]">
                        <StringField
                            label={t("zeroTierMoonId", { index: index + 1 })}
                            value={moon.id}
                            disabled={!editable}
                            onChange={(id) => changeMoon(index, { id })}
                        />
                        <StringField
                            label={t("zeroTierSeedAddress")}
                            value={moon.seed}
                            disabled={!editable}
                            onChange={(seed) => changeMoon(index, { seed })}
                        />
                        <div className="flex items-end">
                            <Button disabled={!editable} onClick={() => onChange({ moons: moons.filter((_, i) => i !== index) })}>{uiT("remove")}</Button>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-sm text-ui-muted">
                {t("zeroTierJoinHelp")}
            </p>
            <p className="text-sm text-ui-muted">
                {t("zeroTierNativeLibraryHelp")}
            </p>
        </div>
    );
};
