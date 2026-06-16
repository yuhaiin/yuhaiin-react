"use client"

import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardRowList, IconBox, SettingsBox } from '@/component/v2/card';
import { SettingSelectVertical, SwitchCard } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Select } from '@/component/v2/select';
import { Spinner } from '@/component/v2/spinner';
import { create } from '@bufbuild/protobuf';
import { ArrowUpDown, ListOrdered, Power, Save, ShieldCheck, Signpost } from 'lucide-react';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { ConfirmModal } from '../../component/v2/confirm';
import Loading, { Error } from '../../component/v2/loading';
import { GlobalToastContext } from '../../component/v2/toast';
import { change_priority_request_change_priority_operate, change_priority_request_change_priority_operateSchema, change_priority_requestSchema, resolver, rule_indexSchema, rule_save_requestSchema, rules, type rule_item } from '../pbes/api/config_pb';
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
    onToggleDisabled: (index: number, name: string, disabled: boolean) => void,
    disabled: boolean,
    isChangePriority: boolean,
    isToggleDisabled: boolean,
}> = ({ name, index, onPriority, onToggleDisabled, disabled, isChangePriority, isToggleDisabled }) => {
    return (
        <>
            <div className={`flex items-center flex-grow overflow-hidden ${disabled ? "opacity-60" : ""}`}>
                <Badge variant="secondary" className="mr-2 min-w-[40px]">#{index + 1}</Badge>
                <Signpost className="mr-2 text-gray-500 dark:text-gray-400" />
                <span className="truncate font-medium">{name}</span>
                {disabled && <Badge variant="warning" className="ml-2">Disabled</Badge>}
            </div>

            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="icon" variant={disabled ? "outline-primary" : "outline-secondary"} disabled={isToggleDisabled} title={disabled ? "Enable Rule" : "Disable Rule"} onClick={() => onToggleDisabled(index, name, !disabled)}>
                    <Power size={16} />
                </Button>
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
    const [disablingIndex, setDisablingIndex] = useState(-1)

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
                disabled: false,
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

    const setRuleDisabled = useCallback((index: number, name: string, disabled: boolean) => {
        setDisablingIndex(index)
        FetchProtobuf(rules.method.get, create(rule_indexSchema, { index, name }))
            .then(async ({ data, error }) => {
                if (error !== undefined || data === undefined) {
                    ctx.Error(error?.msg ?? "get rule failed")
                    return
                }

                const { error: saveError } = await FetchProtobuf(rules.method.save, create(rule_save_requestSchema, {
                    index: create(rule_indexSchema, { index, name }),
                    rule: { ...data, disabled },
                }))

                if (saveError === undefined) {
                    ctx.Info(disabled ? "rule disabled" : "rule enabled")
                    mutate()
                } else {
                    ctx.Error(saveError.msg)
                    console.error(saveError.code, saveError.msg)
                }
            })
            .finally(() => setDisablingIndex(-1))
    }, [ctx, mutate])

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

    const ruleItems: Pick<rule_item, "name" | "disabled">[] = rules_data.items.length > 0
        ? rules_data.items
        : rules_data.names.map((name) => ({ name, disabled: false }));

    return <>
        <ConfirmModal
            show={confirmData.show}
            title="Delete Rule"
            content={
                <p className="mb-0">Delete rule <strong>{(confirmData.index >= 0 && ruleItems.length > confirmData.index) ? ruleItems[confirmData.index].name : ""}</strong>?</p>
            }
            onHide={hideConfirmModal}
            onOk={deleteRule}
        />

        <FilterModal
            show={filterModal.show}
            onHide={hideFilterModal}
            name={(filterModal.index >= 0 && ruleItems.length > filterModal.index) ? ruleItems[filterModal.index].name : ""}
            index={filterModal.index}
            onDelete={() => setConfirmData({ show: true, index: filterModal.index })}
            onSaved={() => mutate()}
        />

        <PriorityModal
            show={priorityModal.show}
            onHide={hidePriorityModal}
            index={priorityModal.index}
            rules={rules_data.names}
            onChange={onChangePriority}
        />

        <CardRowList
            items={ruleItems}
            onClickItem={(_, index) => { setFilterModal({ show: true, index: index }) }}
            renderListItem={(item, index) => (
                <RuleItem
                    key={index}
                    name={item.name}
                    index={index}
                    onPriority={(idx) => { setPriorityModal({ show: true, index: idx }) }}
                    onToggleDisabled={setRuleDisabled}
                    disabled={item.disabled}
                    isChangePriority={isChangePriority}
                    isToggleDisabled={disablingIndex === index}
                />
            )}
            adding={adding}
            onAddNew={(name) => {
                if (!ruleItems.some((rule) => rule.name === name)) addNewRule(name)
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