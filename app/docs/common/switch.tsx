import { DescEnum, DescEnumValue } from '@bufbuild/protobuf';
import React, { FC, useCallback, useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import styles from '../bypass/list/list.module.css';

export const SwitchSelect = (props: { value: boolean, onChange: (x: boolean) => void }) => {
    return (
        <Form.Select value={props.value ? "true" : "false"} onChange={(e) => props.onChange(e.target.value == "true" ? true : false)}>
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </Form.Select>
    )
}


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


export const SettingInputVertical: FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}> = React.memo(({ label, value, onChange, placeholder, className }) => {
    return (
        <div className={className}>
            <label className={styles.settingLabel}>{label}</label>
            <Form.Control
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
});

export const SettingSelectVertical: FC<{
    label: string;
    value: string;
    values: string[];
    onChange: (val: string) => void;
    emptyChoose?: boolean;
    emptyChooseName?: string;
    className?: string;
}> = React.memo(({ label, value, values, onChange, emptyChoose, emptyChooseName, className }) => {
    return (
        <div className={className}>
            <label className={styles.settingLabel}>{label}</label>
            <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
                {emptyChoose && <option value="">{emptyChooseName ?? "Choose..."}</option>}
                {values.map((v) => (
                    <option key={v} value={v}>{v}</option>
                ))}
            </Form.Select>
        </div>
    );
});

export const SettingEnumSelectVertical: FC<{
    label: string;
    type: any; // Protobuf Enum Schema
    value: number;
    onChange: (val: number) => void;
    filter?: (v: any) => boolean;
    format?: (v: number) => string;
    emptyChoose?: boolean;
    className?: string;
}> = React.memo(({ label, type, value, onChange, filter, format, emptyChoose, className }) => {

    const options = useMemo(() => {
        let values = type.values;
        if (filter) values = values.filter(filter);
        return values;
    }, [type, filter]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(Number(e.target.value));
    }, [onChange]);

    return (
        <div className={className}>
            <label className={styles.settingLabel}>{label}</label>
            <Form.Select value={value} onChange={handleChange}>
                {emptyChoose && <option value="">Choose...</option>}
                {options.map((v: any) => (
                    <option key={v.number} value={v.number}>
                        {format ? format(v.number) : v.name}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
});

export const SettingSwitchCard: FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
    className?: string;
}> = React.memo(({ label, description, checked, onChange, className }) => {
    return (
        <div
            className={`${styles.listItem} justify-content-between py-3 ${className || ''}`}
            onClick={onChange}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(); }}
        >
            <div className="d-flex flex-column">
                <span className="fw-medium">{label}</span>
                {description && <small className="text-muted" style={{ fontSize: '0.8rem' }}>{description}</small>}
            </div>
            <Form.Check
                type="switch"
                className="fs-5"
                checked={checked}
                onChange={() => { }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
});