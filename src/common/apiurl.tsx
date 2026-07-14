export const APIUrlDefault = ""
export const APIUrlKey = "api_url_v2"
export const APIUrlListKey = "api_url_list_v2"
export const AuthTokenKey = "auth_token"

export function normalizeApiUrl(value?: string) {
    const trimmed = (value ?? "").trim()
    if (!trimmed) return ""
    return trimmed.replace(/\/+$/, "")
}

export function getApiUrl() {
    const apiUrl = localStorage.getItem(APIUrlKey)
    if (!apiUrl) return APIUrlDefault
    try {
        return normalizeApiUrl(JSON.parse(apiUrl))
    } catch {
        return normalizeApiUrl(apiUrl)
    }
}

export function setApiUrl(url: string) {
    localStorage.setItem(APIUrlKey, JSON.stringify(normalizeApiUrl(url)))
}

function readStoredApiUrlList(): string[] {
    const raw = localStorage.getItem(APIUrlListKey)
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return uniqueApiUrls(parsed.map((item) => String(item ?? "")))
    } catch {
        return []
    }
}

export function uniqueApiUrls(urls: string[]) {
    const seen = new Set<string>()
    const out: string[] = []
    for (const url of urls) {
        const normalized = normalizeApiUrl(url)
        if (seen.has(normalized)) continue
        seen.add(normalized)
        out.push(normalized)
    }
    return out
}

/** Saved controller hosts, always including the currently active URL. */
export function getApiUrlList() {
    const current = getApiUrl()
    return uniqueApiUrls([current, ...readStoredApiUrlList()])
}

export function setApiUrlList(urls: string[]) {
    const list = uniqueApiUrls(urls)
    localStorage.setItem(APIUrlListKey, JSON.stringify(list))
    return list
}

export function addApiUrl(url: string) {
    const normalized = normalizeApiUrl(url)
    return setApiUrlList([...getApiUrlList(), normalized])
}

export function removeApiUrl(url: string) {
    const normalized = normalizeApiUrl(url)
    return setApiUrlList(getApiUrlList().filter((item) => item !== normalized))
}

export const LatencyHTTPUrlDefault = "https://clients3.google.com/generate_204"
export const LatencyDNSUrlKey = "latency_dns_url_v2"

export const LatencyDNSUrlDefault = "dns.nextdns.io:853"
export const BadLatencyDNSUrlDefault = "223.5.5.5:53"

export function normalizeLatencyDNSUrl(value?: string) {
    const trimmed = (value ?? "").trim()
    if (!trimmed || trimmed === BadLatencyDNSUrlDefault) return LatencyDNSUrlDefault
    return trimmed
}

export const LatencyHTTPUrlKey = "latency_http_url_v2"

export const LatencyIPv6Default = true
export const LatencyIPv6Key = "latency_ipv6_v2"

export const LatencyIPUrlDefault = "http://ip.sb"
export const LatencyIPUrlKey = "latency_ip_url_v2"

export const LatencyStunUrlDefault = "stun.nextcloud.com:3478"
export const LatencyStunUrlKey = "latency_stun_url_v2"

export const LatencyStunTCPUrlDefault = "stun.nextcloud.com:443"
export const LatencyStunTCPUrlKey = "latency_stun_tcp_url_v2"
