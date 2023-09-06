import { Fetcher } from 'swr'
import _m0 from "protobufjs/minimal";

interface Proto<T> {
    decode(input: _m0.Reader | Uint8Array, length?: number): T
}

export function ProtoFetcher<T>(d: Proto<T>): Fetcher<T, string> {
    return (url) => fetch(url).then(async r => d.decode(new Uint8Array(await r.arrayBuffer())))
}

export const JsonFetcher = <T extends unknown>(url: string): Promise<T> => fetch(url).then(r => r.json())

export const JsonStrFetcher: Fetcher<string, string> = (url) => fetch(url).then(async r => JSON.stringify(await r.json(), null, "  "))

export const TextFetcher: Fetcher<string, string> = (url) => fetch(url).then(async r => {
    if (!r.ok) throw r.text()
    return await r.text()
})