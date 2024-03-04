import React, { useState } from 'react';
import { Form, InputGroup, Card, Row, Col, Button, FloatingLabel } from 'react-bootstrap';
import { SettingCheck, SettingInputText, SettingInputTextarea, NewItemList } from './components';
import { yuhaiin as cp } from '../pbts/config';

const HTTPComponents = React.memo((props: { http: cp.listener.http, onChange: (x: cp.listener.http) => void }) => {
    const updateState = (x: (x: cp.listener.http) => void) => {
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


const RedirComponents = React.memo((props: { redir: cp.listener.redir, onChange: (x: cp.listener.redir) => void }) => {
    const updateState = (x: (x: cp.listener.redir) => void) => {
        x(props.redir)
        props.onChange(props.redir)
    }

    return (
        <>
            <SettingInputText label='Host' value={props.redir.host} onChange={(e) => updateState((x) => x.host = e)} />
        </>
    )
})


const TProxyComponents = React.memo((props: { tproxy: cp.listener.tproxy, onChange: (x: cp.listener.tproxy) => void }) => {
    const updateState = (x: (x: cp.listener.tproxy) => void) => {
        x(props.tproxy)
        props.onChange(props.tproxy)
    }

    return (
        <>
            <SettingCheck label='DNS Hijacking'
                checked={props.tproxy.dns_hijacking}
                onChange={() => updateState((x) => x.dns_hijacking = !x.dns_hijacking)} />
            <SettingCheck label='Force Fake IP'
                checked={props.tproxy.force_fakeip}
                onChange={() => updateState((x) => x.force_fakeip = !x.force_fakeip)} />
            <SettingInputText label='Host' value={props.tproxy.host} onChange={(e) => updateState((x) => x.host = e)} />
        </>
    )
})

const Socks5Components = React.memo((props: { socks5: cp.listener.socks5, onChange: (x: cp.listener.socks5) => void }) => {
    const updateState = (x: (x: cp.listener.socks5) => void) => {
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


const MixedComponents = React.memo((props: { mixed: cp.listener.mixed, onChange: (x: cp.listener.mixed) => void }) => {
    const updateState = (x: (x: cp.listener.mixed) => void) => {
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

const TunComponents = React.memo((props: { tun: cp.listener.tun, onChange: (x: cp.listener.tun) => void }) => {
    const updateState = (x: (x: cp.listener.tun) => void) => {
        x(props.tun)
        props.onChange(props.tun)
    }

    const TunType = cp.listener.tun.endpoint_driver;

    function SettingTunTypeSelect(props: {
        label: string, value?: cp.listener.tun.endpoint_driver | null,
        onChange: (value: cp.listener.tun.endpoint_driver) => void
    }) {
        return (
            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>{props.label}</Form.Label>
                <Col sm={10}>
                    <Form.Select
                        value={TunType[(props.value === undefined || props.value === null) ? TunType.fdbased : props.value]}
                        onChange={(e) => props.onChange(TunType[e.target.value])}
                    >
                        <option value={TunType[TunType.fdbased]}>Fdbased</option>
                        <option value={TunType[TunType.channel]}>Channel</option>
                        <option value={TunType[TunType.system_gvisor]}>System</option>
                    </Form.Select>
                </Col>
            </Form.Group>
        )
    }

    return (
        <>
            <SettingCheck
                checked={props.tun.skip_multicast}
                onChange={() => updateState((x) => x.skip_multicast = !x.skip_multicast)}
                label="Skip Multicast"
            />

            <SettingInputText label='Name' value={props.tun.name} onChange={(e) => updateState((x) => x.name = e)} />
            <SettingInputText label='MTU' value={props.tun.mtu} onChange={(e) => updateState((x) => x.mtu = !isNaN(Number(e)) ? Number(e) : x.mtu)} />
            <SettingInputText label='IPv4' value={props.tun.portal} onChange={(e) => updateState((x) => x.portal = e)} />
            <SettingInputText label='IPv6' value={props.tun.portal_v6} onChange={(e) => updateState((x) => x.portal_v6 = e)} />
            <SettingTunTypeSelect label='Stack' value={props.tun.driver} onChange={(e) => updateState((x) => x.driver = e)} />


            <NewItemList
                title='Routes'
                data={props.tun.route?.routes}
                onChange={(e) => updateState((x) => {
                    if (!x.route) x.route = {}
                    if (x.route) x.route.routes = e
                })}
            />
        </>
    )
})




const IsTLSEmpty = (tls?: cp.listener.Itls_config | null) =>
    tls === null || tls === undefined || (tls.certificates === undefined && tls.next_protos === undefined && tls.server_name_certificate === undefined)


const TLSCertificateComponents = React.memo((props: { cert: cp.listener.certificate, onChange: (x: cp.listener.certificate) => void }) => {
    const updateState = (x: (x: cp.listener.certificate) => void) => {
        x(props.cert)
        props.onChange(props.cert)
    }


    return (
        <>
            <SettingInputTextarea label='Cert' value={new TextDecoder().decode(props.cert.cert)}
                onChange={(e) => updateState((x) => { x.cert = new TextEncoder().encode(e) })} />

            <SettingInputTextarea label='Key' value={new TextDecoder().decode(props.cert.key)}
                onChange={(e) => updateState((x) => { x.key = new TextEncoder().encode(e) })} />

            <SettingInputText label='Cert File' value={props.cert.cert_file_path} onChange={(e) => updateState((x) => { x.cert_file_path = e })} />
            <SettingInputText label='Key File' value={props.cert.key_file_path} onChange={(e) => updateState((x) => { x.key_file_path = e })} />
        </>
    )
})

const TLSComponents = React.memo((props: { tls: cp.listener.tls_config, onChange: (x: cp.listener.tls_config) => void }) => {
    const [newSni, setNewSni] = useState("www.example.com")

    const updateState = (x: (x: cp.listener.tls_config) => void) => {
        x(props.tls)
        props.onChange(props.tls)
    }


    return (
        <>
            <NewItemList
                title='Next Protos'
                data={props.tls?.next_protos}
                onChange={(e) => updateState((x) => { if (e) x.next_protos = e })}
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
                            <TLSCertificateComponents cert={new cp.listener.certificate(v)}
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
                        x.certificates.push({
                            cert: new Uint8Array(0),
                            key: new Uint8Array(0),
                            cert_file_path: "",
                            key_file_path: ""
                        })
                    })} >
                    <i className="bi bi-plus-lg" />New Certificate
                </Button>
            </InputGroup>



            {
                props.tls && props.tls.server_name_certificate
                && Object.entries(props.tls.server_name_certificate).map(([k, v]) => {
                    return (
                        <Card className='mb-2' key={"server_name_certificate" + k}>
                            <Card.Body>
                                <Card.Title className='d-flex justify-content-between align-items-center'>
                                    {k}
                                    <Button variant='outline-danger' onClick={() => updateState((x) => {
                                        if (x?.server_name_certificate !== undefined) delete x?.server_name_certificate[k]
                                    })}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>
                                <TLSCertificateComponents cert={new cp.listener.certificate(v)} onChange={(e) => updateState((x) => {
                                    if (x?.server_name_certificate !== undefined) x.server_name_certificate[k] = e
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
                        x.server_name_certificate[newSni] = {}
                    })} >
                    <i className="bi bi-plus-lg" />New SNI Certificate
                </Button>
            </InputGroup>
        </>
    )
})

const WebsocketComponents = React.memo((props: { websocket: cp.listener.websocket, onChange: (x: cp.listener.websocket) => void }) => {
    const updateState = (x: (x: cp.listener.websocket) => void) => {
        if (IsTLSEmpty(props.websocket.tls)) props.websocket.tls = undefined
        x(props.websocket)
        props.onChange(props.websocket)
    }


    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Websocket"} />

            {
                props.websocket.tls && <TLSComponents tls={new cp.listener.tls_config(props.websocket.tls ?? undefined)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const QuicComponents = React.memo((props: { quic: cp.listener.quic, onChange: (x: cp.listener.quic) => void }) => {
    const updateState = (x: (x: cp.listener.quic) => void) => {
        if (IsTLSEmpty(props.quic.tls)) props.quic.tls = undefined
        x(props.quic)
        props.onChange(props.quic)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"QUIC"} />

            {
                props.quic.tls && <TLSComponents tls={new cp.listener.tls_config(props.quic.tls !== null ? props.quic.tls : undefined)} onChange={(e) => updateState((x) => x.tls = e)} />
            }

        </>
    )
})

const GrpcComponents = React.memo((props: { grpc: cp.listener.grpc, onChange: (x: cp.listener.grpc) => void }) => {
    const updateState = (x: (x: cp.listener.grpc) => void) => {
        if (IsTLSEmpty(props.grpc.tls)) props.grpc.tls = undefined
        x(props.grpc)
        props.onChange(props.grpc)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"GRPC"} />
            {
                props.grpc.tls && <TLSComponents tls={new cp.listener.tls_config(props.grpc.tls)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const TlsComponents = React.memo((props: { tls: cp.listener.tls, onChange: (x: cp.listener.tls) => void }) => {
    const updateState = (x: (x: cp.listener.tls) => void) => {
        if (IsTLSEmpty(props.tls.tls)) props.tls.tls = undefined
        x(props.tls)
        props.onChange(props.tls)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"TLS"} />
            {
                props.tls.tls && <TLSComponents tls={new cp.listener.tls_config(props.tls.tls)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const Http2Components = React.memo((props: { http2: cp.listener.http2, onChange: (x: cp.listener.http2) => void }) => {
    const updateState = (x: (x: cp.listener.http2) => void) => {
        if (IsTLSEmpty(props.http2.tls)) props.http2.tls = undefined
        x(props.http2)
        props.onChange(props.http2)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"HTTP2"} />
            {
                props.http2.tls && <TLSComponents tls={new cp.listener.tls_config(props.http2.tls)} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const RealityComponents = React.memo((props: { reality: cp.listener.reality, onChange: (x: cp.listener.reality) => void }) => {
    const updateState = (x: (x: cp.listener.reality) => void) => {
        x(props.reality)
        props.onChange(props.reality)
    }

    const [newShortID, setNewShortID] = useState({ value: "" });
    const [newServerName, setNewServerName] = useState({ value: "" });

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Reality"} />

            <SettingInputText label='Dest' value={props.reality.dest} onChange={(e) => updateState((x) => x.dest = e)} />
            <SettingInputText label='Private Key' value={props.reality.private_key} onChange={(e) => updateState((x) => x.private_key = e)} />

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Short ID</Form.Label>


                {
                    props.reality.short_id.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v} onChange={(e) => updateState((x) => { x.short_id[index] = e.target.value })} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { x.short_id.splice(index, 1) })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.reality.short_id.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newShortID.value} onChange={(e) => setNewShortID({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => updateState((x) => {
                            x.short_id.push(newShortID.value)
                        })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>


            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Server Name</Form.Label>
                {
                    props.reality.server_name.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v} onChange={(e) => updateState((x) => { x.server_name[index] = e.target.value })} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { x.server_name.splice(index, 1) })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.reality.server_name.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newServerName.value} onChange={(e) => setNewServerName({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => updateState((x) => {
                            x.server_name.push(newServerName.value)
                        })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>
        </>
    )
})

const YuubinsyaComponents = React.memo((props: { yuubinsya: cp.listener.yuubinsya, onChange: (x: cp.listener.yuubinsya) => void }) => {
    const updateState = (x: (x: cp.listener.yuubinsya) => void) => {
        x(props.yuubinsya)
        props.onChange(props.yuubinsya)
    }

    const components = () => {
        switch (props.yuubinsya.protocol) {
            case "websocket":
                return <WebsocketComponents websocket={new cp.listener.websocket(props.yuubinsya.websocket!!)} onChange={(e) => updateState((x) => x.websocket = e)} />
            case "quic":
                return <QuicComponents quic={new cp.listener.quic(props.yuubinsya.quic!!)} onChange={(e) => updateState((x) => x.quic = e)} />
            case "grpc":
                return <GrpcComponents grpc={new cp.listener.grpc(props.yuubinsya.grpc!!)} onChange={(e) => updateState((x) => x.grpc = e)} />
            case "http2":
                return <Http2Components http2={new cp.listener.http2(props.yuubinsya.http2!!)} onChange={(e) => updateState((x) => x.http2 = e)} />
            case "reality":
                return <RealityComponents reality={new cp.listener.reality(props.yuubinsya.reality!!)} onChange={(e) => updateState((x) => x.reality = e)} />
            case "tls":
                return <TlsComponents tls={new cp.listener.tls(props.yuubinsya.tls!!)} onChange={(e) => updateState((x) => x.tls = e)} />
        }
    }
    return (
        <>
            <SettingCheck label='Force Disable Encrypt'
                checked={props.yuubinsya.force_disable_encrypt}
                onChange={() => updateState((x) => x.force_disable_encrypt = !x.force_disable_encrypt)} />
            <SettingCheck label='Mux'
                checked={props.yuubinsya.mux}
                onChange={() => updateState((x) => x.mux = !x.mux)} />

            <SettingInputText label='Host' value={props.yuubinsya.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Password' value={props.yuubinsya.password} onChange={(e) => updateState((x) => x.password = e)} />

            {components()}
        </>
    )
})

export const defaultServers: { [key: string]: cp.listener.protocol } = {};

const Protocol = React.memo((props: { protocol: cp.listener.protocol, onChange: (x: cp.listener.protocol) => void }) => {
    const updateState = (x: (x: cp.listener.protocol) => void) => {
        x(props.protocol)
        props.onChange(props.protocol)
    }

    switch (props.protocol.protocol) {
        case "http":
            return <HTTPComponents http={new cp.listener.http(props.protocol.http!!)} onChange={(e) => updateState((x) => x.http = e)} />
        case "socks5":
            return <Socks5Components socks5={new cp.listener.socks5(props.protocol.socks5!!)} onChange={(e) => updateState((x) => x.socks5 = e)} />
        case "mix":
            return <MixedComponents mixed={new cp.listener.mixed(props.protocol.mix!!)} onChange={(e) => updateState((x) => x.mix = e)} />
        case "redir":
            return <RedirComponents redir={new cp.listener.redir(props.protocol.redir!!)} onChange={(e) => updateState((x) => x.redir = e)} />
        case "tun":
            return <TunComponents tun={new cp.listener.tun(props.protocol.tun!!)} onChange={(e) => updateState((x) => x.tun = e)} />
        case "yuubinsya":
            return <YuubinsyaComponents yuubinsya={new cp.listener.yuubinsya(props.protocol.yuubinsya!!)} onChange={(e) => updateState((x) => x.yuubinsya = e)} />
        case "tproxy":
            return <TProxyComponents tproxy={new cp.listener.tproxy(props.protocol.tproxy!!)} onChange={(e) => updateState((x) => x.tproxy = e)} />
    }
    return <></>
})


const Inbound = React.memo((props: {
    server: cp.listener.Iinbound_config,
    onChange: (x: cp.listener.Iinbound_config) => void,
}) => {

    const [newProtocol, setNewProtocol] = useState({ value: "http", name: "" });

    const updateState = (x: (x: cp.listener.Iinbound_config) => void) => {
        x(props.server)
        props.onChange(props.server)
    }

    return (
        <>

            <SettingCheck label='DNS Hijack'
                checked={!props.server.hijack_dns ? false : true}
                onChange={() => updateState((x) => x.hijack_dns = !x.hijack_dns)} />

            <SettingCheck label='Fakedns'
                checked={!props.server.hijack_dns_fakeip ? false : true}
                onChange={() => updateState((x) => x.hijack_dns_fakeip = !x.hijack_dns_fakeip)} />

            <hr />
            {
                Object.entries(props.server!.servers!)
                    .sort((a, b) => { return a[0] <= b[0] ? -1 : 1 })
                    .map(([k, v]) => {
                        return (
                            <div key={k}>
                                <Card.Title className='d-flex justify-content-between align-items-center'>
                                    {k}
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { delete x[k] })}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>

                                <SettingCheck label='Enabled' checked={v.enabled!!} onChange={() => updateState((x) => x[k].enabled = !x[k].enabled)} />
                                <Protocol protocol={new cp.listener.protocol(v)} onChange={(e) => updateState((x) => x[k] = e)} />

                                <hr />
                            </div>
                        )
                    })
            }


            <InputGroup className="d-flex justify-content-end">
                <Form.Control value={newProtocol.name} onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })} />
                <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ ...newProtocol, value: e.target.value })}>
                    <option value="mix">Mixed</option>
                    <option value="http">HTTP</option>
                    <option value="socks5">SOCKS5</option>
                    <option value="tun">TUN</option>
                    <option value="redir">Redir</option>
                    <option value="tproxy">TProxy</option>
                    <option value="yuubinsya">Yuubinsya</option>
                    <option value="yuubinsya-websocket">Yuubinsya Websocket</option>
                    <option value="yuubinsya-tls">Yuubinsya TLS</option>
                    <option value="yuubinsya-grpc">Yuubinsya GRPC</option>
                    <option value="yuubinsya-quic">Yuubinsya QUIC</option>
                    <option value="yuubinsya-http2">Yuubinsya HTTP2</option>
                    <option value="yuubinsya-reality">Yuubinsya Reality</option>
                </Form.Select>
                <Button variant='outline-success'
                    onClick={() => updateState((x) => {
                        console.log(newProtocol)
                        defaultProtocol(x.servers!, newProtocol.name, newProtocol.value)
                    })} >
                    <i className="bi bi-plus-lg" />New Inbound
                </Button>
            </InputGroup>

        </>
    )
})

const defaultProtocol = (x: { [key: string]: cp.listener.Iprotocol }, name: string, protocol: string) => {
    if (name === "" || x[name] !== undefined) return

    let sc: cp.listener.Iprotocol = {
        name: name,
        enabled: false,
    }

    switch (protocol) {
        case "http":
            sc.http = {
                host: ":8188",
                username: "",
                password: ""
            }
            break
        case "socks5":
            sc.socks5 = {
                host: ":1080",
                password: "",
                username: ""
            }
            break
        case "mix":
            sc.mix = {
                host: ":1080",
                password: "",
                username: ""
            }
            break
        case "tun":
            sc.tun = {
                name: "tun://tun0",
                mtu: 1500,
                gateway: "172.16.0.1",
                dns_hijacking: true,
                skip_multicast: false,
                driver: cp.listener.tun.endpoint_driver.system_gvisor,
                portal: "172.16.0.2"
            }
            break

        case "redir":
            sc.redir = {
                host: ":8088"
            }
            break
        case "yuubinsya":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                normal: {}
            }
            break
        case "yuubinsya-websocket":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                websocket: { tls: {} }
            }
            break
        case "yuubinsya-tls":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                tls: { tls: {} }
            }
            break
        case "yuubinsya-grpc":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                grpc: { tls: {} }
            }
            break
        case "yuubinsya-quic":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                quic: { tls: {} }
            }
            break
        case "yuubinsya-http2":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                http2: { tls: {} }
            }
            break
        case "yuubinsya-reality":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                reality: {
                    short_id: ["123456"],
                    server_name: ["www.example.com"],
                    private_key: "",
                    dest: "dl.google.com:443",
                    debug: false,
                }
            }
            break
        case "tproxy":
            sc.tproxy = {
                host: "0.0.0.0:8083",
            }
            break

        default:
            return
    }

    x[name] = new cp.listener.protocol(sc)
}

export default Inbound;