/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.statistic";

/**
 * "tcp", "tcp4", "tcp6"
 * "udp", "udp4", "udp6"
 * "ip", "ip4", "ip6"
 * "unix", "unixgram", "unixpacket"
 */
export enum type {
  unknown = 0,
  tcp = 1,
  tcp4 = 2,
  tcp6 = 3,
  udp = 4,
  udp4 = 5,
  udp6 = 6,
  ip = 7,
  ip4 = 8,
  ip6 = 9,
  unix = 10,
  unixgram = 11,
  unixpacket = 12,
  UNRECOGNIZED = -1,
}

export function typeFromJSON(object: any): type {
  switch (object) {
    case 0:
    case "unknown":
      return type.unknown;
    case 1:
    case "tcp":
      return type.tcp;
    case 2:
    case "tcp4":
      return type.tcp4;
    case 3:
    case "tcp6":
      return type.tcp6;
    case 4:
    case "udp":
      return type.udp;
    case 5:
    case "udp4":
      return type.udp4;
    case 6:
    case "udp6":
      return type.udp6;
    case 7:
    case "ip":
      return type.ip;
    case 8:
    case "ip4":
      return type.ip4;
    case 9:
    case "ip6":
      return type.ip6;
    case 10:
    case "unix":
      return type.unix;
    case 11:
    case "unixgram":
      return type.unixgram;
    case 12:
    case "unixpacket":
      return type.unixpacket;
    case -1:
    case "UNRECOGNIZED":
    default:
      return type.UNRECOGNIZED;
  }
}

export function typeToJSON(object: type): string {
  switch (object) {
    case type.unknown:
      return "unknown";
    case type.tcp:
      return "tcp";
    case type.tcp4:
      return "tcp4";
    case type.tcp6:
      return "tcp6";
    case type.udp:
      return "udp";
    case type.udp4:
      return "udp4";
    case type.udp6:
      return "udp6";
    case type.ip:
      return "ip";
    case type.ip4:
      return "ip4";
    case type.ip6:
      return "ip6";
    case type.unix:
      return "unix";
    case type.unixgram:
      return "unixgram";
    case type.unixpacket:
      return "unixpacket";
    case type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface net_type {
  conn_type: type;
  underlying_type: type;
}

export interface connection {
  addr: string;
  id: number;
  type: net_type | undefined;
  extra: { [key: string]: string };
}

export interface connection_ExtraEntry {
  key: string;
  value: string;
}

function createBasenet_type(): net_type {
  return { conn_type: 0, underlying_type: 0 };
}

export const net_type = {
  encode(message: net_type, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.conn_type !== 0) {
      writer.uint32(8).int32(message.conn_type);
    }
    if (message.underlying_type !== 0) {
      writer.uint32(16).int32(message.underlying_type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): net_type {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenet_type();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.conn_type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.underlying_type = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): net_type {
    return {
      conn_type: isSet(object.conn_type) ? typeFromJSON(object.conn_type) : 0,
      underlying_type: isSet(object.underlying_type) ? typeFromJSON(object.underlying_type) : 0,
    };
  },

  toJSON(message: net_type): unknown {
    const obj: any = {};
    if (message.conn_type !== 0) {
      obj.conn_type = typeToJSON(message.conn_type);
    }
    if (message.underlying_type !== 0) {
      obj.underlying_type = typeToJSON(message.underlying_type);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<net_type>, I>>(base?: I): net_type {
    return net_type.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<net_type>, I>>(object: I): net_type {
    const message = createBasenet_type();
    message.conn_type = object.conn_type ?? 0;
    message.underlying_type = object.underlying_type ?? 0;
    return message;
  },
};

function createBaseconnection(): connection {
  return { addr: "", id: 0, type: undefined, extra: {} };
}

export const connection = {
  encode(message: connection, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.addr !== "") {
      writer.uint32(10).string(message.addr);
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id);
    }
    if (message.type !== undefined) {
      net_type.encode(message.type, writer.uint32(26).fork()).ldelim();
    }
    Object.entries(message.extra).forEach(([key, value]) => {
      connection_ExtraEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): connection {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseconnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.addr = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.type = net_type.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = connection_ExtraEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.extra[entry4.key] = entry4.value;
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

  fromJSON(object: any): connection {
    return {
      addr: isSet(object.addr) ? String(object.addr) : "",
      id: isSet(object.id) ? Number(object.id) : 0,
      type: isSet(object.type) ? net_type.fromJSON(object.type) : undefined,
      extra: isObject(object.extra)
        ? Object.entries(object.extra).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: connection): unknown {
    const obj: any = {};
    if (message.addr !== "") {
      obj.addr = message.addr;
    }
    if (message.id !== 0) {
      obj.id = Math.round(message.id);
    }
    if (message.type !== undefined) {
      obj.type = net_type.toJSON(message.type);
    }
    if (message.extra) {
      const entries = Object.entries(message.extra);
      if (entries.length > 0) {
        obj.extra = {};
        entries.forEach(([k, v]) => {
          obj.extra[k] = v;
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<connection>, I>>(base?: I): connection {
    return connection.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<connection>, I>>(object: I): connection {
    const message = createBaseconnection();
    message.addr = object.addr ?? "";
    message.id = object.id ?? 0;
    message.type = (object.type !== undefined && object.type !== null) ? net_type.fromPartial(object.type) : undefined;
    message.extra = Object.entries(object.extra ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseconnection_ExtraEntry(): connection_ExtraEntry {
  return { key: "", value: "" };
}

export const connection_ExtraEntry = {
  encode(message: connection_ExtraEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): connection_ExtraEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseconnection_ExtraEntry();
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

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): connection_ExtraEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: connection_ExtraEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<connection_ExtraEntry>, I>>(base?: I): connection_ExtraEntry {
    return connection_ExtraEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<connection_ExtraEntry>, I>>(object: I): connection_ExtraEntry {
    const message = createBaseconnection_ExtraEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
