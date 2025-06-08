import { create } from '@bufbuild/protobuf';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Accordion, Button, ButtonGroup, Card, Col, Form, InputGroup, ListGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { ConfirmModal } from '../common/confirm';
import Loading, { Error } from '../common/loading';
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { FormSelect, SettingCheck, SettingSelect, SettingTypeSelect } from '../common/switch';
import { GlobalToastContext } from '../common/toast';
import { Container, MoveUpDown, NewItemList, SettingInputText } from '../config/components';
import { config, mode, mode_config, mode_configSchema, modeSchema, remote_rule, remote_rule_fileSchema, remote_rule_httpSchema, remote_ruleSchema, resolve_strategy, resolve_strategySchema, rulev2Schema, udp_proxy_fqdn_strategy, udp_proxy_fqdn_strategySchema } from '../pbes/config/bypass/bypass_pb';
import { change_priority_requestSchema, bypass as gb, resolver, rule_indexSchema, rule_save_requestSchema, rules } from '../pbes/config/grpc/config_pb';
import { FilterModal } from './filter/filter';

export const Bypass: FC<{
    bypass: config,
    onChange: (x: config) => void,
    refresh: () => void
}> = ({ bypass, onChange, refresh }) => {
    const { data: resolvers } = useProtoSWR(resolver.method.list)
    const resolverList = () => { return resolvers ? resolvers.names.sort((a, b) => a.localeCompare(b)) : [] }

    const ctx = useContext(GlobalToastContext);

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
    const [saving, setSaving] = useState(false);


    return (
        <>
            <Card className="mb-3">
                <Card.Body>
                    <SettingCheck label='Enabled RuleV2' checked={bypass.enabledV2} onChange={() => onChange({ ...bypass, enabledV2: !bypass.enabledV2 })} />
                    <SettingCheck label='Resolve Locally' checked={bypass.resolveLocally} onChange={() => onChange({ ...bypass, resolveLocally: !bypass.resolveLocally })} />
                    <SettingCheck label='Udp proxy Fqdn'
                        checked={bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve}
                        onChange={() => onChange({ ...bypass, udpProxyFqdn: bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve })} />
                    <SettingSelect value={bypass.directResolver ? bypass.directResolver : "direct"} values={resolverList()} label='Direct Resolver' onChange={(v) => onChange({ ...bypass, directResolver: v })} emptyChoose />
                    <SettingSelect lastElem value={bypass.proxyResolver ? bypass.proxyResolver : "proxy"} values={resolverList()} label='Proxy Resolver' onChange={(v) => onChange({ ...bypass, proxyResolver: v })} emptyChoose />
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="outline-primary"
                            disabled={saving}
                            onClick={() => {
                                setSaving(true)
                                FetchProtobuf(gb.method.save, bypass)
                                    .then(async ({ error }) => {
                                        if (error !== undefined) ctx.Error(`save config failed, ${error.code}| ${error.msg}`)
                                        else {
                                            ctx.Info("Save Successfully");
                                            refresh()
                                        }
                                        setSaving(false)
                                    })
                            }}

                        >
                            <i className="bi bi-floppy"></i> Save
                            {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                        </Button>
                    </div>
                </Card.Body>
            </Card>


            <Rulev2Component />

            <div className="d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="mx-2 fw-bold text-muted">DEPRECATED</span>
                <hr className="flex-grow-1" />
            </div>

            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>DEPRECATED</Accordion.Header>
                    <Accordion.Body>
                        <SettingTypeSelect label='TCP' type={modeSchema} value={bypass.tcp} onChange={(v) => onChange({ ...bypass, tcp: v })} />
                        <SettingTypeSelect lastElem label='UDP' type={modeSchema} value={bypass.udp} onChange={(v) => onChange({ ...bypass, udp: v })} />
                        <hr />
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
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

        </>
    )
}

const BypassSingleComponents: FC<{
    config: mode_config,
    onChange: (x: mode_config) => void,
    resolvers: string[]
}> = ({
    config,
    onChange,
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

const Rulev2Component: FC = () => {

    const ctx = useContext(GlobalToastContext);

    const deleteRule = (index: number, name: string) => {
        FetchProtobuf(rules.method.remove, create(rule_indexSchema, { name: name, index: index }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    const msg = error.msg;
                    ctx.Error(msg)
                    console.error(error.code, msg)
                }
            })
    }

    const [adding, setAdding] = useState(false)

    const addNewRule = (name: string) => {
        setAdding(true)

        FetchProtobuf(rules.method.save, create(rule_save_requestSchema, {
            rule: create(rulev2Schema, {
                name: name,
                mode: mode.proxy,
                resolver: "",
                resolveStrategy: resolve_strategy.default,
                tag: "",
                udpProxyFqdnStrategy: udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default,
                rules: [],
            })
        }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    const msg = error.msg;
                    ctx.Error(msg)
                    console.error(error.code, msg)
                }

                setAdding(false)
            })
    }

    const [filterModal, setFilterModal] = useState({ show: false, index: 0 })
    const [confirmData, setConfirmData] = useState({ show: false, index: -1 });
    const [priorityModal, setPriorityModal] = useState({ show: false, index: -1 });
    const [newdata, setNewdata] = useState({ value: "" });
    const [isChangePriority, setIsChangePriority] = useState(false)

    const { data: rules_data, error, isLoading, mutate } = useProtoSWR(rules.method.list)

    if (error !== undefined) return <Card className="align-items-center">
        <Card.Body>
            <Error statusCode={error.code} title={error.msg} />
        </Card.Body>
    </Card>

    if (isLoading || rules_data === undefined) return <Card className="align-items-center">
        <Card.Body>
            <Loading />
        </Card.Body>
    </Card>

    const changePriority = (src_index: number, dst_index: number) => {
        setIsChangePriority(true)

        FetchProtobuf(rules.method.change_priority, create(change_priority_requestSchema, {
            source: create(rule_indexSchema, { index: src_index, name: rules_data.names[src_index] }),
            target: create(rule_indexSchema, { index: dst_index, name: rules_data.names[dst_index] })
        }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("change priority successful")
                    mutate()
                } else {
                    const msg = error.msg;
                    ctx.Error(msg)
                    console.error(error.code, msg)
                }

                setIsChangePriority(false)
            })
    }

    return <>
        <Card className="mt-3">
            <ConfirmModal
                show={confirmData.show}
                content={
                    <p>
                        Delete {(confirmData.index >= 0 && rules_data.names.length > confirmData.index) ? rules_data.names[confirmData.index] : ""}?
                    </p>
                }
                onHide={() => setConfirmData({ ...confirmData, show: false })}
                onOk={() => { deleteRule(confirmData.index, rules_data.names[confirmData.index]) }}
            />

            <FilterModal
                show={filterModal.show}
                onHide={() => { setFilterModal({ ...filterModal, show: false }) }}
                name={(filterModal.index >= 0 && rules_data.names.length > filterModal.index) ? rules_data.names[filterModal.index] : ""}
                index={filterModal.index}
            />

            <PriorityModal
                show={priorityModal.show}
                onHide={() => { setPriorityModal({ ...priorityModal, show: false }) }}
                index={priorityModal.index}
                rules={rules_data.names}
                onChange={(index) => { changePriority(priorityModal.index, index) }}
            />

            <ListGroup variant="flush">
                {
                    rules_data.names.map((value, index) => (
                        <ListGroup.Item
                            className="align-items-center d-flex justify-content-between"
                            style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                            key={index}
                            action
                            onClick={() => { setFilterModal({ show: true, index: index }) }}
                        >
                            {value}

                            <ButtonGroup>
                                <Button
                                    variant="outline-primary"
                                    as="span"
                                    size="sm"
                                    disabled={isChangePriority}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setPriorityModal({ show: true, index: index })
                                    }}>
                                    <i className="bi-arrow-down-up"></i>
                                </Button>
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
                            disabled={adding}
                            variant='outline-success'
                            onClick={() => {
                                if (!newdata.value || rules_data.names.map((v) => v).includes(newdata.value)) return
                                addNewRule(newdata.value)
                            }}
                        >
                            <i className="bi bi-plus-lg" />New </Button>
                    </InputGroup>
                </ListGroup.Item>
            </ListGroup>
        </Card >
    </>
}


const PriorityModal: FC<{
    index: number,
    rules: string[],
    show: boolean,
    onHide: () => void,
    onChange: (index: number) => void
}> = ({ index, rules, show, onHide, onChange }) => {
    const [value, setValue] = useState(index)

    useEffect(() => {
        setValue(index)
    }, [index, rules])

    return <>
        <Modal show={show} onHide={onHide}>
            <Modal.Body>
                <Form.Control defaultValue={index >= 0 && index < rules.length ? rules[index] : ""} readOnly className='text-center' />
                <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 fw-bold text-muted">To</span>
                    <hr className="flex-grow-1" />
                </div>
                <Form.Select className='text-center' value={value} onChange={(e) => setValue(parseInt(e.target.value))}>
                    {
                        rules.map((rule, index) => (
                            <option key={index} value={index}>{rule}</option>
                        ))
                    }
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={() => { onChange(value); onHide(); }}>OK</Button>
            </Modal.Footer>
        </Modal>
    </>
}

export default Bypass;
