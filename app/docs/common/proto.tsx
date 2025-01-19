import { clone, DescMessage, DescMethod, DescService, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from 'swr';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import { APIUrl } from './apiurl';


export function useProtoSWR<I extends DescMessage, O extends DescMessage>(
    s: DescService,
    m: DescMethod & { methodKind: "unary"; input: I; output: O; },
    options?: SWRConfiguration,
): SWRResponse<MessageShape<O>, { msg: string, code: number }> {
    return useSWR(ProtoPath(s, m), ProtoESFetcher(s, m), options)
}

export const ProtoPath = (s: DescService, m: DescMethod,) => `/${s.typeName}/${m.name}`


export function ProtoESFetcher<I extends DescMessage, O extends DescMessage>(
    s: DescService,
    d: DescMethod & { methodKind: "unary"; input: I; output: O; },
    method?: string, body?: MessageShape<I>, default_response?: MessageShape<O>): Fetcher<MessageShape<O>, string> {
    return () => {
        if (default_response) return clone(d.output, default_response)
        return fetch(
            `${APIUrl}${ProtoPath(s, d)}`,
            {
                method: method ? method : "POST",
                body: body ? toBinary(d.input, body) : undefined,
            },
        ).then(async r => {
            if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
            return fromBinary(d.output, new Uint8Array(await r.arrayBuffer()))
        })
    }
}

export async function FetchProtobuf<I extends DescMessage, O extends DescMessage>(
    s: DescService,
    d: DescMethod & { methodKind: "unary"; input: I; output: O; },
    body?: MessageShape<I>,
): Promise<{
    data?: MessageShape<O>,
    error?: { code: number, msg: string }
}> {
    const r = await fetch(`${APIUrl}${ProtoPath(s, d)}`,
        {
            method: "POST",
            body: body ? toBinary(d.input, body) : undefined,
        })

    if (!r.ok) {
        return {
            error: {
                code: r.status,
                msg: await r.text()
            }
        }
    }


    return { data: fromBinary(d.output, new Uint8Array(await r.arrayBuffer())) }
}

export function WebsocketProtoServerStream<I extends DescMessage, O extends DescMessage, Response>(
    s: DescService,
    d: DescMethod & { methodKind: "server_streaming"; input: I; output: O; },
    Request: MessageShape<I>,
    stream: (r: MessageShape<O>, prev?: Response) => Response,
):
    (key: string, { next }: SWRSubscriptionOptions<Response, { msg: string, code: number }>) => () => void {


    return (key, { next }) => {
        const url = new URL(APIUrl !== "" ? APIUrl : window.location.toString());
        url.pathname = ProtoPath(s, d)
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

        let socket: WebSocket;
        let closed = false

        const connect = () => {
            if (closed) return

            console.log(`connecting to: ${url}`)

            socket = new WebSocket(url)
            socket.binaryType = "arraybuffer";

            socket.addEventListener('open', (e) => {
                console.log(`connect to: ${url}, event type: ${e.type}`)
                socket?.send(toBinary(d.input, Request))
            })

            socket.addEventListener('message', (event) => {
                const raw = fromBinary(d.output, new Uint8Array(event.data));
                next(null, prev => { return stream(raw, prev) })
            })

            socket.addEventListener('error', (e) => {
                const msg = "websocket have some error"
                next({ msg: msg, code: 500 })
                console.log(msg, e.type)
            })

            socket.addEventListener('close', (e) => {
                console.log("websocket closed, code: " + e.code + ", isClosed: ", closed)
                next(null, undefined)
                if (closed) return
                else {
                    console.log("reconnect after 2 seconds")
                    setTimeout(() => connect(), 2000)
                }
            })
        }

        connect()

        return () => {
            closed = true
            if (socket !== undefined) {
                console.log(`close: ${key}`)
                socket.close()
                socket = undefined
            }
        }
    }
}
