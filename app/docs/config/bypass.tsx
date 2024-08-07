import React from 'react';
import { Form, Row, Col, Button, } from 'react-bootstrap';
import { SettingInputText, NewItemList, Container } from './components';
import { bypass_config, bypass_configSchema, mode, mode_config, mode_configSchema, resolve_strategy, udp_proxy_fqdn_strategy } from '../pbes/config/bypass/bypass_pb';
import { SettingCheck } from '../common/switch';
import { create } from '@bufbuild/protobuf';


export const defaultBypassConfig: bypass_config = create(bypass_configSchema, {
    tcp: mode.bypass,
    udp: mode.bypass,
    bypassFile: "yuhaiin.conf",
    customRuleV3: []
})

const Bypass = React.memo((props: { bypass: bypass_config, onChange: (x: bypass_config) => void, }) => {

    const defaultRule: mode_config = create(mode_configSchema, {
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
            <SettingCheck label='Udp proxy Fqdn'
                checked={props.bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve}
                onChange={() => updateState((x) => x.udpProxyFqdn = x.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve)} />
            <hr />

            {
                props.bypass.customRuleV3.map((value, index) => (
                    <Container
                        key={"rule" + index}
                        title={value.tag !== "" ? value.tag : mode[value.mode]}
                        onClose={() => updateState((x) => x.customRuleV3.splice(index, 1))}
                    >
                        <BypassSingleComponents config={value} onChange={(e) => updateState((x) => x.customRuleV3[index] = e)} />
                    </Container>
                ))
            }

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
            <SettingUdpProxyFqdnSelect label='UDP proxy Fqdn' value={props.config.udpProxyFqdnStrategy} onChange={(e) => updateState((x) => x.udpProxyFqdnStrategy = e)} />
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

function SettingUdpProxyFqdnSelect(props: { label: string, value: udp_proxy_fqdn_strategy, onChange: (value: udp_proxy_fqdn_strategy) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={udp_proxy_fqdn_strategy[props.value]} onChange={(e) => props.onChange(udp_proxy_fqdn_strategy[e.target.value])}>
                    <option value={udp_proxy_fqdn_strategy[udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default]}>Global</option>
                    <option value={udp_proxy_fqdn_strategy[udp_proxy_fqdn_strategy.resolve]}>Resolve</option>
                    <option value={udp_proxy_fqdn_strategy[udp_proxy_fqdn_strategy.skip_resolve]}>Skip</option>
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