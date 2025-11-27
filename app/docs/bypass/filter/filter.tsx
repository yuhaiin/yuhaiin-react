"use client";

import { create, toJsonString } from '@bufbuild/protobuf';
import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { Button, Card, Dropdown, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import useSWR from 'swr';
import Loading from '../../common/loading';
import { FetchProtobuf, ProtoESFetcher, ProtoPath } from '../../common/proto';
import { SettingSelect, SettingTypeSelect } from '../../common/switch';
import { GlobalToastContext } from '../../common/toast';
import { SettingInputText } from '../../config/components';
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
            <Form.Select value={rule.object.case} onChange={(e) => handleUpdate(e.target.value, "")} style={{ flex: "0 1 100px" }}>
                {
                    [
                        { value: "host", label: "Host" },
                        { value: "process", label: "Process" },
                        { value: "inbound", label: "Inbound" },
                        { value: "network", label: "Network" },
                        { value: "port", label: "Port" },
                        { value: "geoip", label: "Geoip" },
                    ].
                        map((v) => <option key={v.value} value={v.value}>{v.label}</option>)
                }

            </Form.Select>

            {
                rule.object.case == "host" &&
                <>
                    <Form.Select value={rule.object.value.list} onChange={(e) => handleUpdate("host", e.target.value)}>
                        {
                            valuesContext.Lists.map((v) => <option key={v} value={v}>{v}</option>)
                        }
                    </Form.Select>
                </>
            }

            {
                rule.object.case == "inbound" &&
                <>
                    <DropdownSelect
                        values={rule.object.value.names}
                        items={valuesContext.Inbounds}
                        onUpdate={(v) => handleUpdate("inbound", v)}
                    />
                </>
            }

            {
                rule.object.case == "process" &&
                <>
                    <Form.Select value={rule.object.value.list} onChange={(e) => handleUpdate("process", e.target.value)}>
                        {
                            valuesContext.Lists.map((v) => <option key={v} value={v}>{v}</option>)
                        }
                    </Form.Select>
                </>
            }

            {
                rule.object.case == "network" &&
                <>
                    <Form.Select value={rule.object.value.network === network_network_type.tcp ? "tcp" : "udp"} onChange={(e) => handleUpdate("network", e.target.value)}>
                        {
                            [
                                { value: "tcp", label: "tcp" },
                                { value: "udp", label: "udp" },
                            ].map((v) => <option key={v.value} value={v.value}>{v.label}</option>)
                        }
                    </Form.Select>
                </>
            }

            {
                rule.object.case == "port" &&
                <Form.Control
                    type="text"
                    value={rule.object.value.ports}
                    onChange={(e) => handleUpdate("port", e.target.value)}
                />
            }

            {
                rule.object.case == "geoip" &&
                <Form.Control
                    type="text"
                    value={rule.object.value.countries}
                    onChange={(e) => handleUpdate("geoip", e.target.value)}
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

                            <Card className='mt-2'>
                                <Card.Body>
                                    <Card.Title>Current State (for Debugging):</Card.Title>
                                    <pre>
                                        {toJsonString(rulev2Schema, rule, { prettySpaces: 2 })}
                                    </pre>
                                </Card.Body>
                            </Card>
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


const DropdownSelect: FC<{ values: string[], items: string[], onUpdate: (x: string[]) => void }> = ({ values, items, onUpdate: onAdd }) => {
    return <Dropdown autoClose="outside">
        <Dropdown.Toggle variant='outline-primary' as={Form.Select} defaultValue="">
            <option value="" hidden>{values.length === 0 ? "Choose..." : values.join(", ")}</option>
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {
                items.map((v) =>
                    <Dropdown.Item
                        key={v}
                        onClick={() => onAdd(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])}
                        active={values.includes(v)}
                    >
                        {v}
                    </Dropdown.Item>)
            }
        </Dropdown.Menu>
    </Dropdown>
}