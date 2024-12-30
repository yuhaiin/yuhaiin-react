import { create } from '@bufbuild/protobuf';
import { FC, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { SettingCheck, SettingTypeSelect } from "../common/switch";
import { Props } from '../node/tools';
import { dns, dns_config, dnsSchema, typeSchema } from '../pbes/config/dns/dns_pb';
import { Container, NewItemList, SettingInputText } from './components';

const DNS: FC<Props<dns_config>> = (props) => {
    const [newHosts, setNewHosts] = useState({ key: "", value: "" })

    return (
        <>
            <SettingInputText label='Server' value={props.value.server} onChange={(v) => props.onChange({ ...props.value, server: v })} />

            <Container title="FakeDNS" hideClose>
                <>
                    <SettingCheck label="Enabled"
                        checked={props.value.fakedns}
                        onChange={() => props.onChange({ ...props.value, fakedns: !props.value.fakedns })} />
                    <SettingInputText label='IPv4 Range' value={props.value.fakednsIpRange} onChange={(v) => props.onChange({ ...props.value, fakednsIpRange: v })} />
                    <SettingInputText label='IPv6 Range' value={props.value.fakednsIpv6Range} onChange={(v) => props.onChange({ ...props.value, fakednsIpv6Range: v })} />


                    <NewItemList
                        title="Whitelist"
                        data={props.value.fakednsWhitelist}
                        onChange={(v) => props.onChange({ ...props.value, fakednsWhitelist: v })}
                    />
                </>
            </Container>

            <Single title='Local DNS' value={props.value.local ?? create(dnsSchema, {})} onChange={(v) => props.onChange({ ...props.value, local: v })} />
            <Single title='Remote DNS' value={props.value.remote ?? create(dnsSchema, {})} onChange={(v) => props.onChange({ ...props.value, remote: v })} />
            <Single title='Bootstrap DNS' value={props.value.bootstrap ?? create(dnsSchema, {})} onChange={(v) => props.onChange({ ...props.value, bootstrap: v })} />

            <Container title="Hosts" className="mt-2" hideClose>
                <>
                    {
                        Object.entries(props.value.hosts)
                            .sort(([a], [b]) => { return a > b ? -1 : 1 })
                            .map(([k, v]) =>
                                <InputGroup className="mb-2" key={"hosts" + k}>
                                    <Form.Control readOnly value={k} />
                                    <InputGroup.Text><i className="bi bi-arrow-right"></i></InputGroup.Text>
                                    <Form.Control
                                        value={v}
                                        onChange={(e) => props.onChange({ ...props.value, hosts: { ...props.value.hosts, [k]: e.target.value } })}
                                    />
                                    <Button variant='outline-danger' onClick={() => {
                                        const hosts = { ...props.value.hosts }
                                        delete hosts[k]
                                        props.onChange({ ...props.value, hosts: hosts })
                                    }}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </InputGroup>
                            )
                    }
                    <InputGroup>
                        <Form.Control value={newHosts.key} onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })} />
                        <InputGroup.Text><i className="bi bi-arrow-right"></i></InputGroup.Text>
                        <Form.Control
                            value={newHosts.value}
                            onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                        />
                        <Button variant='outline-success' onClick={() => {
                            if (newHosts.key === "" || props.value.hosts[newHosts.key] !== undefined) return
                            props.onChange({ ...props.value, hosts: { ...props.value.hosts, [newHosts.key]: newHosts.value } })
                        }}>
                            <i className="bi bi-plus-lg"></i>
                        </Button>
                    </InputGroup>
                </>
            </Container>
        </>)
}

const Single: FC<{ value: dns, onChange: (x: dns) => void, title: string }> = ({ title, value, onChange }) => {
    return <Container title={title} className='mt-2' hideClose>
        <>
            <SettingInputText label='Host' value={value.host} onChange={(v) => onChange({ ...value, host: v })} />
            <SettingTypeSelect label='Type' type={typeSchema} value={value.type} onChange={(v) => onChange({ ...value, type: v })} />
            <SettingInputText label='Subnet' value={value.subnet} onChange={(v) => onChange({ ...value, subnet: v })} />
            <SettingInputText className='' label='SNI' value={value.tlsServername} onChange={(v) => onChange({ ...value, tlsServername: v })} />
        </>
    </Container>
}

export default DNS;