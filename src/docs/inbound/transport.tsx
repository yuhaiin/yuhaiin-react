import { FC } from "react"
import dynamic from "../../component/AsyncComponent"
import Loading from "../../component/v2/loading"
import { transport } from "../pbes/config/inbound_pb"

const LazyTls = dynamic(() => import("./tls").then(mod => ({ default: mod.Tls })), { ssr: false, loading: <Loading /> })
const LazyTlsAuto = dynamic(() => import("./tls").then(mod => ({ default: mod.TLSAuto })), { ssr: false, loading: <Loading /> })
const LazyReality = dynamic(() => import("./reality").then(mod => ({ default: mod.Reality })), { ssr: false, loading: <Loading /> })
const LazyAead = dynamic(() => import("./aead").then(mod => ({ default: mod.Aead })), { ssr: false, loading: <Loading /> })


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
        case "proxy":
            return <><div className="text-center" style={{ opacity: '0.4' }}>Proxy</div></>
    }
}