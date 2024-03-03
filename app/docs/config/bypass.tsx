import React, { useState } from 'react';
import { Form, InputGroup, Row, Col, Button, } from 'react-bootstrap';
import { SettingInputText, NewItemList } from './components';
import { yuhaiin as cp } from '../pbts/config';

const BypassMode = cp.bypass.mode;
const ResolveStrategy = cp.bypass.resolve_strategy;

export const defaultBypassConfig: cp.bypass.Ibypass_config = {
    tcp: BypassMode.bypass,
    udp: BypassMode.bypass,
    bypass_file: "yuhaiin.conf",
    custom_rule_v3: []
}

const Bypass = React.memo((props: { bypass: cp.bypass.bypass_config, onChange: (x: cp.bypass.bypass_config) => void, }) => {

    const defaultRule: cp.bypass.Imode_config = {
        hostname: ["www.example.com"],
        mode: BypassMode.proxy,
        tag: "",
        resolve_strategy: ResolveStrategy.default
    }

    const updateState = (x: (x: cp.bypass.bypass_config) => void) => {
        x(props.bypass)
        props.onChange(props.bypass)
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

                        <BypassSingleComponents config={new cp.bypass.mode_config(value)} onChange={(e) => updateState((x) => x.custom_rule_v3[index] = e)} />


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

const BypassSingleComponents = (props: { config: cp.bypass.mode_config, onChange: (x: cp.bypass.mode_config) => void }) => {
    const updateState = (x: (v: cp.bypass.mode_config) => void) => {
        x(props.config)
        props.onChange(props.config)
    }

    return (
        <>

            <SettingModeSelect label='Mode' network={false} value={props.config.mode} onChange={(v) => updateState((x) => x.mode = v)} />
            <SettingInputText label='Tag' value={props.config.tag} onChange={(e) => updateState((x) => x.tag = e)} />
            <SettingResolveStrategySelect label='Resolve Strategy' value={props.config.resolve_strategy} onChange={(e) => updateState((x) => x.resolve_strategy = e)} />

            <NewItemList
                title='IP/DOMAIN'
                data={props.config.hostname}
                onChange={(v) => updateState((x) => { if (v) x.hostname = v })}
            />
        </>
    )
}

function SettingModeSelect(props: { label: string, network: boolean, value: cp.bypass.mode, onChange: (value: cp.bypass.mode) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={BypassMode[props.value]} onChange={(e) => props.onChange(BypassMode[e.target.value])}>
                    {props.network && <option value={BypassMode[BypassMode.bypass]}>BYPASS</option>}
                    <option value={BypassMode[BypassMode.direct]}>DIRECT</option>
                    <option value={BypassMode[BypassMode.proxy]}>PROXY</option>
                    <option value={BypassMode[BypassMode.block]}>BLOCK</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}


function SettingResolveStrategySelect(props: { label: string, value: cp.bypass.resolve_strategy, onChange: (value: cp.bypass.resolve_strategy) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={ResolveStrategy[props.value]} onChange={(e) => props.onChange(ResolveStrategy[e.target.value])}>
                    <option value={ResolveStrategy[ResolveStrategy.default]}>default</option>
                    <option value={ResolveStrategy[ResolveStrategy.prefer_ipv4]}>prefer_ipv4</option>
                    <option value={ResolveStrategy[ResolveStrategy.only_ipv4]}>only_ipv4</option>
                    <option value={ResolveStrategy[ResolveStrategy.prefer_ipv6]}>prefer_ipv6</option>
                    <option value={ResolveStrategy[ResolveStrategy.only_ipv6]}>only_ipv6</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}
export default Bypass;