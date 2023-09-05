/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { point } from "./point/point";
import { link } from "./subscribe/subscribe";
import { tags } from "./tag/tag";

export const protobufPackage = "yuhaiin.node";

export interface node {
  tcp: point | undefined;
  udp: point | undefined;
  links: { [key: string]: link };
  manager: manager | undefined;
}

export interface node_LinksEntry {
  key: string;
  value: link | undefined;
}

export interface nodes {
  nodesV2: { [key: string]: string };
}

export interface nodes_NodesV2Entry {
  key: string;
  value: string;
}

export interface manager {
  groupsV2: { [key: string]: nodes };
  nodes: { [key: string]: point };
  tags: { [key: string]: tags };
}

export interface manager_GroupsV2Entry {
  key: string;
  value: nodes | undefined;
}

export interface manager_NodesEntry {
  key: string;
  value: point | undefined;
}

export interface manager_TagsEntry {
  key: string;
  value: tags | undefined;
}

function createBasenode(): node {
  return { tcp: undefined, udp: undefined, links: {}, manager: undefined };
}

export const node = {
  encode(message: node, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tcp !== undefined) {
      point.encode(message.tcp, writer.uint32(34).fork()).ldelim();
    }
    if (message.udp !== undefined) {
      point.encode(message.udp, writer.uint32(42).fork()).ldelim();
    }
    Object.entries(message.links).forEach(([key, value]) => {
      node_LinksEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    if (message.manager !== undefined) {
      manager.encode(message.manager, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): node {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          message.tcp = point.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.udp = point.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = node_LinksEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.links[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.manager = manager.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): node {
    return {
      tcp: isSet(object.tcp) ? point.fromJSON(object.tcp) : undefined,
      udp: isSet(object.udp) ? point.fromJSON(object.udp) : undefined,
      links: isObject(object.links)
        ? Object.entries(object.links).reduce<{ [key: string]: link }>((acc, [key, value]) => {
          acc[key] = link.fromJSON(value);
          return acc;
        }, {})
        : {},
      manager: isSet(object.manager) ? manager.fromJSON(object.manager) : undefined,
    };
  },

  toJSON(message: node): unknown {
    const obj: any = {};
    if (message.tcp !== undefined) {
      obj.tcp = point.toJSON(message.tcp);
    }
    if (message.udp !== undefined) {
      obj.udp = point.toJSON(message.udp);
    }
    if (message.links) {
      const entries = Object.entries(message.links);
      if (entries.length > 0) {
        obj.links = {};
        entries.forEach(([k, v]) => {
          obj.links[k] = link.toJSON(v);
        });
      }
    }
    if (message.manager !== undefined) {
      obj.manager = manager.toJSON(message.manager);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<node>, I>>(base?: I): node {
    return node.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<node>, I>>(object: I): node {
    const message = createBasenode();
    message.tcp = (object.tcp !== undefined && object.tcp !== null) ? point.fromPartial(object.tcp) : undefined;
    message.udp = (object.udp !== undefined && object.udp !== null) ? point.fromPartial(object.udp) : undefined;
    message.links = Object.entries(object.links ?? {}).reduce<{ [key: string]: link }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = link.fromPartial(value);
      }
      return acc;
    }, {});
    message.manager = (object.manager !== undefined && object.manager !== null)
      ? manager.fromPartial(object.manager)
      : undefined;
    return message;
  },
};

function createBasenode_LinksEntry(): node_LinksEntry {
  return { key: "", value: undefined };
}

export const node_LinksEntry = {
  encode(message: node_LinksEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      link.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): node_LinksEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenode_LinksEntry();
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

  fromJSON(object: any): node_LinksEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? link.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: node_LinksEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = link.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<node_LinksEntry>, I>>(base?: I): node_LinksEntry {
    return node_LinksEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<node_LinksEntry>, I>>(object: I): node_LinksEntry {
    const message = createBasenode_LinksEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? link.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBasenodes(): nodes {
  return { nodesV2: {} };
}

export const nodes = {
  encode(message: nodes, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.nodesV2).forEach(([key, value]) => {
      nodes_NodesV2Entry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): nodes {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenodes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }

          const entry3 = nodes_NodesV2Entry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.nodesV2[entry3.key] = entry3.value;
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

  fromJSON(object: any): nodes {
    return {
      nodesV2: isObject(object.node_hash_map)
        ? Object.entries(object.node_hash_map).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: nodes): unknown {
    const obj: any = {};
    if (message.nodesV2) {
      const entries = Object.entries(message.nodesV2);
      if (entries.length > 0) {
        obj.node_hash_map = {};
        entries.forEach(([k, v]) => {
          obj.node_hash_map[k] = v;
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<nodes>, I>>(base?: I): nodes {
    return nodes.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<nodes>, I>>(object: I): nodes {
    const message = createBasenodes();
    message.nodesV2 = Object.entries(object.nodesV2 ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBasenodes_NodesV2Entry(): nodes_NodesV2Entry {
  return { key: "", value: "" };
}

export const nodes_NodesV2Entry = {
  encode(message: nodes_NodesV2Entry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): nodes_NodesV2Entry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasenodes_NodesV2Entry();
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

  fromJSON(object: any): nodes_NodesV2Entry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: nodes_NodesV2Entry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<nodes_NodesV2Entry>, I>>(base?: I): nodes_NodesV2Entry {
    return nodes_NodesV2Entry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<nodes_NodesV2Entry>, I>>(object: I): nodes_NodesV2Entry {
    const message = createBasenodes_NodesV2Entry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBasemanager(): manager {
  return { groupsV2: {}, nodes: {}, tags: {} };
}

export const manager = {
  encode(message: manager, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.groupsV2).forEach(([key, value]) => {
      manager_GroupsV2Entry.encode({ key: key as any, value }, writer.uint32(18).fork()).ldelim();
    });
    Object.entries(message.nodes).forEach(([key, value]) => {
      manager_NodesEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    Object.entries(message.tags).forEach(([key, value]) => {
      manager_TagsEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): manager {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasemanager();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          const entry2 = manager_GroupsV2Entry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.groupsV2[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          const entry3 = manager_NodesEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.nodes[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = manager_TagsEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.tags[entry4.key] = entry4.value;
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

  fromJSON(object: any): manager {
    return {
      groupsV2: isObject(object.group_nodes_map)
        ? Object.entries(object.group_nodes_map).reduce<{ [key: string]: nodes }>((acc, [key, value]) => {
          acc[key] = nodes.fromJSON(value);
          return acc;
        }, {})
        : {},
      nodes: isObject(object.nodes)
        ? Object.entries(object.nodes).reduce<{ [key: string]: point }>((acc, [key, value]) => {
          acc[key] = point.fromJSON(value);
          return acc;
        }, {})
        : {},
      tags: isObject(object.tags)
        ? Object.entries(object.tags).reduce<{ [key: string]: tags }>((acc, [key, value]) => {
          acc[key] = tags.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: manager): unknown {
    const obj: any = {};
    if (message.groupsV2) {
      const entries = Object.entries(message.groupsV2);
      if (entries.length > 0) {
        obj.group_nodes_map = {};
        entries.forEach(([k, v]) => {
          obj.group_nodes_map[k] = nodes.toJSON(v);
        });
      }
    }
    if (message.nodes) {
      const entries = Object.entries(message.nodes);
      if (entries.length > 0) {
        obj.nodes = {};
        entries.forEach(([k, v]) => {
          obj.nodes[k] = point.toJSON(v);
        });
      }
    }
    if (message.tags) {
      const entries = Object.entries(message.tags);
      if (entries.length > 0) {
        obj.tags = {};
        entries.forEach(([k, v]) => {
          obj.tags[k] = tags.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<manager>, I>>(base?: I): manager {
    return manager.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<manager>, I>>(object: I): manager {
    const message = createBasemanager();
    message.groupsV2 = Object.entries(object.groupsV2 ?? {}).reduce<{ [key: string]: nodes }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = nodes.fromPartial(value);
      }
      return acc;
    }, {});
    message.nodes = Object.entries(object.nodes ?? {}).reduce<{ [key: string]: point }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = point.fromPartial(value);
      }
      return acc;
    }, {});
    message.tags = Object.entries(object.tags ?? {}).reduce<{ [key: string]: tags }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = tags.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBasemanager_GroupsV2Entry(): manager_GroupsV2Entry {
  return { key: "", value: undefined };
}

export const manager_GroupsV2Entry = {
  encode(message: manager_GroupsV2Entry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      nodes.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): manager_GroupsV2Entry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasemanager_GroupsV2Entry();
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

          message.value = nodes.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): manager_GroupsV2Entry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? nodes.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: manager_GroupsV2Entry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = nodes.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<manager_GroupsV2Entry>, I>>(base?: I): manager_GroupsV2Entry {
    return manager_GroupsV2Entry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<manager_GroupsV2Entry>, I>>(object: I): manager_GroupsV2Entry {
    const message = createBasemanager_GroupsV2Entry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? nodes.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBasemanager_NodesEntry(): manager_NodesEntry {
  return { key: "", value: undefined };
}

export const manager_NodesEntry = {
  encode(message: manager_NodesEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      point.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): manager_NodesEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasemanager_NodesEntry();
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

          message.value = point.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): manager_NodesEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? point.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: manager_NodesEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = point.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<manager_NodesEntry>, I>>(base?: I): manager_NodesEntry {
    return manager_NodesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<manager_NodesEntry>, I>>(object: I): manager_NodesEntry {
    const message = createBasemanager_NodesEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? point.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBasemanager_TagsEntry(): manager_TagsEntry {
  return { key: "", value: undefined };
}

export const manager_TagsEntry = {
  encode(message: manager_TagsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      tags.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): manager_TagsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasemanager_TagsEntry();
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

          message.value = tags.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): manager_TagsEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? tags.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: manager_TagsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = tags.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<manager_TagsEntry>, I>>(base?: I): manager_TagsEntry {
    return manager_TagsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<manager_TagsEntry>, I>>(object: I): manager_TagsEntry {
    const message = createBasemanager_TagsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? tags.fromPartial(object.value) : undefined;
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
