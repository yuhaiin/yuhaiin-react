import React, { useState } from 'react';
import { Form, InputGroup, Card, Row, Col, Button } from 'react-bootstrap';
import { SettingInputText, SettingCheck } from './components';
import {
    config as DnsConfig,
    type as DnsType,
    typeToJSON as DnsTypeToJSON,
    typeFromJSON as DnsTypeFromJSON,
} from '../../protos/config/dns/dns';

export const DefaultDnsConfig: DnsConfig = {
    server: "",
    fakedns: false,
    fakedns_ip_range: "",
    resolve_remote_domain: false,
    remote: {
        host: "",
        type: DnsType.udp,
        subnet: "",
        tls_servername: ""
    },
    local: {
        host: "",
        type: DnsType.udp,
        subnet: "",
        tls_servername: ""
    },
    bootstrap: {
        host: "",
        type: DnsType.udp,
        subnet: "",
        tls_servername: ""
    },
    hosts: {}
}

type DNSProps = {
    data: DnsConfig,
    onChange: (x: DnsConfig) => void,
}

const DNS = React.memo((props: DNSProps) => {

    const [newHosts, setNewHosts] = useState({ key: "", value: "" })

    const updateDNS = (x: (x: DnsConfig) => void) => {
        let v = props.data;
        x(v)
        props.onChange(v)
    }

    return (
        <>
            <SettingInputText label='Server' value={props.data.server} onChange={(v) => updateDNS((x) => x.server = v)} />

            <hr />

            <Card.Title>FakeDNS</Card.Title>

            <SettingCheck label="Enabled"
                checked={props.data.fakedns}
                onChange={() => updateDNS((x) => x.fakedns = !x.fakedns)} />
            <SettingInputText label='Fake IP Range' value={props.data.fakedns_ip_range} onChange={(v) => updateDNS((x) => x.fakedns_ip_range = v)} />


            <hr />

            <Card.Title>Local DNS</Card.Title>
            <SettingInputText label='Host' value={props.data.local?.host} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local.host = v })} />
            <SettingDNSTypeSelect label='Type' value={props.data.local?.type} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local.type = v })} />
            <SettingInputText label='Subnet' value={props.data.local?.subnet} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local.subnet = v })} />
            <SettingInputText label='SNI' value={props.data.local?.tls_servername} onChange={(v) => updateDNS((x) => { if (x.local !== undefined) x.local.tls_servername = v })} />


            <hr />

            <Card.Title>Remote DNS</Card.Title>
            <SettingCheck label="Use IP" checked={props.data.resolve_remote_domain} onChange={() => updateDNS((x) => x.resolve_remote_domain = !x.resolve_remote_domain)} />
            <SettingInputText label='Host' value={props.data.remote?.host} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote.host = v })} />
            <SettingDNSTypeSelect label='Type' value={props.data.remote?.type} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote.type = v })} />
            <SettingInputText label='Subnet' value={props.data.remote?.subnet} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote.subnet = v })} />
            <SettingInputText label='SNI' value={props.data.remote?.tls_servername} onChange={(v) => updateDNS((x) => { if (x.remote !== undefined) x.remote.tls_servername = v })} />


            <hr />

            <Card.Title>Bootstrap DNS</Card.Title>
            <SettingInputText label='Host' value={props.data.bootstrap?.host} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap.host = v })} />
            <SettingDNSTypeSelect label='Type' value={props.data.bootstrap?.type} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap.type = v })} />
            <SettingInputText label='Subnet' value={props.data.bootstrap?.subnet} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap.subnet = v })} />
            <SettingInputText label='SNI' value={props.data.bootstrap?.tls_servername} onChange={(v) => updateDNS((x) => { if (x.bootstrap !== undefined) x.bootstrap.tls_servername = v })} />



            <hr />

            <Card.Title>Hosts</Card.Title>
            {
                Object.entries(props.data.hosts).map(([k, v]) =>
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

function SettingDNSTypeSelect(props: { label: string, value: DnsType | undefined, onChange: (value: DnsType) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={DnsTypeToJSON(props.value === undefined ? DnsType.udp : props.value)} onChange={(e) => props.onChange(DnsTypeFromJSON(e.target.value))}>
                    <option value={DnsTypeToJSON(DnsType.udp)}>UDP</option>
                    <option value={DnsTypeToJSON(DnsType.tcp)}>TCP</option>
                    <option value={DnsTypeToJSON(DnsType.doh)}>DOH</option>
                    <option value={DnsTypeToJSON(DnsType.dot)}>DOT</option>
                    <option value={DnsTypeToJSON(DnsType.doq)}>DOQ</option>
                    <option value={DnsTypeToJSON(DnsType.doh3)}>DOH3</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}

export default DNS;