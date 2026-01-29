import { SettingInputVertical } from "@/component/v2/forms"
import { Textarea } from "@/component/v2/input"
import { InputList } from "@/component/v2/listeditor"
import { FC } from "react"
import { cloudflare_warp_masque } from "../pbes/node/protocol_pb"
import { Props } from "./tools"

export const CloudflareWarpMasque: FC<Props<cloudflare_warp_masque>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="PrivateKey"
            value={value.privateKey}
            disabled={!editable}
            placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
            onChange={(e: string) => { onChange({ ...value, privateKey: e }) }}
        />

        <SettingInputVertical
            label="MTU"
            value={value.mtu.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, mtu: Number(e) }) }}
        />

        <SettingInputVertical
            label="Endpoint"
            value={value.endpoint}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, endpoint: e }) }}
        />

        <div className="mb-3">
            <label className="text-sm font-bold opacity-75 mb-2 block">EndpointPublicKey</label>
            <Textarea
                rows={3}
                value={value.endpointPublicKey}
                readOnly={!editable}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { onChange({ ...value, endpointPublicKey: e.target.value.replace(/\\n/g, "\n") }) }}
            />
        </div>

        <InputList
            title="LocalAddresses"
            data={value.localAddresses}
            disabled={!editable}
            onChange={(e) => { onChange({ ...value, localAddresses: e }) }}
        />
    </>
}
