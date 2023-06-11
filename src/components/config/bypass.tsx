import React, { useState } from 'react';
import { Form, FormGroup, InputGroup, Card, Row, Col, Button, Tabs, Tab, CloseButton, FloatingLabel } from 'react-bootstrap';

type BypassCustomRuleConfig = {
    hostname: string[],
    mode: string,
    tag: string,
    resolve_strategy: string,
}

export type BypassConfig = {
    tcp: string,
    udp: string,
    bypass_file: string,
    custom_rule_v3: BypassCustomRuleConfig[],
}

export const defaultBypassConfig: BypassConfig = {
    "tcp": "bypass",
    "udp": "bypass",
    "bypass_file": "yuhaiin.conf",
    "custom_rule_v3": []
}

const Bypass = React.memo((props: { bypass: BypassConfig, onChange: (x: BypassConfig) => void, }) => {

    const defaultRule = {
        "hostname": [
            "www.example.com"
        ],
        "mode": "proxy",
        "tag": "",
        "resolve_strategy": "default"
    }

    const updateState = (x: (x: BypassConfig) => void) => {
        let v = props.bypass;
        x(v)
        props.onChange(v)
    }

    return (
        <>

            <FloatingLabel label="TCP" className="mb-2" >
                <ModeSelect value={props.bypass.tcp} onChange={(v) => updateState((x) => x.tcp = v)} />
            </FloatingLabel>

            <FloatingLabel label="UDP" className="mb-2" >
                <ModeSelect value={props.bypass.udp} onChange={(v) => updateState((x) => x.udp = v)} />
            </FloatingLabel>

            <FloatingLabel label="Bypass File" className='mb-2'>
                <Form.Control value={props.bypass.bypass_file}
                    placeholder='yuhaiin.conf' onChange={(e) => updateState((x) => x.bypass_file = e.target.value)} />
            </FloatingLabel>
            {
                props.bypass.custom_rule_v3.map((value, index) => (
                    <Card className='mb-2' key={"custom_rule_v3" + index}>
                        <Card.Body>

                            <FloatingLabel
                                label="Mode"
                                className="mb-2"
                            >
                                <ModeSelect value={value.mode} network={false} onChange={(v) => updateState((x) => x.custom_rule_v3[index].mode = v)} />
                            </FloatingLabel>



                            <FloatingLabel
                                label="Tag"
                                className="mb-2"
                            >
                                <Form.Control value={value.tag}
                                    placeholder='tag1' onChange={(e) => updateState((x) => x.custom_rule_v3[index].tag = e.target.value)} />
                            </FloatingLabel>




                            <FloatingLabel
                                label="Resolve Strategy"
                                className="mb-2"
                            >
                                <Form.Select value={value.resolve_strategy} onChange={(e) => updateState((x) => x.custom_rule_v3[index].resolve_strategy = e.target.value)}>
                                    <option value="default">default</option>
                                    <option value="prefer_ipv4">prefer_ipv4</option>
                                    <option value="only_ipv4">only_ipv4</option>
                                    <option value="prefer_ipv6">prefer_ipv6</option>
                                    <option value="only_ipv6">only_ipv6</option>
                                </Form.Select>
                            </FloatingLabel>

                            {
                                value.hostname.map((v, index2) => {
                                    return (
                                        <InputGroup className="mb-2" key={"custom_rule_v3_rule_hosts" + index + "-" + index2}>
                                            <Form.Control value={v} onChange={(e) => updateState((x) => x.custom_rule_v3[index].hostname[index2] = e.target.value)} />
                                            <Button variant='outline-danger' onClick={() => updateState((x) => x.custom_rule_v3[index].hostname.splice(index2, 1))}>
                                                <i className="bi bi-x-lg"></i>
                                            </Button>

                                        </InputGroup>
                                    )
                                })
                            }
                            <div className="d-flex justify-content-between">
                                <Button variant='outline-danger' onClick={() => updateState((x) => x.custom_rule_v3.splice(index, 1))} >
                                    <i className="bi bi-x-lg" />Remove Current Rule
                                </Button>
                                <Button variant='outline-success' onClick={() => updateState((x) => x.custom_rule_v3[index].hostname.push("www.example.com"))} >
                                    <i className="bi bi-plus-lg" />New Domain
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            }
            <div className='d-flex mb-2'>
                <Button className='flex-grow-1' variant='outline-success'
                    onClick={() => updateState((x) => x.custom_rule_v3.push(defaultRule))} >
                    <i className="bi bi-plus-lg mb-2" />New Rule
                </Button>
            </div>
        </>
    )
})

function ModeSelect({ value = "bypass", network = true, onChange = (value: string) => { } }) {
    return (
        <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
            {network && <option value="bypass">BYPASS</option>}
            <option value="direct">DIRECT</option>
            <option value="proxy">PROXY</option>
            <option value="block">BLOCK</option>
        </Form.Select>
    )
}

export default Bypass;