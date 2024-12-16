import { FC, JSX } from "react";
import { ListGroup } from "react-bootstrap";
import { connection, type } from "../pbes/statistic/config_pb";

export const ListGroupItem = (props: { itemKey: string, itemValue: string, showModal?: (hash: string) => void }) => {
    return (
        <>
            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate">{props.itemKey}</div>

                    <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                        {
                            (props.itemKey !== "Hash" || !props.showModal) ? props.itemValue :
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
    return <>
        <ListGroup variant="flush">
            <ListGroupItem itemKey="Addr" itemValue={value.addr} />
            <ListGroupItem itemKey="Type" itemValue={type[value.type?.connType ?? 0]} />
            <ListGroupItem itemKey="Underlying" itemValue={type[value.type?.underlyingType ?? 0]} />

            {
                Object.entries(value.extra)
                    .sort((a, b) => { return a <= b ? -1 : 1 })
                    .map(([k, v]) => {
                        return <ListGroupItem itemKey={k} itemValue={v} key={k} showModal={showModal} />
                    })
            }

            {endContent}
        </ListGroup>
    </>
}