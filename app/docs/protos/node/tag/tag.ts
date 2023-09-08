/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.tag";

export enum tag_type {
  node = 0,
  mirror = 1,
  UNRECOGNIZED = -1,
}

export function tag_typeFromJSON(object: any): tag_type {
  switch (object) {
    case 0:
    case "node":
      return tag_type.node;
    case 1:
    case "mirror":
      return tag_type.mirror;
    case -1:
    case "UNRECOGNIZED":
    default:
      return tag_type.UNRECOGNIZED;
  }
}

export function tag_typeToJSON(object: tag_type): string {
  switch (object) {
    case tag_type.node:
      return "node";
    case tag_type.mirror:
      return "mirror";
    case tag_type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface tags {
  tag: string;
  type: tag_type;
  hash: string[];
}

function createBasetags(): tags {
  return { tag: "", type: 0, hash: [] };
}

export const tags = {
  encode(message: tags, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tag !== "") {
      writer.uint32(10).string(message.tag);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    for (const v of message.hash) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): tags {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetags();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tag = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.hash.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): tags {
    return {
      tag: isSet(object.tag) ? String(object.tag) : "",
      type: isSet(object.type) ? tag_typeFromJSON(object.type) : 0,
      hash: Array.isArray(object?.hash) ? object.hash.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: tags): unknown {
    const obj: any = {};
    if (message.tag !== "") {
      obj.tag = message.tag;
    }
    if (message.type !== 0) {
      obj.type = tag_typeToJSON(message.type);
    }
    if (message.hash?.length) {
      obj.hash = message.hash;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<tags>, I>>(base?: I): tags {
    return tags.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<tags>, I>>(object: I): tags {
    const message = createBasetags();
    message.tag = object.tag ?? "";
    message.type = object.type ?? 0;
    message.hash = object.hash?.map((e) => e) || [];
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
