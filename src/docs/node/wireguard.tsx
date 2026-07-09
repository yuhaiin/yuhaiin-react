import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion"
import { Button } from "@/component/v2/button"
import { SettingInputBytes, SettingInputVertical } from "@/component/v2/forms"
import { InputList } from "@/component/v2/listeditor"
import { create } from "@/common/plain"
import { Plus, Trash } from "lucide-react"
import { FC } from "react"
import { wireguard, wireguard_peer_config, wireguard_peer_configSchema } from "../schema/node/protocol"
import { Props } from "./tools"

const NewPeersList: FC<{ title: string, data: wireguard_peer_config[], onChange: (x: wireguard_peer_config[]) => void, editable?: boolean }> =
    ({ title, data, onChange, editable = true }) => {
        const items = Array.isArray(data) ? data : [];
        const removeItem = (index: number) => {
            if (!editable) return
            const next = [...items]
            next.splice(index, 1)
            onChange(next)
        }

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h6 className="font-bold mb-0 opacity-75">{title}</h6>
                    <small className="text-gray-500 dark:text-gray-400">{items.length} peers</small>
                </div>

                <Accordion type="multiple" className="mb-3">
                    {items.map((v, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                {v.endpoint || `Peer ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-1">
                                    <Peer value={v} editable={editable} onChange={(e) => {
                                        const next = [...items]
                                        next[index] = e
                                        onChange(next)
                                    }} />
                                    {editable && (
                                        <div className="flex justify-end mt-3 pt-3">
                                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                                                <Trash size={16} className="mr-2" /> Delete Peer
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {editable && (
                    <div className="flex justify-end px-1">
                        <Button onClick={() => {
                            onChange([...items, create(wireguard_peer_configSchema, {
                                allowedIps: ["0.0.0.0/0"],
                                endpoint: "127.0.0.1:51820",
                                publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                            })])
                        }} >
                            <Plus className="mr-1" size={16} /> Add Peer
                        </Button>
                    </div>
                )}
            </div>
        )
    }

const Peer: FC<Props<wireguard_peer_config>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        endpoint: value?.endpoint ?? "",
        publicKey: value?.publicKey ?? "",
        allowedIps: Array.isArray(value?.allowedIps) ? value.allowedIps : [],
    };
    return <>
        <SettingInputVertical
            label="Endpoint"
            value={current.endpoint}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, endpoint: e }) }}
        />

        <SettingInputVertical
            label="PublicKey"
            value={current.publicKey}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, publicKey: e }) }}
        />

        <InputList
            title="AllowedIps"
            data={current.allowedIps}
            disabled={!editable}
            onChange={(e) => { onChange({ ...current, allowedIps: e }) }}
        />
    </>
}

export const Wireguardv2: FC<Props<wireguard>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        secretKey: value?.secretKey ?? "",
        mtu: typeof value?.mtu === "number" ? value.mtu : 0,
        reserved: value?.reserved ?? new Uint8Array(0),
        endpoint: Array.isArray(value?.endpoint) ? value.endpoint : [],
        peers: Array.isArray(value?.peers) ? value.peers : [],
    };
    return <>
        <SettingInputVertical
            label="SecretKey"
            value={current.secretKey}
            disabled={!editable}
            placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
            onChange={(e: string) => { onChange({ ...current, secretKey: e }) }}
        />

        <SettingInputVertical
            label="MTU"
            value={current.mtu.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...current, mtu: Number(e) }) }}
        />

        <SettingInputBytes
            label="Reserved"
            value={current.reserved}
            disabled={!editable}
            onChange={(x) => onChange({ ...current, reserved: x })}
        />

        <InputList
            title="Local Address"
            data={current.endpoint}
            disabled={!editable}
            onChange={(e) => { onChange({ ...current, endpoint: e }) }}
        />

        <NewPeersList
            title="Peers"
            data={current.peers}
            editable={editable}
            onChange={(e) => { onChange({ ...current, peers: e }) }}
        />
    </>
}
