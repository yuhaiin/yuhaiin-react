export let APIUrlDefault = ""
export let APIUrlKey = "api_url_v2"
export let AuthTokenKey = "auth_token"

export function getApiUrl() {
    let apiUrl = localStorage.getItem(APIUrlKey)
    if (!apiUrl) return APIUrlDefault
    return JSON.parse(apiUrl)
}

export let LatencyHTTPUrlDefault = "https://clients3.google.com/generate_204"
export let LatencyDNSUrlKey = "latency_dns_url_v2"

export let LatencyDNSUrlDefault = "dns.nextdns.io:853"
export let LatencyHTTPUrlKey = "latency_http_url_v2"

export let LatencyIPv6Default = true
export let LatencyIPv6Key = "latency_ipv6_v2"

export let LatencyIPUrlDefault = "http://ip.sb"
export let LatencyIPUrlKey = "latency_ip_url_v2"

export let LatencyStunUrlDefault = "stun.nextcloud.com:3478"
export let LatencyStunUrlKey = "latency_stun_url_v2"

export let LatencyStunTCPUrlDefault = "stun.nextcloud.com:443"
export let LatencyStunTCPUrlKey = "latency_stun_tcp_url_v2"
