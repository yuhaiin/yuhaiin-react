"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/component/v2/accordion";
import { Button } from "@/app/component/v2/button";
import { Card, CardBody } from "@/app/component/v2/card";
import { Select, SettingInputVertical } from "@/app/component/v2/forms";
import { create } from "@bufbuild/protobuf";
import dynamic from "next/dynamic";
import { FC, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, PlusLg, Trash } from "react-bootstrap-icons";
import Loading from "../../component/loading";
import { point } from "../pbes/node/point_pb";
import {
    aeadSchema,
    cloudflare_warp_masqueSchema,
    directSchema,
    dropSchema,
    fixedSchema,
    fixedv2Schema,
    grpcSchema,
    http2Schema,
    http_mockSchema,
    http_terminationSchema,
    httpSchema,
    muxSchema,
    network_split,
    network_splitSchema,
    noneSchema,
    obfs_httpSchema,
    protocol,
    protocolSchema,
    proxySchema,
    quicSchema,
    realitySchema,
    setSchema,
    shadowsocksrSchema,
    shadowsocksSchema,
    socks5Schema,
    tailscaleSchema,
    tls_configSchema,
    tls_server_configSchema,
    tls_terminationSchema,
    trojanSchema,
    vlessSchema,
    vmessSchema,
    websocketSchema,
    wireguardSchema,
    yuubinsyaSchema
} from "../pbes/node/protocol_pb";
import { BootstrapDnsWarp } from "./bootstrap_dns_warp";
import { Dropv2 } from './drop';
import { HttpMock } from "./mock";
import { Nonev2 } from './none';
import { Proxy } from "./proxy";
import { Rejectv2 } from './reject';
import { Props } from './tools';


export const Point: FC<{ value: point, onChange: (x: point) => void, groups?: string[], editable?: boolean }> =
    ({ value, onChange, groups, editable = true }) => {
        const [newProtocol, setNewProtocol] = useState(Object.keys(protocols)[0]);

        const moveProtocol = (index: number, direction: 'up' | 'down') => {
            if (!editable) return
            const next = [...value.protocols];
            if (direction === 'up') {
                if (index === 0) return;
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
            } else {
                if (index === next.length - 1) return;
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
            }
            onChange({ ...value, protocols: next });
        };

        const deleteProtocol = (index: number) => {
            if (!editable) return
            const next = [...value.protocols];
            next.splice(index, 1);
            onChange({ ...value, protocols: next });
        };

        return <>
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <SettingInputVertical
                        label="Name"
                        value={value.name}
                        disabled={!editable}
                        onChange={(e: string) => { onChange({ ...value, name: e }) }}
                    />
                </div>
                <div className="col-md-6">
                    <SettingInputVertical
                        label="Group"
                        value={value.group}
                        disabled={!editable}
                        onChange={(e: string) => { onChange({ ...value, group: e }) }}
                    />
                </div>
            </div>

            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <h6 className="fw-bold mb-0 opacity-75">Protocol Chain</h6>
                    <small className="text-muted">{value.protocols.length} steps</small>
                </div>

                <Accordion type="multiple" className="mb-3">
                    {
                        value.protocols.map((x, i) => {
                            return (
                                <AccordionItem value={`item-${i}`} key={i}>
                                    <AccordionTrigger className="fw-bold">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2" style={{ fontSize: '0.7rem' }}>{i + 1}</span>
                                            {x.protocol.case ?? "Unknown"}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-1">
                                            <Protocol value={value.protocols[i]} editable={editable} onChange={(e) => {
                                                const next = [...value.protocols];
                                                next[i] = e;
                                                onChange({ ...value, protocols: next })
                                            }} />

                                            {editable && (
                                                <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                                                    <Button variant="outline-secondary" size="sm" onClick={() => moveProtocol(i, 'up')} disabled={i === 0}>
                                                        <ArrowUp />
                                                    </Button>
                                                    <Button variant="outline-secondary" size="sm" onClick={() => moveProtocol(i, 'down')} disabled={i === value.protocols.length - 1}>
                                                        <ArrowDown />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => deleteProtocol(i)}>
                                                        <Trash /> Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })
                    }
                </Accordion>

                {editable && (
                    <div className="bg-body-tertiary p-3 rounded-3 d-flex align-items-end gap-3 flex-wrap flex-sm-nowrap">
                        <div className="flex-grow-1">
                            <label className="form-label small fw-bold opacity-75">New Protocol Step</label>
                            <Select
                                value={newProtocol}
                                onValueChange={(e) => setNewProtocol(e)}
                                items={Object.keys(protocols).map(v => ({ value: v, label: v }))}
                            />
                        </div>
                        <Button
                            variant="outline-primary"
                            className="mb-1"
                            style={{ height: '35px' }}
                            onClick={() => {
                                onChange({ ...value, protocols: [...value.protocols, protocols[newProtocol]] })
                            }}
                        >
                            <PlusLg className="me-1" /> Add Step
                        </Button>
                    </div>
                )}
            </div>
        </>
    }

const LazyFixed = dynamic(() => import("./simple").then(mod => mod.Fixed), { ssr: false, loading: () => <Loading /> })
const LazyFixedv2 = dynamic(() => import("./fixedv2").then(mod => mod.Fixed), { ssr: false, loading: () => <Loading /> })
const LazyDirect = dynamic(() => import("./direct").then(mod => mod.Directv2), { ssr: false, loading: () => <Loading /> })
const LazyTls = dynamic(() => import("./tls").then(mod => mod.Tlsv2), { ssr: false, loading: () => <Loading /> })
const LazyWebsocket = dynamic(() => import("./websocket").then(mod => mod.Websocketv2), { ssr: false, loading: () => <Loading /> })
const LazyShadowsocks = dynamic(() => import("./shadowsocks").then(mod => mod.Shadowsocksv2), { ssr: false, loading: () => <Loading /> })
const LazyShadowsocksr = dynamic(() => import("./shadowsocksr").then(mod => mod.Shadowsocksrv2), { ssr: false, loading: () => <Loading /> })
const LazyVless = dynamic(() => import("./vless").then(mod => mod.Vlessv2), { ssr: false, loading: () => <Loading /> })
const LazyVmess = dynamic(() => import("./vmess").then(mod => mod.Vmessv2), { ssr: false, loading: () => <Loading /> })
const LazyTrojan = dynamic(() => import("./trojan").then(mod => mod.Trojanv2), { ssr: false, loading: () => <Loading /> })
const LazyObfsHttp = dynamic(() => import("./shadowsocks").then(mod => mod.ObfsHttpv2), { ssr: false, loading: () => <Loading /> })
const LazySocks5 = dynamic(() => import("./socks5").then(mod => mod.Socks5v2), { ssr: false, loading: () => <Loading /> })
const LazyHttp = dynamic(() => import("./http").then(mod => mod.HTTPv2), { ssr: false, loading: () => <Loading /> })
const LazyYuubinsya = dynamic(() => import("./yuubinsta").then(mod => mod.Yuubinsyav2), { ssr: false, loading: () => <Loading /> })
const LazyGrpc = dynamic(() => import("./grpc").then(mod => mod.Grpcv2), { ssr: false, loading: () => <Loading /> })
const LazyHttp2 = dynamic(() => import("./http2").then(mod => mod.HTTP2v2), { ssr: false, loading: () => <Loading /> })
const LazyReality = dynamic(() => import("./reality").then(mod => mod.Realityv2), { ssr: false, loading: () => <Loading /> })
const LazyWireguard = dynamic(() => import("./wireguard").then(mod => mod.Wireguardv2), { ssr: false, loading: () => <Loading /> })
const LazyMux = dynamic(() => import("./mux").then(mod => mod.Muxv2), { ssr: false, loading: () => <Loading /> })
const LazyTailscale = dynamic(() => import("./tailscale").then(mod => mod.Tailscale), { ssr: false, loading: () => <Loading /> })
const LazySet = dynamic(() => import("./set").then(mod => mod.Set), { ssr: false, loading: () => <Loading /> })
const LazyTlsTermination = dynamic(() => import("./tls_server").then(mod => mod.UnWrapTls), { ssr: false, loading: () => <Loading /> })
const LazyHttpTermination = dynamic(() => import("./http").then(mod => mod.UnWrapHttp), { ssr: false, loading: () => <Loading /> })
const LazyQuic = dynamic(() => import("./quic").then(mod => mod.Quicv2), { ssr: false, loading: () => <Loading /> })
const LazyAead = dynamic(() => import("./aead").then(mod => mod.Aead), { ssr: false, loading: () => <Loading /> })
const LazyCloudflareWarpMasque = dynamic(() => import("./cloudflare_warp_masque").then(mod => mod.CloudflareWarpMasque), { ssr: false, loading: () => <Loading /> })

const Protocol: FC<Props<protocol>> = ({ value, onChange, editable = true }) => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = (data: any) => onChange({ ...value, protocol: { ...value.protocol, value: data } })

    useEffect(() => {
        if (!editable) return
        switch (value.protocol.case) {
            case "simple":
                onChange(create(protocolSchema, {
                    protocol: {
                        case: "fixed",
                        value: create(fixedSchema, {
                            host: value.protocol.value.host,
                            networkInterface: value.protocol.value.networkInterface,
                            alternateHost: value.protocol.value.alternateHost,
                            port: value.protocol.value.port
                        })
                    }
                }))
                break
        }
    }, [value.protocol.case])

    const data = value.protocol
    switch (data.case) {
        case "fixed":
            return <LazyFixed value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "direct":
            return <LazyDirect value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "drop":
            return Dropv2
        case "tls":
            return <LazyTls value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "websocket":
            return <LazyWebsocket value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "shadowsocks":
            return <LazyShadowsocks value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "quic":
            return <LazyQuic value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "vless":
            return <LazyVless value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "vmess":
            return <LazyVmess value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "trojan":
            return <LazyTrojan value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "shadowsocksr":
            return <LazyShadowsocksr value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "obfsHttp":
            return <LazyObfsHttp value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "none":
            return Nonev2
        case "socks5":
            return <LazySocks5 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "http":
            return <LazyHttp value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "reject":
            return Rejectv2
        case "yuubinsya":
            return <LazyYuubinsya value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "grpc":
            return <LazyGrpc value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "http2":
            return <LazyHttp2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "reality":
            return <LazyReality value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "wireguard":
            return <LazyWireguard value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "mux":
            return <LazyMux value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "bootstrapDnsWarp":
            return BootstrapDnsWarp
        case "tailscale":
            return <LazyTailscale value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "set":
            return <LazySet value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "tlsTermination":
            return <LazyTlsTermination value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "httpTermination":
            return <LazyHttpTermination value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "httpMock":
            return HttpMock
        case "aead":
            return <LazyAead value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "networkSplit":
            return <NetworkSplit value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "cloudflareWarpMasque":
            return <LazyCloudflareWarpMasque value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "proxy":
            return Proxy
        case "fixedv2":
            return <LazyFixedv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        default: return Unknown
    }
}


const NetworkSplit: FC<Props<network_split>> = ({ value, onChange, editable = true }) => {
    const protocolNames = Object.keys(protocols).filter(x => x !== "networkSplit")
    return <>
        <div className="mb-3">
            <label className="form-label small fw-bold opacity-75">TCP Protocol</label>
            <Select value={value.tcp.protocol.case ?? ""} items={protocolNames.map(v => ({ value: v, label: v }))}
                disabled={!editable}
                onValueChange={(e) => { onChange({ ...value, tcp: protocols[e] }) }} />
        </div>

        <Card className="mb-4">
            <CardBody>
                <Protocol value={value.tcp} editable={editable} onChange={(e) => { onChange({ ...value, tcp: e }) }} />
            </CardBody>
        </Card>

        <div className="mb-3">
            <label className="form-label small fw-bold opacity-75">UDP Protocol</label>
            <Select value={value.udp.protocol.case ?? ""} items={protocolNames.map(v => ({ value: v, label: v }))}
                disabled={!editable}
                onValueChange={(e) => { onChange({ ...value, udp: protocols[e] }) }} />
        </div>

        <Card>
            <CardBody>
                <Protocol value={value.udp} editable={editable} onChange={(e) => { onChange({ ...value, udp: e }) }} />
            </CardBody>
        </Card >
    </>
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
    serverNames: ["www.example.com"],
    echConfig: new Uint8Array(8)
})


export const protocols: { [key: string]: protocol } = {
    "fixedv2": create(protocolSchema, {
        protocol: {
            case: "fixedv2",
            value: create(fixedv2Schema, { addresses: [] })
        }
    }),
    "fixed": create(protocolSchema, {
        protocol: {
            case: "fixed",
            value: create(fixedSchema, {
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
    "cloudflareWarpMasque": create(protocolSchema, {
        protocol: {
            case: "cloudflareWarpMasque",
            value: create(cloudflare_warp_masqueSchema, {
                privateKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                endpointPublicKey: `-----BEGIN PUBLIC KEY-----
SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY
SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY
-----END PUBLIC KEY-----
`,
                endpoint: "198.122.111.1",
                mtu: 1280,
                localAddresses: [
                    "172.16.0.2/32",
                    "3333:4444:111:8567:3333:6666:a888:95a0/128",
                ]
            }),
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
    }),
    "set": create(protocolSchema, {
        protocol: {
            case: "set",
            value: create(setSchema, { nodes: [] })
        }
    }),
    "tlsTermination": create(protocolSchema, {
        protocol: {
            case: "tlsTermination",
            value: create(tls_terminationSchema, {
                tls: create(tls_server_configSchema, {
                    certificates: [],
                    nextProtos: [],
                    serverNameCertificate: {}
                })
            })
        }
    }),
    "httpTermination": create(protocolSchema, {
        protocol: {
            case: "httpTermination",
            value: create(http_terminationSchema, {
                headers: {},
                // unwrapTls: true,
                // defaultScheme: "https"
            })
        }
    }),
    "httpMock": create(protocolSchema, {
        protocol: {
            case: "httpMock",
            value: create(http_mockSchema, {
                data: new Uint8Array()
            })
        }
    }),
    "aead": create(protocolSchema, {
        protocol: {
            case: "aead",
            value: create(aeadSchema, {
                password: "password",
            })
        }
    }),
    "networkSplit": create(protocolSchema, {
        protocol: {
            case: "networkSplit",
            value: create(network_splitSchema, {
                tcp: create(protocolSchema, { protocol: { case: "none", value: create(noneSchema, {}) } }),
                udp: create(protocolSchema, { protocol: { case: "none", value: create(noneSchema, {}) } }),
            })
        }
    }),
    "proxy": create(protocolSchema, {
        protocol: {
            case: "proxy",
            value: create(proxySchema, {})
        }
    })
}
