import React, { useState } from 'react';
import { Form, InputGroup, Card, Row, Col, Button, FloatingLabel } from 'react-bootstrap';
import { Buffer } from 'buffer';
import { SettingCheck, SettingInputText, SettingInputTextarea } from './components';
import {
    http as HTTP,
    socks5 as Socks5,
    redir as Redir,
    tun as Tun,
    yuubinsya as Yuubinsya,
    tls_config as TLS,
    certificate as TLSCertificate,
    quic as Quic,
    websocket as Websocket,
    grpc as Grpc,
    http2 as Http2,
    reality,
    tls as Tls,
    protocol as ServerConfig,
    tun_endpoint_driver as TunDriver,
    tun_endpoint_driverFromJSON as TunDriverFromJSON,
    tun_endpoint_driverToJSON as TunDriverToJSON,
} from '../protos/config/listener/listener';
import { produce } from 'immer'

const HTTPComponents = React.memo((props: { http: HTTP, onChange: (x: HTTP) => void }) => {
    const updateState = (x: (x: HTTP) => void) => props.onChange(produce(props.http, (v) => { x(v) }))

    return (
        <>
            <SettingInputText label='Host' value={props.http.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.http.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.http.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})


const RedirComponents = React.memo((props: { redir: Redir, onChange: (x: Redir) => void }) => {
    const updateState = (x: (x: Redir) => void) => props.onChange(produce(props.redir, (v) => { x(v) }))

    return (
        <>
            <SettingInputText label='Host' value={props.redir.host} onChange={(e) => updateState((x) => x.host = e)} />
        </>
    )
})

const Socks5Components = React.memo((props: { socks5: Socks5, onChange: (x: Socks5) => void }) => {
    const updateState = (x: (x: Socks5) => void) => props.onChange(produce(props.socks5, (v) => { x(v) }))


    return (
        <>
            <SettingInputText label='Host' value={props.socks5.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.socks5.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.socks5.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})


const TunComponents = React.memo((props: { tun: Tun, onChange: (x: Tun) => void }) => {
    const updateState = (x: (x: Tun) => void) => props.onChange(produce(props.tun, (v) => { x(v) }))


    return (
        <>
            <SettingCheck label='DNS Hijacking'
                checked={props.tun.dns_hijacking}
                onChange={() => updateState((x) => x.dns_hijacking = !x.dns_hijacking)} />

            <SettingCheck
                checked={props.tun.skip_multicast}
                onChange={() => updateState((x) => x.skip_multicast = !x.skip_multicast)}
                label="Skip Multicast"
            />

            <SettingInputText label='Name' value={props.tun.name} onChange={(e) => updateState((x) => x.name = e)} />
            <SettingInputText label='Mtu' value={props.tun.mtu} onChange={(e) => updateState((x) => x.mtu = !isNaN(Number(e)) ? Number(e) : x.mtu)} />
            <SettingInputText label='Gateway' value={props.tun.gateway} onChange={(e) => updateState((x) => x.gateway = e)} />
            <SettingInputText label='Portal' value={props.tun.portal} onChange={(e) => updateState((x) => x.portal = e)} />

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>Driver</Form.Label>
                <Col sm={10}>
                    <Form.Select value={props.tun.driver} onChange={(e) => updateState((x) => x.driver = TunDriverFromJSON(e.target.value))}>
                        <option value={TunDriverToJSON(TunDriver.fdbased)}>Fdbased</option>
                        <option value={TunDriverToJSON(TunDriver.channel)}>Channel</option>
                        <option value={TunDriverToJSON(TunDriver.system_gvisor)}>System</option>
                    </Form.Select>
                </Col>
            </Form.Group>
        </>
    )
})




const IsTLSEmpty = (tls?: TLS | null) => {
    if (tls === null || tls === undefined) {
        return true
    }
    if (tls.certificates === undefined && tls.next_protos === undefined && tls.server_name_certificate === undefined) return true
}

const TLSCertificateComponents = React.memo((props: { cert: TLSCertificate, onChange: (x: TLSCertificate) => void }) => {
    const updateState = (x: (x: TLSCertificate) => void) => props.onChange(produce(props.cert, (v) => { x(v) }))


    return (
        <>
            <SettingInputTextarea label='Cert' value={Buffer.from(props.cert.cert).toString()}
                onChange={(e) => updateState((x) => { x.cert = new Uint8Array(Buffer.from(e)) })} />

            <SettingInputTextarea label='Key' value={Buffer.from(props.cert.key).toString()}
                onChange={(e) => updateState((x) => { x.key = new Uint8Array(Buffer.from(e)) })} />

            <SettingInputText label='Cert File' value={props.cert.cert_file_path} onChange={(e) => updateState((x) => { x.cert_file_path = e })} />
            <SettingInputText label='Key File' value={props.cert.key_file_path} onChange={(e) => updateState((x) => { x.key_file_path = e })} />
        </>
    )
})

const TLSComponents = React.memo((props: { tls: TLS, onChange: (x: TLS) => void }) => {
    const [newSni, setNewSni] = useState("www.example.com")
    const [newNextProtos, setNewNextProtos] = useState({ value: "" });

    const updateState = (x: (x: TLS) => void) => props.onChange(produce(props.tls, (v) => { x(v) }))


    return (
        <>

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Next Protos</Form.Label>


                {
                    props.tls !== null && props.tls.next_protos?.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v} onChange={(e) => updateState((x) => { if (x !== null && x.next_protos !== undefined) x.next_protos[index] = e.target.value })} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { if (x !== null && x.next_protos !== undefined) x?.next_protos.splice(index, 1) })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.tls !== null && props.tls.next_protos?.length !== 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newNextProtos.value} onChange={(e) => setNewNextProtos({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => updateState((x) => {
                            if (x?.next_protos === undefined) x.next_protos = []
                            x.next_protos.push(newNextProtos.value)
                        })} >
                            <i className="bi bi-plus-lg" />
                        </Button>
                    </InputGroup>
                </Col>
            </Form.Group>

            {
                props.tls !== null && props.tls.certificates?.map((v, index) => {
                    return <Card className='mb-2' key={"tls_certificates" + index}>
                        <Card.Body>
                            <Card.Title className='d-flex justify-content-end align-items-center'>
                                <Button variant='outline-danger' onClick={() => updateState((x) => {
                                    if (x?.certificates !== undefined) x.certificates.splice(index, 1)
                                })}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </Card.Title>
                            <TLSCertificateComponents cert={v}
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
                props.tls !== null
                && props.tls.server_name_certificate !== undefined
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
                                <TLSCertificateComponents cert={v} onChange={(e) => updateState((x) => {
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
                        if (x?.server_name_certificate === undefined) x.server_name_certificate = {}
                    })} >
                    <i className="bi bi-plus-lg" />New SNI Certificate
                </Button>
            </InputGroup>
        </>
    )
})

const WebsocketComponents = React.memo((props: { websocket: Websocket, onChange: (x: Websocket) => void }) => {
    const updateState = (x: (x: Websocket) => void) => props.onChange(produce(props.websocket, (v) => {
        if (IsTLSEmpty(v.tls)) v.tls = undefined
        x(v)
    }))


    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Websocket"} />

            {
                props.websocket.tls !== undefined && <TLSComponents tls={props.websocket.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const QuicComponents = React.memo((props: { quic: Quic, onChange: (x: Quic) => void }) => {
    const updateState = (x: (x: Quic) => void) => {
        props.onChange(produce(props.quic, (v) => {
            if (IsTLSEmpty(v.tls)) v.tls = undefined
            x(v)
        }))
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"QUIC"} />

            {
                props.quic.tls !== undefined && <TLSComponents tls={props.quic.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }

        </>
    )
})

const GrpcComponents = React.memo((props: { grpc: Grpc, onChange: (x: Grpc) => void }) => {
    const updateState = (x: (x: Grpc) => void) => {
        props.onChange(produce(props.grpc, (v) => {
            if (IsTLSEmpty(v.tls)) v.tls = undefined
            x(v)
        }))
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"GRPC"} />
            {
                props.grpc.tls !== undefined && <TLSComponents tls={props.grpc.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const TlsComponents = React.memo((props: { tls: Tls, onChange: (x: Tls) => void }) => {
    const updateState = (x: (x: Tls) => void) => {
        props.onChange(produce(props.tls, (v) => {
            if (IsTLSEmpty(v.tls)) v.tls = undefined
            x(v)
        }))
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"TLS"} />
            {
                props.tls.tls !== undefined && <TLSComponents tls={props.tls.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const Http2Components = React.memo((props: { http2: Http2, onChange: (x: Http2) => void }) => {
    const updateState = (x: (x: Http2) => void) => {
        props.onChange(produce(props.http2, (v) => {
            if (IsTLSEmpty(v.tls)) v.tls = undefined
            x(v)
        }))
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"HTTP2"} />
            {
                props.http2.tls !== undefined && <TLSComponents tls={props.http2.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

const RealityComponents = React.memo((props: { reality: reality, onChange: (x: reality) => void }) => {
    const updateState = (x: (x: reality) => void) => {
        props.onChange(produce(props.reality, (v) => { x(v) }))
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

const YuubinsyaComponents = React.memo((props: { yuubinsya: Yuubinsya, onChange: (x: Yuubinsya) => void }) => {
    const updateState = (x: (x: Yuubinsya) => void) => {
        props.onChange(produce(props.yuubinsya, (v) => { x(v) }))
    }

    const components = () => {
        switch (props.yuubinsya.protocol?.$case) {
            case "websocket":
                return <WebsocketComponents websocket={props.yuubinsya.protocol.websocket} onChange={(e) => updateState((x) => x.protocol = { $case: "websocket", websocket: e })} />
            case "quic":
                return <QuicComponents quic={props.yuubinsya.protocol.quic} onChange={(e) => updateState((x) => x.protocol = { $case: "quic", quic: e })} />
            case "grpc":
                return <GrpcComponents grpc={props.yuubinsya.protocol.grpc} onChange={(e) => updateState((x) => x.protocol = { $case: "grpc", grpc: e })} />
            case "http2":
                return <Http2Components http2={props.yuubinsya.protocol.http2} onChange={(e) => updateState((x) => x.protocol = { $case: "http2", http2: e })} />
            case "reality":
                return <RealityComponents reality={props.yuubinsya.protocol.reality} onChange={(e) => updateState((x) => x.protocol = { $case: "reality", reality: e })} />
            case "tls":
                return <TlsComponents tls={props.yuubinsya.protocol.tls} onChange={(e) => updateState((x) => x.protocol = { $case: "tls", tls: e })} />
        }
    }
    return (
        <>
            <SettingCheck label='Force Disable Encrypt'
                checked={props.yuubinsya.force_disable_encrypt}
                onChange={() => updateState((x) => x.force_disable_encrypt = !x.force_disable_encrypt)} />

            <SettingInputText label='Host' value={props.yuubinsya.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Password' value={props.yuubinsya.password} onChange={(e) => updateState((x) => x.password = e)} />

            {components()}
        </>
    )
})

export const defaultServers: { [key: string]: ServerConfig } = {};

const Protocol = React.memo((props: { protocol: ServerConfig, onChange: (x: ServerConfig) => void }) => {
    const updateState = (x: (x: ServerConfig) => void) => {
        props.onChange(produce(props.protocol, (v) => { x(v) }))
    }

    switch (props.protocol.protocol?.$case) {
        case "http":
            return <HTTPComponents http={props.protocol.protocol.http} onChange={(e) => updateState((x) => x.protocol = { $case: "http", http: e })} />
        case "socks5":
            return <Socks5Components socks5={props.protocol.protocol.socks5} onChange={(e) => updateState((x) => x.protocol = { $case: "socks5", socks5: e })} />
        case "redir":
            return <RedirComponents redir={props.protocol.protocol.redir} onChange={(e) => updateState((x) => x.protocol = { $case: "redir", redir: e })} />
        case "tun":
            return <TunComponents tun={props.protocol.protocol.tun} onChange={(e) => updateState((x) => x.protocol = { $case: "tun", tun: e })} />
        case "yuubinsya":
            return <YuubinsyaComponents yuubinsya={props.protocol.protocol.yuubinsya} onChange={(e) => updateState((x) => x.protocol = { $case: "yuubinsya", yuubinsya: e })} />
    }
    return <></>
})


const Inbound = React.memo((props: { server: { [key: string]: ServerConfig }, onChange: (x: { [key: string]: ServerConfig }) => void, }) => {

    const [newProtocol, setNewProtocol] = useState({ value: "http", name: "" });

    const updateState = (x: (x: { [key: string]: ServerConfig }) => void) => {
        props.onChange(produce(props.server, (v) => { x(v) }))
    }

    return (
        <>
            {
                Object.entries(props.server).map(([k, v]) => {
                    return (

                        <div key={k}>
                            <Card.Title className='d-flex justify-content-between align-items-center'>
                                {k}
                                <Button variant='outline-danger' onClick={() => updateState((x) => { delete x[k] })}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </Card.Title>

                            <SettingCheck label='Enabled' checked={v.enabled} onChange={() => updateState((x) => x[k].enabled = !x[k].enabled)} />
                            <Protocol protocol={v} onChange={(e) => updateState((x) => x[k] = e)} />

                            <hr />
                        </div>
                    )
                })
            }


            <Card className='mb-2'>
                <Card.Body>
                    <Card.Title>New Inbound</Card.Title>

                    <FloatingLabel label="Protocol" className='mb-2'>
                        <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ ...newProtocol, value: e.target.value })}>
                            <option value="http">HTTP</option>
                            <option value="socks5">SOCKS5</option>
                            <option value="tun">TUN</option>
                            <option value="redir">Redir</option>
                            <option value="yuubinsya">Yuubinsya</option>
                            <option value="yuubinsya-websocket">Yuubinsya Websocket</option>
                            <option value="yuubinsya-tls">Yuubinsya TLS</option>
                            <option value="yuubinsya-grpc">Yuubinsya GRPC</option>
                            <option value="yuubinsya-quic">Yuubinsya QUIC</option>
                            <option value="yuubinsya-http2">Yuubinsya HTTP2</option>
                            <option value="yuubinsya-reality">Yuubinsya Reality</option>
                        </Form.Select>
                    </FloatingLabel>

                    <InputGroup className="d-flex justify-content-end">
                        <Form.Control value={newProtocol.name} onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })} />
                        <Button variant='outline-success'
                            onClick={() => updateState((x) => {
                                console.log(newProtocol)
                                defaultProtocol(x, newProtocol.name, newProtocol.value)
                            })} >
                            <i className="bi bi-plus-lg" />New Inbound
                        </Button>
                    </InputGroup>
                </Card.Body>
            </Card>
        </>
    )
})

const defaultProtocol = (x: { [key: string]: ServerConfig }, name: string, protocol: string) => {
    if (name === "" || x[name] !== undefined) return

    let sc: ServerConfig = {
        name: name,
        enabled: false,
    }

    switch (protocol) {
        case "http":
            sc.protocol = {
                $case: "http",
                http: {
                    host: ":8188",
                    username: "",
                    password: ""
                }
            }
            break
        case "socks5":
            sc.protocol = {
                $case: "socks5",
                socks5: {
                    host: ":1080",
                    password: "",
                    username: ""
                }
            }
            break
        case "tun":
            sc.protocol = {
                $case: "tun",
                tun: {
                    name: "tun://tun0",
                    mtu: 1500,
                    gateway: "172.16.0.1",
                    dns_hijacking: true,
                    skip_multicast: false,
                    driver: TunDriver.system_gvisor,
                    portal: "172.16.0.2"
                },
            }
            break

        case "redir":
            sc.protocol = {
                $case: "redir",
                redir: {
                    host: ":8088"
                }
            }
            break
        case "yuubinsya":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "normal",
                        normal: {}
                    }
                }
            }
            break
        case "yuubinsya-websocket":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "websocket",
                        websocket: { tls: undefined }
                    }
                }
            }
            break
        case "yuubinsya-tls":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "tls",
                        tls: { tls: undefined }
                    }
                }
            }
            break
        case "yuubinsya-grpc":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "grpc",
                        grpc: { tls: undefined }
                    }
                }
            }
            break
        case "yuubinsya-quic":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "quic",
                        quic: { tls: undefined }
                    }
                }
            }
            break
        case "yuubinsya-http2":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "http2",
                        http2: { tls: undefined }
                    }
                }
            }
            break
        case "yuubinsya-reality":
            sc.protocol = {
                $case: "yuubinsya",
                yuubinsya: {
                    host: ":2096",
                    force_disable_encrypt: false,
                    password: "password",
                    protocol: {
                        $case: "reality",
                        reality: {
                            short_id: ["123456"],
                            server_name: ["www.example.com"],
                            private_key: "",
                            dest: "dl.google.com:443",
                            debug: false,
                        }
                    }
                }
            }
            break

        default:
            return
    }

    x[name] = sc
}

export default Inbound;