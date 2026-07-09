import { Inbound, InboundConfig, InboundList, normalizeInbound, normalizeInboundConfig } from "@/contract/inbound";
import { requestJSON } from "./client";

export type InboundQuery = {
    page?: number;
    pageSize?: number;
    query?: string;
};

function listQuery(query?: InboundQuery): URLSearchParams {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.pageSize) params.set("page_size", String(query.pageSize));
    if (query?.query) params.set("query", query.query);
    return params;
}

export function listInbounds(query?: InboundQuery): Promise<InboundList> {
    return requestJSON<InboundList>("GET", "/api/v2/inbounds", undefined, listQuery(query)).then(data => ({
        items: (data.items ?? []).map(item => normalizeInbound(item)),
        page: data.page ?? { page: query?.page ?? 1, pageSize: query?.pageSize ?? 0, total: 0 },
    }));
}

export function getInbound(id: string): Promise<Inbound> {
    return requestJSON<Inbound>("GET", `/api/v2/inbounds/${encodeURIComponent(id)}`).then(normalizeInbound);
}

export function createInbound(inbound: Inbound): Promise<Inbound> {
    return requestJSON<Inbound>("POST", "/api/v2/inbounds", normalizeInbound(inbound)).then(normalizeInbound);
}

export function saveInbound(inbound: Inbound): Promise<Inbound> {
    const normalized = normalizeInbound(inbound);
    return requestJSON<Inbound>("PUT", `/api/v2/inbounds/${encodeURIComponent(normalized.id)}`, normalized).then(normalizeInbound);
}

export function deleteInbound(id: string): Promise<void> {
    return requestJSON<void>("DELETE", `/api/v2/inbounds/${encodeURIComponent(id)}`);
}

export function getInboundConfig(): Promise<InboundConfig> {
    return requestJSON<InboundConfig>("GET", "/api/v2/inbounds/config").then(normalizeInboundConfig);
}

export function saveInboundConfig(config: InboundConfig): Promise<InboundConfig> {
    return requestJSON<InboundConfig>("PUT", "/api/v2/inbounds/config", normalizeInboundConfig(config)).then(normalizeInboundConfig);
}
