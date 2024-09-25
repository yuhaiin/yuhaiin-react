import { DescEnum, DescEnumValue } from '@bufbuild/protobuf';
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const SwitchSelect = (props: { value: boolean, onChange: (x: boolean) => void }) => {
    return (
        <Form.Select value={props.value ? "true" : "false"} onChange={(e) => props.onChange(e.target.value == "true" ? true : false)}>
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </Form.Select>
    )
}

export const SettingCheck = (props: { label: string, checked: boolean, onChange: () => void }) => {
    return (
        <Form.Group as={Row} className='mb-2'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10} className='d-flex align-items-center'>
                <Form.Check className='d-flex align-items-center' type='switch' checked={props.checked} onChange={() => props.onChange()} />
            </Col>
        </Form.Group>
    )
}


export function SettingTypeSelect(props: {
    label: string,
    type: DescEnum,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: DescEnumValue) => boolean
}) {
    return <Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2}>{props.label}</Form.Label>
        <Col sm={10}>
            <Form.Select value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))} >
                {
                    props.type.values.
                        filter(props.filter ?? (() => true)).
                        map((v) => <option key={v.number} value={v.number}>{v.name}</option>)
                }
            </Form.Select>
        </Col>
    </Form.Group >
}



export default SwitchSelect;