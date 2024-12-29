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

export const SettingTypeSelect: FC<{
    label: string,
    type: DescEnum,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: DescEnumValue) => boolean
    format?: (v: number) => string
}> = ({ ...props }) => {
    return <Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2}>{props.label}</Form.Label>
        <Col sm={10}>
            <Form.Select value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))} >
                {
                    props.type.values.
                        filter(props.filter ?? (() => true)).
                        map((v) => <option key={v.number} value={v.number}>{props.format ? props.format(v.number) : v.name}</option>)
                }
            </Form.Select>
        </Col>
    </Form.Group >
}

export const SettingSelect: FC<{ label: string, value: string, values: string[], onChange: (x: string) => void, emptyChoose?: boolean }> =
    ({ label, values, onChange, value, emptyChoose }) => {
        return (
            <Form.Group as={Row} className='mb-2'>
                <Form.Label column sm={2}>{label}</Form.Label>
                <Col sm={10}>
                    <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
                        {emptyChoose && <option value="">Choose...</option>}
                        {
                            values.map((v) => <option key={v} value={v}>{v}</option>)
                        }
                    </Form.Select>
                </Col>
            </Form.Group>
        )
    }


export const FormSelect: FC<{ value: string, values: string[] | [string, string][], onChange: (x: string) => void, format?: (v: string) => string, emptyChoose?: boolean }> =
    ({ values, onChange, value, emptyChoose, format }) => {
        return (
            <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
                {emptyChoose && <option value="">Choose...</option>}
                {
                    values.map((value: string | [string, string]) => {
                        const k = typeof value == "string" ? value : value[0]
                        const v = typeof value == "string" ? value : value[1]
                        return <option key={k} value={v}>{format ? format(k) : k}</option>
                    })

                }
            </Form.Select>
        )
    }