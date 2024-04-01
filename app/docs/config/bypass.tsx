import React from 'react';
import { Form, Row, Col, Button, } from 'react-bootstrap';
import { SettingInputText, NewItemList } from './components';
import { bypass_config, mode, mode_config, resolve_strategy } from '../pbes/config/bypass/bypass_pb';


export const defaultBypassConfig: bypass_config = new bypass_config({
    tcp: mode.bypass,
    udp: mode.bypass,
    bypassFile: "yuhaiin.conf",
    customRuleV3: []
})

const Bypass = React.memo((props: { bypass: bypass_config, onChange: (x: bypass_config) => void, }) => {

    const defaultRule: mode_config = new mode_config({
        hostname: ["www.example.com"],
        mode: mode.proxy,
        tag: "",
        resolveStrategy: resolve_strategy.default
    })

    const updateState = (x: (x: bypass_config) => void) => {
        x(props.bypass)
        props.onChange(props.bypass)
    }

    return (
        <>

            <SettingModeSelect label='TCP' network={true} value={props.bypass.tcp} onChange={(v) => updateState((x) => x.tcp = v)} />
            <SettingModeSelect label='UDP' network={true} value={props.bypass.udp} onChange={(v) => updateState((x) => x.udp = v)} />
            <SettingInputText label='Bypass File' value={props.bypass.bypassFile} onChange={(e) => updateState((x) => x.bypassFile = e)} />

            <hr />

            Custom Rules
            {
                props.bypass.customRuleV3.map((value, index) => (

                    <div className='mb-3' key={"custom_rule_v3" + index}>

                        <hr />

                        <BypassSingleComponents config={new mode_config(value)} onChange={(e) => updateState((x) => x.customRuleV3[index] = e)} />


                        <Button variant='outline-danger' onClick={() => updateState((x) => x.customRuleV3.splice(index, 1))} >
                            <i className="bi bi-x-lg" />Remove Current Rule
                        </Button>
                    </div>
                ))
            }

            <hr />

            <div className='d-flex mb-2'>
                <Button className='flex-grow-1' variant='outline-success'
                    onClick={() => updateState((x) => x.customRuleV3.push(defaultRule))} >
                    <i className="bi bi-plus-lg mb-2" />New Rule
                </Button>
            </div>
        </>
    )
})

const BypassSingleComponents = (props: { config: mode_config, onChange: (x: mode_config) => void }) => {
    const updateState = (x: (v: mode_config) => void) => {
        x(props.config)
        props.onChange(props.config)
    }

    return (
        <>

            <SettingModeSelect label='Mode' network={false} value={props.config.mode} onChange={(v) => updateState((x) => x.mode = v)} />
            <SettingInputText label='Tag' value={props.config.tag} onChange={(e) => updateState((x) => x.tag = e)} />
            <SettingResolveStrategySelect label='Resolve Strategy' value={props.config.resolveStrategy} onChange={(e) => updateState((x) => x.resolveStrategy = e)} />

            <NewItemList
                title='IP/DOMAIN'
                data={props.config.hostname}
                onChange={(v) => updateState((x) => { if (v) x.hostname = v })}
            />
        </>
    )
}

function SettingModeSelect(props: { label: string, network: boolean, value: mode, onChange: (value: mode) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={mode[props.value]} onChange={(e) => props.onChange(mode[e.target.value])}>
                    {props.network && <option value={mode[mode.bypass]}>BYPASS</option>}
                    <option value={mode[mode.direct]}>DIRECT</option>
                    <option value={mode[mode.proxy]}>PROXY</option>
                    <option value={mode[mode.block]}>BLOCK</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}


function SettingResolveStrategySelect(props: { label: string, value: resolve_strategy, onChange: (value: resolve_strategy) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={resolve_strategy[props.value]} onChange={(e) => props.onChange(resolve_strategy[e.target.value])}>
                    <option value={resolve_strategy[resolve_strategy.default]}>default</option>
                    <option value={resolve_strategy[resolve_strategy.prefer_ipv4]}>prefer_ipv4</option>
                    <option value={resolve_strategy[resolve_strategy.only_ipv4]}>only_ipv4</option>
                    <option value={resolve_strategy[resolve_strategy.prefer_ipv6]}>prefer_ipv6</option>
                    <option value={resolve_strategy[resolve_strategy.only_ipv6]}>only_ipv6</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}
export default Bypass;