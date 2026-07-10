import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import type { SWRSubscriptionOptions } from "swr/subscription";
import { AuthTokenKey, getApiUrl } from "./apiurl";

export type HttpError = { msg: string; code: number };

export type JsonRoute<T> = {
    key: string;
    path: string;
    decode?: (raw: unknown) => T;
};

function authHeaders(): HeadersInit {
    const token = localStorage.getItem(AuthTokenKey);
    return token ? { Authorization: `Basic ${token}` } : {};
}

function apiURL(path: string): URL {
    const apiUrl = getApiUrl();
    const base = apiUrl !== "" ? apiUrl : window.location.toString();
    const url = new URL(base);
    url.hash = "";
    url.pathname = path;
    url.search = "";
    return url;
}

async function readJSON(response: Response): Promise<unknown> {
    const text = await response.text();
    if (text.trim() === "") return {};
    return JSON.parse(text) as unknown;
}

function redirectUnauthorized(status: number) {
    if (status === 401 && window.location.hash !== "#/login") {
        window.location.hash = "/login";
    }
}

export async function fetchJsonRoute<T>(route: JsonRoute<T>): Promise<T> {
    const response = await fetch(apiURL(route.path), {
        method: "GET",
        headers: {
            ...authHeaders(),
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        redirectUnauthorized(response.status);
        const msg = await response.text();
        throw { code: response.status, msg: msg || response.statusText } satisfies HttpError;
    }

    const raw = await readJSON(response);
    return route.decode ? route.decode(raw) : (raw as T);
}

export async function postJSON(path: string, body?: unknown): Promise<void> {
    const response = await fetch(apiURL(path), {
        method: "POST",
        headers: {
            ...authHeaders(),
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
        redirectUnauthorized(response.status);
        const msg = await response.text();
        throw { code: response.status, msg: msg || response.statusText } satisfies HttpError;
    }
}

type JsonStreamOptions = {
    reconnectDelayMs?: number;
    throttle?: number;
    onDisconnect?: () => void;
};

async function consumeSSE(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onEvent: (event: string, data: string) => void,
    shouldStop: () => boolean,
): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "message";
    let dataLines: string[] = [];

    const dispatch = () => {
        if (dataLines.length === 0) {
            eventName = "message";
            return;
        }
        onEvent(eventName, dataLines.join("\n"));
        eventName = "message";
        dataLines = [];
    };

    const processBuffer = () => {
        let idx = buffer.indexOf("\n");
        while (idx >= 0) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);

            if (line === "") {
                dispatch();
            } else if (!line.startsWith(":")) {
                const sep = line.indexOf(":");
                const field = sep >= 0 ? line.slice(0, sep) : line;
                let value = sep >= 0 ? line.slice(sep + 1) : "";
                if (value.startsWith(" ")) value = value.slice(1);
                if (field === "event") eventName = value || "message";
                if (field === "data") dataLines.push(value);
            }

            idx = buffer.indexOf("\n");
        }
    };

    while (!shouldStop()) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        processBuffer();
    }

    buffer += decoder.decode();
    if (buffer.length > 0 && !buffer.endsWith("\n")) buffer += "\n";
    processBuffer();
    dispatch();
}

export function jsonSSESubscription<Event, Response>(
    path: string,
    decode: (event: string, raw: unknown) => Event | undefined,
    stream: (events: Event[], prev?: Response) => Response,
    options?: JsonStreamOptions,
): (key: string, { next }: SWRSubscriptionOptions<Response, HttpError>) => () => void {
    const reconnectDelayMs = options?.reconnectDelayMs ?? 2000;

    return (_key, { next }) => {
        let closed = false;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let flushTimer: ReturnType<typeof setTimeout> | null = null;
        let abortController: AbortController | null = null;
        let pending: Event[] = [];

        const clearFlushTimer = () => {
            if (!flushTimer) return;
            clearTimeout(flushTimer);
            flushTimer = null;
        };

        const flush = () => {
            clearFlushTimer();
            if (closed || pending.length === 0) return;
            const batch = pending;
            pending = [];
            next(null, (prev) => stream(batch, prev));
        };

        const scheduleReconnect = () => {
            if (closed || reconnectTimer) return;
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                void connect();
            }, reconnectDelayMs);
        };

        const connect = async () => {
            abortController?.abort();
            abortController = new AbortController();

            try {
                const response = await fetch(apiURL(path), {
                    method: "GET",
                    headers: {
                        ...authHeaders(),
                        Accept: "text/event-stream",
                    },
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    redirectUnauthorized(response.status);
                    next({ code: response.status, msg: await response.text() });
                    scheduleReconnect();
                    return;
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("stream body is empty");

                await consumeSSE(reader, (event, data) => {
                    try {
                        const decoded = decode(event, JSON.parse(data) as unknown);
                        if (!decoded) return;
                        pending.push(decoded);
                        if (options?.throttle) {
                            flushTimer ??= setTimeout(flush, options.throttle);
                        } else {
                            flush();
                        }
                    } catch (error) {
                        next({ code: 500, msg: error instanceof Error ? error.message : "failed to decode stream event" });
                    }
                }, () => closed);
            } catch (error) {
                if (closed) return;
                next({ code: 500, msg: error instanceof Error ? error.message : "stream disconnected" });
            }

            if (!closed) {
                options?.onDisconnect?.();
                scheduleReconnect();
            }
        };

        void connect();

        return () => {
            closed = true;
            clearFlushTimer();
            if (reconnectTimer) clearTimeout(reconnectTimer);
            abortController?.abort();
        };
    };
}

export function useJsonSWR<T>(
    route: JsonRoute<T> | null,
    options?: SWRConfiguration<T, HttpError>,
): SWRResponse<T, HttpError> {
    return useSWR<T, HttpError>(
        route?.key ?? null,
        async () => {
            if (!route) throw { code: 400, msg: "missing route" } satisfies HttpError;
            return fetchJsonRoute(route);
        },
        options,
    );
}
