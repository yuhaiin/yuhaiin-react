import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion"
import { Button } from "@/component/v2/button"
import { SettingInputBytes, SettingInputVertical } from "@/component/v2/forms"
import { InputList } from "@/component/v2/listeditor"
import { create } from "@bufbuild/protobuf"
import { Plus, Trash } from "lucide-react"
import { FC } from "react"
import { wireguard, wireguard_peer_config, wireguard_peer_configSchema } from "../pbes/node/protocol_pb"
import { Props } from "./tools"

const NewPeersList: FC<{ title: string, data: wireguard_peer_config[], onChange: (x: wireguard_peer_config[]) => void, editable?: boolean }> =
    ({ title, data, onChange, editable = true }) => {
        const removeItem = (index: number) => {
            if (!editable) return
            const next = [...data]
            next.splice(index, 1)
            onChange(next)
        }

        return (
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <h6 className="fw-bold mb-0 opacity-75">{title}</h6>
                    <small className="text-muted">{data.length} peers</small>
                </div>

                <Accordion type="multiple" className="mb-3">
                    {data.map((v, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                {v.endpoint || `Peer ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-1">
                                    <Peer value={v} editable={editable} onChange={(e) => {
                                        const next = [...data]
                                        next[index] = e
                                        onChange(next)
                                    }} />
                                    {editable && (
                                        <div className="d-flex justify-content-end mt-3 pt-3 border-top">
                                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                                                <Trash size={16} className="me-2" /> Delete Peer
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {editable && (
                    <div className="d-flex justify-content-end px-1">
                        <Button onClick={() => {
                            onChange([...data, create(wireguard_peer_configSchema, {
                                allowedIps: ["0.0.0.0/0"],
                                endpoint: "127.0.0.1:51820",
                                publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                            })])
                        }} >
                            <Plus className="me-1" size={16} /> Add Peer
                        </Button>
                    </div>
                )}
            </div>
        )
    }

const Peer: FC<Props<wireguard_peer_config>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Endpoint"
            value={value.endpoint}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, endpoint: e }) }}
        />

        <SettingInputVertical
            label="PublicKey"
            value={value.publicKey}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, publicKey: e }) }}
        />

        <InputList
            title="AllowedIps"
            data={value.allowedIps}
            disabled={!editable}
            onChange={(e) => { onChange({ ...value, allowedIps: e }) }}
        />
    </>
}

export const Wireguardv2: FC<Props<wireguard>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="SecretKey"
            value={value.secretKey}
            disabled={!editable}
            placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
            onChange={(e: string) => { onChange({ ...value, secretKey: e }) }}
        />

        <SettingInputVertical
            label="MTU"
            value={value.mtu.toString()}
            disabled={!editable}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, mtu: Number(e) }) }}
        />

        <SettingInputBytes
            label="Reserved"
            value={value.reserved}
            disabled={!editable}
            onChange={(x) => onChange({ ...value, reserved: x })}
        />

        <InputList
            title="Local Address"
            data={value.endpoint}
            disabled={!editable}
            onChange={(e) => { onChange({ ...value, endpoint: e }) }}
        />

        <NewPeersList
            title="Peers"
            data={value.peers}
            editable={editable}
            onChange={(e) => { onChange({ ...value, peers: e }) }}
        />
    </>
}