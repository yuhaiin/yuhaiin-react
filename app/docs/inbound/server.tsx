import { create } from '@bufbuild/protobuf';
import { FC, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { join as shlexJoin, split as shlexSplit } from 'shlex';
import { useProtoSWR } from '../common/proto';
import { SettingCheck, SettingSelect, SettingTypeSelect } from "../common/switch";
import { NewItemList, SettingInputText, SettingInputTextarea } from '../config/components';
import { TlsConfigv2 } from '../node/tls';
import { TLSServerComponents } from '../node/tls_server';
import { inbound } from '../pbes/config/grpc/config_pb';
import { aead, ech_config, ech_configSchema, http, mixed, quic, reality, redir, reverse_http, reverse_tcp, routeSchema, socks5, tcp_udp_controlSchema, tcpudp, tls, tls_auto, tproxy, tun, tun_endpoint_driverSchema, tun_platfrom_platform_darwinSchema, tun_platfromSchema, yuubinsya } from '../pbes/config/listener/listener_pb';
import { tls_configSchema as tls_config$1, tls_server_configSchema } from '../pbes/node/protocol/protocol_pb';

export const HTTPComponents = (props: { http: http, onChange: (x: http) => void }) => {
    return (
        <>
            <SettingInputText label='Username' value={props.http.username} onChange={(e: string) => props.onChange({ ...props.http, username: e })} />
            <SettingInputText label='Password' value={props.http.password} onChange={(e: string) => props.onChange({ ...props.http, password: e })} />
        </>
    )
}

export const ReverseHTTPComponents = (props: { reverse_http: reverse_http, onChange: (x: reverse_http) => void }) => {
    return (
        <>
            <SettingInputText label='Url' value={props.reverse_http.url} onChange={(e: string) => props.onChange({ ...props.reverse_http, url: e })} />
            <TlsConfigv2 value={props.reverse_http.tls ?? create(tls_config$1, {})} onChange={(x) => { props.onChange({ ...props.reverse_http, tls: x }) }} />
        </>
    )
}

export const ReverseTCPComponents = (props: { reverse_tcp: reverse_tcp, onChange: (x: reverse_tcp) => void }) => {
    return (
        <>
            <SettingInputText label='Host' value={props.reverse_tcp.host} onChange={(e: string) => props.onChange({ ...props.reverse_tcp, host: e })} />
        </>
    )
}


export const RedirComponents = (props: { redir: redir, onChange: (x: redir) => void }) => {
    return (
        <>
            <SettingInputText label='Host' value={props.redir.host} onChange={(e: string) => props.onChange({ ...props.redir, host: e })} />
        </>
    )
}


export const TProxyComponents = (props: { tproxy: tproxy, onChange: (x: tproxy) => void }) => {
    return (
        <>
            <SettingCheck label='DNS Hijacking'
                checked={props.tproxy.dnsHijacking}
                onChange={() => props.onChange({ ...props.tproxy, dnsHijacking: !props.tproxy.dnsHijacking })} />
            <SettingCheck label='Force Fake IP'
                checked={props.tproxy.forceFakeip}
                onChange={() => props.onChange({ ...props.tproxy, forceFakeip: !props.tproxy.forceFakeip })} />
            <SettingInputText label='Host' value={props.tproxy.host} onChange={(e: string) => props.onChange({ ...props.tproxy, host: e })} />
        </>
    )
}

export const Socks5Components = (props: { socks5: socks5, onChange: (x: socks5) => void }) => {
    return (
        <>
            <SettingInputText label='Username' value={props.socks5.username} onChange={(e: string) => props.onChange({ ...props.socks5, username: e })} />
            <SettingInputText label='Password' value={props.socks5.password} onChange={(e: string) => props.onChange({ ...props.socks5, password: e })} />
        </>
    )
}


export const MixedComponents = (props: { mixed: mixed, onChange: (x: mixed) => void }) => {
    return (
        <>
            <SettingInputText label='Username' value={props.mixed.username} onChange={(e: string) => props.onChange({ ...props.mixed, username: e })} />
            <SettingInputText label='Password' value={props.mixed.password} onChange={(e: string) => props.onChange({ ...props.mixed, password: e })} />
        </>
    )
}

export const TunComponents = (props: { tun: tun, onChange: (x: tun) => void }) => {
    const [postUp, setPostUp] = useState(shlexJoin(props.tun.postUp))
    const [postDown, setPostDown] = useState(shlexJoin(props.tun.postDown))

    const { data: platform } = useProtoSWR(inbound.method.platform_info)

    return (
        <>
            <SettingCheck
                checked={props.tun.skipMulticast}
                onChange={() => props.onChange({ ...props.tun, skipMulticast: !props.tun.skipMulticast })}
                label="Skip Multicast"
            />

            <SettingInputText label='Name' value={props.tun.name} onChange={(e: string) => props.onChange({ ...props.tun, name: e })} />
            <SettingInputText label='MTU' value={props.tun.mtu} onChange={(e: string) => { if (!isNaN(Number(e))) props.onChange({ ...props.tun, mtu: Number(e) }) }} />
            <SettingInputText label='IPv4' value={props.tun.portal} onChange={(e: string) => props.onChange({ ...props.tun, portal: e })} />
            <SettingInputText label='IPv6' value={props.tun.portalV6} onChange={(e: string) => props.onChange({ ...props.tun, portalV6: e })} />

            {platform?.darwin && platform?.darwin?.networkServices &&
                <SettingSelect
                    label='DNS Network Service'
                    emptyChoose
                    value={props.tun.platform?.darwin?.networkService ?? ""}
                    values={platform.darwin.networkServices}
                    onChange={(e) => props.onChange({
                        ...props.tun, platform: create(tun_platfromSchema,
                            { darwin: create(tun_platfrom_platform_darwinSchema, { networkService: e }) })
                    })}
                />
            }
            <SettingInputText label='Post Up' value={postUp}
                onChange={(e: string) => {
                    setPostUp(e)
                    try {
                        const cmds = shlexSplit(e)
                        props.onChange({ ...props.tun, postUp: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingInputText label='Post Down' value={postDown}
                onChange={(e: string) => {
                    setPostDown(e)
                    try {
                        const cmds = shlexSplit(e)
                        props.onChange({ ...props.tun, postDown: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingTypeSelect label='Stack' type={tun_endpoint_driverSchema} value={props.tun.driver} onChange={(e) => props.onChange({ ...props.tun, driver: e })} />

            <NewItemList
                title='Routes'
                textarea
                dump
                data={props.tun.route?.routes ?? []}
                onChange={(e) => {
                    props.onChange({ ...props.tun, route: { ...(props.tun.route ? props.tun.route : create(routeSchema, {})), routes: e ? e : [] } })
                }}
            />
        </>
    )
}


export const TLSAutoComponents: FC<{ tls: tls_auto, onChange: (x: tls_auto) => void }> = ({ tls, onChange }) => {
    const setEch = (onEchChange: (x: ech_config) => ech_config) => {
        const tlsConfig = { ...tls }
        if (!tls.ech) tlsConfig.ech = create(ech_configSchema, {})
        else tlsConfig.ech = { ...tls.ech }
        onEchChange(tlsConfig.ech)
        onChange({ ...tlsConfig })
    }

    return <>
        <NewItemList
            title='Next Protos'
            className='mb-2'
            data={tls?.nextProtos ?? []}
            onChange={(e) => onChange({ ...tls, nextProtos: e })}
        />

        <NewItemList
            title='Servenames'
            className='mb-2'
            data={tls?.servernames ?? []}
            onChange={(e) => onChange({ ...tls, servernames: e })}
        />

        <SettingCheck label='ECH Enabled' checked={tls.ech ? tls.ech.enable : false} onChange={((x) => setEch((e) => { e.enable = x; return e }))} />
        {
            tls.ech?.enable &&
            <SettingInputText label='ECH Outer SNI' value={tls.ech ? tls.ech.OuterSNI : ""} onChange={(e: string) => setEch((x) => { x.OuterSNI = e; return x })} />
        }

        <SettingInputTextarea label='CA Cert' value={new TextDecoder().decode(tls.caCert)} readonly />
        <SettingInputTextarea label='CA Key' value={new TextDecoder().decode(tls.caKey)} readonly password />
        <SettingInputText label='ECH Config' value={tls.ech ? btoa(String.fromCharCode(...tls.ech?.config)) : ""} readonly />
        <SettingInputText label='ECH Key' value={tls.ech ? btoa(String.fromCharCode(...tls.ech?.privateKey)) : ""} readonly password />

        <Button variant='outline-danger' onClick={() => onChange({
            ...tls,
            caCert: new TextEncoder().encode(""),
            caKey: new TextEncoder().encode(""),
            ech: { ...tls.ech, config: new Uint8Array(0), privateKey: new Uint8Array(0) }
        })}>regenerate</Button>
    </>
}

export const QuicComponents = (props: { quic: quic, onChange: (x: quic) => void }) => {
    return (
        <>
            <SettingInputText
                label='Host'
                onChange={(e: string) => props.onChange({ ...props.quic, host: e })}
                value={props.quic.host}
            />

            <TLSServerComponents tls={create(tls_server_configSchema, props.quic.tls ? props.quic.tls : undefined)} onChange={(e) => props.onChange({ ...props.quic, tls: e })} />
        </>
    )
}

export const TlsComponents = (props: { tls: tls, onChange: (x: tls) => void }) => {
    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"TLS"} />
            {
                props.tls.tls && <TLSServerComponents tls={create(tls_server_configSchema, props.tls.tls)} onChange={(e) => props.onChange({ ...props.tls, tls: e })} />
            }
        </>
    )
}

export const RealityComponents = (props: { reality: reality, onChange: (x: reality) => void }) => {
    const [newShortID, setNewShortID] = useState({ value: "" });
    const [newServerName, setNewServerName] = useState({ value: "" });

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Reality"} />

            <SettingInputText label='Dest' value={props.reality.dest} onChange={(e: string) => props.onChange({ ...props.reality, dest: e })} />
            <SettingInputText label='Private Key' value={props.reality.privateKey} onChange={(e: string) => props.onChange({ ...props.reality, privateKey: e })} />

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Short ID</Form.Label>


                {
                    props.reality.shortId.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v}
                                        onChange={(e) => props.onChange({ ...props.reality, shortId: [...props.reality.shortId.slice(0, index), e.target.value, ...props.reality.shortId.slice(index + 1)] })} />
                                    <Button variant='outline-danger' onClick={() => props.onChange({ ...props.reality, shortId: [...props.reality.shortId.slice(0, index), ...props.reality.shortId.slice(index + 1)] })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.reality.shortId.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newShortID.value} onChange={(e) => setNewShortID({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => props.onChange({ ...props.reality, shortId: [...props.reality.shortId, newShortID.value] })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>


            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Server Name</Form.Label>
                {
                    props.reality.serverName.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v}
                                        onChange={(e) => props.onChange({ ...props.reality, serverName: [...props.reality.serverName.slice(0, index), e.target.value, ...props.reality.serverName.slice(index + 1)] })} />
                                    <Button variant='outline-danger'
                                        onClick={() => props.onChange({ ...props.reality, serverName: [...props.reality.serverName.slice(0, index), ...props.reality.serverName.slice(index + 1)] })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.reality.serverName.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newServerName.value} onChange={(e) => setNewServerName({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => props.onChange({ ...props.reality, serverName: [...props.reality.serverName, newServerName.value] })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>
        </>
    )
}


export const Yuubinsya = (props: { yuubinsya: yuubinsya, onChange: (x: yuubinsya) => void }) => {
    return <>
        <SettingCheck
            label="UDP Coalesce"
            checked={props.yuubinsya.udpCoalesce}
            onChange={() => { props.onChange({ ...props.yuubinsya, udpCoalesce: !props.yuubinsya.udpCoalesce }) }}
        />
        <SettingInputText
            label="Password"
            value={props.yuubinsya.password}
            onChange={(e: string) => { props.onChange({ ...props.yuubinsya, password: e }) }}
        />
    </>
}

export const Aead: FC<{ aead: aead, onChange: (x: aead) => void }> = ({ aead, onChange }) => {
    return <>
        <SettingInputText
            label="Password"
            value={aead.password}
            onChange={(e: string) => { onChange({ ...aead, password: e }) }}
        />
    </>
}

export const TcpUdp = (props: { protocol: tcpudp, onChange: (x: tcpudp) => void }) => {
    return <>
        <SettingInputText
            label="Host"
            value={props.protocol.host}
            onChange={(e: string) => { props.onChange({ ...props.protocol, host: e }) }}
        />

        <SettingTypeSelect
            label="Control"
            type={tcp_udp_controlSchema}
            value={props.protocol.control}
            onChange={(e) => { props.onChange({ ...props.protocol, control: e }) }}
        />
    </>
}
