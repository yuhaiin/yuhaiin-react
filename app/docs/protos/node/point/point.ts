/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { protocol } from "../protocol/protocol";

export const protobufPackage = "yuhaiin.point";

export enum origin {
  reserve = 0,
  remote = 101,
  manual = 102,
  UNRECOGNIZED = -1,
}

export function originFromJSON(object: any): origin {
  switch (object) {
    case 0:
    case "reserve":
      return origin.reserve;
    case 101:
    case "remote":
      return origin.remote;
    case 102:
    case "manual":
      return origin.manual;
    case -1:
    case "UNRECOGNIZED":
    default:
      return origin.UNRECOGNIZED;
  }
}

export function originToJSON(object: origin): string {
  switch (object) {
    case origin.reserve:
      return "reserve";
    case origin.remote:
      return "remote";
    case origin.manual:
      return "manual";
    case origin.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface point {
  hash: string;
  name: string;
  group: string;
  origin: origin;
  /** will use protocols' order to create dialer */
  protocols: protocol[];
}

function createBasepoint(): point {
  return { hash: "", name: "", group: "", origin: 0, protocols: [] };
}

export const point = {
  encode(message: point, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hash !== "") {
      writer.uint32(10).string(message.hash);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.group !== "") {
      writer.uint32(26).string(message.group);
    }
    if (message.origin !== 0) {
      writer.uint32(32).int32(message.origin);
    }
    for (const v of message.protocols) {
      protocol.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): point {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasepoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
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

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.group = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.origin = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.protocols.push(protocol.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): point {
    return {
      hash: isSet(object.hash) ? String(object.hash) : "",
      name: isSet(object.name) ? String(object.name) : "",
      group: isSet(object.group) ? String(object.group) : "",
      origin: isSet(object.origin) ? originFromJSON(object.origin) : 0,
      protocols: Array.isArray(object?.protocols) ? object.protocols.map((e: any) => protocol.fromJSON(e)) : [],
    };
  },

  toJSON(message: point): unknown {
    const obj: any = {};
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.group !== "") {
      obj.group = message.group;
    }
    if (message.origin !== 0) {
      obj.origin = originToJSON(message.origin);
    }
    if (message.protocols?.length) {
      obj.protocols = message.protocols.map((e) => protocol.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<point>, I>>(base?: I): point {
    return point.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<point>, I>>(object: I): point {
    const message = createBasepoint();
    message.hash = object.hash ?? "";
    message.name = object.name ?? "";
    message.group = object.group ?? "";
    message.origin = object.origin ?? 0;
    message.protocols = object.protocols?.map((e) => protocol.fromPartial(e)) || [];
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
