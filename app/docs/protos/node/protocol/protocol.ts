/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.protocol";

export interface protocol {
  protocol?:
    | { $case: "shadowsocks"; shadowsocks: shadowsocks }
    | { $case: "shadowsocksr"; shadowsocksr: shadowsocksr }
    | { $case: "vmess"; vmess: vmess }
    | { $case: "websocket"; websocket: websocket }
    | { $case: "quic"; quic: quic }
    | { $case: "obfs_http"; obfs_http: obfs_http }
    | { $case: "trojan"; trojan: trojan }
    | { $case: "simple"; simple: simple }
    | { $case: "none"; none: none }
    | { $case: "socks5"; socks5: socks5 }
    | { $case: "http"; http: http }
    | { $case: "direct"; direct: direct }
    | { $case: "reject"; reject: reject }
    | { $case: "yuubinsya"; yuubinsya: yuubinsya }
    | { $case: "grpc"; grpc: grpc }
    | { $case: "http2"; http2: http2 }
    | { $case: "reality"; reality: reality }
    | undefined;
}

export interface socks5 {
  /** eg: 127.0.0.1 */
  hostname: string;
  user: string;
  /** TODO: add override hostname options */
  password: string;
}

export interface http {
  user: string;
  password: string;
}

export interface shadowsocks {
  method: string;
  password: string;
}

export interface shadowsocksr {
  server: string;
  port: string;
  method: string;
  password: string;
  obfs: string;
  obfsparam: string;
  protocol: string;
  protoparam: string;
}

export interface http2 {
  host: string;
}

export interface vmess {
  /** uuid */
  uuid: string;
  /** alter id */
  alter_id: string;
  security: string;
}

export interface trojan {
  password: string;
  peer: string;
}

export interface yuubinsya {
  password: string;
  encrypted: boolean;
}

export interface websocket {
  host: string;
  path: string;
  tls_enabled: boolean;
}

export interface grpc {
  tls: tls_config | undefined;
}

export interface quic {
  /** string host = 2 [ json_name = "host" ]; */
  tls: tls_config | undefined;
}

export interface reality {
  server_name: string;
  public_key: string;
  short_id: string;
  debug: boolean;
}

export interface obfs_http {
  host: string;
  port: string;
}

export interface none {
}

export interface simple {
  host: string;
  port: number;
  timeout: number;
  alternate_host: host[];
  /** udp will write to every packet target instead of only write to host:port */
  packet_conn_direct: boolean;
  tls: tls_config | undefined;
}

export interface tls_config {
  enable: boolean;
  server_names: string[];
  ca_cert: Uint8Array[];
  insecure_skip_verify: boolean;
  /**
   * next_protos ALPN Next Protocol
   * eg: h2, http/1.1
   */
  next_protos: string[];
}

export interface direct {
}

export interface reject {
}

export interface host {
  host: string;
  port: number;
}

function createBaseprotocol(): protocol {
  return { protocol: undefined };
}

export const protocol = {
  encode(message: protocol, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.protocol?.$case) {
      case "shadowsocks":
        shadowsocks.encode(message.protocol.shadowsocks, writer.uint32(10).fork()).ldelim();
        break;
      case "shadowsocksr":
        shadowsocksr.encode(message.protocol.shadowsocksr, writer.uint32(18).fork()).ldelim();
        break;
      case "vmess":
        vmess.encode(message.protocol.vmess, writer.uint32(26).fork()).ldelim();
        break;
      case "websocket":
        websocket.encode(message.protocol.websocket, writer.uint32(34).fork()).ldelim();
        break;
      case "quic":
        quic.encode(message.protocol.quic, writer.uint32(42).fork()).ldelim();
        break;
      case "obfs_http":
        obfs_http.encode(message.protocol.obfs_http, writer.uint32(50).fork()).ldelim();
        break;
      case "trojan":
        trojan.encode(message.protocol.trojan, writer.uint32(58).fork()).ldelim();
        break;
      case "simple":
        simple.encode(message.protocol.simple, writer.uint32(66).fork()).ldelim();
        break;
      case "none":
        none.encode(message.protocol.none, writer.uint32(74).fork()).ldelim();
        break;
      case "socks5":
        socks5.encode(message.protocol.socks5, writer.uint32(82).fork()).ldelim();
        break;
      case "http":
        http.encode(message.protocol.http, writer.uint32(90).fork()).ldelim();
        break;
      case "direct":
        direct.encode(message.protocol.direct, writer.uint32(98).fork()).ldelim();
        break;
      case "reject":
        reject.encode(message.protocol.reject, writer.uint32(106).fork()).ldelim();
        break;
      case "yuubinsya":
        yuubinsya.encode(message.protocol.yuubinsya, writer.uint32(114).fork()).ldelim();
        break;
      case "grpc":
        grpc.encode(message.protocol.grpc, writer.uint32(122).fork()).ldelim();
        break;
      case "http2":
        http2.encode(message.protocol.http2, writer.uint32(130).fork()).ldelim();
        break;
      case "reality":
        reality.encode(message.protocol.reality, writer.uint32(138).fork()).ldelim();
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

          message.protocol = { $case: "shadowsocks", shadowsocks: shadowsocks.decode(reader, reader.uint32()) };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.protocol = { $case: "shadowsocksr", shadowsocksr: shadowsocksr.decode(reader, reader.uint32()) };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.protocol = { $case: "vmess", vmess: vmess.decode(reader, reader.uint32()) };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.protocol = { $case: "websocket", websocket: websocket.decode(reader, reader.uint32()) };
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

          message.protocol = { $case: "obfs_http", obfs_http: obfs_http.decode(reader, reader.uint32()) };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.protocol = { $case: "trojan", trojan: trojan.decode(reader, reader.uint32()) };
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.protocol = { $case: "simple", simple: simple.decode(reader, reader.uint32()) };
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.protocol = { $case: "none", none: none.decode(reader, reader.uint32()) };
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.protocol = { $case: "socks5", socks5: socks5.decode(reader, reader.uint32()) };
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.protocol = { $case: "http", http: http.decode(reader, reader.uint32()) };
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.protocol = { $case: "direct", direct: direct.decode(reader, reader.uint32()) };
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.protocol = { $case: "reject", reject: reject.decode(reader, reader.uint32()) };
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.protocol = { $case: "yuubinsya", yuubinsya: yuubinsya.decode(reader, reader.uint32()) };
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.protocol = { $case: "grpc", grpc: grpc.decode(reader, reader.uint32()) };
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.protocol = { $case: "http2", http2: http2.decode(reader, reader.uint32()) };
          continue;
        case 17:
          if (tag !== 138) {
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

  fromJSON(object: any): protocol {
    return {
      protocol: isSet(object.shadowsocks)
        ? { $case: "shadowsocks", shadowsocks: shadowsocks.fromJSON(object.shadowsocks) }
        : isSet(object.shadowsocksr)
        ? { $case: "shadowsocksr", shadowsocksr: shadowsocksr.fromJSON(object.shadowsocksr) }
        : isSet(object.vmess)
        ? { $case: "vmess", vmess: vmess.fromJSON(object.vmess) }
        : isSet(object.websocket)
        ? { $case: "websocket", websocket: websocket.fromJSON(object.websocket) }
        : isSet(object.quic)
        ? { $case: "quic", quic: quic.fromJSON(object.quic) }
        : isSet(object.obfs_http)
        ? { $case: "obfs_http", obfs_http: obfs_http.fromJSON(object.obfs_http) }
        : isSet(object.trojan)
        ? { $case: "trojan", trojan: trojan.fromJSON(object.trojan) }
        : isSet(object.simple)
        ? { $case: "simple", simple: simple.fromJSON(object.simple) }
        : isSet(object.none)
        ? { $case: "none", none: none.fromJSON(object.none) }
        : isSet(object.socks5)
        ? { $case: "socks5", socks5: socks5.fromJSON(object.socks5) }
        : isSet(object.http)
        ? { $case: "http", http: http.fromJSON(object.http) }
        : isSet(object.direct)
        ? { $case: "direct", direct: direct.fromJSON(object.direct) }
        : isSet(object.reject)
        ? { $case: "reject", reject: reject.fromJSON(object.reject) }
        : isSet(object.yuubinsya)
        ? { $case: "yuubinsya", yuubinsya: yuubinsya.fromJSON(object.yuubinsya) }
        : isSet(object.grpc)
        ? { $case: "grpc", grpc: grpc.fromJSON(object.grpc) }
        : isSet(object.http2)
        ? { $case: "http2", http2: http2.fromJSON(object.http2) }
        : isSet(object.reality)
        ? { $case: "reality", reality: reality.fromJSON(object.reality) }
        : undefined,
    };
  },

  toJSON(message: protocol): unknown {
    const obj: any = {};
    if (message.protocol?.$case === "shadowsocks") {
      obj.shadowsocks = shadowsocks.toJSON(message.protocol.shadowsocks);
    }
    if (message.protocol?.$case === "shadowsocksr") {
      obj.shadowsocksr = shadowsocksr.toJSON(message.protocol.shadowsocksr);
    }
    if (message.protocol?.$case === "vmess") {
      obj.vmess = vmess.toJSON(message.protocol.vmess);
    }
    if (message.protocol?.$case === "websocket") {
      obj.websocket = websocket.toJSON(message.protocol.websocket);
    }
    if (message.protocol?.$case === "quic") {
      obj.quic = quic.toJSON(message.protocol.quic);
    }
    if (message.protocol?.$case === "obfs_http") {
      obj.obfs_http = obfs_http.toJSON(message.protocol.obfs_http);
    }
    if (message.protocol?.$case === "trojan") {
      obj.trojan = trojan.toJSON(message.protocol.trojan);
    }
    if (message.protocol?.$case === "simple") {
      obj.simple = simple.toJSON(message.protocol.simple);
    }
    if (message.protocol?.$case === "none") {
      obj.none = none.toJSON(message.protocol.none);
    }
    if (message.protocol?.$case === "socks5") {
      obj.socks5 = socks5.toJSON(message.protocol.socks5);
    }
    if (message.protocol?.$case === "http") {
      obj.http = http.toJSON(message.protocol.http);
    }
    if (message.protocol?.$case === "direct") {
      obj.direct = direct.toJSON(message.protocol.direct);
    }
    if (message.protocol?.$case === "reject") {
      obj.reject = reject.toJSON(message.protocol.reject);
    }
    if (message.protocol?.$case === "yuubinsya") {
      obj.yuubinsya = yuubinsya.toJSON(message.protocol.yuubinsya);
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

  create<I extends Exact<DeepPartial<protocol>, I>>(base?: I): protocol {
    return protocol.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<protocol>, I>>(object: I): protocol {
    const message = createBaseprotocol();
    if (
      object.protocol?.$case === "shadowsocks" &&
      object.protocol?.shadowsocks !== undefined &&
      object.protocol?.shadowsocks !== null
    ) {
      message.protocol = { $case: "shadowsocks", shadowsocks: shadowsocks.fromPartial(object.protocol.shadowsocks) };
    }
    if (
      object.protocol?.$case === "shadowsocksr" &&
      object.protocol?.shadowsocksr !== undefined &&
      object.protocol?.shadowsocksr !== null
    ) {
      message.protocol = {
        $case: "shadowsocksr",
        shadowsocksr: shadowsocksr.fromPartial(object.protocol.shadowsocksr),
      };
    }
    if (object.protocol?.$case === "vmess" && object.protocol?.vmess !== undefined && object.protocol?.vmess !== null) {
      message.protocol = { $case: "vmess", vmess: vmess.fromPartial(object.protocol.vmess) };
    }
    if (
      object.protocol?.$case === "websocket" &&
      object.protocol?.websocket !== undefined &&
      object.protocol?.websocket !== null
    ) {
      message.protocol = { $case: "websocket", websocket: websocket.fromPartial(object.protocol.websocket) };
    }
    if (object.protocol?.$case === "quic" && object.protocol?.quic !== undefined && object.protocol?.quic !== null) {
      message.protocol = { $case: "quic", quic: quic.fromPartial(object.protocol.quic) };
    }
    if (
      object.protocol?.$case === "obfs_http" &&
      object.protocol?.obfs_http !== undefined &&
      object.protocol?.obfs_http !== null
    ) {
      message.protocol = { $case: "obfs_http", obfs_http: obfs_http.fromPartial(object.protocol.obfs_http) };
    }
    if (
      object.protocol?.$case === "trojan" && object.protocol?.trojan !== undefined && object.protocol?.trojan !== null
    ) {
      message.protocol = { $case: "trojan", trojan: trojan.fromPartial(object.protocol.trojan) };
    }
    if (
      object.protocol?.$case === "simple" && object.protocol?.simple !== undefined && object.protocol?.simple !== null
    ) {
      message.protocol = { $case: "simple", simple: simple.fromPartial(object.protocol.simple) };
    }
    if (object.protocol?.$case === "none" && object.protocol?.none !== undefined && object.protocol?.none !== null) {
      message.protocol = { $case: "none", none: none.fromPartial(object.protocol.none) };
    }
    if (
      object.protocol?.$case === "socks5" && object.protocol?.socks5 !== undefined && object.protocol?.socks5 !== null
    ) {
      message.protocol = { $case: "socks5", socks5: socks5.fromPartial(object.protocol.socks5) };
    }
    if (object.protocol?.$case === "http" && object.protocol?.http !== undefined && object.protocol?.http !== null) {
      message.protocol = { $case: "http", http: http.fromPartial(object.protocol.http) };
    }
    if (
      object.protocol?.$case === "direct" && object.protocol?.direct !== undefined && object.protocol?.direct !== null
    ) {
      message.protocol = { $case: "direct", direct: direct.fromPartial(object.protocol.direct) };
    }
    if (
      object.protocol?.$case === "reject" && object.protocol?.reject !== undefined && object.protocol?.reject !== null
    ) {
      message.protocol = { $case: "reject", reject: reject.fromPartial(object.protocol.reject) };
    }
    if (
      object.protocol?.$case === "yuubinsya" &&
      object.protocol?.yuubinsya !== undefined &&
      object.protocol?.yuubinsya !== null
    ) {
      message.protocol = { $case: "yuubinsya", yuubinsya: yuubinsya.fromPartial(object.protocol.yuubinsya) };
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

function createBasesocks5(): socks5 {
  return { hostname: "", user: "", password: "" };
}

export const socks5 = {
  encode(message: socks5, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hostname !== "") {
      writer.uint32(26).string(message.hostname);
    }
    if (message.user !== "") {
      writer.uint32(10).string(message.user);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
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
        case 3:
          if (tag !== 26) {
            break;
          }

          message.hostname = reader.string();
          continue;
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
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
      hostname: isSet(object.hostname) ? String(object.hostname) : "",
      user: isSet(object.user) ? String(object.user) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: socks5): unknown {
    const obj: any = {};
    if (message.hostname !== "") {
      obj.hostname = message.hostname;
    }
    if (message.user !== "") {
      obj.user = message.user;
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
    message.hostname = object.hostname ?? "";
    message.user = object.user ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBasehttp(): http {
  return { user: "", password: "" };
}

export const http = {
  encode(message: http, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== "") {
      writer.uint32(10).string(message.user);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
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

          message.user = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
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
      user: isSet(object.user) ? String(object.user) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: http): unknown {
    const obj: any = {};
    if (message.user !== "") {
      obj.user = message.user;
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
    message.user = object.user ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseshadowsocks(): shadowsocks {
  return { method: "", password: "" };
}

export const shadowsocks = {
  encode(message: shadowsocks, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.method !== "") {
      writer.uint32(10).string(message.method);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): shadowsocks {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseshadowsocks();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.method = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
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

  fromJSON(object: any): shadowsocks {
    return {
      method: isSet(object.method) ? String(object.method) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: shadowsocks): unknown {
    const obj: any = {};
    if (message.method !== "") {
      obj.method = message.method;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<shadowsocks>, I>>(base?: I): shadowsocks {
    return shadowsocks.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<shadowsocks>, I>>(object: I): shadowsocks {
    const message = createBaseshadowsocks();
    message.method = object.method ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseshadowsocksr(): shadowsocksr {
  return { server: "", port: "", method: "", password: "", obfs: "", obfsparam: "", protocol: "", protoparam: "" };
}

export const shadowsocksr = {
  encode(message: shadowsocksr, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.server !== "") {
      writer.uint32(10).string(message.server);
    }
    if (message.port !== "") {
      writer.uint32(18).string(message.port);
    }
    if (message.method !== "") {
      writer.uint32(26).string(message.method);
    }
    if (message.password !== "") {
      writer.uint32(34).string(message.password);
    }
    if (message.obfs !== "") {
      writer.uint32(42).string(message.obfs);
    }
    if (message.obfsparam !== "") {
      writer.uint32(50).string(message.obfsparam);
    }
    if (message.protocol !== "") {
      writer.uint32(58).string(message.protocol);
    }
    if (message.protoparam !== "") {
      writer.uint32(66).string(message.protoparam);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): shadowsocksr {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseshadowsocksr();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.server = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.port = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.method = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.password = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.obfs = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.obfsparam = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.protocol = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.protoparam = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): shadowsocksr {
    return {
      server: isSet(object.server) ? String(object.server) : "",
      port: isSet(object.port) ? String(object.port) : "",
      method: isSet(object.method) ? String(object.method) : "",
      password: isSet(object.password) ? String(object.password) : "",
      obfs: isSet(object.obfs) ? String(object.obfs) : "",
      obfsparam: isSet(object.obfsparam) ? String(object.obfsparam) : "",
      protocol: isSet(object.protocol) ? String(object.protocol) : "",
      protoparam: isSet(object.protoparam) ? String(object.protoparam) : "",
    };
  },

  toJSON(message: shadowsocksr): unknown {
    const obj: any = {};
    if (message.server !== "") {
      obj.server = message.server;
    }
    if (message.port !== "") {
      obj.port = message.port;
    }
    if (message.method !== "") {
      obj.method = message.method;
    }
    if (message.password !== "") {
      obj.password = message.password;
    }
    if (message.obfs !== "") {
      obj.obfs = message.obfs;
    }
    if (message.obfsparam !== "") {
      obj.obfsparam = message.obfsparam;
    }
    if (message.protocol !== "") {
      obj.protocol = message.protocol;
    }
    if (message.protoparam !== "") {
      obj.protoparam = message.protoparam;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<shadowsocksr>, I>>(base?: I): shadowsocksr {
    return shadowsocksr.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<shadowsocksr>, I>>(object: I): shadowsocksr {
    const message = createBaseshadowsocksr();
    message.server = object.server ?? "";
    message.port = object.port ?? "";
    message.method = object.method ?? "";
    message.password = object.password ?? "";
    message.obfs = object.obfs ?? "";
    message.obfsparam = object.obfsparam ?? "";
    message.protocol = object.protocol ?? "";
    message.protoparam = object.protoparam ?? "";
    return message;
  },
};

function createBasehttp2(): http2 {
  return { host: "" };
}

export const http2 = {
  encode(message: http2, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
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

  fromJSON(object: any): http2 {
    return { host: isSet(object.host) ? String(object.host) : "" };
  },

  toJSON(message: http2): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<http2>, I>>(base?: I): http2 {
    return http2.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<http2>, I>>(object: I): http2 {
    const message = createBasehttp2();
    message.host = object.host ?? "";
    return message;
  },
};

function createBasevmess(): vmess {
  return { uuid: "", alter_id: "", security: "" };
}

export const vmess = {
  encode(message: vmess, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.alter_id !== "") {
      writer.uint32(18).string(message.alter_id);
    }
    if (message.security !== "") {
      writer.uint32(26).string(message.security);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): vmess {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasevmess();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uuid = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.alter_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.security = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): vmess {
    return {
      uuid: isSet(object.id) ? String(object.id) : "",
      alter_id: isSet(object.aid) ? String(object.aid) : "",
      security: isSet(object.security) ? String(object.security) : "",
    };
  },

  toJSON(message: vmess): unknown {
    const obj: any = {};
    if (message.uuid !== "") {
      obj.id = message.uuid;
    }
    if (message.alter_id !== "") {
      obj.aid = message.alter_id;
    }
    if (message.security !== "") {
      obj.security = message.security;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<vmess>, I>>(base?: I): vmess {
    return vmess.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<vmess>, I>>(object: I): vmess {
    const message = createBasevmess();
    message.uuid = object.uuid ?? "";
    message.alter_id = object.alter_id ?? "";
    message.security = object.security ?? "";
    return message;
  },
};

function createBasetrojan(): trojan {
  return { password: "", peer: "" };
}

export const trojan = {
  encode(message: trojan, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.password !== "") {
      writer.uint32(10).string(message.password);
    }
    if (message.peer !== "") {
      writer.uint32(18).string(message.peer);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): trojan {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasetrojan();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.password = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.peer = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): trojan {
    return {
      password: isSet(object.password) ? String(object.password) : "",
      peer: isSet(object.peer) ? String(object.peer) : "",
    };
  },

  toJSON(message: trojan): unknown {
    const obj: any = {};
    if (message.password !== "") {
      obj.password = message.password;
    }
    if (message.peer !== "") {
      obj.peer = message.peer;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<trojan>, I>>(base?: I): trojan {
    return trojan.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<trojan>, I>>(object: I): trojan {
    const message = createBasetrojan();
    message.password = object.password ?? "";
    message.peer = object.peer ?? "";
    return message;
  },
};

function createBaseyuubinsya(): yuubinsya {
  return { password: "", encrypted: false };
}

export const yuubinsya = {
  encode(message: yuubinsya, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.password !== "") {
      writer.uint32(10).string(message.password);
    }
    if (message.encrypted === true) {
      writer.uint32(16).bool(message.encrypted);
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

          message.password = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.encrypted = reader.bool();
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
      password: isSet(object.password) ? String(object.password) : "",
      encrypted: isSet(object.encrypted) ? Boolean(object.encrypted) : false,
    };
  },

  toJSON(message: yuubinsya): unknown {
    const obj: any = {};
    if (message.password !== "") {
      obj.password = message.password;
    }
    if (message.encrypted === true) {
      obj.encrypted = message.encrypted;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<yuubinsya>, I>>(base?: I): yuubinsya {
    return yuubinsya.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<yuubinsya>, I>>(object: I): yuubinsya {
    const message = createBaseyuubinsya();
    message.password = object.password ?? "";
    message.encrypted = object.encrypted ?? false;
    return message;
  },
};

function createBasewebsocket(): websocket {
  return { host: "", path: "", tls_enabled: false };
}

export const websocket = {
  encode(message: websocket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.path !== "") {
      writer.uint32(18).string(message.path);
    }
    if (message.tls_enabled === true) {
      writer.uint32(32).bool(message.tls_enabled);
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

          message.host = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.path = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.tls_enabled = reader.bool();
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
    return {
      host: isSet(object.host) ? String(object.host) : "",
      path: isSet(object.path) ? String(object.path) : "",
      tls_enabled: isSet(object.tls_enabled) ? Boolean(object.tls_enabled) : false,
    };
  },

  toJSON(message: websocket): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.path !== "") {
      obj.path = message.path;
    }
    if (message.tls_enabled === true) {
      obj.tls_enabled = message.tls_enabled;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<websocket>, I>>(base?: I): websocket {
    return websocket.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<websocket>, I>>(object: I): websocket {
    const message = createBasewebsocket();
    message.host = object.host ?? "";
    message.path = object.path ?? "";
    message.tls_enabled = object.tls_enabled ?? false;
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

function createBasereality(): reality {
  return { server_name: "", public_key: "", short_id: "", debug: false };
}

export const reality = {
  encode(message: reality, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.server_name !== "") {
      writer.uint32(10).string(message.server_name);
    }
    if (message.public_key !== "") {
      writer.uint32(18).string(message.public_key);
    }
    if (message.short_id !== "") {
      writer.uint32(26).string(message.short_id);
    }
    if (message.debug === true) {
      writer.uint32(32).bool(message.debug);
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

          message.server_name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.public_key = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.short_id = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
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
      server_name: isSet(object.server_name) ? String(object.server_name) : "",
      public_key: isSet(object.public_key) ? String(object.public_key) : "",
      short_id: isSet(object.short_id) ? String(object.short_id) : "",
      debug: isSet(object.debug) ? Boolean(object.debug) : false,
    };
  },

  toJSON(message: reality): unknown {
    const obj: any = {};
    if (message.server_name !== "") {
      obj.server_name = message.server_name;
    }
    if (message.public_key !== "") {
      obj.public_key = message.public_key;
    }
    if (message.short_id !== "") {
      obj.short_id = message.short_id;
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
    message.server_name = object.server_name ?? "";
    message.public_key = object.public_key ?? "";
    message.short_id = object.short_id ?? "";
    message.debug = object.debug ?? false;
    return message;
  },
};

function createBaseobfs_http(): obfs_http {
  return { host: "", port: "" };
}

export const obfs_http = {
  encode(message: obfs_http, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== "") {
      writer.uint32(18).string(message.port);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): obfs_http {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseobfs_http();
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

          message.port = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): obfs_http {
    return { host: isSet(object.host) ? String(object.host) : "", port: isSet(object.port) ? String(object.port) : "" };
  },

  toJSON(message: obfs_http): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.port !== "") {
      obj.port = message.port;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<obfs_http>, I>>(base?: I): obfs_http {
    return obfs_http.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<obfs_http>, I>>(object: I): obfs_http {
    const message = createBaseobfs_http();
    message.host = object.host ?? "";
    message.port = object.port ?? "";
    return message;
  },
};

function createBasenone(): none {
  return {};
}

export const none = {
  encode(_: none, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): none {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenone();
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

  fromJSON(_: any): none {
    return {};
  },

  toJSON(_: none): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<none>, I>>(base?: I): none {
    return none.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<none>, I>>(_: I): none {
    const message = createBasenone();
    return message;
  },
};

function createBasesimple(): simple {
  return { host: "", port: 0, timeout: 0, alternate_host: [], packet_conn_direct: false, tls: undefined };
}

export const simple = {
  encode(message: simple, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    if (message.timeout !== 0) {
      writer.uint32(48).uint64(message.timeout);
    }
    for (const v of message.alternate_host) {
      host.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.packet_conn_direct === true) {
      writer.uint32(24).bool(message.packet_conn_direct);
    }
    if (message.tls !== undefined) {
      tls_config.encode(message.tls, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): simple {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasesimple();
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
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.timeout = longToNumber(reader.uint64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.alternate_host.push(host.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.packet_conn_direct = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
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

  fromJSON(object: any): simple {
    return {
      host: isSet(object.host) ? String(object.host) : "",
      port: isSet(object.port) ? Number(object.port) : 0,
      timeout: isSet(object.timeout) ? Number(object.timeout) : 0,
      alternate_host: Array.isArray(object?.alternate_host)
        ? object.alternate_host.map((e: any) => host.fromJSON(e))
        : [],
      packet_conn_direct: isSet(object.packet_conn_direct) ? Boolean(object.packet_conn_direct) : false,
      tls: isSet(object.tls) ? tls_config.fromJSON(object.tls) : undefined,
    };
  },

  toJSON(message: simple): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.port !== 0) {
      obj.port = Math.round(message.port);
    }
    if (message.timeout !== 0) {
      obj.timeout = Math.round(message.timeout);
    }
    if (message.alternate_host?.length) {
      obj.alternate_host = message.alternate_host.map((e) => host.toJSON(e));
    }
    if (message.packet_conn_direct === true) {
      obj.packet_conn_direct = message.packet_conn_direct;
    }
    if (message.tls !== undefined) {
      obj.tls = tls_config.toJSON(message.tls);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<simple>, I>>(base?: I): simple {
    return simple.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<simple>, I>>(object: I): simple {
    const message = createBasesimple();
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
    message.timeout = object.timeout ?? 0;
    message.alternate_host = object.alternate_host?.map((e) => host.fromPartial(e)) || [];
    message.packet_conn_direct = object.packet_conn_direct ?? false;
    message.tls = (object.tls !== undefined && object.tls !== null) ? tls_config.fromPartial(object.tls) : undefined;
    return message;
  },
};

function createBasetls_config(): tls_config {
  return { enable: false, server_names: [], ca_cert: [], insecure_skip_verify: false, next_protos: [] };
}

export const tls_config = {
  encode(message: tls_config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enable === true) {
      writer.uint32(8).bool(message.enable);
    }
    for (const v of message.server_names) {
      writer.uint32(50).string(v!);
    }
    for (const v of message.ca_cert) {
      writer.uint32(26).bytes(v!);
    }
    if (message.insecure_skip_verify === true) {
      writer.uint32(32).bool(message.insecure_skip_verify);
    }
    for (const v of message.next_protos) {
      writer.uint32(42).string(v!);
    }
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
          if (tag !== 8) {
            break;
          }

          message.enable = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.server_names.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.ca_cert.push(reader.bytes());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.insecure_skip_verify = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.next_protos.push(reader.string());
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
      enable: isSet(object.enable) ? Boolean(object.enable) : false,
      server_names: Array.isArray(object?.servernames) ? object.servernames.map((e: any) => String(e)) : [],
      ca_cert: Array.isArray(object?.ca_cert) ? object.ca_cert.map((e: any) => bytesFromBase64(e)) : [],
      insecure_skip_verify: isSet(object.insecure_skip_verify) ? Boolean(object.insecure_skip_verify) : false,
      next_protos: Array.isArray(object?.next_protos) ? object.next_protos.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: tls_config): unknown {
    const obj: any = {};
    if (message.enable === true) {
      obj.enable = message.enable;
    }
    if (message.server_names?.length) {
      obj.servernames = message.server_names;
    }
    if (message.ca_cert?.length) {
      obj.ca_cert = message.ca_cert.map((e) => base64FromBytes(e));
    }
    if (message.insecure_skip_verify === true) {
      obj.insecure_skip_verify = message.insecure_skip_verify;
    }
    if (message.next_protos?.length) {
      obj.next_protos = message.next_protos;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<tls_config>, I>>(base?: I): tls_config {
    return tls_config.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<tls_config>, I>>(object: I): tls_config {
    const message = createBasetls_config();
    message.enable = object.enable ?? false;
    message.server_names = object.server_names?.map((e) => e) || [];
    message.ca_cert = object.ca_cert?.map((e) => e) || [];
    message.insecure_skip_verify = object.insecure_skip_verify ?? false;
    message.next_protos = object.next_protos?.map((e) => e) || [];
    return message;
  },
};

function createBasedirect(): direct {
  return {};
}

export const direct = {
  encode(_: direct, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): direct {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasedirect();
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

  fromJSON(_: any): direct {
    return {};
  },

  toJSON(_: direct): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<direct>, I>>(base?: I): direct {
    return direct.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<direct>, I>>(_: I): direct {
    const message = createBasedirect();
    return message;
  },
};

function createBasereject(): reject {
  return {};
}

export const reject = {
  encode(_: reject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): reject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasereject();
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

  fromJSON(_: any): reject {
    return {};
  },

  toJSON(_: reject): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<reject>, I>>(base?: I): reject {
    return reject.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<reject>, I>>(_: I): reject {
    const message = createBasereject();
    return message;
  },
};

function createBasehost(): host {
  return { host: "", port: 0 };
}

export const host = {
  encode(message: host, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.port !== 0) {
      writer.uint32(16).int32(message.port);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): host {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasehost();
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
          if (tag !== 16) {
            break;
          }

          message.port = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): host {
    return { host: isSet(object.host) ? String(object.host) : "", port: isSet(object.port) ? Number(object.port) : 0 };
  },

  toJSON(message: host): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.port !== 0) {
      obj.port = Math.round(message.port);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<host>, I>>(base?: I): host {
    return host.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<host>, I>>(object: I): host {
    const message = createBasehost();
    message.host = object.host ?? "";
    message.port = object.port ?? 0;
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
