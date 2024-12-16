import { DescEnum, DescEnumValue } from '@bufbuild/protobuf';
import { FC } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

export const SwitchSelect = (props: { value: boolean, onChange: (x: boolean) => void }) => {
    return (
        <Form.Select value={props.value ? "true" : "false"} onChange={(e) => props.onChange(e.target.value == "true" ? true : false)}>
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </Form.Select>
    )
}

export const SettingCheck: FC<{ label: string, checked: boolean, onChange: (c: boolean) => void }> =
    ({ label, checked, onChange }) => {
        return (
            <Form.Group as={Row} className='mb-2'>
                <Form.Label column sm={2}>{label}</Form.Label>
                <Col sm={10} className='d-flex align-items-center'>
                    <Form.Check className='d-flex align-items-center' type='switch' checked={checked} onChange={(e) => onChange(e.target.checked)} />
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
