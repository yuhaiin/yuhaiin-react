import { Enum, EnumDescriptorProto, EnumValue, EnumValueInfo, proto3 } from "@bufbuild/protobuf";
import { SettingCheck } from "../common/switch";
import { empty, grpc, http, http2, inbound, inbound_config, mixed, mux, normal, reality, redir, socks5, tcp_udp_control, tcpudp, tls, tls_config, tproxy, transport, tun, websocket, yuubinsya } from "../pbes/config/listener/listener_pb";
import { SettingInputText, Container } from "./components";
import { EnumType } from "@bufbuild/protobuf";
import { Form, Row, Col, Modal, ListGroup, InputGroup, Button, Card } from "react-bootstrap";
import { HTTPComponents, Http2Components, MixedComponents, QuicComponents, RealityComponents, RedirComponents, Socks5Components, TProxyComponents, TlsComponents, TunComponents } from "./server";
import { useState } from "react";

function change<T>(e: T, apply?: (x: T) => void): (f: (x: T) => void) => void {
    if (!apply) return function (_: (x: T) => void) { }

    return function (f: (x: T) => void) {
        f(e)
        apply(e)
    }
}

export const InboundModal = (
    props: {
        show: boolean,
        value: inbound,
        onHide: () => void,
        onChange: (x: inbound) => void
    },
) => {
    return (
        <>
            <Modal
                show={props.show}
                scrollable
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">{props.value.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Inbound inbound={props.value} onChange={props.onChange}></Inbound>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-primary" onClick={() => { props.onHide() }}>Save</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export const Inbounds = (props: { inbounds: inbound_config, onChange: (x: inbound_config) => void }) => {
    const cc = change(props.inbounds, props.onChange)
    const [modalData, setModalData] = useState({ show: false, inbound: new inbound({}), onChange: (_: inbound) => { } });
    const [newInbound, setNewInbound] = useState({ value: "" });

    return <>
        <InboundModal
            show={modalData.show}
            value={modalData.inbound}
            onHide={() => { setModalData({ ...modalData, show: false }) }}
            onChange={modalData.onChange}
        />

        <SettingCheck label='DNS Hijack'
            checked={!props.inbounds.hijackDns ? false : true}
            onChange={() => cc((x) => x.hijackDns = !x.hijackDns)} />

        <SettingCheck label='Fakedns'
            checked={!props.inbounds.hijackDnsFakeip ? false : true}
            onChange={() => cc((x) => x.hijackDnsFakeip = !x.hijackDnsFakeip)} />

        <hr />


        <Card>
            <Card.Header>Inbounds</Card.Header>
            {
                Object.keys(props.inbounds.inbounds).length === 0 ?
                    <Card.Body>
                        <div className="text-center my-2" style={{ opacity: '0.4' }}>No Inbounds</div>
                    </Card.Body>
                    :
                    <ListGroup variant="flush">
                        {
                            Object.entries(props.inbounds.inbounds).
                                sort((a, b) => { return a[0] <= b[0] ? -1 : 1 }).
                                map(([k, v]) => {
                                    return <>
                                        <ListGroup.Item
                                            key={k}
                                            action
                                            className="d-flex justify-content-between align-items-center"
                                            style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalData({
                                                    show: true,
                                                    inbound: v,
                                                    onChange: (e: inbound) => { cc((x) => x.inbounds[k] = e) }
                                                })
                                            }}
                                        >
                                            {k}
                                            <Button
                                                variant='outline-danger'
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    cc((x) => { delete x.inbounds[k] })
                                                }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </Button>
                                        </ListGroup.Item>
                                    </>
                                })
                        }
                    </ListGroup>
            }
            <Card.Footer>
                <InputGroup className="d-flex justify-content-end">
                    <Form.Control value={newInbound.value} onChange={(e) => setNewInbound({ value: e.target.value })} />
                    <Button
                        variant='outline-success'
                        onClick={
                            (newInbound.value !== "" && props.inbounds.inbounds[newInbound.value] === undefined) ?
                                () => {
                                    cc((x) => x.inbounds[newInbound.value] = new inbound({ name: newInbound.value }))
                                } : undefined
                        }
                    >
                        <i className="bi bi-plus-lg" />New </Button>
                </InputGroup>
            </Card.Footer>
        </Card>

    </>
}

export const Inbound = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const cc = change(props.inbound, props.onChange)

    const [newProtocol, setNewProtocol] = useState({ value: "normal" });

    return <>
        <SettingCheck
            label="Enabled"
            checked={props.inbound.enabled}
            onChange={() => { cc((x) => x.enabled = !x.enabled) }}
        />

        <SettingInputText
            label="Name"
            value={props.inbound.name}
            onChange={(e) => { cc((x) => x.name = e) }}
        />

        <Container title="Network" hideClose>
            <Network inbound={props.inbound} onChange={(x) => { cc((y) => y = x) }} />
        </Container>

        <Container title="Transport" hideClose>
            <>
                {
                    props.inbound.transport.map((x, i) => {
                        return <Container
                            key={i}
                            title={x.transport.case?.toString() ?? ""}
                            onClose={() => { cc((y) => y.transport.splice(i, 1)) }}
                        >
                            <Transport key={i} transport={x} onChange={(x) => { cc((y) => y.transport[i] = x) }} />
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
                                onClick={() => cc((x) => {
                                    switch (newProtocol.value) {
                                        case "normal":
                                            x.transport.push(new transport({
                                                transport: { case: "normal", value: new normal({}) }
                                            }))
                                            break
                                        case "tls":
                                            x.transport.push(new transport({
                                                transport: {
                                                    case: "tls", value: new tls({ tls: new tls_config({}) })
                                                }
                                            }))
                                            break
                                        case "mux":
                                            x.transport.push(new transport({
                                                transport: { case: "mux", value: new mux({}) }
                                            }))
                                            break
                                        case "http2":
                                            x.transport.push(new transport({
                                                transport: { case: "http2", value: new http2({}) }
                                            }))
                                            break
                                        case "websocket":
                                            x.transport.push(new transport({
                                                transport: { case: "websocket", value: new websocket({}) }
                                            }))
                                            break
                                        case "grpc":
                                            x.transport.push(new transport({
                                                transport: { case: "grpc", value: new grpc({}) }
                                            }))
                                            break
                                        case "reality":
                                            x.transport.push(new transport({
                                                transport: { case: "reality", value: new reality({}) }
                                            }))
                                            break
                                    }
                                })}
                            >
                                <i className="bi bi-plus-lg" />Add
                            </Button>
                        </InputGroup>
                    </ListGroup.Item>
                </ListGroup>
            </>

        </Container>

        <Container title="Protocol" hideClose>
            <Protocol inbound={props.inbound} onChange={(x) => { cc((y) => y = x) }} />
        </Container>
    </>
}

const Network = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const cc = change(props.inbound, props.onChange)

    const [newProtocol, setNewProtocol] = useState({ value: props.inbound.network.case?.toString() ?? "tcpudp" });
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
                        onClick={() => cc((x) => {
                            switch (newProtocol.value) {
                                case "tcpudp":
                                    x.network = { case: "tcpudp", value: new tcpudp({}) }
                                    break
                                case "quic":
                                    x.network = { case: "quic", value: new yuubinsya({}) }
                                    break
                                case "empty":
                                    x.network = { case: "empty", value: new empty({}) }
                                    break
                            }
                        })}
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
    const cc = change(props.inbound, props.onChange)
    switch (props.inbound.network.case) {
        case "tcpudp":
            return <TcpUdp protocol={props.inbound.network.value} onChange={(x) => { cc((y) => y.network.value = x) }}></TcpUdp>
        case "quic":
            return <QuicComponents
                quic={props.inbound.network.value}
                onChange={(x) => { cc((y) => y.network.value = x) }}
            />
        case "empty":
            return <></>
    }
}

const Transport = (props: { transport: transport, onChange: (x: transport) => void }) => {
    const cc = change(props.transport, props.onChange)

    switch (props.transport.transport.case) {
        case "normal":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Normal</div></>
        case "tls":
            return <TlsComponents
                tls={props.transport.transport.value}
                onChange={(x) => { cc((y) => y.transport.value = x) }}
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
                onChange={(x) => { cc((y) => y.transport.value = x) }}
            />

    }
}

const ProtocolBase = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const cc = change(props.inbound, props.onChange)

    switch (props.inbound.protocol.case) {
        case "http":
            return <HTTPComponents
                http={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
        case "socks5":
            return <Socks5Components
                socks5={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
        case "socks4a":
            return <></>
        case "mix":
            return <MixedComponents
                mixed={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
        case "redir":
            return <RedirComponents
                redir={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
        case "tun":
            return <TunComponents
                tun={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
        case "yuubinsya":
            return <Yuubinsya
                yuubinsya={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
        case "tproxy":
            return <TProxyComponents
                tproxy={props.inbound.protocol.value}
                onChange={(x) => { cc((y) => y.protocol.value = x) }}
            />
    }
}

const Protocol = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const cc = change(props.inbound, props.onChange)

    const [newProtocol, setNewProtocol] = useState({ value: props.inbound.protocol.case?.toString() ?? "yuubinsya" });

    return <>
        <ListGroup variant="flush">
            <ListGroup.Item>
                <InputGroup>
                    <Form.Select value={newProtocol.value} onChange={(e) => setNewProtocol({ value: e.target.value })}>
                        {
                            ["http", "socks5", "mix", "redir", "tun", "yuubinsya", "tproxy"].
                                map((v) => {
                                    return <option value={v} key={v}>{v}</option>
                                })
                        }
                    </Form.Select>
                    <Button
                        variant="outline-success"
                        onClick={() => cc((x) => {
                            switch (newProtocol.value) {
                                case "http":
                                    x.protocol = { case: "http", value: new http({}) }
                                    break
                                case "socks5":
                                    x.protocol = { case: "socks5", value: new socks5({}) }
                                    break
                                case "mix":
                                    x.protocol = { case: "mix", value: new mixed({}) }
                                    break
                                case "redir":
                                    x.protocol = { case: "redir", value: new redir({}) }
                                    break
                                case "tun":
                                    x.protocol = { case: "tun", value: new tun({}) }
                                    break
                                case "yuubinsya":
                                    x.protocol = { case: "yuubinsya", value: new yuubinsya({}) }
                                    break
                                case "tproxy":
                                    x.protocol = { case: "tproxy", value: new tproxy({}) }
                            }
                        })}
                    >
                        Use
                    </Button>
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>

        <br />

        <ProtocolBase inbound={props.inbound} onChange={(x) => { cc((y) => y = x) }} />
    </>
}


const Yuubinsya = (props: { yuubinsya: yuubinsya, onChange: (x: yuubinsya) => void }) => {
    const cc = change(props.yuubinsya, props.onChange)
    return <>
        <SettingCheck
            label="Encrypted"
            checked={!props.yuubinsya.forceDisableEncrypt}
            onChange={() => { cc((x) => x.forceDisableEncrypt = !x.forceDisableEncrypt) }}
        />
        <SettingInputText
            label="Password"
            value={props.yuubinsya.password}
            onChange={(e) => { cc((x) => x.password = e) }}
        />
    </>
}

const TcpUdp = (props: { protocol: tcpudp, onChange: (x: tcpudp) => void }) => {
    const cc = change(props.protocol, props.onChange)
    return <>
        <SettingInputText
            label="Host"
            value={props.protocol.host}
            onChange={(e) => { cc((x) => x.host = e) }}
        />

        <SettingTypeSelect
            label="Control"
            type={proto3.getEnumType(tcp_udp_control)}
            value={props.protocol.control}
            onChange={(e) => { cc((x) => x.control = e) }}
        />
    </>
}

function SettingTypeSelect(props: {
    label: string,
    type: EnumType,
    value: number,
    onChange: (no: number) => void,
    filter?: (v: EnumValueInfo) => boolean
}) {
    return <Form.Group as={Row} className='mb-3'>
        <Form.Label column sm={2}>{props.label}</Form.Label>
        <Col sm={10}>
            <Form.Select value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))} >
                {
                    props.type.values.
                        filter(props.filter ?? (() => true)).
                        map((v) => <option key={v.no} value={v.no}>{v.name}</option>)
                }
            </Form.Select>
        </Col>
    </Form.Group >
}

