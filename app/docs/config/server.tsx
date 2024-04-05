import React, { useState } from 'react';
import { Form, InputGroup, Card, Row, Col, Button, FloatingLabel } from 'react-bootstrap';
import { SettingInputText, SettingInputTextarea, NewItemList } from './components';
import { SettingCheck } from "../common/switch";
import { http, redir, tproxy, tun, yuubinsya, mixed, socks5, socks4a, tun_endpoint_driver, route, tls_config, certificate, websocket, quic, grpc, tls, http2, reality, protocol, inbound_config, normal } from '../pbes/config/listener/listener_pb';

export const HTTPComponents = React.memo((props: { http: http, onChange: (x: http) => void }) => {
    const updateState = (x: (x: http) => void) => {
        x(props.http)
        props.onChange(props.http)
    }

    return (
        <>
            <SettingInputText label='Host' value={props.http.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.http.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.http.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})


export const RedirComponents = React.memo((props: { redir: redir, onChange: (x: redir) => void }) => {
    const updateState = (x: (x: redir) => void) => {
        x(props.redir)
        props.onChange(props.redir)
    }

    return (
        <>
            <SettingInputText label='Host' value={props.redir.host} onChange={(e) => updateState((x) => x.host = e)} />
        </>
    )
})


export const TProxyComponents = React.memo((props: { tproxy: tproxy, onChange: (x: tproxy) => void }) => {
    const updateState = (x: (x: tproxy) => void) => {
        x(props.tproxy)
        props.onChange(props.tproxy)
    }

    return (
        <>
            <SettingCheck label='DNS Hijacking'
                checked={props.tproxy.dnsHijacking}
                onChange={() => updateState((x) => x.dnsHijacking = !x.dnsHijacking)} />
            <SettingCheck label='Force Fake IP'
                checked={props.tproxy.forceFakeip}
                onChange={() => updateState((x) => x.forceFakeip = !x.forceFakeip)} />
            <SettingInputText label='Host' value={props.tproxy.host} onChange={(e) => updateState((x) => x.host = e)} />
        </>
    )
})

export const Socks5Components = React.memo((props: { socks5: socks5, onChange: (x: socks5) => void }) => {
    const updateState = (x: (x: socks5) => void) => {
        x(props.socks5)
        props.onChange(props.socks5)
    }


    return (
        <>
            <SettingInputText label='Host' value={props.socks5.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.socks5.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.socks5.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})


export const MixedComponents = React.memo((props: { mixed: mixed, onChange: (x: mixed) => void }) => {
    const updateState = (x: (x: mixed) => void) => {
        x(props.mixed)
        props.onChange(props.mixed)
    }


    return (
        <>
            <SettingInputText label='Host' value={props.mixed.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.mixed.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.mixed.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})

export const TunComponents = React.memo((props: { tun: tun, onChange: (x: tun) => void }) => {
    const updateState = (x: (x: tun) => void) => {
        x(props.tun)
        props.onChange(props.tun)
    }


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
                        onChange={(e) => props.onChange(tun_endpoint_driver[e.target.value])}
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
                onChange={() => updateState((x) => x.skipMulticast = !x.skipMulticast)}
                label="Skip Multicast"
            />

            <SettingInputText label='Name' value={props.tun.name} onChange={(e) => updateState((x) => x.name = e)} />
            <SettingInputText label='MTU' value={props.tun.mtu} onChange={(e) => updateState((x) => x.mtu = !isNaN(Number(e)) ? Number(e) : x.mtu)} />
            <SettingInputText label='IPv4' value={props.tun.portal} onChange={(e) => updateState((x) => x.portal = e)} />
            <SettingInputText label='IPv6' value={props.tun.portalV6} onChange={(e) => updateState((x) => x.portalV6 = e)} />
            <SettingTunTypeSelect label='Stack' value={props.tun.driver} onChange={(e) => updateState((x) => x.driver = e)} />


            <NewItemList
                title='Routes'
                data={props.tun.route?.routes ?? []}
                onChange={(e) => updateState((x) => {
                    if (!x.route) x.route = new route()
                    if (!e) e = []
                    if (x.route) x.route.routes = e
                })}
            />
        </>
    )
})

const IsTLSEmpty = (tls?: tls_config | null) =>
    tls === null || tls === undefined || (tls.certificates === undefined && tls.nextProtos === undefined && tls.serverNameCertificate === undefined)


const TLSCertificateComponents = React.memo((props: { cert: certificate, onChange: (x: certificate) => void }) => {
    const updateState = (x: (x: certificate) => void) => {
        x(props.cert)
        props.onChange(props.cert)
    }


    return (
        <>
            <SettingInputTextarea label='Cert' value={new TextDecoder().decode(props.cert.cert)}
                onChange={(e) => updateState((x) => { x.cert = new TextEncoder().encode(e) })} />

            <SettingInputTextarea label='Key' value={new TextDecoder().decode(props.cert.key)}
                onChange={(e) => updateState((x) => { x.key = new TextEncoder().encode(e) })} />

            <SettingInputText label='Cert File' value={props.cert.certFilePath} onChange={(e) => updateState((x) => { x.certFilePath = e })} />
            <SettingInputText label='Key File' value={props.cert.keyFilePath} onChange={(e) => updateState((x) => { x.keyFilePath = e })} />
        </>
    )
})

const TLSComponents = React.memo((props: { tls: tls_config, onChange: (x: tls_config) => void }) => {
    const [newSni, setNewSni] = useState("www.example.com")

    const updateState = (x: (x: tls_config) => void) => {
        x(props.tls)
        props.onChange(props.tls)
    }


    return (
        <>
            <NewItemList
                title='Next Protos'
                data={props.tls?.nextProtos ?? []}
                onChange={(e) => updateState((x) => { if (e) x.nextProtos = e })}
            />

            {
                props.tls && props.tls.certificates.map((v, index) => {
                    return <Card className='mb-2' key={"tls_certificates" + index}>
                        <Card.Body>
                            <Card.Title className='d-flex justify-content-end align-items-center'>
                                <Button variant='outline-danger' onClick={() => updateState((x) => {
                                    if (x?.certificates !== undefined) x.certificates.splice(index, 1)
                                })}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </Card.Title>
                            <TLSCertificateComponents cert={new certificate(v)}
                                onChange={(e) => updateState((x) => {
                                    if (x?.certificates !== undefined) x.certificates[index] = e
                                })} />
                        </Card.Body>
                    </Card>
                })
            }

            <InputGroup className="d-flex justify-content-end mb-2">
                <Button variant='outline-success'
                    onClick={() => updateState((x) => {
                        x.certificates.push(new certificate({
                            cert: new Uint8Array(0),
                            key: new Uint8Array(0),
                            certFilePath: "",
                            keyFilePath: "",
                        }))
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
                                    <Button variant='outline-danger' onClick={() => updateState((x) => {
                                        delete x?.serverNameCertificate[k]
                                    })}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>
                                <TLSCertificateComponents cert={new certificate(v)} onChange={(e) => updateState((x) => {
                                    x.serverNameCertificate[k] = e
                                })} />
                            </Card.Body>
                        </Card>
                    )
                })
            }
            <InputGroup className="d-flex justify-content-end">
                <Form.Control value={newSni} onChange={(e) => setNewSni(e.target.value)} />
                <Button variant='outline-success'
                    onClick={() => updateState((x) => {
                        if (newSni === "") return
                        x.serverNameCertificate[newSni] = new certificate({})
                    })} >
                    <i className="bi bi-plus-lg" />New SNI Certificate
                </Button>
            </InputGroup>
        </>
    )
})

const WebsocketComponents = React.memo((props: { websocket: websocket, onChange: (x: websocket) => void }) => {
    const updateState = (x: (x: websocket) => void) => {
        if (IsTLSEmpty(props.websocket.tls)) props.websocket.tls = undefined
        x(props.websocket)
        props.onChange(props.websocket)
    }


    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Websocket"} />

            {
                props.websocket.tls && <TLSComponents tls={new tls_config(props.websocket.tls ?? undefined)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

export const QuicComponents = React.memo((props: { quic: quic, onChange: (x: quic) => void }) => {
    const updateState = (x: (x: quic) => void) => {
        if (IsTLSEmpty(props.quic.tls)) props.quic.tls = undefined
        x(props.quic)
        props.onChange(props.quic)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"QUIC"} />

            {
                props.quic.tls && <TLSComponents tls={new tls_config(props.quic.tls !== null ? props.quic.tls : undefined)} onChange={(e) => updateState((x) => x.tls = e)} />
            }

        </>
    )
})

export const GrpcComponents = React.memo((props: { grpc: grpc, onChange: (x: grpc) => void }) => {
    const updateState = (x: (x: grpc) => void) => {
        if (IsTLSEmpty(props.grpc.tls)) props.grpc.tls = undefined
        x(props.grpc)
        props.onChange(props.grpc)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"GRPC"} />
            {
                props.grpc.tls && <TLSComponents tls={new tls_config(props.grpc.tls)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

export const TlsComponents = React.memo((props: { tls: tls, onChange: (x: tls) => void }) => {
    const updateState = (x: (x: tls) => void) => {
        if (IsTLSEmpty(props.tls.tls)) props.tls.tls = undefined
        x(props.tls)
        props.onChange(props.tls)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"TLS"} />
            {
                props.tls.tls && <TLSComponents tls={new tls_config(props.tls.tls)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

export const Http2Components = React.memo((props: { http2: http2, onChange: (x: http2) => void }) => {
    const updateState = (x: (x: http2) => void) => {
        if (IsTLSEmpty(props.http2.tls)) props.http2.tls = undefined
        x(props.http2)
        props.onChange(props.http2)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"HTTP2"} />
            {
                props.http2.tls && <TLSComponents tls={new tls_config(props.http2.tls)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

export const RealityComponents = React.memo((props: { reality: reality, onChange: (x: reality) => void }) => {
    const updateState = (x: (x: reality) => void) => {
        x(props.reality)
        props.onChange(props.reality)
    }

    const [newShortID, setNewShortID] = useState({ value: "" });
    const [newServerName, setNewServerName] = useState({ value: "" });

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Reality"} />

            <SettingInputText label='Dest' value={props.reality.dest} onChange={(e) => updateState((x) => x.dest = e)} />
            <SettingInputText label='Private Key' value={props.reality.privateKey} onChange={(e) => updateState((x) => x.privateKey = e)} />

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Short ID</Form.Label>


                {
                    props.reality.shortId.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v} onChange={(e) => updateState((x) => { x.shortId[index] = e.target.value })} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { x.shortId.splice(index, 1) })}>
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
                        <Button variant='outline-success' onClick={() => updateState((x) => {
                            x.shortId.push(newShortID.value)
                        })} >
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
                                    <Form.Control value={v} onChange={(e) => updateState((x) => { x.serverName[index] = e.target.value })} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { x.serverName.splice(index, 1) })}>
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
                        <Button variant='outline-success' onClick={() => updateState((x) => {
                            x.serverName.push(newServerName.value)
                        })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>
        </>
    )
})

export const YuubinsyaComponents = React.memo((props: { yuubinsya: yuubinsya, onChange: (x: yuubinsya) => void }) => {
    const updateState = (x: (x: yuubinsya) => void) => {
        x(props.yuubinsya)
        props.onChange(props.yuubinsya)
    }

    const components = () => {
        switch (props.yuubinsya.protocol.case) {
            case "websocket":
                return <WebsocketComponents websocket={new websocket(props.yuubinsya.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
            case "quic":
                return <QuicComponents quic={new quic(props.yuubinsya.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
            case "grpc":
                return <GrpcComponents grpc={new grpc(props.yuubinsya.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
            case "http2":
                return <Http2Components http2={new http2(props.yuubinsya.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
            case "reality":
                return <RealityComponents reality={new reality(props.yuubinsya.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
            case "tls":
                return <TlsComponents tls={new tls(props.yuubinsya.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        }
    }
    return (
        <>
            <SettingCheck label='Force Disable Encrypt'
                checked={props.yuubinsya.forceDisableEncrypt}
                onChange={() => updateState((x) => x.forceDisableEncrypt = !x.forceDisableEncrypt)} />
            <SettingCheck label='Mux'
                checked={props.yuubinsya.mux}
                onChange={() => updateState((x) => x.mux = !x.mux)} />

            <SettingInputText label='Host' value={props.yuubinsya.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Password' value={props.yuubinsya.password} onChange={(e) => updateState((x) => x.password = e)} />

            {components()}
        </>
    )
})

export const defaultServers: { [key: string]: protocol } = {};

const Protocol = React.memo((props: { protocol: protocol, onChange: (x: protocol) => void }) => {
    const updateState = (x: (x: protocol) => void) => {
        x(props.protocol)
        props.onChange(props.protocol)
    }

    switch (props.protocol.protocol.case) {
        case "http":
            return <HTTPComponents http={new http(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        case "socks5":
            return <Socks5Components socks5={new socks5(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        case "mix":
            return <MixedComponents mixed={new mixed(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        case "redir":
            return <RedirComponents redir={new redir(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        case "tun":
            return <TunComponents tun={new tun(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        case "yuubinsya":
            return <YuubinsyaComponents yuubinsya={new yuubinsya(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
        case "tproxy":
            return <TProxyComponents tproxy={new tproxy(props.protocol.protocol.value!!)} onChange={(e) => updateState((x) => x.protocol.value = e)} />
    }
    return <></>
})


const Inbound = React.memo((props: {
    server: inbound_config,
    onChange: (x: inbound_config) => void,
}) => {
    const updateState = (x: (x: inbound_config) => void) => {
        x(props.server)
        props.onChange(props.server)
    }

    return (
        <>
            {
                Object.entries(props.server!.servers!)
                    .sort((a, b) => { return a[0] <= b[0] ? -1 : 1 })
                    .map(([k, v]) => {
                        return (
                            <div key={k}>
                                <Card.Title className='d-flex justify-content-between align-items-center'>
                                    {k}
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { x.servers && delete x.servers[k] })}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>

                                <SettingCheck label='Enabled' checked={v.enabled!!} onChange={() => updateState((x) => x.servers![k].enabled = !x.servers![k].enabled)} />
                                <Protocol protocol={new protocol(v)} onChange={(e) => updateState((x) => x.servers![k] = e)} />
                            </div>
                        )
                    })
            }
        </>
    )
})

export default Inbound;