"use client"

import { Button } from "@/component/v2/button"
import { SettingLabel } from "@/component/v2/card"
import { Select } from "@/component/v2/forms"
import { create } from "@/common/plain"
import { FC, useEffect, useState } from "react"
import {
    emptySchema,
    inbound,
    quicSchema,
    tcpudpSchema
} from "../schema/config/inbound"
import { Quic } from "./quic"
import { TcpUdp } from "./tcpudp"

export const Network: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const network = inbound.network ?? { case: "tcpudp", value: create(tcpudpSchema, {}) };
    const [newProtocol, setNewProtocol] = useState({ value: network.case?.toString() ?? "tcpudp" });
    useEffect(() => {
        setNewProtocol({ value: network.case ? network.case.toString() : "tcpudp" });
    }, [inbound]);

    return (<>
        <div className="flex items-center mb-4">
            <SettingLabel className="mb-0 whitespace-nowrap mr-4" style={{ minWidth: "auto" }}>Network Type</SettingLabel>
            <div className="grow mr-2">
                <Select
                    value={newProtocol.value}
                    onValueChange={(e) => setNewProtocol({ value: e })}
                    items={["empty", "tcpudp", "quic"].map(v => ({ value: v, label: v }))}
                />
            </div>
            <Button
                onClick={() => {
                    const x = { ...inbound }
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
                    onChange({ ...x })
                }}
            >
                Use
            </Button>
        </div>

        <Config inbound={inbound} onChange={onChange} />
    </>)
}


const Config: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const network = inbound.network ?? { case: "tcpudp", value: create(tcpudpSchema, {}) };
    switch (network.case) {
        case "tcpudp":
            return <TcpUdp protocol={network.value} onChange={(x) => { onChange({ ...inbound, network: { case: "tcpudp", value: x } }) }}></TcpUdp>
        case "quic":
            return <Quic
                quic={network.value}
                onChange={(x) => { onChange({ ...inbound, network: { case: "quic", value: x } }) }}
            />
        case "empty":
            return <></>
    }
}
