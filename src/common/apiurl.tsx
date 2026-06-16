export const APIUrlDefault = ""
export const APIUrlKey = "api_url_v2"
export const AuthTokenKey = "auth_token"

export function getApiUrl() {
    const apiUrl = localStorage.getItem(APIUrlKey)
    if (!apiUrl) return APIUrlDefault
    return JSON.parse(apiUrl)
}

export const LatencyHTTPUrlDefault = "https://clients3.google.com/generate_204"
export const LatencyDNSUrlKey = "latency_dns_url_v2"

export const LatencyDNSUrlDefault = "dns.nextdns.io:853"
export const LatencyHTTPUrlKey = "latency_http_url_v2"

export const LatencyIPv6Default = true
export const LatencyIPv6Key = "latency_ipv6_v2"

export const LatencyIPUrlDefault = "http://ip.sb"
export const LatencyIPUrlKey = "latency_ip_url_v2"

export const LatencyStunUrlDefault = "stun.nextcloud.com:3478"
export const LatencyStunUrlKey = "latency_stun_url_v2"

export const LatencyStunTCPUrlDefault = "stun.nextcloud.com:443"
export const LatencyStunTCPUrlKey = "latency_stun_tcp_url_v2"
