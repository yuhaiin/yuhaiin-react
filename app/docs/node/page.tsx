"use client"

import { useContext, useState } from "react";
import { Button, Form, Card, ListGroup, InputGroup } from "react-bootstrap";
import { GlobalToastContext } from "../common/toast";
import { Fetch, ToObjectOption } from "../common/proto";
import { yuhaiin } from "../pbts/proto";

const Point = yuhaiin.point.point;
const Oringin = yuhaiin.point.origin;

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
                                    let point = new yuhaiin.point.point({
                                        group: "template_group",
                                        name: "template_name", origin: Oringin.manual,
                                    })

                                    templateProtocols.value.map((v) => {
                                        let protocol = protocolMapping[v];
                                        if (protocol) point.protocols.push(protocol)
                                    })

                                    setNewNode({ value: JSON.stringify(Point.toObject(point, ToObjectOption), null, "   ") })
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
                            const { error } = await Fetch("/node", { method: "PATCH", body: Point.encode(Point.fromObject(JSON.parse(newNode.value))).finish() })
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

let tlsConfig = new yuhaiin.protocol.tls_config({
    enable: false,
    ca_cert: [new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0])],
    insecure_skip_verify: false,
    next_protos: ["h2"],
    server_names: ["www.example.com"]
})

let protocolMapping: { [key: string]: yuhaiin.protocol.Iprotocol } = {
    "simple": {
        simple: {
            host: "",
            alternate_host: [],
            port: 1080,
            timeout: 0,
            tls: undefined
        }
    },
    "none": {
        none: {},
    },
    "websocket": {
        websocket: {
            host: "www.example.com",
            path: "/msg",
            tls_enabled: false,
        }
    },
    "quic": {
        quic: {
            tls: tlsConfig
        }
    },
    "shadowsocks": {
        shadowsocks: {
            method: "CHACHA20-IETF-POLY1305",
            password: "password"
        }
    },
    "obfshttp": {
        obfs_http: {
            host: "www.example.com",
            port: "443"
        }
    },
    "shadowsocksr": {
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
    },
    "vmess": {
        vmess: {
            alter_id: "0",
            security: "chacha20-poly1305",
            uuid: "9d5031b6-4ef5-11ee-be56-0242ac120002"
        }
    },
    "trojan": {
        trojan: {
            password: "password",
            peer: "peer"
        }
    },
    "socks5": {
        socks5: {
            hostname: "127.0.0.1:1080",
            password: "password",
            user: "username"
        }
    },
    "http": {
        http: {
            password: "password",
            user: "username"
        }
    },
    "direct": {
        direct: {}
    },
    "yuubinsya": {
        yuubinsya: {
            encrypted: true,
            password: "password"
        }
    },
    "tls": {
        tls: tlsConfig,
    },
    "wireguard": {
        wireguard: {
            endpoint: ["10.0.0.2/32"],
            mtu: 1500,
            idle_timeout: 3,
            reserved: new Uint8Array([0, 0, 0]),
            secret_key: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
            peers: [
                {
                    allowed_ips: ["0.0.0.0/0"],
                    endpoint: "127.0.0.1:51820",
                    public_key: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                },
            ]
        }
    },
    "mux": {
        mux: {
            concurrency: 8,
        }
    },
    "drop": {
        drop: {}
    },
    "vless": {
        vless: {
            uuid: "c48619fe-8f02-49e0-b9e9-edf763e17e21",
        }
    }
}
