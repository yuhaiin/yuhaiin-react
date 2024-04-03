"use client"

import { Button, Form, Row, Col, Card, ListGroup, InputGroup } from "react-bootstrap";
import { point } from "../pbes/node/point/point_pb";
import { direct, drop, grpc, http, http2, mux, none, obfs_http, protocol, quic, reality, reject, shadowsocks, shadowsocksr, simple, socks5, tls_config, trojan, vless, vmess, websocket, wireguard, wireguard_peer_config, yuubinsya } from "../pbes/node/protocol/protocol_pb";
import { NewBytesItemList, NewItemList, SettingInputText } from "../config/components";
import { SettingCheck } from "../common/switch";
import { Message } from "@bufbuild/protobuf";
import { useState } from "react";

function change<T>(e: T, apply?: (x: T) => void): (f: (x: T) => void) => void {
    if (!apply) return function (_: (x: T) => void) { }

    return function (f: (x: T) => void) {
        f(e)
        apply(e)
    }
}


export const Point = (props: { point: point, onChange?: (x: point) => void, onClose?: () => void }) => {
    const cc = change(props.point, props.onChange)
    const onClose = (i: number) => { cc((x) => { x.protocols.splice(i, 1) }) }
    const onChange = (i: number, e: Message) => {
        if (!props.onChange) return
        cc((x) => { x.protocols[i].protocol.value = e })
    }

    const [newProtocol, setNewProtocol] = useState({ value: "simple" });

    return <>
        <SettingInputText
            label="Name"
            value={props.point.name}
            onChange={(e) => { cc((x) => x.name = e) }}
        />

        <SettingInputText
            label="Group"
            value={props.point.group}
            onChange={(e) => { cc((x) => x.group = e) }}
        />

        <SettingInputText
            label="Hash"
            value={props.point.hash}
            onChange={(e) => { cc((x) => x.hash = e) }}
        />

        {
            props.point.protocols.map((x, i) => {
                switch (x.protocol.case) {
                    case "simple":
                        return <Simple key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "websocket":
                        return <Websocket key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "shadowsocks":
                        return <Shadowsocks key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "quic":
                        return <Quic key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "vless":
                        return <Vless key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "vmess":
                        return <Vmess key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "trojan":
                        return <Trojan key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "shadowsocksr":
                        return <Shadowsocksr key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "obfsHttp":
                        return <ObfsHttp key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "none":
                        return <None key={i} onClose={() => onClose(i)} />
                    case "socks5":
                        return <Socks5 key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "http":
                        return <HTTP key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "direct":
                        return <Direct key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "reject":
                        return <Reject key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "yuubinsya":
                        return <Yuubinsya key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "grpc":
                        return <Grpc key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "http2":
                        return <HTTP2 key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "reality":
                        return <Reality key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "tls":
                        return <Tls key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "wireguard":
                        return <Wireguard key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "mux":
                        return <Mux key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    case "drop":
                        return <Drop key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)} onClose={() => onClose(i)} />
                    default:
                        return <Unknown key={i} onClose={() => onClose(i)} />
                }
            })
        }


        <ListGroup variant="flush">
            <ListGroup.Item>
                <InputGroup>
                    <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ value: e.target.value })}>
                        {
                            Object.keys(protocolMapping).map((v) => {
                                return <option value={v} key={v}>{v}</option>
                            })
                        }
                    </Form.Select>
                    <Button
                        variant="outline-secondary"
                        onClick={() => cc((x) => { x.protocols.push(protocolMapping[newProtocol.value]) })}
                    >
                        Add
                    </Button>
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>
    </>
}


const Protocol = (props: { title: string, onClose?: () => void, children: JSX.Element }) => {
    return <>
        <Card>
            <Card.Header className="d-flex justify-content-between">
                {props.title}
                <Button variant='outline-danger' size="sm" onClick={props.onClose}><i className="bi bi-x-lg"></i> </Button>
            </Card.Header>
            <Card.Body>
                {props.children}
            </Card.Body>
        </Card>
        <br />
    </>
}

// const Test = () => {
//     const [sp, setSp] = useState({ data: protocolMapping["simple"].protocol.value as simple })
//     const [ws, setWs] = useState({ data: protocolMapping["websocket"].protocol.value as websocket })
//     const [tlsConfig, setTlsConfig] = useState({ data: protocolMapping["tls"].protocol.value as tls_config })
//     const [quic, setQuic] = useState({ data: protocolMapping["quic"].protocol.value as quic })
//     const [shadowsocks, setShadowsocks] = useState({ data: protocolMapping["shadowsocks"].protocol.value as shadowsocks })
//     const [shadowsocksr, setShadowsocksr] = useState({ data: protocolMapping["shadowsocksr"].protocol.value as shadowsocksr })
//     const [vmess, setVmess] = useState({ data: protocolMapping["vmess"].protocol.value as vmess })
//     const [wireguard, setWireguard] = useState({ data: protocolMapping["wireguard"].protocol.value as wireguard })

//     return <Card>
//         <Card.Body>

//             <Simple
//                 protocol={sp.data}
//                 onChange={(e) => setSp({ data: e })}
//             />

//             <br />

//             <None />

//             <br />

//             <Websocket
//                 protocol={ws.data}
//                 onChange={(e) => setWs({ data: e })}
//             />

//             <br />

//             <TlsConfig
//                 tls={tlsConfig.data}
//                 onChange={(e) => setTlsConfig({ data: e })}
//             />

//             <br />

//             <Quic
//                 protocol={quic.data}
//                 onChange={(e) => setQuic({ data: e })}
//             />

//             <br />

//             <Shadowsocks
//                 protocol={shadowsocks.data}
//                 onChange={(e) => setShadowsocks({ data: e })}
//             />

//             <br />

//             <Shadowsocksr
//                 protocol={shadowsocksr.data}
//                 onChange={(e) => setShadowsocksr({ data: e })}
//             />

//             <br />

//             <Vmess
//                 protocol={vmess.data}
//                 onChange={(e) => setVmess({ data: e })}
//             />

//             <br />

//             <Wireguard
//                 protocol={wireguard.data}
//                 onChange={(e) => setWireguard({ data: e })}
//             />
//         </Card.Body>
//     </Card>
// }


const Wireguard = (props: { protocol: wireguard, onChange: (e: wireguard) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)

    function NewPeersList(props: {
        title: string,
        data: wireguard_peer_config[],
        onChange: (x: wireguard_peer_config[]) => void
    }) {


        /*
        
                            allowedIps: ["0.0.0.0/0"],
                            endpoint: "127.0.0.1:51820",
                            publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
         */
        return (<Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>


            {
                props.data && props.data
                    .map((v, index) => {
                        return (
                            <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                                <InputGroup className="mb-2" >
                                    <Protocol
                                        title="Peer"
                                        onClose={() => {
                                            if (props.data) {
                                                props.data.splice(index, 1)
                                                props.onChange(props.data)
                                            }
                                        }}>
                                        <>
                                            <SettingInputText
                                                label="Endpoint"
                                                value={v.endpoint}
                                                onChange={(e) => {
                                                    if (props.data) {
                                                        props.data[index].endpoint = e
                                                        props.onChange(props.data)
                                                    }
                                                }}
                                            />

                                            <SettingInputText
                                                label="PublicKey"
                                                value={v.publicKey}
                                                onChange={(e) => {
                                                    if (props.data) {
                                                        props.data[index].publicKey = e
                                                        props.onChange(props.data)
                                                    }
                                                }}
                                            />

                                            <NewItemList
                                                title="AllowedIps"
                                                data={v.allowedIps}
                                                onChange={(e) => {
                                                    if (props.data) {
                                                        props.data[index].allowedIps = e
                                                        props.onChange(props.data)
                                                    }
                                                }}
                                            />
                                        </>
                                    </Protocol>
                                </InputGroup>
                            </Col>
                        )
                    })
            }

            <Col sm={{ span: 10, offset: props.data?.length !== 0 ? 2 : 0 }}>
                <InputGroup className="mb-2" >
                    <Button variant='outline-success' onClick={() => {
                        let data = new wireguard_peer_config({
                            allowedIps: ["0.0.0.0/0"],
                            endpoint: "127.0.0.1:51820",
                            publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                        });
                        if (!props.data)
                            props.onChange([data])
                        else {
                            props.data.push(data)
                            props.onChange(props.data)
                        }
                    }} >
                        <i className="bi bi-plus-lg" />
                    </Button>
                </InputGroup>
            </Col>

        </Form.Group>)
    }

    /*
    "wireguard": new protocol({
        protocol: {
            case: "wireguard",
            value: new wireguard({
                endpoint: ["10.0.0.2/32"],
                mtu: 1500,
                idleTimeout: 3,
                reserved: new Uint8Array([0, 0, 0]),
                secretKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                peers: [
                    {
                        allowedIps: ["0.0.0.0/0"],
                        endpoint: "127.0.0.1:51820",
                        publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                    },
                ]
            })
        }
    }),
     */

    return <Protocol title="Wireguard" onClose={props.onClose}>
        <>
            <SettingInputText
                label="SecretKey"
                value={props.protocol.secretKey}
                placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
                onChange={(e) => { cc((x) => x.secretKey = e) }}
            />

            <SettingInputText
                label="MTU"
                value={props.protocol.mtu}
                onChange={(e) => { if (!isNaN(Number(e))) cc((x) => x.mtu = Number(e)) }}
            />

            <SettingInputText
                label="IdleTimeout"
                value={props.protocol.idleTimeout}
                onChange={(e) => { if (!isNaN(Number(e))) cc((x) => x.idleTimeout = Number(e)) }}
            />

            <SettingInputText
                label="Reserved"
                value={btoa(new TextDecoder().decode(props.protocol.reserved))}
                onChange={(e) => { cc((x) => x.reserved = new TextEncoder().encode(atob(e))) }}
            />

            <NewItemList
                title="Endpoint"
                data={props.protocol.endpoint}
                onChange={(e) => { cc((x) => x.endpoint = e) }}
            />

            <NewPeersList
                title="Peers"
                data={props.protocol.peers}
                onChange={(e) => { cc((x) => x.peers = e) }}
            />
        </>
    </Protocol>
}

const Simple = (props: { protocol: simple, onChange: (e: simple) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)

    return <Protocol title="Simple" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Host"
                value={props.protocol.host}
                onChange={(e) => { cc((x) => x.host = e) }} />

            <SettingInputText label="Port" value={props.protocol.port} onChange={(e) => {
                let port = Number(e)
                if (isNaN(port) || port > 65535 || port < 0) return
                cc((x) => x.port = port)
            }} />

            <SettingInputText
                label="Timeout"
                value={Number(props.protocol.timeout)}
                onChange={(e) => {
                    let timeout = Number(e)
                    if (isNaN(timeout)) return
                    cc((x) => x.timeout = BigInt(timeout))
                }}
            />
        </>
    </Protocol>
}

const None = (props: { onClose?: () => void }) => {
    return <Protocol title="None" onClose={props.onClose}>
        <div className="text-center my-2" style={{ opacity: '0.4' }}>None</div>
    </Protocol>
}
const Unknown = (props: { onClose?: () => void }) => {
    return <Protocol title="Unknown" onClose={props.onClose}>
        <div className="text-center my-2" style={{ opacity: '0.4' }}>Unknown</div>
    </Protocol>
}

const Websocket = (props: { protocol: websocket, onChange: (x: websocket) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)

    return <Protocol title="Websocket" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Host"
                value={props.protocol.host}
                onChange={(e) => { cc((x) => x.host = e) }}
            />

            <SettingInputText
                label="Path"
                value={props.protocol.path}
                onChange={(e) => { cc((x) => x.path = e) }}
            />
        </>
    </Protocol>
}

const Shadowsocks = (props: { protocol: shadowsocks, onChange: (e: shadowsocks) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)

    return <Protocol title="Shadowsocks" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Method"
                value={props.protocol.method}
                onChange={(e) => { cc((x) => x.method = e) }}
            />

            <SettingInputText
                label="Password"
                value={props.protocol.password}
                onChange={(e) => { cc((x) => x.password = e) }}
            />
        </>
    </Protocol>
}

const TlsConfig = (props: { tls: tls_config, onChange: (x: tls_config) => void, showEnabled?: boolean }) => {
    let cc = change(props.tls, props.onChange)
    return <>
        {(props.showEnabled === undefined || props.showEnabled) && <SettingCheck label="TLS Enabled" checked={props.tls.enable} onChange={() => { cc((x) => x.enable = !x.enable) }} />}
        <SettingCheck label="InsecureSkipVerify" checked={props.tls.insecureSkipVerify} onChange={() => { cc((x) => x.insecureSkipVerify = !x.insecureSkipVerify) }} />
        <NewItemList title="ServerNames" data={props.tls.serverNames} onChange={(x) => { cc((y) => y.serverNames = x) }} />
        <NewItemList title="NextProtos" data={props.tls.nextProtos} onChange={(x) => { cc((y) => y.nextProtos = x) }} />
        <NewBytesItemList title="CaCert" textarea data={props.tls.caCert} onChange={(x) => { cc((y) => y.caCert = x) }} />
    </>
}

const Quic = (props: { protocol: quic, onChange: (x: quic) => void, onClose?: () => void }) => {
    let cc = change(props.protocol, props.onChange)
    return <>
        <Protocol title="Quic" onClose={props.onClose} >
            <>
                <SettingInputText label="Host" value={props.protocol.host} onChange={(e) => { cc((x) => x.host = e) }} />
                <TlsConfig showEnabled={false} tls={props.protocol.tls ?? new tls_config({})} onChange={(x) => { cc((y) => y.tls = x) }} />
            </>
        </Protocol>
    </>
}

const Shadowsocksr = (props: { protocol: shadowsocksr, onChange: (x: shadowsocksr) => void, onClose?: () => void }) => {
    let cc = change(props.protocol, props.onChange);
    /*
     {
            case: "shadowsocksr",
            value: new shadowsocksr({
                method: "chacha20-ietf",
                obfs: "http_post",
                obfsparam: "#name=v",
                password: "password",
                port: "1080",
                protocol: "auth_aes128_sha1",
                protoparam: "",
                server: "127.0.0.1"
            })
        }
     */
    return <Protocol title="Shadowsocksr" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Server"
                value={props.protocol.server}
                onChange={(e) => { cc((x) => x.server = e) }}
            />

            <SettingInputText
                label="Port"
                value={props.protocol.port}
                onChange={(e) => { cc((x) => x.port = e) }}
            />

            <SettingInputText
                label="Method"
                value={props.protocol.method}
                placeholder="chacha20-ietf"
                onChange={(e) => { cc((x) => x.method = e) }}
            />

            <SettingInputText
                label="Protocol"
                value={props.protocol.protocol}
                placeholder="auth_aes128_sha1"
                onChange={(e) => { cc((x) => x.protocol = e) }}
            />

            <SettingInputText
                label="ProtocolParam"
                value={props.protocol.protoparam}
                onChange={(e) => { cc((x) => x.protoparam = e) }}
            />

            <SettingInputText
                label="Obfs"
                value={props.protocol.obfs}
                placeholder="http_post"
                onChange={(e) => { cc((x) => x.obfs = e) }}
            />

            <SettingInputText
                label="ObfsParam"
                value={props.protocol.obfsparam}
                placeholder="#name=v"
                onChange={(e) => { cc((x) => x.obfsparam = e) }}
            />
        </>
    </Protocol>
}

const Vmess = (props: { protocol: vmess, onChange: (e: vmess) => void, onClose?: () => void }) => {
    let cc = change(props.protocol, props.onChange)
    /*
    "vmess": new protocol({
            protocol: {
                case: "vmess",
                value: new vmess({
                    alterId: "0",
                    security: "chacha20-poly1305",
                    uuid: "9d5031b6-4ef5-11ee-be56-0242ac120002"
                })
            }
        })
         */

    return <Protocol title="Vmess" onClose={props.onClose}>
        <>
            <SettingInputText
                label="AlterId"
                value={props.protocol.alterId}
                onChange={(e) => { cc((x) => x.alterId = e) }}
            />

            <SettingInputText
                label="Security"
                value={props.protocol.security}
                placeholder="chacha20-poly1305"
                onChange={(e) => { cc((x) => x.security = e) }}
            />

            <SettingInputText
                label="UUID"
                value={props.protocol.uuid}
                placeholder="9d5031b6-4ef5-11ee-be56-0242ac120002"
                onChange={(e) => { cc((x) => x.uuid = e) }}
            />
        </>
    </Protocol>
}

const Trojan = (props: { protocol: trojan, onChange: (e: trojan) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    /*
        "trojan": new protocol({
            protocol: {
                case: "trojan",
                value: new trojan({
                    password: "password",
                    peer: "peer"
                })
            }
        }),
     */
    return <Protocol title="Trojan" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Password"
                value={props.protocol.password}
                onChange={(e) => { cc((x) => x.password = e) }}
            />

            <SettingInputText
                label="Peer"
                value={props.protocol.peer}
                onChange={(e) => { cc((x) => x.peer = e) }}
            />
        </>
    </Protocol>
}


const Socks5 = (props: { protocol: socks5, onChange: (e: socks5) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    /*
    "socks5": new protocol({
        protocol: {
            case: "socks5",
            value: new socks5({
                hostname: "127.0.0.1:1080",
                password: "password",
                user: "username"
            })
        }
    }),
     */
    return <Protocol title="Socks5" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Hostname"
                value={props.protocol.hostname}
                placeholder="127.0.0.1"
                onChange={(e) => { cc((x) => x.hostname = e) }}
            />

            <SettingInputText
                label="User"
                value={props.protocol.user}
                onChange={(e) => { cc((x) => x.user = e) }}
            />

            <SettingInputText
                label="Password"
                value={props.protocol.password}
                onChange={(e) => { cc((x) => x.password = e) }}
            />
        </>
    </Protocol>
}

const HTTP = (props: { protocol: http, onChange: (x: http) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    /*
    "http": new protocol({
        protocol: {
            case: "http",
            value: new http({
                password: "password",
                user: "username"
            })
        }
    }),
     */
    return <Protocol title="HTTP" onClose={props.onClose}>
        <>
            <SettingInputText
                label="User"
                value={props.protocol.user}
                onChange={(e) => { cc((x) => x.user = e) }}
            />

            <SettingInputText
                label="Password"
                value={props.protocol.password}
                onChange={(e) => { cc((x) => x.password = e) }}
            />
        </>
    </Protocol>
}

const Direct = (props: { protocol: direct, onChange: (x: direct) => void, onClose?: () => void }) => {
    let cc = change(props.protocol, props.onChange)
    return <Protocol title="Direct" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Timeout"
                value={Number(props.protocol.timeout)}
                onChange={(e) => { cc((x) => { if (!isNaN(Number(e))) x.timeout = BigInt(e) }) }}
            />
        </>
    </Protocol>
}

const Reject = (props: { protocol: reject, onChange: (x: reject) => void, onClose?: () => void }) => {
    return <Protocol title="Reject" onClose={props.onClose}>
        <>
            <div className="text-center my-2" style={{ opacity: '0.4' }}>Reject</div>
        </>
    </Protocol>
}


const Yuubinsya = (props: { protocol: yuubinsya, onChange: (x: yuubinsya) => void, onClose?: () => void }) => {
    let cc = change(props.protocol, props.onChange)
    /*
    "yuubinsya": new protocol({
        protocol: {
            case: "yuubinsya",
            value: new yuubinsya({
                encrypted: true,
                password: "password",
                udpOverStream: false,
            })
        }
    })
     */
    return <Protocol title="Yuubinsya" onClose={props.onClose}>
        <>
            <SettingCheck
                label="Encrypted"
                checked={props.protocol.encrypted}
                onChange={() => { cc((x) => x.encrypted = !x.encrypted) }}
            />

            <SettingCheck
                label="UdpOverStream"
                checked={props.protocol.udpOverStream}
                onChange={() => { cc((x) => x.udpOverStream = !x.udpOverStream) }}
            />

            <SettingInputText
                label="Password"
                value={props.protocol.password}
                onChange={(e) => { cc((x) => x.password = e) }}
            />
        </>
    </Protocol>
}

const Tls = (props: { protocol: tls_config, onChange: (x: tls_config) => void, onClose?: () => void }) => {
    return <Protocol title="Tls" onClose={props.onClose}>
        <TlsConfig
            tls={props.protocol}
            onChange={props.onChange}
        />
    </Protocol>
}

const Mux = (props: { protocol: mux, onChange: (e: mux) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    return <Protocol title="Mux" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Concurrency"
                value={props.protocol.concurrency}
                onChange={(e) => { if (!isNaN(Number(e))) cc((x) => x.concurrency = Number(e)) }}
            />
        </>
    </Protocol>
}

const Drop = (props: { protocol: drop, onChange: (e: drop) => void, onClose?: () => void }) => {
    return <Protocol title="Drop" onClose={props.onClose}>
        <div className="text-center my-2" style={{ opacity: '0.4' }}>Drop</div>
    </Protocol>
}

const Vless = (props: { protocol: vless, onChange: (e: vless) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    return <Protocol title="Vless" onClose={props.onClose}>
        <>
            <SettingInputText
                label="UUID"
                value={props.protocol.uuid}
                onChange={(e) => { cc((x) => x.uuid = e) }}
            />
        </>
    </Protocol>
}

const ObfsHttp = (props: { protocol: obfs_http, onChange: (e: obfs_http) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    return <Protocol title="ObfsHttp" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Host"
                value={props.protocol.host}
                onChange={(e) => { cc((x) => x.host = e) }}
            />

            <SettingInputText
                label="Port"
                value={props.protocol.port}
                onChange={(e) => { cc((x) => x.port = e) }}
            />
        </>
    </Protocol>
}


const Grpc = (props: { protocol: grpc, onChange: (e: grpc) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    return <Protocol title="Grpc" onClose={props.onClose}>
        <TlsConfig tls={props.protocol.tls ?? new tls_config({})} onChange={(x) => { cc((y) => y.tls = x) }} />
    </Protocol>
}

const HTTP2 = (props: { protocol: http2, onChange: (e: http2) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    return <Protocol title="Http2" onClose={props.onClose}>
        <>
            <SettingInputText
                label="Concurrency"
                value={props.protocol.concurrency}
                onChange={(e) => { if (!isNaN(Number(e))) cc((x) => x.concurrency = Number(e)) }}
            />
        </>
    </Protocol>
}

const Reality = (props: { protocol: reality, onChange: (e: reality) => void, onClose?: () => void }) => {
    const cc = change(props.protocol, props.onChange)
    /*
        "reality": new protocol({
            protocol: {
                case: "reality",
                value: new reality({
                    debug: false,
                    publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                    serverName: "127.0.0.1",
                    shortId: "9d5031b6-4ef5-11ee-be56-0242ac120002"
                })
            }
        }
     */
    return <Protocol title="Reality" onClose={props.onClose}>
        <>
            <SettingCheck
                label="Debug"
                checked={props.protocol.debug}
                onChange={() => { cc((x) => x.debug = !x.debug) }}
            />

            <SettingInputText
                label="PublicKey"
                value={props.protocol.publicKey}
                onChange={(e) => { cc((x) => x.publicKey = e) }}
            />

            <SettingInputText
                label="ServerName"
                value={props.protocol.serverName}
                onChange={(e) => { cc((x) => x.serverName = e) }}
            />

            <SettingInputText
                label="ShortId"
                value={props.protocol.shortId}
                onChange={(e) => { cc((x) => x.shortId = e) }}
            />
        </>
    </Protocol>
}



let tlsConfig = new tls_config({
    enable: false,
    caCert: [new TextEncoder().encode(`-----CERTIFICATE-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD4MVvq8SAOzdeE
SUfehAij/kdTYKPfuc+5SBTNSykilsGsY1mEu4qS6Abc/8bfRM7e9+4bAkA9rSma
p9Rza0YWNwdYQD3j3vuFlR6ic6tTYN7estRGGFOoI5MxA8OsYDbWNnO/3jYlErtn
XUqDK5iABtBYNsSrLEc/Y2iISCm0zIT7Bfn3gzboggbqx5bpWjT5HmMRZmezl6EB
y6HjCSIgZzP2v3yOfOVcu70vKABD3X1bzaKEn86rXNra0TZkqvB9vPv1PsBrELrO
JxFRrAZylgeShzXgBXWjZKyj/toZ7FJLDv896sW/LuQarQufIcluisO++Xkz/EwQ
VuXURFENAgMBAAECggEAIuOnaPfD+qjHiNZXVsmnQExswOUHLFpdv81I9VIBQpZA
PAhMS3skoAGjg1omXfj5fsEKFPxkRPdMb6vzktUL6XALZYXEXX3ZTD456/rIJQSr
V9F6Qy9ExVBY7u05SshMtSC69Ugawuvm8cEcyiMtASRUEe6DB5AGJPxHs863JC3M
Dcb5nNYPGjFCsahkwz4rQq/eQQI0j+8TZlHtPFjTCgqMblk2qR/vwkfTI6Wv/rO6
YZ+M3xXpYc4j1qcHz5PFxIh3kZMgP/GdqLf+l5O4JaFv2aqxEmCjTHq3rAlxJeiV
tCT5xYCwYzZtZkZq5jPP6CruNbO+L8iyLYHgLAgmsQKBgQD+Pw5nO2FR7arAMR4I
K+bK2fFWfBTSkMRJrVqtbjr3LIjRGbGmqaF0HjR/8ZNxmyHBPmG35rfUw32NIAFc
q9nqXVgeL07CXRadYaMoVys3mukMiQSnuycA5se5uNXk/8bulaudLX0Q605GDWto
29W3CnWyuz1qNGRZHYZ0Duyk3QKBgQD5550WA/5Fwco2WosDqNBCetf3GZazwtKU
46Dk1QEXeGYrw3p/o42+nNuawqqxbKhH/OJarir8oT4amXMaf60M3tRjj/DYRLx1
WS9LkuU9bWSRFIpdJxC4BWi9IPCOsfbF0Cui9nD5dXCE6YwoQEXZ8OhE8+y+2fHU
OULeYZVB8QKBgQDYtnrad3zuzry68aL9qB4jTj4uT7mX+hm2C3O9XLYaNfWw9ku9
Gd4rEgwB+rKJJYhSJZA5pwmO68s63csLaNhosoQHxp9FgP9jyvO90P9feEWpj6lO
J3KJjC02G10GwxaYCy+q3Dk8kLW5dHrXeHrkeJ/2Zy9kNaBLbaVLi+UeaQKBgQDo
+GsRIxfgoBCLK019U9sSnsLGsSw02OLHuo07xvcFklBtbAa/BxIVKNXxKJlIXitj
MPUz5Dpe2VK0KWmMwono/bKyPnYgp7OpEkNtCLx8z4Z5WdTDkq+bXi+OYS7hWDbd
onuLqIMZi8ohnjfzLjfwPQ3LejqykStI1TjpZ79lgQKBgQDJAQe8Wnn2+QbWSbda
NFGyG+hs7SkqqZmEQl3nA5kyAeOSsGtJG9tiLxDE52eMUM1iL6wNPQMDkROp3yRg
7muJLMjiVeLFxXUyCXKj11W1VER5i16RsuWW3m5aGxumaXw4TJviJzT/dnwHe+x9
pWZqcBJfEUP6uTLSp3CmyEPcfA==
-----CERTIFICATE-----`)],
    insecureSkipVerify: false,
    nextProtos: ["h2"],
    serverNames: ["www.example.com"]
})


export const protocolMapping: { [key: string]: protocol } = {
    "simple": new protocol({
        protocol: {
            case: "simple",
            value: new simple({
                host: "",
                alternateHost: [],
                port: 1080,
                timeout: BigInt(0),
            })
        }
    }),
    "none": new protocol({
        protocol: {
            case: "none",
            value: new none({}),
        }
    }),
    "websocket": new protocol({
        protocol: {
            case: "websocket",
            value: new websocket({
                host: "www.example.com",
                path: "/msg",
            })
        }
    }),
    "quic": new protocol({
        protocol: {
            case: "quic",
            value: new quic({
                tls: tlsConfig
            })
        }
    }),
    "shadowsocks": new protocol({
        protocol: {
            case: "shadowsocks",
            value: new shadowsocks({
                method: "CHACHA20-IETF-POLY1305",
                password: "password"
            })
        }
    }),
    "obfshttp": new protocol({
        protocol: {
            case: "obfsHttp",
            value: new obfs_http({
                host: "www.example.com",
                port: "443"
            })
        }
    }),
    "shadowsocksr": new protocol({
        protocol: {
            case: "shadowsocksr",
            value: new shadowsocksr({
                method: "chacha20-ietf",
                obfs: "http_post",
                obfsparam: "#name=v",
                password: "password",
                port: "1080",
                protocol: "auth_aes128_sha1",
                protoparam: "",
                server: "127.0.0.1"
            })
        }
    }),
    "vmess": new protocol({
        protocol: {
            case: "vmess",
            value: new vmess({
                alterId: "0",
                security: "chacha20-poly1305",
                uuid: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            })
        }
    }),
    "trojan": new protocol({
        protocol: {
            case: "trojan",
            value: new trojan({
                password: "password",
                peer: "peer"
            })
        }
    }),
    "socks5": new protocol({
        protocol: {
            case: "socks5",
            value: new socks5({
                hostname: "127.0.0.1",
                password: "password",
                user: "username"
            })
        }
    }),
    "http": new protocol({
        protocol: {
            case: "http",
            value: new http({
                password: "password",
                user: "username"
            })
        }
    }),
    "direct": new protocol({
        protocol: {
            case: "direct",
            value: new direct({})
        }
    }),
    "yuubinsya": new protocol({
        protocol: {
            case: "yuubinsya",
            value: new yuubinsya({
                encrypted: true,
                password: "password",
                udpOverStream: false,
            })
        }
    }),
    "tls": new protocol({
        protocol: {
            case: "tls",
            value: tlsConfig,
        }
    }),
    "wireguard": new protocol({
        protocol: {
            case: "wireguard",
            value: new wireguard({
                endpoint: ["10.0.0.2/32"],
                mtu: 1500,
                idleTimeout: 3,
                reserved: new Uint8Array([0, 0, 0]),
                secretKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                peers: [
                    {
                        allowedIps: ["0.0.0.0/0"],
                        endpoint: "127.0.0.1:51820",
                        publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                    },
                ]
            })
        }
    }),
    "mux": new protocol({
        protocol: {
            case: "mux",
            value: new mux({
                concurrency: 8,
            })
        }
    }),
    "drop": new protocol({
        protocol: {
            case: "drop",
            value: new drop({})
        }
    }),
    "vless": new protocol({
        protocol: {
            case: "vless",
            value: new vless({
                uuid: "c48619fe-8f02-49e0-b9e9-edf763e17e21",
            })
        }
    }),
    "grpc": new protocol({
        protocol: {
            case: "grpc",
            value: new grpc({ tls: tlsConfig })
        }
    }),
    "http2": new protocol({
        protocol: {
            case: "http2",
            value: new http2({ concurrency: 8, })
        }
    }),
    "reality": new protocol({
        protocol: {
            case: "reality",
            value: new reality({
                debug: false,
                publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                serverName: "127.0.0.1",
                shortId: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            })
        }
    })
}