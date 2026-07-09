import { InterfacesContext } from "@/common/interfaces";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Button } from "@/component/v2/button";
import { Remind, SettingCheck, SettingInputVertical } from "@/component/v2/forms";
import { create } from "@/common/plain";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { FC, useContext } from "react";
import { fixedv2, fixedv2_address, fixedv2_addressSchema } from "../schema/node/protocol";
import { Props } from "./tools";

export const Fixed: FC<Props<fixedv2>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        addresses: Array.isArray(value?.addresses) ? value.addresses : [],
        udpHappyEyeballs: Boolean(value?.udpHappyEyeballs),
    };
    return <>
        <Hosts data={current.addresses} editable={editable} onChange={(x) => onChange({ ...current, addresses: x })} />
        <SettingCheck label="UDP HappyEyeballs" checked={current.udpHappyEyeballs} disabled={!editable} onChange={() => { onChange({ ...current, udpHappyEyeballs: !current.udpHappyEyeballs }) }} />
    </>
}

export const Hosts: FC<{ data: fixedv2_address[], onChange: (x: fixedv2_address[]) => void, editable?: boolean }> =
    ({ data, onChange, editable = true }) => {
        const items = Array.isArray(data) ? data : [];
        const moveItem = (index: number, up: boolean) => {
            if (!editable) return
            if (items.length <= 1) return
            if (up && index === 0) return
            if (!up && index === items.length - 1) return
            const next = [...items]
            const tmp = next[index]
            next[index] = next[index + (up ? -1 : 1)]
            next[index + (up ? -1 : 1)] = tmp
            onChange(next)
        }
        const interfaces = useContext(InterfacesContext);

        const reminds = interfaces.map((v) => {
            if (!v.name) return undefined
            const r: Remind = {
                label: v.name,
                value: v.name,
                label_children: v.addresses?.map((vv) => !vv ? "" : vv)
            }
            return r
        })
            .filter((e): e is Exclude<Remind, null | undefined> => !!e)

        const removeItem = (index: number) => {
            if (!editable) return
            const next = [...items]
            next.splice(index, 1)
            onChange(next)
        }

        return <div className="mb-4">
            <div className="flex justify-between items-center mb-2 px-1">
                <h6 className="font-bold mb-0 opacity-75">Hosts</h6>
                <small className="text-gray-500 dark:text-gray-400">{items.length} entries</small>
            </div>

            <Accordion type="multiple" className="mb-3">
                {items.map((v, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                            {v.host || `Host ${index + 1}`}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-1">
                                <SettingInputVertical
                                    label="Host"
                                    value={v.host}
                                    disabled={!editable}
                                    onChange={(e: string) => {
                                        const next = [...items]
                                        next[index] = { ...v, host: e }
                                        onChange(next)
                                    }}
                                />

                                <SettingInputVertical
                                    label="Network Interface"
                                    value={v.networkInterface}
                                    reminds={reminds}
                                    disabled={!editable}
                                    onChange={(e) => {
                                        const next = [...items]
                                        next[index] = { ...v, networkInterface: String(e) }
                                        onChange(next)
                                    }}
                                />

                                {editable && (
                                    <div className="flex justify-end gap-2 mt-3 pt-3">
                                    <Button size="sm" onClick={() => moveItem(index, true)} disabled={index === 0}>
                                        <ArrowUp size={16} />
                                    </Button>
                                    <Button size="sm" onClick={() => moveItem(index, false)} disabled={index === items.length - 1}>
                                        <ArrowDown size={16} />
                                    </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                                            <Trash size={16} className="mr-2" /> Delete
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
                        onChange([...items, create(fixedv2_addressSchema, {
                            host: "",
                            networkInterface: ""
                        })])
                    }} >
                        <Plus className="mr-1" size={16} /> Add Host
                    </Button>
                </div>
            )}
        </div>
    }
