import { create } from '@bufbuild/protobuf';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap';
import { FormSelect, SettingCheck, SettingTypeSelect } from '../common/switch';
import { Container, MoveUpDown, NewItemList, SettingInputText } from '../config/components';
import { config, mode, mode_config, mode_configSchema, modeSchema, remote_rule, remote_rule_fileSchema, remote_rule_httpSchema, remote_ruleSchema, resolve_strategy, resolve_strategySchema, udp_proxy_fqdn_strategy, udp_proxy_fqdn_strategySchema } from '../pbes/config/bypass/bypass_pb';

export const Bypass = (props: {
    bypass: config,
    onChange: (x: config) => void,
    setModalData: Dispatch<SetStateAction<{ show: boolean, data?: string, import?: boolean, onSave?: (data: string) => void }>>
}) => {
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

    const [drag, setDrag] = useState({ start: -1 })

    return (
        <>
            <Card className="mb-3">
                <Card.Body>
                    <SettingTypeSelect label='TCP' type={modeSchema} value={props.bypass.tcp} onChange={(v) => props.onChange({ ...props.bypass, tcp: v })} />
                    <SettingTypeSelect label='UDP' type={modeSchema} value={props.bypass.udp} onChange={(v) => props.onChange({ ...props.bypass, udp: v })} />
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
                        fold
                        title={value.tag !== "" ? value.tag : mode[value.mode]}
                        onClose={() => props.onChange({ ...props.bypass, customRuleV3: props.bypass.customRuleV3.filter((_, i) => i !== index) })}
                        moveUpDown={new MoveUpDown(
                            props.bypass.customRuleV3,
                            index,
                            (e) => props.onChange({ ...props.bypass, customRuleV3: e }),
                            {
                                draggable: true,
                                onDrop: (i) => {
                                    if (drag.start !== i) {
                                        const rules = [...props.bypass.customRuleV3]
                                        const tmp = rules[drag.start]
                                        rules[drag.start] = rules[i]
                                        rules[i] = tmp
                                        props.onChange({ ...props.bypass, customRuleV3: rules })
                                    }
                                },
                                onDragStart: (i) => {
                                    setDrag({ start: i })
                                }
                            },
                        )}
                    >
                        <BypassSingleComponents
                            config={value}
                            onChange={(e) => props.onChange({ ...props.bypass, customRuleV3: [...props.bypass.customRuleV3.slice(0, index), e, ...props.bypass.customRuleV3.slice(index + 1)] })}
                            setModalData={props.setModalData}
                        />
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

const BypassSingleComponents = (props: {
    config: mode_config,
    onChange: (x: mode_config) => void,
    setModalData: Dispatch<SetStateAction<{ show: boolean, data?: string, import?: boolean, onSave?: (data: string) => void }>>
}) => {
    return (
        <>
            <SettingTypeSelect label='Mode' type={modeSchema} filter={(v) => v.number !== mode.bypass} value={props.config.mode} onChange={(v) => props.onChange({ ...props.config, mode: v })} />
            <SettingInputText label='Tag' value={props.config.tag} onChange={(e) => props.onChange({ ...props.config, tag: e })} />
            <SettingTypeSelect label='Resolve Strategy' type={resolve_strategySchema} value={props.config.resolveStrategy} onChange={(e) => props.onChange({ ...props.config, resolveStrategy: e })} />
            <SettingTypeSelect label='UDP proxy Fqdn'
                type={udp_proxy_fqdn_strategySchema}
                format={(v) => v === udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default ? "global" : udp_proxy_fqdn_strategy[v]}
                value={props.config.udpProxyFqdnStrategy}
                onChange={(e) => props.onChange({ ...props.config, udpProxyFqdnStrategy: e })}
            />
            <NewItemList
                title='IP/DOMAIN'
                data={props.config.hostname}
                onChange={(v) => props.onChange({ ...props.config, hostname: v })}
                errorMsgs={props.config.errorMsgs}
                beforeContent={<>
                    <ButtonGroup className="mb-2 w-100">
                        <Button
                            variant='outline-success'
                            onClick={() => {
                                props.setModalData({
                                    show: true,
                                    import: true,
                                    data: undefined,
                                    onSave: (data: string) => {
                                        const v = JSON.parse(data)
                                        props.onChange({ ...props.config, hostname: [...props.config.hostname, ...v] })
                                        props.setModalData(prev => { return { ...prev, show: false } })
                                    }
                                })
                            }}
                        >
                            <i className="bi bi-box-arrow-in-down"></i> Import
                        </Button>
                        <Button
                            variant='outline-success'
                            onClick={() => {
                                props.setModalData({
                                    show: true,
                                    data: JSON.stringify(props.config.hostname, null, 4),
                                    import: false
                                })
                            }}
                        >
                            <i className="bi bi-box-arrow-in-up"></i> Export
                        </Button>
                    </ButtonGroup>
                </>}
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
                    <FormSelect value={getType()}
                        values={["file", "http"]}
                        onChange={(e) => {
                            if (getType() == e) return
                            const x = { ...props.config }
                            switch (e) {
                                case "file":
                                    x.object = { case: "file", value: create(remote_rule_fileSchema, {}) }
                                    break
                                case "http":
                                    x.object = { case: "http", value: create(remote_rule_httpSchema, {}) }
                                    break
                            }
                            props.onChange(x)
                        }}
                    />
                </Col>
            </Form.Group>
            <SettingInputText mb='' label='Value' value={getValue()} errorMsg={props.config.errorMsg} onChange={(e) => {
                const x = { ...props.config }
                setValue(x, e)
                props.onChange(x)
            }} />
        </>
    )
}

export default Bypass;
