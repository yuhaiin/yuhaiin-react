import { Fetcher } from 'swr'
import { APIUrl } from '../apiurl';
import { clone, DescMessage, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import type { SWRSubscriptionOptions } from 'swr/subscription'


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

export function WebsocketSubscribe<Desc extends DescMessage, Response>(Request: Uint8Array, resp: Desc, processResponse: (prev: Response | undefined, r: MessageShape<Desc>) => Response):
    (key: string, { next }: SWRSubscriptionOptions<Response, { msg: string, code: number }>) => () => void {
    return (key, { next }) => {
        let url = new URL(APIUrl !== "" ? APIUrl : window.location.toString());
        url.pathname = key
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

        let closed = false;
        let socket: WebSocket | undefined

        const connect = () => {
            if (closed) return

            console.log(`connecting to: ${url}`)

            socket = new WebSocket(url)
            socket.binaryType = "arraybuffer";

            socket.addEventListener('open', (e) => {
                console.log(`connect to: ${url}, event type: ${e.type}`)
                socket?.send(Request)
            })

            socket.addEventListener('message', (event) => {
                const raw = fromBinary(resp, new Uint8Array(event.data));
                next(null, prev => { return processResponse(prev, raw) })
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
