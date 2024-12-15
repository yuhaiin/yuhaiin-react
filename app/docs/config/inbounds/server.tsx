import { create } from '@bufbuild/protobuf';
import React, { useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { join as shlexJoin, split as shlexSplit } from 'shlex';
import { SettingCheck } from "../../common/switch";
import { certificate, certificateSchema, http, mixed, quic, reality, redir, reverse_http, reverse_tcp, routeSchema, socks5, tls, tls_config, tls_configSchema, tproxy, tun, tun_endpoint_driver } from '../../pbes/config/listener/listener_pb';
import { NewItemList, SettingInputText, SettingInputTextarea } from '../components';

export const HTTPComponents = React.memo((props: { http: http, onChange: (x: http) => void }) => {
    return (
        <>
            <SettingInputText label='Username' value={props.http.username} onChange={(e) => props.onChange({ ...props.http, username: e })} />
            <SettingInputText label='Password' value={props.http.password} onChange={(e) => props.onChange({ ...props.http, password: e })} />
        </>
    )
})

export const ReverseHTTPComponents = React.memo((props: { reverse_http: reverse_http, onChange: (x: reverse_http) => void }) => {
    return (
        <>
            <SettingInputText label='Url' value={props.reverse_http.url} onChange={(e) => props.onChange({ ...props.reverse_http, url: e })} />
        </>
    )
})

export const ReverseTCPComponents = React.memo((props: { reverse_tcp: reverse_tcp, onChange: (x: reverse_tcp) => void }) => {
    return (
        <>
            <SettingInputText label='Host' value={props.reverse_tcp.host} onChange={(e) => props.onChange({ ...props.reverse_tcp, host: e })} />
        </>
    )
})


export const RedirComponents = React.memo((props: { redir: redir, onChange: (x: redir) => void }) => {
    return (
        <>
            <SettingInputText label='Host' value={props.redir.host} onChange={(e) => props.onChange({ ...props.redir, host: e })} />
        </>
    )
})


export const TProxyComponents = React.memo((props: { tproxy: tproxy, onChange: (x: tproxy) => void }) => {
    return (
        <>
            <SettingCheck label='DNS Hijacking'
                checked={props.tproxy.dnsHijacking}
                onChange={() => props.onChange({ ...props.tproxy, dnsHijacking: !props.tproxy.dnsHijacking })} />
            <SettingCheck label='Force Fake IP'
                checked={props.tproxy.forceFakeip}
                onChange={() => props.onChange({ ...props.tproxy, forceFakeip: !props.tproxy.forceFakeip })} />
            <SettingInputText label='Host' value={props.tproxy.host} onChange={(e) => props.onChange({ ...props.tproxy, host: e })} />
        </>
    )
})

export const Socks5Components = React.memo((props: { socks5: socks5, onChange: (x: socks5) => void }) => {
    return (
        <>
            <SettingInputText label='Username' value={props.socks5.username} onChange={(e) => props.onChange({ ...props.socks5, username: e })} />
            <SettingInputText label='Password' value={props.socks5.password} onChange={(e) => props.onChange({ ...props.socks5, password: e })} />
        </>
    )
})


export const MixedComponents = React.memo((props: { mixed: mixed, onChange: (x: mixed) => void }) => {
    return (
        <>
            <SettingInputText label='Username' value={props.mixed.username} onChange={(e) => props.onChange({ ...props.mixed, username: e })} />
            <SettingInputText label='Password' value={props.mixed.password} onChange={(e) => props.onChange({ ...props.mixed, password: e })} />
        </>
    )
})

export const TunComponents = React.memo((props: { tun: tun, onChange: (x: tun) => void }) => {
    const [postUp, setPostUp] = useState(shlexJoin(props.tun.postUp))
    const [postDown, setPostDown] = useState(shlexJoin(props.tun.postDown))

    function SettingTunTypeSelect(props: {
        label: string, value?: tun_endpoint_driver | null,
        onChange: (value: tun_endpoint_driver) => void
    }) {
        return (
            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>{props.label}</Form.Label>
                <Col sm={10}>
                    <Form.Select
                        value={tun_endpoint_driver[(props.value === undefined || props.value === null) ? tun_endpoint_driver.fdbased : props.value]}
                        onChange={(e) => props.onChange(tun_endpoint_driver[e.target.value as keyof typeof tun_endpoint_driver])}
                    >
                        <option value={tun_endpoint_driver[tun_endpoint_driver.fdbased]}>Fdbased</option>
                        <option value={tun_endpoint_driver[tun_endpoint_driver.channel]}>Channel</option>
                        <option value={tun_endpoint_driver[tun_endpoint_driver.system_gvisor]}>System</option>
                    </Form.Select>
                </Col>
            </Form.Group>
        )
    }

    return (
        <>
            <SettingCheck
                checked={props.tun.skipMulticast}
                onChange={() => props.onChange({ ...props.tun, skipMulticast: !props.tun.skipMulticast })}
                label="Skip Multicast"
            />

            <SettingInputText label='Name' value={props.tun.name} onChange={(e) => props.onChange({ ...props.tun, name: e })} />
            <SettingInputText label='MTU' value={props.tun.mtu} onChange={(e) => { if (!isNaN(Number(e))) props.onChange({ ...props.tun, mtu: Number(e) }) }} />
            <SettingInputText label='IPv4' value={props.tun.portal} onChange={(e) => props.onChange({ ...props.tun, portal: e })} />
            <SettingInputText label='IPv6' value={props.tun.portalV6} onChange={(e) => props.onChange({ ...props.tun, portalV6: e })} />
            <SettingInputText label='Post Up' value={postUp}
                onChange={(e) => {
                    setPostUp(e)
                    try {
                        let cmds = shlexSplit(e)
                        props.onChange({ ...props.tun, postUp: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingInputText label='Post Down' value={postDown}
                onChange={(e) => {
                    setPostDown(e)
                    try {
                        let cmds = shlexSplit(e)
                        props.onChange({ ...props.tun, postDown: cmds })
                    } catch (e) {
                        console.log(e)
                    }
                }
                } />
            <SettingTunTypeSelect label='Stack' value={props.tun.driver} onChange={(e) => props.onChange({ ...props.tun, driver: e })} />

            <NewItemList
                title='Routes'
                data={props.tun.route?.routes ?? []}
                onChange={(e) => {
                    let x = { ...props.tun }
                    if (!x.route) x.route = create(routeSchema, {})
                    if (!e) e = []
                    if (x.route) x.route.routes = e
                    props.onChange({ ...x })
                }
                }
            />
        </>
    )
})

const IsTLSEmpty = (tls?: tls_config | null) =>
    tls === null || tls === undefined || (tls.certificates === undefined && tls.nextProtos === undefined && tls.serverNameCertificate === undefined)


const TLSCertificateComponents = React.memo((props: { cert: certificate, onChange: (x: certificate) => void }) => {
    return (
        <>
            <SettingInputTextarea label='Cert' value={new TextDecoder().decode(props.cert.cert)}
                onChange={(e) => props.onChange({ ...props.cert, cert: new TextEncoder().encode(e) })} />

            <SettingInputTextarea label='Key' value={new TextDecoder().decode(props.cert.key)}
                onChange={(e) => props.onChange({ ...props.cert, key: new TextEncoder().encode(e) })} />

            <SettingInputText label='Cert File' value={props.cert.certFilePath} onChange={(e) => props.onChange({ ...props.cert, certFilePath: e })} />
            <SettingInputText label='Key File' value={props.cert.keyFilePath} onChange={(e) => props.onChange({ ...props.cert, keyFilePath: e })} />
        </>
    )
})

const TLSComponents = React.memo((props: { tls: tls_config, onChange: (x: tls_config) => void }) => {
    const [newSni, setNewSni] = useState("www.example.com")

    return (
        <>
            <NewItemList
                title='Next Protos'
                data={props.tls?.nextProtos ?? []}
                onChange={(e) => props.onChange({ ...props.tls, nextProtos: e })}
            />

            {
                props.tls && props.tls.certificates.map((v, index) => {
                    return <Card className='mb-2' key={"tls_certificates" + index}>
                        <Card.Body>
                            <Card.Title className='d-flex justify-content-end align-items-center'>
                                <Button variant='outline-danger' onClick={() => props.onChange({ ...props.tls, certificates: props.tls.certificates.filter((_, i) => i !== index) })}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </Card.Title>
                            <TLSCertificateComponents cert={create(certificateSchema, v)}
                                onChange={(e) => {
                                    props.onChange({ ...props.tls, certificates: [...props.tls.certificates.slice(0, index), e, ...props.tls.certificates.slice(index + 1)] })
                                }
                                } />
                        </Card.Body>
                    </Card>
                })
            }

            <InputGroup className="d-flex justify-content-end mb-2">
                <Button variant='outline-success'
                    onClick={() => props.onChange({
                        ...props.tls, certificates: [...props.tls.certificates, create(certificateSchema, {
                            cert: new Uint8Array(0),
                            key: new Uint8Array(0),
                            certFilePath: "",
                            keyFilePath: "",
                        })]
                    })} >
                    <i className="bi bi-plus-lg" />New Certificate
                </Button>
            </InputGroup>


            {
                props.tls && props.tls.serverNameCertificate
                && Object.entries(props.tls.serverNameCertificate).map(([k, v]) => {
                    return (
                        <Card className='mb-2' key={"server_name_certificate" + k}>
                            <Card.Body>
                                <Card.Title className='d-flex justify-content-between align-items-center'>
                                    {k}
                                    <Button variant='outline-danger' onClick={() => {
                                        const serverNameCertificate = { ...props.tls.serverNameCertificate }
                                        delete serverNameCertificate[k]
                                        props.onChange({ ...props.tls, serverNameCertificate })
                                    }}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>
                                <TLSCertificateComponents cert={create(certificateSchema, v)}
                                    onChange={(e) => { props.onChange({ ...props.tls, serverNameCertificate: { ...props.tls.serverNameCertificate, [k]: e } }) }}
                                />
                            </Card.Body>
                        </Card>
                    )
                })
            }
            <InputGroup className="d-flex justify-content-end">
                <Form.Control value={newSni} onChange={(e) => setNewSni(e.target.value)} />
                <Button variant='outline-success'
                    onClick={() => { if (newSni) props.onChange({ ...props.tls, serverNameCertificate: { ...props.tls.serverNameCertificate, [newSni]: create(certificateSchema, {}) } }) }}
                >
                    <i className="bi bi-plus-lg" />New SNI Certificate
                </Button>
            </InputGroup>
        </>
    )
})

export const QuicComponents = React.memo((props: { quic: quic, onChange: (x: quic) => void }) => {
    return (
        <>
            <SettingInputText
                label='Host'
                onChange={(e) => props.onChange({ ...props.quic, host: e })}
                value={props.quic.host}
            />

            {
                props.quic.tls && <TLSComponents tls={create(tls_configSchema, props.quic.tls !== null ? props.quic.tls : undefined)} onChange={(e) => props.onChange({ ...props.quic, tls: e })} />
            }

        </>
    )
})

export const TlsComponents = React.memo((props: { tls: tls, onChange: (x: tls) => void }) => {
    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"TLS"} />
            {
                props.tls.tls && <TLSComponents tls={create(tls_configSchema, props.tls.tls)} onChange={(e) => props.onChange({ ...props.tls, tls: e })} />
            }
        </>
    )
})

export const RealityComponents = React.memo((props: { reality: reality, onChange: (x: reality) => void }) => {
    const [newShortID, setNewShortID] = useState({ value: "" });
    const [newServerName, setNewServerName] = useState({ value: "" });

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Reality"} />

            <SettingInputText label='Dest' value={props.reality.dest} onChange={(e) => props.onChange({ ...props.reality, dest: e })} />
            <SettingInputText label='Private Key' value={props.reality.privateKey} onChange={(e) => props.onChange({ ...props.reality, privateKey: e })} />

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
})
