import { clone, create, DescEnum, DescEnumValue, DescMessage, EnumJsonType, MessageShape, } from "@bufbuild/protobuf";
import { SettingCheck } from "../common/switch";
import { empty, emptySchema, grpc, grpcSchema, http, http2, http2Schema, httpSchema, inbound, inbound_config, inbound_configSchema, inboundSchema, mixed, mixedSchema, mux, muxSchema, normal, normalSchema, protocolSchema, quic, quicSchema, reality, realitySchema, redir, redirSchema, sniff, sniffSchema, socks5, socks5Schema, tcp_udp_control, tcp_udp_controlSchema, tcpudp, tcpudpSchema, tls, tls_config, tls_configSchema, tlsSchema, tproxy, tproxySchema, transport, transportSchema, tun, tunSchema, websocket, websocketSchema, yuubinsya, yuubinsyaSchema } from "../pbes/config/listener/listener_pb";
import { SettingInputText, Container, MoveUpDown } from "./components";
import { Form, Row, Col, Modal, ListGroup, InputGroup, Button, Card } from "react-bootstrap";
import { HTTPComponents, MixedComponents, QuicComponents, RealityComponents, RedirComponents, Socks5Components, TProxyComponents, TlsComponents, TunComponents } from "./server";
import { useState } from "react";
import React from "react";

function change<T extends DescMessage>(scheme: T, e: MessageShape<T>, apply?: (x: MessageShape<T>) => void): (f: (x: MessageShape<T>) => void) => void {
    if (!apply) return function (_: (x: MessageShape<T>) => void) { }

    return function (f: (x: MessageShape<T>) => void) {
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
    const [inbound, setInbound] = useState(clone(inboundSchema, props.value));

    return (
        <>
            <Modal
                show={props.show}
                scrollable
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                onShow={() => { setInbound(clone(inboundSchema, props.value)) }}
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">{props.value.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Inbound inbound={inbound} onChange={(x) => { setInbound(clone(inboundSchema, x)) }}></Inbound>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            props.onChange(inbound)
                            props.onHide()
                        }}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export const Inbounds = React.memo((props: { inbounds: inbound_config, onChange: (x: inbound_config) => void }) => {
    const cc = change(inbound_configSchema, props.inbounds, props.onChange)

    const [modalData, setModalData] = useState({ show: false, inbound: create(inboundSchema, {}), onChange: (_: inbound) => { } });
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

        <SettingCheck label='Sniff'
            checked={!props.inbounds.sniff?.enabled ? false : true}
            onChange={() => cc((x) => x.sniff = create(sniffSchema, { enabled: !x.sniff?.enabled }))} />

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
                                    return <React.Fragment key={"inbounds-" + k}>
                                        <ListGroup.Item
                                            action
                                            className="d-flex justify-content-between align-items-center"
                                            style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalData({
                                                    show: true,
                                                    inbound: v,
                                                    onChange: (e: inbound) => { cc((x) => { x.inbounds[k] = e }) }
                                                })
                                            }}
                                        >
                                            {k}
                                            <Button
                                                variant='outline-danger'
                                                size="sm"
                                                as={"span"}
                                                key={k + "span-button"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    cc((x) => { delete x.inbounds[k] })
                                                }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </Button>
                                        </ListGroup.Item>
                                    </React.Fragment>
                                })
                        }
                    </ListGroup>
            }
            <Card.Footer>
                <InputGroup className="d-flex justify-content-end">
                    <Form.Control value={newInbound.value} onChange={(e) => setNewInbound({ value: e.target.value })} />
                    <Button
                        variant='outline-success'
                        onClick={() => {
                            if (newInbound.value !== "" && props.inbounds.inbounds[newInbound.value] === undefined)
                                cc((x) => x.inbounds[newInbound.value] = create(inboundSchema, { name: newInbound.value }))
                        }}
                    >
                        <i className="bi bi-plus-lg" />New </Button>
                </InputGroup>
            </Card.Footer>
        </Card>
    </>
})

export const Inbound = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const cc = change(inboundSchema, props.inbound, props.onChange)

    const onMove = (up: boolean, current: number) => {
        if (props.inbound.transport.length <= 1) return
        if (up && current === 0) return
        if (!up && current === props.inbound.transport.length - 1) return
        cc((x) => {
            let tmp = x.transport[current]
            x.transport[current] = x.transport[current + (up ? -1 : 1)]
            x.transport[current + (up ? -1 : 1)] = tmp
        })
    }
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
                            moveUpDown={new MoveUpDown(props.inbound.transport.length, i, (x) => onMove(x, i))}
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
    const cc = change(inboundSchema, props.inbound, props.onChange)

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
                                    x.network = { case: "tcpudp", value: create(tcpudpSchema, {}) }
                                    break
                                case "quic":
                                    x.network = { case: "quic", value: create(quicSchema, {}) }
                                    break
                                case "empty":
                                    x.network = { case: "empty", value: create(emptySchema, {}) }
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
    const cc = change(inboundSchema, props.inbound, props.onChange)
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
    const cc = change(transportSchema, props.transport, props.onChange)

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
    const cc = change(inboundSchema, props.inbound, props.onChange)

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
    const cc = change(inboundSchema, props.inbound, props.onChange)

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
                                    x.protocol = { case: "http", value: create(httpSchema, {}) }
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
    const cc = change(yuubinsyaSchema, props.yuubinsya, props.onChange)
    return <>
        <SettingCheck
            label="TCP Encrypt"
            checked={props.yuubinsya.tcpEncrypt}
            onChange={() => { cc((x) => x.tcpEncrypt = !x.tcpEncrypt) }}
        />
        <SettingCheck
            label="UDP Encrypt"
            checked={props.yuubinsya.udpEncrypt}
            onChange={() => { cc((x) => x.udpEncrypt = !x.udpEncrypt) }}
        />
        <SettingInputText
            label="Password"
            value={props.yuubinsya.password}
            onChange={(e) => { cc((x) => x.password = e) }}
        />
    </>
}

const TcpUdp = (props: { protocol: tcpudp, onChange: (x: tcpudp) => void }) => {
    const cc = change(tcpudpSchema, props.protocol, props.onChange)
    return <>
        <SettingInputText
            label="Host"
            value={props.protocol.host}
            onChange={(e) => { cc((x) => x.host = e) }}
        />

        <SettingTypeSelect
            label="Control"
            type={tcp_udp_controlSchema}
            value={props.protocol.control}
            onChange={(e) => { cc((x) => { x.control = e }) }}
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
