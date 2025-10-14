import { create } from "@bufbuild/protobuf";
import dynamic from "next/dynamic";
import { FC, useEffect, useState } from "react";
import { Button, InputGroup, ListGroup } from "react-bootstrap";
import { FormSelect } from "../common/switch";
import {
    emptySchema,
    inbound,
    quicSchema,
    tcpudpSchema
} from "../pbes/config/listener/listener_pb";

export const Network: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const [newProtocol, setNewProtocol] = useState({ value: inbound.network.case?.toString() ?? "tcpudp" });
    useEffect(() => {
        setNewProtocol({ value: inbound.network.case ? inbound.network.case.toString() : "tcpudp" });
    }, [inbound]);

    return <>
        <ListGroup variant="flush">
            <ListGroup.Item>
                <InputGroup>
                    <FormSelect value={newProtocol.value} values={["empty", "tcpudp", "quic"]} onChange={(e) => setNewProtocol({ value: e })} />
                    <Button
                        variant="outline-success"
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
                </InputGroup>
            </ListGroup.Item>
        </ListGroup>

        <br />

        <Config inbound={inbound} onChange={onChange} />
    </>
}

const LazyTcpUdp = dynamic(() => import("./tcpudp").then(mod => mod.TcpUdp), { ssr: false })
const LazyQuic = dynamic(() => import("./quic").then(mod => mod.Quic), { ssr: false })

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