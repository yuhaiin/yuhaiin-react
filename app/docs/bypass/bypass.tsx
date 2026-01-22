import { Card, CardBody, CardFooter, CardHeader, CardRowList, IconBox, SettingsBox } from '@/app/component/cardlist';
import { create } from '@bufbuild/protobuf';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { ConfirmModal } from '../../component/confirm';
import Loading, { Error } from '../../component/loading';
import { SettingSelectVertical, SettingSwitchCard } from '../../component/switch';
import { GlobalToastContext } from '../../component/toast';
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { change_priority_request_change_priority_operate, change_priority_request_change_priority_operateSchema, change_priority_requestSchema, resolver, rule_indexSchema, rule_save_requestSchema, rules } from '../pbes/api/config_pb';
import { configv2, mode, resolve_strategy, rulev2Schema, udp_proxy_fqdn_strategy } from '../pbes/config/bypass_pb';
import { FilterModal } from './filter/filter';

const BypassComponent: FC<{
    bypass: configv2,
    onChange: (x: configv2) => void,
    refresh: () => void
}> = ({ bypass, onChange, refresh }) => {
    const { data: resolvers } = useProtoSWR(resolver.method.list)
    const resolverListValues = resolvers ? resolvers.names.sort((a, b) => a.localeCompare(b)) : [];

    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);

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
        <div>
            {/* 1. Global Bypass Settings Card */}
            <Card>
                <CardHeader>
                    <IconBox icon="shield-check" color="#ec4899" title="Global Bypass Settings" description="DNS Resolution & Strategies" />
                </CardHeader>
                <CardBody>
                    <div className="row g-4">
                        {/* Left Column: Toggles */}
                        <div className="col-lg-6">
                            <h6 className="fw-bold mb-3 text-uppercase small text-muted text-opacity-75" style={{ letterSpacing: '0.5px' }}>Resolution Strategy</h6>

                            <div className="d-flex flex-column gap-3">
                                <SettingSwitchCard
                                    label="Resolve Locally"
                                    description="Resolve DNS on local device"
                                    checked={bypass.resolveLocally}
                                    onChange={() => onChange({ ...bypass, resolveLocally: !bypass.resolveLocally })}
                                />

                                <SettingSwitchCard
                                    label="UDP Proxy FQDN"
                                    description="Skip local resolution for UDP"
                                    checked={bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve}
                                    onChange={() => onChange({ ...bypass, udpProxyFqdn: bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve })}
                                />
                            </div>
                        </div>

                        {/* Right Column: Resolvers */}
                        <div className="col-lg-6 border-start-lg ps-lg-4" style={{ borderColor: 'var(--card-inner-border)' }}>
                            <h6 className="fw-bold mb-3 text-uppercase small text-muted text-opacity-75" style={{ letterSpacing: '0.5px' }}>Default Resolvers</h6>

                            <div className="d-flex flex-column gap-3">
                                <SettingSelectVertical
                                    label="Direct Resolver"
                                    value={bypass.directResolver ? bypass.directResolver : ""}
                                    values={resolverListValues}
                                    onChange={(v) => onChange({ ...bypass, directResolver: v })}
                                    emptyChoose
                                    emptyChooseName="Global Default"
                                />

                                <SettingSelectVertical
                                    label="Proxy Resolver"
                                    value={bypass.proxyResolver ? bypass.proxyResolver : ""}
                                    values={resolverListValues}
                                    onChange={(v) => onChange({ ...bypass, proxyResolver: v })}
                                    emptyChoose
                                    emptyChooseName="Global Default"
                                />
                            </div>
                        </div>
                    </div>
                </CardBody>
                <CardFooter>
                    <Button
                        variant="primary"
                        disabled={saving}
                        onClick={onSave}
                    >
                        {saving ? <Spinner as="span" size="sm" animation="border" /> : <><i className="bi bi-save me-1"></i> Save Settings</>}
                    </Button>
                </CardFooter>
            </Card>

            <Rulev2Component />
        </div>
    )
}

export const Bypass = React.memo(BypassComponent)

const RuleItem: FC<{
    name: string,
    index: number,
    onPriority: (index: number) => void,
    isChangePriority: boolean
}> = ({ name, index, onPriority, isChangePriority }) => {
    return (
        <>
            <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                <span className="badge bg-secondary bg-opacity-10 text-secondary me-2">#{index + 1}</span>
                <i className="bi bi-signpost-2 me-2 text-muted"></i>
                <span className="text-truncate fw-medium">{name}</span>
            </div>

            <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                    variant="link"
                    className="text-primary p-1"
                    disabled={isChangePriority}
                    title="Change Priority"
                    onClick={(e) => {
                        e.stopPropagation()
                        onPriority(index)
                    }}>
                    <i className="bi bi-arrow-down-up"></i>
                </Button>
            </div>
        </>
    )
}


const Rulev2Component: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [adding, setAdding] = useState(false)
    const [filterModal, setFilterModal] = useState({ show: false, index: 0 })
    const [confirmData, setConfirmData] = useState({ show: false, index: -1 });
    const [priorityModal, setPriorityModal] = useState({ show: false, index: -1 });
    const [isChangePriority, setIsChangePriority] = useState(false)

    const { data: rules_data, error, isLoading, mutate } = useProtoSWR(rules.method.list)

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
                    ctx.Info("Add rule successful")
                    mutate()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
                setAdding(false)
            })
    }

    const hideFilterModal = useCallback(() => { setFilterModal(prev => { return { ...prev, show: false, } }) }, [])
    const hideConfirmModal = useCallback(() => { setConfirmData(prev => { return { ...prev, show: false, } }) }, [])
    const hidePriorityModal = useCallback(() => { setPriorityModal(prev => { return { ...prev, show: false, } }) }, [])

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
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            }).finally(() => setIsChangePriority(false))
    }, [ctx, mutate, rules_data?.names])

    const onChangePriority = useCallback((index: number, operate: change_priority_request_change_priority_operate) => {
        changePriority(priorityModal.index, index, operate)
    }, [priorityModal, changePriority])

    const deleteRule = useCallback(() => {
        FetchProtobuf(rules.method.remove, create(rule_indexSchema, { name: rules_data.names[confirmData.index], index: confirmData.index }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            })
    }, [rules_data, confirmData, ctx, mutate])


    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || rules_data === undefined) return <Loading />

    return <>
        <ConfirmModal
            show={confirmData.show}
            content={
                <p>Delete rule <strong>{(confirmData.index >= 0 && rules_data.names.length > confirmData.index) ? rules_data.names[confirmData.index] : ""}</strong>?</p>
            }
            onHide={hideConfirmModal}
            onOk={deleteRule}
        />

        <FilterModal
            show={filterModal.show}
            onHide={hideFilterModal}
            name={(filterModal.index >= 0 && rules_data.names.length > filterModal.index) ? rules_data.names[filterModal.index] : ""}
            index={filterModal.index}
            onDelete={() => setConfirmData({ show: true, index: filterModal.index })}
        />

        <PriorityModal
            show={priorityModal.show}
            onHide={hidePriorityModal}
            index={priorityModal.index}
            rules={rules_data.names}
            onChange={onChangePriority}
        />

        <CardRowList
            items={rules_data.names}
            onClickItem={(_, index) => { setFilterModal({ show: true, index: index }) }}
            renderListItem={(name, index) => (
                <RuleItem
                    key={index}
                    name={name}
                    index={index}
                    onPriority={(idx) => { setPriorityModal({ show: true, index: idx }) }}
                    isChangePriority={isChangePriority}
                />
            )}
            adding={adding}
            onAddNew={(name) => {
                if (!rules_data.names.includes(name)) addNewRule(name)
            }}
            header={
                <IconBox icon="list-ol" color="primary" title="Bypass Rules" description="Traffic Routing Rules" />
            }
        />
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
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Change Rule Priority</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <SettingsBox>
                    <div className="d-flex align-items-center mb-3">
                        <span className="badge bg-primary me-2">#{index + 1}</span>
                        <Form.Control
                            value={index >= 0 && index < rules.length ? rules[index] : ""}
                            readOnly
                            className="bg-transparent border-0 fw-bold text-center"
                            style={{ color: 'var(--bs-body-color)' }}
                        />
                    </div>

                    <div className="d-flex align-items-center my-3 text-muted">
                        <hr className="flex-grow-1 opacity-25" />
                        <small className="mx-2 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Operation</small>
                        <hr className="flex-grow-1 opacity-25" />
                    </div>

                    <Form.Select className='text-center mb-3' value={operate} onChange={(e) => setOperate(parseInt(e.target.value))}>
                        {
                            change_priority_request_change_priority_operateSchema.values.map((v) => (
                                <option key={v.number} value={v.number}>{v.name}</option>
                            ))
                        }
                    </Form.Select>

                    <div className="d-flex align-items-center my-3 text-muted">
                        <hr className="flex-grow-1 opacity-25" />
                        <small className="mx-2 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Target Rule</small>
                        <hr className="flex-grow-1 opacity-25" />
                    </div>

                    <Form.Select className='text-center' value={value} onChange={(e) => setValue(parseInt(e.target.value))}>
                        {
                            rules.map((rule, idx) => (
                                <option key={idx} value={idx}>#{idx + 1} - {rule}</option>
                            ))
                        }
                    </Form.Select>
                </SettingsBox>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={() => { onChange(value, operate); onHide(); }}>Apply Change</Button>
            </Modal.Footer>
        </Modal>
    </>
}

export const PriorityModal = React.memo(PriorityModalComponent)