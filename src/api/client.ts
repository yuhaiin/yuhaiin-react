import { AuthTokenKey, getApiUrl } from "@/common/apiurl";

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

function toSearchParams(query?: URLSearchParams | Record<string, QueryValue>): URLSearchParams | undefined {
    if (query === undefined || query instanceof URLSearchParams) return query;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") continue;
        params.set(key, String(value));
    }
    return params;
}

function apiURL(path: string, query?: URLSearchParams | Record<string, QueryValue>): URL {
    const apiUrl = getApiUrl();
    const base = apiUrl !== "" ? apiUrl : window.location.toString();
    const url = new URL(base);
    url.hash = "";
    url.pathname = path;
    url.search = toSearchParams(query)?.toString() ?? "";
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

export async function requestJSON<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown, query?: URLSearchParams | Record<string, QueryValue>): Promise<T> {
    const response = await fetch(apiURL(path, query), {
        method,
        headers: {
            ...authHeaders(),
            Accept: "application/json",
            ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
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
