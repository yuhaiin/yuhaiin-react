import { create } from "@bufbuild/protobuf";
import dynamic from "next/dynamic";
import { FC, useEffect, useState } from "react";
import { Button, InputGroup, ListGroup } from "react-bootstrap";
import Loading from "../../component/loading";
import { FormSelect } from "../../component/switch";
import {
    httpSchema,
    inbound,
    mixedSchema,
    redirSchema,
    reverse_httpSchema,
    reverse_tcpSchema,
    socks5Schema,
    tproxySchema,
    tunSchema,
    yuubinsyaSchema
} from "../pbes/config/inbound_pb";

const LazyHTTP = dynamic(() => import("./http").then(mod => mod.HTTP), { ssr: false, loading: () => <Loading /> })
const LazyReverseHTTP = dynamic(() => import("./http").then(mod => mod.ReverseHTTP), { ssr: false, loading: () => <Loading /> })
const LazyReverseTCP = dynamic(() => import("./tcpudp").then(mod => mod.ReverseTCP), { ssr: false, loading: () => <Loading /> })
const LazyRedir = dynamic(() => import("./redir").then(mod => mod.Redir), { ssr: false, loading: () => <Loading /> })
const LazySocks5 = dynamic(() => import("./mixed").then(mod => mod.Socks5), { ssr: false, loading: () => <Loading /> })
const LazyTProxy = dynamic(() => import("./tproxy").then(mod => mod.TProxy), { ssr: false, loading: () => <Loading /> })
const LazyMixed = dynamic(() => import("./mixed").then(mod => mod.Mixed), { ssr: false, loading: () => <Loading /> })
const LazyTun = dynamic(() => import("./tun").then(mod => mod.Tun), { ssr: false, loading: () => <Loading /> })
const LazyYuubinsya = dynamic(() => import("./yuubinsya").then(mod => mod.Yuubinsya), { ssr: false, loading: () => <Loading /> })

const Config: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    switch (inbound.protocol.case) {
        case "http":
            return <LazyHTTP
                http={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "http", value: x } }) }}
            />
        case "reverseHttp":
            return <LazyReverseHTTP
                reverse_http={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "reverseHttp", value: x } }) }}
            />
        case "reverseTcp":
            return <LazyReverseTCP
                reverse_tcp={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "reverseTcp", value: x } }) }}
            />
        case "socks5":
            return <LazySocks5
                socks5={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "socks5", value: x } }) }}
            />
        case "socks4a":
            return <></>
        case "mix":
            return <LazyMixed
                mixed={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "mix", value: x } }) }}
            />
        case "redir":
            return <LazyRedir
                redir={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "redir", value: x } }) }}
            />
        case "tun":
            return <LazyTun
                tun={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "tun", value: x } }) }}
            />
        case "yuubinsya":
            return <LazyYuubinsya
                yuubinsya={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "yuubinsya", value: x } }) }}
            />
        case "tproxy":
            return <LazyTProxy
                tproxy={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "tproxy", value: x } }) }}
            />
    }
}

export const Protocol: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const [newProtocol, setNewProtocol] = useState({ value: inbound.protocol.case ? inbound.protocol.case.toString() : "yuubinsya" });

    useEffect(() => {
        setNewProtocol({ value: inbound.protocol.case ? inbound.protocol.case.toString() : "yuubinsya" });
    }, [inbound]);

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
                            const x = { ...inbound }
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
                            onChange({ ...x })
                        }}
                    >
                        Use
                    </Button>
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>

        <br />

        <Config inbound={inbound} onChange={(x) => { onChange({ ...x }) }} />
    </>
}

