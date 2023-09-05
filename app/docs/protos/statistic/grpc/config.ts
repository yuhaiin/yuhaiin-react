/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { connection } from "../config";

export const protobufPackage = "yuhaiin.protos.statistic.service";

export interface total_flow {
  download: number;
  upload: number;
}

export interface notify_data {
  data?:
    | { $case: "total_flow"; total_flow: total_flow }
    | { $case: "notify_new_connections"; notify_new_connections: notify_new_connections }
    | { $case: "notify_remove_connections"; notify_remove_connections: notify_remove_connections }
    | undefined;
}

export interface notify_new_connections {
  connections: connection[];
}

export interface notify_remove_connections {
  ids: number[];
}

function createBasetotal_flow(): total_flow {
  return { download: 0, upload: 0 };
}

export const total_flow = {
  encode(message: total_flow, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.download !== 0) {
      writer.uint32(8).uint64(message.download);
    }
    if (message.upload !== 0) {
      writer.uint32(16).uint64(message.upload);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): total_flow {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetotal_flow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.download = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.upload = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): total_flow {
    return {
      download: isSet(object.download) ? Number(object.download) : 0,
      upload: isSet(object.upload) ? Number(object.upload) : 0,
    };
  },

  toJSON(message: total_flow): unknown {
    const obj: any = {};
    if (message.download !== 0) {
      obj.download = Math.round(message.download);
    }
    if (message.upload !== 0) {
      obj.upload = Math.round(message.upload);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<total_flow>, I>>(base?: I): total_flow {
    return total_flow.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<total_flow>, I>>(object: I): total_flow {
    const message = createBasetotal_flow();
    message.download = object.download ?? 0;
    message.upload = object.upload ?? 0;
    return message;
  },
};

function createBasenotify_data(): notify_data {
  return { data: undefined };
}

export const notify_data = {
  encode(message: notify_data, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.data?.$case) {
      case "total_flow":
        total_flow.encode(message.data.total_flow, writer.uint32(26).fork()).ldelim();
        break;
      case "notify_new_connections":
        notify_new_connections.encode(message.data.notify_new_connections, writer.uint32(10).fork()).ldelim();
        break;
      case "notify_remove_connections":
        notify_remove_connections.encode(message.data.notify_remove_connections, writer.uint32(18).fork()).ldelim();
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): notify_data {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenotify_data();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }

          message.data = { $case: "total_flow", total_flow: total_flow.decode(reader, reader.uint32()) };
          continue;
        case 1:
          if (tag !== 10) {
            break;
          }

          message.data = {
            $case: "notify_new_connections",
            notify_new_connections: notify_new_connections.decode(reader, reader.uint32()),
          };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.data = {
            $case: "notify_remove_connections",
            notify_remove_connections: notify_remove_connections.decode(reader, reader.uint32()),
          };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): notify_data {
    return {
      data: isSet(object.total_flow)
        ? { $case: "total_flow", total_flow: total_flow.fromJSON(object.total_flow) }
        : isSet(object.notify_new_connections)
        ? {
          $case: "notify_new_connections",
          notify_new_connections: notify_new_connections.fromJSON(object.notify_new_connections),
        }
        : isSet(object.notify_remove_connections)
        ? {
          $case: "notify_remove_connections",
          notify_remove_connections: notify_remove_connections.fromJSON(object.notify_remove_connections),
        }
        : undefined,
    };
  },

  toJSON(message: notify_data): unknown {
    const obj: any = {};
    if (message.data?.$case === "total_flow") {
      obj.total_flow = total_flow.toJSON(message.data.total_flow);
    }
    if (message.data?.$case === "notify_new_connections") {
      obj.notify_new_connections = notify_new_connections.toJSON(message.data.notify_new_connections);
    }
    if (message.data?.$case === "notify_remove_connections") {
      obj.notify_remove_connections = notify_remove_connections.toJSON(message.data.notify_remove_connections);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<notify_data>, I>>(base?: I): notify_data {
    return notify_data.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<notify_data>, I>>(object: I): notify_data {
    const message = createBasenotify_data();
    if (
      object.data?.$case === "total_flow" && object.data?.total_flow !== undefined && object.data?.total_flow !== null
    ) {
      message.data = { $case: "total_flow", total_flow: total_flow.fromPartial(object.data.total_flow) };
    }
    if (
      object.data?.$case === "notify_new_connections" &&
      object.data?.notify_new_connections !== undefined &&
      object.data?.notify_new_connections !== null
    ) {
      message.data = {
        $case: "notify_new_connections",
        notify_new_connections: notify_new_connections.fromPartial(object.data.notify_new_connections),
      };
    }
    if (
      object.data?.$case === "notify_remove_connections" &&
      object.data?.notify_remove_connections !== undefined &&
      object.data?.notify_remove_connections !== null
    ) {
      message.data = {
        $case: "notify_remove_connections",
        notify_remove_connections: notify_remove_connections.fromPartial(object.data.notify_remove_connections),
      };
    }
    return message;
  },
};

function createBasenotify_new_connections(): notify_new_connections {
  return { connections: [] };
}

export const notify_new_connections = {
  encode(message: notify_new_connections, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.connections) {
      connection.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): notify_new_connections {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenotify_new_connections();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.connections.push(connection.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): notify_new_connections {
    return {
      connections: Array.isArray(object?.connections) ? object.connections.map((e: any) => connection.fromJSON(e)) : [],
    };
  },

  toJSON(message: notify_new_connections): unknown {
    const obj: any = {};
    if (message.connections?.length) {
      obj.connections = message.connections.map((e) => connection.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<notify_new_connections>, I>>(base?: I): notify_new_connections {
    return notify_new_connections.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<notify_new_connections>, I>>(object: I): notify_new_connections {
    const message = createBasenotify_new_connections();
    message.connections = object.connections?.map((e) => connection.fromPartial(e)) || [];
    return message;
  },
};

function createBasenotify_remove_connections(): notify_remove_connections {
  return { ids: [] };
}

export const notify_remove_connections = {
  encode(message: notify_remove_connections, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): notify_remove_connections {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenotify_remove_connections();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.ids.push(longToNumber(reader.uint64() as Long));

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(longToNumber(reader.uint64() as Long));
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): notify_remove_connections {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Number(e)) : [] };
  },

  toJSON(message: notify_remove_connections): unknown {
    const obj: any = {};
    if (message.ids?.length) {
      obj.ids = message.ids.map((e) => Math.round(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<notify_remove_connections>, I>>(base?: I): notify_remove_connections {
    return notify_remove_connections.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<notify_remove_connections>, I>>(object: I): notify_remove_connections {
    const message = createBasenotify_remove_connections();
    message.ids = object.ids?.map((e) => e) || [];
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
