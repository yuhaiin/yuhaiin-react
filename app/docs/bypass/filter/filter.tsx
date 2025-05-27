"use client";

import { create, toJsonString } from '@bufbuild/protobuf';
import React, { createContext, FC, useContext } from 'react';
import { Button, Container, Form, InputGroup, Modal } from 'react-bootstrap';
import { SettingSelect, SettingTypeSelect } from '../../common/switch';
import { SettingInputText } from '../../config/components';
import { hostSchema, inboundSchema, mode, modeSchema, or, orSchema, processSchema, resolve_strategySchema, rule, ruleSchema, rulev2, rulev2Schema, udp_proxy_fqdn_strategy, udp_proxy_fqdn_strategySchema } from '../../pbes/config/bypass/bypass_pb';


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
    const handleUpdate = (v: string, value: string) => {
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
        }
    };

    const valuesContext = useContext(FilterContext)

    return (
        <InputGroup className="mb-3">
            <Form.Select
                value={rule.object.case}
                onChange={(e) => handleUpdate(e.target.value, "")}
                style={{ flex: '0 0 25%' }}
            >
                <option value="">Select...</option>
                <option key={"host"} value={"host"}>Host</option>
                <option key={"process"} value={"process"}>Process</option>
                <option key={"inbound"} value={"inbound"}>Inbound</option>
            </Form.Select>

            {/* <Form.Select style={{ flex: '0 0 20%' }}            >
                <option value="">=</option>
            </Form.Select> */}


            {
                rule.object.case == "host" &&
                <Form.Select
                    value={valuesContext.Lists.indexOf(rule.object.value.list) == -1 ? "" : rule.object.value.list}
                    onChange={(e) => handleUpdate("host", e.target.value)}
                >
                    <option value="">Choose...</option>
                    {
                        valuesContext.Lists.map((v) => <option key={v} value={v}>{v}</option>)
                    }
                </Form.Select>
            }

            {
                rule.object.case == "inbound" &&
                <Form.Select
                    value={valuesContext.Inbounds.indexOf(rule.object.value.name) == -1 ? "" : rule.object.value.name}
                    onChange={(e) => handleUpdate("inbound", e.target.value)}
                >
                    <option value="">Choose...</option>
                    {
                        valuesContext.Inbounds.map((v) => <option key={v} value={v}>{v}</option>)
                    }
                </Form.Select>
            }

            {
                rule.object.case == "process" &&
                <Form.Control
                    type="text"
                    value={rule.object.value.list}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate("process", e.target.value)}
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
        <Container className="my-4 p-4 border rounded shadow-sm">
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
        </Container>
    );
};


export const FilterModal: FC<{ rule: rulev2, onChange: (groups: rulev2) => void, show: boolean, onHide: () => void }> = ({ rule, onChange, show, onHide }) => {
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
                    {rule.name}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <SettingTypeSelect label='Mode' type={modeSchema} filter={(v) => v.number !== mode.bypass} value={rule.mode} onChange={(v) => onChange({ ...rule, mode: v })} />
                <SettingInputText label='Tag' value={rule.tag} onChange={(e) => onChange({ ...rule, tag: e })} />
                <SettingTypeSelect label='Resolve Strategy' type={resolve_strategySchema} value={rule.resolveStrategy} onChange={(e) => onChange({ ...rule, resolveStrategy: e })} />
                <SettingTypeSelect label='UDP proxy Fqdn'
                    type={udp_proxy_fqdn_strategySchema}
                    format={(v) => v === udp_proxy_fqdn_strategy.udp_proxy_fqdn_strategy_default ? "global" : udp_proxy_fqdn_strategy[v]}
                    value={rule.udpProxyFqdnStrategy}
                    onChange={(e) => onChange({ ...rule, udpProxyFqdnStrategy: e })}
                />
                <SettingSelect value={rule.resolver} values={filterContext.Resolvers} label='Resolver' onChange={(v) => onChange({ ...rule, resolver: v })} emptyChoose />
                <FilterBuilder groups={rule.rules} onUpdateGroups={(groups) => { onChange({ ...rule, rules: groups }) }} />


                <hr className="my-4" />
                <h5>Current State (for Debugging):</h5>
                <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                    {toJsonString(rulev2Schema, rule, { prettySpaces: 2 })}
                </pre>
            </Modal.Body>
        </Modal>
    </>
}
