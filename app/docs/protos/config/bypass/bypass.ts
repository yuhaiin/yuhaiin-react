/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.bypass";

export enum mode {
  bypass = 0,
  direct = 1,
  proxy = 2,
  block = 3,
  UNRECOGNIZED = -1,
}

export function modeFromJSON(object: any): mode {
  switch (object) {
    case 0:
    case "bypass":
      return mode.bypass;
    case 1:
    case "direct":
      return mode.direct;
    case 2:
    case "proxy":
      return mode.proxy;
    case 3:
    case "block":
      return mode.block;
    case -1:
    case "UNRECOGNIZED":
    default:
      return mode.UNRECOGNIZED;
  }
}

export function modeToJSON(object: mode): string {
  switch (object) {
    case mode.bypass:
      return "bypass";
    case mode.direct:
      return "direct";
    case mode.proxy:
      return "proxy";
    case mode.block:
      return "block";
    case mode.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum resolve_strategy {
  default = 0,
  prefer_ipv4 = 1,
  only_ipv4 = 2,
  prefer_ipv6 = 3,
  only_ipv6 = 4,
  UNRECOGNIZED = -1,
}

export function resolve_strategyFromJSON(object: any): resolve_strategy {
  switch (object) {
    case 0:
    case "default":
      return resolve_strategy.default;
    case 1:
    case "prefer_ipv4":
      return resolve_strategy.prefer_ipv4;
    case 2:
    case "only_ipv4":
      return resolve_strategy.only_ipv4;
    case 3:
    case "prefer_ipv6":
      return resolve_strategy.prefer_ipv6;
    case 4:
    case "only_ipv6":
      return resolve_strategy.only_ipv6;
    case -1:
    case "UNRECOGNIZED":
    default:
      return resolve_strategy.UNRECOGNIZED;
  }
}

export function resolve_strategyToJSON(object: resolve_strategy): string {
  switch (object) {
    case resolve_strategy.default:
      return "default";
    case resolve_strategy.prefer_ipv4:
      return "prefer_ipv4";
    case resolve_strategy.only_ipv4:
      return "only_ipv4";
    case resolve_strategy.prefer_ipv6:
      return "prefer_ipv6";
    case resolve_strategy.only_ipv6:
      return "only_ipv6";
    case resolve_strategy.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface bypass_config {
  tcp: mode;
  udp: mode;
  bypass_file: string;
  custom_rule_v3: mode_config[];
}

export interface mode_config {
  hostname: string[];
  mode: mode;
  tag: string;
  resolve_strategy: resolve_strategy;
}

function createBasebypass_config(): bypass_config {
  return { tcp: 0, udp: 0, bypass_file: "", custom_rule_v3: [] };
}

export const bypass_config = {
  encode(message: bypass_config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tcp !== 0) {
      writer.uint32(24).int32(message.tcp);
    }
    if (message.udp !== 0) {
      writer.uint32(32).int32(message.udp);
    }
    if (message.bypass_file !== "") {
      writer.uint32(18).string(message.bypass_file);
    }
    for (const v of message.custom_rule_v3) {
      mode_config.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): bypass_config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasebypass_config();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 24) {
            break;
          }

          message.tcp = reader.int32() as any;
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.udp = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.bypass_file = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.custom_rule_v3.push(mode_config.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): bypass_config {
    return {
      tcp: isSet(object.tcp) ? modeFromJSON(object.tcp) : 0,
      udp: isSet(object.udp) ? modeFromJSON(object.udp) : 0,
      bypass_file: isSet(object.bypass_file) ? String(object.bypass_file) : "",
      custom_rule_v3: Array.isArray(object?.custom_rule_v3)
        ? object.custom_rule_v3.map((e: any) => mode_config.fromJSON(e))
        : [],
    };
  },

  toJSON(message: bypass_config): unknown {
    const obj: any = {};
    if (message.tcp !== 0) {
      obj.tcp = modeToJSON(message.tcp);
    }
    if (message.udp !== 0) {
      obj.udp = modeToJSON(message.udp);
    }
    if (message.bypass_file !== "") {
      obj.bypass_file = message.bypass_file;
    }
    if (message.custom_rule_v3?.length) {
      obj.custom_rule_v3 = message.custom_rule_v3.map((e) => mode_config.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<bypass_config>, I>>(base?: I): bypass_config {
    return bypass_config.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<bypass_config>, I>>(object: I): bypass_config {
    const message = createBasebypass_config();
    message.tcp = object.tcp ?? 0;
    message.udp = object.udp ?? 0;
    message.bypass_file = object.bypass_file ?? "";
    message.custom_rule_v3 = object.custom_rule_v3?.map((e) => mode_config.fromPartial(e)) || [];
    return message;
  },
};

function createBasemode_config(): mode_config {
  return { hostname: [], mode: 0, tag: "", resolve_strategy: 0 };
}

export const mode_config = {
  encode(message: mode_config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.hostname) {
      writer.uint32(26).string(v!);
    }
    if (message.mode !== 0) {
      writer.uint32(8).int32(message.mode);
    }
    if (message.tag !== "") {
      writer.uint32(18).string(message.tag);
    }
    if (message.resolve_strategy !== 0) {
      writer.uint32(32).int32(message.resolve_strategy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): mode_config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasemode_config();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }

          message.hostname.push(reader.string());
          continue;
        case 1:
          if (tag !== 8) {
            break;
          }

          message.mode = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.tag = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.resolve_strategy = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): mode_config {
    return {
      hostname: Array.isArray(object?.hostname) ? object.hostname.map((e: any) => String(e)) : [],
      mode: isSet(object.mode) ? modeFromJSON(object.mode) : 0,
      tag: isSet(object.tag) ? String(object.tag) : "",
      resolve_strategy: isSet(object.resolve_strategy) ? resolve_strategyFromJSON(object.resolve_strategy) : 0,
    };
  },

  toJSON(message: mode_config): unknown {
    const obj: any = {};
    if (message.hostname?.length) {
      obj.hostname = message.hostname;
    }
    if (message.mode !== 0) {
      obj.mode = modeToJSON(message.mode);
    }
    if (message.tag !== "") {
      obj.tag = message.tag;
    }
    if (message.resolve_strategy !== 0) {
      obj.resolve_strategy = resolve_strategyToJSON(message.resolve_strategy);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<mode_config>, I>>(base?: I): mode_config {
    return mode_config.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<mode_config>, I>>(object: I): mode_config {
    const message = createBasemode_config();
    message.hostname = object.hostname?.map((e) => e) || [];
    message.mode = object.mode ?? 0;
    message.tag = object.tag ?? "";
    message.resolve_strategy = object.resolve_strategy ?? 0;
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
