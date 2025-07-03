import { create } from '@bufbuild/protobuf';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Form, InputGroup, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { ConfirmModal } from '../common/confirm';
import Loading, { Error } from '../common/loading';
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { SettingCheck, SettingSelect } from '../common/switch';
import { GlobalToastContext } from '../common/toast';
import { configv2, mode, resolve_strategy, rulev2Schema, udp_proxy_fqdn_strategy } from '../pbes/config/bypass/bypass_pb';
import { change_priority_request_change_priority_operate, change_priority_request_change_priority_operateSchema, change_priority_requestSchema, resolver, rule_indexSchema, rule_save_requestSchema, rules } from '../pbes/config/grpc/config_pb';
import { FilterModal } from './filter/filter';

const BypassComponent: FC<{
    bypass: configv2,
    onChange: (x: configv2) => void,
    refresh: () => void
}> = ({ bypass, onChange, refresh }) => {
    const { data: resolvers } = useProtoSWR(resolver.method.list)
    const resolverList = () => { return resolvers ? resolvers.names.sort((a, b) => a.localeCompare(b)) : [] }

    const ctx = useContext(GlobalToastContext);

    const [saving, setSaving] = useState(false);

    const changeResolveLocally = useCallback(() => {
        onChange({ ...bypass, resolveLocally: !bypass.resolveLocally })
    }, [bypass, onChange])

    const chnageUdpProxyFqdn = useCallback(() => {
        onChange({ ...bypass, udpProxyFqdn: bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve })
    }, [bypass, onChange])

    const resolverListValues = resolverList();

    const changeDirectResolver = useCallback((v: string) => {
        onChange({ ...bypass, directResolver: v })
    }, [bypass, onChange])

    const changeProxyResolver = useCallback((v: string) => {
        onChange({ ...bypass, proxyResolver: v })
    }, [bypass, onChange])

    const onSave = useCallback(() => {
        setSaving(true)
        FetchProtobuf(rules.method.save_config, bypass)
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`save config failed, ${error.code}| ${error.msg}`)
                else {
                    ctx.Info("Save Successfully");
                    refresh()
                }
                setSaving(false)
            })
    }, [bypass, ctx, refresh, setSaving])

    return (
        <>
            <Card className="mb-3">
                <Card.Body>
                    <SettingCheck label='Resolve Locally' checked={bypass.resolveLocally} onChange={changeResolveLocally} />
                    <SettingCheck label='Udp proxy Fqdn' checked={bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve} onChange={chnageUdpProxyFqdn} />
                    <SettingSelect
                        value={bypass.directResolver ? bypass.directResolver : "direct"}
                        values={resolverListValues}
                        label='Direct Resolver'
                        onChange={changeDirectResolver}
                        emptyChoose
                    />
                    <SettingSelect
                        lastElem value={bypass.proxyResolver ? bypass.proxyResolver : "proxy"}
                        values={resolverListValues}
                        label='Proxy Resolver'
                        onChange={changeProxyResolver}
                        emptyChoose
                    />
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="outline-primary"
                            disabled={saving}
                            onClick={onSave}
                        >
                            <i className="bi bi-floppy"></i> Save
                            {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                        </Button>
                    </div>
                </Card.Body>
            </Card>


            <Rulev2Component />
        </>
    )
}

export const Bypass = React.memo(BypassComponent)

const Rulev2Component: FC = () => {
    const ctx = useContext(GlobalToastContext);

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

    const hideFilterModal = () => { setFilterModal(prev => { return { ...prev, show: false, } }) }
    const [confirmData, setConfirmData] = useState({ show: false, index: -1 });

    const hideConfirmModal = () => { setConfirmData(prev => { return { ...prev, show: false, } }) }

    const [priorityModal, setPriorityModal] = useState({ show: false, index: -1 });

    const { data: rules_data, error, isLoading, mutate } = useProtoSWR(rules.method.list)

    const changePriority = useCallback((src_index: number, dst_index: number, operate: change_priority_request_change_priority_operate) => {
        setIsChangePriority(true)

        FetchProtobuf(rules.method.change_priority, create(change_priority_requestSchema, {
            operate: operate,
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
            }).finally(() => setIsChangePriority(false))
    }, [ctx, mutate, rules_data?.names])
    const hidePriorityModal = () => { setPriorityModal(prev => { return { ...prev, show: false, } }) }
    const onChangePriority = useCallback((index: number, operate: change_priority_request_change_priority_operate) => {
        changePriority(priorityModal.index, index, operate)
    }, [priorityModal, changePriority])

    const [newdata, setNewdata] = useState({ value: "" });
    const [isChangePriority, setIsChangePriority] = useState(false)

    const deleteRule = useCallback(() => {
        FetchProtobuf(rules.method.remove, create(rule_indexSchema, { name: rules_data.names[confirmData.index], index: confirmData.index }))
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
    }, [rules_data, confirmData, ctx, mutate])



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

    return <>
        <Card className="mt-3">
            <ConfirmModal
                show={confirmData.show}
                content={
                    <p>
                        Delete {(confirmData.index >= 0 && rules_data.names.length > confirmData.index) ? rules_data.names[confirmData.index] : ""}?
                    </p>
                }
                onHide={hideConfirmModal}
                onOk={deleteRule}
            />

            <FilterModal
                show={filterModal.show}
                onHide={hideFilterModal}
                name={(filterModal.index >= 0 && rules_data.names.length > filterModal.index) ? rules_data.names[filterModal.index] : ""}
                index={filterModal.index}
            />

            <PriorityModal
                show={priorityModal.show}
                onHide={hidePriorityModal}
                index={priorityModal.index}
                rules={rules_data.names}
                onChange={onChangePriority}
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

export const Rulev2 = React.memo(Rulev2Component)

const PriorityModalComponent: FC<{
    index: number,
    rules: string[],
    show: boolean,
    onHide: () => void,
    onChange: (index: number, operate: change_priority_request_change_priority_operate) => void
}> = ({ index, rules, show, onHide, onChange }) => {
    const [value, setValue] = useState(index)
    const [operate, setOperate] = useState(change_priority_request_change_priority_operate.Exchange)

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

                <Form.Select className='text-center' value={operate} onChange={(e) => setOperate(parseInt(e.target.value))}>
                    {
                        change_priority_request_change_priority_operateSchema.values.map((v) => (
                            <option key={v.number} value={v.number}>{v.name}</option>
                        ))
                    }
                </Form.Select>

                <Form.Select className='text-center mt-2' value={value} onChange={(e) => setValue(parseInt(e.target.value))}>
                    {
                        rules.map((rule, index) => (
                            <option key={index} value={index}>{rule}</option>
                        ))
                    }
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={() => { onChange(value, operate); onHide(); }}>OK</Button>
            </Modal.Footer>
        </Modal>
    </>
}

export const PriorityModal = React.memo(PriorityModalComponent)
