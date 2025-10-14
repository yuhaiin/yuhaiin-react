import dynamic from "next/dynamic"
import { FC } from "react"
import { transport } from "../pbes/config/listener/listener_pb"

const LazyTls = dynamic(() => import("./tls").then(mod => mod.Tls), { ssr: false })
const LazyTlsAuto = dynamic(() => import("./tls").then(mod => mod.TLSAuto), { ssr: false })
const LazyReality = dynamic(() => import("./reality").then(mod => mod.Reality), { ssr: false })
const LazyAead = dynamic(() => import("./aead").then(mod => mod.Aead), { ssr: false })


export const Transport: FC<{ transport: transport, onChange: (x: transport) => void }> = ({ transport, onChange }) => {
    switch (transport.transport.case) {
        case "normal":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Normal</div></>
        case "tls":
            return <LazyTls
                tls={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "tls", value: x } }) }}
            />
        case "tlsAuto":
            return <LazyTlsAuto
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
            return <LazyReality
                reality={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "reality", value: x } }) }}
            />
        case "httpMock":
            return <><div className="text-center" style={{ opacity: '0.4' }}>HTTP MOCK</div></>
        case "aead":
            return <LazyAead
                aead={transport.transport.value}
                onChange={(x) => { onChange({ ...transport, transport: { case: "aead", value: x } }) }}
            />
    }
}