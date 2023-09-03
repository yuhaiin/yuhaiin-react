/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { point } from "../point/point";
import { link } from "../subscribe/subscribe";
import { tag_type, tag_typeFromJSON, tag_typeToJSON } from "../tag/tag";

export const protobufPackage = "yuhaiin.protos.node.service";

export interface now_resp {
  tcp: point | undefined;
  udp: point | undefined;
}

export interface use_req {
  tcp: boolean;
  udp: boolean;
  hash: string;
}

export interface save_link_req {
  links: link[];
}

export interface link_req {
  names: string[];
}

export interface get_links_resp {
  links: { [key: string]: link };
}

export interface get_links_resp_LinksEntry {
  key: string;
  value: link | undefined;
}

export interface save_tag_req {
  tag: string;
  type: tag_type;
  hash: string;
}

function createBasenow_resp(): now_resp {
  return { tcp: undefined, udp: undefined };
}

export const now_resp = {
  encode(message: now_resp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tcp !== undefined) {
      point.encode(message.tcp, writer.uint32(10).fork()).ldelim();
    }
    if (message.udp !== undefined) {
      point.encode(message.udp, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): now_resp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenow_resp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tcp = point.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.udp = point.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): now_resp {
    return {
      tcp: isSet(object.tcp) ? point.fromJSON(object.tcp) : undefined,
      udp: isSet(object.udp) ? point.fromJSON(object.udp) : undefined,
    };
  },

  toJSON(message: now_resp): unknown {
    const obj: any = {};
    if (message.tcp !== undefined) {
      obj.tcp = point.toJSON(message.tcp);
    }
    if (message.udp !== undefined) {
      obj.udp = point.toJSON(message.udp);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<now_resp>, I>>(base?: I): now_resp {
    return now_resp.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<now_resp>, I>>(object: I): now_resp {
    const message = createBasenow_resp();
    message.tcp = (object.tcp !== undefined && object.tcp !== null) ? point.fromPartial(object.tcp) : undefined;
    message.udp = (object.udp !== undefined && object.udp !== null) ? point.fromPartial(object.udp) : undefined;
    return message;
  },
};

function createBaseuse_req(): use_req {
  return { tcp: false, udp: false, hash: "" };
}

export const use_req = {
  encode(message: use_req, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tcp === true) {
      writer.uint32(8).bool(message.tcp);
    }
    if (message.udp === true) {
      writer.uint32(16).bool(message.udp);
    }
    if (message.hash !== "") {
      writer.uint32(26).string(message.hash);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): use_req {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseuse_req();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.tcp = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.udp = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.hash = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): use_req {
    return {
      tcp: isSet(object.tcp) ? Boolean(object.tcp) : false,
      udp: isSet(object.udp) ? Boolean(object.udp) : false,
      hash: isSet(object.hash) ? String(object.hash) : "",
    };
  },

  toJSON(message: use_req): unknown {
    const obj: any = {};
    if (message.tcp === true) {
      obj.tcp = message.tcp;
    }
    if (message.udp === true) {
      obj.udp = message.udp;
    }
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<use_req>, I>>(base?: I): use_req {
    return use_req.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<use_req>, I>>(object: I): use_req {
    const message = createBaseuse_req();
    message.tcp = object.tcp ?? false;
    message.udp = object.udp ?? false;
    message.hash = object.hash ?? "";
    return message;
  },
};

function createBasesave_link_req(): save_link_req {
  return { links: [] };
}

export const save_link_req = {
  encode(message: save_link_req, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.links) {
      link.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): save_link_req {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasesave_link_req();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.links.push(link.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): save_link_req {
    return { links: Array.isArray(object?.links) ? object.links.map((e: any) => link.fromJSON(e)) : [] };
  },

  toJSON(message: save_link_req): unknown {
    const obj: any = {};
    if (message.links?.length) {
      obj.links = message.links.map((e) => link.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<save_link_req>, I>>(base?: I): save_link_req {
    return save_link_req.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<save_link_req>, I>>(object: I): save_link_req {
    const message = createBasesave_link_req();
    message.links = object.links?.map((e) => link.fromPartial(e)) || [];
    return message;
  },
};

function createBaselink_req(): link_req {
  return { names: [] };
}

export const link_req = {
  encode(message: link_req, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.names) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): link_req {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaselink_req();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.names.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): link_req {
    return { names: Array.isArray(object?.names) ? object.names.map((e: any) => String(e)) : [] };
  },

  toJSON(message: link_req): unknown {
    const obj: any = {};
    if (message.names?.length) {
      obj.names = message.names;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<link_req>, I>>(base?: I): link_req {
    return link_req.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<link_req>, I>>(object: I): link_req {
    const message = createBaselink_req();
    message.names = object.names?.map((e) => e) || [];
    return message;
  },
};

function createBaseget_links_resp(): get_links_resp {
  return { links: {} };
}

export const get_links_resp = {
  encode(message: get_links_resp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.links).forEach(([key, value]) => {
      get_links_resp_LinksEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): get_links_resp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseget_links_resp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = get_links_resp_LinksEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.links[entry1.key] = entry1.value;
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

  fromJSON(object: any): get_links_resp {
    return {
      links: isObject(object.links)
        ? Object.entries(object.links).reduce<{ [key: string]: link }>((acc, [key, value]) => {
          acc[key] = link.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: get_links_resp): unknown {
    const obj: any = {};
    if (message.links) {
      const entries = Object.entries(message.links);
      if (entries.length > 0) {
        obj.links = {};
        entries.forEach(([k, v]) => {
          obj.links[k] = link.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<get_links_resp>, I>>(base?: I): get_links_resp {
    return get_links_resp.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<get_links_resp>, I>>(object: I): get_links_resp {
    const message = createBaseget_links_resp();
    message.links = Object.entries(object.links ?? {}).reduce<{ [key: string]: link }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = link.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseget_links_resp_LinksEntry(): get_links_resp_LinksEntry {
  return { key: "", value: undefined };
}

export const get_links_resp_LinksEntry = {
  encode(message: get_links_resp_LinksEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      link.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): get_links_resp_LinksEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseget_links_resp_LinksEntry();
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

          message.value = link.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): get_links_resp_LinksEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? link.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: get_links_resp_LinksEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = link.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<get_links_resp_LinksEntry>, I>>(base?: I): get_links_resp_LinksEntry {
    return get_links_resp_LinksEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<get_links_resp_LinksEntry>, I>>(object: I): get_links_resp_LinksEntry {
    const message = createBaseget_links_resp_LinksEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? link.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBasesave_tag_req(): save_tag_req {
  return { tag: "", type: 0, hash: "" };
}

export const save_tag_req = {
  encode(message: save_tag_req, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tag !== "") {
      writer.uint32(10).string(message.tag);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    if (message.hash !== "") {
      writer.uint32(18).string(message.hash);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): save_tag_req {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasesave_tag_req();
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

          message.hash = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): save_tag_req {
    return {
      tag: isSet(object.tag) ? String(object.tag) : "",
      type: isSet(object.type) ? tag_typeFromJSON(object.type) : 0,
      hash: isSet(object.hash) ? String(object.hash) : "",
    };
  },

  toJSON(message: save_tag_req): unknown {
    const obj: any = {};
    if (message.tag !== "") {
      obj.tag = message.tag;
    }
    if (message.type !== 0) {
      obj.type = tag_typeToJSON(message.type);
    }
    if (message.hash !== "") {
      obj.hash = message.hash;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<save_tag_req>, I>>(base?: I): save_tag_req {
    return save_tag_req.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<save_tag_req>, I>>(object: I): save_tag_req {
    const message = createBasesave_tag_req();
    message.tag = object.tag ?? "";
    message.type = object.type ?? 0;
    message.hash = object.hash ?? "";
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
