import { Fetcher } from 'swr'
import * as $protobuf from "protobufjs/minimal";
import { APIUrl } from '../apiurl';

export function NewObject<V>(d?: { [k: string]: V } | null): { [k: string]: V } {
    if (d === undefined || d === null) return {}
    return d
}

interface Proto<T> {
    decode(input: $protobuf.Reader | Uint8Array, length?: number): T
    encode(message: T, writer?: $protobuf.Writer): $protobuf.Writer
    toJSON(message: T): unknown | { [key: string]: any }
}

interface PBTS<T> {
    decode(input: $protobuf.Reader | Uint8Array, length?: number): T
    encode(message: T, writer?: $protobuf.Writer): $protobuf.Writer
    toObject(message: T, options?: $protobuf.IConversionOptions): { [k: string]: any }
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

export function ProtoTSFetcher<T>(d: PBTS<T>, method?: string, body?: BodyInit): Fetcher<T, string> {
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

export const ToObjectOption: $protobuf.IConversionOptions = {
    longs: Number,
    enums: String,
    defaults: true,
    json: true,
    bytes: String,
}

export function ProtoTSStrFetcher<T>(d: PBTS<T>, method?: string, body?: BodyInit): Fetcher<string, string> {
    return (url) => fetch(
        `${APIUrl}${url}`,
        {
            method: method,
            body: body,
        },
    ).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        return JSON.stringify(d.toObject(
            d.decode(new Uint8Array(await r.arrayBuffer())), ToObjectOption,), null, "  ")
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