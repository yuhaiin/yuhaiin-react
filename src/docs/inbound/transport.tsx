import { FC } from "react"
import { transport } from "../pbes/config/inbound_pb"
import { Aead } from "./aead"
import { Reality } from "./reality"
import { Tls, TLSAuto } from "./tls"

export const Transport: FC<{ transport: transport, onChange: (x: transport) => void }> = ({ transport, onChange }) => {
    switch (transport.transport.case) {
        case "normal":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Normal</div></>
        case "tls":
            return <Tls
                tls={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "tls", value: x } }) }}
            />
        case "tlsAuto":
            return <TLSAuto
                tls={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "tlsAuto", value: x } }) }}
            />
        case "mux":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Mux</div></>
        case "http2":
            return <><div className="text-center" style={{ opacity: '0.4' }}>HTTP2</div></>
        case "websocket":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Websocket</div></>
        case "grpc":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Grpc</div></>
        case "reality":
            return <Reality
                reality={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "reality", value: x } }) }}
            />
        case "httpMock":
            return <><div className="text-center" style={{ opacity: '0.4' }}>HTTP MOCK</div></>
        case "aead":
            return <Aead
                aead={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "aead", value: x } }) }}
            />
        case "proxy":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Proxy</div></>
    }
}