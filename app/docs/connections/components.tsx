import { DescField } from "@bufbuild/protobuf";
import { reflect, ReflectMessage } from "@bufbuild/protobuf/reflect";
import { FC, JSX } from "react";
import { ListGroup } from "react-bootstrap";
import { connection, connectionSchema } from "../pbes/statistic/config_pb";

export const ListGroupItem = (props: { itemKey: string, itemValue: string, showModal?: (hash: string) => void }) => {
    return (
        <>
            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate text-capitalize">{props.itemKey}</div>

                    <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                        {
                            (props.itemKey !== "hash" || !props.showModal) ? props.itemValue :
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); if (props.showModal) props.showModal(props.itemValue) }}
                                >
                                    {props.itemValue}
                                </a>
                        }
                    </div>
                </div>
            </ListGroup.Item>
        </>
    )
}

export const ConnectionInfo: FC<{ value: connection, endContent?: JSX.Element, showModal?: (hash: string) => void }> = ({ value, endContent, showModal }) => {

    function rangeInfo(d: connection) {
        const ref = reflect(connectionSchema, d)


        const getValueString = (f: DescField, ref: ReflectMessage) => {
            if (f.fieldKind === "enum") {
                const value: number = ref.get(f)
                return f.enum.value[value].name
            } else {
                const value = ref.get(f)
                if (!value) return undefined
                return value.toString()
            }
        }

        const Item: FC<{ f: DescField, ref: ReflectMessage }> = ({ f, ref }) => {
            const valueStr = getValueString(f, ref)
            if (!valueStr) return
            return <ListGroupItem itemKey={f.name.replaceAll("_", " ")} itemValue={valueStr} showModal={showModal} />
        }

        return <>
            {
                ref.fields.map((f) => {
                    if (f.fieldKind === "message") {
                        const value: ReflectMessage = ref.get(f)
                        return value.fields.map((f) => {
                            return <Item f={f} ref={value} key={f.name} />
                        })
                    }

                    return <Item f={f} ref={ref} key={f.name} />
                })
            }
        </>
    }

    return <>
        <ListGroup variant="flush">
            {rangeInfo(value)}
            {endContent}
        </ListGroup>
    </>
}