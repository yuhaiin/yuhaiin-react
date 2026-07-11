import { AuthTokenKey, getApiUrl } from "@/common/apiurl";
import { resolveRPCRoute, rpcPath } from "@/api/generated";

export type APIError = {
    code: number;
    msg: string;
    raw?: unknown;
};

function authHeaders(): HeadersInit {
    const token = localStorage.getItem(AuthTokenKey);
    return token ? { Authorization: `Basic ${token}` } : {};
}

type QueryValue = string | number | boolean | null | undefined;

function apiURL(path: string): URL {
    const apiUrl = getApiUrl();
    const base = apiUrl !== "" ? apiUrl : window.location.toString();
    const url = new URL(base);
    url.hash = "";
    url.pathname = path;
	url.search = "";
    return url;
}

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

export async function requestJSON<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown, query?: Record<string, QueryValue>): Promise<T> {
	const route = resolveRPCRoute(method, path);
	const response = await fetch(apiURL(rpcPath(route.operation)), {
		method: "POST",
		headers: {
			...authHeaders(),
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...toRequestFields(query),
			...route.params,
			...toRequestFields(body),
		}),
	});

    const raw = await decodeBody(response);
    if (!response.ok) {
        redirectUnauthorized(response.status);
        throw {
            code: response.status,
            msg: errorMessage(raw, response.statusText),
            raw,
        } satisfies APIError;
    }
    return raw as T;
}

function toRequestFields(value: unknown): Record<string, unknown> {
	if (value === undefined || value === null) return {};
	if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
	throw new TypeError("JSON API requests must use an object body");
}
