export var APIUrl = ""
export var RemoteBypass = "https://raw.githubusercontent.com/yuhaiin/kitte/main/yuhaiin/yuhaiin.conf"
export var LatencyHTTPUrl = "https://clients3.google.com/generate_204"
export var LatencyDNSUrl = "dns.nextdns.io:853"
export var LatencyIPv6 = true

const RefreshUrl = () => {
    let url = localStorage.getItem("api_url")
    if (url !== null) APIUrl = url
    else APIUrl = ""

    url = localStorage.getItem("remote_bypass")
    if (url !== null) RemoteBypass = url


    url = localStorage.getItem("latency_http_url")
    if (url !== null) LatencyHTTPUrl = url

    url = localStorage.getItem("latency_dns_url")
    if (url !== null) LatencyDNSUrl = url

    url = localStorage.getItem("latency_ipv6")
    if (url !== null) LatencyIPv6 = url === "true"
}

export const SetUrl = (url: string) => { save("api_url", url) }
export const SetRemoteBypass = (url: string) => { save("remote_bypass", url) }
export const SetLatencyDNSUrl = (url: string) => { save("latency_dns_url", url) }
export const SetLatencyHTTPUrl = (url: string) => { save("latency_http_url", url) }
export const SetLatencyIPv6 = (url: boolean) => { save("latency_ipv6", url.toString()) }

const save = (key: string, value: string) => {
    if (value === "") localStorage.removeItem(key)
    else localStorage.setItem(key, value)

    RefreshUrl()
}

if (typeof window !== 'undefined') RefreshUrl()