import React, { useState } from 'react';
import { Form, InputGroup, Card, Row, Col, Button, FloatingLabel } from 'react-bootstrap';
import { SettingCheck, SettingInputText, SettingInputTextarea } from './components';

type HTTP = {
    host: string,
    username?: string,
    password?: string,
}

const HTTPComponents = React.memo((props: { http: HTTP, onChange: (x: HTTP) => void }) => {
    const updateState = (x: (x: HTTP) => void) => {
        let v = props.http;
        x(v)
        props.onChange(v)
    }

    return (
        <>
            <SettingInputText label='Host' value={props.http.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.http.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.http.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})

type Redir = {
    host: string,
}


const RedirComponents = React.memo((props: { redir: Redir, onChange: (x: Redir) => void }) => {
    const updateState = (x: (x: Redir) => void) => {
        let v = props.redir;
        x(v)
        props.onChange(v)
    }

    return (
        <>
            <SettingInputText label='Host' value={props.redir.host} onChange={(e) => updateState((x) => x.host = e)} />
        </>
    )
})


type Socks5 = {
    host: string,
    username?: string,
    password?: string,
}

const Socks5Components = React.memo((props: { socks5: Socks5, onChange: (x: Socks5) => void }) => {
    const updateState = (x: (x: Socks5) => void) => {
        let v = props.socks5;
        x(v)
        props.onChange(v)
    }

    return (
        <>
            <SettingInputText label='Host' value={props.socks5.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Username' value={props.socks5.username} onChange={(e) => updateState((x) => x.username = e)} />
            <SettingInputText label='Password' value={props.socks5.password} onChange={(e) => updateState((x) => x.password = e)} />
        </>
    )
})

type Tun = {
    name: string,
    mtu: number,
    gateway: string,
    dns_hijacking: boolean,
    skip_multicast: boolean,
    driver: string,
    portal: string
}


const TunComponents = React.memo((props: { tun: Tun, onChange: (x: Tun) => void }) => {
    const updateState = (x: (x: Tun) => void) => {
        let v = props.tun;
        x(v)
        props.onChange(v)
    }

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
                    <Form.Select value={props.tun.driver} onChange={(e) => updateState((x) => x.driver = e.target.value)}>
                        <option value="fdbased">Fdbased</option>
                        <option value="channel">Channel</option>
                        <option value="system_gvisor">System</option>
                    </Form.Select>
                </Col>
            </Form.Group>
        </>
    )
})


type TLSCertificate = {
    cert?: string,
    key?: string,
    cert_file_path?: string,
    key_file_path?: string,
}

type TLS = {
    certificates?: TLSCertificate[],
    next_protos?: string[],
    server_name_certificate?: { [key: string]: TLSCertificate },
}

const TLSCertificateComponents = React.memo((props: { cert: TLSCertificate, onChange: (x: TLSCertificate) => void }) => {
    const updateState = (x: (x: TLSCertificate) => void) => {
        let v = props.cert;
        x(v)
        if (v != null) props.onChange(v)
    }

    return (
        <>

            <SettingInputTextarea label='Cert' value={props.cert.cert != undefined ? atob(props.cert.cert) : ""}
                onChange={(e) => updateState((x) => { x.cert = btoa(e) })} />

            <SettingInputTextarea label='Key' value={props.cert.key != undefined ? atob(props.cert.key) : ""}
                onChange={(e) => updateState((x) => { x.key = btoa(e) })} />

            <SettingInputText label='Cert File' value={props.cert.cert_file_path} onChange={(e) => updateState((x) => { x.cert_file_path = e })} />
            <SettingInputText label='Key File' value={props.cert.key_file_path} onChange={(e) => updateState((x) => { x.key_file_path = e })} />
        </>
    )
})

const TLSComponents = React.memo((props: { tls: TLS | null, onChange: (x: TLS) => void }) => {
    const [newSni, setNewSni] = useState("www.example.com")
    const [newNextProtos, setNewNextProtos] = useState({ value: "" });

    const updateState = (x: (x: TLS) => void) => {
        let v = props.tls;
        if (v == null) v = {}
        x(v)
        if (v != null) props.onChange(v)
    }

    return (
        <>

            <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2} className="nowrap">Next Protos</Form.Label>


                {
                    props.tls !== null && props.tls.next_protos?.map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index != 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Form.Control value={v} onChange={(e) => updateState((x) => { if (x != null && x.next_protos != undefined) x.next_protos[index] = e.target.value })} />
                                    <Button variant='outline-danger' onClick={() => updateState((x) => { if (x != null && x.next_protos != undefined) x?.next_protos.splice(index, 1) })}>
                                        <i className="bi bi-x-lg" ></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                        )
                    })
                }

                <Col sm={{ span: 10, offset: props.tls !== null && props.tls.next_protos?.length != 0 ? 2 : 0 }}>
                    <InputGroup className="mb-2" >
                        <Form.Control value={newNextProtos.value} onChange={(e) => setNewNextProtos({ value: e.target.value })} />
                        <Button variant='outline-success' onClick={() => updateState((x) => {
                            if (x?.next_protos == undefined) x.next_protos = []
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
                                    if (x?.certificates != undefined) x.certificates.splice(index, 1)
                                })}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </Card.Title>
                            <TLSCertificateComponents cert={v}
                                onChange={(e) => updateState((x) => {
                                    if (x?.certificates != undefined) x.certificates[index] = e
                                })} />
                        </Card.Body>
                    </Card>
                })
            }

            <InputGroup className="d-flex justify-content-end mb-2">
                <Button variant='outline-success'
                    onClick={() => updateState((x) => {
                        if (x?.certificates == undefined) x.certificates = []
                        x.certificates.push({})
                    })} >
                    <i className="bi bi-plus-lg" />New Certificate
                </Button>
            </InputGroup>



            {
                props.tls !== null
                && props.tls.server_name_certificate != undefined
                && Object.entries(props.tls.server_name_certificate).map(([k, v]) => {
                    return (
                        <Card className='mb-2' key={"server_name_certificate" + k}>
                            <Card.Body>
                                <Card.Title className='d-flex justify-content-between align-items-center'>
                                    {k}
                                    <Button variant='outline-danger' onClick={() => updateState((x) => {
                                        if (x?.server_name_certificate != undefined) delete x?.server_name_certificate[k]
                                    })}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>
                                <TLSCertificateComponents cert={v} onChange={(e) => updateState((x) => {
                                    if (x?.server_name_certificate != undefined) x.server_name_certificate[k] = e
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
                        if (newSni == "") return
                        if (x?.server_name_certificate == undefined) x.server_name_certificate = {}
                        if (x.server_name_certificate[newSni] == null) x.server_name_certificate[newSni] = {}
                    })} >
                    <i className="bi bi-plus-lg" />New SNI Certificate
                </Button>
            </InputGroup>
        </>
    )
})

type Websocket = {
    tls?: TLS | null,
}

const WebsocketComponents = React.memo((props: { websocket: Websocket, onChange: (x: Websocket) => void }) => {
    const updateState = (x: (x: Websocket) => void) => {
        let v = props.websocket;
        x(v)
        if (v !== null) props.onChange(v)
    }

    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"Websocket"} />

            {
                props.websocket.tls !== undefined && <TLSComponents tls={props.websocket.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

type Quic = {
    tls?: TLS | null,
}


const QuicComponents = React.memo((props: { quic: Quic, onChange: (x: Quic) => void }) => {
    const updateState = (x: (x: Quic) => void) => {
        let v = props.quic;
        x(v)
        if (v !== null) props.onChange(v)
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

type Grpc = {
    tls?: TLS | null,
}
const GrpcComponents = React.memo((props: { grpc: Grpc, onChange: (x: Grpc) => void }) => {
    const updateState = (x: (x: Grpc) => void) => {
        let v = props.grpc;
        x(v)
        if (v !== null) props.onChange(v)
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

type Tls = {
    tls?: TLS | null,
}

const TlsComponents = React.memo((props: { tls: Tls, onChange: (x: Tls) => void }) => {
    const updateState = (x: (x: Tls) => void) => {
        let v = props.tls;
        x(v)
        if (v !== null) props.onChange(v)
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

type Yuubinsya = {
    host: string,
    password: string,
    force_disable_encrypt: boolean,
    websocket?: Websocket | null,
    "normal"?: {} | null,
    quic?: Quic | null,
    tls?: Tls | null,
    grpc?: Grpc | null,
}




const YuubinsyaComponents = React.memo((props: { yuubinsya: Yuubinsya, onChange: (x: Yuubinsya) => void }) => {
    const updateState = (x: (x: Yuubinsya) => void) => {
        let v = props.yuubinsya;
        x(v)
        props.onChange(v)
    }

    return (
        <>
            <SettingCheck label='Force Disable Encrypt'
                checked={props.yuubinsya.force_disable_encrypt}
                onChange={() => updateState((x) => x.force_disable_encrypt = !x.force_disable_encrypt)} />

            <SettingInputText label='Host' value={props.yuubinsya.host} onChange={(e) => updateState((x) => x.host = e)} />
            <SettingInputText label='Password' value={props.yuubinsya.password} onChange={(e) => updateState((x) => x.password = e)} />

            {
                props.yuubinsya.websocket != undefined &&
                <WebsocketComponents websocket={props.yuubinsya.websocket} onChange={(e) => updateState((x) => x.websocket = e)} />
            }
            {
                props.yuubinsya.quic != undefined &&
                <QuicComponents quic={props.yuubinsya.quic} onChange={(e) => updateState((x) => x.quic = e)} />
            }
            {
                props.yuubinsya.grpc != undefined &&
                <GrpcComponents grpc={props.yuubinsya.grpc} onChange={(e) => updateState((x) => x.grpc = e)} />
            }
            {

                props.yuubinsya.tls != undefined &&
                <TlsComponents tls={props.yuubinsya.tls} onChange={(e) => updateState((x) => x.tls = e)} />
            }
        </>
    )
})

export type ServerConfig = {
    name: string,
    enabled: boolean,
    http?: HTTP,
    redir?: Redir,
    socks5?: Socks5,
    tun?: Tun,
    yuubinsya?: Yuubinsya,
}

export const defaultServers: { [key: string]: ServerConfig } = {};

const Protocol = React.memo((props: { protocol: ServerConfig, onChange: (x: ServerConfig) => void }) => {
    const updateState = (x: (x: ServerConfig) => void) => {
        let v = props.protocol;
        x(v)
        props.onChange(v)
    }
    if (props.protocol.http !== undefined)
        return <HTTPComponents http={props.protocol.http} onChange={(e) => updateState((x) => x.http = e)} />
    if (props.protocol.socks5 !== undefined)
        return <Socks5Components socks5={props.protocol.socks5} onChange={(e) => updateState((x) => x.socks5 = e)} />
    if (props.protocol.redir !== undefined)
        return <RedirComponents redir={props.protocol.redir} onChange={(e) => updateState((x) => x.redir = e)} />
    if (props.protocol.tun !== undefined)
        return <TunComponents tun={props.protocol.tun} onChange={(e) => updateState((x) => x.tun = e)} />
    if (props.protocol.yuubinsya !== undefined)
        return <YuubinsyaComponents yuubinsya={props.protocol.yuubinsya} onChange={(e) => updateState((x) => x.yuubinsya = e)} />
    return <></>
})


const Inbound = React.memo((props: { server: { [key: string]: ServerConfig }, onChange: (x: { [key: string]: ServerConfig }) => void, }) => {

    const [newProtocol, setNewProtocol] = useState({ value: "http", name: "" });

    const updateState = (x: (x: { [key: string]: ServerConfig }) => void) => {
        let v = props.server;
        x(v)
        props.onChange(v)
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
    if (name == "" || x[name] != undefined) return

    let sc: ServerConfig = {
        name: name,
        enabled: false,
    }

    switch (protocol) {
        case "http":
            sc.http = { host: ":8188", }
            break
        case "socks5":
            sc.socks5 = { host: ":1080" }
            break
        case "tun":
            sc.tun = {
                name: "tun://tun0",
                mtu: 1500,
                gateway: "172.16.0.1",
                dns_hijacking: true,
                skip_multicast: false,
                driver: "system_gvisor",
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
                normal: {},
            }
            break
        case "yuubinsya-websocket":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                websocket: {
                    tls: {},
                }
            }
            break
        case "yuubinsya-tls":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                tls: {
                    tls: {},
                }
            }
            break
        case "yuubinsya-grpc":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                grpc: {
                    tls: {},
                }
            }
            break
        case "yuubinsya-quic":
            sc.yuubinsya = {
                host: ":2096",
                force_disable_encrypt: false,
                password: "password",
                quic: {
                    tls: {},
                }
            }
            break
        default:
            return
    }

    x[name] = sc
}

export default Inbound;