"use client"

import { Button } from '@/component/v2/button';
import { ErrorMsg, SettingLabel, SettingsBox } from '@/component/v2/card';
import { DropdownSelect, FormSelect, SettingEnumSelectVertical, SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import { InputGroup } from '@/component/v2/inputgroup';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { create, toJsonString } from '@bufbuild/protobuf';
import { Check, ChevronDown, ChevronRight, Plus, Trash, X } from 'lucide-react';
import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { FetchProtobuf, ProtoESFetcher, ProtoPath } from '../../../common/proto';
import Loading from '../../../component/v2/loading';
import { GlobalToastContext } from '../../../component/v2/toast';
import { rule_indexSchema, rule_save_requestSchema, rules } from '../../pbes/api/config_pb';
import { geoipSchema, hostSchema, mode, modeSchema, network_network_type, networkSchema, or, orSchema, portSchema, processSchema, resolve_strategySchema, rule, ruleSchema, rulev2Schema, sourceSchema, udp_proxy_fqdn_strategy, udp_proxy_fqdn_strategySchema } from '../../pbes/config/bypass_pb';

const Values = {
    Inbounds: [] as string[],
    Lists: [] as string[],
    Resolvers: [] as string[]
}

export const FilterContext = createContext(Values)

const RuleRow: FC<{
    rule: rule;
    onUpdate: (updatedRule: rule) => void;
    onRemove: () => void;
}> = ({ rule, onUpdate, onRemove }) => {
    const handleUpdate = (v: string, value: string | string[]) => {
        if (typeof value === 'string') {
            switch (v) {
                case 'host':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "host",
                            value: create(hostSchema, { list: value })
                        }
                    }))
                    break;
                case 'process':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "process",
                            value: create(processSchema, { list: value })
                        }
                    }))
                    break;
                case 'inbound':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "inbound",
                            value: create(sourceSchema, { name: value })
                        }
                    }))
                    break;
                case 'network':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "network",
                            value: create(networkSchema,
                                {
                                    network: value === "tcp" ? network_network_type.tcp : network_network_type.udp
                                })
                        }
                    }))
                    break;
                case 'port':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "port",
                            value: create(portSchema, { ports: value })
                        }
                    }))
                    break;
                case 'geoip':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "geoip",
                            value: create(geoipSchema, { countries: value })
                        }
                    }))
                    break;
            }
        } else {
            switch (v) {
                case 'inbound':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "inbound",
                            value: create(sourceSchema, { names: value })
                        }
                    }))
                    break;
            }
        }
    };

    const valuesContext = useContext(FilterContext)

    return (
        <InputGroup className="mb-3">
            <div style={{ flex: "0 0 130px" }}>
                <FormSelect
                    value={rule.object.case ?? ""}
                    onChange={(e) => handleUpdate(e, "")}
                    triggerClassName="rounded-end-0 border-end-0"
                    values={[
                        ["Host", "host"],
                        ["Process", "process"],
                        ["Inbound", "inbound"],
                        ["Network", "network"],
                        ["Port", "port"],
                        ["Geoip", "geoip"],
                    ]}
                />
            </div>

            {
                rule.object.case == "host" &&
                <div style={{ flex: 1 }}>
                    <FormSelect
                        value={rule.object.value.list}
                        onChange={(e) => handleUpdate("host", e)}
                        emptyChoose
                        triggerClassName="rounded-0 border-end-0"
                        values={valuesContext.Lists}
                    />
                </div>
            }

            {
                rule.object.case == "inbound" &&
                <div style={{ flex: 1 }}>
                    <DropdownSelect
                        values={rule.object.value.names}
                        items={valuesContext.Inbounds}
                        onUpdate={(v) => handleUpdate("inbound", v)}
                        triggerClassName="rounded-0 border-end-0"
                    />
                </div>
            }

            {
                rule.object.case == "process" &&
                <div style={{ flex: 1 }}>
                    <FormSelect
                        value={rule.object.value.list}
                        onChange={(e) => handleUpdate("process", e)}
                        emptyChoose
                        triggerClassName="rounded-0 border-end-0"
                        values={valuesContext.Lists}
                    />
                </div>
            }

            {
                rule.object.case == "network" &&
                <div style={{ flex: 1 }}>
                    <FormSelect
                        value={rule.object.value.network === network_network_type.tcp ? "tcp" : "udp"}
                        onChange={(e) => handleUpdate("network", e)}
                        triggerClassName="rounded-0 border-end-0"
                        values={[
                            ["tcp", "tcp"],
                            ["udp", "udp"],
                        ]}
                    />
                </div>
            }

            {
                rule.object.case == "port" &&
                <div style={{ flex: 1 }}>
                    <Input
                        type="text"
                        value={rule.object.value.ports}
                        onChange={(e) => handleUpdate("port", e.target.value)}
                        className="rounded-0 border-end-0"
                    />
                </div>
            }

            {
                rule.object.case == "geoip" &&
                <div style={{ flex: 1 }}>
                    <Input
                        type="text"
                        value={rule.object.value.countries}
                        onChange={(e) => handleUpdate("geoip", e.target.value)}
                        className="rounded-0 border-end-0"
                    />
                </div>
            }

            <div style={{ flex: "0 0 42px" }}>
                <Button variant="outline-danger" onClick={onRemove} size="icon" className="w-100 rounded-start-0 h-100">
                    <X />
                </Button>
            </div>
        </InputGroup >
    );
};

const RuleGroup: FC<{
    group: or;
    onUpdateGroup: (updatedGroup: or) => void;
    onRemoveGroup: () => void;
}> = ({ group, onUpdateGroup, onRemoveGroup }) => {

    const handleUpdateRule = (index: number, updatedRule: rule) => {
        onUpdateGroup({ ...group, rules: [...group.rules.map((rule, i) => index === i ? updatedRule : rule)] });
    };

    const handleAddRule = () => {
        onUpdateGroup({
            ...group, rules: [...group.rules,
            create(ruleSchema, {
                object: {
                    case: "host",
                    value: create(hostSchema, { list: "" })
                }
            })]
        });
    };

    const handleRemoveRule = (index: number) => {
        if (group.rules.length === 1) {
            onRemoveGroup();
        } else {
            const newRules = group.rules.filter((_, i) => i !== index);
            onUpdateGroup({ ...group, rules: newRules });
        }
    };

    return (
        <div className="border border-secondary border-opacity-10 p-3 rounded-3 bg-body-tertiary bg-opacity-25">
            {group.rules.map((rule, index) => (
                <React.Fragment key={index}>
                    <RuleRow
                        rule={rule}
                        onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
                        onRemove={() => handleRemoveRule(index)}
                    />
                    {index < group.rules.length - 1 && (
                        <div className="ms-3 mb-3 fw-bold text-primary small text-uppercase">And</div>
                    )}
                </React.Fragment>
            ))}
            <Button size="sm" onClick={handleAddRule} className="px-3">
                <Plus className="me-1" />And
            </Button>
        </div>
    );
};

const OrSeparator: FC = () => (
    <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1 opacity-25" />
        <span className="mx-3 fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Or</span>
        <hr className="flex-grow-1 opacity-25" />
    </div>
);

const RulesSeparator: FC = () => (
    <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1 opacity-25" />
        <span className="mx-3 fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Rules</span>
        <hr className="flex-grow-1 opacity-25" />
    </div>
);

const FilterBuilder: FC<{ groups: or[], onUpdateGroups: (groups: or[]) => void }> = ({ groups, onUpdateGroups }) => {
    const handleUpdateGroup = (index: number, updatedGroup: or) => {
        onUpdateGroups([...groups.map((group, i) => index === i ? updatedGroup : group)]);
    };

    const handleAddGroup = () => {
        onUpdateGroups([
            ...groups,
            create(orSchema, {
                rules: [
                    create(ruleSchema, {
                        object: {
                            case: "host",
                            value: create(hostSchema, { list: "" })
                        }
                    })
                ]
            })
        ]);
    };

    const handleRemoveGroup = (index: number) => {
        onUpdateGroups([...groups.filter((_, i) => i !== index)]);
    };

    return (
        <div className="d-flex flex-column gap-2">
            <RulesSeparator />
            {groups.map((group, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <OrSeparator />}
                    <RuleGroup
                        group={group}
                        onUpdateGroup={(updatedGroup) => handleUpdateGroup(index, updatedGroup)}
                        onRemoveGroup={() => handleRemoveGroup(index)}
                    />
                </React.Fragment>
            ))}
            <div className="mt-2">
                <Button onClick={handleAddGroup} className="px-3">
                    <Plus className="me-1" />Or
                </Button>
            </div>
        </div>
    );
};

export const FilterModal: FC<{
    index: number,
    name: string,
    show: boolean,
    onHide: () => void,
    onDelete: () => void
}> = ({ index, name, show, onHide, onDelete }) => {
    const ctx = useContext(GlobalToastContext);
    const filterContext = useContext(FilterContext);
    const [loadding, setLoadding] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    const { data: rule, error, isLoading, isValidating, mutate: setRule } = useSWR(
        name === "" ? undefined : ProtoPath(rules.method.get),
        ProtoESFetcher(rules.method.get, create(rule_indexSchema, { index, name })),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false }
    )

    useEffect(() => { setRule(); }, [name, index, setRule])

    const saveRule = () => {
        setLoadding(true)
        FetchProtobuf(rules.method.save, create(rule_save_requestSchema, { index: create(rule_indexSchema, { index, name }), rule: rule }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info(`save ${name} successful`)
                    setRule()
                    onHide()
                } else {
                    ctx.Error(error.msg)
                }
                setLoadding(false)
            })
    }

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent style={{ maxWidth: '800px' }}>
                <ModalHeader closeButton>
                    <ModalTitle>{rule ? rule.name : "Loading..."}</ModalTitle>
                </ModalHeader>

                <ModalBody>
                    {error ? (
                        <ErrorMsg msg={error.msg} code={error.code} raw={error.raw} />
                    ) : isValidating || isLoading || !rule ? (
                        <Loading />
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            <SettingsBox>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <SettingEnumSelectVertical
                                            label="Mode"
                                            type={modeSchema}
                                            value={rule.mode}
                                            onChange={(v) => setRule({ ...rule, mode: v }, false)}
                                            filter={(v) => v.number !== mode.bypass}
                                            emptyChoose
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SettingInputVertical
                                            label="Tag"
                                            value={rule.tag}
                                            onChange={(v) => setRule({ ...rule, tag: v }, false)}
                                            placeholder="Optional tag"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SettingEnumSelectVertical
                                            label="Resolve Strategy"
                                            type={resolve_strategySchema}
                                            value={rule.resolveStrategy}
                                            onChange={(v) => setRule({ ...rule, resolveStrategy: v }, false)}
                                            emptyChoose
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SettingEnumSelectVertical
                                            label="UDP proxy Fqdn"
                                            type={udp_proxy_fqdn_strategySchema}
                                            value={rule.udpProxyFqdnStrategy}
                                            onChange={(v) => setRule({ ...rule, udpProxyFqdnStrategy: v }, false)}
                                            format={(v) => v === udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default ? "global" : udp_proxy_fqdn_strategySchema.values.find(x => x.number === v)?.name || ""}
                                            emptyChoose
                                        />
                                    </div>
                                    <div className="col-12">
                                        <SettingSelectVertical
                                            label="Resolver"
                                            value={rule.resolver}
                                            values={filterContext.Resolvers}
                                            onChange={(v) => setRule({ ...rule, resolver: v }, false)}
                                            emptyChoose
                                            emptyChooseName="Global Default"
                                        />
                                    </div>
                                </div>
                            </SettingsBox>

                            {/* 2. Rules Builder Area */}
                            <SettingsBox>
                                <SettingLabel className="mb-0">Rule Entries</SettingLabel>
                                <FilterBuilder groups={rule.rules} onUpdateGroups={(groups) => { setRule({ ...rule, rules: groups }, false) }} />
                            </SettingsBox>

                            {/* 3. Debug Info */}
                            <div className="mt-2">
                                <Button
                                    className="d-flex align-items-center opacity-75"
                                    onClick={() => setShowDebug(!showDebug)}
                                    style={{ fontSize: '0.8rem' }}
                                    size="sm"
                                >
                                    {showDebug ? <ChevronDown className="me-1" /> : <ChevronRight className="me-1" />}
                                    {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                                </Button>

                                {showDebug && (
                                    <div className="mt-3">
                                        <pre className="small bg-body-tertiary p-3 rounded-3 overflow-auto font-monospace border border-secondary border-opacity-10" style={{ maxHeight: '300px', fontSize: '0.75rem' }}>
                                            {toJsonString(rulev2Schema, rule, { prettySpaces: 2 })}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className="d-flex justify-content-between gap-2 border-top-0">
                    <Button variant="outline-danger" onClick={() => { onHide(); onDelete(); }}>
                        <Trash className="me-2" />Delete Rule
                    </Button>
                    <div className="d-flex gap-2">
                        <Button onClick={onHide}>Cancel</Button>
                        <Button disabled={loadding} onClick={saveRule}>
                            {loadding ? <Spinner size="sm" /> : <><Check className="me-2" />Save</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
