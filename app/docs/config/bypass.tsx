import React, { useState } from 'react';
import { Form, InputGroup, Row, Col, Button, } from 'react-bootstrap';
import { SettingInputText } from './components';
import {
    bypass_config as BypassConfig,
    mode as BypassMode,
    mode_config as CustomRule,
    resolve_strategy as ResolveStrategy,
    modeToJSON as BypassModeToJson,
    modeFromJSON as BypassModeFromJson,
    resolve_strategyToJSON as ResolveStrategyToJSON,
    resolve_strategyFromJSON as ResolveStrategyFromJSON,
} from '../protos/config/bypass/bypass';
import { produce } from 'immer';

export const defaultBypassConfig: BypassConfig = {
    tcp: BypassMode.bypass,
    udp: BypassMode.bypass,
    bypass_file: "yuhaiin.conf",
    custom_rule_v3: []
}

const Bypass = React.memo((props: { bypass: BypassConfig, onChange: (x: BypassConfig) => void, }) => {

    const defaultRule: CustomRule = {
        hostname: ["www.example.com"],
        mode: BypassMode.proxy,
        tag: "",
        resolve_strategy: ResolveStrategy.default
    }

    const updateState = (x: (x: BypassConfig) => void) => {
        props.onChange(produce(props.bypass, (v) => { x(v) }))
    }



    return (
        <>

            <SettingModeSelect label='TCP' network={true} value={props.bypass.tcp} onChange={(v) => updateState((x) => x.tcp = v)} />
            <SettingModeSelect label='UDP' network={true} value={props.bypass.udp} onChange={(v) => updateState((x) => x.udp = v)} />
            <SettingInputText label='Bypass File' value={props.bypass.bypass_file} onChange={(e) => updateState((x) => x.bypass_file = e)} />

            <hr />

            Custom Rules
            {
                props.bypass.custom_rule_v3.map((value, index) => (

                    <div className='mb-3' key={"custom_rule_v3" + index}>

                        <hr />

                        <BypassSingleComponents config={value} onChange={(e) => updateState((x) => x.custom_rule_v3[index] = e)} />


                        <Button variant='outline-danger' onClick={() => updateState((x) => x.custom_rule_v3.splice(index, 1))} >
                            <i className="bi bi-x-lg" />Remove Current Rule
                        </Button>
                    </div>
                ))
            }

            <hr />

            <div className='d-flex mb-2'>
                <Button className='flex-grow-1' variant='outline-success'
                    onClick={() => updateState((x) => x.custom_rule_v3.push(defaultRule))} >
                    <i className="bi bi-plus-lg mb-2" />New Rule
                </Button>
            </div>
        </>
    )
})

const BypassSingleComponents = (props: { config: CustomRule, onChange: (x: CustomRule) => void }) => {
    const updateState = (x: (v: CustomRule) => void) => {
        props.onChange(produce(props.config, (v) => { x(v) }))
    }

    const [newDomain, setNewDomain] = useState({ value: "" });

    return (
        <>

            <SettingModeSelect label='Mode' network={false} value={props.config.mode} onChange={(v) => updateState((x) => x.mode = v)} />
            <SettingInputText label='Tag' value={props.config.tag} onChange={(e) => updateState((x) => x.tag = e)} />
            <SettingResolveStrategySelect label='Resolve Strategy' value={props.config.resolve_strategy} onChange={(e) => updateState((x) => x.resolve_strategy = e)} />

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">IP/DOMAIN</Form.Label>


                {
                    props.config.hostname.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v} onChange={(e) => updateState((x) => x.hostname[index] = e.target.value)} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => x.hostname.splice(index, 1))}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.config.hostname.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newDomain.value} onChange={(e) => setNewDomain({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => updateState((x) => x.hostname.push(newDomain.value))} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>

            </Form.Group>
        </>
    )
}

function SettingModeSelect(props: { label: string, network: boolean, value: BypassMode, onChange: (value: BypassMode) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={BypassModeToJson(props.value)} onChange={(e) => props.onChange(BypassModeFromJson(e.target.value))}>
                    {props.network && <option value={BypassModeToJson(BypassMode.bypass)}>BYPASS</option>}
                    <option value={BypassModeToJson(BypassMode.direct)}>DIRECT</option>
                    <option value={BypassModeToJson(BypassMode.proxy)}>PROXY</option>
                    <option value={BypassModeToJson(BypassMode.block)}>BLOCK</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}


function SettingResolveStrategySelect(props: { label: string, value: ResolveStrategy, onChange: (value: ResolveStrategy) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={ResolveStrategyToJSON(props.value)} onChange={(e) => props.onChange(ResolveStrategyFromJSON(e.target.value))}>
                    <option value={ResolveStrategyToJSON(ResolveStrategy.default)}>default</option>
                    <option value={ResolveStrategyToJSON(ResolveStrategy.prefer_ipv4)}>prefer_ipv4</option>
                    <option value={ResolveStrategyToJSON(ResolveStrategy.only_ipv4)}>only_ipv4</option>
                    <option value={ResolveStrategyToJSON(ResolveStrategy.prefer_ipv6)}>prefer_ipv6</option>
                    <option value={ResolveStrategyToJSON(ResolveStrategy.only_ipv6)}>only_ipv6</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}
export default Bypass;