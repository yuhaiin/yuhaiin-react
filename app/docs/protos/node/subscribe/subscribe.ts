/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.subscribe";

export enum type {
  reserve = 0,
  trojan = 1,
  vmess = 2,
  shadowsocks = 3,
  shadowsocksr = 4,
  UNRECOGNIZED = -1,
}

export function typeFromJSON(object: any): type {
  switch (object) {
    case 0:
    case "reserve":
      return type.reserve;
    case 1:
    case "trojan":
      return type.trojan;
    case 2:
    case "vmess":
      return type.vmess;
    case 3:
    case "shadowsocks":
      return type.shadowsocks;
    case 4:
    case "shadowsocksr":
      return type.shadowsocksr;
    case -1:
    case "UNRECOGNIZED":
    default:
      return type.UNRECOGNIZED;
  }
}

export function typeToJSON(object: type): string {
  switch (object) {
    case type.reserve:
      return "reserve";
    case type.trojan:
      return "trojan";
    case type.vmess:
      return "vmess";
    case type.shadowsocks:
      return "shadowsocks";
    case type.shadowsocksr:
      return "shadowsocksr";
    case type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface link {
  name: string;
  type: type;
  url: string;
}

function createBaselink(): link {
  return { name: "", type: 0, url: "" };
}

export const link = {
  encode(message: link, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }
    if (message.url !== "") {
      writer.uint32(26).string(message.url);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): link {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaselink();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): link {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      type: isSet(object.type) ? typeFromJSON(object.type) : 0,
      url: isSet(object.url) ? String(object.url) : "",
    };
  },

  toJSON(message: link): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.type !== 0) {
      obj.type = typeToJSON(message.type);
    }
    if (message.url !== "") {
      obj.url = message.url;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<link>, I>>(base?: I): link {
    return link.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<link>, I>>(object: I): link {
    const message = createBaselink();
    message.name = object.name ?? "";
    message.type = object.type ?? 0;
    message.url = object.url ?? "";
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
