import { Fetcher } from 'swr'
import { APIUrl } from '../apiurl';
import { Message } from "@bufbuild/protobuf";

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