import { create, DescEnum, DescEnumValue } from "@bufbuild/protobuf";
import { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import { SettingCheck } from "../../common/switch";
import {
    emptySchema,
    grpcSchema,
    http2Schema,
    httpSchema,
    inbound,
    mixedSchema, muxSchema, normalSchema, quicSchema, realitySchema, redirSchema, reverse_httpSchema, reverse_tcpSchema, socks5Schema, tcp_udp_controlSchema, tcpudp, tcpudpSchema, tls_configSchema, tlsSchema, tproxySchema, transport, transportSchema, tunSchema, websocketSchema, yuubinsya, yuubinsyaSchema
} from "../../pbes/config/listener/listener_pb";
import { Container, MoveUpDown, SettingInputText } from "../components";
import { HTTPComponents, MixedComponents, QuicComponents, RealityComponents, RedirComponents, ReverseHTTPComponents, ReverseTCPComponents, Socks5Components, TlsComponents, TProxyComponents, TunComponents } from "./server";

export const Inbound = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const [newProtocol, setNewProtocol] = useState({ value: "normal" });

    return <>
        <SettingCheck
            label="Enabled"
            checked={props.inbound.enabled}
            onChange={() => { props.onChange({ ...props.inbound, enabled: !props.inbound.enabled }) }}
        />

        <SettingInputText
            label="Name"
            value={props.inbound.name}
            onChange={(e) => { props.onChange({ ...props.inbound, name: e }) }}
        />

        <Container title="Network" hideClose>
            <Network inbound={props.inbound} onChange={(x) => { props.onChange({ ...x }) }} />
        </Container>

        <Container title="Transport" hideClose>
            <>
                {
                    props.inbound.transport.map((x, i) => {
                        return <Container
                            key={i}
                            title={x.transport.case?.toString() ?? ""}
                            onClose={() => { props.onChange({ ...props.inbound, transport: [...props.inbound.transport.slice(0, i), ...props.inbound.transport.slice(i + 1)] }) }}
                            moveUpDown={new MoveUpDown(props.inbound.transport, i, (x) => props.onChange({ ...props.inbound, transport: x }))}
                        >
                            <Transport key={i} transport={x} onChange={(x) => {
                                props.onChange({ ...props.inbound, transport: [...props.inbound.transport.slice(0, i), x, ...props.inbound.transport.slice(i + 1)] })
                            }} />
                        </Container>
                    })
                }


                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <InputGroup>
                            <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ value: e.target.value })}>
                                {
                                    ["normal", "tls", "mux", "http2", "websocket", "grpc", "reality"].
                                        map((v) => {
                                            return <option value={v} key={v}>{v}</option>
                                        })
                                }
                            </Form.Select>
                            <Button
                                variant="outline-success"
                                onClick={() => {
                                    const x = { ...props.inbound }
                                    switch (newProtocol.value) {
                                        case "normal":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "normal", value: create(normalSchema, {}) }
                                            }))
                                            break
                                        case "tls":
                                            x.transport.push(create(transportSchema, {
                                                transport: {
                                                    case: "tls", value: create(tlsSchema, { tls: create(tls_configSchema, {}) })
                                                }
                                            }))
                                            break
                                        case "mux":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "mux", value: create(muxSchema, {}) }
                                            }))
                                            break
                                        case "http2":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "http2", value: create(http2Schema, {}) }
                                            }))
                                            break
                                        case "websocket":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "websocket", value: create(websocketSchema, {}) }
                                            }))
                                            break
                                        case "grpc":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "grpc", value: create(grpcSchema, {}) }
                                            }))
                                            break
                                        case "reality":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "reality", value: create(realitySchema, {}) }
                                            }))
                                            break
                                    }
                                    props.onChange(x)
                                }}
                            >
                                <i className="bi bi-plus-lg" />Add
                            </Button>
                        </InputGroup>
                    </ListGroup.Item>
                </ListGroup>
            </>

        </Container>

        <Container title="Protocol" hideClose>
            <Protocol inbound={props.inbound} onChange={(x) => { props.onChange({ ...x }) }} />
        </Container>
    </>
}

const Network = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const [newProtocol, setNewProtocol] = useState({ value: props.inbound.network.case?.toString() ?? "tcpudp" });
    useEffect(() => {
        setNewProtocol({ value: props.inbound.network.case ? props.inbound.network.case.toString() : "tcpudp" });
    }, [props.inbound]);

    return <>
        <ListGroup variant="flush">
            <ListGroup.Item>
                <InputGroup>
                    <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ value: e.target.value })}>
                        {
                            ["empty", "tcpudp", "quic"].
                                map((v) => {
                                    return <option value={v} key={v}>{v}</option>
                                })
                        }
                    </Form.Select>
                    <Button
                        variant="outline-success"
                        onClick={() => {
                            const x = { ...props.inbound }
                            switch (newProtocol.value) {
                                case "tcpudp":
                                    x.network = { case: "tcpudp", value: create(tcpudpSchema, {}) }
                                    break
                                case "quic":
                                    x.network = { case: "quic", value: create(quicSchema, {}) }
                                    break
                                case "empty":
                                    x.network = { case: "empty", value: create(emptySchema, {}) }
                                    break
                            }
                            props.onChange({ ...x })
                        }}
                    >
                        Use
                    </Button>
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>

        <br />

        <NetworkBase inbound={props.inbound} onChange={props.onChange} />
    </>
}

const NetworkBase = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    switch (props.inbound.network.case) {
        case "tcpudp":
            return <TcpUdp protocol={props.inbound.network.value} onChange={(x) => { props.onChange({ ...props.inbound, network: { case: "tcpudp", value: x } }) }}></TcpUdp>
        case "quic":
            return <QuicComponents
                quic={props.inbound.network.value}
                onChange={(x) => { props.onChange({ ...props.inbound, network: { case: "quic", value: x } }) }}
            />
        case "empty":
            return <></>
    }
}

const Transport = (props: { transport: transport, onChange: (x: transport) => void }) => {
    switch (props.transport.transport.case) {
        case "normal":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Normal</div></>
        case "tls":
            return <TlsComponents
                tls={props.transport.transport.value}
                onChange={(x) => { props.onChange({ ...props.transport, transport: { case: "tls", value: x } }) }}
            />
        case "mux":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Mux</div></>
        case "http2":
            return <><div className="text-center" style={{ opacity: '0.4' }}>HTTP2</div></>
        case "websocket":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Websocket</div></>
        case "grpc":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Grpc</div></>
        case "reality":
            return <RealityComponents
                reality={props.transport.transport.value}
                onChange={(x) => { props.onChange({ ...props.transport, transport: { case: "reality", value: x } }) }}
            />
    }
}

const ProtocolBase = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    switch (props.inbound.protocol.case) {
        case "http":
            return <HTTPComponents
                http={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "http", value: x } }) }}
            />
        case "reverseHttp":
            return <ReverseHTTPComponents
                reverse_http={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "reverseHttp", value: x } }) }}
            />
        case "reverseTcp":
            return <ReverseTCPComponents
                reverse_tcp={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "reverseTcp", value: x } }) }}
            />
        case "socks5":
            return <Socks5Components
                socks5={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "socks5", value: x } }) }}
            />
        case "socks4a":
            return <></>
        case "mix":
            return <MixedComponents
                mixed={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "mix", value: x } }) }}
            />
        case "redir":
            return <RedirComponents
                redir={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "redir", value: x } }) }}
            />
        case "tun":
            return <TunComponents
                tun={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "tun", value: x } }) }}
            />
        case "yuubinsya":
            return <Yuubinsya
                yuubinsya={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "yuubinsya", value: x } }) }}
            />
        case "tproxy":
            return <TProxyComponents
                tproxy={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "tproxy", value: x } }) }}
            />
    }
}

const Protocol = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const [newProtocol, setNewProtocol] = useState({ value: props.inbound.protocol.case ? props.inbound.protocol.case.toString() : "yuubinsya" });

    useEffect(() => {
        setNewProtocol({ value: props.inbound.protocol.case ? props.inbound.protocol.case.toString() : "yuubinsya" });
    }, [props.inbound]);


    return <>
        <ListGroup variant="flush">
            <ListGroup.Item>
                <InputGroup>
                    <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ value: e.target.value })}>
                        {
                            ["http", "reverseHttp", "reverseTcp", "socks5", "mix", "redir", "tun", "yuubinsya", "tproxy"].
                                map((v) => {
                                    return <option value={v} key={v}>{v}</option>
                                })
                        }
                    </Form.Select>
                    <Button
                        variant="outline-success"
                        onClick={() => {
                            const x = { ...props.inbound }
                            switch (newProtocol.value) {
                                case "http":
                                    x.protocol = { case: "http", value: create(httpSchema, {}) }
                                    break
                                case "reverseHttp":
                                    x.protocol = { case: "reverseHttp", value: create(reverse_httpSchema, {}) }
                                    break
                                case "reverseTcp":
                                    x.protocol = { case: "reverseTcp", value: create(reverse_tcpSchema, {}) }
                                    break
                                case "socks5":
                                    x.protocol = { case: "socks5", value: create(socks5Schema, {}) }
                                    break
                                case "mix":
                                    x.protocol = { case: "mix", value: create(mixedSchema, {}) }
                                    break
                                case "redir":
                                    x.protocol = { case: "redir", value: create(redirSchema, {}) }
                                    break
                                case "tun":
                                    x.protocol = { case: "tun", value: create(tunSchema, {}) }
                                    break
                                case "yuubinsya":
                                    x.protocol = { case: "yuubinsya", value: create(yuubinsyaSchema, {}) }
                                    break
                                case "tproxy":
                                    x.protocol = { case: "tproxy", value: create(tproxySchema, {}) }
                            }
                            props.onChange({ ...x })
                        }}
                    >
                        Use
                    </Button>
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>

        <br />

        <ProtocolBase inbound={props.inbound} onChange={(x) => { props.onChange({ ...x }) }} />
    </>
}


const Yuubinsya = (props: { yuubinsya: yuubinsya, onChange: (x: yuubinsya) => void }) => {
    return <>
        <SettingCheck
            label="TCP Encrypt"
            checked={props.yuubinsya.tcpEncrypt}
            onChange={() => { props.onChange({ ...props.yuubinsya, tcpEncrypt: !props.yuubinsya.tcpEncrypt }) }}
        />
        <SettingCheck
            label="UDP Encrypt"
            checked={props.yuubinsya.udpEncrypt}
            onChange={() => { props.onChange({ ...props.yuubinsya, udpEncrypt: !props.yuubinsya.udpEncrypt }) }}
        />
        <SettingInputText
            label="Password"
            value={props.yuubinsya.password}
            onChange={(e) => { props.onChange({ ...props.yuubinsya, password: e }) }}
        />
    </>
}

const TcpUdp = (props: { protocol: tcpudp, onChange: (x: tcpudp) => void }) => {
    return <>
        <SettingInputText
            label="Host"
            value={props.protocol.host}
            onChange={(e) => { props.onChange({ ...props.protocol, host: e }) }}
        />

        <SettingTypeSelect
            label="Control"
            type={tcp_udp_controlSchema}
            value={props.protocol.control}
            onChange={(e) => { props.onChange({ ...props.protocol, control: e }) }}
        />
    </>
}

function SettingTypeSelect(props: {
    label: string,
    type: DescEnum,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: DescEnumValue) => boolean
}) {
    return <Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2}>{props.label}</Form.Label>
        <Col sm={10}>
            <Form.Select value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))} >
                {
                    props.type.values.
                        filter(props.filter ?? (() => true)).
                        map((v) => <option key={v.number} value={v.number}>{v.name}</option>)
                }
            </Form.Select>
        </Col>
    </Form.Group >
}
