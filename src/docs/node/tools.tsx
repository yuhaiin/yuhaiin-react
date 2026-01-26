import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion"
import { Button } from "@/component/v2/button"
import { SettingInputVertical } from "@/component/v2/forms"
import { create } from "@bufbuild/protobuf"
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react"
import { FC } from "react"
import { host, hostSchema } from "../pbes/node/protocol_pb"

export type Props<T> = {
    value: T,
    onChange: (x: T) => void,
    editable?: boolean
}

export const NewAlternateHostList: FC<{ title: string, data: host[], onChange: (x: host[]) => void, editable?: boolean }> =
    ({ title, data, onChange, editable = true }) => {
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
                    <small className="text-muted">{data.length} entries</small>
                </div>

                <Accordion type="multiple" className="mb-3">
                    {data.map((v, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                {v.host || `Entry ${index + 1}`} {v.port ? `:${v.port}` : ''}
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
                                        label="Port"
                                        value={v.port}
                                        disabled={!editable}
                                        onChange={(e) => {
                                            const port = Number(e)
                                            if (isNaN(port) || port < 0 || port > 65535) return
                                            const next = [...data]
                                            next[index] = { ...v, port }
                                            onChange(next)
                                        }}
                                    />

                                    {editable && (
                                        <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                                            <Button size="sm" onClick={() => moveItem(index, true)} disabled={index === 0}>
                                                <ArrowUp size={16} />
                                            </Button>
                                            <Button size="sm" onClick={() => moveItem(index, false)} disabled={index === data.length - 1}>
                                                <ArrowDown size={16} />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                                                <Trash size={16} /> Delete
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
                        <Button onClick={() => { onChange([...data, create(hostSchema, {})]) }} >
                            <Plus className="me-1" size={16} /> Add {title}
                        </Button>
                    </div>
                )}
            </div>
        )
    }