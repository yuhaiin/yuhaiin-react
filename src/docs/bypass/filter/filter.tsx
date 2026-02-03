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
import React, { createContext, FC, useContext, useState } from 'react';
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
        <InputGroup className="mb-4">
            <div className="flex-[0_0_130px]">
                <FormSelect
                    value={rule.object.case ?? ""}
                    onChange={(e) => handleUpdate(e, "")}
                    triggerClassName="focus:z-10 focus:relative hover:z-10 hover:relative"
                    groupPosition="first"
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
                <div className="flex-1">
                    <FormSelect
                        value={rule.object.value.list}
                        onChange={(e) => handleUpdate("host", e)}
                        emptyChoose
                        triggerClassName="focus:z-10 focus:relative hover:z-10 hover:relative"
                        groupPosition="middle"
                        values={valuesContext.Lists}
                    />
                </div>
            }

            {
                rule.object.case == "inbound" &&
                <div className="flex-1">
                    <DropdownSelect
                        values={rule.object.value.names}
                        items={valuesContext.Inbounds}
                        onUpdate={(v) => handleUpdate("inbound", v)}
                        triggerClassName="focus:z-10 focus:relative hover:z-10 hover:relative"
                        groupPosition="middle"
                    />
                </div>
            }

            {
                rule.object.case == "process" &&
                <div className="flex-1">
                    <FormSelect
                        value={rule.object.value.list}
                        onChange={(e) => handleUpdate("process", e)}
                        emptyChoose
                        triggerClassName="focus:z-10 focus:relative hover:z-10 hover:relative"
                        groupPosition="middle"
                        values={valuesContext.Lists}
                    />
                </div>
            }

            {
                rule.object.case == "network" &&
                <div className="flex-1">
                    <FormSelect
                        value={rule.object.value.network === network_network_type.tcp ? "tcp" : "udp"}
                        onChange={(e) => handleUpdate("network", e)}
                        triggerClassName="focus:z-10 focus:relative hover:z-10 hover:relative"
                        groupPosition="middle"
                        values={[
                            ["tcp", "tcp"],
                            ["udp", "udp"],
                        ]}
                    />
                </div>
            }

            {
                rule.object.case == "port" &&
                <div className="flex-1">
                    <Input
                        type="text"
                        value={rule.object.value.ports}
                        onChange={(e) => handleUpdate("port", e.target.value)}
                        className="focus:z-10 focus:relative hover:z-10 hover:relative"
                        groupPosition="middle"
                    />
                </div>
            }

            {
                rule.object.case == "geoip" &&
                <div className="flex-1">
                    <Input
                        type="text"
                        value={rule.object.value.countries}
                        onChange={(e) => handleUpdate("geoip", e.target.value)}
                        className="focus:z-10 focus:relative hover:z-10 hover:relative"
                        groupPosition="middle"
                    />
                </div>
            }

            <div className="flex-[0_0_42px]">
                <Button variant="outline-danger" onClick={onRemove} size="icon" className="w-full !rounded-l-none h-full focus:z-10 focus:relative hover:z-10 hover:relative">
                    <X size={16} />
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
        <div className="border border-gray-500/10 p-4 rounded-md bg-secondary/10">
            {group.rules.map((rule, index) => (
                <React.Fragment key={index}>
                    <RuleRow
                        rule={rule}
                        onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
                        onRemove={() => handleRemoveRule(index)}
                    />
                    {index < group.rules.length - 1 && (
                        <div className="ml-4 mb-4 font-bold text-blue-500 text-xs uppercase">And</div>
                    )}
                </React.Fragment>
            ))}
            <Button size="sm" onClick={handleAddRule} className="px-3">
                <Plus className="mr-1" size={16} />And
            </Button>
        </div>
    );
};

const OrSeparator: FC = () => (
    <div className="flex items-center my-4">
        <hr className="flex-grow opacity-25" />
        <span className="mx-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[1px]">Or</span>
        <hr className="flex-grow opacity-25" />
    </div>
);

const RulesSeparator: FC = () => (
    <div className="flex items-center my-4">
        <hr className="flex-grow opacity-25" />
        <span className="mx-4 font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[1px]">Rules</span>
        <hr className="flex-grow opacity-25" />
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
        <div className="flex flex-col gap-2">
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
                    <Plus className="mr-1" size={16} />Or
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
        (name === "" || !show) ? undefined : [ProtoPath(rules.method.get), index, name],
        ProtoESFetcher(rules.method.get, create(rule_indexSchema, { index, name })),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false }
    )

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
                        <div className="flex flex-col gap-6">
                            <SettingsBox>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <SettingEnumSelectVertical
                                            label="Mode"
                                            type={modeSchema}
                                            value={rule.mode}
                                            onChange={(v) => setRule({ ...rule, mode: v }, false)}
                                            filter={(v) => v.number !== mode.bypass}
                                        />
                                    </div>
                                    <div>
                                        <SettingInputVertical
                                            label="Tag"
                                            value={rule.tag}
                                            onChange={(v) => setRule({ ...rule, tag: v }, false)}
                                            placeholder="Optional tag"
                                        />
                                    </div>
                                    <div>
                                        <SettingEnumSelectVertical
                                            label="Resolve Strategy"
                                            type={resolve_strategySchema}
                                            value={rule.resolveStrategy}
                                            onChange={(v) => setRule({ ...rule, resolveStrategy: v }, false)}
                                        />
                                    </div>
                                    <div>
                                        <SettingEnumSelectVertical
                                            label="UDP proxy Fqdn"
                                            type={udp_proxy_fqdn_strategySchema}
                                            value={rule.udpProxyFqdnStrategy}
                                            onChange={(v) => setRule({ ...rule, udpProxyFqdnStrategy: v }, false)}
                                            format={(v) => v === udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default ? "global" : udp_proxy_fqdn_strategySchema.values.find(x => x.number === v)?.name || ""}
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
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
                                    className="flex items-center opacity-75 text-[0.8rem]"
                                    onClick={() => setShowDebug(!showDebug)}
                                    size="sm"
                                >
                                    {showDebug ? <ChevronDown className="mr-1" /> : <ChevronRight className="mr-1" />}
                                    {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                                </Button>

                                {showDebug && (
                                    <div className="mt-3">
                                        <pre className="text-xs bg-gray-100 dark:bg-zinc-800 p-3 rounded-md overflow-auto font-mono border border-gray-500/10" style={{ maxHeight: '300px', fontSize: '0.75rem' }}>
                                            {toJsonString(rulev2Schema, rule, { prettySpaces: 2 })}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className="flex justify-between gap-2 border-t-0">
                    <Button variant="outline-danger" onClick={() => { onHide(); onDelete(); }}>
                        <Trash className="mr-2" size={16} />Delete Rule
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={onHide}>Cancel</Button>
                        <Button disabled={loadding} onClick={saveRule}>
                            {loadding ? <Spinner size="sm" /> : <><Check className="mr-2" size={16} />Save</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
