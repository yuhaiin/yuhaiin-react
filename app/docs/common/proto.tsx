import { clone, DescMessage, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import { Fetcher } from 'swr';
import type { SWRSubscription, SWRSubscriptionOptions } from 'swr/subscription';
import { APIUrl } from '../apiurl';


export function ProtoESFetcher<I extends DescMessage, O extends DescMessage>(
    d: { methodKind: "unary"; input: I; output: O; },
    method?: string, body?: MessageShape<I>, default_response?: MessageShape<O>): Fetcher<MessageShape<O>, string> {
    return (url) => {
        if (default_response) return clone(d.output, default_response)
        return fetch(
            `${APIUrl}${url}`,
            {
                method: method,
                body: body ? toBinary(d.input, body) : undefined,
            },
        ).then(async r => {
            if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
            return fromBinary(d.output, new Uint8Array(await r.arrayBuffer()))
        })
    }
}

export async function FetchProtobuf<I extends DescMessage, O extends DescMessage>(
    d: { methodKind: "unary"; input: I; output: O; },
    url: string,
    method?: string,
    body?: MessageShape<I>,
): Promise<{
    data?: MessageShape<O>,
    error?: { code: number, msg: string }
}> {
    let r = await fetch(`${APIUrl}${url}`,
        {
            method: method,
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
    d: { methodKind: "server_streaming"; input: I; output: O; },
    Request: MessageShape<I>,
    stream: (r: MessageShape<O>, prev?: Response) => Response,
):
    (key: string, { next }: SWRSubscriptionOptions<Response, { msg: string, code: number }>) => () => void {

    let closed = false;
    let socket: WebSocket | undefined


    return (key, { next }) => {
        let url = new URL(APIUrl !== "" ? APIUrl : window.location.toString());
        url.pathname = key
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

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
                let msg = "websocket have some error"
                next({ msg: msg, code: 500 })
                console.log(msg, e.type)
            })

            socket.addEventListener('close', (e) => {
                console.log("websocket closed, code: " + e.code)
                next(null, undefined)
                if (closed) return
                else {
                    console.log("reconnect after 1 seconds")
                    setTimeout(connect, 1000)
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
