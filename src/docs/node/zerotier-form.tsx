import type { FC } from "react";
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
    const moons = config.moons ?? [];
    const changeMoon = (index: number, patch: Partial<(typeof moons)[number]>) => {
        onChange({ moons: moons.map((moon, i) => i === index ? { ...moon, ...patch } : moon) });
    };
    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StringField
                    label="ZeroTier Network ID (16 hexadecimal digits)"
                    value={config.network_id ?? ""}
                    disabled={!editable}
                    onChange={(network_id) => onChange({ network_id: network_id.trim() })}
                />
                <StringField
                    label="Identity name (optional)"
                    value={config.identity ?? ""}
                    disabled={!editable}
                    onChange={(identity) => onChange({ identity })}
                />
                <StringField
                    label="Physical UDP listen address"
                    value={config.listen ?? ""}
                    disabled={!editable}
                    onChange={(listen) => onChange({ listen })}
                />
                <StringField
                    label="Native library path (optional)"
                    value={config.library_path ?? ""}
                    disabled={!editable}
                    onChange={(library_path) => onChange({ library_path })}
                />
            </div>
            <BoolField
                label="Low bandwidth mode"
                value={config.low_bandwidth ?? false}
                disabled={!editable}
                onChange={(low_bandwidth) => onChange({ low_bandwidth })}
            />
            <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <SettingLabel>Moons (optional private roots)</SettingLabel>
                    <Button
                        disabled={!editable}
                        onClick={() => onChange({ moons: [...moons, { id: "", seed: "" }] })}
                    >Add Moon</Button>
                </div>
                {moons.map((moon, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 rounded-ui-md border border-ui-border p-3 md:grid-cols-[1fr_1fr_auto]">
                        <StringField
                            label={`Moon ${index + 1} ID (hex)`}
                            value={moon.id}
                            disabled={!editable}
                            onChange={(id) => changeMoon(index, { id })}
                        />
                        <StringField
                            label="Seed node address (hex)"
                            value={moon.seed}
                            disabled={!editable}
                            onChange={(seed) => changeMoon(index, { seed })}
                        />
                        <div className="flex items-end">
                            <Button disabled={!editable} onClick={() => onChange({ moons: moons.filter((_, i) => i !== index) })}>Remove</Button>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-sm text-ui-muted">
                Join a ZeroTier network without a system TUN device. Approve this node in the ZeroTier
                controller before using the outbound. Managed IPv4/IPv6 addresses and MTU come from
                the controller. Identity state is saved under yuhaiin's data directory so rejoining
                does not require authorizing a new device each time. Use distinct identity names for
                concurrent clients. The UDP underlay connects directly, so do not chain an upstream
                outbound before this protocol.
            </p>
            <p className="text-sm text-ui-muted">
                The native library must be available for the target OS and CPU. On macOS it must be
                installed as a signed application library; Android builds need libztgo.so in jniLibs.
                The library path is primarily for development and native diagnostics.
            </p>
        </div>
    );
};
