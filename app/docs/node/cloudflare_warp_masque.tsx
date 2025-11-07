import { FC } from "react"
import { NewItemList, SettingInputText, SettingInputTextarea } from "../config/components"
import { cloudflare_warp_masque } from "../pbes/node/protocol_pb"
import { Props } from "./tools"

export const CloudflareWarpMasque: FC<Props<cloudflare_warp_masque>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="PrivateKey"
            value={value.privateKey}
            placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
            onChange={(e: string) => { onChange({ ...value, privateKey: e }) }}
        />

        <SettingInputText
            label="MTU"
            value={value.mtu}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, mtu: Number(e) }) }}
        />

        <SettingInputText
            label="Endpoint"
            value={value.endpoint}
            onChange={(e: string) => { onChange({ ...value, endpoint: e }) }}
        />

        <SettingInputTextarea
            label="EndpointPublicKey"
            value={value.endpointPublicKey}
            onChange={(e: string) => { onChange({ ...value, endpointPublicKey: e.replaceAll("\\n", "\n") }) }}
        />

        <NewItemList
            title="LocalAddresses"
            data={value.localAddresses}
            onChange={(e) => { onChange({ ...value, localAddresses: e }) }}
        />
    </>
}