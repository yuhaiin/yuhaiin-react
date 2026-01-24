"use client"

import { Button } from "@/component/v2/button"
import { SettingLabel } from "@/component/v2/card"
import { Select } from "@/component/v2/forms"
import { create } from "@bufbuild/protobuf"
import { FC, useEffect, useState } from "react"
import dynamic from "../../component/AsyncComponent"
import Loading from "../../component/v2/loading"
import {
    emptySchema,
    inbound,
    quicSchema,
    tcpudpSchema
} from "../pbes/config/inbound_pb"

export const Network: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const [newProtocol, setNewProtocol] = useState({ value: inbound.network.case?.toString() ?? "tcpudp" });
    useEffect(() => {
        setNewProtocol({ value: inbound.network.case ? inbound.network.case.toString() : "tcpudp" });
    }, [inbound]);

    return (<>
        <div className="d-flex align-items-center mb-3">
            <SettingLabel className="mb-0 text-nowrap me-3" style={{ minWidth: "auto" }}>Network Type</SettingLabel>
            <div className="flex-grow-1 me-2">
                <Select
                    value={newProtocol.value}
                    onValueChange={(e) => setNewProtocol({ value: e })}
                    items={["empty", "tcpudp", "quic"].map(v => ({ value: v, label: v }))}
                />
            </div>
            <Button
                variant="outline-primary"
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

const LazyTcpUdp = dynamic(() => import("./tcpudp").then(mod => ({ default: mod.TcpUdp })), { ssr: false, loading: <Loading /> })
const LazyQuic = dynamic(() => import("./quic").then(mod => ({ default: mod.Quic })), { ssr: false, loading: <Loading /> })

const Config: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    switch (inbound.network.case) {
        case "tcpudp":
            return <LazyTcpUdp protocol={inbound.network.value} onChange={(x) => { onChange({ ...inbound, network: { case: "tcpudp", value: x } }) }}></LazyTcpUdp>
        case "quic":
            return <LazyQuic
                quic={inbound.network.value}
                onChange={(x) => { onChange({ ...inbound, network: { case: "quic", value: x } }) }}
            />
        case "empty":
            return <></>
    }
}