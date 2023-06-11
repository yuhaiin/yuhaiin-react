import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

const SwitchSelect = (props: { value: boolean, onChange: (x: boolean) => void }) => {
    return (
        <Form.Select value={props.value ? "true" : "false"} onChange={(e) => props.onChange(e.target.value == "true" ? true : false)}>
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </Form.Select>
    )
}

export default SwitchSelect;