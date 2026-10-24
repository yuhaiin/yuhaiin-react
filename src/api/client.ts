import { resolveRPCRoute, rpcPath } from "@/api/generated";
import { operationPermissions } from "@/auth/operations";
import { can, getSession } from "@/auth/session";
import { authScope } from "@/auth/session";
import { apiURL, authorizedFetch } from "@/auth/transport";

export type APIError = {
    code: number;
    msg: string;
    raw?: unknown;
};

type QueryValue = string | number | boolean | null | undefined;

async function decodeBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (text.trim() === "") return {};
    try {
        return JSON.parse(text) as unknown;
    } catch {
        // Reverse proxies and older endpoints may return a plain-text error
        // such as "Unauthorized" instead of the API JSON error envelope.
        return text;
    }
}

function redirectUnauthorized(status: number) {
    if (status === 401 && window.location.hash !== "#/login") {
        window.location.hash = "/login";
    }
}

function errorMessage(raw: unknown, fallback: string): string {
    if (typeof raw === "string" && raw.trim() !== "") return raw;
    if (raw && typeof raw === "object" && "error" in raw) {
        const error = (raw as { error?: { message?: unknown } }).error;
        if (typeof error?.message === "string") return error.message;
    }
    return fallback;
}

export async function requestJSON<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown, query?: Record<string, QueryValue>, signal?: AbortSignal, options?: { revealSecrets?: boolean }): Promise<T> {
    const requestScope = authScope();
    if (options?.revealSecrets && getSession()?.principal.credentialType !== 'local' && !can('secrets:read')) throw { code: 403, msg: 'Permission denied' } satisfies APIError;
    const route = resolveRPCRoute(method, path);
    if (getSession() && !can(operationPermissions[route.operation])) throw { code: 403, msg: 'Permission denied' } satisfies APIError;
    let response: Response;
    try {
        response = await authorizedFetch(apiURL(rpcPath(route.operation)), {
            signal,
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(options?.revealSecrets ? { "X-Yuhaiin-Secret-Access": "reveal" } : {}),
            },
            body: JSON.stringify({
                ...toRequestFields(query),
                ...coercePathParams(route.params),
                ...toRequestFields(body),
            }),
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        // In cross-origin deployments a failed OPTIONS preflight appears as
        // TypeError: Failed to fetch, hiding the actual HTTP 405 from JS.
        if (error instanceof TypeError) {
            throw {
                code: 0,
                msg: `Could not reach the backend RPC ${route.operation}. Check the backend version, CORS preflight, and configured API URL.`,
                raw: error,
            } satisfies APIError;
        }
        throw error;
    }

    const raw = await decodeBody(response);
    if (!response.ok) {
        if (requestScope === authScope()) {
            redirectUnauthorized(response.status);
        }
        throw {
            code: response.status,
            msg: response.status === 405
                ? `Backend RPC ${route.operation} does not accept POST (405). Update the paired yuhaiin backend and verify OPTIONS preflight.`
                : errorMessage(raw, response.statusText),
            raw,
        } satisfies APIError;
    }
    return raw as T;
}

// Path params from resolveRPCRoute are always strings. Go expects some of them
// (e.g. rule index) as numbers — send those as JSON numbers.
const numericPathParams = new Set(["index"]);

function coercePathParams(params: Record<string, string>): Record<string, string | number> {
    const out: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params)) {
        if (numericPathParams.has(key) && /^-?\d+$/.test(value)) {
            const n = Number(value);
            if (Number.isSafeInteger(n)) {
                out[key] = n;
                continue;
            }
        }
        out[key] = value;
    }
    return out;
}

function toRequestFields(value: unknown): Record<string, unknown> {
    if (value === undefined || value === null) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
    throw new TypeError("JSON API requests must use an object body");
}
