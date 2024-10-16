"use client"
import React, { useState } from 'react';
import { Button, Form, Row, Col, ListGroup, InputGroup } from "react-bootstrap";
import { point } from "../pbes/node/point/point_pb";
import { direct, directSchema, drop, dropSchema, grpc, grpcSchema, host, hostSchema, http, http2, http2Schema, httpSchema, mux, muxSchema, none, noneSchema, obfs_http, obfs_httpSchema, protocol, protocolSchema, quic, quicSchema, reality, realitySchema, reject, shadowsocks, shadowsocksr, shadowsocksrSchema, shadowsocksSchema, simple, simpleSchema, socks5, socks5Schema, tls_config, tls_configSchema, trojan, trojanSchema, vless, vlessSchema, vmess, vmessSchema, websocket, websocketSchema, wireguard, wireguard_peer_config, wireguard_peer_configSchema, wireguardSchema, yuubinsya, yuubinsyaSchema } from "../pbes/node/protocol/protocol_pb";
import { NewBytesItemList, NewItemList, Remind, SettingInputText, Container, MoveUpDown } from "../config/components";
import { SettingCheck } from "../common/switch";
import { create, Message } from "@bufbuild/protobuf";

function change<T>(e: T, apply?: (x: T) => void): (f: (x: T) => void) => void {
    if (!apply) return function (_: (x: T) => void) { }

    return function (f: (x: T) => void) {
        f(e)
        apply(e)
    }
}


export const Point = React.forwardRef((props: {
    point: point,
    onChange?: (x: point) => void,
    onClose?: () => void,
    groups?: string[],
}, ref) => {
    const cc = change(props.point, props.onChange)
    const onClose = (i: number) => {
        cc((x) => { x.protocols.splice(i, 1) })
    }
    function onChange(i: number, e:
        shadowsocks |
        shadowsocksr |
        vmess | vless | websocket | quic | obfs_http | trojan |
        grpc | mux | none | reality | tls_config | wireguard | drop |
        simple | socks5 | http | http2 | direct | reject | yuubinsya | obfs_http | undefined) {
        if (!props.onChange) return
        cc((x) => { x.protocols[i].protocol.value = e })
    }

    const onMove = (up: boolean, current: number) => {
        if (props.point.protocols.length <= 1) return
        if (up && current === 0) return
        if (!up && current === props.point.protocols.length - 1) return
        cc((x) => {
            let tmp = x.protocols[current]
            x.protocols[current] = x.protocols[current + (up ? -1 : 1)]
            x.protocols[current + (up ? -1 : 1)] = tmp
        })
    }

    const [newProtocol, setNewProtocol] = useState({ value: "simple" });

    return <>
        <SettingInputText
            label="Name"
            value={props.point.name}
            onChange={(e) => {
                cc((x) => x.name = e)
            }}
        />

        <SettingInputText
            label="Group"
            value={props.point.group}
            onChange={(e) => {
                cc((x) => x.group = e)
            }}
            reminds={props.groups ? props.groups.map(x => new Remind({ label: x, value: x })) : undefined}
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
                        return <Simple key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "websocket":
                        return <Websocket key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "shadowsocks":
                        return <Shadowsocks key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "quic":
                        return <Quic key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "vless":
                        return <Vless key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "vmess":
                        return <Vmess key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "trojan":
                        return <Trojan key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "shadowsocksr":
                        return <Shadowsocksr key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "obfsHttp":
                        return <ObfsHttp key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "none":
                        return <None key={i} onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "socks5":
                        return <Socks5 key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "http":
                        return <HTTP key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "direct":
                        return <Direct key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "reject":
                        return <Reject key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "yuubinsya":
                        return <Yuubinsya key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "grpc":
                        return <Grpc key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "http2":
                        return <HTTP2 key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "reality":
                        return <Reality key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "tls":
                        return <Tls key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "wireguard":
                        return <Wireguard key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "mux":
                        return <Mux key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    case "drop":
                        return <Drop key={i} protocol={x.protocol.value} onChange={(e) => onChange(i, e)}
                            onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                    default:
                        return <Unknown key={i} onClose={() => onClose(i)} moveUpDown={new MoveUpDown(props.point.protocols.length, i, (x) => { onMove(x, i) })} />
                }
            })
        }


        <ListGroup variant="flush">
            <ListGroup.Item>
                <InputGroup>
                    <Form.Select value={newProtocol.value} onChange={(e) => {
                        setNewProtocol({ value: e.target.value })
                    }
                    }>
                        {
                            Object.keys(protocols).map((v) => {
                                return <option value={v} key={v}>{v}</option>
                            })
                        }
                    </Form.Select>
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            cc((x) => { x.protocols.push(protocols[newProtocol.value]) })
                        }}
                    >
                        Add
                    </Button>
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>
    </>
})

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
                                <Container
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
                                </Container>
                            </InputGroup>
                        </Col>
                    )
                })
        }

        <Col sm={{ span: 10, offset: props.data?.length !== 0 ? 2 : 0 }}>
            <InputGroup className="mb-2 justify-content-md-end" >
                <Button variant='outline-success' onClick={() => {
                    let data = create(wireguard_peer_configSchema, {
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

const Wireguard = (props: { protocol: wireguard, onChange: (e: wireguard) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)

    /*
    "wireguard": create(protocolSchema,{
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

    return <Container title="Wireguard" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
                value={btoa(String.fromCharCode.apply(null, props.protocol.reserved))}
                onChange={(e) => { cc((x) => x.reserved = Uint8Array.from(atob(e), c => c.charCodeAt(0))) }}
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
    </Container>
}

function NewAlternateHostList(props: {
    title: string,
    data: host[],
    onChange: (x: host[]) => void
}) {
    return (
        <Form.Group as={Row} className='mb-3 flex-grow-1 overflow-auto'>
            <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>
            {
                props.data && props.data.map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                            <InputGroup className="mb-2" >
                                <Container
                                    title="Host"
                                    onClose={() => {
                                        if (props.data) {
                                            props.data.splice(index, 1)
                                            props.onChange(props.data)
                                        }
                                    }}>
                                    <>
                                        <SettingInputText
                                            label="Host"
                                            value={v.host}
                                            onChange={(e) => {
                                                if (props.data) {
                                                    props.data[index].host = e
                                                    props.onChange(props.data)
                                                }
                                            }}
                                        />

                                        <SettingInputText
                                            label="Port"
                                            value={v.port}
                                            onChange={(e) => {
                                                if (isNaN(Number(e))) return
                                                if (props.data) {
                                                    props.data[index].port = Number(e)
                                                    props.onChange(props.data)
                                                }
                                            }}
                                        />

                                    </>
                                </Container>
                            </InputGroup>
                        </Col>
                    )
                })
            }

            <Col sm={{ span: 10, offset: props.data?.length !== 0 ? 2 : 0 }}>
                <InputGroup className="mb-2 justify-content-md-end" >
                    <Button variant='outline-success' onClick={() => {
                        let data = create(hostSchema, {});
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

const Simple = (props: { protocol: simple, onChange: (e: simple) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)

    return <Container title="Simple" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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

            <NewAlternateHostList
                title="AlternateHost"
                data={props.protocol.alternateHost}
                onChange={(e) => { cc((x) => x.alternateHost = e) }}
            />
        </>
    </Container>
}

const None = (props: { onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    return <Container title="None" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <div className="text-center my-2" style={{ opacity: '0.4' }}>None</div>
    </Container>
}
const Unknown = (props: { onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    return <Container title="Unknown" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <div className="text-center my-2" style={{ opacity: '0.4' }}>Unknown</div>
    </Container>
}

const Websocket = (props: { protocol: websocket, onChange: (x: websocket) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)

    return <Container title="Websocket" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}

const Shadowsocks = (props: { protocol: shadowsocks, onChange: (e: shadowsocks) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)

    return <Container title="Shadowsocks" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
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

const Quic = (props: { protocol: quic, onChange: (x: quic) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    let cc = change(props.protocol, props.onChange)
    return <>
        <Container title="Quic" onClose={props.onClose} moveUpDown={props.moveUpDown}>
            <>
                <SettingInputText label="Host" value={props.protocol.host} onChange={(e) => { cc((x) => x.host = e) }} />
                <TlsConfig showEnabled={false} tls={props.protocol.tls ?? create(tls_configSchema, {})} onChange={(x) => { cc((y) => y.tls = x) }} />
            </>
        </Container>
    </>
}

const Shadowsocksr = (props: { protocol: shadowsocksr, onChange: (x: shadowsocksr) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
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
    return <Container title="Shadowsocksr" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}

const Vmess = (props: { protocol: vmess, onChange: (e: vmess) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    let cc = change(props.protocol, props.onChange)
    /*
    "vmess": create(protocolSchema,{
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

    return <Container title="Vmess" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}

const Trojan = (props: { protocol: trojan, onChange: (e: trojan) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    /*
        "trojan": create(protocolSchema,{
            protocol: {
                case: "trojan",
                value: new trojan({
                    password: "password",
                    peer: "peer"
                })
            }
        }),
     */
    return <Container title="Trojan" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}


const Socks5 = (props: { protocol: socks5, onChange: (e: socks5) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    /*
    "socks5": create(protocolSchema,{
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
    return <Container title="Socks5" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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

            <SettingInputText label="Override Port" value={props.protocol.overridePort} onChange={(e) => {
                let port = Number(e)
                if (isNaN(port) || port > 65535 || port < 0) return
                cc((x) => x.overridePort = port)
            }} />
        </>
    </Container>
}

const HTTP = (props: { protocol: http, onChange: (x: http) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    /*
    "http": create(protocolSchema,{
        protocol: {
            case: "http",
            value: new http({
                password: "password",
                user: "username"
            })
        }
    }),
     */
    return <Container title="HTTP" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}

const Direct = (props: { protocol: direct, onChange: (x: direct) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    let cc = change(props.protocol, props.onChange)
    return <Container title="Direct" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <>
        </>
    </Container>
}

const Reject = (props: { protocol: reject, onChange: (x: reject) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    return <Container title="Reject" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <>
            <div className="text-center my-2" style={{ opacity: '0.4' }}>Reject</div>
        </>
    </Container>
}


const Yuubinsya = (props: { protocol: yuubinsya, onChange: (x: yuubinsya) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    let cc = change(props.protocol, props.onChange)
    /*
    "yuubinsya": create(protocolSchema,{
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
    return <Container title="Yuubinsya" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <>
            <SettingCheck
                label="TCP Encrypt"
                checked={props.protocol.tcpEncrypt}
                onChange={() => { cc((x) => x.tcpEncrypt = !x.tcpEncrypt) }}
            />
            <SettingCheck
                label="UDP Encrypt"
                checked={props.protocol.udpEncrypt}
                onChange={() => { cc((x) => x.udpEncrypt = !x.udpEncrypt) }}
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
    </Container>
}

const Tls = (props: { protocol: tls_config, onChange: (x: tls_config) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    return <Container title="Tls" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <TlsConfig
            tls={props.protocol}
            onChange={props.onChange}
        />
    </Container>
}

const Mux = (props: { protocol: mux, onChange: (e: mux) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    return <Container title="Mux" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <>
            <SettingInputText
                label="Concurrency"
                value={props.protocol.concurrency}
                onChange={(e) => { if (!isNaN(Number(e))) cc((x) => x.concurrency = Number(e)) }}
            />
        </>
    </Container>
}

const Drop = (props: { protocol: drop, onChange: (e: drop) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    return <Container title="Drop" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <div className="text-center my-2" style={{ opacity: '0.4' }}>Drop</div>
    </Container>
}

const Vless = (props: { protocol: vless, onChange: (e: vless) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    return <Container title="Vless" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <>
            <SettingInputText
                label="UUID"
                value={props.protocol.uuid}
                onChange={(e) => { cc((x) => x.uuid = e) }}
            />
        </>
    </Container>
}

const ObfsHttp = (props: { protocol: obfs_http, onChange: (e: obfs_http) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    return <Container title="ObfsHttp" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}


const Grpc = (props: { protocol: grpc, onChange: (e: grpc) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    return <Container title="Grpc" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <TlsConfig tls={props.protocol.tls ?? create(tls_configSchema, {})} onChange={(x) => { cc((y) => y.tls = x) }} />
    </Container>
}

const HTTP2 = (props: { protocol: http2, onChange: (e: http2) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    return <Container title="Http2" onClose={props.onClose} moveUpDown={props.moveUpDown}>
        <>
            <SettingInputText
                label="Concurrency"
                value={props.protocol.concurrency}
                onChange={(e) => { if (!isNaN(Number(e))) cc((x) => x.concurrency = Number(e)) }}
            />
        </>
    </Container>
}

const Reality = (props: { protocol: reality, onChange: (e: reality) => void, onClose?: () => void, moveUpDown?: MoveUpDown }) => {
    const cc = change(props.protocol, props.onChange)
    /*
        "reality": create(protocolSchema,{
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
    return <Container title="Reality" onClose={props.onClose} moveUpDown={props.moveUpDown}>
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
    </Container>
}



let tlsConfig = create(tls_configSchema, {
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


export const protocols: { [key: string]: protocol } = {
    "simple": create(protocolSchema, {
        protocol: {
            case: "simple",
            value: create(simpleSchema, {
                host: "",
                alternateHost: [],
                port: 1080,
            })
        }
    }),
    "none": create(protocolSchema, {
        protocol: {
            case: "none",
            value: create(noneSchema, {}),
        }
    }),
    "websocket": create(protocolSchema, {
        protocol: {
            case: "websocket",
            value: create(websocketSchema, {
                host: "www.example.com",
                path: "/msg",
            })
        }
    }),
    "quic": create(protocolSchema, {
        protocol: {
            case: "quic",
            value: create(quicSchema, {
                tls: tlsConfig
            })
        }
    }),
    "shadowsocks": create(protocolSchema, {
        protocol: {
            case: "shadowsocks",
            value: create(shadowsocksSchema, {
                method: "CHACHA20-IETF-POLY1305",
                password: "password"
            })
        }
    }),
    "obfshttp": create(protocolSchema, {
        protocol: {
            case: "obfsHttp",
            value: create(obfs_httpSchema, {
                host: "www.example.com",
                port: "443"
            })
        }
    }),
    "shadowsocksr": create(protocolSchema, {
        protocol: {
            case: "shadowsocksr",
            value: create(shadowsocksrSchema, {
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
    "vmess": create(protocolSchema, {
        protocol: {
            case: "vmess",
            value: create(vmessSchema, {
                alterId: "0",
                security: "chacha20-poly1305",
                uuid: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            })
        }
    }),
    "trojan": create(protocolSchema, {
        protocol: {
            case: "trojan",
            value: create(trojanSchema, {
                password: "password",
                peer: "peer"
            })
        }
    }),
    "socks5": create(protocolSchema, {
        protocol: {
            case: "socks5",
            value: create(socks5Schema, {
                hostname: "127.0.0.1:1080",
                password: "password",
                user: "username"
            })
        }
    }),
    "http": create(protocolSchema, {
        protocol: {
            case: "http",
            value: create(httpSchema, {
                password: "password",
                user: "username"
            })
        }
    }),
    "direct": create(protocolSchema, {
        protocol: {
            case: "direct",
            value: create(directSchema, {})
        }
    }),
    "yuubinsya": create(protocolSchema, {
        protocol: {
            case: "yuubinsya",
            value: create(yuubinsyaSchema, {
                tcpEncrypt: true,
                udpEncrypt: true,
                password: "password",
                udpOverStream: false,
            })
        }
    }),
    "tls": create(protocolSchema, {
        protocol: {
            case: "tls",
            value: tlsConfig,
        }
    }),
    "wireguard": create(protocolSchema, {
        protocol: {
            case: "wireguard",
            value: create(wireguardSchema, {
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
    "mux": create(protocolSchema, {
        protocol: {
            case: "mux",
            value: create(muxSchema, {
                concurrency: 8,
            })
        }
    }),
    "drop": create(protocolSchema, {
        protocol: {
            case: "drop",
            value: create(dropSchema, {})
        }
    }),
    "vless": create(protocolSchema, {
        protocol: {
            case: "vless",
            value: create(vlessSchema, {
                uuid: "c48619fe-8f02-49e0-b9e9-edf763e17e21",
            })
        }
    }),
    "grpc": create(protocolSchema, {
        protocol: {
            case: "grpc",
            value: create(grpcSchema, { tls: tlsConfig })
        }
    }),
    "http2": create(protocolSchema, {
        protocol: {
            case: "http2",
            value: create(http2Schema, { concurrency: 8, })
        }
    }),
    "reality": create(protocolSchema, {
        protocol: {
            case: "reality",
            value: create(realitySchema, {
                debug: false,
                publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                serverName: "127.0.0.1",
                shortId: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            })
        }
    })
}