"use client"

import { clone, DescMessage, DescMethod, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from 'swr';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import { getApiUrl } from "./apiurl";

import { useMemo } from 'react';

export function useProtoSWR<I extends DescMessage, O extends DescMessage>(
    m: (DescMethod & { methodKind: "unary"; input: I; output: O; }) | null,
    options?: SWRConfiguration,
): SWRResponse<MessageShape<O>, { msg: string, code: number }> {
    const fetcher = useMemo(() => m ? ProtoESFetcher(m) : null, [m]);
    return useSWR(m ? ProtoPath(m) : null, fetcher, options)
}

export const ProtoPath = (m: DescMethod) => `/${m.parent.typeName}/${m.name}`

export function ProtoESFetcher<I extends DescMessage, O extends DescMessage>(
    d: DescMethod & { methodKind: "unary"; input: I; output: O; },
    body?: MessageShape<I>, default_response?: MessageShape<O>): Fetcher<MessageShape<O>, string> {
    return () => {
        if (default_response) return clone(d.output, default_response)
        return fetch(
            `${getApiUrl()}${ProtoPath(d)}`,
            {
                method: "POST",
                body: body ? toBinary(d.input, body) : undefined,
            },
        ).then(async r => {
            if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
            return fromBinary(d.output, new Uint8Array(await r.arrayBuffer()))
        })
    }
}

export async function FetchProtobuf<I extends DescMessage, O extends DescMessage>(
    d: DescMethod & { methodKind: "unary"; input: I; output: O; },
    body?: MessageShape<I>,
): Promise<{
    data?: MessageShape<O>,
    error?: { code: number, msg: string }
}> {
    const r = await fetch(`${getApiUrl()}${ProtoPath(d)}`,
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
    d: DescMethod & { methodKind: "server_streaming"; input: I; output: O; },
    Request: MessageShape<I>,
    stream: (r: MessageShape<O>[], prev?: Response) => Response,
    options?: { throttle?: number }
):
    (key: string, { next }: SWRSubscriptionOptions<Response, { msg: string, code: number }>) => () => void {
    const apiUrl = getApiUrl()

    return (key, { next }) => {
        const url = new URL(apiUrl !== "" ? apiUrl : window.location.toString());
        url.pathname = ProtoPath(d)
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

        let socket: WebSocket | undefined;
        let closed = false
        let buffer: MessageShape<O>[] = [];
        let timeout: ReturnType<typeof setTimeout> | null = null;

        const flush = () => {
            if (buffer.length === 0) return;
            const batch = buffer;
            buffer = [];
            timeout = null;
            next(null, prev => { return stream(batch, prev) });
        };

        const connect = () => {
            if (closed) return

            socket = new WebSocket(url)
            socket.binaryType = "arraybuffer";

            socket.addEventListener('open', () => {
                socket?.send(toBinary(d.input, Request))
            })

            socket.addEventListener('message', (event) => {
                const raw = fromBinary(d.output, new Uint8Array(event.data));

                if (options?.throttle) {
                    buffer.push(raw);
                    if (!timeout) {
                        timeout = setTimeout(flush, options.throttle);
                    }
                } else {
                    next(null, prev => { return stream([raw], prev) })
                }
            })

            socket.addEventListener('error', () => {
                const msg = "websocket have some error"
                next({ msg: msg, code: 500 })
            })

            socket.addEventListener('close', () => {
                next(null, undefined)
                if (closed) return
                else {
                    setTimeout(() => connect(), 2000)
                }
            })
        }

        connect()

        return () => {
            closed = true
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            if (socket !== undefined) {
                socket.close()
                socket = undefined
            }
        }
    }
}
