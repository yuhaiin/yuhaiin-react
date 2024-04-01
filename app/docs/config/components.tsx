import { Row, Form, Col, InputGroup, Button, DropdownMenu, DropdownItem, DropdownButton } from "react-bootstrap"
import { useState } from "react";

export class Remind {
    label: string
    label_children?: (string[] | null)
    value: string
}

export const SettingInputText = (props: {
    label: string,
    value?: string | number | null,
    url?: string,
    plaintext?: boolean,
    onChange?: (x: string) => void,
    reminds?: Remind[] | null,
    mb?: string,
}) => {

    const dropdown = () => {
        if (!props.reminds || !props.reminds.length) return <></>

        return <DropdownButton variant='outline-secondary' title={""} >
            {
                props.reminds.map((v) => {
                    return <DropdownItem
                        key={v.value}
                        onClick={() => props.onChange && props.onChange(v.value)}>
                        <b>{v.label}</b>
                        {
                            v.label_children &&
                            v.label_children.map((vv) => { return <div key={vv}><span className="text-body-secondary">{vv}</span></div> })
                        }
                    </DropdownItem>
                })
            }
        </DropdownButton>

    }
    return (
        <Form.Group as={Row} className={props.mb ? props.mb : "mb-2"}>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <InputGroup className={props.mb ? props.mb : "mb-2"}>
                    {dropdown()}
                    {props.url
                        ?
                        <a className="mt-1" href={props.url} target="_blank">{props.value}</a>
                        :
                        <>
                            <Form.Control
                                value={props.value !== null ? props.value : ""}
                                plaintext={props.plaintext}
                                onChange={(v) => props.onChange !== undefined && props.onChange(v.target.value)}
                            />
                        </>}

                </InputGroup>
            </Col>
        </Form.Group >
    )
}

export const SettingInputTextarea = (props: { label: string, value: string | number | undefined, onChange: (x: string) => void }) => {
    return (
        <Form.Group as={Row} className='mb-2'>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Control as="textarea" rows={5} value={props.value} onChange={(v) => props.onChange(v.target.value)} />
            </Col>
        </Form.Group>
    )
}

export function NewItemList(props: {
    title: string,
    data: string[] | undefined,
    onChange: (x: string[]) => void
}) {
    const [newData, setNewData] = useState({ value: "" });

    return (<Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>


        {
            props.data && props.data
                .map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                            <InputGroup className="mb-2" >
                                <Form.Control value={v} onChange={(e) => {
                                    props.data![index] = e.target.value
                                    props.onChange(props.data ? props.data : [])
                                }} />
                                <Button variant='outline-danger' onClick={() => {
                                    if (props.data) {
                                        props.data.splice(index, 1)
                                        props.onChange(props.data)
                                    }
                                }}>
                                    <i className="bi bi-x-lg" ></i>
                                </Button>
                            </InputGroup>
                        </Col>
                    )
                })
        }

        <Col sm={{ span: 10, offset: props.data?.length !== 0 ? 2 : 0 }}>
            <InputGroup className="mb-2" >
                <Form.Control value={newData.value} onChange={(e) => setNewData({ value: e.target.value })} />
                <Button variant='outline-success' onClick={() => {
                    if (!props.data)
                        props.onChange([newData.value])
                    else {
                        props.data.push(newData.value)
                        props.onChange(props.data)
                    }
                }} >
                    <i className="bi bi-plus-lg" />
                </Button>
            </InputGroup>
        </Col>

    </Form.Group>)
}


export function ItemList(props: {
    title: string,
    mb?: string,
    data: string[] | null | undefined,
}) {

    return (<Form.Group as={Row} className={props.mb ? props.mb : "mb-2"}>
        <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>

        <Col sm={{ span: 10, offset: 0 }}>
            <InputGroup className={props.mb ? props.mb : "mb-2"} ></InputGroup>
        </Col>

        {
            props.data && props.data
                .map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: 2 }} className="mt-0" key={index} >
                            <InputGroup className={props.mb ? props.mb : "mb-2"} >
                                {v}
                            </InputGroup>
                        </Col>
                    )
                })
        }

    </Form.Group>)
}