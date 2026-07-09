import { SettingInputVertical } from "@/component/v2/forms"
import { Textarea } from "@/component/v2/input"
import { InputList } from "@/component/v2/listeditor"
import { FC } from "react"
import { cloudflare_warp_masque } from "../schema/node/protocol"
import { Props } from "./tools"

export const CloudflareWarpMasque: FC<Props<cloudflare_warp_masque>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        privateKey: value?.privateKey ?? "",
        mtu: typeof value?.mtu === "number" ? value.mtu : 0,
        endpoint: value?.endpoint ?? "",
        endpointPublicKey: value?.endpointPublicKey ?? "",
        localAddresses: Array.isArray(value?.localAddresses) ? value.localAddresses : [],
    };
    return <>
        <SettingInputVertical
            label="PrivateKey"
            value={current.privateKey}
            disabled={!editable}
            placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
            onChange={(e: string) => { onChange({ ...current, privateKey: e }) }}
        />

        <SettingInputVertical
            label="MTU"
            value={current.mtu.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...current, mtu: Number(e) }) }}
        />

        <SettingInputVertical
            label="Endpoint"
            value={current.endpoint}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, endpoint: e }) }}
        />

        <div className="mb-3">
            <label className="text-sm font-bold opacity-75 mb-2 block">EndpointPublicKey</label>
            <Textarea
                rows={3}
                value={current.endpointPublicKey}
                readOnly={!editable}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { onChange({ ...current, endpointPublicKey: e.target.value.replace(/\\n/g, "\n") }) }}
            />
        </div>

        <InputList
            title="LocalAddresses"
            data={current.localAddresses}
            disabled={!editable}
            onChange={(e) => { onChange({ ...current, localAddresses: e }) }}
        />
    </>
}
