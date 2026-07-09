import { fromJson, type DescMessage } from "@/common/plain";
import { EmptySchema, StringValueSchema } from "@/common/plain";
import type { ApiMethod } from "./proto";
import type { JsonRoute } from "./http";

import {
    backup_optionSchema,
    infoSchema,
    settingSchema,
    type advanced_config,
    type backup_option,
    type info,
    type setting,
    type s3,
    type system_proxy,
} from "../docs/schema/config/config";
import {
    configv2Schema,
    listSchema,
    maxminddb_geoipSchema,
    mode_configSchema,
    refresh_configSchema,
    rulev2Schema,
    type configv2,
    type list,
    type maxminddb_geoip,
    type mode_config,
    type refresh_config,
    type rulev2,
} from "../docs/schema/config/bypass";
import {
    dnsSchema,
    fakedns_configSchema,
    type dns,
    type fakedns_config,
} from "../docs/schema/config/dns";
import {
    inboundSchema,
    sniffSchema,
    type inbound as inbound_config,
    type sniff,
} from "../docs/schema/config/inbound";
import { type reply, type requests, type response } from "../docs/schema/node/latency";
import { pointSchema, type point } from "../docs/schema/node/point";
import { linkSchema, PublishSchema, type link, type Publish } from "../docs/schema/node/subscribe";
import { tagsSchema, type tag_type, type tags } from "../docs/schema/node/tag";
import { restore_optionSchema, type restore_option } from "../docs/schema/backup/backup";
import { connectionSchema, type connection, type match_history_entry, type as conn_type } from "../docs/schema/statistic/config";
import { InterfacesSchema, LicensesSchema, LogSchema, Logv2Schema } from "../docs/schema/tools/tools";

type UnaryMethod<I extends DescMessage, O extends DescMessage> = ApiMethod<I, O> & {
    methodKind: "unary";
};

type StreamMethod<I extends DescMessage, O extends DescMessage> = ApiMethod<I, O> & {
    methodKind: "server_streaming";
};

function unary<I extends DescMessage, O extends DescMessage>(
    parent: string,
    name: string,
    input: I,
    output: O,
): UnaryMethod<I, O> {
    return { parent: { typeName: parent }, name, input, output, methodKind: "unary" };
}

function stream<I extends DescMessage, O extends DescMessage>(
    parent: string,
    name: string,
    input: I,
    output: O,
): StreamMethod<I, O> {
    return { parent: { typeName: parent }, name, input, output, methodKind: "server_streaming" };
}

function jsonUnary<I, O>(
    parent: string,
    name: string,
    decode?: (raw: unknown) => O,
): UnaryMethod<I, O> {
    return { parent: { typeName: parent }, name, methodKind: "unary", decode } as UnaryMethod<I, O>;
}

const configService = "yuhaiin.api.config.config_service";
const listsService = "yuhaiin.api.config.lists";
const rulesService = "yuhaiin.api.config.rules";
const inboundService = "yuhaiin.api.config.inbound";
const resolverService = "yuhaiin.api.config.resolver";
const nodeService = "yuhaiin.api.node.node";
const subscribeService = "yuhaiin.api.node.subscribe";
const tagService = "yuhaiin.api.node.tag";
const toolsService = "yuhaiin.api.tools.tools";
const backupService = "yuhaiin.api.backup.backup";

export const config_service = {
    method: {
        load: unary(configService, "load", EmptySchema, settingSchema),
        save: unary(configService, "save", settingSchema, EmptySchema),
        info: unary(configService, "info", EmptySchema, infoSchema),
    },
} as const;

export const lists = {
    method: {
        list: jsonUnary<void, list_response>(listsService, "list", decodeListResponse),
        list_page: jsonUnary<page_request, list_response>(listsService, "list_page", decodeListResponse),
        get: unary(listsService, "get", StringValueSchema, listSchema),
        save: unary(listsService, "save", listSchema, EmptySchema),
        remove: unary(listsService, "remove", StringValueSchema, EmptySchema),
        refresh: unary(listsService, "refresh", EmptySchema, EmptySchema),
        save_config: jsonUnary<save_list_config_request, void>(listsService, "save_config"),
    },
} as const;

export const rules = {
    method: {
        list: jsonUnary<void, rule_response>(rulesService, "list", decodeRuleResponse),
        list_page: jsonUnary<page_request, rule_response>(rulesService, "list_page", decodeRuleResponse),
        get: jsonUnary<rule_index, rulev2>(rulesService, "get", (raw) => fromJson(rulev2Schema, raw, { ignoreUnknownFields: true })),
        save: jsonUnary<rule_save_request, void>(rulesService, "save"),
        remove: jsonUnary<rule_index, void>(rulesService, "remove"),
        change_priority: jsonUnary<change_priority_request, void>(rulesService, "change_priority"),
        config: unary(rulesService, "config", EmptySchema, configv2Schema),
        save_config: unary(rulesService, "save_config", configv2Schema, EmptySchema),
        test: jsonUnary<never, test_response>(rulesService, "test", decodeTestResponse),
        block_history: jsonUnary<void, block_history_list>(rulesService, "block_history", decodeBlockHistoryList),
    },
} as const;

export const inbound = {
    method: {
        list: jsonUnary<void, inbounds_response>(inboundService, "list", decodeInboundsResponse),
        list_page: jsonUnary<page_request, inbounds_response>(inboundService, "list_page", decodeInboundsResponse),
        get: unary(inboundService, "get", StringValueSchema, inboundSchema),
        save: unary(inboundService, "save", inboundSchema, inboundSchema),
        remove: unary(inboundService, "remove", StringValueSchema, EmptySchema),
        apply: jsonUnary<inbounds_response, void>(inboundService, "apply"),
        platform_info: jsonUnary<void, platform_info_response>(inboundService, "platform_info", decodePlatformInfoResponse),
    },
} as const;

export const resolver = {
    method: {
        list: jsonUnary<void, resolve_list>(resolverService, "list", decodeResolveList),
        list_page: jsonUnary<page_request, resolve_list>(resolverService, "list_page", decodeResolveList),
        get: unary(resolverService, "get", StringValueSchema, dnsSchema),
        save: jsonUnary<save_resolver, dns>(resolverService, "save", (raw) => fromJson(dnsSchema, raw, { ignoreUnknownFields: true })),
        remove: unary(resolverService, "remove", StringValueSchema, EmptySchema),
        hosts: jsonUnary<void, Hosts>(resolverService, "hosts", decodeHosts),
        save_hosts: jsonUnary<Hosts, void>(resolverService, "save_hosts"),
        fakedns: unary(resolverService, "fakedns", EmptySchema, fakedns_configSchema),
        save_fakedns: unary(resolverService, "save_fakedns", fakedns_configSchema, EmptySchema),
        server: unary(resolverService, "server", EmptySchema, StringValueSchema),
        save_server: unary(resolverService, "save_server", StringValueSchema, EmptySchema),
    },
} as const;

export const node = {
    method: {
        now: jsonUnary<void, now_resp>(nodeService, "now", decodeNowResp),
        use: jsonUnary<use_req, point>(nodeService, "use", (raw) => fromJson(pointSchema, raw, { ignoreUnknownFields: true })),
        get: unary(nodeService, "get", StringValueSchema, pointSchema),
        save: unary(nodeService, "save", pointSchema, pointSchema),
        remove: unary(nodeService, "remove", StringValueSchema, EmptySchema),
        list: jsonUnary<void, NodesResponse>(nodeService, "list", decodeNodesResponse),
        activates: jsonUnary<void, activates_response>(nodeService, "activates", decodeActivatesResponse),
        close: unary(nodeService, "close", StringValueSchema, EmptySchema),
        latency: jsonUnary<requests, response>(nodeService, "latency", decodeLatencyResponse),
    },
} as const;

export const subscribe = {
    method: {
        save: jsonUnary<save_link_req, void>(subscribeService, "save"),
        remove: jsonUnary<link_req, void>(subscribeService, "remove"),
        update: jsonUnary<link_req, void>(subscribeService, "update"),
        get: jsonUnary<void, get_links_resp>(subscribeService, "get", decodeGetLinksResp),
        remove_publish: unary(subscribeService, "remove_publish", StringValueSchema, EmptySchema),
        list_publish: jsonUnary<void, ListPublishResponse>(subscribeService, "list_publish", decodeListPublishResponse),
        save_publish: jsonUnary<SavePublishRequest, void>(subscribeService, "save_publish"),
        publish: jsonUnary<PublishRequest, PublishResponse>(subscribeService, "publish", decodePublishResponse),
    },
} as const;

export const tag = {
    method: {
        save: jsonUnary<save_tag_req, void>(tagService, "save"),
        remove: unary(tagService, "remove", StringValueSchema, EmptySchema),
        list: jsonUnary<void, tags_response>(tagService, "list", decodeTagsResponse),
        list_page: jsonUnary<tag_page_request, tags_response>(tagService, "list_page", decodeTagsResponse),
    },
} as const;

export const tools = {
    method: {
        get_interface: unary(toolsService, "get_interface", EmptySchema, InterfacesSchema),
        licenses: unary(toolsService, "licenses", EmptySchema, LicensesSchema),
        log: stream(toolsService, "log", EmptySchema, LogSchema),
        logv2: stream(toolsService, "logv2", EmptySchema, Logv2Schema),
    },
} as const;

export const backup = {
    method: {
        save: unary(backupService, "save", backup_optionSchema, EmptySchema),
        get: unary(backupService, "get", EmptySchema, backup_optionSchema),
        backup: unary(backupService, "backup", EmptySchema, EmptySchema),
        restore: unary(backupService, "restore", restore_optionSchema, EmptySchema),
    },
} as const;

export type { advanced_config, backup_option, dns, fakedns_config, inbound_config, info, list, restore_option, rulev2, s3, setting, system_proxy };

export type page_request = {
    page: number;
    pageSize: number;
    query?: string;
};

export type page_response = {
    page: number;
    pageSize: number;
    total: number;
};

export type list_item = {
    name: string;
    type: string;
    source: string;
    itemCount: number;
    errorCount: number;
    preview: string;
};

export type list_response = {
    names: string[];
    maxminddbGeoip?: maxminddb_geoip;
    refreshConfig?: refresh_config;
    page?: page_response;
    items: list_item[];
};

export type save_list_config_request = {
    maxminddbGeoip?: maxminddb_geoip;
    refreshInterval: bigint;
};

export type rule_item = {
    name: string;
    disabled: boolean;
    index: number;
    mode: string;
    tag: string;
    resolver: string;
    ruleCount: number;
};

export type rule_response = {
    names: string[];
    items: rule_item[];
    page?: page_response;
};

export type rule_index = {
    index: number;
    name: string;
};

export type rule_save_request = {
    index?: rule_index;
    rule?: rulev2;
};

export enum change_priority_request_change_priority_operate {
    Exchange = 0,
    InsertBefore = 1,
    InsertAfter = 2,
}

export const change_priority_request_change_priority_operateSchema = {
    values: [
        { number: change_priority_request_change_priority_operate.Exchange, name: "Exchange" },
        { number: change_priority_request_change_priority_operate.InsertBefore, name: "InsertBefore" },
        { number: change_priority_request_change_priority_operate.InsertAfter, name: "InsertAfter" },
    ],
} as const;

export type change_priority_request = {
    source?: rule_index;
    target?: rule_index;
    operate: change_priority_request_change_priority_operate;
};

export type test_response = {
    mode?: mode_config;
    afterAddr: string;
    matchResult: unknown[];
    lists: string[];
    ips: string[];
};

export type block_history = {
    protocol: string;
    host: string;
    time?: Date;
    process: string;
    blockCount: bigint;
};

export type block_history_list = {
    objects: block_history[];
    dumpProcessEnabled: boolean;
};

export type inbound_item = {
    name: string;
    enabled: boolean;
    network: string;
    listen: string;
    protocol: string;
    transports: string[];
};

export type inbounds_response = {
    names: string[];
    hijackDns: boolean;
    hijackDnsFakeip: boolean;
    sniff?: sniff;
    page?: page_response;
    items: inbound_item[];
};

export type platform_info_response = {
    darwin?: {
        networkServices: string[];
    };
};

export type resolver_item = {
    name: string;
    type: string;
    host: string;
    subnet: string;
    tlsServername: string;
    system: boolean;
};

export type resolve_list = {
    names: string[];
    page?: page_response;
    items: resolver_item[];
};

export type save_resolver = {
    name: string;
    resolver?: dns;
};

export type Hosts = {
    hosts: Record<string, string>;
};

export type now_resp = {
    tcp?: point;
    udp?: point;
};

export type use_req = {
    hash: string;
};

export type NodesResponse_Node = {
    hash: string;
    name: string;
};

export type NodesResponse_Group = {
    name: string;
    nodes: NodesResponse_Node[];
};

export type NodesResponse = {
    groups: NodesResponse_Group[];
};

export type activates_response = {
    nodes: point[];
};

export type save_link_req = {
    links: link[];
};

export type link_req = {
    names: string[];
};

export type get_links_resp = {
    links: Record<string, link>;
};

export type SavePublishRequest = {
    name: string;
    publish?: Publish;
};

export type ListPublishResponse = {
    publishes: Record<string, Publish>;
};

export type PublishRequest = {
    name: string;
    password: string;
    path: string;
};

export type PublishResponse = {
    points: point[];
};

export type save_tag_req = {
    tag: string;
    type: tag_type;
    hash: string;
};

export type tag_item = {
    name: string;
    tag?: tags;
};

export type tags_response = {
    tags: Record<string, tags>;
    items: tag_item[];
    page?: page_response;
};

export type tag_page_request = {
    page: number;
    pageSize: number;
    query?: string;
};

export type RuntimeInfo = {
    version: string;
    commit: string;
    buildTime: string;
    goVersion: string;
    platform: string;
    compiler: string;
    arch: string;
    os: string;
    build: string[];
};

function record(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringField(value: Record<string, unknown>, name: string): string {
    const raw = value[name];
    return typeof raw === "string" ? raw : "";
}

function stringListField(value: Record<string, unknown>, name: string): string[] {
    const raw = value[name];
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}

function numberField(value: Record<string, unknown>, name: string): number {
    const raw = value[name];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "bigint") return Number(raw);
    if (typeof raw === "string" && raw !== "") {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function boolField(value: Record<string, unknown>, name: string): boolean {
    return Boolean(value[name]);
}

function rawField(value: Record<string, unknown>, name: string): unknown {
    return value[name];
}

function firstRawField(value: Record<string, unknown>, ...names: string[]): unknown {
    for (const name of names) {
        const raw = value[name];
        if (raw !== undefined && raw !== null) return raw;
    }
    return undefined;
}

function stringOneOf(value: Record<string, unknown>, ...names: string[]): string {
    const raw = firstRawField(value, ...names);
    return typeof raw === "string" ? raw : "";
}

function numberOneOf(value: Record<string, unknown>, ...names: string[]): number {
    for (const name of names) {
        if (value[name] !== undefined && value[name] !== null) return numberField(value, name);
    }
    return 0;
}

function uint64OneOf(value: Record<string, unknown>, ...names: string[]): bigint {
    for (const name of names) {
        if (value[name] !== undefined && value[name] !== null) return uint64Field(value, name);
    }
    return BigInt(0);
}

function stringListOneOf(value: Record<string, unknown>, ...names: string[]): string[] {
    const raw = firstRawField(value, ...names);
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}

function arrayOneOf(value: Record<string, unknown>, ...names: string[]): unknown[] {
    const raw = firstRawField(value, ...names);
    return Array.isArray(raw) ? raw : [];
}

export const runtimeInfoRoute: JsonRoute<RuntimeInfo> = {
    key: "/api/v1/info",
    path: "/api/v1/info",
    decode(raw): RuntimeInfo {
        const v = record(raw);
        return {
            version: stringField(v, "version"),
            commit: stringField(v, "commit"),
            buildTime: stringField(v, "build_time"),
            goVersion: stringField(v, "go_version"),
            platform: stringField(v, "platform"),
            compiler: stringField(v, "compiler"),
            arch: stringField(v, "arch"),
            os: stringField(v, "os"),
            build: stringListField(v, "build"),
        };
    },
};

function uint64Field(value: Record<string, unknown>, name: string): bigint {
    const raw = value[name];
    if (typeof raw === "bigint") return raw;
    if (typeof raw === "number" && Number.isFinite(raw)) return BigInt(Math.trunc(raw));
    if (typeof raw === "string" && raw !== "") return BigInt(raw);
    return BigInt(0);
}

function dateField(value: Record<string, unknown>, name: string): Date | undefined {
    const raw = value[name];
    if (typeof raw !== "string" || raw === "") return undefined;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function pageResponse(raw: unknown): page_response | undefined {
    if (!raw) return undefined;
    const v = record(raw);
    return {
        page: numberField(v, "page"),
        pageSize: numberField(v, "page_size") || numberField(v, "pageSize"),
        total: numberField(v, "total"),
    };
}

function decodeListResponse(raw: unknown): list_response {
    const v = record(raw);
    const itemsRaw = Array.isArray(v.items) ? v.items : [];
    return {
        names: stringListField(v, "names"),
        maxminddbGeoip: rawField(v, "maxminddb_geoip") ? fromJson(maxminddb_geoipSchema, rawField(v, "maxminddb_geoip"), { ignoreUnknownFields: true }) : undefined,
        refreshConfig: rawField(v, "refresh_config") ? fromJson(refresh_configSchema, rawField(v, "refresh_config"), { ignoreUnknownFields: true }) : undefined,
        page: pageResponse(v.page),
        items: itemsRaw.map((item): list_item => {
            const x = record(item);
            return {
                name: stringField(x, "name"),
                type: stringField(x, "type"),
                source: stringField(x, "source"),
                itemCount: numberField(x, "item_count"),
                errorCount: numberField(x, "error_count"),
                preview: stringField(x, "preview"),
            };
        }),
    };
}

function decodeRuleResponse(raw: unknown): rule_response {
    const v = record(raw);
    const itemsRaw = Array.isArray(v.items) ? v.items : [];
    return {
        names: stringListField(v, "names"),
        page: pageResponse(v.page),
        items: itemsRaw.map((item): rule_item => {
            const x = record(item);
            return {
                name: stringField(x, "name"),
                disabled: boolField(x, "disabled"),
                index: numberField(x, "index"),
                mode: stringField(x, "mode"),
                tag: stringField(x, "tag"),
                resolver: stringField(x, "resolver"),
                ruleCount: numberField(x, "rule_count"),
            };
        }),
    };
}

function decodeTestResponse(raw: unknown): test_response {
    const v = record(raw);
    return {
        mode: rawField(v, "mode") ? fromJson(mode_configSchema, rawField(v, "mode"), { ignoreUnknownFields: true }) : undefined,
        afterAddr: stringField(v, "after_addr"),
        matchResult: Array.isArray(v.match_result) ? v.match_result : [],
        lists: stringListField(v, "lists"),
        ips: stringListField(v, "ips"),
    };
}

function decodeBlockHistoryList(raw: unknown): block_history_list {
    const v = record(raw);
    const objectsRaw = Array.isArray(v.objects) ? v.objects : [];
    return {
        dumpProcessEnabled: boolField(v, "dump_process_enabled"),
        objects: objectsRaw.map((item): block_history => {
            const x = record(item);
            return {
                protocol: stringField(x, "protocol"),
                host: stringField(x, "host"),
                time: dateField(x, "time"),
                process: stringField(x, "process"),
                blockCount: uint64Field(x, "block_count"),
            };
        }),
    };
}

function decodeInboundsResponse(raw: unknown): inbounds_response {
    const v = record(raw);
    const itemsRaw = Array.isArray(v.items) ? v.items : [];
    return {
        names: stringListField(v, "names"),
        hijackDns: boolField(v, "hijack_dns"),
        hijackDnsFakeip: boolField(v, "hijack_dns_fakeip"),
        sniff: rawField(v, "sniff") ? fromJson(sniffSchema, rawField(v, "sniff"), { ignoreUnknownFields: true }) : undefined,
        page: pageResponse(v.page),
        items: itemsRaw.map((item): inbound_item => {
            const x = record(item);
            return {
                name: stringField(x, "name"),
                enabled: boolField(x, "enabled"),
                network: stringField(x, "network"),
                listen: stringField(x, "listen"),
                protocol: stringField(x, "protocol"),
                transports: stringListField(x, "transports"),
            };
        }),
    };
}

function decodePlatformInfoResponse(raw: unknown): platform_info_response {
    const v = record(raw);
    const darwin = record(v.darwin);
    return {
        darwin: v.darwin ? { networkServices: stringListField(darwin, "network_services") } : undefined,
    };
}

function decodeResolveList(raw: unknown): resolve_list {
    const v = record(raw);
    const itemsRaw = Array.isArray(v.items) ? v.items : [];
    return {
        names: stringListField(v, "names"),
        page: pageResponse(v.page),
        items: itemsRaw.map((item): resolver_item => {
            const x = record(item);
            return {
                name: stringField(x, "name"),
                type: stringField(x, "type"),
                host: stringField(x, "host"),
                subnet: stringField(x, "subnet"),
                tlsServername: stringField(x, "tls_servername"),
                system: boolField(x, "system"),
            };
        }),
    };
}

function decodeHosts(raw: unknown): Hosts {
    const hosts = record(record(raw).hosts);
    return {
        hosts: Object.fromEntries(Object.entries(hosts).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
    };
}

function decodeNowResp(raw: unknown): now_resp {
    const v = record(raw);
    return {
        tcp: rawField(v, "tcp") ? fromJson(pointSchema, rawField(v, "tcp"), { ignoreUnknownFields: true }) : undefined,
        udp: rawField(v, "udp") ? fromJson(pointSchema, rawField(v, "udp"), { ignoreUnknownFields: true }) : undefined,
    };
}

function decodeNodesResponse(raw: unknown): NodesResponse {
    const groupsRaw = Array.isArray(record(raw).groups) ? record(raw).groups : [];
    return {
        groups: groupsRaw.map((group): NodesResponse_Group => {
            const g = record(group);
            const nodesRaw = Array.isArray(g.nodes) ? g.nodes : [];
            return {
                name: stringField(g, "name"),
                nodes: nodesRaw.map((node): NodesResponse_Node => {
                    const n = record(node);
                    return { hash: stringField(n, "hash"), name: stringField(n, "name") };
                }),
            };
        }),
    };
}

function decodeActivatesResponse(raw: unknown): activates_response {
    const nodesRaw = Array.isArray(record(raw).nodes) ? record(raw).nodes : [];
    return {
        nodes: nodesRaw.map((node) => fromJson(pointSchema, node, { ignoreUnknownFields: true })),
    };
}

function decodeLatencyReply(raw: unknown): reply {
    const v = record(raw);
    const wrapped = record(firstRawField(v, "reply"));
    if (wrapped.case) return { reply: { case: stringOneOf(wrapped, "case"), value: firstRawField(wrapped, "value") ?? {} } };
    if (firstRawField(v, "reply") !== undefined) return decodeLatencyReply(wrapped);

    const latency = firstRawField(v, "latency");
    if (latency !== undefined) {
        const l = record(latency);
        return { reply: { case: "latency", value: { ...l, seconds: numberOneOf(l, "seconds"), nanos: numberOneOf(l, "nanos") } } };
    }

    const ip = firstRawField(v, "ip");
    if (ip !== undefined) {
        const i = record(ip);
        return { reply: { case: "ip", value: { ...i, ipv4: stringOneOf(i, "ipv4"), ipv6: stringOneOf(i, "ipv6") } } };
    }

    const stun = firstRawField(v, "stun");
    if (stun !== undefined) {
        const s = record(stun);
        return {
            reply: {
                case: "stun",
                value: {
                    ...s,
                    mappedAddress: stringOneOf(s, "mappedAddress", "mapped_address"),
                    Mapping: numberOneOf(s, "Mapping", "mapping"),
                    Filtering: numberOneOf(s, "Filtering", "filtering"),
                },
            },
        };
    }

    const err = firstRawField(v, "error");
    if (err !== undefined) {
        const e = record(err);
        return { reply: { case: "error", value: { ...e, msg: stringOneOf(e, "msg") || String(err) } } };
    }
    return { reply: { case: "error", value: { msg: "empty latency reply" } } };
}

function decodeLatencyResponse(raw: unknown): response {
    const v = record(raw);
    const rawMap = record(rawField(v, "idLatencyMap") ?? rawField(v, "id_latency_map"));
    return {
        idLatencyMap: Object.fromEntries(Object.entries(rawMap).map(([id, value]) => [id, decodeLatencyReply(value)])),
    };
}

function decodeGetLinksResp(raw: unknown): get_links_resp {
    const linksRaw = record(record(raw).links);
    return {
        links: Object.fromEntries(Object.entries(linksRaw).map(([name, value]) => [
            name,
            fromJson(linkSchema, value, { ignoreUnknownFields: true }),
        ])),
    };
}

function decodeListPublishResponse(raw: unknown): ListPublishResponse {
    const publishesRaw = record(record(raw).publishes);
    return {
        publishes: Object.fromEntries(Object.entries(publishesRaw).map(([name, value]) => [
            name,
            fromJson(PublishSchema, value, { ignoreUnknownFields: true }),
        ])),
    };
}

function decodePublishResponse(raw: unknown): PublishResponse {
    const pointsRaw = Array.isArray(record(raw).points) ? record(raw).points : [];
    return {
        points: pointsRaw.map((point) => fromJson(pointSchema, point, { ignoreUnknownFields: true })),
    };
}

function decodeTagsResponse(raw: unknown): tags_response {
    const v = record(raw);
    const tagsRaw = record(v.tags);
    const itemsRaw = Array.isArray(v.items) ? v.items : [];
    return {
        tags: Object.fromEntries(Object.entries(tagsRaw).map(([name, value]) => [
            name,
            normalizeTag(value),
        ])),
        items: itemsRaw.map((item): tag_item => {
            const x = record(item);
            const tagRaw = rawField(x, "tag");
            return {
                name: stringField(x, "name"),
                tag: tagRaw ? normalizeTag(tagRaw) : undefined,
            };
        }),
        page: pageResponse(v.page),
    };
}

function normalizeTag(raw: unknown): tags {
    const tagValue = fromJson(tagsSchema, raw, { ignoreUnknownFields: true });
    const v = record(tagValue);
    const hashRaw = rawField(v, "hash");
    return {
        ...tagValue,
        type: numberField(v, "type") as tag_type,
        hash: typeof hashRaw === "string" ? [hashRaw] : stringListField(v, "hash"),
    };
}

function counterRecord(raw: unknown): counter {
    const v = record(raw);
    return {
        download: uint64Field(v, "download"),
        upload: uint64Field(v, "upload"),
    };
}

function countersRecord(raw: unknown): { [key: string]: counter } {
    const v = record(raw);
    const out: { [key: string]: counter } = {};
    for (const [key, value] of Object.entries(v)) {
        out[key] = counterRecord(value);
    }
    return out;
}

function normalizeMatchHistory(raw: unknown): match_history_entry[] {
    return arrayOneOf({ value: raw }, "value").map((item) => {
        const v = record(item);
        return {
            ...v,
            ruleName: stringOneOf(v, "ruleName", "rule_name"),
            history: arrayOneOf(v, "history").map((history) => {
                const h = record(history);
                return {
                    ...h,
                    listName: stringOneOf(h, "listName", "list_name"),
                    matched: boolField(h, "matched"),
                };
            }),
        };
    });
}

export function normalizeConnection(raw: unknown): connection {
    const parsed = fromJson(connectionSchema, raw, { ignoreUnknownFields: true });
    const v = record(parsed);
    const rawType = firstRawField(v, "type");
    const netType = record(rawType);
    const matchHistoryRaw = arrayOneOf(v, "matchHistory", "match_history");

    return {
        ...parsed,
        addr: stringOneOf(v, "addr"),
        id: uint64OneOf(v, "id"),
        type: rawType === undefined ? undefined : {
            ...netType,
            connType: numberOneOf(netType, "connType", "conn_type"),
            underlyingType: numberOneOf(netType, "underlyingType", "underlying_type"),
        },
        source: stringOneOf(v, "source"),
        inbound: stringOneOf(v, "inbound"),
        inboundName: stringOneOf(v, "inboundName", "inbound_name"),
        interface: stringOneOf(v, "interface"),
        outbound: stringOneOf(v, "outbound"),
        localAddr: stringOneOf(v, "localAddr", "local_addr", "LocalAddr"),
        destionation: stringOneOf(v, "destionation"),
        fakeIp: stringOneOf(v, "fakeIp", "fake_ip"),
        hosts: stringOneOf(v, "hosts"),
        domain: stringOneOf(v, "domain"),
        ip: stringOneOf(v, "ip"),
        tag: stringOneOf(v, "tag"),
        hash: stringOneOf(v, "hash"),
        nodeName: stringOneOf(v, "nodeName", "node_name"),
        protocol: stringOneOf(v, "protocol"),
        process: stringOneOf(v, "process"),
        pid: uint64OneOf(v, "pid"),
        uid: uint64OneOf(v, "uid"),
        tlsServerName: stringOneOf(v, "tlsServerName", "tls_server_name"),
        httpHost: stringOneOf(v, "httpHost", "http_host"),
        component: stringOneOf(v, "component"),
        udpMigrateId: uint64OneOf(v, "udpMigrateId", "udp_migrate_id"),
        mode: firstRawField(v, "mode") === undefined ? undefined : numberOneOf(v, "mode"),
        matchHistory: matchHistoryRaw.length > 0 ? normalizeMatchHistory(matchHistoryRaw) : undefined,
        resolver: stringOneOf(v, "resolver"),
        geo: stringOneOf(v, "geo"),
        outboundGeo: stringOneOf(v, "outboundGeo", "outbound_geo"),
        lists: stringListOneOf(v, "lists"),
    };
}

function connectionField(raw: unknown): connection | undefined {
    if (raw === null || raw === undefined) return undefined;
    return normalizeConnection(raw);
}

export type counter = {
    download: bigint;
    upload: bigint;
};

export type total_flow = {
    download: bigint;
    upload: bigint;
    counters: { [key: string]: counter };
};

export type notify_new_connections = {
    connections: connection[];
};

export type notify_remove_connections = {
    ids: bigint[];
};

export type notify_data =
    | { data: { case: "totalFlow"; value: total_flow } }
    | { data: { case: "notifyNewConnections"; value: notify_new_connections } }
    | { data: { case: "notifyRemoveConnections"; value: notify_remove_connections } };

export type failed_history = {
    protocol: conn_type;
    host: string;
    error: string;
    process: string;
    time?: Date;
    failedCount: bigint;
};

export type all_history = {
    connection?: connection;
    count: bigint;
    time?: Date;
};

export const connectionTotalRoute: JsonRoute<total_flow> = {
    key: "/api/v1/connections/total",
    path: "/api/v1/connections/total",
    decode(raw): total_flow {
        const v = record(raw);
        return {
            download: uint64Field(v, "download"),
            upload: uint64Field(v, "upload"),
            counters: countersRecord(v.counters),
        };
    },
};

export const failedHistoryRoute: JsonRoute<{ objects: failed_history[]; dumpProcessEnabled: boolean }> = {
    key: "/api/v1/connections/failed-history",
    path: "/api/v1/connections/failed-history",
    decode(raw) {
        const v = record(raw);
        const objectsRaw = Array.isArray(v.objects) ? v.objects : [];
        return {
            dumpProcessEnabled: Boolean(v.dump_process_enabled),
            objects: objectsRaw.map((item): failed_history => {
                const x = record(item);
                return {
                    protocol: Number(uint64Field(x, "protocol")) as conn_type,
                    host: stringField(x, "host"),
                    error: stringField(x, "error"),
                    process: stringField(x, "process"),
                    time: dateField(x, "time"),
                    failedCount: uint64Field(x, "failed_count"),
                };
            }),
        };
    },
};

export const allHistoryRoute: JsonRoute<{ objects: all_history[]; dumpProcessEnabled: boolean }> = {
    key: "/api/v1/connections/history",
    path: "/api/v1/connections/history",
    decode(raw) {
        const v = record(raw);
        const objectsRaw = Array.isArray(v.objects) ? v.objects : [];
        return {
            dumpProcessEnabled: Boolean(v.dump_process_enabled),
            objects: objectsRaw.map((item): all_history => {
                const x = record(item);
                return {
                    connection: connectionField(x.connection),
                    count: uint64Field(x, "count"),
                    time: dateField(x, "time"),
                };
            }),
        };
    },
};
