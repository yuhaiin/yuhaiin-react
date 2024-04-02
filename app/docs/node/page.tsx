"use client"

import { useContext, useState } from "react";
import { Button, Form, Card, ListGroup, InputGroup } from "react-bootstrap";
import { GlobalToastContext } from "../common/toast";
import { Fetch } from "../common/proto";
import { origin, point } from "../pbes/node/point/point_pb";
import { direct, drop, http, mux, none, obfs_http, protocol, quic, shadowsocks, shadowsocksr, simple, socks5, tls_config, trojan, vless, vmess, websocket, wireguard, yuubinsya } from "../pbes/node/protocol/protocol_pb";

// const Point = yuhaiin.point.point;
// const Oringin = yuhaiin.point.origin;

export default function NewNode() {
    const [templateProtocols, setTemplateProtocols] = useState({ value: ["simple"] });
    const [currentProtocol, setCurrentProtocol] = useState({ value: "simple" });
    const [newNode, setNewNode] = useState({ value: "" });

    const ctx = useContext(GlobalToastContext);

    return (
        <>
            <Card className="mb-3">

                <ListGroup variant="flush">

                    <ListGroup.Item>
                        <InputGroup>
                            <Form.Select value={currentProtocol.value} onChange={(e) => setCurrentProtocol({ value: e.target.value })}>
                                {
                                    Object.keys(protocolMapping).map((v) => {
                                        return <option value={v} key={v}>{v}</option>
                                    })
                                }
                            </Form.Select>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    let v = templateProtocols.value;
                                    v.push(currentProtocol.value);
                                    setTemplateProtocols({ value: v });
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={async () => {
                                    let po = new point({
                                        group: "template_group",
                                        name: "template_name", origin: origin.manual,
                                    })

                                    templateProtocols.value.map((v) => {
                                        let protocol = protocolMapping[v];
                                        if (protocol) po.protocols.push(protocol)
                                    })

                                    setNewNode({ value: JSON.stringify(po.toJson({ emitDefaultValues: true }), null, "   ") })
                                }}
                            >
                                Generate
                            </Button>
                        </InputGroup>
                    </ListGroup.Item>

                    {
                        templateProtocols.value.map((v, index) =>
                            <ListGroup.Item key={index}>
                                <div className="d-sm-flex">

                                    <div className="endpoint-name flex-grow-1 notranslate">{v}</div>
                                    <Button
                                        variant="outline-danger"
                                        className="notranslate"
                                        onClick={() => {
                                            let v = templateProtocols.value;
                                            v.splice(index, 1)
                                            setTemplateProtocols({ value: v });
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>

                            </ListGroup.Item>
                        )
                    }

                </ListGroup>
            </Card>


            <Card className="mb-3">
                <Card.Body>
                    <Form.Control
                        as={"textarea"}
                        style={{ height: "500px", fontFamily: "monospace" }}
                        className="mb-3"
                        value={newNode.value}
                        onChange={(e) => setNewNode({ value: e.target.value })}
                    />

                    <Button
                        className="outline-primary me-2"
                        onClick={async () => {
                            const { error } = await Fetch("/node", { method: "PATCH", body: new point().fromJson(newNode.value).toBinary() })
                            if (error) ctx.Error(`Add new node failed ${error.code}| ${await error.msg}.`)
                            else ctx.Info(`Add New Node Successful`)
                        }}
                    >
                        Save
                    </Button>
                    {/* <Button className="outline-primary">Protocols Template</Button> */}
                </Card.Body>
            </Card>
        </>
    )
}

let tlsConfig = new tls_config({
    enable: false,
    caCert: [new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0])],
    insecureSkipVerify: false,
    nextProtos: ["h2"],
    serverNames: ["www.example.com"]
})

let protocolMapping: { [key: string]: protocol } = {
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
                hostname: "127.0.0.1:1080",
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
                password: "password"
            })
        }
    }),
    "tls": new protocol({
        protocol: {
            case: "tls",
            value: new tls_config(tlsConfig),
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
    })
}
