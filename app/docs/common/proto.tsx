import { Fetcher } from 'swr'
import _m0 from "protobufjs/minimal";
import { APIUrl } from '../apiurl';

interface Proto<T> {
    decode(input: _m0.Reader | Uint8Array, length?: number): T
}

export function ProtoFetcher<T>(d: Proto<T>): Fetcher<T, string> {
    return (url) => fetch(`${APIUrl}${url}`).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        return d.decode(new Uint8Array(await r.arrayBuffer()))
    })
}

export const JsonFetcher = <T extends unknown>(url: string): Promise<T> => fetch(`${APIUrl}${url}`).then(r => {
    if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
    return r.json()
})

export const JsonStrFetcher: Fetcher<string, string> = (url) => fetch(`${APIUrl}${url}`).then(async r => {
    if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
    return JSON.stringify(await r.json(), null, "  ")
})

export const TextFetcher: Fetcher<string, string> = (url) => fetch(url).then(async r => {
    if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
    return await r.text()
})