/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.listener";

export interface protocol {
  name: string;
  enabled: boolean;
  protocol?:
    | { $case: "http"; http: http }
    | { $case: "socks5"; socks5: socks5 }
    | { $case: "redir"; redir: redir }
    | { $case: "tun"; tun: tun }
    | { $case: "yuubinsya"; yuubinsya: yuubinsya }
    | undefined;
}

export interface inbound_config {
  servers: { [key: string]: protocol };
}

export interface inbound_config_ServersEntry {
  key: string;
  value: protocol | undefined;
}

export interface http {
  host: string;
  username: string;
  password: string;
}

export interface socks5 {
  host: string;
  username: string;
  password: string;
}

export interface redir {
  host: string;
}

export interface tun {
  /**
   * name of the tun device
   * eg: tun://tun0, fd://123
   */
  name: string;
  mtu: number;
  gateway: string;
  dns_hijacking: boolean;
  skip_multicast: boolean;
  driver: tun_endpoint_driver;
  portal: string;
}

export enum tun_endpoint_driver {
  fdbased = 0,
  channel = 1,
  system_gvisor = 2,
  UNRECOGNIZED = -1,
}

export function tun_endpoint_driverFromJSON(object: any): tun_endpoint_driver {
  switch (object) {
    case 0:
    case "fdbased":
      return tun_endpoint_driver.fdbased;
    case 1:
    case "channel":
      return tun_endpoint_driver.channel;
    case 2:
    case "system_gvisor":
      return tun_endpoint_driver.system_gvisor;
    case -1:
    case "UNRECOGNIZED":
    default:
      return tun_endpoint_driver.UNRECOGNIZED;
  }
}

export function tun_endpoint_driverToJSON(object: tun_endpoint_driver): string {
  switch (object) {
    case tun_endpoint_driver.fdbased:
      return "fdbased";
    case tun_endpoint_driver.channel:
      return "channel";
    case tun_endpoint_driver.system_gvisor:
      return "system_gvisor";
    case tun_endpoint_driver.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface yuubinsya {
  host: string;
  password: string;
  force_disable_encrypt: boolean;
  protocol?:
    | { $case: "normal"; normal: normal }
    | { $case: "tls"; tls: tls }
    | { $case: "quic"; quic: quic }
    | { $case: "websocket"; websocket: websocket }
    | { $case: "grpc"; grpc: grpc }
    | { $case: "http2"; http2: http2 }
    | { $case: "reality"; reality: reality }
    | undefined;
}

export interface yuubinsya_protocol_normal {
}

export interface normal {
}

export interface websocket {
  tls: tls_config | undefined;
}

export interface quic {
  tls: tls_config | undefined;
}

export interface tls {
  tls: tls_config | undefined;
}

export interface grpc {
  tls: tls_config | undefined;
}

export interface http2 {
  tls: tls_config | undefined;
}

export interface reality {
  short_id: string[];
  server_name: string[];
  dest: string;
  private_key: string;
  debug: boolean;
}

export interface tls_config {
  certificates: certificate[];
  next_protos: string[];
  server_name_certificate: { [key: string]: certificate };
}

export interface tls_config_ServerNameCertificateEntry {
  key: string;
  value: certificate | undefined;
}

export interface certificate {
  cert: Uint8Array;
  key: Uint8Array;
  cert_file_path: string;
  key_file_path: string;
}

function createBaseprotocol(): protocol {
  return { name: "", enabled: false, protocol: undefined };
}

export const protocol = {
  encode(message: protocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.enabled === true) {
      writer.uint32(16).bool(message.enabled);
    }
    switch (message.protocol?.$case) {
      case "http":
        http.encode(message.protocol.http, writer.uint32(26).fork()).ldelim();
        break;
      case "socks5":
        socks5.encode(message.protocol.socks5, writer.uint32(34).fork()).ldelim();
        break;
      case "redir":
        redir.encode(message.protocol.redir, writer.uint32(42).fork()).ldelim();
        break;
      case "tun":
        tun.encode(message.protocol.tun, writer.uint32(50).fork()).ldelim();
        break;
      case "yuubinsya":
        yuubinsya.encode(message.protocol.yuubinsya, writer.uint32(58).fork()).ldelim();
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

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.enabled = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.protocol = { $case: "http", http: http.decode(reader, reader.uint32()) };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.protocol = { $case: "socks5", socks5: socks5.decode(reader, reader.uint32()) };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.protocol = { $case: "redir", redir: redir.decode(reader, reader.uint32()) };
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.protocol = { $case: "tun", tun: tun.decode(reader, reader.uint32()) };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.protocol = { $case: "yuubinsya", yuubinsya: yuubinsya.decode(reader, reader.uint32()) };
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
      name: isSet(object.name) ? String(object.name) : "",
      enabled: isSet(object.enabled) ? Boolean(object.enabled) : false,
      protocol: isSet(object.http)
        ? { $case: "http", http: http.fromJSON(object.http) }
        : isSet(object.socks5)
        ? { $case: "socks5", socks5: socks5.fromJSON(object.socks5) }
        : isSet(object.redir)
        ? { $case: "redir", redir: redir.fromJSON(object.redir) }
        : isSet(object.tun)
        ? { $case: "tun", tun: tun.fromJSON(object.tun) }
        : isSet(object.yuubinsya)
        ? { $case: "yuubinsya", yuubinsya: yuubinsya.fromJSON(object.yuubinsya) }
        : undefined,
    };
  },

  toJSON(message: protocol): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.enabled === true) {
      obj.enabled = message.enabled;
    }
    if (message.protocol?.$case === "http") {
      obj.http = http.toJSON(message.protocol.http);
    }
    if (message.protocol?.$case === "socks5") {
      obj.socks5 = socks5.toJSON(message.protocol.socks5);
    }
    if (message.protocol?.$case === "redir") {
      obj.redir = redir.toJSON(message.protocol.redir);
    }
    if (message.protocol?.$case === "tun") {
      obj.tun = tun.toJSON(message.protocol.tun);
    }
    if (message.protocol?.$case === "yuubinsya") {
      obj.yuubinsya = yuubinsya.toJSON(message.protocol.yuubinsya);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<protocol>, I>>(base?: I): protocol {
    return protocol.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<protocol>, I>>(object: I): protocol {
    const message = createBaseprotocol();
    message.name = object.name ?? "";
    message.enabled = object.enabled ?? false;
    if (object.protocol?.$case === "http" && object.protocol?.http !== undefined && object.protocol?.http !== null) {
      message.protocol = { $case: "http", http: http.fromPartial(object.protocol.http) };
    }
    if (
      object.protocol?.$case === "socks5" && object.protocol?.socks5 !== undefined && object.protocol?.socks5 !== null
    ) {
      message.protocol = { $case: "socks5", socks5: socks5.fromPartial(object.protocol.socks5) };
    }
    if (object.protocol?.$case === "redir" && object.protocol?.redir !== undefined && object.protocol?.redir !== null) {
      message.protocol = { $case: "redir", redir: redir.fromPartial(object.protocol.redir) };
    }
    if (object.protocol?.$case === "tun" && object.protocol?.tun !== undefined && object.protocol?.tun !== null) {
      message.protocol = { $case: "tun", tun: tun.fromPartial(object.protocol.tun) };
    }
    if (
      object.protocol?.$case === "yuubinsya" &&
      object.protocol?.yuubinsya !== undefined &&
      object.protocol?.yuubinsya !== null
    ) {
      message.protocol = { $case: "yuubinsya", yuubinsya: yuubinsya.fromPartial(object.protocol.yuubinsya) };
    }
    return message;
  },
};

function createBaseinbound_config(): inbound_config {
  return { servers: {} };
}

export const inbound_config = {
  encode(message: inbound_config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.servers).forEach(([key, value]) => {
      inbound_config_ServersEntry.encode({ key: key as any, value }, writer.uint32(42).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): inbound_config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseinbound_config();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 5:
          if (tag !== 42) {
            break;
          }

          const entry5 = inbound_config_ServersEntry.decode(reader, reader.uint32());
          if (entry5.value !== undefined) {
            message.servers[entry5.key] = entry5.value;
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

  fromJSON(object: any): inbound_config {
    return {
      servers: isObject(object.servers)
        ? Object.entries(object.servers).reduce<{ [key: string]: protocol }>((acc, [key, value]) => {
          acc[key] = protocol.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: inbound_config): unknown {
    const obj: any = {};
    if (message.servers) {
      const entries = Object.entries(message.servers);
      if (entries.length > 0) {
        obj.servers = {};
        entries.forEach(([k, v]) => {
          obj.servers[k] = protocol.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<inbound_config>, I>>(base?: I): inbound_config {
    return inbound_config.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<inbound_config>, I>>(object: I): inbound_config {
    const message = createBaseinbound_config();
    message.servers = Object.entries(object.servers ?? {}).reduce<{ [key: string]: protocol }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = protocol.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseinbound_config_ServersEntry(): inbound_config_ServersEntry {
  return { key: "", value: undefined };
}

export const inbound_config_ServersEntry = {
  encode(message: inbound_config_ServersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      protocol.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): inbound_config_ServersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseinbound_config_ServersEntry();
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

          message.value = protocol.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): inbound_config_ServersEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? protocol.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: inbound_config_ServersEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = protocol.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<inbound_config_ServersEntry>, I>>(base?: I): inbound_config_ServersEntry {
    return inbound_config_ServersEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<inbound_config_ServersEntry>, I>>(object: I): inbound_config_ServersEntry {
    const message = createBaseinbound_config_ServersEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? protocol.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBasehttp(): http {
  return { host: "", username: "", password: "" };
}

export const http = {
  encode(message: http, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.username !== "") {
      writer.uint32(26).string(message.username);
    }
    if (message.password !== "") {
      writer.uint32(34).string(message.password);
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

          message.host = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.username = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.password = reader.string();
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
    return {
      host: isSet(object.host) ? String(object.host) : "",
      username: isSet(object.username) ? String(object.username) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: http): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.username !== "") {
      obj.username = message.username;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<http>, I>>(base?: I): http {
    return http.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<http>, I>>(object: I): http {
    const message = createBasehttp();
    message.host = object.host ?? "";
    message.username = object.username ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBasesocks5(): socks5 {
  return { host: "", username: "", password: "" };
}

export const socks5 = {
  encode(message: socks5, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.username !== "") {
      writer.uint32(26).string(message.username);
    }
    if (message.password !== "") {
      writer.uint32(34).string(message.password);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): socks5 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasesocks5();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.username = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.password = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): socks5 {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      username: isSet(object.username) ? String(object.username) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: socks5): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.username !== "") {
      obj.username = message.username;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<socks5>, I>>(base?: I): socks5 {
    return socks5.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<socks5>, I>>(object: I): socks5 {
    const message = createBasesocks5();
    message.host = object.host ?? "";
    message.username = object.username ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseredir(): redir {
  return { host: "" };
}

export const redir = {
  encode(message: redir, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): redir {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseredir();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.host = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): redir {
    return { host: isSet(object.host) ? String(object.host) : "" };
  },

  toJSON(message: redir): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<redir>, I>>(base?: I): redir {
    return redir.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<redir>, I>>(object: I): redir {
    const message = createBaseredir();
    message.host = object.host ?? "";
    return message;
  },
};

function createBasetun(): tun {
  return { name: "", mtu: 0, gateway: "", dns_hijacking: false, skip_multicast: false, driver: 0, portal: "" };
}

export const tun = {
  encode(message: tun, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.mtu !== 0) {
      writer.uint32(16).int32(message.mtu);
    }
    if (message.gateway !== "") {
      writer.uint32(26).string(message.gateway);
    }
    if (message.dns_hijacking === true) {
      writer.uint32(32).bool(message.dns_hijacking);
    }
    if (message.skip_multicast === true) {
      writer.uint32(48).bool(message.skip_multicast);
    }
    if (message.driver !== 0) {
      writer.uint32(56).int32(message.driver);
    }
    if (message.portal !== "") {
      writer.uint32(66).string(message.portal);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): tun {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetun();
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

          message.mtu = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.gateway = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.dns_hijacking = reader.bool();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.skip_multicast = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.driver = reader.int32() as any;
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.portal = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): tun {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      mtu: isSet(object.mtu) ? Number(object.mtu) : 0,
      gateway: isSet(object.gateway) ? String(object.gateway) : "",
      dns_hijacking: isSet(object.dns_hijacking) ? Boolean(object.dns_hijacking) : false,
      skip_multicast: isSet(object.skip_multicast) ? Boolean(object.skip_multicast) : false,
      driver: isSet(object.driver) ? tun_endpoint_driverFromJSON(object.driver) : 0,
      portal: isSet(object.portal) ? String(object.portal) : "",
    };
  },

  toJSON(message: tun): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.mtu !== 0) {
      obj.mtu = Math.round(message.mtu);
    }
    if (message.gateway !== "") {
      obj.gateway = message.gateway;
    }
    if (message.dns_hijacking === true) {
      obj.dns_hijacking = message.dns_hijacking;
    }
    if (message.skip_multicast === true) {
      obj.skip_multicast = message.skip_multicast;
    }
    if (message.driver !== 0) {
      obj.driver = tun_endpoint_driverToJSON(message.driver);
    }
    if (message.portal !== "") {
      obj.portal = message.portal;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<tun>, I>>(base?: I): tun {
    return tun.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<tun>, I>>(object: I): tun {
    const message = createBasetun();
    message.name = object.name ?? "";
    message.mtu = object.mtu ?? 0;
    message.gateway = object.gateway ?? "";
    message.dns_hijacking = object.dns_hijacking ?? false;
    message.skip_multicast = object.skip_multicast ?? false;
    message.driver = object.driver ?? 0;
    message.portal = object.portal ?? "";
    return message;
  },
};

function createBaseyuubinsya(): yuubinsya {
  return { host: "", password: "", force_disable_encrypt: false, protocol: undefined };
}

export const yuubinsya = {
  encode(message: yuubinsya, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
    }
    if (message.force_disable_encrypt === true) {
      writer.uint32(64).bool(message.force_disable_encrypt);
    }
    switch (message.protocol?.$case) {
      case "normal":
        normal.encode(message.protocol.normal, writer.uint32(26).fork()).ldelim();
        break;
      case "tls":
        tls.encode(message.protocol.tls, writer.uint32(34).fork()).ldelim();
        break;
      case "quic":
        quic.encode(message.protocol.quic, writer.uint32(42).fork()).ldelim();
        break;
      case "websocket":
        websocket.encode(message.protocol.websocket, writer.uint32(50).fork()).ldelim();
        break;
      case "grpc":
        grpc.encode(message.protocol.grpc, writer.uint32(58).fork()).ldelim();
        break;
      case "http2":
        http2.encode(message.protocol.http2, writer.uint32(74).fork()).ldelim();
        break;
      case "reality":
        reality.encode(message.protocol.reality, writer.uint32(82).fork()).ldelim();
        break;
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): yuubinsya {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseyuubinsya();
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

          message.password = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.force_disable_encrypt = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.protocol = { $case: "normal", normal: normal.decode(reader, reader.uint32()) };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.protocol = { $case: "tls", tls: tls.decode(reader, reader.uint32()) };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.protocol = { $case: "quic", quic: quic.decode(reader, reader.uint32()) };
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.protocol = { $case: "websocket", websocket: websocket.decode(reader, reader.uint32()) };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.protocol = { $case: "grpc", grpc: grpc.decode(reader, reader.uint32()) };
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.protocol = { $case: "http2", http2: http2.decode(reader, reader.uint32()) };
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.protocol = { $case: "reality", reality: reality.decode(reader, reader.uint32()) };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): yuubinsya {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      password: isSet(object.password) ? String(object.password) : "",
      force_disable_encrypt: isSet(object.force_disable_encrypt) ? Boolean(object.force_disable_encrypt) : false,
      protocol: isSet(object.normal)
        ? { $case: "normal", normal: normal.fromJSON(object.normal) }
        : isSet(object.tls)
        ? { $case: "tls", tls: tls.fromJSON(object.tls) }
        : isSet(object.quic)
        ? { $case: "quic", quic: quic.fromJSON(object.quic) }
        : isSet(object.websocket)
        ? { $case: "websocket", websocket: websocket.fromJSON(object.websocket) }
        : isSet(object.grpc)
        ? { $case: "grpc", grpc: grpc.fromJSON(object.grpc) }
        : isSet(object.http2)
        ? { $case: "http2", http2: http2.fromJSON(object.http2) }
        : isSet(object.reality)
        ? { $case: "reality", reality: reality.fromJSON(object.reality) }
        : undefined,
    };
  },

  toJSON(message: yuubinsya): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    if (message.force_disable_encrypt === true) {
      obj.force_disable_encrypt = message.force_disable_encrypt;
    }
    if (message.protocol?.$case === "normal") {
      obj.normal = normal.toJSON(message.protocol.normal);
    }
    if (message.protocol?.$case === "tls") {
      obj.tls = tls.toJSON(message.protocol.tls);
    }
    if (message.protocol?.$case === "quic") {
      obj.quic = quic.toJSON(message.protocol.quic);
    }
    if (message.protocol?.$case === "websocket") {
      obj.websocket = websocket.toJSON(message.protocol.websocket);
    }
    if (message.protocol?.$case === "grpc") {
      obj.grpc = grpc.toJSON(message.protocol.grpc);
    }
    if (message.protocol?.$case === "http2") {
      obj.http2 = http2.toJSON(message.protocol.http2);
    }
    if (message.protocol?.$case === "reality") {
      obj.reality = reality.toJSON(message.protocol.reality);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<yuubinsya>, I>>(base?: I): yuubinsya {
    return yuubinsya.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<yuubinsya>, I>>(object: I): yuubinsya {
    const message = createBaseyuubinsya();
    message.host = object.host ?? "";
    message.password = object.password ?? "";
    message.force_disable_encrypt = object.force_disable_encrypt ?? false;
    if (
      object.protocol?.$case === "normal" && object.protocol?.normal !== undefined && object.protocol?.normal !== null
    ) {
      message.protocol = { $case: "normal", normal: normal.fromPartial(object.protocol.normal) };
    }
    if (object.protocol?.$case === "tls" && object.protocol?.tls !== undefined && object.protocol?.tls !== null) {
      message.protocol = { $case: "tls", tls: tls.fromPartial(object.protocol.tls) };
    }
    if (object.protocol?.$case === "quic" && object.protocol?.quic !== undefined && object.protocol?.quic !== null) {
      message.protocol = { $case: "quic", quic: quic.fromPartial(object.protocol.quic) };
    }
    if (
      object.protocol?.$case === "websocket" &&
      object.protocol?.websocket !== undefined &&
      object.protocol?.websocket !== null
    ) {
      message.protocol = { $case: "websocket", websocket: websocket.fromPartial(object.protocol.websocket) };
    }
    if (object.protocol?.$case === "grpc" && object.protocol?.grpc !== undefined && object.protocol?.grpc !== null) {
      message.protocol = { $case: "grpc", grpc: grpc.fromPartial(object.protocol.grpc) };
    }
    if (object.protocol?.$case === "http2" && object.protocol?.http2 !== undefined && object.protocol?.http2 !== null) {
      message.protocol = { $case: "http2", http2: http2.fromPartial(object.protocol.http2) };
    }
    if (
      object.protocol?.$case === "reality" &&
      object.protocol?.reality !== undefined &&
      object.protocol?.reality !== null
    ) {
      message.protocol = { $case: "reality", reality: reality.fromPartial(object.protocol.reality) };
    }
    return message;
  },
};

function createBaseyuubinsya_protocol_normal(): yuubinsya_protocol_normal {
  return {};
}

export const yuubinsya_protocol_normal = {
  encode(_: yuubinsya_protocol_normal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): yuubinsya_protocol_normal {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseyuubinsya_protocol_normal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): yuubinsya_protocol_normal {
    return {};
  },

  toJSON(_: yuubinsya_protocol_normal): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<yuubinsya_protocol_normal>, I>>(base?: I): yuubinsya_protocol_normal {
    return yuubinsya_protocol_normal.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<yuubinsya_protocol_normal>, I>>(_: I): yuubinsya_protocol_normal {
    const message = createBaseyuubinsya_protocol_normal();
    return message;
  },
};

function createBasenormal(): normal {
  return {};
}

export const normal = {
  encode(_: normal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): normal {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenormal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): normal {
    return {};
  },

  toJSON(_: normal): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<normal>, I>>(base?: I): normal {
    return normal.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<normal>, I>>(_: I): normal {
    const message = createBasenormal();
    return message;
  },
};

function createBasewebsocket(): websocket {
  return { tls: undefined };
}

export const websocket = {
  encode(message: websocket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tls !== undefined) {
      tls_config.encode(message.tls, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): websocket {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasewebsocket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tls = tls_config.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): websocket {
    return { tls: isSet(object.tls) ? tls_config.fromJSON(object.tls) : undefined };
  },

  toJSON(message: websocket): unknown {
    const obj: any = {};
    if (message.tls !== undefined) {
      obj.tls = tls_config.toJSON(message.tls);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<websocket>, I>>(base?: I): websocket {
    return websocket.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<websocket>, I>>(object: I): websocket {
    const message = createBasewebsocket();
    message.tls = (object.tls !== undefined && object.tls !== null) ? tls_config.fromPartial(object.tls) : undefined;
    return message;
  },
};

function createBasequic(): quic {
  return { tls: undefined };
}

export const quic = {
  encode(message: quic, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tls !== undefined) {
      tls_config.encode(message.tls, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): quic {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasequic();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tls = tls_config.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): quic {
    return { tls: isSet(object.tls) ? tls_config.fromJSON(object.tls) : undefined };
  },

  toJSON(message: quic): unknown {
    const obj: any = {};
    if (message.tls !== undefined) {
      obj.tls = tls_config.toJSON(message.tls);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<quic>, I>>(base?: I): quic {
    return quic.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<quic>, I>>(object: I): quic {
    const message = createBasequic();
    message.tls = (object.tls !== undefined && object.tls !== null) ? tls_config.fromPartial(object.tls) : undefined;
    return message;
  },
};

function createBasetls(): tls {
  return { tls: undefined };
}

export const tls = {
  encode(message: tls, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tls !== undefined) {
      tls_config.encode(message.tls, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): tls {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetls();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tls = tls_config.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): tls {
    return { tls: isSet(object.tls) ? tls_config.fromJSON(object.tls) : undefined };
  },

  toJSON(message: tls): unknown {
    const obj: any = {};
    if (message.tls !== undefined) {
      obj.tls = tls_config.toJSON(message.tls);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<tls>, I>>(base?: I): tls {
    return tls.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<tls>, I>>(object: I): tls {
    const message = createBasetls();
    message.tls = (object.tls !== undefined && object.tls !== null) ? tls_config.fromPartial(object.tls) : undefined;
    return message;
  },
};

function createBasegrpc(): grpc {
  return { tls: undefined };
}

export const grpc = {
  encode(message: grpc, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tls !== undefined) {
      tls_config.encode(message.tls, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): grpc {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasegrpc();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tls = tls_config.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): grpc {
    return { tls: isSet(object.tls) ? tls_config.fromJSON(object.tls) : undefined };
  },

  toJSON(message: grpc): unknown {
    const obj: any = {};
    if (message.tls !== undefined) {
      obj.tls = tls_config.toJSON(message.tls);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<grpc>, I>>(base?: I): grpc {
    return grpc.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<grpc>, I>>(object: I): grpc {
    const message = createBasegrpc();
    message.tls = (object.tls !== undefined && object.tls !== null) ? tls_config.fromPartial(object.tls) : undefined;
    return message;
  },
};

function createBasehttp2(): http2 {
  return { tls: undefined };
}

export const http2 = {
  encode(message: http2, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tls !== undefined) {
      tls_config.encode(message.tls, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): http2 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasehttp2();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tls = tls_config.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): http2 {
    return { tls: isSet(object.tls) ? tls_config.fromJSON(object.tls) : undefined };
  },

  toJSON(message: http2): unknown {
    const obj: any = {};
    if (message.tls !== undefined) {
      obj.tls = tls_config.toJSON(message.tls);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<http2>, I>>(base?: I): http2 {
    return http2.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<http2>, I>>(object: I): http2 {
    const message = createBasehttp2();
    message.tls = (object.tls !== undefined && object.tls !== null) ? tls_config.fromPartial(object.tls) : undefined;
    return message;
  },
};

function createBasereality(): reality {
  return { short_id: [], server_name: [], dest: "", private_key: "", debug: false };
}

export const reality = {
  encode(message: reality, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.short_id) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.server_name) {
      writer.uint32(18).string(v!);
    }
    if (message.dest !== "") {
      writer.uint32(26).string(message.dest);
    }
    if (message.private_key !== "") {
      writer.uint32(34).string(message.private_key);
    }
    if (message.debug === true) {
      writer.uint32(40).bool(message.debug);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): reality {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasereality();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.short_id.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.server_name.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.dest = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.private_key = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.debug = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): reality {
    return {
      short_id: Array.isArray(object?.short_id) ? object.short_id.map((e: any) => String(e)) : [],
      server_name: Array.isArray(object?.server_name) ? object.server_name.map((e: any) => String(e)) : [],
      dest: isSet(object.dest) ? String(object.dest) : "",
      private_key: isSet(object.private_key) ? String(object.private_key) : "",
      debug: isSet(object.debug) ? Boolean(object.debug) : false,
    };
  },

  toJSON(message: reality): unknown {
    const obj: any = {};
    if (message.short_id?.length) {
      obj.short_id = message.short_id;
    }
    if (message.server_name?.length) {
      obj.server_name = message.server_name;
    }
    if (message.dest !== "") {
      obj.dest = message.dest;
    }
    if (message.private_key !== "") {
      obj.private_key = message.private_key;
    }
    if (message.debug === true) {
      obj.debug = message.debug;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<reality>, I>>(base?: I): reality {
    return reality.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<reality>, I>>(object: I): reality {
    const message = createBasereality();
    message.short_id = object.short_id?.map((e) => e) || [];
    message.server_name = object.server_name?.map((e) => e) || [];
    message.dest = object.dest ?? "";
    message.private_key = object.private_key ?? "";
    message.debug = object.debug ?? false;
    return message;
  },
};

function createBasetls_config(): tls_config {
  return { certificates: [], next_protos: [], server_name_certificate: {} };
}

export const tls_config = {
  encode(message: tls_config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.certificates) {
      certificate.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.next_protos) {
      writer.uint32(26).string(v!);
    }
    Object.entries(message.server_name_certificate).forEach(([key, value]) => {
      tls_config_ServerNameCertificateEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): tls_config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetls_config();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.certificates.push(certificate.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.next_protos.push(reader.string());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = tls_config_ServerNameCertificateEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.server_name_certificate[entry4.key] = entry4.value;
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

  fromJSON(object: any): tls_config {
    return {
      certificates: Array.isArray(object?.certificates)
        ? object.certificates.map((e: any) => certificate.fromJSON(e))
        : [],
      next_protos: Array.isArray(object?.next_protos) ? object.next_protos.map((e: any) => String(e)) : [],
      server_name_certificate: isObject(object.server_name_certificate)
        ? Object.entries(object.server_name_certificate).reduce<{ [key: string]: certificate }>((acc, [key, value]) => {
          acc[key] = certificate.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: tls_config): unknown {
    const obj: any = {};
    if (message.certificates?.length) {
      obj.certificates = message.certificates.map((e) => certificate.toJSON(e));
    }
    if (message.next_protos?.length) {
      obj.next_protos = message.next_protos;
    }
    if (message.server_name_certificate) {
      const entries = Object.entries(message.server_name_certificate);
      if (entries.length > 0) {
        obj.server_name_certificate = {};
        entries.forEach(([k, v]) => {
          obj.server_name_certificate[k] = certificate.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<tls_config>, I>>(base?: I): tls_config {
    return tls_config.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<tls_config>, I>>(object: I): tls_config {
    const message = createBasetls_config();
    message.certificates = object.certificates?.map((e) => certificate.fromPartial(e)) || [];
    message.next_protos = object.next_protos?.map((e) => e) || [];
    message.server_name_certificate = Object.entries(object.server_name_certificate ?? {}).reduce<
      { [key: string]: certificate }
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = certificate.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBasetls_config_ServerNameCertificateEntry(): tls_config_ServerNameCertificateEntry {
  return { key: "", value: undefined };
}

export const tls_config_ServerNameCertificateEntry = {
  encode(message: tls_config_ServerNameCertificateEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      certificate.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): tls_config_ServerNameCertificateEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetls_config_ServerNameCertificateEntry();
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

          message.value = certificate.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): tls_config_ServerNameCertificateEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? certificate.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: tls_config_ServerNameCertificateEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = certificate.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<tls_config_ServerNameCertificateEntry>, I>>(
    base?: I,
  ): tls_config_ServerNameCertificateEntry {
    return tls_config_ServerNameCertificateEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<tls_config_ServerNameCertificateEntry>, I>>(
    object: I,
  ): tls_config_ServerNameCertificateEntry {
    const message = createBasetls_config_ServerNameCertificateEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? certificate.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBasecertificate(): certificate {
  return { cert: new Uint8Array(0), key: new Uint8Array(0), cert_file_path: "", key_file_path: "" };
}

export const certificate = {
  encode(message: certificate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cert.length !== 0) {
      writer.uint32(10).bytes(message.cert);
    }
    if (message.key.length !== 0) {
      writer.uint32(18).bytes(message.key);
    }
    if (message.cert_file_path !== "") {
      writer.uint32(26).string(message.cert_file_path);
    }
    if (message.key_file_path !== "") {
      writer.uint32(34).string(message.key_file_path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): certificate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasecertificate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.cert = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.key = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.cert_file_path = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.key_file_path = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): certificate {
    return {
      cert: isSet(object.cert) ? bytesFromBase64(object.cert) : new Uint8Array(0),
      key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(0),
      cert_file_path: isSet(object.cert_file_path) ? String(object.cert_file_path) : "",
      key_file_path: isSet(object.key_file_path) ? String(object.key_file_path) : "",
    };
  },

  toJSON(message: certificate): unknown {
    const obj: any = {};
    if (message.cert.length !== 0) {
      obj.cert = base64FromBytes(message.cert);
    }
    if (message.key.length !== 0) {
      obj.key = base64FromBytes(message.key);
    }
    if (message.cert_file_path !== "") {
      obj.cert_file_path = message.cert_file_path;
    }
    if (message.key_file_path !== "") {
      obj.key_file_path = message.key_file_path;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<certificate>, I>>(base?: I): certificate {
    return certificate.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<certificate>, I>>(object: I): certificate {
    const message = createBasecertificate();
    message.cert = object.cert ?? new Uint8Array(0);
    message.key = object.key ?? new Uint8Array(0);
    message.cert_file_path = object.cert_file_path ?? "";
    message.key_file_path = object.key_file_path ?? "";
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

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

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
