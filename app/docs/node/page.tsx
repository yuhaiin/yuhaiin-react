"use client"

import { useContext, useState } from "react";
import { Button, Form, Card, ListGroup, InputGroup } from "react-bootstrap";
import { GlobalToastContext } from "../common/toast";
import { point as Point, origin as Oringin } from "../protos/node/point/point";
import { Fetch } from "../common/proto";
import { protocol as Protocol, tls_config as TlsConfig } from "../protos/node/protocol/protocol";

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
                                        return <option value={v}>{v}</option>
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
                                    let point: Point = {
                                        group: "template_group",
                                        name: "template_name",
                                        origin: Oringin.manual,
                                        hash: "",
                                        protocols: []
                                    }

                                    templateProtocols.value.map((v) => {
                                        let protocol = protocolMapping[v];
                                        if (protocol !== undefined) point.protocols.push(protocolMapping[v])
                                    })

                                    setNewNode({ value: JSON.stringify(Point.toJSON(point), null, "   ") })
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
                            const { error } = await Fetch("/node", { method: "PATCH", body: Point.encode(Point.fromJSON(JSON.parse(newNode.value))).finish() })
                            if (error !== undefined) ctx.Error(`Add new node failed ${error.code}| ${await error.msg}.`)
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

let tlsConfig: TlsConfig = {
    enable: false,
    ca_cert: [new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0])],
    insecure_skip_verify: false,
    next_protos: ["h2"],
    server_names: ["www.example.com"]
}

let protocolMapping: { [key: string]: Protocol } = {
    "simple": {
        protocol: {
            $case: "simple",
            simple: {
                host: "",
                alternate_host: [],
                port: 1080,
                packet_conn_direct: false,
                timeout: 0,
                tls: tlsConfig
            }
        }
    },
    "none": {
        protocol: {
            $case: "none",
            none: {},
        }
    },
    "websocket": {
        protocol: {
            $case: "websocket",
            websocket: {
                host: "www.example.com",
                path: "/msg",
                tls_enabled: false,
            }
        }
    },
    "quic": {
        protocol: {
            $case: "quic",
            quic: {
                tls: tlsConfig
            }
        }
    },
    "shadowsocks": {
        protocol: {
            $case: "shadowsocks",
            shadowsocks: {
                method: "CHACHA20-IETF-POLY1305",
                password: "password"
            }
        }
    },
    "obfshttp": {
        protocol: {
            $case: "obfs_http",
            obfs_http: {
                host: "www.example.com",
                port: "443"
            }
        }
    },
    "shadowsocksr": {
        protocol: {
            $case: "shadowsocksr",
            shadowsocksr: {
                method: "chacha20-ietf",
                obfs: "http_post",
                obfsparam: "#name=v",
                password: "password",
                port: "1080",
                protocol: "auth_aes128_sha1",
                protoparam: "",
                server: "127.0.0.1"
            }
        }
    },
    "vmess": {
        protocol: {
            $case: "vmess",
            vmess: {
                alter_id: "0",
                security: "chacha20-poly1305",
                uuid: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            }
        }
    },
    "trojan": {
        protocol: {
            $case: "trojan",
            trojan: {
                password: "password",
                peer: "peer"
            }
        }
    },
    "socks5": {
        protocol: {
            $case: "socks5",
            socks5: {
                hostname: "127.0.0.1:1080",
                password: "password",
                user: "username"
            }
        }
    },
    "http": {
        protocol: {
            $case: "http",
            http: {
                password: "password",
                user: "username"
            }
        }
    },
    "direct": {
        protocol: {
            $case: "direct",
            direct: {}
        }
    },
    "yuubinsya": {
        protocol: {
            $case: "yuubinsya",
            yuubinsya: {
                encrypted: true,
                password: "password"
            }
        }
    }
}
