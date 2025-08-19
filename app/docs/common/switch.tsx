import { DescEnum, DescEnumValue } from '@bufbuild/protobuf';
import React, { FC, useCallback, useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

export const SwitchSelect = (props: { value: boolean, onChange: (x: boolean) => void }) => {
    return (
        <Form.Select value={props.value ? "true" : "false"} onChange={(e) => props.onChange(e.target.value == "true" ? true : false)}>
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </Form.Select>
    )
}

const SettingCheckComponent: FC<{ label: string, checked: boolean, onChange: (c: boolean) => void, className?: string }> =
    ({ label, checked, onChange, className }) => {
        const change = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)
        return (
            <Form.Group as={Row} className={className}>
                <Form.Label column sm={2}>{label}</Form.Label>
                <Col sm={10} className='d-flex align-items-center'>
                    <Form.Check className='d-flex align-items-center' type='switch' checked={checked} onChange={change} />
                </Col>
            </Form.Group>
        )
    }

export const SettingCheck = React.memo(SettingCheckComponent)

const SettingTypeSelectComponent: FC<{
    label?: string,
    type: DescEnum,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: DescEnumValue) => boolean
    format?: (v: number) => string,
    emptyChoose?: boolean,
    lastElem?: boolean
}> = ({ ...props }) => {
    const change = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => props.onChange(Number(e.target.value)), [props])
    const types = useMemo(() => props.type.values.filter(props.filter ?? (() => true)), [props.type, props.filter])

    const EmptyChoose = () => {
        return props.emptyChoose ? <option value="">Choose...</option> : <></>
    }
    return <Form.Group as={Row} className={!props.lastElem ? 'mb-2' : ''}>
        {props.label && <Form.Label column sm={2}>{props.label}</Form.Label>}
        <Col sm={10}>
            <Form.Select value={props.value} onChange={change} >
                <EmptyChoose />
                {
                    types.map((v) =>
                        <option key={v.number} value={v.number}>
                            {props.format ? props.format(v.number) : v.name}
                        </option>
                    )
                }
            </Form.Select>
        </Col>
    </Form.Group >
}

export const SettingTypeSelect = React.memo(SettingTypeSelectComponent)

const SettingSelectComponent: FC<{
    label: string,
    value: string,
    values: string[],
    onChange: (x: string) => void,
    emptyChoose?: boolean,
    emptyChooseName?: string
    lastElem?: boolean
}> =
    ({ label, values, onChange, value, emptyChoose, emptyChooseName, lastElem: last }) => {
        return (
            <Form.Group as={Row} className={!last ? 'mb-2' : ''}>
                <Form.Label column sm={2}>{label}</Form.Label>
                <Col sm={10}>
                    <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
                        {emptyChoose && <option value="">{emptyChooseName ?? "Choose..."}</option>}
                        {
                            values.map((v) => <option key={v} value={v}>{v}</option>)
                        }
                    </Form.Select>
                </Col>
            </Form.Group>
        )
    }

export const SettingSelect = React.memo(SettingSelectComponent)

const FormSelectComponent: FC<{
    value: string,
    values: string[] | [string, string][],
    onChange: (x: string) => void,
    format?: (v: string) => string,
    emptyChoose?: boolean,
    emptyChooseName?: string
}> =
    ({ values, onChange, value, emptyChoose, format, emptyChooseName }) => {
        return (
            <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
                {emptyChoose && <option value="">{emptyChooseName ?? "Choose..."}</option>}
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

export const FormSelect = React.memo(FormSelectComponent)