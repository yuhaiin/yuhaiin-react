import { InterfacesContext } from "@/common/interfaces";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Button } from "@/component/v2/button";
import { Remind, SettingCheck, SettingInputVertical } from "@/component/v2/forms";
import { create } from "@bufbuild/protobuf";
import { FC, useContext } from "react";
import { ArrowDown, ArrowUp, PlusLg, Trash } from "react-bootstrap-icons";
import { fixedv2, fixedv2_address, fixedv2_addressSchema } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Fixed: FC<Props<fixedv2>> = ({ value, onChange, editable = true }) => {
    return <>
        <Hosts data={value.addresses} editable={editable} onChange={(x) => onChange({ ...value, addresses: x })} />
        <SettingCheck label="UDP HappyEyeballs" checked={value.udpHappyEyeballs} disabled={!editable} onChange={() => { onChange({ ...value, udpHappyEyeballs: !value.udpHappyEyeballs }) }} />
    </>
}

export const Hosts: FC<{ data: fixedv2_address[], onChange: (x: fixedv2_address[]) => void, editable?: boolean }> =
    ({ data, onChange, editable = true }) => {
        const moveItem = (index: number, up: boolean) => {
            if (!editable) return
            if (data.length <= 1) return
            if (up && index === 0) return
            if (!up && index === data.length - 1) return
            const next = [...data]
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
            const next = [...data]
            next.splice(index, 1)
            onChange(next)
        }

        return <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <h6 className="fw-bold mb-0 opacity-75">Hosts</h6>
                <small className="text-muted">{data.length} entries</small>
            </div>

            <Accordion type="multiple" className="mb-3">
                {data.map((v, index) => (
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
                                        const next = [...data]
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
                                        const next = [...data]
                                        next[index] = { ...v, networkInterface: String(e) }
                                        onChange(next)
                                    }}
                                />

                                {editable && (
                                    <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                                        <Button size="sm" onClick={() => moveItem(index, true)} disabled={index === 0}>
                                            <ArrowUp />
                                        </Button>
                                        <Button size="sm" onClick={() => moveItem(index, false)} disabled={index === data.length - 1}>
                                            <ArrowDown />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                                            <Trash /> Delete
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
                        onChange([...data, create(fixedv2_addressSchema, {
                            host: "",
                            networkInterface: ""
                        })])
                    }} >
                        <PlusLg className="me-1" /> Add Host
                    </Button>
                </div>
            )}
        </div>
    }