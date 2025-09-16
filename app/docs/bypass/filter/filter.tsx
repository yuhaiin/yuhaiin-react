"use client";

import { create, toJsonString } from '@bufbuild/protobuf';
import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { Button, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import Select, { CSSObjectWithLabel } from 'react-select';
import useSWR from 'swr';
import Loading from '../../common/loading';
import { FetchProtobuf, ProtoESFetcher, ProtoPath } from '../../common/proto';
import { SettingSelect, SettingTypeSelect } from '../../common/switch';
import { GlobalToastContext } from '../../common/toast';
import { SettingInputText } from '../../config/components';
import { hostSchema, inboundSchema, mode, modeSchema, network_network_type, networkSchema, or, orSchema, portSchema, processSchema, resolve_strategySchema, rule, ruleSchema, rulev2Schema, udp_proxy_fqdn_strategy, udp_proxy_fqdn_strategySchema } from '../../pbes/config/bypass/bypass_pb';
import { rule_indexSchema, rule_save_requestSchema, rules } from '../../pbes/config/grpc/config_pb';


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
                            value: create(inboundSchema, { name: value })
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
            }
        } else {
            switch (v) {
                case 'inbound':
                    onUpdate(create(ruleSchema, {
                        object: {
                            case: "inbound",
                            value: create(inboundSchema, { names: value })
                        }
                    }))
                    break;
            }
        }
    };

    const valuesContext = useContext(FilterContext)

    return (
        <InputGroup className="mb-3">
            <div className='form-control p-0' style={{ flex: '0 0 35%' }}>
                <Select
                    styles={{
                        indicatorSeparator: () => ({ display: "none" }),
                        control: (base: CSSObjectWithLabel) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            "&:hover": {
                                border: "none",
                            },
                        })
                    }}
                    menuShouldScrollIntoView={false}
                    value={{ value: String(rule.object.case), label: String(rule.object.case) }}
                    onChange={(e) => handleUpdate(e.value, "")}
                    options={[
                        { value: "host", label: "Host" },
                        { value: "process", label: "Process" },
                        { value: "inbound", label: "Inbound" },
                        { value: "network", label: "Network" },
                        { value: "port", label: "Port" },
                    ]}
                />
            </div>

            {
                rule.object.case == "host" &&
                <Select
                    className='form-control p-0'
                    styles={{
                        indicatorSeparator: () => ({ display: "none" }),
                        control: (base: CSSObjectWithLabel) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            "&:hover": {
                                border: "none",
                            },
                        })
                    }}
                    menuShouldScrollIntoView={false}
                    value={{ value: rule.object.value.list, label: rule.object.value.list }}
                    onChange={(e) => handleUpdate("host", e.value)}
                    options={valuesContext.Lists.map((v) => ({ value: v, label: v }))}
                />
            }

            {
                rule.object.case == "inbound" &&
                <Select
                    className='form-control p-0'
                    styles={{
                        indicatorSeparator: () => ({ display: "none" }),
                        control: (base: CSSObjectWithLabel) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            "&:hover": {
                                border: "none",
                            },
                        })
                    }}
                    isMulti
                    closeMenuOnSelect={false}
                    menuShouldScrollIntoView={false}
                    options={valuesContext.Inbounds.map((v) => ({ value: v, label: v }))}
                    value={rule.object.value.names.map((v) => ({ value: v, label: v }))}
                    onChange={(v) => handleUpdate("inbound", v.map((v) => v.value))}
                />
            }

            {
                rule.object.case == "process" &&
                <Select
                    className='form-control p-0'
                    styles={{
                        indicatorSeparator: () => ({ display: "none" }),
                        control: (base: CSSObjectWithLabel) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            "&:hover": {
                                border: "none",
                            },
                        })
                    }}
                    menuShouldScrollIntoView={false}
                    value={{ value: rule.object.value.list, label: rule.object.value.list }}
                    onChange={(e) => handleUpdate("process", e.value)}
                    options={valuesContext.Lists.map((v) => ({ value: v, label: v }))}
                />
            }

            {
                rule.object.case == "network" &&
                <Select
                    className='form-control p-0'
                    styles={{
                        indicatorSeparator: () => ({ display: "none" }),
                        control: (base: CSSObjectWithLabel) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            "&:hover": {
                                border: "none",
                            },
                        })
                    }}
                    menuShouldScrollIntoView={false}
                    value={{
                        value: rule.object.value.network === network_network_type.tcp ? "tcp" : "udp",
                        label: rule.object.value.network === network_network_type.tcp ? "tcp" : "udp"
                    }}
                    onChange={(e) => handleUpdate("network", e.value)}
                    options={[{ value: "tcp", label: "tcp" }, { value: "udp", label: "udp" }]}
                />
            }

            {
                rule.object.case == "port" &&
                <Form.Control
                    type="text"
                    value={rule.object.value.ports}
                    onChange={(e) => handleUpdate("port", e.target.value)}
                />
            }

            <Button variant="outline-danger" onClick={onRemove}>
                <i className="bi bi-x-lg" />
            </Button>
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
        <div className="border p-3 rounded">
            {group.rules.map((rule, index) => (
                <React.Fragment key={index}>
                    <RuleRow
                        rule={rule}
                        onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
                        onRemove={() => handleRemoveRule(index)}
                    />
                    {index < group.rules.length - 1 && (
                        <div className="ms-3 mb-3 fw-bold">And</div>
                    )}
                </React.Fragment>
            ))}
            <Button variant="outline-primary" size="sm" onClick={handleAddRule}>
                + And
            </Button>
        </div>
    );
};

const OrSeparator: FC = () => (
    <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1" />
        <span className="mx-2 fw-bold text-muted">Or</span>
        <hr className="flex-grow-1" />
    </div>
);

const RulesSeparator: FC = () => (
    <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1" />
        <span className="mx-2 fw-bold text-muted">Rule</span>
        <hr className="flex-grow-1" />
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
        <>
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
            <Button className="mt-3" variant="outline-success" onClick={handleAddGroup}>
                + Or
            </Button>
        </>
    );
};


export const FilterModal: FC<{ index: number, name: string, show: boolean, onHide: () => void }> = ({ index, name, show, onHide }) => {
    const ctx = useContext(GlobalToastContext);

    const [loadding, setLoadding] = useState(false);


    // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
    // isLoading becomes true when there is an ongoing request and data is not loaded yet.
    const { data: rule, error, isLoading, isValidating, mutate: setRule } = useSWR(
        name === "" ? undefined : ProtoPath(rules.method.get),
        ProtoESFetcher(rules.method.get, create(rule_indexSchema, { index, name })),
        {
            shouldRetryOnError: false,
            keepPreviousData: false,
            revalidateOnFocus: false,
        })

    useEffect(() => { setRule(); }, [name, index, setRule])


    const saveRule = () => {
        setLoadding(true)

        FetchProtobuf(rules.method.save, create(rule_save_requestSchema, { index: create(rule_indexSchema, { index, name }), rule: rule }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info(`save ${name} successful`)
                    setRule()
                } else {
                    const msg = error.msg;
                    ctx.Error(msg)
                    console.error(error.code, msg)
                }

                setLoadding(false)
            })
    }

    const filterContext = useContext(FilterContext);

    return <>
        <Modal
            show={show}
            scrollable
            aria-labelledby="contained-modal-title-vcenter"
            size='xl'
            onHide={() => { onHide() }}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {rule ? rule.name : "Loading..."}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error ?
                    <>
                        <h4 className="text-center my-2">{error.code} - {error.msg}</h4>
                        <pre className="text-center my-2 text-danger lead">{error.raw}</pre>
                    </> :
                    isValidating || isLoading || !rule ? <Loading /> :
                        <>
                            <SettingTypeSelect label='Mode' type={modeSchema} filter={(v) => v.number !== mode.bypass} value={rule.mode} onChange={(v) => setRule({ ...rule, mode: v }, false)} emptyChoose />
                            <SettingInputText label='Tag' value={rule.tag} onChange={(e: string) => setRule({ ...rule, tag: e }, false)} />
                            <SettingTypeSelect label='Resolve Strategy' type={resolve_strategySchema} value={rule.resolveStrategy} onChange={(e) => setRule({ ...rule, resolveStrategy: e }, false)} emptyChoose />
                            <SettingTypeSelect label='UDP proxy Fqdn'
                                type={udp_proxy_fqdn_strategySchema}
                                format={(v) => v === udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default ? "global" : udp_proxy_fqdn_strategy[v]}
                                value={rule.udpProxyFqdnStrategy}
                                onChange={(e) => setRule({ ...rule, udpProxyFqdnStrategy: e }, false)}
                                emptyChoose
                            />
                            <SettingSelect
                                value={rule.resolver}
                                values={filterContext.Resolvers}
                                label='Resolver'
                                onChange={(v) => setRule({ ...rule, resolver: v }, false)}
                                emptyChoose
                                emptyChooseName="Global"
                            />
                            <FilterBuilder groups={rule.rules} onUpdateGroups={(groups) => { setRule({ ...rule, rules: groups }, false) }} />


                            <hr className="my-4" />
                            <h5>Current State (for Debugging):</h5>
                            <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                                {toJsonString(rulev2Schema, rule, { prettySpaces: 2 })}
                            </pre>
                        </>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="outline-primary"
                    disabled={loadding}
                    onClick={() => { saveRule() }}
                >
                    {loadding && <Spinner animation="border" size="sm" />}    Save
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}
