"use client"

import { clone, DescMessage, DescMethod, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from 'swr';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import { AuthTokenKey, getApiUrl } from "./apiurl";

export function useProtoSWR<I extends DescMessage, O extends DescMessage>(
    m: (DescMethod & { methodKind: "unary"; input: I; output: O; }) | null,
    options?: SWRConfiguration,
): SWRResponse<MessageShape<O>, { msg: string, code: number }> {
    return useSWR(m ? ProtoPath(m) : null, m ? ProtoESFetcher(m) : null, options)
}

export const ProtoPath = (m: DescMethod) => `/${m.parent.typeName}/${m.name}`

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(AuthTokenKey);
    return token ? { 'Authorization': `Basic ${token}` } : {};
}

function handleUnauthorized(status: number) {
    if (status === 401) {
        if (window.location.hash !== '#/login') {
            window.location.hash = '/login';
        }
    }
}

export function ProtoESFetcher<I extends DescMessage, O extends DescMessage>(
    d: DescMethod & { methodKind: "unary"; input: I; output: O; },
    body?: MessageShape<I>, default_response?: MessageShape<O>): Fetcher<MessageShape<O>, string> {
    return () => {
        if (default_response) return clone(d.output, default_response)
        return fetch(
            `${getApiUrl()}${ProtoPath(d)}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: body ? toBinary(d.input, body) : undefined,
            },
        ).then(async r => {
            if (!r.ok) {
                handleUnauthorized(r.status);
                throw { code: r.status, msg: r.statusText, raw: r.text() }
            }
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
            headers: getAuthHeaders(),
            body: body ? toBinary(d.input, body) : undefined,
        })

    if (!r.ok) {
        handleUnauthorized(r.status);
        return {
            error: {
                code: r.status,
                msg: await r.text()
            }
        }
    }


    return { data: fromBinary(d.output, new Uint8Array(await r.arrayBuffer())) }
}

type WebsocketStreamOptions = {
    throttle?: number,
    onDisconnect?: () => void,
    reconnectDelayMs?: number,
}

export function WebsocketProtoServerStream<I extends DescMessage, O extends DescMessage, Response>(
    d: DescMethod & { methodKind: "server_streaming"; input: I; output: O; },
    Request: MessageShape<I>,
    stream: (r: MessageShape<O>[], prev?: Response) => Response,
    options?: WebsocketStreamOptions
):
    (key: string, { next }: SWRSubscriptionOptions<Response, { msg: string, code: number }>) => () => void {
    const apiUrl = getApiUrl()
    const reconnectDelayMs = options?.reconnectDelayMs ?? 2000

    return (key, { next }) => {
        const url = new URL(apiUrl !== "" ? apiUrl : window.location.toString());
        url.hash = ""
        url.pathname = ProtoPath(d)
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

        const token = localStorage.getItem(AuthTokenKey);
        if (token) {
            url.searchParams.set("token", token);
        }

        let socket: WebSocket | null = null;
        let closed = false
        let buffer: MessageShape<O>[] = [];
        let timeout: ReturnType<typeof setTimeout> | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let generation = 0;

        const clearFlushTimer = () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }

        const clearReconnectTimer = () => {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        }

        const flush = () => {
            if (closed) return;
            if (buffer.length === 0) return;
            const batch = buffer;
            buffer = [];
            timeout = null;
            next(null, prev => { return stream(batch, prev) });
        };

        const cleanupSocket = () => {
            if (!socket) return

            const current = socket;
            current.onopen = null;
            current.onmessage = null;
            current.onerror = null;
            current.onclose = null;

            if (current.readyState === WebSocket.CONNECTING || current.readyState === WebSocket.OPEN) {
                current.close()
            }

            if (socket === current) {
                socket = null
            }
        }

        const scheduleReconnect = () => {
            if (closed || reconnectTimer) return
            console.log(`reconnect after ${reconnectDelayMs}ms`)
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null
                connect()
            }, reconnectDelayMs)
        }

        const connect = () => {
            if (closed) return

            console.log(`connecting to: ${url}`)

            const currentGeneration = generation
            const currentSocket = new WebSocket(url)
            socket = currentSocket
            currentSocket.binaryType = "arraybuffer";

            const isCurrent = () => !closed && socket === currentSocket && generation === currentGeneration

            currentSocket.onopen = (e) => {
                if (!isCurrent()) return
                console.log(`connect to: ${url}, event type: ${e.type}`)
                currentSocket.send(toBinary(d.input, Request))
            }

            currentSocket.onmessage = (event) => {
                if (!isCurrent()) return
                const raw = fromBinary(d.output, new Uint8Array(event.data));

                if (options?.throttle) {
                    buffer.push(raw);
                    if (!timeout) {
                        timeout = setTimeout(flush, options.throttle);
                    }
                } else {
                    next(null, prev => { return stream([raw], prev) })
                }
            }

            currentSocket.onerror = (e) => {
                if (!isCurrent()) return
                const msg = "websocket have some error"
                next({ msg: msg, code: 500 })
                console.log(msg, e.type)
            }

            currentSocket.onclose = (e) => {
                if (!isCurrent()) return
                console.log("websocket closed, code: " + e.code + ", isClosed: ", closed)

                currentSocket.onopen = null;
                currentSocket.onmessage = null;
                currentSocket.onerror = null;
                currentSocket.onclose = null;

                if (socket === currentSocket) {
                    socket = null
                }

                clearFlushTimer()
                buffer = []
                options?.onDisconnect?.()
                next(null, undefined)
                scheduleReconnect()
            }
        }

        connect()

        return () => {
            closed = true
            generation++
            buffer = []
            clearFlushTimer()
            clearReconnectTimer()
            console.log(`close: ${key}`)
            cleanupSocket()
        }
    }
}
