"use client"

import {
    clone,
    DescMessage,
    fromJson,
    JsonValue,
    MessageShape,
    toJson,
    toJsonString,
} from "@/common/plain";
import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import type { SWRSubscriptionOptions } from "swr/subscription";
import { AuthTokenKey, getApiUrl } from "./apiurl";

export {
    fetchJsonRoute,
    jsonSSESubscription,
    postJSON,
    useJsonSWR,
} from "./json";
export type { JsonRoute } from "./json";

export type ApiMethod<I = DescMessage, O = DescMessage> = {
    parent: { typeName: string };
    name: string;
    input?: I extends DescMessage ? I : never;
    output?: O extends DescMessage ? O : never;
    methodKind: "unary" | "server_streaming";
    decode?: (raw: unknown) => O;
};

type MethodShape<T> = T extends DescMessage ? MessageShape<T> : T;

type UnaryMethod<I = DescMessage, O = DescMessage> = ApiMethod<I extends DescMessage ? I : never, O extends DescMessage ? O : never> & {
    methodKind: "unary";
};

type ServerStreamMethod<I extends DescMessage, O extends DescMessage> = ApiMethod<I, O> & {
    methodKind: "server_streaming";
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ResolvedRoute = {
    method: HttpMethod;
    path: string;
    query?: URLSearchParams;
    body?: unknown;
    transformResponse?: (raw: unknown) => JsonValue;
};

type HttpError = { msg: string; code: number };

export function useHttpSWR<I extends DescMessage, O extends DescMessage>(
    m: UnaryMethod<I, O> | null,
    options?: SWRConfiguration,
): SWRResponse<MethodShape<O>, HttpError> {
    return useSWR(m ? ApiPath(m) : null, m ? HttpFetcher(m) : null, options);
}

export function useHttpSWRRequest<I, O>(
    m: UnaryMethod<I, O> | null,
    body?: MethodShape<I>,
    options?: SWRConfiguration,
): SWRResponse<MethodShape<O>, HttpError> {
    const key = m ? `${ApiPath(m)}:${body ? stringifyMethodBody(m, body) : ""}` : null;
    return useSWR(key, m ? HttpFetcher(m, body) : null, options);
}

// Keep the legacy key format for SWR cache keys.
export const ApiPath = (m: ApiMethod) => `/${m.parent.typeName}/${m.name}`;

function methodID(m: ApiMethod): string {
    return `${m.parent.typeName}/${m.name}`;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(AuthTokenKey);
    return token ? { Authorization: `Basic ${token}` } : {};
}

function handleUnauthorized(status: number) {
    if (status === 401 && window.location.hash !== "#/login") {
        window.location.hash = "/login";
    }
}

function asRecord(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function readString(value: unknown, field: string): string {
    const raw = asRecord(value)[field];
    return typeof raw === "string" ? raw : "";
}

function readUint(value: unknown, field: string): number {
    const raw = asRecord(value)[field];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "bigint") return Number(raw);
    if (typeof raw === "string" && raw !== "") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function requireString(value: unknown, field: string, label: string): string {
    const v = readString(value, field).trim();
    if (v === "") {
        throw new Error(`${label} is required`);
    }
    return v;
}

function buildURL(path: string, query?: URLSearchParams): URL {
    const apiUrl = getApiUrl();
    const base = apiUrl !== "" ? apiUrl : window.location.toString();
    const url = new URL(base);
    url.hash = "";
    url.pathname = path;
    url.search = query?.toString() ?? "";
    return url;
}

function pageQuery(body: unknown): URLSearchParams {
    const q = new URLSearchParams();
    const page = readUint(body, "page");
    const pageSize = readUint(body, "pageSize");
    const query = readString(body, "query");

    if (page > 0) q.set("page", String(page));
    if (pageSize > 0) q.set("page_size", String(pageSize));
    if (query !== "") q.set("query", query);
    return q;
}

function jsonValue(value: unknown): JsonValue {
    return value as JsonValue;
}

function stringifyMethodBody<I>(m: UnaryMethod<I, unknown>, body: MethodShape<I>): string {
    if (m.input) {
        return toJsonString(m.input, body as MessageShape<Extract<I, DescMessage>>);
    }
    return JSON.stringify(jsonSafe(body));
}

function methodBodyJSON<I>(d: UnaryMethod<I, unknown>, body?: MethodShape<I>): unknown {
    if (!body) return undefined;
    if (d.input) return toJson(d.input, body as MessageShape<Extract<I, DescMessage>>);
    return jsonSafe(body);
}

function jsonSafe(value: unknown): unknown {
    if (typeof value === "bigint") return value.toString();
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Uint8Array) {
        let binary = "";
        value.forEach((byte) => { binary += String.fromCharCode(byte); });
        return btoa(binary);
    }
    if (Array.isArray(value)) return value.map(jsonSafe);
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, jsonSafe(v)]),
        );
    }
    return value;
}

function decodeMethodResponse<O>(d: UnaryMethod<unknown, O>, raw: unknown): MethodShape<O> {
    if (d.decode) return d.decode(raw) as MethodShape<O>;
    if (d.output) return fromJson(d.output, jsonValue(raw), { ignoreUnknownFields: true }) as MethodShape<O>;
    return raw as MethodShape<O>;
}

function resolveUnaryRoute<I, O>(
    d: UnaryMethod<I, O>,
    body?: MethodShape<I>,
): ResolvedRoute {
    const key = methodID(d);
    const bodyJson = methodBodyJSON(d, body);

    switch (key) {
        case "yuhaiin.api.config.config_service/load":
            return { method: "GET", path: "/api/v1/config" };
        case "yuhaiin.api.config.config_service/save":
            return { method: "PUT", path: "/api/v1/config", body: bodyJson ?? {} };
        case "yuhaiin.api.config.config_service/info":
            return { method: "GET", path: "/api/v1/info" };

        case "yuhaiin.api.config.lists/list":
            return { method: "GET", path: "/api/v1/lists" };
        case "yuhaiin.api.config.lists/list_page":
            return { method: "GET", path: "/api/v1/lists", query: pageQuery(body) };
        case "yuhaiin.api.config.lists/get": {
            const name = requireString(body, "value", "lists.get.value");
            return { method: "GET", path: `/api/v1/lists/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.config.lists/save": {
            const name = requireString(body, "name", "lists.save.name");
            return { method: "PUT", path: `/api/v1/lists/${encodeURIComponent(name)}`, body: bodyJson ?? {} };
        }
        case "yuhaiin.api.config.lists/remove": {
            const name = requireString(body, "value", "lists.remove.value");
            return { method: "DELETE", path: `/api/v1/lists/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.config.lists/refresh":
            return { method: "POST", path: "/api/v1/lists:refresh" };
        case "yuhaiin.api.config.lists/save_config":
            return { method: "PUT", path: "/api/v1/lists/config", body: bodyJson ?? {} };

        case "yuhaiin.api.config.rules/list":
            return { method: "GET", path: "/api/v1/rules" };
        case "yuhaiin.api.config.rules/list_page":
            return { method: "GET", path: "/api/v1/rules", query: pageQuery(body) };
        case "yuhaiin.api.config.rules/get": {
            const name = requireString(body, "name", "rules.get.name");
            const index = readUint(body, "index");
            return { method: "GET", path: `/api/v1/rules/${encodeURIComponent(name)}/${index}` };
        }
        case "yuhaiin.api.config.rules/save": {
            const indexBody = asRecord(body).index;
            const name = requireString(indexBody, "name", "rules.save.index.name");
            const index = readUint(indexBody, "index");
            return {
                method: "PUT",
                path: `/api/v1/rules/${encodeURIComponent(name)}/${index}`,
                body: asRecord(body).rule ?? {},
            };
        }
        case "yuhaiin.api.config.rules/remove": {
            const name = requireString(body, "name", "rules.remove.name");
            const index = readUint(body, "index");
            return { method: "DELETE", path: `/api/v1/rules/${encodeURIComponent(name)}/${index}` };
        }
        case "yuhaiin.api.config.rules/change_priority":
            return { method: "POST", path: "/api/v1/rules:change-priority", body: bodyJson ?? {} };
        case "yuhaiin.api.config.rules/config":
            return { method: "GET", path: "/api/v1/rules/config" };
        case "yuhaiin.api.config.rules/save_config":
            return { method: "PUT", path: "/api/v1/rules/config", body: bodyJson ?? {} };
        case "yuhaiin.api.config.rules/test":
            return { method: "POST", path: "/api/v1/rules:test", body: bodyJson ?? {} };
        case "yuhaiin.api.config.rules/block_history":
            return { method: "GET", path: "/api/v1/rules/block-history" };

        case "yuhaiin.api.config.inbound/list":
            return { method: "GET", path: "/api/v1/inbounds" };
        case "yuhaiin.api.config.inbound/list_page":
            return { method: "GET", path: "/api/v1/inbounds", query: pageQuery(body) };
        case "yuhaiin.api.config.inbound/get": {
            const name = requireString(body, "value", "inbound.get.value");
            return { method: "GET", path: `/api/v1/inbounds/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.config.inbound/save": {
            const name = requireString(body, "name", "inbound.save.name");
            return { method: "PUT", path: `/api/v1/inbounds/${encodeURIComponent(name)}`, body: bodyJson ?? {} };
        }
        case "yuhaiin.api.config.inbound/remove": {
            const name = requireString(body, "value", "inbound.remove.value");
            return { method: "DELETE", path: `/api/v1/inbounds/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.config.inbound/apply":
            return { method: "POST", path: "/api/v1/inbounds:apply", body: bodyJson ?? {} };
        case "yuhaiin.api.config.inbound/platform_info":
            return { method: "GET", path: "/api/v1/inbounds/platform-info" };

        case "yuhaiin.api.config.resolver/list":
            return { method: "GET", path: "/api/v1/resolvers" };
        case "yuhaiin.api.config.resolver/list_page":
            return { method: "GET", path: "/api/v1/resolvers", query: pageQuery(body) };
        case "yuhaiin.api.config.resolver/get": {
            const name = requireString(body, "value", "resolver.get.value");
            return { method: "GET", path: `/api/v1/resolvers/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.config.resolver/save": {
            const name = requireString(body, "name", "resolver.save.name");
            return {
                method: "PUT",
                path: `/api/v1/resolvers/${encodeURIComponent(name)}`,
                body: asRecord(body).resolver ?? {},
            };
        }
        case "yuhaiin.api.config.resolver/remove": {
            const name = requireString(body, "value", "resolver.remove.value");
            return { method: "DELETE", path: `/api/v1/resolvers/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.config.resolver/hosts":
            return { method: "GET", path: "/api/v1/resolver/hosts" };
        case "yuhaiin.api.config.resolver/save_hosts":
            return { method: "PUT", path: "/api/v1/resolver/hosts", body: bodyJson ?? {} };
        case "yuhaiin.api.config.resolver/fakedns":
            return { method: "GET", path: "/api/v1/resolver/fakedns" };
        case "yuhaiin.api.config.resolver/save_fakedns":
            return { method: "PUT", path: "/api/v1/resolver/fakedns", body: bodyJson ?? {} };
        case "yuhaiin.api.config.resolver/server":
            return {
                method: "GET",
                path: "/api/v1/resolver/server",
                transformResponse: (raw) => ({ value: readString(raw, "name") }),
            };
        case "yuhaiin.api.config.resolver/save_server":
            return {
                method: "PUT",
                path: "/api/v1/resolver/server",
                body: { name: requireString(body, "value", "resolver.save_server.value") },
            };

        case "yuhaiin.api.node.node/now":
            return { method: "GET", path: "/api/v1/nodes/selected" };
        case "yuhaiin.api.node.node/use": {
            const hash = requireString(body, "hash", "node.use.hash");
            return { method: "POST", path: `/api/v1/nodes/${encodeURIComponent(hash)}/use` };
        }
        case "yuhaiin.api.node.node/get": {
            const hash = requireString(body, "value", "node.get.value");
            return { method: "GET", path: `/api/v1/nodes/${encodeURIComponent(hash)}` };
        }
        case "yuhaiin.api.node.node/save": {
            const hash = readString(body, "hash");
            if (hash !== "") {
                return { method: "PUT", path: `/api/v1/nodes/${encodeURIComponent(hash)}`, body: bodyJson ?? {} };
            }
            return { method: "POST", path: "/api/v1/nodes", body: bodyJson ?? {} };
        }
        case "yuhaiin.api.node.node/remove": {
            const hash = requireString(body, "value", "node.remove.value");
            return { method: "DELETE", path: `/api/v1/nodes/${encodeURIComponent(hash)}` };
        }
        case "yuhaiin.api.node.node/list":
            return { method: "GET", path: "/api/v1/nodes" };
        case "yuhaiin.api.node.node/activates":
            return { method: "GET", path: "/api/v1/nodes/active" };
        case "yuhaiin.api.node.node/close": {
            const hash = requireString(body, "value", "node.close.value");
            return { method: "POST", path: `/api/v1/nodes/${encodeURIComponent(hash)}/close` };
        }
        case "yuhaiin.api.node.node/latency":
            return { method: "POST", path: "/api/v1/nodes:latency", body: bodyJson ?? {} };

        case "yuhaiin.api.node.subscribe/save":
            return { method: "PUT", path: "/api/v1/subscriptions", body: bodyJson ?? {} };
        case "yuhaiin.api.node.subscribe/remove":
            return { method: "DELETE", path: "/api/v1/subscriptions", body: bodyJson ?? {} };
        case "yuhaiin.api.node.subscribe/update":
            return { method: "POST", path: "/api/v1/subscriptions:update", body: bodyJson ?? {} };
        case "yuhaiin.api.node.subscribe/get":
            return { method: "GET", path: "/api/v1/subscriptions" };
        case "yuhaiin.api.node.subscribe/remove_publish": {
            const name = requireString(body, "value", "subscribe.remove_publish.value");
            return { method: "DELETE", path: `/api/v1/publishes/${encodeURIComponent(name)}` };
        }
        case "yuhaiin.api.node.subscribe/list_publish":
            return { method: "GET", path: "/api/v1/publishes" };
        case "yuhaiin.api.node.subscribe/save_publish": {
            const name = requireString(body, "name", "subscribe.save_publish.name");
            return {
                method: "PUT",
                path: `/api/v1/publishes/${encodeURIComponent(name)}`,
                body: asRecord(body).publish ?? {},
            };
        }
        case "yuhaiin.api.node.subscribe/publish": {
            const name = requireString(body, "name", "subscribe.publish.name");
            return {
                method: "POST",
                path: `/api/v1/publishes/${encodeURIComponent(name)}/resolve`,
                body: {
                    path: readString(body, "path"),
                    password: readString(body, "password"),
                },
            };
        }

        case "yuhaiin.api.node.tag/save": {
            const tag = requireString(body, "tag", "tag.save.tag");
            return { method: "PUT", path: `/api/v1/tags/${encodeURIComponent(tag)}`, body: bodyJson ?? {} };
        }
        case "yuhaiin.api.node.tag/remove": {
            const tag = requireString(body, "value", "tag.remove.value");
            return { method: "DELETE", path: `/api/v1/tags/${encodeURIComponent(tag)}` };
        }
        case "yuhaiin.api.node.tag/list":
            return { method: "GET", path: "/api/v1/tags" };
        case "yuhaiin.api.node.tag/list_page":
            return { method: "GET", path: "/api/v1/tags", query: pageQuery(body) };

        case "yuhaiin.api.tools.tools/get_interface":
            return { method: "GET", path: "/api/v1/tools/interfaces" };
        case "yuhaiin.api.tools.tools/licenses":
            return { method: "GET", path: "/api/v1/tools/licenses" };

        case "yuhaiin.api.backup.backup/save":
            return { method: "PUT", path: "/api/v1/backup/config", body: bodyJson ?? {} };
        case "yuhaiin.api.backup.backup/get":
            return { method: "GET", path: "/api/v1/backup/config" };
        case "yuhaiin.api.backup.backup/backup":
            return { method: "POST", path: "/api/v1/backup:run" };
        case "yuhaiin.api.backup.backup/restore":
            return { method: "POST", path: "/api/v1/backup:restore", body: bodyJson ?? {} };

        default:
            throw new Error(`unsupported method: ${key}`);
    }
}

function resolveStreamPath<I extends DescMessage, O extends DescMessage>(d: ServerStreamMethod<I, O>): string {
    switch (methodID(d)) {
        case "yuhaiin.api.tools.tools/log":
            return "/api/v1/tools/logs";
        case "yuhaiin.api.tools.tools/logv2":
            return "/api/v1/tools/logs/v2";
        default:
            throw new Error(`unsupported stream method: ${methodID(d)}`);
    }
}

function transformStreamPayload<I extends DescMessage, O extends DescMessage>(
    d: ServerStreamMethod<I, O>,
    event: string,
    payload: unknown,
): JsonValue {
    return payload as JsonValue;
}

async function readJSONBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (text.trim() === "") return {};
    return JSON.parse(text) as unknown;
}

export function HttpFetcher<I, O>(
    d: UnaryMethod<I, O>,
    body?: MethodShape<I>,
    default_response?: MethodShape<O>,
): Fetcher<MethodShape<O>, string> {
    return async () => {
        if (default_response) {
            return d.output ? clone(d.output, default_response as MessageShape<Extract<O, DescMessage>>) as MethodShape<O> : default_response;
        }

        const route = resolveUnaryRoute(d, body);
        const headers = new Headers(getAuthHeaders());
        headers.set("Accept", "application/json");

        const hasBody = route.body !== undefined && route.method !== "GET";
        if (hasBody) {
            headers.set("Content-Type", "application/json");
        }

        const response = await fetch(buildURL(route.path, route.query), {
            method: route.method,
            headers,
            body: hasBody ? JSON.stringify(route.body) : undefined,
        });

        if (!response.ok) {
            handleUnauthorized(response.status);
            const msg = await response.text();
            throw { code: response.status, msg: msg || response.statusText } as HttpError;
        }

        const raw = await readJSONBody(response);
        const transformed = route.transformResponse ? route.transformResponse(raw) : jsonValue(raw);
        return decodeMethodResponse(d, transformed);
    };
}

export async function FetchHTTP<I, O>(
    d: UnaryMethod<I, O>,
    body?: MethodShape<I>,
): Promise<{
    data?: MethodShape<O>;
    error?: HttpError;
}> {
    let route: ResolvedRoute;
    try {
        route = resolveUnaryRoute(d, body);
    } catch (err) {
        return {
            error: {
                code: 400,
                msg: err instanceof Error ? err.message : "failed to resolve request route",
            },
        };
    }

    const headers = new Headers(getAuthHeaders());
    headers.set("Accept", "application/json");

    const hasBody = route.body !== undefined && route.method !== "GET";
    if (hasBody) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(buildURL(route.path, route.query), {
        method: route.method,
        headers,
        body: hasBody ? JSON.stringify(route.body) : undefined,
    });

    if (!response.ok) {
        handleUnauthorized(response.status);
        return {
            error: {
                code: response.status,
                msg: await response.text(),
            },
        };
    }

    try {
        const raw = await readJSONBody(response);
        const transformed = route.transformResponse ? route.transformResponse(raw) : jsonValue(raw);
        return { data: decodeMethodResponse(d, transformed) };
    } catch (err) {
        return {
            error: {
                code: 500,
                msg: err instanceof Error ? err.message : "failed to decode response",
            },
        };
    }
}

type ServerStreamOptions = {
    throttle?: number;
    onDisconnect?: () => void;
    reconnectDelayMs?: number;
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

                if (field === "event") {
                    eventName = value || "message";
                } else if (field === "data") {
                    dataLines.push(value);
                }
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
    if (buffer.length > 0 && !buffer.endsWith("\n")) {
        buffer += "\n";
    }
    processBuffer();
    dispatch();
}

export function HttpServerStream<I extends DescMessage, O extends DescMessage, Response>(
    d: ServerStreamMethod<I, O>,
    _request: MessageShape<I>,
    stream: (r: MessageShape<O>[], prev?: Response) => Response,
    options?: ServerStreamOptions,
): (key: string, { next }: SWRSubscriptionOptions<Response, HttpError>) => () => void {
    const reconnectDelayMs = options?.reconnectDelayMs ?? 2000;
    const streamPath = resolveStreamPath(d);

    return (key, { next }) => {
        let closed = false;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let flushTimer: ReturnType<typeof setTimeout> | null = null;
        let abortController: AbortController | null = null;
        let generation = 0;
        let pending: MessageShape<O>[] = [];

        const clearReconnectTimer = () => {
            if (!reconnectTimer) return;
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        };

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

        const signalDisconnect = () => {
            clearFlushTimer();
            pending = [];
            options?.onDisconnect?.();
            next(null, undefined);
        };

        const connect = async () => {
            if (closed) return;

            const currentGeneration = generation;
            const token = localStorage.getItem(AuthTokenKey);
            const url = buildURL(streamPath);
            if (token) {
                url.searchParams.set("token", token);
            }

            const headers = new Headers(getAuthHeaders());
            headers.set("Accept", "text/event-stream");

            abortController = new AbortController();

            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers,
                    signal: abortController.signal,
                });

                if (closed || generation !== currentGeneration) return;

                if (!response.ok) {
                    handleUnauthorized(response.status);
                    const message = await response.text();
                    next({ msg: message || response.statusText, code: response.status });
                    signalDisconnect();
                    scheduleReconnect();
                    return;
                }

                const body = response.body;
                if (!body) {
                    next({ msg: "stream body is empty", code: 500 });
                    signalDisconnect();
                    scheduleReconnect();
                    return;
                }

                await consumeSSE(
                    body.getReader(),
                    (event, data) => {
                        if (closed || generation !== currentGeneration) return;

                        let parsed: unknown = {};
                        if (data.trim() !== "") {
                            parsed = JSON.parse(data) as unknown;
                        }

                        const payload = transformStreamPayload(d, event, parsed);
                        const message = fromJson(d.output, payload, { ignoreUnknownFields: true });

                        if (options?.throttle) {
                            pending.push(message);
                            if (!flushTimer) {
                                flushTimer = setTimeout(flush, options.throttle);
                            }
                            return;
                        }

                        next(null, (prev) => stream([message], prev));
                    },
                    () => closed || generation !== currentGeneration,
                );

                if (closed || generation !== currentGeneration) return;
                signalDisconnect();
                scheduleReconnect();
            } catch (err) {
                if (closed || generation !== currentGeneration) return;
                if (err instanceof DOMException && err.name === "AbortError") return;

                next({
                    msg: err instanceof Error ? err.message : "stream connection failed",
                    code: 500,
                });
                signalDisconnect();
                scheduleReconnect();
            }
        };

        void connect();

        return () => {
            closed = true;
            generation++;
            clearFlushTimer();
            clearReconnectTimer();
            pending = [];
            abortController?.abort();
            abortController = null;
            console.log(`close: ${key}`);
        };
    };
}
