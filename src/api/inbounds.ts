import type { Go } from "@/api/generated-contracts";
import { Inbound, InboundConfig, InboundList, normalizeInbound, normalizeInboundConfig } from "@/contract/inbound";
import { requestJSON } from "./client";

export type InboundQuery = {
    page?: number;
    pageSize?: number;
    query?: string;
};

function listQuery(query?: InboundQuery): Record<string, number | string | undefined> {
    return {
        page: query?.page,
        page_size: query?.pageSize,
        query: query?.query,
    };
}

export async function listInbounds(query?: InboundQuery): Promise<InboundList> {
    const data = await requestJSON<{ items: Go.inbound.Inbound[]; page: InboundList["page"]; }>("GET", "/api/v2/inbounds", undefined, listQuery(query));
    return ({
        items: (data.items ?? []).map(item => normalizeInbound(item as unknown as Partial<Inbound>)),
        page: data.page ?? { page: query?.page ?? 1, pageSize: query?.pageSize ?? 0, total: 0 },
    });
}

export async function getInbound(id: string): Promise<Inbound> {
    const value = await requestJSON<Go.inbound.Inbound>("GET", `/api/v2/inbounds/${encodeURIComponent(id)}`);
    return normalizeInbound(value as unknown as Inbound);
}

export async function createInbound(inbound: Inbound): Promise<Inbound> {
    const value_1 = await requestJSON<Go.inbound.Inbound>("POST", "/api/v2/inbounds", normalizeInbound(inbound));
    return normalizeInbound(value_1 as unknown as Inbound);
}

export async function saveInbound(inbound: Inbound): Promise<Inbound> {
    const normalized = normalizeInbound(inbound);
    const value_1 = await requestJSON<Go.inbound.Inbound>("PUT", `/api/v2/inbounds/${encodeURIComponent(normalized.id)}`, normalized);
    return normalizeInbound(value_1 as unknown as Inbound);
}

export function deleteInbound(id: string): Promise<void> {
    return requestJSON<void>("DELETE", `/api/v2/inbounds/${encodeURIComponent(id)}`);
}

export async function getInboundConfig(): Promise<InboundConfig> {
    const value = await requestJSON<InboundConfig>("GET", "/api/v2/inbounds/config");
    return normalizeInboundConfig(value);
}

export async function saveInboundConfig(config: InboundConfig): Promise<InboundConfig> {
    const value = await requestJSON<InboundConfig>("PUT", "/api/v2/inbounds/config", normalizeInboundConfig(config));
    return normalizeInboundConfig(value);
}
