"use client"

import { create } from "@bufbuild/protobuf";
import { FC, useState } from 'react';
import { Button, InputGroup, ListGroup } from "react-bootstrap";
import { FormSelect } from "../common/switch";
import { Container, MoveUpDown, Remind, SettingInputText } from "../config/components";
import { point } from "../pbes/node/point/point_pb";
import {
    directSchema,
    dropSchema,
    grpcSchema,
    http2Schema,
    httpSchema,
    muxSchema,
    noneSchema,
    obfs_httpSchema,
    protocol, protocolSchema,
    quicSchema,
    realitySchema, shadowsocksrSchema, shadowsocksSchema,
    simpleSchema,
    socks5Schema,
    tailscaleSchema,
    tls_configSchema,
    trojanSchema,
    vlessSchema,
    vmessSchema,
    websocketSchema,
    wireguardSchema,
    yuubinsyaSchema
} from "../pbes/node/protocol/protocol_pb";
import { BootstrapDnsWarp } from "./bootstrap_dns_warp";
import { Directv2 } from './direct';
import { Dropv2 } from './drop';
import { Grpcv2 } from './grpc';
import { HTTPv2 } from './http';
import { HTTP2v2 } from './http2';
import { Muxv2 } from './mux';
import { Nonev2 } from './none';
import { Quicv2 } from './quic';
import { Realityv2 } from './reality';
import { Rejectv2 } from './reject';
import { ObfsHttpv2, Shadowsocksv2 } from './shadowsocks';
import { Shadowsocksrv2 } from './shadowsocksr';
import { Simplev2 } from './simple';
import { Socks5v2 } from './socks5';
import { Tailscale } from "./tailscale";
import { Tlsv2 } from './tls';
import { Props } from './tools';
import { Trojanv2 } from './trojan';
import { Vlessv2 } from './vless';
import { Vmessv2 } from './vmess';
import { Websocketv2 } from './websocket';
import { Wireguardv2 } from './wireguard';
import { Yuubinsyav2 } from './yuubinsta';


export const Point: FC<{ value: point, onChange: (x: point) => void, groups?: string[] }> =
    ({ value, onChange, groups }) => {
        const [newProtocol, setNewProtocol] = useState({ value: "simple" });


        return <>
            <SettingInputText
                label="Name"
                value={value.name}
                onChange={(e) => { onChange({ ...value, name: e }) }}
            />

            <SettingInputText
                label="Group"
                value={value.group}
                onChange={(e) => { onChange({ ...value, group: e }) }}
                reminds={groups ? groups.map(x => new Remind({ label: x, value: x })) : undefined}
            />

            <SettingInputText
                label="Hash"
                value={value.hash}
                onChange={(e) => { onChange({ ...value, hash: e }) }}
            />

            {
                value.protocols.map((x, i) => {
                    return <Container
                        className={i !== 0 ? "mt-2" : ""}
                        key={i} title={x.protocol.case ?? "Unknown"}
                        onClose={() => onChange({ ...value, protocols: [...value.protocols.slice(0, i), ...value.protocols.slice(i + 1)] })}
                        moveUpDown={new MoveUpDown(value.protocols, i, (x) => { onChange({ ...value, protocols: x }) })}
                    >
                        <Protocol value={value.protocols[i]} onChange={(e) => {
                            onChange({ ...value, protocols: [...value.protocols.slice(0, i), e, ...value.protocols.slice(i + 1)] })
                        }} />
                    </Container>
                })
            }

            <ListGroup variant="flush">
                <ListGroup.Item>
                    <InputGroup>
                        <FormSelect value={newProtocol.value} values={Object.keys(protocols)} onChange={(e) => setNewProtocol({ value: e })} />
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                onChange({ ...value, protocols: [...value.protocols, protocols[newProtocol.value]] })
                            }}
                        >
                            Add
                        </Button>
                    </InputGroup>
                </ListGroup.Item>
            </ListGroup>
        </>
    }

const Protocol: FC<Props<protocol>> = ({ value, onChange }) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = (data: any) => onChange({ ...value, protocol: { case: value.protocol.case, value: data } })

    const data = value.protocol
    switch (data.case) {
        case "simple":
            return <Simplev2 value={data.value} onChange={(e) => update(e)} />
        case "direct":
            return <Directv2 value={data.value} onChange={(e) => update(e)} />
        case "drop":
            return Dropv2
        case "tls":
            return <Tlsv2 value={data.value} onChange={(e) => update(e)} />
        case "websocket":
            return <Websocketv2 value={data.value} onChange={(e) => update(e)} />
        case "shadowsocks":
            return <Shadowsocksv2 value={data.value} onChange={(e) => update(e)} />
        case "quic":
            return <Quicv2 value={data.value} onChange={(e) => update(e)} />
        case "vless":
            return <Vlessv2 value={data.value} onChange={(e) => update(e)} />
        case "vmess":
            return <Vmessv2 value={data.value} onChange={(e) => update(e)} />
        case "trojan":
            return <Trojanv2 value={data.value} onChange={(e) => update(e)} />
        case "shadowsocksr":
            return <Shadowsocksrv2 value={data.value} onChange={(e) => update(e)} />
        case "obfsHttp":
            return <ObfsHttpv2 value={data.value} onChange={(e) => update(e)} />
        case "none":
            return Nonev2
        case "socks5":
            return <Socks5v2 value={data.value} onChange={(e) => update(e)} />
        case "http":
            return <HTTPv2 value={data.value} onChange={(e) => update(e)} />
        case "reject":
            return Rejectv2
        case "yuubinsya":
            return <Yuubinsyav2 value={data.value} onChange={(e) => update(e)} />
        case "grpc":
            return <Grpcv2 value={data.value} onChange={(e) => update(e)} />
        case "http2":
            return <HTTP2v2 value={data.value} onChange={(e) => update(e)} />
        case "reality":
            return <Realityv2 value={data.value} onChange={(e) => update(e)} />
        case "wireguard":
            return <Wireguardv2 value={data.value} onChange={(e) => update(e)} />
        case "mux":
            return <Muxv2 value={data.value} onChange={(e) => update(e)} />
        case "bootstrapDnsWarp":
            return BootstrapDnsWarp
        case "tailscale":
            return <Tailscale value={data.value} onChange={(e) => update(e)} />
        default: return Unknown
    }
}


const Unknown = <div className="text-center my-2" style={{ opacity: '0.4' }}>Not Implement</div>


const tlsConfig = create(tls_configSchema, {
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
    }),
    "bootstrapDnsWarp": create(protocolSchema, {
        protocol: {
            case: "bootstrapDnsWarp",
            value: {}
        }
    }),
    "tailscale": create(protocolSchema, {
        protocol: {
            case: "tailscale",
            value: create(tailscaleSchema, {
                authKey: "tskey-auth-xxxxx",
                hostname: "yuhaiin-node",
            })
        }
    })
}
