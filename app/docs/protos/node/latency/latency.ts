/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Duration } from "../../google/protobuf/duration";

export const protobufPackage = "yuhaiin.latency";

export interface http {
  url: string;
}

export interface dns {
  host: string;
  target_domain: string;
}

export interface dns_over_quic {
  host: string;
  target_domain: string;
}

export interface protocol {
  protocol?: { $case: "http"; http: http } | { $case: "dns"; dns: dns } | {
    $case: "dns_over_quic";
    dns_over_quic: dns_over_quic;
  } | undefined;
}

export interface request {
  id: string;
  hash: string;
  protocol: protocol | undefined;
}

export interface requests {
  requests: request[];
}

export interface response {
  id_latency_map: { [key: string]: Duration };
}

export interface response_IdLatencyMapEntry {
  key: string;
  value: Duration | undefined;
}

function createBasehttp(): http {
  return { url: "" };
}

export const http = {
  encode(message: http, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): http {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasehttp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.url = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): http {
    return { url: isSet(object.url) ? String(object.url) : "" };
  },

  toJSON(message: http): unknown {
    const obj: any = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<http>, I>>(base?: I): http {
    return http.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<http>, I>>(object: I): http {
    const message = createBasehttp();
    message.url = object.url ?? "";
    return message;
  },
};

function createBasedns(): dns {
  return { host: "", target_domain: "" };
}

export const dns = {
  encode(message: dns, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.target_domain !== "") {
      writer.uint32(18).string(message.target_domain);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): dns {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasedns();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target_domain = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): dns {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      target_domain: isSet(object.target_name) ? String(object.target_name) : "",
    };
  },

  toJSON(message: dns): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.target_domain !== "") {
      obj.target_name = message.target_domain;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<dns>, I>>(base?: I): dns {
    return dns.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<dns>, I>>(object: I): dns {
    const message = createBasedns();
    message.host = object.host ?? "";
    message.target_domain = object.target_domain ?? "";
    return message;
  },
};

function createBasedns_over_quic(): dns_over_quic {
  return { host: "", target_domain: "" };
}

export const dns_over_quic = {
  encode(message: dns_over_quic, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.target_domain !== "") {
      writer.uint32(18).string(message.target_domain);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): dns_over_quic {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasedns_over_quic();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target_domain = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): dns_over_quic {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      target_domain: isSet(object.target_name) ? String(object.target_name) : "",
    };
  },

  toJSON(message: dns_over_quic): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.target_domain !== "") {
      obj.target_name = message.target_domain;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<dns_over_quic>, I>>(base?: I): dns_over_quic {
    return dns_over_quic.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<dns_over_quic>, I>>(object: I): dns_over_quic {
    const message = createBasedns_over_quic();
    message.host = object.host ?? "";
    message.target_domain = object.target_domain ?? "";
    return message;
  },
};

function createBaseprotocol(): protocol {
  return { protocol: undefined };
}

export const protocol = {
  encode(message: protocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.protocol?.$case) {
      case "http":
        http.encode(message.protocol.http, writer.uint32(10).fork()).ldelim();
        break;
      case "dns":
        dns.encode(message.protocol.dns, writer.uint32(18).fork()).ldelim();
        break;
      case "dns_over_quic":
        dns_over_quic.encode(message.protocol.dns_over_quic, writer.uint32(26).fork()).ldelim();
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): protocol {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseprotocol();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.protocol = { $case: "http", http: http.decode(reader, reader.uint32()) };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.protocol = { $case: "dns", dns: dns.decode(reader, reader.uint32()) };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.protocol = { $case: "dns_over_quic", dns_over_quic: dns_over_quic.decode(reader, reader.uint32()) };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): protocol {
    return {
      protocol: isSet(object.http)
        ? { $case: "http", http: http.fromJSON(object.http) }
        : isSet(object.dns)
        ? { $case: "dns", dns: dns.fromJSON(object.dns) }
        : isSet(object.dns_over_quic)
        ? { $case: "dns_over_quic", dns_over_quic: dns_over_quic.fromJSON(object.dns_over_quic) }
        : undefined,
    };
  },

  toJSON(message: protocol): unknown {
    const obj: any = {};
    if (message.protocol?.$case === "http") {
      obj.http = http.toJSON(message.protocol.http);
    }
    if (message.protocol?.$case === "dns") {
      obj.dns = dns.toJSON(message.protocol.dns);
    }
    if (message.protocol?.$case === "dns_over_quic") {
      obj.dns_over_quic = dns_over_quic.toJSON(message.protocol.dns_over_quic);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<protocol>, I>>(base?: I): protocol {
    return protocol.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<protocol>, I>>(object: I): protocol {
    const message = createBaseprotocol();
    if (object.protocol?.$case === "http" && object.protocol?.http !== undefined && object.protocol?.http !== null) {
      message.protocol = { $case: "http", http: http.fromPartial(object.protocol.http) };
    }
    if (object.protocol?.$case === "dns" && object.protocol?.dns !== undefined && object.protocol?.dns !== null) {
      message.protocol = { $case: "dns", dns: dns.fromPartial(object.protocol.dns) };
    }
    if (
      object.protocol?.$case === "dns_over_quic" &&
      object.protocol?.dns_over_quic !== undefined &&
      object.protocol?.dns_over_quic !== null
    ) {
      message.protocol = {
        $case: "dns_over_quic",
        dns_over_quic: dns_over_quic.fromPartial(object.protocol.dns_over_quic),
      };
    }
    return message;
  },
};

function createBaserequest(): request {
  return { id: "", hash: "", protocol: undefined };
}

export const request = {
  encode(message: request, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(26).string(message.id);
    }
    if (message.hash !== "") {
      writer.uint32(10).string(message.hash);
    }
    if (message.protocol !== undefined) {
      protocol.encode(message.protocol, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): request {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaserequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }

          message.id = reader.string();
          continue;
        case 1:
          if (tag !== 10) {
            break;
          }

          message.hash = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.protocol = protocol.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): request {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      hash: isSet(object.hash) ? String(object.hash) : "",
      protocol: isSet(object.protocol) ? protocol.fromJSON(object.protocol) : undefined,
    };
  },

  toJSON(message: request): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    if (message.protocol !== undefined) {
      obj.protocol = protocol.toJSON(message.protocol);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<request>, I>>(base?: I): request {
    return request.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<request>, I>>(object: I): request {
    const message = createBaserequest();
    message.id = object.id ?? "";
    message.hash = object.hash ?? "";
    message.protocol = (object.protocol !== undefined && object.protocol !== null)
      ? protocol.fromPartial(object.protocol)
      : undefined;
    return message;
  },
};

function createBaserequests(): requests {
  return { requests: [] };
}

export const requests = {
  encode(message: requests, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.requests) {
      request.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): requests {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaserequests();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requests.push(request.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): requests {
    return { requests: Array.isArray(object?.requests) ? object.requests.map((e: any) => request.fromJSON(e)) : [] };
  },

  toJSON(message: requests): unknown {
    const obj: any = {};
    if (message.requests?.length) {
      obj.requests = message.requests.map((e) => request.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<requests>, I>>(base?: I): requests {
    return requests.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<requests>, I>>(object: I): requests {
    const message = createBaserequests();
    message.requests = object.requests?.map((e) => request.fromPartial(e)) || [];
    return message;
  },
};

function createBaseresponse(): response {
  return { id_latency_map: {} };
}

export const response = {
  encode(message: response, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.id_latency_map).forEach(([key, value]) => {
      response_IdLatencyMapEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): response {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseresponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = response_IdLatencyMapEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.id_latency_map[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): response {
    return {
      id_latency_map: isObject(object.id_latency_map)
        ? Object.entries(object.id_latency_map).reduce<{ [key: string]: Duration }>((acc, [key, value]) => {
          acc[key] = Duration.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: response): unknown {
    const obj: any = {};
    if (message.id_latency_map) {
      const entries = Object.entries(message.id_latency_map);
      if (entries.length > 0) {
        obj.id_latency_map = {};
        entries.forEach(([k, v]) => {
          obj.id_latency_map[k] = Duration.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<response>, I>>(base?: I): response {
    return response.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<response>, I>>(object: I): response {
    const message = createBaseresponse();
    message.id_latency_map = Object.entries(object.id_latency_map ?? {}).reduce<{ [key: string]: Duration }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = Duration.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseresponse_IdLatencyMapEntry(): response_IdLatencyMapEntry {
  return { key: "", value: undefined };
}

export const response_IdLatencyMapEntry = {
  encode(message: response_IdLatencyMapEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Duration.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): response_IdLatencyMapEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseresponse_IdLatencyMapEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = Duration.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): response_IdLatencyMapEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? Duration.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: response_IdLatencyMapEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = Duration.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<response_IdLatencyMapEntry>, I>>(base?: I): response_IdLatencyMapEntry {
    return response_IdLatencyMapEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<response_IdLatencyMapEntry>, I>>(object: I): response_IdLatencyMapEntry {
    const message = createBaseresponse_IdLatencyMapEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? Duration.fromPartial(object.value)
      : undefined;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
