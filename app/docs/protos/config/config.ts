/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { bypass_config } from "./bypass/bypass";
import { dns_config } from "./dns/dns";
import { inbound_config } from "./listener/listener";
import { logcat } from "./log/log";

export const protobufPackage = "yuhaiin.config";

export interface setting {
  ipv6: boolean;
  /** net_interface, eg: eth0 */
  net_interface: string;
  system_proxy: system_proxy | undefined;
  bypass: bypass_config | undefined;
  dns: dns_config | undefined;
  server: inbound_config | undefined;
  logcat: logcat | undefined;
}

export interface system_proxy {
  http: boolean;
  socks5: boolean;
}

function createBasesetting(): setting {
  return {
    ipv6: false,
    net_interface: "",
    system_proxy: undefined,
    bypass: undefined,
    dns: undefined,
    server: undefined,
    logcat: undefined,
  };
}

export const setting = {
  encode(message: setting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ipv6 === true) {
      writer.uint32(56).bool(message.ipv6);
    }
    if (message.net_interface !== "") {
      writer.uint32(50).string(message.net_interface);
    }
    if (message.system_proxy !== undefined) {
      system_proxy.encode(message.system_proxy, writer.uint32(10).fork()).ldelim();
    }
    if (message.bypass !== undefined) {
      bypass_config.encode(message.bypass, writer.uint32(18).fork()).ldelim();
    }
    if (message.dns !== undefined) {
      dns_config.encode(message.dns, writer.uint32(34).fork()).ldelim();
    }
    if (message.server !== undefined) {
      inbound_config.encode(message.server, writer.uint32(42).fork()).ldelim();
    }
    if (message.logcat !== undefined) {
      logcat.encode(message.logcat, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): setting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasesetting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 7:
          if (tag !== 56) {
            break;
          }

          message.ipv6 = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.net_interface = reader.string();
          continue;
        case 1:
          if (tag !== 10) {
            break;
          }

          message.system_proxy = system_proxy.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.bypass = bypass_config.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.dns = dns_config.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.server = inbound_config.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.logcat = logcat.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): setting {
    return {
      ipv6: isSet(object.ipv6) ? Boolean(object.ipv6) : false,
      net_interface: isSet(object.net_interface) ? String(object.net_interface) : "",
      system_proxy: isSet(object.system_proxy) ? system_proxy.fromJSON(object.system_proxy) : undefined,
      bypass: isSet(object.bypass) ? bypass_config.fromJSON(object.bypass) : undefined,
      dns: isSet(object.dns) ? dns_config.fromJSON(object.dns) : undefined,
      server: isSet(object.server) ? inbound_config.fromJSON(object.server) : undefined,
      logcat: isSet(object.logcat) ? logcat.fromJSON(object.logcat) : undefined,
    };
  },

  toJSON(message: setting): unknown {
    const obj: any = {};
    if (message.ipv6 === true) {
      obj.ipv6 = message.ipv6;
    }
    if (message.net_interface !== "") {
      obj.net_interface = message.net_interface;
    }
    if (message.system_proxy !== undefined) {
      obj.system_proxy = system_proxy.toJSON(message.system_proxy);
    }
    if (message.bypass !== undefined) {
      obj.bypass = bypass_config.toJSON(message.bypass);
    }
    if (message.dns !== undefined) {
      obj.dns = dns_config.toJSON(message.dns);
    }
    if (message.server !== undefined) {
      obj.server = inbound_config.toJSON(message.server);
    }
    if (message.logcat !== undefined) {
      obj.logcat = logcat.toJSON(message.logcat);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<setting>, I>>(base?: I): setting {
    return setting.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<setting>, I>>(object: I): setting {
    const message = createBasesetting();
    message.ipv6 = object.ipv6 ?? false;
    message.net_interface = object.net_interface ?? "";
    message.system_proxy = (object.system_proxy !== undefined && object.system_proxy !== null)
      ? system_proxy.fromPartial(object.system_proxy)
      : undefined;
    message.bypass = (object.bypass !== undefined && object.bypass !== null)
      ? bypass_config.fromPartial(object.bypass)
      : undefined;
    message.dns = (object.dns !== undefined && object.dns !== null) ? dns_config.fromPartial(object.dns) : undefined;
    message.server = (object.server !== undefined && object.server !== null)
      ? inbound_config.fromPartial(object.server)
      : undefined;
    message.logcat = (object.logcat !== undefined && object.logcat !== null)
      ? logcat.fromPartial(object.logcat)
      : undefined;
    return message;
  },
};

function createBasesystem_proxy(): system_proxy {
  return { http: false, socks5: false };
}

export const system_proxy = {
  encode(message: system_proxy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.http === true) {
      writer.uint32(16).bool(message.http);
    }
    if (message.socks5 === true) {
      writer.uint32(24).bool(message.socks5);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): system_proxy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasesystem_proxy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 16) {
            break;
          }

          message.http = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.socks5 = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): system_proxy {
    return {
      http: isSet(object.http) ? Boolean(object.http) : false,
      socks5: isSet(object.socks5) ? Boolean(object.socks5) : false,
    };
  },

  toJSON(message: system_proxy): unknown {
    const obj: any = {};
    if (message.http === true) {
      obj.http = message.http;
    }
    if (message.socks5 === true) {
      obj.socks5 = message.socks5;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<system_proxy>, I>>(base?: I): system_proxy {
    return system_proxy.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<system_proxy>, I>>(object: I): system_proxy {
    const message = createBasesystem_proxy();
    message.http = object.http ?? false;
    message.socks5 = object.socks5 ?? false;
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
