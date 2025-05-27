import { create } from '@bufbuild/protobuf';
import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Form, InputGroup, ListGroup, Row } from 'react-bootstrap';
import { ConfirmModal } from '../common/confirm';
import { useProtoSWR } from '../common/proto';
import { FormSelect, SettingCheck, SettingSelect, SettingTypeSelect } from '../common/switch';
import { Container, MoveUpDown, NewItemList, SettingInputText } from '../config/components';
import { config, mode, mode_config, mode_configSchema, modeSchema, remote_rule, remote_rule_fileSchema, remote_rule_httpSchema, remote_ruleSchema, resolve_strategy, resolve_strategySchema, rulev2Schema, udp_proxy_fqdn_strategy, udp_proxy_fqdn_strategySchema } from '../pbes/config/bypass/bypass_pb';
import { resolver } from '../pbes/config/grpc/config_pb';
import { FilterModal } from './filter/filter';

export const Bypass: FC<{
    bypass: config,
    onChange: (x: config) => void,
    setModalData: Dispatch<SetStateAction<{ show: boolean, data?: string, import?: boolean, onSave?: (data: string) => void }>>
}> = ({ bypass, onChange, setModalData }) => {
    const { data: resolvers } = useProtoSWR(resolver.method.list)

    const [filterModal, setFilterModal] = useState({ show: false, index: 0 })
    const [confirmData, setConfirmData] = useState({ show: false, index: -1 });
    const [newdata, setNewdata] = useState({ value: "" });

    const resolverList = () => { return resolvers ? resolvers.names.sort((a, b) => a.localeCompare(b)) : [] }

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

    const moveUpDown = (index: number) => {
        return new MoveUpDown(bypass.rulesV2, index, (e) => onChange({ ...bypass, rulesV2: e }))
    }
    const [drag, setDrag] = useState({ start: -1 })

    return (
        <>
            <Card className="mb-3">
                <Card.Body>
                    <SettingTypeSelect label='TCP' type={modeSchema} value={bypass.tcp} onChange={(v) => onChange({ ...bypass, tcp: v })} />
                    <SettingTypeSelect lastElem label='UDP' type={modeSchema} value={bypass.udp} onChange={(v) => onChange({ ...bypass, udp: v })} />
                </Card.Body>
            </Card>

            <Card className="mb-3">
                <Card.Body>
                    <SettingCheck label='Resolve Locally' checked={bypass.resolveLocally} onChange={() => onChange({ ...bypass, resolveLocally: !bypass.resolveLocally })} />
                    <SettingCheck label='Udp proxy Fqdn'
                        checked={bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve}
                        onChange={() => onChange({ ...bypass, udpProxyFqdn: bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve })} />
                    <SettingSelect value={bypass.directResolver ? bypass.directResolver : "direct"} values={resolverList()} label='Direct Resolver' onChange={(v) => onChange({ ...bypass, directResolver: v })} />
                    <SettingSelect lastElem value={bypass.proxyResolver ? bypass.proxyResolver : "proxy"} values={resolverList()} label='Proxy Resolver' onChange={(v) => onChange({ ...bypass, proxyResolver: v })} />
                </Card.Body>
            </Card>

            <Card>
                <ListGroup variant="flush">
                    {
                        bypass.remoteRules.map((value, index) => (
                            <React.Fragment key={"remote_rules" + index}>
                                <Container
                                    as={ListGroup.Item}
                                    fold
                                    title={value.name}
                                    onClose={() => onChange({ ...bypass, remoteRules: bypass.remoteRules.filter((_, i) => i !== index) })}
                                    moveUpDown={new MoveUpDown(bypass.remoteRules, index, (e) => onChange({ ...bypass, remoteRules: e }))}
                                >
                                    <RulesComponent config={value} onChange={(e) => onChange({ ...bypass, remoteRules: [...bypass.remoteRules.slice(0, index), e, ...bypass.remoteRules.slice(index + 1)] })} />
                                </Container>
                            </React.Fragment>
                        ))
                    }

                    <ListGroup.Item className='d-flex'>
                        <Button className='flex-grow-1' variant='outline-success'
                            onClick={() => onChange({ ...bypass, remoteRules: [...bypass.remoteRules, defaultRemoteRule] })} >
                            <i className="bi bi-plus-lg mb-2" />New Remote Rule
                        </Button>
                    </ListGroup.Item>
                </ListGroup>
            </Card >


            <Card className="mt-3">
                <ListGroup variant="flush">
                    {
                        bypass.customRuleV3.map((value, index) => (
                            <React.Fragment key={"rule" + index}>
                                <Container
                                    as={ListGroup.Item}
                                    fold
                                    title={value.tag !== "" ? value.tag : mode[value.mode]}
                                    onClose={() => onChange({ ...bypass, customRuleV3: bypass.customRuleV3.filter((_, i) => i !== index) })}
                                    moveUpDown={new MoveUpDown(
                                        bypass.customRuleV3,
                                        index,
                                        (e) => onChange({ ...bypass, customRuleV3: e }),
                                        {
                                            draggable: true,
                                            onDrop: (i) => {
                                                if (drag.start !== i) {
                                                    const rules = [...bypass.customRuleV3]
                                                    const tmp = rules[drag.start]
                                                    rules[drag.start] = rules[i]
                                                    rules[i] = tmp
                                                    onChange({ ...bypass, customRuleV3: rules })
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
                                        onChange={(e) => onChange({ ...bypass, customRuleV3: [...bypass.customRuleV3.slice(0, index), e, ...bypass.customRuleV3.slice(index + 1)] })}
                                        setModalData={setModalData}
                                        resolvers={resolverList()}
                                    />
                                </Container>
                            </React.Fragment>
                        ))
                    }


                    <ListGroup.Item className='d-flex'>
                        <Button className='flex-grow-1' variant='outline-success'
                            onClick={() => onChange({ ...bypass, customRuleV3: [...bypass.customRuleV3, defaultRule] })} >
                            <i className="bi bi-plus-lg mb-2" />New Rule
                        </Button>
                    </ListGroup.Item>
                </ListGroup>
            </Card >



            <Card className="mt-3">
                <Card.Header>
                    <SettingCheck label='Enabled' checked={bypass.enabledV2} onChange={() => onChange({ ...bypass, enabledV2: !bypass.enabledV2 })} />
                </Card.Header>
                <ConfirmModal
                    show={confirmData.show}
                    content={<p>Delete {(confirmData.index >= 0 && bypass.rulesV2.length > confirmData.index) && bypass.rulesV2[confirmData.index].name}?</p>}
                    onHide={() => setConfirmData({ ...confirmData, show: false })}
                    onOk={() => { onChange({ ...bypass, rulesV2: bypass.rulesV2.filter((_, i) => i !== confirmData.index) }) }}
                />

                <FilterModal
                    show={filterModal.show}
                    onHide={() => { setFilterModal({ ...filterModal, show: false }) }}
                    rule={(filterModal.index >= 0 && bypass.rulesV2.length > filterModal.index) ? bypass.rulesV2[filterModal.index] : create(rulev2Schema, {
                        tag: "",
                        rules: [],
                        mode: mode.proxy,
                        resolver: "",
                        resolveStrategy: resolve_strategy.default,
                        udpProxyFqdnStrategy: udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default,
                    })}
                    onChange={(groups) => { onChange({ ...bypass, rulesV2: [...bypass.rulesV2.slice(0, filterModal.index), groups, ...bypass.rulesV2.slice(filterModal.index + 1)] }) }}
                />
                <ListGroup variant="flush">
                    {
                        bypass.rulesV2.map((value, index) => (
                            <ListGroup.Item
                                className="align-items-center d-flex justify-content-between"
                                style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                key={index}
                                action
                                onClick={() => { setFilterModal({ show: true, index: index }) }}
                            >
                                {value.name}

                                <ButtonGroup>
                                    {!moveUpDown(index).isTop() &&
                                        <Button variant="outline-primary" size="sm" onClick={(e) => {
                                            e.stopPropagation()
                                            moveUpDown(index).move(true)
                                        }}>
                                            <i className="bi bi-arrow-up"></i>
                                        </Button>}
                                    {!moveUpDown(index).isBottom() &&
                                        <Button variant="outline-primary" size="sm" onClick={(e) => {
                                            e.stopPropagation()
                                            moveUpDown(index).move(false)
                                        }}>
                                            <i className="bi bi-arrow-down"></i>
                                        </Button>}
                                    <Button
                                        variant="outline-danger"
                                        as="span"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); setConfirmData({ show: true, index: index }) }}
                                    >
                                        <i className="bi-trash"></i></Button>
                                </ButtonGroup>
                            </ListGroup.Item>
                        ))
                    }


                    <ListGroup.Item className='d-flex'>
                        <InputGroup className="d-flex justify-content-end">
                            <Form.Control value={newdata.value} onChange={(e) => setNewdata({ value: e.target.value })} />
                            <Button
                                variant='outline-success'
                                onClick={() => {
                                    if (!newdata.value || bypass.rulesV2.map((v) => v.name).includes(newdata.value)) return
                                    onChange({
                                        ...bypass, rulesV2: [...bypass.rulesV2, create(rulev2Schema, {
                                            tag: "",
                                            name: newdata.value,
                                            rules: [],
                                            mode: mode.proxy,
                                            resolver: "",
                                            resolveStrategy: resolve_strategy.default,
                                            udpProxyFqdnStrategy: udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default,
                                        })]
                                    })
                                }}
                            >
                                <i className="bi bi-plus-lg" />New </Button>
                        </InputGroup>
                    </ListGroup.Item>
                </ListGroup>
            </Card >

        </>
    )
}

const BypassSingleComponents: FC<{
    config: mode_config,
    onChange: (x: mode_config) => void,
    setModalData: Dispatch<SetStateAction<{ show: boolean, data?: string, import?: boolean, onSave?: (data: string) => void }>>,
    resolvers: string[]
}> = ({
    config,
    onChange,
    setModalData,
    resolvers
}) => {
        return (
            <>
                <SettingTypeSelect label='Mode' type={modeSchema} filter={(v) => v.number !== mode.bypass} value={config.mode} onChange={(v) => onChange({ ...config, mode: v })} />
                <SettingInputText label='Tag' value={config.tag} onChange={(e) => onChange({ ...config, tag: e })} />
                <SettingTypeSelect label='Resolve Strategy' type={resolve_strategySchema} value={config.resolveStrategy} onChange={(e) => onChange({ ...config, resolveStrategy: e })} />
                <SettingTypeSelect label='UDP proxy Fqdn'
                    type={udp_proxy_fqdn_strategySchema}
                    format={(v) => v === udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default ? "global" : udp_proxy_fqdn_strategy[v]}
                    value={config.udpProxyFqdnStrategy}
                    onChange={(e) => onChange({ ...config, udpProxyFqdnStrategy: e })}
                />
                <SettingSelect value={config.resolver} values={resolvers} label='Resolver' onChange={(v) => onChange({ ...config, resolver: v })} emptyChoose />
                <NewItemList
                    title='IP/DOMAIN'
                    data={config.hostname}
                    onChange={(v) => onChange({ ...config, hostname: v })}
                    errorMsgs={config.errorMsgs}
                    beforeContent={<>
                        <ButtonGroup className="mb-2 w-100">
                            <Button
                                variant='outline-success'
                                onClick={() => {
                                    setModalData({
                                        show: true,
                                        import: true,
                                        data: undefined,
                                        onSave: (data: string) => {
                                            const v = JSON.parse(data)
                                            onChange({ ...config, hostname: [...config.hostname, ...v] })
                                            setModalData(prev => { return { ...prev, show: false } })
                                        }
                                    })
                                }}
                            >
                                <i className="bi bi-box-arrow-in-down"></i> Import
                            </Button>
                            <Button
                                variant='outline-success'
                                onClick={() => {
                                    setModalData({
                                        show: true,
                                        data: JSON.stringify(config.hostname, null, 4),
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

const RulesComponent: FC<{ config: remote_rule, onChange: (x: remote_rule) => void }> = ({ config, onChange }) => {
    const getType = () => {
        switch (config.object.case) {
            case "file":
                return "file"
            case "http":
                return "http"
            default:
                return ""
        }
    }

    const getValue = () => {
        switch (config.object.case) {
            case "file":
                return config.object.value.path
            case "http":
                return config.object.value.url
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
            <SettingCheck label='Enabled' checked={config.enabled} onChange={() => onChange({ ...config, enabled: !config.enabled })} />
            <SettingInputText label='Name' value={config.name} onChange={(e) => onChange({ ...config, name: e })} />
            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>Type</Form.Label>
                <Col sm={10}>
                    <FormSelect value={getType()}
                        values={["file", "http"]}
                        onChange={(e) => {
                            if (getType() == e) return
                            const x = { ...config }
                            switch (e) {
                                case "file":
                                    x.object = { case: "file", value: create(remote_rule_fileSchema, {}) }
                                    break
                                case "http":
                                    x.object = { case: "http", value: create(remote_rule_httpSchema, {}) }
                                    break
                            }
                            onChange(x)
                        }}
                    />
                </Col>
            </Form.Group>
            <SettingInputText className='' label='Value' value={getValue()} errorMsg={config.errorMsg} onChange={(e) => {
                const x = { ...config }
                setValue(x, e)
                onChange(x)
            }} />
        </>
    )
}

export default Bypass;
