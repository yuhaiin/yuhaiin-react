import { Row, Form, Col, InputGroup, Button } from "react-bootstrap"
import { useState } from "react";


export const SettingInputText = (props: { label: string, value?: string | number | null, plaintext?: boolean, onChange?: (x: string) => void }) => {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Control value={props.value !== null ? props.value : ""} plaintext={props.plaintext} onChange={(v) => props.onChange !== undefined && props.onChange(v.target.value)} />
            </Col>
        </Form.Group>
    )
}

export const SettingInputTextarea = (props: { label: string, value: string | number | undefined, onChange: (x: string) => void }) => {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Control as="textarea" rows={5} value={props.value} onChange={(v) => props.onChange(v.target.value)} />
            </Col>
        </Form.Group>
    )
}

export const SettingCheck = (props: { label: string, checked: boolean, onChange: () => void }) => {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10} className='d-flex align-items-center'>
                <Form.Check className='d-flex align-items-center' type='switch' checked={props.checked} onChange={() => props.onChange()} />
            </Col>
        </Form.Group>
    )
}

export function NewItemList(props: {
    title: string,
    data: string[] | null | undefined,
    onChange: (x: string[] | null | undefined) => void
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
                                    props.onChange(props.data)
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