"use client"

import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardRowList, IconBox, SettingsBox } from '@/component/v2/card';
import { SettingSelectVertical, SwitchCard } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Select } from '@/component/v2/select';
import { Spinner } from '@/component/v2/spinner';
import { create } from '@bufbuild/protobuf';
import { ArrowUpDown, ListOrdered, Save, ShieldCheck, Signpost } from 'lucide-react';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { ConfirmModal } from '../../component/v2/confirm';
import Loading, { Error } from '../../component/v2/loading';
import { GlobalToastContext } from '../../component/v2/toast';
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
        <div className="flex flex-col gap-6">
            {/* 1. Global Bypass Settings Card */}
            <Card>
                <CardHeader>
                    <IconBox icon={ShieldCheck} color="#ec4899" title="Global Bypass Settings" description="DNS Resolution & Strategies" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Toggles */}
                        <div>
                            <h6 className="font-bold mb-4 uppercase text-xs text-gray-500 dark:text-gray-400 opacity-75 tracking-[0.5px]">Resolution Strategy</h6>

                            <div className="flex flex-col gap-4">
                                <SwitchCard
                                    label="Resolve Locally"
                                    description="Resolve DNS on local device"
                                    checked={bypass.resolveLocally}
                                    onCheckedChange={() => onChange({ ...bypass, resolveLocally: !bypass.resolveLocally })}
                                />

                                <SwitchCard
                                    label="UDP Proxy FQDN"
                                    description="Skip local resolution for UDP"
                                    checked={bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve}
                                    onCheckedChange={() => onChange({ ...bypass, udpProxyFqdn: bypass.udpProxyFqdn === udp_proxy_fqdn_strategy.skip_resolve ? udp_proxy_fqdn_strategy.resolve : udp_proxy_fqdn_strategy.skip_resolve })}
                                />
                            </div>
                        </div>

                        {/* Right Column: Resolvers */}
                        <div className="lg:border-l lg:pl-6 border-[var(--card-inner-border)]">
                            <h6 className="font-bold mb-4 uppercase text-xs text-gray-500 dark:text-gray-400 opacity-75 tracking-[0.5px]">Default Resolvers</h6>

                            <div className="flex flex-col gap-4">
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
                <CardFooter className="flex justify-end">
                    <Button
                        disabled={saving}
                        onClick={onSave}
                    >
                        {saving ? <Spinner size="sm" /> : <><Save className="mr-2" size={16} />Save Configuration</>}
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
            <div className="flex items-center flex-grow overflow-hidden">
                <Badge variant="secondary" className="mr-2" style={{ minWidth: '40px' }}>#{index + 1}</Badge>
                <Signpost className="mr-2 text-gray-500 dark:text-gray-400" />
                <span className="truncate font-medium">{name}</span>
            </div>

            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                    size="icon"
                    disabled={isChangePriority}
                    title="Change Priority"
                    onClick={(e) => {
                        e.stopPropagation()
                        onPriority(index)
                    }}>
                    <ArrowUpDown size={16} />
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
            source: create(rule_indexSchema, { index: src_index, name: rules_data?.names[src_index] }),
            target: create(rule_indexSchema, { index: dst_index, name: rules_data?.names[dst_index] })
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
        FetchProtobuf(rules.method.remove, create(rule_indexSchema, { name: rules_data?.names[confirmData.index], index: confirmData.index }))
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
            title="Delete Rule"
            content={
                <p className="mb-0">Delete rule <strong>{(confirmData.index >= 0 && rules_data.names.length > confirmData.index) ? rules_data.names[confirmData.index] : ""}</strong>?</p>
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
                <IconBox icon={ListOrdered} color="#3b82f6" title="Bypass Rules" description="Traffic Routing Rules" />
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

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle>Change Rule Priority</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <SettingsBox>
                        <div className="flex items-center mb-4">
                            <Badge variant="primary" className="mr-4">#{index + 1}</Badge>
                            <span className="font-bold flex-grow text-center">
                                {index >= 0 && index < rules.length ? rules[index] : ""}
                            </span>
                        </div>

                        <div className="flex items-center my-4 text-gray-500 dark:text-gray-400">
                            <hr className="flex-grow opacity-25" />
                            <small className="mx-4 uppercase font-bold opacity-50 tracking-[0.5px] text-[0.65rem]">Operation</small>
                            <hr className="flex-grow opacity-25" />
                        </div>

                        <Select
                            value={String(operate)}
                            onValueChange={(val) => setOperate(parseInt(val))}
                            items={change_priority_request_change_priority_operateSchema.values.map((v) => ({
                                value: String(v.number),
                                label: v.name
                            }))}
                            triggerClassName="w-full text-center justify-center mb-4 bg-secondary/10 border-gray-500/10"
                        />

                        <div className="flex items-center my-4 text-gray-500 dark:text-gray-400">
                            <hr className="flex-grow opacity-25" />
                            <small className="mx-4 uppercase font-bold opacity-50 tracking-[0.5px] text-[0.65rem]">Target Rule</small>
                            <hr className="flex-grow opacity-25" />
                        </div>

                        <Select
                            value={String(value)}
                            onValueChange={(val) => setValue(parseInt(val))}
                            items={rules.map((rule, idx) => ({
                                value: String(idx),
                                label: `#${idx + 1} - ${rule}`
                            }))}
                            triggerClassName="w-full text-center justify-center bg-secondary/10 border-gray-500/10"
                        />
                    </SettingsBox>
                </ModalBody>
                <ModalFooter className="gap-2">
                    <Button onClick={onHide}>Cancel</Button>
                    <Button variant="primary" onClick={() => { onChange(value, operate); onHide(); }}>
                        Apply Change
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export const PriorityModal = React.memo(PriorityModalComponent)