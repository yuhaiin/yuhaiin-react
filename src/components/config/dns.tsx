import React, { useState } from 'react';
import { Form, FormGroup, InputGroup, Card, Row, Col, Button, Tabs, Tab, FloatingLabel } from 'react-bootstrap';


type dnsClientConfig = {
    host: string,
    type: string,
    subnet: string,
    tls_servername: string,
}

export type DnsConfig = {
    server: string,
    fakedns: boolean,
    fakedns_ip_range: string,
    resolve_remote_domain: boolean,
    remote: dnsClientConfig,
    local: dnsClientConfig,
    bootstrap: dnsClientConfig,
    hosts: { [key: string]: string },
}

export const DefaultDnsConfig: DnsConfig = {
    "server": "",
    "fakedns": false,
    "fakedns_ip_range": "",
    "resolve_remote_domain": false,
    "remote": {
        "host": "",
        "type": "udp",
        "subnet": "",
        "tls_servername": ""
    },
    "local": {
        "host": "",
        "type": "udp",
        "subnet": "",
        "tls_servername": ""
    },
    "bootstrap": {
        "host": "",
        "type": "udp",
        "subnet": "",
        "tls_servername": ""
    },
    "hosts": {}
}

type DNSProps = {
    data: DnsConfig,
    onChange: (x: DnsConfig) => void,
}

const DNS = React.memo((props: DNSProps) => {

    const updateDNS = (x: (x: DnsConfig) => void) => {
        let v = props.data;
        x(v)
        props.onChange(v)
    }

    return (

        <>
            <InputGroup className="mb-2">
                <InputGroup.Text>Server</InputGroup.Text>
                <Form.Control value={props.data.server} onChange={(v) => updateDNS((x) => x.server = v.target.value)} />
            </InputGroup>

            <Card.Title>FakeDNS</Card.Title>
            <Form.Check
                type='switch'
                className='mb-2'
                checked={props.data.fakedns}
                onChange={() => updateDNS((x) => x.fakedns = !x.fakedns)}
                label="Enabled"
            />
            <FloatingLabel label="Fake IP Range" className="mb-2" >
                <Form.Control placeholder='10.0.2.1/24' value={props.data.fakedns_ip_range} onChange={(v) => updateDNS((x) => x.fakedns_ip_range = v.target.value)} />
            </FloatingLabel>


            <Card.Title>Local DNS</Card.Title>
            <FloatingLabel label="Host" className="mb-2" >
                <Form.Control value={props.data.local.host} onChange={(v) => updateDNS((x) => x.local.host = v.target.value)} />
            </FloatingLabel>
            <FloatingLabel label="Type" className="mb-2" >
                <DNSTypeSelect value={props.data.local.type} onChange={(v) => updateDNS((x) => x.local.type = v)} />
            </FloatingLabel>
            <FloatingLabel label="Subnet" className="mb-2" >
                <Form.Control placeholder='10.0.2.1'
                    value={props.data.local.subnet} onChange={(v) => updateDNS((x) => x.local.subnet = v.target.value)} />
            </FloatingLabel>
            <FloatingLabel label="SNI" className="mb-2" >
                <Form.Control placeholder='www.example.com'
                    value={props.data.local.tls_servername} onChange={(v) => updateDNS((x) => x.local.tls_servername = v.target.value)} />
            </FloatingLabel>


            <Card.Title>Remote DNS</Card.Title>
            <Form.Check
                className='mb-2'
                type='switch'
                checked={props.data.resolve_remote_domain}
                onChange={() => updateDNS((x) => x.resolve_remote_domain = !x.resolve_remote_domain)}
                label="resolve remote domain"
            />
            <FloatingLabel label="Host" className="mb-2" >
                <Form.Control value={props.data.remote.host} onChange={(v) => updateDNS((x) => x.remote.host = v.target.value)} />
            </FloatingLabel>
            <FloatingLabel label="Type" className="mb-2" >
                <DNSTypeSelect value={props.data.remote.type} onChange={(v) => updateDNS((x) => x.remote.type = v)} />
            </FloatingLabel>
            <FloatingLabel label="Subnet" className="mb-2" >
                <Form.Control placeholder='10.0.2.1' value={props.data.remote.subnet} onChange={(v) => updateDNS((x) => x.remote.subnet = v.target.value)} />
            </FloatingLabel>
            <FloatingLabel label="SNI" className="mb-2" >
                <Form.Control placeholder='www.example.com' value={props.data.remote.tls_servername} onChange={(v) => updateDNS((x) => x.remote.tls_servername = v.target.value)} />
            </FloatingLabel>


            <Card.Title>Bootstrap DNS</Card.Title>
            <FloatingLabel label="Host" className="mb-2" >
                <Form.Control value={props.data.bootstrap.host} onChange={(v) => updateDNS((x) => x.bootstrap.host = v.target.value)} />
            </FloatingLabel>
            <FloatingLabel label="Type" className="mb-2" >
                <DNSTypeSelect value={props.data.bootstrap.type} onChange={(v) => updateDNS((x) => x.bootstrap.type = v)} />
            </FloatingLabel>
            <FloatingLabel label="Subnet" className="mb-2" >
                <Form.Control placeholder='10.0.2.1' value={props.data.bootstrap.subnet} onChange={(v) => updateDNS((x) => x.bootstrap.subnet = v.target.value)} />
            </FloatingLabel>
            <FloatingLabel label="SNI" className="mb-2" >
                <Form.Control placeholder='www.example.com' value={props.data.bootstrap.tls_servername} onChange={(v) => updateDNS((x) => x.bootstrap.tls_servername = v.target.value)} />
            </FloatingLabel>

        </>)
})

function DNSTypeSelect({ value = "", onChange = (value: string) => { } }) {
    return (

        <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="udp">UDP</option>
            <option value="tcp">TCP</option>
            <option value="doh">DOH</option>
            <option value="dot">DOT</option>
            <option value="doq">DOQ</option>
            <option value="doh3">DOH3</option>
        </Form.Select>
    )
}

export default DNS;