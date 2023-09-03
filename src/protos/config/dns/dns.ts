/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.dns";

export enum type {
  reserve = 0,
  udp = 1,
  tcp = 2,
  doh = 3,
  dot = 4,
  doq = 5,
  doh3 = 6,
  UNRECOGNIZED = -1,
}

export function typeFromJSON(object: any): type {
  switch (object) {
    case 0:
    case "reserve":
      return type.reserve;
    case 1:
    case "udp":
      return type.udp;
    case 2:
    case "tcp":
      return type.tcp;
    case 3:
    case "doh":
      return type.doh;
    case 4:
    case "dot":
      return type.dot;
    case 5:
    case "doq":
      return type.doq;
    case 6:
    case "doh3":
      return type.doh3;
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
    case type.udp:
      return "udp";
    case type.tcp:
      return "tcp";
    case type.doh:
      return "doh";
    case type.dot:
      return "dot";
    case type.doq:
      return "doq";
    case type.doh3:
      return "doh3";
    case type.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface dns {
  host: string;
  type: type;
  subnet: string;
  tls_servername: string;
}

export interface dns_config {
  server: string;
  fakedns: boolean;
  fakedns_ip_range: string;
  resolve_remote_domain: boolean;
  remote: dns | undefined;
  local: dns | undefined;
  bootstrap: dns | undefined;
  hosts: { [key: string]: string };
}

export interface dns_config_HostsEntry {
  key: string;
  value: string;
}

function createBasedns(): dns {
  return { host: "", type: 0, subnet: "", tls_servername: "" };
}

export const dns = {
  encode(message: dns, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.type !== 0) {
      writer.uint32(40).int32(message.type);
    }
    if (message.subnet !== "") {
      writer.uint32(34).string(message.subnet);
    }
    if (message.tls_servername !== "") {
      writer.uint32(18).string(message.tls_servername);
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
        case 5:
          if (tag !== 40) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.subnet = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.tls_servername = reader.string();
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
      type: isSet(object.type) ? typeFromJSON(object.type) : 0,
      subnet: isSet(object.subnet) ? String(object.subnet) : "",
      tls_servername: isSet(object.tls_servername) ? String(object.tls_servername) : "",
    };
  },

  toJSON(message: dns): unknown {
    const obj: any = {};
    if (message.host !== "") {
      obj.host = message.host;
    }
    if (message.type !== 0) {
      obj.type = typeToJSON(message.type);
    }
    if (message.subnet !== "") {
      obj.subnet = message.subnet;
    }
    if (message.tls_servername !== "") {
      obj.tls_servername = message.tls_servername;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<dns>, I>>(base?: I): dns {
    return dns.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<dns>, I>>(object: I): dns {
    const message = createBasedns();
    message.host = object.host ?? "";
    message.type = object.type ?? 0;
    message.subnet = object.subnet ?? "";
    message.tls_servername = object.tls_servername ?? "";
    return message;
  },
};

function createBasedns_config(): dns_config {
  return {
    server: "",
    fakedns: false,
    fakedns_ip_range: "",
    resolve_remote_domain: false,
    remote: undefined,
    local: undefined,
    bootstrap: undefined,
    hosts: {},
  };
}

export const dns_config = {
  encode(message: dns_config, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.server !== "") {
      writer.uint32(34).string(message.server);
    }
    if (message.fakedns === true) {
      writer.uint32(40).bool(message.fakedns);
    }
    if (message.fakedns_ip_range !== "") {
      writer.uint32(50).string(message.fakedns_ip_range);
    }
    if (message.resolve_remote_domain === true) {
      writer.uint32(56).bool(message.resolve_remote_domain);
    }
    if (message.remote !== undefined) {
      dns.encode(message.remote, writer.uint32(10).fork()).ldelim();
    }
    if (message.local !== undefined) {
      dns.encode(message.local, writer.uint32(18).fork()).ldelim();
    }
    if (message.bootstrap !== undefined) {
      dns.encode(message.bootstrap, writer.uint32(26).fork()).ldelim();
    }
    Object.entries(message.hosts).forEach(([key, value]) => {
      dns_config_HostsEntry.encode({ key: key as any, value }, writer.uint32(66).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): dns_config {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasedns_config();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.server = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.fakedns = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.fakedns_ip_range = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.resolve_remote_domain = reader.bool();
          continue;
        case 1:
          if (tag !== 10) {
            break;
          }

          message.remote = dns.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.local = dns.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.bootstrap = dns.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          const entry8 = dns_config_HostsEntry.decode(reader, reader.uint32());
          if (entry8.value !== undefined) {
            message.hosts[entry8.key] = entry8.value;
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

  fromJSON(object: any): dns_config {
    return {
      server: isSet(object.server) ? String(object.server) : "",
      fakedns: isSet(object.fakedns) ? Boolean(object.fakedns) : false,
      fakedns_ip_range: isSet(object.fakedns_ip_range) ? String(object.fakedns_ip_range) : "",
      resolve_remote_domain: isSet(object.resolve_remote_domain) ? Boolean(object.resolve_remote_domain) : false,
      remote: isSet(object.remote) ? dns.fromJSON(object.remote) : undefined,
      local: isSet(object.local) ? dns.fromJSON(object.local) : undefined,
      bootstrap: isSet(object.bootstrap) ? dns.fromJSON(object.bootstrap) : undefined,
      hosts: isObject(object.hosts)
        ? Object.entries(object.hosts).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: dns_config): unknown {
    const obj: any = {};
    if (message.server !== "") {
      obj.server = message.server;
    }
    if (message.fakedns === true) {
      obj.fakedns = message.fakedns;
    }
    if (message.fakedns_ip_range !== "") {
      obj.fakedns_ip_range = message.fakedns_ip_range;
    }
    if (message.resolve_remote_domain === true) {
      obj.resolve_remote_domain = message.resolve_remote_domain;
    }
    if (message.remote !== undefined) {
      obj.remote = dns.toJSON(message.remote);
    }
    if (message.local !== undefined) {
      obj.local = dns.toJSON(message.local);
    }
    if (message.bootstrap !== undefined) {
      obj.bootstrap = dns.toJSON(message.bootstrap);
    }
    if (message.hosts) {
      const entries = Object.entries(message.hosts);
      if (entries.length > 0) {
        obj.hosts = {};
        entries.forEach(([k, v]) => {
          obj.hosts[k] = v;
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<dns_config>, I>>(base?: I): dns_config {
    return dns_config.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<dns_config>, I>>(object: I): dns_config {
    const message = createBasedns_config();
    message.server = object.server ?? "";
    message.fakedns = object.fakedns ?? false;
    message.fakedns_ip_range = object.fakedns_ip_range ?? "";
    message.resolve_remote_domain = object.resolve_remote_domain ?? false;
    message.remote = (object.remote !== undefined && object.remote !== null)
      ? dns.fromPartial(object.remote)
      : undefined;
    message.local = (object.local !== undefined && object.local !== null) ? dns.fromPartial(object.local) : undefined;
    message.bootstrap = (object.bootstrap !== undefined && object.bootstrap !== null)
      ? dns.fromPartial(object.bootstrap)
      : undefined;
    message.hosts = Object.entries(object.hosts ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBasedns_config_HostsEntry(): dns_config_HostsEntry {
  return { key: "", value: "" };
}

export const dns_config_HostsEntry = {
  encode(message: dns_config_HostsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): dns_config_HostsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasedns_config_HostsEntry();
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

  fromJSON(object: any): dns_config_HostsEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: dns_config_HostsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<dns_config_HostsEntry>, I>>(base?: I): dns_config_HostsEntry {
    return dns_config_HostsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<dns_config_HostsEntry>, I>>(object: I): dns_config_HostsEntry {
    const message = createBasedns_config_HostsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
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
