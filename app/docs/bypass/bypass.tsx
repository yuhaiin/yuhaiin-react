import { create } from '@bufbuild/protobuf';
import { Button, Card, Col, Form, Row, } from 'react-bootstrap';
import { SettingCheck } from '../common/switch';
import { Container, MoveUpDown, NewItemList, SettingInputText } from '../config/components';
import { config, mode, mode_config, mode_configSchema, remote_rule, remote_rule_fileSchema, remote_rule_httpSchema, remote_ruleSchema, resolve_strategy, udp_proxy_fqdn_strategy } from '../pbes/config/bypass/bypass_pb';


export const Bypass = (props: { bypass: config, onChange: (x: config) => void, }) => {
    const defaultRule: mode_config = create(mode_configSchema, {
        hostname: ["www.example.com"],
        mode: mode.proxy,
        tag: "",
        resolveStrategy: resolve_strategy.default
    })

    const defaultRemoteRule: remote_rule = create(remote_ruleSchema, {
        name: "my rule",
        enabled: false,
        object: { case: "file", value: create(remote_rule_fileSchema, {}) }
    })

    return (
        <>
            <Card className="mb-3">
                <Card.Body>
                    <SettingModeSelect label='TCP' network={true} value={props.bypass.tcp} onChange={(v) => props.onChange({ ...props.bypass, tcp: v })} />
                    <SettingModeSelect label='UDP' network={true} value={props.bypass.udp} onChange={(v) => props.onChange({ ...props.bypass, udp: v })} />
                    <SettingCheck label='Resolve Locally' checked={props.bypass.resolveLocally} onChange={() => props.onChange({ ...props.bypass, resolveLocally: !props.bypass.resolveLocally })} />
                    <SettingCheck label='Udp proxy Fqdn'
                        checked={props.bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve}
                        onChange={() => props.onChange({ ...props.bypass, udpProxyFqdn: props.bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve })} />
                </Card.Body>
            </Card>

            {
                props.bypass.remoteRules.map((value, index) => (
                    <Container
                        key={"remote_rules" + index}
                        title={value.name}
                        onClose={() => props.onChange({ ...props.bypass, remoteRules: props.bypass.remoteRules.filter((_, i) => i !== index) })}
                        moveUpDown={new MoveUpDown(props.bypass.remoteRules, index, (e) => props.onChange({ ...props.bypass, remoteRules: e }))}
                    >
                        <RulesComponent config={value} onChange={(e) => props.onChange({ ...props.bypass, remoteRules: [...props.bypass.remoteRules.slice(0, index), e, ...props.bypass.remoteRules.slice(index + 1)] })} />
                    </Container>
                ))
            }

            <div className='d-flex mb-2'>
                <Button className='flex-grow-1' variant='outline-success'
                    onClick={() => props.onChange({ ...props.bypass, remoteRules: [...props.bypass.remoteRules, defaultRemoteRule] })} >
                    <i className="bi bi-plus-lg mb-2" />New Remote Rule
                </Button>
            </div>

            <hr />


            {
                props.bypass.customRuleV3.map((value, index) => (
                    <Container
                        key={"rule" + index}
                        title={value.tag !== "" ? value.tag : mode[value.mode]}
                        onClose={() => props.onChange({ ...props.bypass, customRuleV3: props.bypass.customRuleV3.filter((_, i) => i !== index) })}
                        moveUpDown={new MoveUpDown(props.bypass.customRuleV3, index, (e) => props.onChange({ ...props.bypass, customRuleV3: e }))}
                    >
                        <BypassSingleComponents config={value} onChange={(e) => props.onChange({ ...props.bypass, customRuleV3: [...props.bypass.customRuleV3.slice(0, index), e, ...props.bypass.customRuleV3.slice(index + 1)] })} />
                    </Container>
                ))
            }

            <div className='d-flex mb-2'>
                <Button className='flex-grow-1' variant='outline-success'
                    onClick={() => props.onChange({ ...props.bypass, customRuleV3: [...props.bypass.customRuleV3, defaultRule] })} >
                    <i className="bi bi-plus-lg mb-2" />New Rule
                </Button>
            </div>

        </>
    )
}

const BypassSingleComponents = (props: { config: mode_config, onChange: (x: mode_config) => void }) => {

    return (
        <>
            <SettingModeSelect label='Mode' network={false} value={props.config.mode} onChange={(v) => props.onChange({ ...props.config, mode: v })} />
            <SettingInputText label='Tag' value={props.config.tag} onChange={(e) => props.onChange({ ...props.config, tag: e })} />
            <SettingResolveStrategySelect label='Resolve Strategy' value={props.config.resolveStrategy} onChange={(e) => props.onChange({ ...props.config, resolveStrategy: e })} />
            <SettingUdpProxyFqdnSelect label='UDP proxy Fqdn' value={props.config.udpProxyFqdnStrategy} onChange={(e) => props.onChange({ ...props.config, udpProxyFqdnStrategy: e })} />
            <NewItemList
                title='IP/DOMAIN'
                data={props.config.hostname}
                onChange={(v) => props.onChange({ ...props.config, hostname: v })}
                errorMsgs={props.config.errorMsgs}
            />
        </>
    )
}

const RulesComponent = (props: { config: remote_rule, onChange: (x: remote_rule) => void }) => {
    const getType = () => {
        switch (props.config.object.case) {
            case "file":
                return "file"
            case "http":
                return "http"
            default:
                return ""
        }
    }

    const getValue = () => {
        switch (props.config.object.case) {
            case "file":
                return props.config.object.value.path
            case "http":
                return props.config.object.value.url
            default:
                return ""
        }
    }

    const setValue = (x: remote_rule, v: string) => {
        switch (x.object.case) {
            case "file":
                x.object.value = { ...x.object.value, path: v }
                break
            case "http":
                x.object.value = { ...x.object.value, url: v }
                break
        }
    }

    return (
        <>
            <SettingCheck label='Enabled' checked={props.config.enabled} onChange={() => props.onChange({ ...props.config, enabled: !props.config.enabled })} />
            <SettingInputText label='Name' value={props.config.name} onChange={(e) => props.onChange({ ...props.config, name: e })} />
            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>Type</Form.Label>
                <Col sm={10}>
                    <Form.Select value={getType()} onChange={(e) => {
                        if (getType() == e.target.value) return
                        const x = { ...props.config }
                        switch (e.target.value) {
                            case "file":
                                x.object = { case: "file", value: create(remote_rule_fileSchema, {}) }
                                break
                            case "http":
                                x.object = { case: "http", value: create(remote_rule_httpSchema, {}) }
                                break
                        }
                        props.onChange(x)
                    }}>
                        <option value={"file"}>file</option>
                        <option value={"http"}>http</option>
                    </Form.Select>
                </Col>
            </Form.Group>
            <SettingInputText label='Value' value={getValue()} errorMsg={props.config.errorMsg} onChange={(e) => {
                const x = { ...props.config }
                setValue(x, e)
                props.onChange(x)
            }} />
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