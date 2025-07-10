import { create } from "@bufbuild/protobuf";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button, InputGroup, ListGroup } from "react-bootstrap";
import { FormSelect, SettingCheck } from "../common/switch";
import { Container, MoveUpDown } from "../config/components";
import {
    aeadSchema,
    emptySchema,
    grpcSchema,
    http2Schema,
    http_mockSchema,
    httpSchema,
    inbound,
    mixedSchema,
    muxSchema,
    normalSchema,
    quicSchema,
    realitySchema,
    redirSchema,
    reverse_httpSchema,
    reverse_tcpSchema,
    socks5Schema,
    tcpudpSchema,
    tls_autoSchema,
    tlsSchema,
    tproxySchema,
    transport,
    transportSchema,
    tunSchema,
    websocketSchema,
    yuubinsyaSchema
} from "../pbes/config/listener/listener_pb";
import { tls_server_configSchema } from "../pbes/node/protocol/protocol_pb";

export const Inbound = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    const [newProtocol, setNewProtocol] = useState({ value: "normal" });

    return <>
        <SettingCheck
            label="Enabled"
            checked={props.inbound.enabled}
            onChange={() => { props.onChange({ ...props.inbound, enabled: !props.inbound.enabled }) }}
        />

        {/* <SettingInputText
            label="Name"
            value={props.inbound.name}
            onChange={(e) => { props.onChange({ ...props.inbound, name: e }) }}
        /> */}

        <Container title="Network" className="mb-2" hideClose>
            <Network inbound={props.inbound} onChange={(x) => { props.onChange({ ...x }) }} />
        </Container>

        <Container title="Transport" className="mb-2" hideClose>
            <>
                {
                    props.inbound.transport.map((x, i) => {
                        return <Container
                            key={i}
                            className={i !== 0 ? "mt-2" : ""}
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
                            <FormSelect
                                value={newProtocol.value}
                                values={[
                                    "normal", "tls", "mux",
                                    "http2", "websocket", "grpc",
                                    "reality", "tlsAuto", "httpMock",
                                    "aead",
                                ]}
                                onChange={(e) => setNewProtocol({ value: e })}
                            />
                            <Button
                                variant="outline-success"
                                onClick={() => {
                                    const x = { ...props.inbound, transport: [...props.inbound.transport] }
                                    switch (newProtocol.value) {
                                        case "normal":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "normal", value: create(normalSchema, {}) }
                                            }))
                                            break
                                        case "tlsAuto":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "tlsAuto", value: create(tls_autoSchema, {}) }
                                            }))
                                            break
                                        case "tls":
                                            x.transport.push(create(transportSchema, {
                                                transport: {
                                                    case: "tls", value: create(tlsSchema, { tls: create(tls_server_configSchema, {}) })
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
                                        case "httpMock":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "httpMock", value: create(http_mockSchema, {}) }
                                            }))
                                        case "aead":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "aead", value: create(aeadSchema, {}) }
                                            }))
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
                    <FormSelect value={newProtocol.value} values={["empty", "tcpudp", "quic"]} onChange={(e) => setNewProtocol({ value: e })} />
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

const LazyTcpUdp = dynamic(() => import("./server").then(mod => mod.TcpUdp), { ssr: false })
const LazyQuic = dynamic(() => import("./server").then(mod => mod.QuicComponents), { ssr: false })

const NetworkBase = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    switch (props.inbound.network.case) {
        case "tcpudp":
            return <LazyTcpUdp protocol={props.inbound.network.value} onChange={(x) => { props.onChange({ ...props.inbound, network: { case: "tcpudp", value: x } }) }}></LazyTcpUdp>
        case "quic":
            return <LazyQuic
                quic={props.inbound.network.value}
                onChange={(x) => { props.onChange({ ...props.inbound, network: { case: "quic", value: x } }) }}
            />
        case "empty":
            return <></>
    }
}

const LazyTls = dynamic(() => import("./server").then(mod => mod.TlsComponents), { ssr: false })
const LazyTlsAuto = dynamic(() => import("./server").then(mod => mod.TLSAutoComponents), { ssr: false })
const LazyReality = dynamic(() => import("./server").then(mod => mod.RealityComponents), { ssr: false })
const LazyAead = dynamic(() => import("./server").then(mod => mod.Aead), { ssr: false })


const Transport = (props: { transport: transport, onChange: (x: transport) => void }) => {
    switch (props.transport.transport.case) {
        case "normal":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Normal</div></>
        case "tls":
            return <LazyTls
                tls={props.transport.transport.value}
                onChange={(x) => { props.onChange({ ...props.transport, transport: { case: "tls", value: x } }) }}
            />
        case "tlsAuto":
            return <LazyTlsAuto
                tls={props.transport.transport.value}
                onChange={(x) => { props.onChange({ ...props.transport, transport: { case: "tlsAuto", value: x } }) }}
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
            return <LazyReality
                reality={props.transport.transport.value}
                onChange={(x) => { props.onChange({ ...props.transport, transport: { case: "reality", value: x } }) }}
            />
        case "httpMock":
            return <><div className="text-center" style={{ opacity: '0.4' }}>HTTP MOCK</div></>
        case "aead":
            return <LazyAead
                aead={props.transport.transport.value}
                onChange={(x) => { props.onChange({ ...props.transport, transport: { case: "aead", value: x } }) }}
            />
    }
}

const LazyHTTP = dynamic(() => import("./server").then(mod => mod.HTTPComponents), { ssr: false })
const LazyReverseHTTP = dynamic(() => import("./server").then(mod => mod.ReverseHTTPComponents), { ssr: false })
const LazyReverseTCP = dynamic(() => import("./server").then(mod => mod.ReverseTCPComponents), { ssr: false })
const LazyRedir = dynamic(() => import("./server").then(mod => mod.RedirComponents), { ssr: false })
const LazySocks5 = dynamic(() => import("./server").then(mod => mod.Socks5Components), { ssr: false })
const LazyTProxy = dynamic(() => import("./server").then(mod => mod.TProxyComponents), { ssr: false })
const LazyMixed = dynamic(() => import("./server").then(mod => mod.MixedComponents), { ssr: false })
const LazyTun = dynamic(() => import("./server").then(mod => mod.TunComponents), { ssr: false })
const LazyYuubinsya = dynamic(() => import("./server").then(mod => mod.Yuubinsya), { ssr: false })


const ProtocolBase = (props: { inbound: inbound, onChange: (x: inbound) => void }) => {
    switch (props.inbound.protocol.case) {
        case "http":
            return <LazyHTTP
                http={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "http", value: x } }) }}
            />
        case "reverseHttp":
            return <LazyReverseHTTP
                reverse_http={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "reverseHttp", value: x } }) }}
            />
        case "reverseTcp":
            return <LazyReverseTCP
                reverse_tcp={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "reverseTcp", value: x } }) }}
            />
        case "socks5":
            return <LazySocks5
                socks5={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "socks5", value: x } }) }}
            />
        case "socks4a":
            return <></>
        case "mix":
            return <LazyMixed
                mixed={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "mix", value: x } }) }}
            />
        case "redir":
            return <LazyRedir
                redir={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "redir", value: x } }) }}
            />
        case "tun":
            return <LazyTun
                tun={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "tun", value: x } }) }}
            />
        case "yuubinsya":
            return <LazyYuubinsya
                yuubinsya={props.inbound.protocol.value}
                onChange={(x) => { props.onChange({ ...props.inbound, protocol: { case: "yuubinsya", value: x } }) }}
            />
        case "tproxy":
            return <LazyTProxy
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
                    <FormSelect
                        value={newProtocol.value}
                        values={["http", "reverseHttp", "reverseTcp", "socks5", "mix", "redir", "tun", "yuubinsya", "tproxy"]}
                        onChange={(e) => setNewProtocol({ value: e })}
                    />
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

