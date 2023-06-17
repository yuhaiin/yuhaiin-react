import { Form, Row, Col } from "react-bootstrap"

export const SettingInputText = (props: { label: string, value: string | number | undefined, plaintext?: boolean, onChange?: (x: string) => void }) => {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2} className="nowrap">{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Control value={props.value} plaintext={props.plaintext} onChange={(v) => props.onChange != undefined && props.onChange(v.target.value)} />
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