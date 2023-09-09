import { Fetcher } from 'swr'
import _m0 from "protobufjs/minimal";
import { APIUrl } from '../apiurl';

interface Proto<T> {
    decode(input: _m0.Reader | Uint8Array, length?: number): T
    encode(message: T, writer?: _m0.Writer): _m0.Writer
    toJSON(message: T): unknown
}

export function ProtoFetcher<T>(d: Proto<T>, method?: string, body?: BodyInit): Fetcher<T, string> {
    return (url) => fetch(
        `${APIUrl}${url}`,
        {
            method: method,
            body: body,
        },
    ).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        return d.decode(new Uint8Array(await r.arrayBuffer()))
    })
}

export function ProtoStrFetcher<T>(d: Proto<T>, method?: string, body?: BodyInit): Fetcher<string, string> {
    return (url) => fetch(
        `${APIUrl}${url}`,
        {
            method: method,
            body: body,
        },
    ).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        return JSON.stringify(d.toJSON(d.decode(new Uint8Array(await r.arrayBuffer()))), null, "  ")
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

export const Fetch = async <T2 extends unknown>(
    url: string,
    props: {
        method?: string,
        body?: BodyInit | null,
        process?: (r: Response) => Promise<T2>
    }): Promise<{
        data?: Promise<T2>,
        error?: { code: number, msg: Promise<string> }
    }> => {
    let r = await fetch(`${APIUrl}${url}`,
        {
            method: props.method !== undefined ? props.method : "POST",
            body: props.body
        }
    )

    if (!r.ok) {
        return {
            error: {
                code: r.status,
                msg: r.text()
            }
        }
    }


    if (props.process === undefined) return {}
    return { data: props.process(r) }
}