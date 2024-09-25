import { Row, Form, Card, Col, InputGroup, Button, DropdownItem, ButtonGroup, DropdownMenu, Dropdown } from "react-bootstrap"
import React, { useState } from "react";

export class Remind {
    label: string
    label_children?: (string[] | null)
    value: string

    constructor(data: { label: string, label_children?: (string[] | null), value: string }) {
        this.label = data.label;
        this.value = data.value;
        this.label_children = data.label_children
    }
}

export const SettingInputText = React.memo((props: {
    label: string,
    value: string | number,
    url?: string,
    plaintext?: boolean,
    onChange?: (x: string) => void,
    reminds?: Remind[] | null,
    mb?: string,
    placeholder?: string,
    errorMsg?: string,
}) => {

    const dropdown = () => {
        if (!props.reminds || !props.reminds.length) return <></>

        return <Dropdown>
            <Dropdown.Toggle variant='outline-secondary' id="dropdown-basic" />
            <DropdownMenu style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {
                    props.reminds.map((v) => {
                        return <DropdownItem
                            key={v.value}
                            onClick={() => props.onChange && props.onChange(v.value)}>
                            <b>{v.label}</b>
                            {
                                v.label_children &&
                                v.label_children.map((vv) => {
                                    return <div key={vv}><span className="text-body-secondary">{vv}</span></div>
                                })
                            }
                        </DropdownItem>
                    })
                }
            </DropdownMenu>
        </Dropdown>
    }

    return (
        <Form.Group as={Row} className={props.mb ? props.mb : "mb-2"}>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <InputGroup className={props.mb ? props.mb : "mb-2"} hasValidation={props.errorMsg ? true : false}>
                    {dropdown()}
                    {props.url
                        ?
                        <a className="mt-1" href={props.url} target="_blank">{props.value}</a>
                        :
                        <>
                            <Form.Control
                                value={props.value}
                                plaintext={props.plaintext}
                                placeholder={props.placeholder}
                                isInvalid={props.errorMsg ? true : false}
                                onChange={(v) => { if (props.onChange) props.onChange(v.target.value) }}
                            />
                            {
                                props.errorMsg && <Form.Control.Feedback type="invalid">{props.errorMsg}</Form.Control.Feedback>
                            }
                        </>}

                </InputGroup>
            </Col>
        </Form.Group >
    )
})

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
    data: string[],
    onChange: (x: string[]) => void,
    errorMsgs?: { [key: string]: string }
}) {
    const [newData, setNewData] = useState({ value: "" });

    return (<Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>


        {
            props.data &&
            props.data.map((v, index) => {
                return (
                    <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                        <InputGroup className="mb-2" hasValidation={props.errorMsgs && props.errorMsgs[v] ? true : false}>
                            <Form.Control
                                onChange={(e) => {
                                    if (!props.data) return
                                    props.data[index] = e.target.value
                                    props.onChange(props.data)
                                }}
                                isInvalid={props.errorMsgs && props.errorMsgs[v] ? true : false}
                                value={v}
                            />


                            <Button variant='outline-danger' onClick={() => {
                                if (!props.data) return
                                props.data.splice(index, 1)
                                props.onChange(props.data)
                            }}>
                                <i className="bi bi-x-lg" ></i>
                            </Button>

                            {props.errorMsgs && props.errorMsgs[v] && <Form.Control.Feedback type="invalid">{props.errorMsgs[v]}</Form.Control.Feedback>}
                        </InputGroup>
                    </Col>
                )
            })
        }

        <Col sm={{ span: 10, offset: props.data?.length !== 0 ? 2 : 0 }}>
            <InputGroup className="mb-2" >
                <Form.Control value={newData.value} onChange={(e) => setNewData({ value: e.target.value })} />
                <Button variant='outline-success' onClick={() => {
                    props.data.push(newData.value)
                    props.onChange(props.data)
                }} >
                    <i className="bi bi-plus-lg" />
                </Button>
            </InputGroup>
        </Col>

    </Form.Group >)
}


export function NewBytesItemList(props: {
    title: string,
    data: Uint8Array[] | undefined,
    onChange: (x: Uint8Array[]) => void,
    textarea?: boolean
}) {
    const [newData, setNewData] = useState({ value: "" });

    return (<Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>


        {
            props.data && props.data
                .map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={"bi-" + index} >
                            <InputGroup className="mb-2" >
                                <Form.Control
                                    value={new TextDecoder().decode(v)}
                                    as={props.textarea ? "textarea" : undefined}
                                    onChange={(e) => {
                                        props.data![index] = new TextEncoder().encode(e.target.value)
                                        props.onChange(props.data ? props.data : [])
                                    }}
                                />
                                <Button
                                    variant='outline-danger'
                                    onClick={() => {
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
                <Form.Control
                    as={props.textarea ? "textarea" : undefined}
                    value={newData.value}
                    onChange={(e) => setNewData({ value: e.target.value })}
                />
                <Button variant='outline-success' onClick={() => {
                    let data = new TextEncoder().encode(newData.value);

                    if (!props.data) props.data = [data]
                    else props.data.push(data)

                    props.onChange(props.data);
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

    return <Form.Group as={Row} className={props.mb ? props.mb : "mb-2"}>

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

    </Form.Group>
}


export class MoveUpDown {
    length: number
    current: number
    onmove: (up: boolean) => void


    constructor(length: number, current: number, onmove: (up: boolean) => void) {
        this.length = length
        this.current = current
        this.onmove = onmove
    }
}

export const Container = (props: {
    title: string,
    onClose?: () => void,
    hideClose?: boolean,
    moveUpDown?: MoveUpDown,
    children: JSX.Element
}) => {
    return <>
        <Card className="flex-grow-1 form-floating">
            <Card.Header className="d-flex justify-content-between">
                {props.title}

                {
                    (!props.hideClose || (props.moveUpDown?.length ?? 0) > 1) &&
                    <ButtonGroup>
                        {
                            ((props.moveUpDown?.length ?? 0) > 1) &&
                            <>
                                {props.moveUpDown?.current != 0 &&
                                    <Button variant="outline-primary" size="sm" onClick={() => props.moveUpDown!!.onmove(true)}><i className="bi bi-arrow-up"></i></Button>}
                                {props.moveUpDown?.current != props.moveUpDown!!.length - 1 &&
                                    <Button variant="outline-primary" size="sm" onClick={() => props.moveUpDown!!.onmove(false)}><i className="bi bi-arrow-down"></i></Button>}

                            </>
                        }
                        {!props.hideClose &&
                            <Button variant='outline-danger' size="sm" onClick={props.onClose}><i className="bi bi-x-lg"></i></Button>
                        }
                    </ButtonGroup>
                }
            </Card.Header>
            <Card.Body>
                {props.children}
            </Card.Body>
        </Card>
        <br />
    </>
}
