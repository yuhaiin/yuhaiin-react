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

export default SwitchSelect;