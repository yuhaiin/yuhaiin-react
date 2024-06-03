// @generated by protoc-gen-es v1.10.0 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file node/node.proto (package yuhaiin.node, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { point } from "./point/point_pb.js";
import { link } from "./subscribe/subscribe_pb.js";
import { tags } from "./tag/tag_pb.js";

/**
 * @generated from message yuhaiin.node.node
 */
export class node extends Message<node> {
  /**
   * @generated from field: yuhaiin.point.point tcp = 4;
   */
  tcp?: point;

  /**
   * @generated from field: yuhaiin.point.point udp = 5;
   */
  udp?: point;

  /**
   * @generated from field: map<string, yuhaiin.subscribe.link> links = 2;
   */
  links: { [key: string]: link } = {};

  /**
   * @generated from field: yuhaiin.node.manager manager = 3;
   */
  manager?: manager;

  constructor(data?: PartialMessage<node>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.node.node";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 4, name: "tcp", kind: "message", T: point },
    { no: 5, name: "udp", kind: "message", T: point },
    { no: 2, name: "links", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "message", T: link} },
    { no: 3, name: "manager", kind: "message", T: manager },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): node {
    return new node().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): node {
    return new node().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): node {
    return new node().fromJsonString(jsonString, options);
  }

  static equals(a: node | PlainMessage<node> | undefined, b: node | PlainMessage<node> | undefined): boolean {
    return proto3.util.equals(node, a, b);
  }
}

/**
 * @generated from message yuhaiin.node.nodes
 */
export class nodes extends Message<nodes> {
  /**
   * @generated from field: map<string, string> nodesV2 = 3 [json_name = "node_hash_map"];
   */
  nodesV2: { [key: string]: string } = {};

  constructor(data?: PartialMessage<nodes>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.node.nodes";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 3, name: "nodesV2", jsonName: "node_hash_map", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "scalar", T: 9 /* ScalarType.STRING */} },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): nodes {
    return new nodes().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): nodes {
    return new nodes().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): nodes {
    return new nodes().fromJsonString(jsonString, options);
  }

  static equals(a: nodes | PlainMessage<nodes> | undefined, b: nodes | PlainMessage<nodes> | undefined): boolean {
    return proto3.util.equals(nodes, a, b);
  }
}

/**
 * @generated from message yuhaiin.node.manager
 */
export class manager extends Message<manager> {
  /**
   * @generated from field: map<string, yuhaiin.node.nodes> groupsV2 = 2 [json_name = "group_nodes_map"];
   */
  groupsV2: { [key: string]: nodes } = {};

  /**
   * @generated from field: map<string, yuhaiin.point.point> nodes = 3;
   */
  nodes: { [key: string]: point } = {};

  /**
   * @generated from field: map<string, yuhaiin.tag.tags> tags = 4;
   */
  tags: { [key: string]: tags } = {};

  constructor(data?: PartialMessage<manager>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.node.manager";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 2, name: "groupsV2", jsonName: "group_nodes_map", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "message", T: nodes} },
    { no: 3, name: "nodes", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "message", T: point} },
    { no: 4, name: "tags", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "message", T: tags} },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): manager {
    return new manager().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): manager {
    return new manager().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): manager {
    return new manager().fromJsonString(jsonString, options);
  }

  static equals(a: manager | PlainMessage<manager> | undefined, b: manager | PlainMessage<manager> | undefined): boolean {
    return proto3.util.equals(manager, a, b);
  }
}

