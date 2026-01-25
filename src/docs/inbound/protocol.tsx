"use client"

import { Button } from "@/component/v2/button"
import { SettingLabel } from "@/component/v2/card"
import { Select } from "@/component/v2/forms"
import { create } from "@bufbuild/protobuf"
import { FC, useEffect, useState } from "react"
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
} from "../pbes/config/inbound_pb"
import { HTTP, ReverseHTTP } from "./http"
import { Mixed, Socks5 } from "./mixed"
import { Redir } from "./redir"
import { ReverseTCP } from "./tcpudp"
import { TProxy } from "./tproxy"
import { Tun } from "./tun"
import { Yuubinsya } from "./yuubinsya"

const Config: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    switch (inbound.protocol.case) {
        case "http":
            return <HTTP
                http={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "http", value: x } }) }}
            />
        case "reverseHttp":
            return <ReverseHTTP
                reverse_http={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "reverseHttp", value: x } }) }}
            />
        case "reverseTcp":
            return <ReverseTCP
                reverse_tcp={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "reverseTcp", value: x } }) }}
            />
        case "socks5":
            return <Socks5
                socks5={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "socks5", value: x } }) }}
            />
        case "socks4a":
            return <></>
        case "mix":
            return <Mixed
                mixed={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "mix", value: x } }) }}
            />
        case "redir":
            return <Redir
                redir={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "redir", value: x } }) }}
            />
        case "tun":
            return <Tun
                tun={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "tun", value: x } }) }}
            />
        case "yuubinsya":
            return <Yuubinsya
                yuubinsya={inbound.protocol.value}
                onChange={(x) => { onChange({ ...inbound, protocol: { case: "yuubinsya", value: x } }) }}
            />
        case "tproxy":
            return <TProxy
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
        <div className="d-flex align-items-center mb-3">
            <SettingLabel className="mb-0 text-nowrap me-3" style={{ minWidth: "auto" }}>Protocol</SettingLabel>
            <div className="flex-grow-1 me-2">
                <Select
                    value={newProtocol.value}
                    onValueChange={(e) => setNewProtocol({ value: e })}
                    items={["http", "reverseHttp", "reverseTcp", "socks5", "mix", "redir", "tun", "yuubinsya", "tproxy"].map(v => ({ value: v, label: v }))}
                />
            </div>
            <Button
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
        </div>

        <Config inbound={inbound} onChange={(x) => { onChange({ ...x }) }} />
    </>
}
