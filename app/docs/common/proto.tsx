import { Fetcher } from 'swr'
import { APIUrl } from '../apiurl';
import { Message, proto3 } from "@bufbuild/protobuf";

export function NewObject<V>(d?: { [k: string]: V } | null): { [k: string]: V } {
    if (d === undefined || d === null) return {}
    return d
}


export function ProtoESFetcher<T extends Message>(d: T, method?: string, body?: BodyInit): Fetcher<T, string> {
    return (url) => fetch(
        `${APIUrl}${url}`,
        {
            method: method,
            body: body,
        },
    ).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        return d.fromBinary(new Uint8Array(await r.arrayBuffer()))
    })
}


export function ProtoESStrFetcher(d: Message, method?: string, body?: BodyInit): Fetcher<string, string> {
    return (url) => fetch(
        `${APIUrl}${url}`,
        {
            method: method,
            body: body,
        },
    ).then(async r => {
        if (!r.ok) throw { code: r.status, msg: r.statusText, raw: r.text() }
        return d.fromBinary(new Uint8Array(await r.arrayBuffer())).toJsonString({ prettySpaces: 2 })
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