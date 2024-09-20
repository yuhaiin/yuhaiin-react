import { Fetcher } from 'swr'
import { APIUrl } from '../apiurl';
import { clone, create, DescMessage, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import type { SWRSubscriptionOptions } from 'swr/subscription'

export function ProtoESFetcher<Desc extends DescMessage>(d: Desc, method?: string, body?: BodyInit, value?: MessageShape<Desc>): Fetcher<MessageShape<Desc>, string> {
    return (url) => {
        if (value) return clone(d, value)
        return fetch(
            `${APIUrl}${url}`,
            {
                method: method,
                body: body,
            },
        ).then(async r => {
            if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
            return fromBinary(d, new Uint8Array(await r.arrayBuffer()))
        })
    }
}

export function ProtoESFetcher2<Desc extends DescMessage, resp extends {}>(d: Desc, process: (data: MessageShape<Desc>) => resp, method?: string, body?: BodyInit): Fetcher<resp, string> {
    return (url) => fetch(
        `${APIUrl}${url}`,
        {
            method: method,
            body: body,
        },
    ).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        let x = process(fromBinary(d, new Uint8Array(await r.arrayBuffer())))
        return x
    })
}

export const Fetch = async <T2 extends unknown>(
    url: string,
    props: {
        method?: string,
        body?: BodyInit | null,
        process?: (r: Response) => Promise<T2>
    }): Promise<{
        data?: Promise<T2>,
        error?: { code: number, msg: Promise<string> }
    }> => {
    let r = await fetch(`${APIUrl}${url}`,
        {
            method: props.method !== undefined ? props.method : "POST",
            body: props.body
        }
    )

    if (!r.ok) {
        return {
            error: {
                code: r.status,
                msg: r.text()
            }
        }
    }


    if (props.process === undefined) return {}
    return { data: props.process(r) }
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
