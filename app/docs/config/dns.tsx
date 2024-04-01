import React, { useState } from 'react';
import { Form, InputGroup, Card, Row, Col, Button } from 'react-bootstrap';
import { SettingInputText, NewItemList } from './components';
import { SettingCheck } from "../common/switch";
import { dns_config, type } from '../pbes/config/dns/dns_pb';

type DNSProps = {
    data: dns_config,
    onChange: (x: dns_config) => void,
}

const DNS = React.memo((props: DNSProps) => {

    const [newHosts, setNewHosts] = useState({ key: "", value: "" })

    const updateDNS = (x: (x: dns_config) => void) => {
        x(props.data)
        props.onChange(props.data)
    }

    return (
        <>
            <SettingInputText label='Server' value={props.data.server} onChange={(v) => updateDNS((x) => x.server = v)} />

            <hr />

            <Card.Title>FakeDNS</Card.Title>

            <SettingCheck label="Enabled"
                checked={props.data.fakedns}
                onChange={() => updateDNS((x) => x.fakedns = !x.fakedns)} />
            <SettingInputText label='IPv4 Range' value={props.data.fakednsIpRange} onChange={(v) => updateDNS((x) => x.fakednsIpRange = v)} />
            <SettingInputText label='IPv6 Range' value={props.data.fakednsIpv6Range} onChange={(v) => updateDNS((x) => x.fakednsIpv6Range = v)} />


            <NewItemList
                title="Whitelist"
                data={props.data.fakednsWhitelist}
                onChange={(v) => updateDNS((x) => {
                    if (!v) return
                    x.fakednsWhitelist = v
                })}
            />

            <hr />

            <Card.Title>Local DNS</Card.Title>
            <SettingInputText label='Host' value={props.data.local?.host} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local!!.host = v })} />
            <SettingDNSTypeSelect label='Type' value={props.data.local?.type} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local!!.type = v })} />
            <SettingInputText label='Subnet' value={props.data.local?.subnet} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local!!.subnet = v })} />
            <SettingInputText label='SNI' value={props.data.local?.tlsServername} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local!!.tlsServername = v })} />


            <hr />

            <Card.Title>Remote DNS</Card.Title>
            <SettingCheck label="Use IP" checked={props.data.resolveRemoteDomain} onChange={() => updateDNS((x) => x.resolveRemoteDomain = !x.resolveRemoteDomain)} />
            <SettingInputText label='Host' value={props.data.remote?.host} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote!!.host = v })} />
            <SettingDNSTypeSelect label='Type' value={props.data.remote?.type} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote!!.type = v })} />
            <SettingInputText label='Subnet' value={props.data.remote?.subnet} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote!!.subnet = v })} />
            <SettingInputText label='SNI' value={props.data.remote?.tlsServername} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote!!.tlsServername = v })} />


            <hr />

            <Card.Title>Bootstrap DNS</Card.Title>
            <SettingInputText label='Host' value={props.data.bootstrap?.host} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap!!.host = v })} />
            <SettingDNSTypeSelect label='Type' value={props.data.bootstrap?.type} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap!!.type = v })} />
            <SettingInputText label='Subnet' value={props.data.bootstrap?.subnet} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap!!.subnet = v })} />
            <SettingInputText label='SNI' value={props.data.bootstrap?.tlsServername} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap!!.tlsServername = v })} />


            <hr />

            <Card.Title>Hosts</Card.Title>
            {
                Object.entries(props.data.hosts)
                    .sort(([a], [b]) => { return a > b ? -1 : 1 })
                    .map(([k, v]) =>
                        <InputGroup className="mb-2" key={"hosts" + k}>
                            <Form.Control readOnly value={k} />
                            <InputGroup.Text><i className="bi bi-arrow-right"></i></InputGroup.Text>
                            <Form.Control
                                value={v}
                                onChange={(e) => updateDNS((x) => x.hosts[k] = e.target.value)}
                            />
                            <Button variant='outline-danger' onClick={() => updateDNS((x) => delete x.hosts[k])}>
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        </InputGroup>
                    )
            }
            <InputGroup className="mb-2" >
                <Form.Control value={newHosts.key} onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })} />
                <InputGroup.Text><i className="bi bi-arrow-right"></i></InputGroup.Text>
                <Form.Control
                    value={newHosts.value}
                    onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                />
                <Button variant='outline-success' onClick={() => {
                    if (newHosts.key === "" || props.data.hosts[newHosts.key] !== undefined) return

                    updateDNS((x) => x.hosts[newHosts.key] = newHosts.value)
                }}>
                    <i className="bi bi-plus-lg"></i>
                </Button>
            </InputGroup>


        </>)
})


function SettingDNSTypeSelect(props: { label: string, value?: type | null, onChange: (value: type) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={type[(props.value === undefined || props.value === null) ? type.udp : props.value]} onChange={(e) => props.onChange(type[e.target.value])}>
                    <option value={type[type.udp]}>UDP</option>
                    <option value={type[type.tcp]}>TCP</option>
                    <option value={type[type.doh]}>DOH</option>
                    <option value={type[type.dot]}>DOT</option>
                    <option value={type[type.doq]}>DOQ</option>
                    <option value={type[type.doh3]}>DOH3</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}

export default DNS;