import { SettingLabel } from '@/app/component/cardlist';
import styles from '@/app/component/list.module.css';
import { DescEnum, DescEnumValue } from '@bufbuild/protobuf';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';

export const SwitchSelect = (props: { value: boolean, onChange: (x: boolean) => void }) => {
    return (
        <Form.Select value={props.value ? "true" : "false"} onChange={(e) => props.onChange(e.target.value == "true" ? true : false)}>
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </Form.Select>
    )
}

export const FilterTypeSelect: FC<{
    type: DescEnum,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: DescEnumValue) => boolean
    format?: (v: DescEnumValue) => string,
}> = ({ ...props }) => {
    const change = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => props.onChange(Number(e.target.value)), [props])
    const types = useMemo(() => props.type.values.filter(props.filter ?? (() => true)), [props.type, props.filter])
    return <Form.Select
        size="sm"
        value={props.value}
        onChange={change}
        className={styles.filterSelect}
        style={{ width: 'auto' }}
    >
        {types.map((v) => (
            <option key={v.number} value={v.number}>
                {props.format ? props.format(v) : v.name}
            </option>
        ))}
    </Form.Select>
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
            <SettingLabel>{label}</SettingLabel>
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
            <SettingLabel>{label}</SettingLabel>
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
            <SettingLabel>{label}</SettingLabel>
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
                style={{ pointerEvents: 'none' }}
                checked={checked}
                onChange={() => { }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
});

// --- 5. Universal Vertical Range Slider ---
export const SettingRangeVertical: FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string; // e.g., "Bytes", "Slots", "ms"
    onChange: (val: number) => void;
    className?: string;
}> = React.memo(({ label, value, min, max, step, unit, onChange, className }) => {
    return (
        <div className={className}>
            {/* Header: Label on left, Current Value on right */}
            <div className="d-flex justify-content-between align-items-center mb-1">
                <SettingLabel className={"mb-0"}>{label}</SettingLabel>
                <div className="text-primary fw-bold font-monospace small bg-primary bg-opacity-10 px-2 py-1 rounded">
                    {value.toLocaleString()} {unit}
                </div>
            </div>

            <Form.Range
                value={value}
                min={min}
                max={max}
                step={step}
                className="my-2"
                onChange={(e) => onChange(Number(e.target.value))}
            />

            {/* Footer: Min and Max indicators */}
            <div className="d-flex justify-content-between text-muted opacity-50" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                <span>MIN: {min.toLocaleString()}</span>
                <span>MAX: {max.toLocaleString()}</span>
            </div>
        </div>
    );
});

// --- 6. Vertical Password Input with Toggle ---
export const SettingPasswordVertical: FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}> = React.memo(({ label, value, onChange, placeholder, className }) => {
    const [show, setShow] = useState(false);

    return (
        <div className={className}>
            <SettingLabel>{label}</SettingLabel>
            <InputGroup>
                <Form.Control
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="border-end-0" // Remove border between input and button
                />
                <Button
                    variant="outline-secondary"
                    className="border-start-0 px-3" // Remove border and add padding
                    onClick={() => setShow(!show)}
                    style={{ background: 'transparent' }}
                >
                    <i className={`bi bi-eye${show ? '-slash' : ''}`}></i>
                </Button>
            </InputGroup>
        </div>
    );
});
